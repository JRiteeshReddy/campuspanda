
// Import functions directly from date-fns
import addMonths from "date-fns/addMonths";
import format from "date-fns/format";
import isSameDay from "date-fns/isSameDay";
import differenceInDays from "date-fns/differenceInDays";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import parseISO from "date-fns/parseISO";

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

  const daysUntilDeadline = differenceInDays(deadline, new Date());

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
  return format(date, formatString);
}

export function isPastDate(date: Date): boolean {
  // Compare dates, ignoring time component
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  
  return compareDate < today;
}

// Re-export the functions to be used elsewhere
export { addMonths, format, isSameDay, differenceInDays, formatDistanceToNow, parseISO };
