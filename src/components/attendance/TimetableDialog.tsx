import { Subject } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import TimetableGrid from '@/components/timetable/TimetableGrid';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TimetableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
}

const TimetableDialog = ({ open, onOpenChange, subjects }: TimetableDialogProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle>Weekly Timetable</DrawerTitle>
          </DrawerHeader>
          <ScrollArea className="px-2 pb-4 overflow-y-auto max-h-[75vh]">
            <div className="overflow-x-auto">
              <TimetableGrid subjects={subjects} />
            </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    );
  }

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
