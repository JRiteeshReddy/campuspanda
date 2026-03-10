
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Subject } from '@/types';
import { CalendarDays } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BunkTableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bunkableSubjects: {
    subjectId: string;
    name: string;
    bunkableClasses: number;
    currentAttendance: number;
    requiredAttendance: number;
  }[];
  todayClasses: {
    subjectId: string;
    name: string;
    time: string;
    canBunk: boolean;
  }[];
  currentDay: string;
}

const BunkTableContent: React.FC<Omit<BunkTableDialogProps, 'open' | 'onOpenChange'>> = ({
  bunkableSubjects,
  todayClasses,
  currentDay,
}) => {
  const getDayDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-5 pb-4">
      {/* Today's Classes - Horizontal scrollable cards */}
      {todayClasses.length > 0 ? (
        <div>
          <h3 className="text-sm font-medium mb-3 px-1">Today's Classes — {currentDay}, {getDayDate()}</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 px-1 snap-x snap-mandatory">
            {todayClasses.map((cls) => (
              <div
                key={`${cls.subjectId}-${cls.time}`}
                className={`flex-shrink-0 snap-start rounded-xl border p-3 min-w-[160px] space-y-1.5 ${
                  cls.canBunk
                    ? 'border-green-500/30 bg-green-500/5'
                    : 'border-red-500/30 bg-red-500/5'
                }`}
              >
                <p className="font-semibold text-sm truncate">{cls.name}</p>
                <p className="text-xs text-muted-foreground">{cls.time}</p>
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    cls.canBunk
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {cls.canBunk ? 'Can Skip' : 'Attend'}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground text-sm">
          No classes scheduled for today
        </div>
      )}

      {/* Bunkable Overview - Horizontal scrollable cards */}
      <div>
        <h3 className="text-sm font-medium mb-3 px-1">Bunkable Classes Overview</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 px-1 snap-x snap-mandatory">
          {bunkableSubjects.map((subject) => (
            <div
              key={subject.subjectId}
              className={`flex-shrink-0 snap-start rounded-xl border p-3 min-w-[150px] space-y-1 ${
                subject.bunkableClasses > 0
                  ? 'border-green-500/20 bg-green-500/5'
                  : 'border-red-500/20 bg-red-500/5'
              }`}
            >
              <p className="font-semibold text-sm truncate">{subject.name}</p>
              <p className="text-xs text-muted-foreground">
                {subject.currentAttendance.toFixed(1)}% / {subject.requiredAttendance}%
              </p>
              <p className={`text-lg font-bold ${subject.bunkableClasses > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {subject.bunkableClasses} <span className="text-xs font-normal text-muted-foreground">skippable</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BunkTableDialog: React.FC<BunkTableDialogProps> = ({
  open,
  onOpenChange,
  bunkableSubjects,
  todayClasses,
  currentDay,
}) => {
  const isMobile = useIsMobile();

  const contentProps = { bunkableSubjects, todayClasses, currentDay };

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Bunk Table
            </DrawerTitle>
            <DrawerDescription>Classes you can safely skip today.</DrawerDescription>
          </DrawerHeader>
          <ScrollArea className="px-4 overflow-y-auto max-h-[65vh]">
            <BunkTableContent {...contentProps} />
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Bunk Table
          </DialogTitle>
          <DialogDescription>Classes you can safely skip today.</DialogDescription>
        </DialogHeader>
        <BunkTableContent {...contentProps} />
      </DialogContent>
    </Dialog>
  );
};

export default BunkTableDialog;
