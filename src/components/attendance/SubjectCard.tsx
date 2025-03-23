import React, { useState } from 'react';
import { Subject, AttendanceSuggestion } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { supabase, handleError } from '@/lib/supabase';

interface SubjectCardProps {
  subject: Subject;
  onDelete: (id: string) => void;
  onUpdate: (subject: Subject) => void;
}

const SubjectCard = ({ subject, onDelete, onUpdate }: SubjectCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const formSchema = z.object({
    name: z.string().min(1, {
      message: "Subject name is required.",
    }),
    classes_attended: z.number().min(0, {
      message: "Classes attended must be a non-negative number.",
    }),
    classes_conducted: z.number().min(1, {
      message: "Classes conducted must be at least 1.",
    }),
    required_percentage: z.number().min(1, {
      message: "Required percentage must be at least 1.",
    }).max(100, {
      message: "Required percentage cannot exceed 100.",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: subject.name,
      classes_attended: subject.classes_attended,
      classes_conducted: subject.classes_conducted,
      required_percentage: subject.required_percentage,
    },
    mode: "onChange",
  });

  async function editSubject(values: z.infer<typeof formSchema>) {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .update({
          name: values.name,
          classes_attended: values.classes_attended,
          classes_conducted: values.classes_conducted,
          required_percentage: values.required_percentage,
        })
        .eq('id', subject.id)
        .select();

      if (error) {
        handleError(error);
        return;
      }

      if (data && data.length > 0) {
        onUpdate({
          ...subject,
          name: values.name,
          classes_attended: values.classes_attended,
          classes_conducted: values.classes_conducted,
          required_percentage: values.required_percentage,
        });
        toast.success("Subject updated successfully!");
      } else {
        toast.error("Failed to update subject.");
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsEditDialogOpen(false);
    }
  }

  const handleEditSubmit = (values: z.infer<typeof formSchema>) => {
    editSubject(values);
  };

  async function deleteSubject() {
    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', subject.id);

      if (error) {
        handleError(error);
        return;
      }

      onDelete(subject.id);
      toast.success("Subject deleted successfully!");
    } catch (error) {
      handleError(error);
    } finally {
      setIsDeleteDialogOpen(false);
    }
  }

  const handleDelete = () => {
    deleteSubject();
  };

  async function markPresent() {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .update({ classes_attended: subject.classes_attended + 1, classes_conducted: subject.classes_conducted + 1 })
        .eq('id', subject.id)
        .select();

      if (error) {
        handleError(error);
        return;
      }

      if (data && data.length > 0) {
        onUpdate({
          ...subject,
          classes_attended: subject.classes_attended + 1,
          classes_conducted: subject.classes_conducted + 1,
        });
        toast.success("Attendance marked successfully!");
      } else {
        toast.error("Failed to mark attendance.");
      }
    } catch (error) {
      handleError(error);
    }
  }

  async function markAbsent() {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .update({ classes_conducted: subject.classes_conducted + 1 })
        .eq('id', subject.id)
        .select();

      if (error) {
        handleError(error);
        return;
      }

      if (data && data.length > 0) {
        onUpdate({
          ...subject,
          classes_conducted: subject.classes_conducted + 1,
        });
        toast.success("Absence marked successfully!");
      } else {
        toast.error("Failed to mark absence.");
      }
    } catch (error) {
      handleError(error);
    }
  }

  const markAttendance = async (isPresent: boolean) => {
    if (isPresent) {
      await markPresent();
    } else {
      await markAbsent();
    }
  };

  const attendancePercentage = subject.classes_attended > 0
    ? (subject.classes_attended / subject.classes_conducted) * 100
    : 0;

  const meetsRequirement = attendancePercentage >= subject.required_percentage;

  let suggestionType: 'attend' | 'bunk' = 'attend';
  let suggestionCount = 0;

  if (meetsRequirement) {
    suggestionType = 'bunk';
    const currentAttendance = subject.classes_attended;
    const currentTotal = subject.classes_conducted;
    
    let counter = 0;
    let tempTotal = currentTotal;
    let tempAttendance = currentAttendance;
    
    while ((tempAttendance / tempTotal) * 100 >= subject.required_percentage) {
      tempTotal += 1;
      counter += 1;
    }
    
    suggestionCount = counter - 1 >= 0 ? counter - 1 : 0;
  } else {
    suggestionType = 'attend';
    const currentAttendance = subject.classes_attended;
    const currentTotal = subject.classes_conducted;
    const requiredPercentage = subject.required_percentage;
    
    let counter = 0;
    let tempTotal = currentTotal;
    let tempAttendance = currentAttendance;
    
    while ((tempAttendance / tempTotal) * 100 < requiredPercentage) {
      tempTotal += 1;
      tempAttendance += 1;
      counter += 1;
    }
    
    suggestionCount = counter;
  }

  return (
    <div className="group relative flex flex-row justify-between items-start p-4 rounded-lg border border-border bg-background/50 hover:bg-background/80 transition-colors mb-3">
      <div className="flex flex-col max-w-[65%]">
        <h3 className="text-base sm:text-lg font-bold text-foreground mb-1">{subject.name.toLowerCase()}</h3>
        <p className="text-base font-bold text-foreground/90">{subject.classes_attended}/{subject.classes_conducted}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {meetsRequirement 
            ? `On Track, May miss: ${suggestionCount}` 
            : `Need to attend: ${suggestionCount}`}
        </p>
      </div>
      
      <div className="flex flex-col items-end">
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={meetsRequirement ? "#22c55e" : "#ef4444"}
              strokeWidth="3"
              strokeDasharray={`${attendancePercentage}, 100`}
            />
            <text x="18" y="20.35" textAnchor="middle" className="text-xs font-medium fill-foreground">
              {attendancePercentage.toFixed(1)}%
            </text>
          </svg>
        </div>
        
        <div className="flex space-x-2 mt-2">
          <button
            onClick={() => markAttendance(true)}
            className="p-1 rounded-full bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
            aria-label="Mark present"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
          
          <button
            onClick={() => markAttendance(false)}
            className="p-1 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
            aria-label="Mark absent"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
        <Dialog>
          <DialogTrigger asChild>
            <button
              onClick={() => setIsEditDialogOpen(true)}
              className="p-1 text-xs text-muted-foreground hover:text-foreground"
              aria-label="Edit subject"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Subject</DialogTitle>
              <DialogDescription>
                Update the subject details below.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleEditSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Subject name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="classes_attended"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Classes Attended</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Classes attended" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="classes_conducted"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Classes Conducted</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Classes conducted" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="required_percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required Percentage</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Required percentage"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={!form.formState.isValid}>Save changes</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <button
              onClick={() => setIsDeleteDialogOpen(true)}
              className="p-1 text-xs text-muted-foreground hover:text-destructive"
              aria-label="Delete subject"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Subject</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this subject? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SubjectCard;

