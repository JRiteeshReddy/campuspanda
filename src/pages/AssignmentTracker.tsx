
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Navbar from '@/components/layout/Navbar';
import AssignmentCard from '@/components/assignment/AssignmentCard';
import NewAssignmentForm from '@/components/assignment/NewAssignmentForm';
import { Assignment } from '@/types';

const AssignmentTracker = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0);
  const [isNewAssignmentDialogOpen, setIsNewAssignmentDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const handleDateSelect = (day: Date | undefined) => {
    if (day) {
      setSelectedDate(day);
      setIsNewAssignmentDialogOpen(true);
    }
  };

  const handleMonthChange = (offset: number) => {
    setSelectedMonthOffset(offset);
    const newDate = new Date();
    newDate.setMonth(newDate.getMonth() + offset);
    setDate(newDate);
  };

  const handleAddAssignment = (newAssignment: Assignment) => {
    setAssignments([...assignments, newAssignment]);
    setIsNewAssignmentDialogOpen(false);
  };

  const handleUpdateAssignment = (updatedAssignment: Assignment) => {
    setAssignments(assignments.map(assignment => 
      assignment.id === updatedAssignment.id ? updatedAssignment : assignment
    ));
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    setAssignments(assignments.filter(assignment => assignment.id !== assignmentId));
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
              modifiersStyles={{
                selected: {
                  backgroundColor: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))'
                },
                today: {
                  backgroundColor: 'hsl(var(--accent))',
                  color: 'hsl(var(--accent-foreground))'
                }
              }}
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
          {assignments.length > 0 ? (
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
            onSubmit={(data) => {
              const newAssignment: Assignment = {
                id: Date.now().toString(),
                user_id: '1',
                subject: data.subject,
                title: data.title,
                deadline: data.deadline,
                completed: false,
                created_at: new Date().toISOString()
              };
              handleAddAssignment(newAssignment);
            }}
            onCancel={() => setIsNewAssignmentDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignmentTracker;
