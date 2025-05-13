import React, { useState } from 'react';
import { differenceInDays, format } from 'date-fns';
import { Assignment } from '@/types';
import { Check, Trash, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import NewAssignmentForm from './NewAssignmentForm';

interface AssignmentCardProps {
  assignment: Assignment;
  onUpdate: (assignment: Assignment) => void;
  onDelete: (id: string) => void;
}

const AssignmentCard = ({ assignment, onUpdate, onDelete }: AssignmentCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const daysUntilDeadline = differenceInDays(new Date(assignment.deadline), new Date());
  
  let statusColor = '';
  let statusText = '';
  let bgColor = '';
  
  if (assignment.completed) {
    statusColor = 'text-green-500';
    bgColor = 'bg-green-500/10';
    statusText = 'Completed';
  } else if (daysUntilDeadline <= 0) {
    statusColor = 'text-red-500';
    bgColor = 'bg-red-500/10';
    statusText = 'Due today';
  } else if (daysUntilDeadline === 1) {
    statusColor = 'text-red-500';
    bgColor = 'bg-red-500/10';
    statusText = 'Due tomorrow';
  } else if (daysUntilDeadline <= 3) {
    statusColor = 'text-yellow-500';
    bgColor = 'bg-yellow-500/10';
    statusText = `Due in ${daysUntilDeadline} days`;
  } else {
    statusColor = 'text-green-500';
    bgColor = 'bg-green-500/10';
    statusText = `Due in ${daysUntilDeadline} days`;
  }
  
  const handleComplete = () => {
    onUpdate({
      ...assignment,
      completed: !assignment.completed
    });
  };
  
  const handleDelete = () => {
    onDelete(assignment.id);
    setIsDeleteDialogOpen(false);
  };
  
  const handleEdit = (formData: { subject: string; title: string; deadline: Date }) => {
    onUpdate({
      ...assignment,
      subject: formData.subject,
      title: formData.title,
      deadline: formData.deadline
    });
    setIsEditDialogOpen(false);
  };
  
  return (
    <div className={`group relative flex items-center justify-between p-4 rounded-lg border border-border dark:border-white/10 ${bgColor} hover:bg-background/80 transition-colors`}>
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${assignment.completed ? 'bg-green-500' : daysUntilDeadline <= 0 ? 'bg-red-500' : daysUntilDeadline <= 3 ? 'bg-yellow-500' : 'bg-green-500'}`} />
        <div>
          <h3 className="text-base font-bold text-foreground">{assignment.subject.toLowerCase()}</h3>
          <p className="text-sm text-foreground/90">{assignment.title}</p>
          <p className="text-xs text-muted-foreground">Due: {format(new Date(assignment.deadline), 'MMMM d')}</p>
          <p className={`text-xs font-medium ${statusColor}`}>
            {statusText}
          </p>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={handleComplete}
          className={`p-1.5 rounded-full ${assignment.completed ? 'bg-green-500 text-white' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'} transition-colors`}
          aria-label={assignment.completed ? "Mark incomplete" : "Mark complete"}
        >
          <Check className="w-4 h-4" />
        </button>
        
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <button
              className="p-1.5 rounded-full bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
              aria-label="Edit assignment"
            >
              <Edit className="w-4 h-4" />
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Assignment</DialogTitle>
              <DialogDescription>
                Update the assignment details below.
              </DialogDescription>
            </DialogHeader>
            <NewAssignmentForm
              initialValues={{
                subject: assignment.subject,
                title: assignment.title,
                deadline: new Date(assignment.deadline)
              }}
              onSubmit={handleEdit}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
        
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogTrigger asChild>
            <button
              className="p-1.5 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
              aria-label="Delete assignment"
            >
              <Trash className="w-4 h-4" />
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Assignment</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this assignment? This action cannot be undone.
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

export default AssignmentCard;
