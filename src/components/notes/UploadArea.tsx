import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FileUp, Link as LinkIcon } from "lucide-react";
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
  onFileUpload: (noteData: NoteForm) => Promise<void>;
  onLinkUpload: (noteData: NoteForm) => Promise<void>;
  refetchNotes: () => void;
}

export const UploadArea = ({ onFileUpload, onLinkUpload, refetchNotes }: UploadAreaProps) => {
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

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!selectedSubjectId) {
      toast.error("Please select a subject first");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to upload files");
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      let fileType = "";
      
      if (['pdf'].includes(fileExtension)) {
        fileType = "pdf";
      } else if (['ppt', 'pptx'].includes(fileExtension)) {
        fileType = "presentation";
      } else if (['doc', 'docx'].includes(fileExtension)) {
        fileType = "document";
      } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
        fileType = "image";
      } else {
        fileType = "other";
      }

      await onFileUpload({
        subject_id: selectedSubjectId,
        title: file.name,
        file_type: fileType,
        file
      });

      refetchNotes();
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  }, [selectedSubjectId, onFileUpload, refetchNotes, user]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

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

  return (
    <div className="mb-8 rounded-lg border p-4 bg-card">
      <h2 className="text-xl font-semibold mb-4">Upload Study Materials</h2>
      
      <div className="mb-4">
        <SubjectSelector 
          subjects={subjects}
          selectedSubjectId={selectedSubjectId}
          onSubjectSelect={setSelectedSubjectId}
        />
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-border"
        }`}
      >
        <input {...getInputProps()} />
        <FileUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-2">
          {isDragActive
            ? "Drop the files here"
            : "Drag & drop files here, or click to select files"}
        </p>
        <p className="text-sm text-muted-foreground">
          Supports PDF, PPT, PPTX, DOC, DOCX, and image files
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
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
  );
};
