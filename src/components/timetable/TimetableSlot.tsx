
import React from 'react';

interface TimetableSlotProps {
  entry?: any;
  subjectName: string;
  location?: string;
  attendanceStatus?: 'good' | 'bad' | 'unknown';
}

const TimetableSlot: React.FC<TimetableSlotProps> = ({ 
  entry, 
  subjectName, 
  location,
  attendanceStatus = 'unknown'
}) => {
  if (!entry) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted/20 transition-colors p-1">
        <span className="text-xs">+</span>
      </div>
    );
  }

  // Define colors based on attendance status
  const bgColorClass = attendanceStatus === 'good' 
    ? 'bg-green-500/20 dark:bg-green-500/30 hover:bg-green-500/30' 
    : attendanceStatus === 'bad'
    ? 'bg-red-500/20 dark:bg-red-500/30 hover:bg-red-500/30'
    : 'bg-primary/10 dark:bg-primary/20 hover:bg-primary/20';

  const textColorClass = attendanceStatus === 'good'
    ? 'text-green-700 dark:text-green-400'
    : attendanceStatus === 'bad'
    ? 'text-red-700 dark:text-red-400'
    : 'text-foreground';

  return (
    <div className={`w-full h-full flex flex-col p-1 cursor-pointer transition-colors ${bgColorClass}`}>
      <span className={`font-medium text-xs truncate ${textColorClass}`}>{subjectName}</span>
      {location && <span className="text-[10px] text-muted-foreground truncate">{location}</span>}
    </div>
  );
};

export default TimetableSlot;
