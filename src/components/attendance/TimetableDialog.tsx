import { Subject } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import TimetableGrid from '@/components/timetable/TimetableGrid';

interface TimetableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
}

const TimetableDialog = ({ open, onOpenChange, subjects }: TimetableDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Weekly Timetable</DialogTitle>
        </DialogHeader>
        <TimetableGrid subjects={subjects} />
      </DialogContent>
    </Dialog>
  );
};

export default TimetableDialog;
