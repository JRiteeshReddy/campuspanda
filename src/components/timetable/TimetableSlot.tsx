
import React from 'react';

interface TimetableSlotProps {
  entry?: any;
  subjectName: string;
  location?: string;
  attendanceStatus?: 'good' | 'bad' | 'unknown';
  compact?: boolean;
}

const TimetableSlot: React.FC<TimetableSlotProps> = ({ 
  entry, 
  subjectName, 
  location,
  attendanceStatus = 'unknown',
  compact = false,
}) => {
  if (!entry) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted/20 transition-colors p-0.5">
        <span className={compact ? "text-[8px]" : "text-xs"}>+</span>
      </div>
    );
  }

  const bgColorClass = attendanceStatus === 'good' 
    ? 'bg-green-500/20 dark:bg-green-500/30 hover:bg-green-500/30' 
    : attendanceStatus === 'bad'
    ? 'bg-red-500/20 dark:bg-red-500/30 hover:bg-red-500/30'
    : 'bg-primary/10 dark:bg-primary/20 hover:bg-primary/20';

  const textColorClass = attendanceStatus === 'good'
    ? 'text-green-700 dark:text-green-400 font-bold'
    : attendanceStatus === 'bad'
    ? 'text-red-700 dark:text-red-400 font-bold'
    : 'text-foreground font-bold';

  return (
    <div className={`w-full h-full flex flex-col cursor-pointer transition-colors ${bgColorClass} ${compact ? 'p-0.5' : 'p-1'}`}>
      <span className={`truncate ${textColorClass} ${compact ? 'text-[7px] leading-tight' : 'text-xs'}`}>
        {subjectName || 'Unnamed'}
      </span>
      {location && <span className={`text-muted-foreground truncate ${compact ? 'text-[6px] leading-tight' : 'text-[10px]'}`}>{location}</span>}
    </div>
  );
};

export default TimetableSlot;
