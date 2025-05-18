
import React from 'react';
import { formatDistance } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Note } from '@/types';

interface NotesListProps {
  notes: Note[];
  onDelete: (id: string) => void;
  refetchNotes?: () => void;
}

const NotesList = ({ notes, onDelete, refetchNotes }: NotesListProps) => {
  const handleDelete = (id: string) => {
    onDelete(id);
    if (refetchNotes) {
      refetchNotes();
    }
  };

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <div key={note.id} className="bg-card text-card-foreground rounded-md shadow-sm p-4 relative">
          <h3 className="text-lg font-semibold mb-2">{note.title}</h3>
          <p className="text-sm text-muted-foreground">
            {note.link_url && (
              <a href={note.link_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                {note.link_url}
              </a>
            )}
            {note.file_url && (
              <a href={note.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                View file
              </a>
            )}
          </p>
          <div className="text-xs text-muted-foreground mt-2">
            Created {formatDistance(new Date(note.created_at), new Date(), { addSuffix: true })}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-muted-foreground hover:text-red-500"
            onClick={() => handleDelete(note.id)}
            aria-label="Delete note"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default NotesList;
