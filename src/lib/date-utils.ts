
// Import functions from date-fns directly
import { 
  addMonths as addMonthsOriginal,
  format as formatOriginal,
  isSameDay as isSameDayOriginal,
  differenceInDays as differenceInDaysOriginal,
  formatDistanceToNow as formatDistanceToNowOriginal,
  parseISO as parseISOOriginal
} from "date-fns";

// Re-export the functions (not as types)
export const addMonths = addMonthsOriginal;
export const format = formatOriginal;
export const isSameDay = isSameDayOriginal;
export const differenceInDays = differenceInDaysOriginal;
export const formatDistanceToNow = formatDistanceToNowOriginal;
export const parseISO = parseISOOriginal;

export function getAssignmentStatusColor(deadline: Date, completed: boolean): {
  bgColor: string;
  textColor: string;
  statusText: string;
} {
  if (completed) {
    return {
      bgColor: "bg-green-500",
      textColor: "text-green-500",
      statusText: "Completed",
    };
  }

  const daysUntilDeadline = differenceInDaysOriginal(deadline, new Date());

  if (daysUntilDeadline <= 0) {
    return {
      bgColor: "bg-red-500",
      textColor: "text-red-500",
      statusText: daysUntilDeadline === 0 ? "Due today" : "Overdue",
    };
  } else if (daysUntilDeadline === 1) {
    return {
      bgColor: "bg-red-500",
      textColor: "text-red-500",
      statusText: "Due tomorrow",
    };
  } else if (daysUntilDeadline <= 3) {
    return {
      bgColor: "bg-yellow-500",
      textColor: "text-yellow-500",
      statusText: `Due in ${daysUntilDeadline} days`,
    };
  } else {
    return {
      bgColor: "bg-green-500",
      textColor: "text-green-500",
      statusText: `Due in ${daysUntilDeadline} days`,
    };
  }
}

export function formatDate(date: Date, formatString: string = "MMMM d"): string {
  return formatOriginal(date, formatString);
}

export function isPastDate(date: Date): boolean {
  // Compare dates, ignoring time component
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  
  return compareDate < today;
}
