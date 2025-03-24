import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { format, addMonths, isSameDay } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Navbar from '@/components/layout/Navbar';
import AssignmentCard from '@/components/assignment/AssignmentCard';
import NewAssignmentForm from '@/components/assignment/NewAssignmentForm';
import { Assignment } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const AssignmentTracker = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0);
  const [isNewAssignmentDialogOpen, setIsNewAssignmentDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAssignments();
    } else {
      setAssignments([]);
      setIsLoading(false);
    }
  }, [user]);

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('user_id', user?.id)
        .order('deadline', { ascending: true });

      if (error) throw error;
      
      const formattedAssignments = data.map(assignment => ({
        ...assignment,
        deadline: new Date(assignment.deadline)
      }));
      
      setAssignments(formattedAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (day: Date | undefined) => {
    if (day) {
      setSelectedDate(day);
      setIsNewAssignmentDialogOpen(true);
    }
  };

  const handleMonthChange = (offset: number) => {
    setSelectedMonthOffset(offset);
    setDate(addMonths(new Date(), offset));
  };

  const handlePreviousMonth = () => {
    const newOffset = selectedMonthOffset - 1;
    handleMonthChange(newOffset);
  };

  const handleNextMonth = () => {
    const newOffset = selectedMonthOffset + 1;
    handleMonthChange(newOffset);
  };

  const handleAddAssignment = async (newAssignment: Omit<Assignment, 'id' | 'user_id' | 'created_at'>) => {
    try {
      const assignmentToAdd = {
        user_id: user?.id,
        subject: newAssignment.subject,
        title: newAssignment.title,
        deadline: newAssignment.deadline.toISOString(),
        completed: false
      };

      const { data, error } = await supabase
        .from('assignments')
        .insert(assignmentToAdd)
        .select()
        .single();

      if (error) throw error;

      const formattedAssignment = {
        ...data,
        deadline: new Date(data.deadline)
      };

      setAssignments(prevAssignments => 
        [...prevAssignments, formattedAssignment].sort(
          (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        )
      );
      
      setIsNewAssignmentDialogOpen(false);
      toast.success('Assignment added successfully');
    } catch (error) {
      console.error('Error adding assignment:', error);
      toast.error('Failed to add assignment');
    }
  };

  const handleUpdateAssignment = async (updatedAssignment: Assignment) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .update({
          subject: updatedAssignment.subject,
          title: updatedAssignment.title,
          deadline: updatedAssignment.deadline instanceof Date 
            ? updatedAssignment.deadline.toISOString() 
            : updatedAssignment.deadline,
          completed: updatedAssignment.completed
        })
        .eq('id', updatedAssignment.id);

      if (error) throw error;

      setAssignments(prevAssignments => 
        prevAssignments
          .map(assignment => 
            assignment.id === updatedAssignment.id ? updatedAssignment : assignment
          )
          .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      );
      
      toast.success('Assignment updated successfully');
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast.error('Failed to update assignment');
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      setAssignments(assignments.filter(assignment => assignment.id !== assignmentId));
      toast.success('Assignment deleted successfully');
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to delete assignment');
    }
  };

  const getDayClassNames = (day: Date) => {
    const assignment = assignments.find(a => isSameDay(new Date(a.deadline), day));
    
    if (!assignment) return undefined;
    
    if (assignment.completed) {
      return "bg-green-500 text-white rounded-full";
    }
    
    const daysUntilDeadline = Math.ceil(
      (new Date(assignment.deadline).getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)
    );
    
    if (daysUntilDeadline <= 1) {
      return "bg-red-500 text-white rounded-full";
    } else if (daysUntilDeadline <= 3) {
      return "bg-yellow-500 text-white rounded-full";
    } else {
      return "bg-green-500 text-white rounded-full";
    }
  };

  const modifiers = {
    assignment: (day: Date) => 
      assignments.some(assignment => 
        isSameDay(new Date(assignment.deadline), day)
      )
  };

  const modifiersClassNames = {
    assignment: (day: Date) => {
      const assignment = assignments.find(a => isSameDay(new Date(a.deadline), day));
      
      if (!assignment) return "";
      
      if (assignment.completed) {
        return "bg-green-500 text-white rounded-full";
      }
      
      const daysUntilDeadline = Math.ceil(
        (new Date(assignment.deadline).getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)
      );
      
      if (daysUntilDeadline <= 1) {
        return "bg-red-500 text-white rounded-full";
      } else if (daysUntilDeadline <= 3) {
        return "bg-yellow-500 text-white rounded-full";
      } else {
        return "bg-green-500 text-white rounded-full";
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container max-w-4xl mx-auto px-4 pt-24 pb-12">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Assignment Tracker</h1>
        
        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium">Calendar</h2>
              <Tabs value={selectedMonthOffset.toString()} className="w-auto">
                <TabsList>
                  <TabsTrigger value="0" onClick={() => handleMonthChange(0)}>Current</TabsTrigger>
                  <TabsTrigger value="1" onClick={() => handleMonthChange(1)}>Next</TabsTrigger>
                  <TabsTrigger value="2" onClick={() => handleMonthChange(2)}>+2</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              month={date}
              className="rounded-md border pointer-events-auto mx-auto"
              modifiers={{
                assignment: (day) => 
                  assignments.some(assignment => 
                    isSameDay(new Date(assignment.deadline), day)
                  )
              }}
              modifiersStyles={{
                assignment: (day) => {
                  const className = getDayClassNames(day);
                  if (className) {
                    if (className.includes('bg-red-500')) {
                      return { backgroundColor: '#ef4444', color: 'white', borderRadius: '9999px' };
                    } else if (className.includes('bg-yellow-500')) {
                      return { backgroundColor: '#eab308', color: 'white', borderRadius: '9999px' };
                    } else if (className.includes('bg-green-500')) {
                      return { backgroundColor: '#22c55e', color: 'white', borderRadius: '9999px' };
                    }
                  }
                  return {};
                }
              }}
              onMonthChange={setDate}
              onPrevious={handlePreviousMonth}
              onNext={handleNextMonth}
            />
          </CardContent>
        </Card>
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium">Assignments</h2>
          <Button onClick={() => setIsNewAssignmentDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Assignment
          </Button>
        </div>
        
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Loading assignments...</p>
            </div>
          ) : assignments.length > 0 ? (
            assignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onUpdate={handleUpdateAssignment}
                onDelete={handleDeleteAssignment}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No assignments yet. Click "Add Assignment" to create one.</p>
            </div>
          )}
        </div>
      </main>
      
      <Dialog open={isNewAssignmentDialogOpen} onOpenChange={setIsNewAssignmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Assignment</DialogTitle>
            <DialogDescription>
              Create a new assignment with details below.
            </DialogDescription>
          </DialogHeader>
          <NewAssignmentForm 
            initialDate={selectedDate} 
            onSubmit={handleAddAssignment}
            onCancel={() => setIsNewAssignmentDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignmentTracker;
