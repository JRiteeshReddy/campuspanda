
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { NoteForm, NoteWithSubject, SubjectWithNotesCount } from "@/types";
import { supabase } from "@/lib/supabase";
import { UploadArea } from "@/components/notes/UploadArea";
import { SubjectCard } from "@/components/notes/SubjectCard";
import { NotesList } from "@/components/notes/NotesList";
import Navbar from "@/components/layout/Navbar";
import { v4 as uuidv4 } from 'uuid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileQuestion } from "lucide-react";

const NotesOrganizer = () => {
  const { user } = useAuth();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: subjectsWithCounts = [], isLoading: isLoadingSubjects } = useQuery({
    queryKey: ["subjects-with-counts"],
    queryFn: async () => {
      if (!user) return [];

      // First get all subjects
      const { data: subjects, error: subjectsError } = await supabase
        .from("subjects")
        .select("*")
        .eq("user_id", user.id);

      if (subjectsError) throw subjectsError;

      // Then count notes for each subject
      const subjectsWithCounts: SubjectWithNotesCount[] = await Promise.all(
        subjects.map(async (subject) => {
          const { count, error: countError } = await supabase
            .from("notes")
            .select("*", { count: "exact", head: true })
            .eq("subject_id", subject.id);

          if (countError) throw countError;

          return {
            ...subject,
            notesCount: count || 0
          };
        })
      );

      return subjectsWithCounts;
    },
    enabled: !!user
  });

  const { data: notes = [], isLoading: isLoadingNotes, refetch: refetchNotes } = useQuery({
    queryKey: ["notes", selectedSubjectId],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from("notes")
        .select(`
          *,
          subject:subjects(*)
        `)
        .eq("user_id", user.id);

      if (selectedSubjectId) {
        query = query.eq("subject_id", selectedSubjectId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as NoteWithSubject[];
    },
    enabled: !!user
  });

  const handleFileUpload = async (noteData: NoteForm) => {
    if (!user) return;

    const file = noteData.file;
    if (!file) return;

    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('notes')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get the public URL for the file
    const { data: { publicUrl } } = supabase.storage
      .from('notes')
      .getPublicUrl(filePath);

    // Create a note record in the database
    const { error: noteError } = await supabase
      .from('notes')
      .insert([
        {
          user_id: user.id,
          subject_id: noteData.subject_id,
          title: noteData.title,
          file_type: noteData.file_type,
          file_url: publicUrl
        }
      ]);

    if (noteError) throw noteError;

    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ["notes"] });
    queryClient.invalidateQueries({ queryKey: ["subjects-with-counts"] });
  };

  const handleLinkUpload = async (noteData: NoteForm) => {
    if (!user) return;

    // Create a note record in the database
    const { error: noteError } = await supabase
      .from('notes')
      .insert([
        {
          user_id: user.id,
          subject_id: noteData.subject_id,
          title: noteData.title,
          file_type: noteData.file_type,
          link_url: noteData.link_url
        }
      ]);

    if (noteError) throw noteError;

    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ["notes"] });
    queryClient.invalidateQueries({ queryKey: ["subjects-with-counts"] });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        <h1 className="text-3xl font-bold mb-6">Notes Organizer</h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <UploadArea 
              onFileUpload={handleFileUpload} 
              onLinkUpload={handleLinkUpload}
              refetchNotes={() => {
                refetchNotes();
                queryClient.invalidateQueries({ queryKey: ["subjects-with-counts"] });
              }}
            />
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-lg border bg-card p-4">
              <h2 className="text-xl font-semibold mb-4">Subjects</h2>
              
              {isLoadingSubjects ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-muted rounded"></div>
                  ))}
                </div>
              ) : subjectsWithCounts.length > 0 ? (
                <div className="space-y-3">
                  {subjectsWithCounts.map((subject) => (
                    <SubjectCard
                      key={subject.id}
                      subject={subject}
                      onClick={() => setSelectedSubjectId(subject.id)}
                      isActive={selectedSubjectId === subject.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 text-muted-foreground">
                  <FileQuestion className="h-8 w-8 mx-auto mb-2" />
                  <p>No subjects yet.</p>
                  <p className="text-sm">Upload a note to create your first subject.</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-lg border bg-card p-4">
              <h2 className="text-xl font-semibold mb-4">
                {selectedSubjectId 
                  ? `Notes for ${subjectsWithCounts.find(s => s.id === selectedSubjectId)?.name}` 
                  : "All Notes"
                }
              </h2>

              <Tabs defaultValue="all" className="mb-4">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="files">Files</TabsTrigger>
                  <TabsTrigger value="links">Links</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                  <NotesList 
                    notes={notes} 
                    refetchNotes={() => {
                      refetchNotes();
                      queryClient.invalidateQueries({ queryKey: ["subjects-with-counts"] });
                    }}
                  />
                </TabsContent>
                <TabsContent value="files">
                  <NotesList 
                    notes={notes.filter(note => note.file_type !== 'link')} 
                    refetchNotes={() => {
                      refetchNotes();
                      queryClient.invalidateQueries({ queryKey: ["subjects-with-counts"] });
                    }}
                  />
                </TabsContent>
                <TabsContent value="links">
                  <NotesList 
                    notes={notes.filter(note => note.file_type === 'link')} 
                    refetchNotes={() => {
                      refetchNotes();
                      queryClient.invalidateQueries({ queryKey: ["subjects-with-counts"] });
                    }}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotesOrganizer;
