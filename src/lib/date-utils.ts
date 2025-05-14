
import { addMonths as dateAddMonths, 
         format as dateFormat,
         isSameDay as dateIsSameDay, 
         differenceInDays as dateDifferenceInDays, 
         formatDistanceToNow as dateFormatDistanceToNow, 
         parseISO as dateParseISO } from 'date-fns';

// Re-export date-fns functions
export const addMonths = dateAddMonths;
export const format = dateFormat;
export const isSameDay = dateIsSameDay;
export const differenceInDays = dateDifferenceInDays;
export const formatDistanceToNow = dateFormatDistanceToNow;
export const parseISO = dateParseISO;

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
  
  const daysUntil = dateDifferenceInDays(date, today);
  
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
      return dateFormat(dateParseISO(date), formatStr);
    }
    return dateFormat(date, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

// Export all functions we need from date-fns
export { addMonths, format, isSameDay, differenceInDays, formatDistanceToNow, parseISO };
