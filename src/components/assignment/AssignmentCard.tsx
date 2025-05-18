
import React from 'react';
import { format as formatDate } from 'date-fns';
import { CheckCircle, Circle, Trash, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getAssignmentStatusInfo } from '@/utils/dateUtils';
import { Assignment } from '@/types';

interface AssignmentCardProps {
  assignment: Assignment;
  onDelete: (id: string) => void;
  onMarkComplete: (id: string, isCompleted: boolean) => void;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  onDelete,
  onMarkComplete
}) => {
  const { color, text } = getAssignmentStatusInfo(
    new Date(assignment.deadline),
    assignment.completed || false
  );

  const handleToggleComplete = () => {
    onMarkComplete(
      assignment.id,
      !assignment.completed
    );
  };

  const handleDelete = () => {
    onDelete(assignment.id);
  };

  return (
    <Card className="mb-4 overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{assignment.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{assignment.subject}</p>
          </div>
          
          <div className="flex space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleToggleComplete}
                  >
                    {assignment.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {assignment.completed ? "Mark as incomplete" : "Mark as complete"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-500"
                    onClick={handleDelete}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete assignment</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 pb-2">
        <div className="flex justify-between text-sm">
          <div>
            <p className="text-sm text-muted-foreground">
              Due: {formatDate(new Date(assignment.deadline), "PPP")}
            </p>
          </div>
          <p className={`text-sm font-medium ${color}`}>{text}</p>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-2 text-xs text-muted-foreground border-t">
        <p>
          Created: {formatDate(new Date(assignment.created_at), "PP")}
        </p>
      </CardFooter>
    </Card>
  );
};

export default AssignmentCard;
