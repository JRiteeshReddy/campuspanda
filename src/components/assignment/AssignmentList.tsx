
import React from 'react';
import { Assignment } from '@/types';
import AssignmentCard from './AssignmentCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AssignmentListProps {
  assignments: Assignment[];
  isLoading: boolean;
  onMarkComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onAddClick: () => void;
}

const AssignmentList = ({
  assignments,
  isLoading,
  onMarkComplete,
  onDelete,
  onAddClick
}: AssignmentListProps) => {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium">Assignments</h2>
        <Button onClick={onAddClick} size="sm">
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
              onMarkComplete={onMarkComplete}
              onDelete={onDelete}
            />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No assignments yet. Click "Add Assignment" to create one.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default AssignmentList;
