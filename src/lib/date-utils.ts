
import { addMonths, format, isSameDay, differenceInDays } from "date-fns";

export { addMonths, format, isSameDay, differenceInDays };

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
