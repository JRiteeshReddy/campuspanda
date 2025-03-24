
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Subject } from '@/types';
import { CalendarDays } from 'lucide-react';

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

const BunkTableDialog: React.FC<BunkTableDialogProps> = ({
  open,
  onOpenChange,
  bunkableSubjects,
  todayClasses,
  currentDay,
}) => {
  const getDayDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md md:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Bunk Table for {currentDay} ({getDayDate()})
          </DialogTitle>
          <DialogDescription>
            Based on your current attendance, here are the classes you can safely skip today.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {todayClasses.length > 0 ? (
            <div>
              <h3 className="text-sm font-medium mb-2">Today's Classes</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayClasses.map((cls) => (
                    <TableRow key={`${cls.subjectId}-${cls.time}`}>
                      <TableCell className="font-medium">{cls.name}</TableCell>
                      <TableCell>{cls.time}</TableCell>
                      <TableCell>
                        <span 
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            cls.canBunk 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {cls.canBunk ? 'Can Skip' : 'Should Attend'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No classes scheduled for today
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium mb-2">Bunkable Classes Overview</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Current %</TableHead>
                  <TableHead>Required %</TableHead>
                  <TableHead>Can Skip</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bunkableSubjects.map((subject) => (
                  <TableRow key={subject.subjectId}>
                    <TableCell className="font-medium">{subject.name}</TableCell>
                    <TableCell>{subject.currentAttendance.toFixed(1)}%</TableCell>
                    <TableCell>{subject.requiredAttendance}%</TableCell>
                    <TableCell>{subject.bunkableClasses}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BunkTableDialog;
