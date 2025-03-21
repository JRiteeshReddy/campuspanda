
import { useState } from 'react';
import { SubjectForm } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { supabase, handleError } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface NewSubjectFormProps {
  onSuccess: () => void;
}

const NewSubjectForm = ({ onSuccess }: NewSubjectFormProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SubjectForm>({
    name: '',
    classes_attended: 0,
    classes_conducted: 0,
    required_percentage: 75,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: name === 'name' ? value : parseInt(value) || 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (!formData.name.trim()) {
      toast.error('Subject name is required');
      return;
    }
    
    if (formData.classes_conducted < formData.classes_attended) {
      toast.error('Attended classes cannot be more than conducted classes');
      return;
    }
    
    if (formData.required_percentage < 0 || formData.required_percentage > 100) {
      toast.error('Required percentage must be between 0 and 100');
      return;
    }
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('subjects')
        .insert({
          user_id: user.id,
          name: formData.name.trim(),
          classes_attended: formData.classes_attended,
          classes_conducted: formData.classes_conducted,
          required_percentage: formData.required_percentage,
        });
      
      if (error) throw error;
      
      toast.success(`Subject "${formData.name}" added successfully`);
      setFormData({
        name: '',
        classes_attended: 0,
        classes_conducted: 0,
        required_percentage: 75,
      });
      setOpen(false);
      onSuccess();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-primary mb-6 flex items-center">
          <Plus size={18} className="mr-2" />
          Add New Subject
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px] rounded-lg animate-scale-in">
        <DialogHeader>
          <DialogTitle>Add New Subject</DialogTitle>
          <DialogDescription>
            Enter the details of your new subject. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Subject Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Mathematics"
              className="form-input"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="classes_attended">
                Classes Attended
              </Label>
              <Input
                id="classes_attended"
                name="classes_attended"
                type="number"
                min="0"
                value={formData.classes_attended}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="classes_conducted">
                Classes Conducted
              </Label>
              <Input
                id="classes_conducted"
                name="classes_conducted"
                type="number"
                min="0"
                value={formData.classes_conducted}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="required_percentage">
              Required Percentage (%)
            </Label>
            <Input
              id="required_percentage"
              name="required_percentage"
              type="number"
              min="0"
              max="100"
              value={formData.required_percentage}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          
          <DialogFooter className="mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="btn-primary">
              {loading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Subject'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewSubjectForm;
