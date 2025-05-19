
// Import date-fns functions correctly with proper types
import { differenceInDays, isEqual, format, formatDistance, addDays } from 'date-fns';

export const getAssignmentStatusInfo = (deadline: Date, completed: boolean) => {
  if (completed) {
    return {
      color: 'text-green-500',
      text: 'Completed'
    };
  }
  
  const daysUntilDeadline = differenceInDays(
    deadline,
    new Date()
  );
  
  if (daysUntilDeadline <= 0) {
    return {
      color: 'text-red-500',
      text: 'Overdue'
    };
  } else if (daysUntilDeadline <= 3) {
    return {
      color: 'text-orange-500',
      text: 'Due soon'
    };
  }
  
  return {
    color: 'text-green-500',
    text: 'On track'
  };
};

export const getDayClassNames = (day: Date, assignments: Array<{ deadline: Date, completed: boolean }>) => {
  const assignment = assignments.find(a => isEqual(new Date(a.deadline), day));
  
  if (!assignment) return undefined;
  
  if (assignment.completed) {
    return "bg-green-500 text-white rounded-full";
  }
  
  const daysUntilDeadline = differenceInDays(
    new Date(assignment.deadline),
    new Date()
  );
  
  if (daysUntilDeadline <= 1) {
    return "bg-red-500 text-white rounded-full";
  } else if (daysUntilDeadline <= 3) {
    return "bg-yellow-500 text-white rounded-full";
  } else {
    return "bg-green-500 text-white rounded-full";
  }
};
