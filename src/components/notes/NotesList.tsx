import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { NoteWithSubject } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { 
  FileText, 
  Presentation, 
  File, 
  Image, 
  Link, 
  Trash2, 
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

interface NotesListProps {
  notes: NoteWithSubject[];
  refetchNotes: () => void;
}

export const NotesList: React.FC<NotesListProps> = ({ notes, refetchNotes }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const openLink = (url: string) => {
    // Ensure URL has proper protocol
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    window.open(url, '_blank');
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Note deleted successfully');
      refetchNotes();
      queryClient.invalidateQueries({ queryKey: ["subjects-with-counts"] });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const renderIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'presentation':
        return <Presentation className="h-8 w-8 text-orange-500" />;
      case 'document':
        return <FileText className="h-8 w-8 text-blue-500" />;
      case 'image':
        return <Image className="h-8 w-8 text-green-500" />;
      case 'link':
        return <Link className="h-8 w-8 text-purple-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  if (!notes.length) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <File className="h-12 w-12 mx-auto mb-3" />
        <p>No notes found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {notes.map((note) => (
        <div 
          key={note.id} 
          className="flex flex-col p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors relative"
        >
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              {renderIcon(note.file_type)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm md:text-base truncate">{note.title}</h3>
              <p className="text-xs text-muted-foreground">
                {note.subject?.name || 'Unknown Subject'} · {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            {note.file_type === 'link' && note.link_url && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 text-xs"
                onClick={() => openLink(note.link_url || '')}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open Link
              </Button>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Note</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this note? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDeleteNote(note.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
    </div>
  );
};
