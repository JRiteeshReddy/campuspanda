
import React, { useState, useEffect } from 'react';
import { Link as LinkIcon, Plus, Trash2, FolderIcon, Edit, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase, handleError, fetchUniqueCategories } from '@/lib/supabase';
import { EventLink } from '@/types';
import { useAuth } from '@/context/AuthContext';

const ImportantLinksSection = () => {
  const [links, setLinks] = useState<EventLink[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentLink, setCurrentLink] = useState<Partial<EventLink>>({
    title: '',
    url: '',
    category: '',
  });
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchLinks();
      loadCategories();
    }
  }, [user]);

  const fetchLinks = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('event_links')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;

      setLinks(data as EventLink[]);
    } catch (error) {
      handleError(error);
    }
  };

  const loadCategories = async () => {
    if (!user) return;
    const fetchedCategories = await fetchUniqueCategories(user.id);
    setCategories(fetchedCategories);
  };

  const addLink = async () => {
    if (!user) return;
    if (!currentLink.title || !currentLink.url) {
      toast.error('Title and URL are required');
      return;
    }
    
    // Ensure URL has http:// or https:// prefix
    let url = currentLink.url;
    if (!/^https?:\/\//i.test(url!)) {
      url = 'https://' + url;
    }
    
    try {
      if (isEditMode && currentLink.id) {
        const { error } = await supabase
          .from('event_links')
          .update({
            title: currentLink.title,
            url,
            category: currentLink.category
          })
          .eq('id', currentLink.id);
          
        if (error) throw error;
        
        setLinks(links.map(link => 
          link.id === currentLink.id ? { ...link, title: currentLink.title!, url: url!, category: currentLink.category! } : link
        ));
        
        toast.success('Link updated successfully');
      } else {
        const { data, error } = await supabase
          .from('event_links')
          .insert([
            {
              user_id: user.id,
              title: currentLink.title,
              url,
              category: currentLink.category || 'Uncategorized',
            }
          ])
          .select();
          
        if (error) throw error;
        
        setLinks([...(data as EventLink[]), ...links]);
        toast.success('Link added successfully');
      }
      
      resetLinkForm();
      loadCategories();
    } catch (error) {
      handleError(error);
    }
  };

  const deleteLink = async (linkId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('event_links')
        .delete()
        .eq('id', linkId);
        
      if (error) throw error;
      
      setLinks(links.filter(link => link.id !== linkId));
      toast.success('Link deleted successfully');
      
      // Refresh categories in case we deleted the last link in a category
      loadCategories();
    } catch (error) {
      handleError(error);
    }
  };

  const handleEditLink = (link: EventLink) => {
    setCurrentLink({
      id: link.id,
      title: link.title,
      url: link.url,
      category: link.category,
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const resetLinkForm = () => {
    setCurrentLink({ title: '', url: '', category: '' });
    setIsEditMode(false);
    setIsDialogOpen(false);
    setIsAddingCategory(false);
    setNewCategory('');
  };

  const addCategory = () => {
    if (!newCategory.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }
    
    if (categories.includes(newCategory.trim())) {
      toast.error('Category already exists');
      return;
    }
    
    setCurrentLink({...currentLink, category: newCategory.trim()});
    setCategories([...categories, newCategory.trim()]);
    setIsAddingCategory(false);
    setNewCategory('');
  };

  // Group links by category
  const linksByCategory = links.reduce((acc, link) => {
    const category = link.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(link);
    return acc;
  }, {} as Record<string, EventLink[]>);

  // Get filtered links based on selected category
  const filteredLinks = selectedCategory 
    ? { [selectedCategory]: linksByCategory[selectedCategory] || [] } 
    : linksByCategory;

  return (
    <Card className="shadow-lg border border-border dark:border-white/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl flex items-center gap-2">
            <LinkIcon className="h-6 w-6" /> Important Links
          </CardTitle>
          <CardDescription>Save and organize important event-related links</CardDescription>
        </div>
        <div className="flex space-x-2">
          {categories.length > 0 && (
            <Select value={selectedCategory || ''} onValueChange={(value) => setSelectedCategory(value || null)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button className="flex items-center gap-1" onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4" /> Add Link
            </Button>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{isEditMode ? 'Edit Link' : 'Add New Link'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="title" className="text-right text-sm font-medium">Title</label>
                  <Input
                    id="title"
                    className="col-span-3"
                    value={currentLink.title}
                    onChange={(e) => setCurrentLink({...currentLink, title: e.target.value})}
                    placeholder="Link title"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="url" className="text-right text-sm font-medium">URL</label>
                  <Input
                    id="url"
                    className="col-span-3"
                    value={currentLink.url}
                    onChange={(e) => setCurrentLink({...currentLink, url: e.target.value})}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <label htmlFor="category" className="text-right text-sm font-medium pt-2">Category</label>
                  <div className="col-span-3">
                    {!isAddingCategory ? (
                      <div className="flex space-x-2">
                        <Select 
                          value={currentLink.category || ''} 
                          onValueChange={(value) => setCurrentLink({...currentLink, category: value})}
                        >
                          <SelectTrigger className="flex-grow">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Uncategorized">Uncategorized</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsAddingCategory(true)}
                          size="sm"
                        >
                          New
                        </Button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <Input
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          placeholder="New category name"
                          className="flex-grow"
                        />
                        <Button type="button" onClick={addCategory} size="sm">Add</Button>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          onClick={() => setIsAddingCategory(false)} 
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={resetLinkForm}>Cancel</Button>
                <Button type="submit" onClick={addLink}>
                  {isEditMode ? 'Update' : 'Add'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {Object.keys(filteredLinks).length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <LinkIcon className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-lg font-medium">No links yet</p>
            <p className="text-muted-foreground mb-4">Save important links to keep organized.</p>
            <Button onClick={() => setIsDialogOpen(true)}>Add Your First Link</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(filteredLinks).map(([category, categoryLinks]) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <FolderIcon className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">{category}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {categoryLinks.map((link) => (
                    <div 
                      key={link.id} 
                      className="p-3 border border-border rounded-md flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{link.title}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[250px]">{link.url}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          asChild
                        >
                          <a href={link.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => handleEditLink(link)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:bg-destructive/10" 
                          onClick={() => deleteLink(link.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImportantLinksSection;
