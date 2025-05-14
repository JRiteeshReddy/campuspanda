
// Import all functions directly from date-fns
import * as dateFns from 'date-fns';

/**
 * Returns a class name for a date cell based on its status
 */
export const getDateCellClassName = (
  date: Date | null,
  isSelected: boolean,
  isPast: boolean,
  isOnSameDay: boolean,
  isDisabled: boolean,
  hasAssignments: boolean
) => {
  if (!date) return '';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const daysUntil = dateFns.differenceInDays(date, today);
  
  // Base classes for the cell
  let className = 'relative w-full aspect-square flex items-center justify-center text-sm';
  
  // Add specific styles based on conditions
  if (isSelected) {
    className += ' bg-primary text-primary-foreground rounded-md font-medium';
  } else if (isOnSameDay) {
    className += ' bg-primary/10 text-primary rounded-md font-medium';
  } else if (isPast) {
    className += ' text-muted-foreground';
  } else if (hasAssignments) {
    // Upcoming date with assignments
    if (daysUntil <= 1) {
      className += ' text-red-500 dark:text-red-400 font-medium';
    } else if (daysUntil <= 3) {
      className += ' text-orange-500 dark:text-orange-400';
    } else {
      className += ' text-blue-600 dark:text-blue-400';
    }
  }
  
  // If disabled, overwrite with disabled styles
  if (isDisabled) {
    className = 'relative w-full aspect-square flex items-center justify-center text-sm text-muted-foreground opacity-50';
  }
  
  return className;
};

/**
 * Formats a date for display
 */
export const formatDate = (date: Date | string, formatStr: string = 'PPP'): string => {
  try {
    if (typeof date === 'string') {
      return dateFns.format(dateFns.parseISO(date), formatStr);
    }
    return dateFns.format(date, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Checks if a date is in the past
 */
export const isPastDate = (date: Date): boolean => {
  const today = dateFns.startOfDay(new Date());
  return !dateFns.isAfter(date, today) && !dateFns.isSameDay(date, today);
};

/**
 * Returns color and status text for an assignment based on its deadline and completion status
 */
export const getAssignmentStatusColor = (deadline: Date, isCompleted: boolean) => {
  if (isCompleted) {
    return {
      bgColor: 'bg-green-500',
      textColor: 'text-green-600 dark:text-green-400',
      statusText: 'Completed'
    };
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Calculate days until deadline
  const daysUntil = dateFns.differenceInDays(deadline, today);
  
  if (daysUntil < 0) {
    return {
      bgColor: 'bg-red-500',
      textColor: 'text-red-600 dark:text-red-400',
      statusText: 'Overdue'
    };
  } else if (daysUntil === 0) {
    return {
      bgColor: 'bg-red-500',
      textColor: 'text-red-600 dark:text-red-400',
      statusText: 'Due today'
    };
  } else if (daysUntil === 1) {
    return {
      bgColor: 'bg-orange-500',
      textColor: 'text-orange-600 dark:text-orange-400',
      statusText: 'Due tomorrow'
    };
  } else if (daysUntil <= 3) {
    return {
      bgColor: 'bg-yellow-500',
      textColor: 'text-yellow-600 dark:text-yellow-400',
      statusText: `Due in ${daysUntil} days`
    };
  } else {
    return {
      bgColor: 'bg-green-500',
      textColor: 'text-green-600 dark:text-green-400',
      statusText: `Due in ${daysUntil} days`
    };
  }
};

// Create a formatDistanceToNow function with the same API as before
export const formatDistanceToNow = (date: Date | number, options?: { addSuffix?: boolean }): string => {
  return dateFns.formatDistance(date, new Date(), { addSuffix: options?.addSuffix });
};

// Create a startOfToday function with the same API as before
export const startOfToday = (): Date => {
  return dateFns.startOfDay(new Date());
};

// Export functions that are used throughout the application
export const addMonths = dateFns.addMonths;
export const format = dateFns.format;
export const isSameDay = dateFns.isSameDay;
export const isAfter = dateFns.isAfter;
export const parseISO = dateFns.parseISO;
export const differenceInDays = dateFns.differenceInDays;

