
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import NewAssignmentForm from '@/components/assignment/NewAssignmentForm';
import { Assignment } from '@/types';

interface NewAssignmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  subjects: string[];
  onSubmit: (values: Omit<Assignment, 'id' | 'user_id' | 'created_at'>) => void;
}

const NewAssignmentDialog = ({
  isOpen,
  onOpenChange,
  selectedDate,
  subjects,
  onSubmit
}: NewAssignmentDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Assignment</DialogTitle>
          <DialogDescription>
            Create a new assignment with details below.
          </DialogDescription>
        </DialogHeader>
        <NewAssignmentForm 
          initialDate={selectedDate} 
          subjects={subjects}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default NewAssignmentDialog;
