
import { useState } from "react";
import { Note, NoteWithSubject, Subject } from "@/types";
import { FileText, Link, Presentation, File, Trash2, ExternalLink, Image, Calendar, Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";

interface NotesListProps {
  notes: NoteWithSubject[];
  refetchNotes: () => void;
}

export const NotesList = ({ notes, refetchNotes }: NotesListProps) => {
  const [deleteNote, setDeleteNote] = useState<Note | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const getNoteIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />;
      case "presentation":
        return <Presentation className="h-5 w-5 text-orange-500" />;
      case "document":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "image":
        return <Image className="h-5 w-5 text-green-500" />;
      case "link":
        return <Link className="h-5 w-5 text-purple-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Unknown date';
    }
  };

  const handleDelete = async () => {
    if (!deleteNote) return;
    
    try {
      if (deleteNote.file_url) {
        const filePath = deleteNote.file_url.split('/').pop();
        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from('notes')
            .remove([filePath]);
            
          if (storageError) throw storageError;
        }
      }
      
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', deleteNote.id);
        
      if (error) throw error;
      
      refetchNotes();
      toast.success("Note deleted successfully");
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
    } finally {
      setDeleteNote(null);
      setIsAlertOpen(false);
    }
  };

  const handleOpenFile = (note: Note) => {
    if (note.file_type === "link" && note.link_url) {
      window.open(note.link_url, "_blank");
    } else if (note.file_url) {
      window.open(note.file_url, "_blank");
    }
  };

  const handleDownloadFile = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!note.file_url) {
      toast.error("No file available to download");
      return;
    }
    
    try {
      // Get the file name from the URL
      const fileName = note.file_url.split('/').pop() || note.title;
      
      // Fetch the file
      const response = await fetch(note.file_url);
      if (!response.ok) throw new Error('Failed to fetch file');
      
      const blob = await response.blob();
      
      // Create a download link and trigger the download
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success("Download started");
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
    }
  };

  const confirmDelete = (note: Note) => {
    setDeleteNote(note);
    setIsAlertOpen(true);
  };

  if (notes.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No notes found. Upload some files or add links to get started.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notes.map((note) => (
        <div
          key={note.id}
          className="flex items-center justify-between p-3 border rounded-md bg-card hover:bg-accent/50 transition-colors"
        >
          <div 
            className="flex items-center flex-1 cursor-pointer"
            onClick={() => handleOpenFile(note)}
          >
            <div className="mr-3">{getNoteIcon(note.file_type)}</div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{note.title}</h4>
              <div className="flex items-center text-xs text-muted-foreground">
                <span>{note.subject.name}</span>
                <span className="mx-1">•</span>
                <Calendar className="h-3 w-3 mr-1" />
                <span>{formatDate(note.created_at)}</span>
              </div>
            </div>
            {(note.file_url || note.link_url) && (
              <ExternalLink className="h-4 w-4 text-muted-foreground mr-4" />
            )}
          </div>
          <div className="flex items-center">
            {note.file_url && (
              <button
                onClick={(e) => handleDownloadFile(note, e)}
                className="p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-950 group mr-2"
                title="Download file"
              >
                <Download className="h-4 w-4 text-muted-foreground group-hover:text-blue-500" />
              </button>
            )}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                confirmDelete(note);
              }}
              className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-950 group"
              title="Delete note"
            >
              <Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-red-500" />
            </button>
          </div>
        </div>
      ))}

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this note and any associated files.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
