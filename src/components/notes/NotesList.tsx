import React, { useState } from 'react';
import { Note, NoteWithSubject } from '@/types';
import { formatDistanceToNow, parseISO } from '@/lib/date-utils';
import { Trash2, ExternalLink, Download, File } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface NotesListProps {
  notes: NoteWithSubject[];
  onDelete: (id: string) => Promise<void>;
}

const NotesList = ({ notes, onDelete }: NotesListProps) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!selectedNoteId) return;
    
    setIsDeleting(true);
    try {
      await onDelete(selectedNoteId);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast.error("Failed to delete note");
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (noteId: string) => {
    setSelectedNoteId(noteId);
    setIsDeleteDialogOpen(true);
  };

  if (notes.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg mt-6">
        <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">No notes yet</h3>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Upload your first note above
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {notes.map((note) => (
        <div
          key={note.id}
          className="p-4 bg-card border rounded-lg flex items-start justify-between gap-4"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {note.file_type === 'pdf' ? (
              <File className="h-10 w-10 text-red-500" />
            ) : note.file_type === 'image' ? (
              <File className="h-10 w-10 text-blue-500" />
            ) : (
              <File className="h-10 w-10 text-gray-500" />
            )}
            <div className="min-w-0">
              <h3 className="font-medium text-foreground truncate">{note.title}</h3>
              <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                <span>{note.subject?.name || 'Unknown Subject'}</span>
                <span>•</span>
                <span>{formatDistanceToNow(parseISO(note.created_at), { addSuffix: true })}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {note.file_url && (
              <Button variant="ghost" size="sm" asChild>
                <a href={note.file_url} target="_blank" rel="noopener noreferrer" aria-label="Download">
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            )}
            
            {note.link_url && (
              <Button variant="ghost" size="sm" asChild>
                <a href={note.link_url} target="_blank" rel="noopener noreferrer" aria-label="Open link">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openDeleteDialog(note.id)}
              aria-label="Delete note"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      ))}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotesList;
