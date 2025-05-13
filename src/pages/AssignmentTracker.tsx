
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Navbar from '@/components/layout/Navbar';
import NewAssignmentForm from '@/components/assignment/NewAssignmentForm';
import { useAuth } from '@/context/AuthContext';
import AssignmentCalendar from '@/components/assignment/AssignmentCalendar';
import AssignmentList from '@/components/assignment/AssignmentList';
import { Skeleton } from '@/components/ui/skeleton';
import { useAssignments } from '@/hooks/use-assignments';

const AssignmentTracker = () => {
  // States
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0);
  const [isNewAssignmentDialogOpen, setIsNewAssignmentDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  // Auth context
  const { user } = useAuth();
  
  // Assignments data and operations
  const {
    assignments,
    isLoading,
    addAssignment,
    updateAssignment,
    deleteAssignment
  } = useAssignments(user?.id);

  // Handle date selection
  const handleDateSelect = (day: Date | undefined) => {
    if (day) {
      setSelectedDate(day);
      setIsNewAssignmentDialogOpen(true);
    }
  };

  // Handle month change
  const handleMonthChange = (offset: number) => {
    setSelectedMonthOffset(offset);
  };

  // Handle assignment creation
  const handleAddAssignment = async (newAssignment: {
    subject: string;
    title: string;
    deadline: Date;
  }) => {
    try {
      await addAssignment(newAssignment);
      setIsNewAssignmentDialogOpen(false);
    } catch (error) {
      // Error is already handled in the hook
      console.error("Error in component:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container max-w-4xl mx-auto px-4 pt-24 pb-12">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Assignment Tracker</h1>
        
        {isLoading ? (
          <>
            <Skeleton className="h-[400px] w-full mb-6" />
            <Skeleton className="h-8 w-40 mb-4" />
            <Skeleton className="h-24 w-full mb-3" />
            <Skeleton className="h-24 w-full mb-3" />
            <Skeleton className="h-24 w-full" />
          </>
        ) : (
          <>
            <AssignmentCalendar 
              assignments={assignments}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              selectedMonthOffset={selectedMonthOffset}
              onMonthChange={handleMonthChange}
            />
            
            <AssignmentList 
              assignments={assignments}
              isLoading={isLoading}
              onUpdate={updateAssignment}
              onDelete={deleteAssignment}
              onAddClick={() => setIsNewAssignmentDialogOpen(true)}
            />
          </>
        )}
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
