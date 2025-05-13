
import React from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Note, Subject } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, ExternalLink, File, FileText, Trash } from 'lucide-react';
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
} from '@/components/ui/alert-dialog';

interface NotesListProps {
  notes: Note[];
  subjects: Subject[];
  onDelete: (noteId: string) => void;
}

const NotesList = ({ notes, subjects, onDelete }: NotesListProps) => {
  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No notes found. Upload your first note using the form above.</p>
      </div>
    );
  }

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject ? subject.name : 'Unknown Subject';
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText />;
      case 'link':
        return <ExternalLink />;
      default:
        return <File />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
    } catch (error) {
      return 'Date unknown';
    }
  };

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <Card key={note.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-start sm:items-center justify-between p-4 sm:p-6 flex-col sm:flex-row gap-4 sm:gap-0">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-primary/10 text-primary rounded-md">
                  {getFileIcon(note.file_type)}
                </div>
                <div>
                  <h3 className="font-semibold">{note.title}</h3>
                  <p className="text-sm text-muted-foreground">{getSubjectName(note.subject_id)}</p>
                  <p className="text-xs text-muted-foreground">Added {formatDate(note.created_at)}</p>
                </div>
              </div>
              <div className="flex space-x-2 w-full sm:w-auto justify-end">
                {note.file_type === 'link' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(note.link_url, '_blank')}
                    className="flex items-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(note.file_url, '_blank')}
                    className="flex items-center"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center text-destructive">
                      <Trash className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your note.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(note.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default NotesList;
