
import React, { useState } from 'react';
import { addMonths } from 'date-fns';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { useAuth } from '@/context/AuthContext';
import AssignmentList from '@/components/assignment/AssignmentList';
import AssignmentCalendar from '@/components/assignment/AssignmentCalendar';
import NewAssignmentDialog from '@/components/assignment/NewAssignmentDialog';
import { useAssignments } from '@/hooks/use-assignments';

const AssignmentTracker = () => {
  useDocumentTitle('Assignment Tracker');

  const [date, setDate] = useState<Date>(new Date());
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0);
  const [isNewAssignmentDialogOpen, setIsNewAssignmentDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { user } = useAuth();
  
  const {
    assignments,
    isLoading,
    addAssignment,
    markAssignmentComplete,
    deleteAssignment
  } = useAssignments(user?.id);

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

  const handleAddAssignment = async (newAssignment: any) => {
    const success = await addAssignment(newAssignment);
    if (success) {
      setIsNewAssignmentDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container max-w-4xl mx-auto px-4 pt-24 pb-12">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Assignment Tracker</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardContent className="p-4 sm:p-6">
              <AssignmentCalendar
                assignments={assignments}
                date={date}
                selectedDate={selectedDate}
                selectedMonthOffset={selectedMonthOffset}
                onDateSelect={handleDateSelect}
                onMonthChange={handleMonthChange}
              />
            </CardContent>
          </CardHeader>
        </Card>
        
        <AssignmentList
          assignments={assignments}
          isLoading={isLoading}
          onMarkComplete={markAssignmentComplete}
          onDelete={deleteAssignment}
          onAddClick={() => setIsNewAssignmentDialogOpen(true)}
        />
      </main>
      
      <NewAssignmentDialog
        isOpen={isNewAssignmentDialogOpen}
        onOpenChange={setIsNewAssignmentDialogOpen}
        selectedDate={selectedDate}
        subjects={[]}
        onSubmit={handleAddAssignment}
      />
    </div>
  );
};

export default AssignmentTracker;
