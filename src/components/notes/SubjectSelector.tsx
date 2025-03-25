
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { Subject } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface SubjectSelectorProps {
  subjects: Subject[];
  selectedSubjectId: string;
  onSubjectSelect: (subjectId: string) => void;
}

export const SubjectSelector = ({
  subjects,
  selectedSubjectId,
  onSubjectSelect
}: SubjectSelectorProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleCreateSubject = async () => {
    if (!newSubjectName.trim()) {
      toast.error("Subject name cannot be empty");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to create a subject");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("subjects")
        .insert([
          {
            user_id: user.id,
            name: newSubjectName,
            classes_attended: 0,
            classes_conducted: 0,
            required_percentage: 75
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Update the subjects list
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      
      // Select the newly created subject
      if (data) {
        onSubjectSelect(data.id);
      }

      setNewSubjectName("");
      setIsDialogOpen(false);
      toast.success(`Subject "${newSubjectName}" created`);
    } catch (error) {
      console.error("Error creating subject:", error);
      toast.error("Failed to create subject");
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <Label htmlFor="subject-select">Select Subject</Label>
      <div className="flex gap-2">
        <select
          id="subject-select"
          value={selectedSubjectId}
          onChange={(e) => onSubjectSelect(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">-- Select a subject --</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex-shrink-0">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Subject</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-subject-name">Subject Name</Label>
                <Input
                  id="new-subject-name"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="Enter subject name"
                />
              </div>
              <Button className="w-full" onClick={handleCreateSubject}>
                Create Subject
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
