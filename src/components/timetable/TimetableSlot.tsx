
import React from 'react';

interface TimetableSlotProps {
  entry?: any;
  subjectName: string;
  location?: string;
}

const TimetableSlot: React.FC<TimetableSlotProps> = ({ entry, subjectName, location }) => {
  if (!entry) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted/20 transition-colors p-2">
        <span className="text-xs">+ Add Class</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-2 cursor-pointer hover:bg-primary/5 transition-colors bg-primary/10 dark:bg-primary/20">
      <span className="font-medium text-sm truncate">{subjectName}</span>
      {location && <span className="text-xs text-muted-foreground truncate">{location}</span>}
    </div>
  );
};

export default TimetableSlot;
