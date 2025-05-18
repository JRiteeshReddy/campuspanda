
import React, { useState } from 'react';
import * as dateFns from 'date-fns';
import { Assignment } from '@/types';
import { Check, Trash, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { getAssignmentStatusInfo } from '@/utils/dateUtils';

interface AssignmentCardProps {
  assignment: Assignment;
  onMarkComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const AssignmentCard = ({ assignment, onMarkComplete, onDelete }: AssignmentCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { color: statusColor, text: statusText } = getAssignmentStatusInfo(
    new Date(assignment.deadline), 
    assignment.completed
  );

  const handleDelete = () => {
    onDelete(assignment.id);
    setIsDeleteDialogOpen(false);
  };

  const handleMarkComplete = () => {
    onMarkComplete(assignment.id);
  };

  const EditAssignmentDialog = () => (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Assignment</DialogTitle>
          <DialogDescription>
            This feature is under development.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p>Coming soon!</p>
        </div>
        <DialogFooter>
          <Button type="submit">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const DeleteAssignmentDialog = () => (
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500">
          <Trash className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the assignment from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <div className={`relative flex items-start p-3 border rounded-lg ${assignment.completed ? 'bg-muted/40' : 'bg-card'}`}>
      <div className="absolute top-3 right-3 flex space-x-1">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-green-500" onClick={handleMarkComplete}>
          <Check className="h-4 w-4" />
        </Button>
        <EditAssignmentDialog />
        <DeleteAssignmentDialog />
      </div>
      <div>
        <h3 className="text-base font-bold text-foreground">{assignment.subject.toLowerCase()}</h3>
        <p className="text-sm text-foreground/90">{assignment.title}</p>
        <p className="text-xs text-muted-foreground">Due: {dateFns.format(new Date(assignment.deadline), 'MMMM d')}</p>
        <p className={`text-xs font-medium ${statusColor}`}>
          {statusText}
        </p>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Badge variant="outline" className="ml-auto">View More</Badge>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{assignment.title}</DialogTitle>
            <DialogDescription>More details about this assignment.</DialogDescription>
          </DialogHeader>
          <p>Subject: {assignment.subject}</p>
          <p>Deadline: {dateFns.format(new Date(assignment.deadline), 'MMMM d, yyyy')}</p>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignmentCard;
