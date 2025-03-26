
import { useState } from "react";
import { Link as LinkIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { SubjectSelector } from "./SubjectSelector";
import { NoteForm, Subject } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

interface UploadAreaProps {
  onLinkUpload: (noteData: NoteForm) => Promise<void>;
  refetchNotes: () => void;
}

export const UploadArea = ({ onLinkUpload, refetchNotes }: UploadAreaProps) => {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*");
      
      if (error) throw error;
      return data as Subject[];
    }
  });

  const showStorageLimitNotification = () => {
    toast(
      <div className="flex flex-col space-y-3">
        <div className="text-sm">
          Due to limited storage, we cannot accept PDFs or PPTs directly. However, you can upload your notes to Google Drive or Dropbox and paste the link here.
        </div>
        <div className="flex gap-2 mt-2">
          <Button 
            size="sm" 
            className="flex-1"
            onClick={() => window.open('https://workspace.google.com/products/drive/', '_blank')}
          >
            Google Drive
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={() => window.open('https://www.dropbox.com/', '_blank')}
          >
            Dropbox
          </Button>
        </div>
      </div>,
      {
        duration: 30000, // 30 seconds
        className: "w-full max-w-md",
        position: "bottom-right",
        icon: <AlertCircle className="h-5 w-5" />,
      }
    );
  };

  const handleLinkSubmit = async () => {
    if (!selectedSubjectId) {
      toast.error("Please select a subject first");
      return;
    }

    if (!linkUrl || !linkTitle) {
      toast.error("Please enter both link URL and title");
      return;
    }

    try {
      setIsUploading(true);
      
      await onLinkUpload({
        subject_id: selectedSubjectId,
        title: linkTitle,
        file_type: "link",
        link_url: linkUrl
      });

      setIsLinkDialogOpen(false);
      setLinkUrl("");
      setLinkTitle("");
      refetchNotes();
      toast.success("Link saved successfully");
    } catch (error) {
      console.error("Link save error:", error);
      toast.error("Failed to save link");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    showStorageLimitNotification();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    showStorageLimitNotification();
  };

  return (
    <div className="mb-8 rounded-lg border p-4 bg-card">
      <h2 className="text-xl font-semibold mb-4">Add Study Materials</h2>
      
      <div className="mb-4">
        <SubjectSelector 
          subjects={subjects}
          selectedSubjectId={selectedSubjectId}
          onSubjectSelect={setSelectedSubjectId}
        />
      </div>

      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors border-border"
      >
        <div className="text-center flex flex-col items-center">
          <LinkIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">
            Add links to your study materials
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Paste links to Google Drive, Dropbox, or any other external storage
          </p>
          
          <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="flex items-center gap-2">
                <LinkIcon size={16} />
                <span>Add Link</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Link to Study Materials</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="link-title">Title</Label>
                  <Input
                    id="link-title"
                    value={linkTitle}
                    onChange={(e) => setLinkTitle(e.target.value)}
                    placeholder="Enter a title for this link"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link-url">URL</Label>
                  <Input
                    id="link-url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleLinkSubmit}
                  disabled={isUploading}
                >
                  Save Link
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};
