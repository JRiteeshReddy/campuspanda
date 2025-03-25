
import React, { useState, useEffect } from 'react';
import { Subject } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash } from 'lucide-react';

interface TimetableEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
  selectedDay: string;
  selectedTime: string;
  currentSubjectId?: string;
  currentLocation?: string;
  currentNotes?: string;
  onSave: (data: { subject_id: string; location?: string; notes?: string }) => void;
  onDelete?: () => void;
}

const TimetableEntryDialog: React.FC<TimetableEntryDialogProps> = ({
  open,
  onOpenChange,
  subjects,
  selectedDay,
  selectedTime,
  currentSubjectId,
  currentLocation,
  currentNotes,
  onSave,
  onDelete,
}) => {
  const [subjectId, setSubjectId] = useState(currentSubjectId || '');
  const [location, setLocation] = useState(currentLocation || '');
  const [notes, setNotes] = useState(currentNotes || '');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Reset form values when the dialog opens with new data
  useEffect(() => {
    if (open) {
      setSubjectId(currentSubjectId || '');
      setLocation(currentLocation || '');
      setNotes(currentNotes || '');
    }
  }, [open, currentSubjectId, currentLocation, currentNotes]);

  const handleSave = () => {
    if (!subjectId) {
      return;
    }
    
    onSave({
      subject_id: subjectId,
      location: location || undefined,
      notes: notes || undefined,
    });
  };

  const isDirty = () => {
    return (
      subjectId !== (currentSubjectId || '') ||
      location !== (currentLocation || '') ||
      notes !== (currentNotes || '')
    );
  };

  const hasRequiredFields = () => {
    return !!subjectId;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {currentSubjectId ? 'Edit Class Entry' : 'Add New Class Entry'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="day-time">Day & Time</Label>
              <div id="day-time" className="text-sm text-muted-foreground">
                {selectedDay}, {selectedTime}
              </div>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="subject">Subject *</Label>
              <Select 
                value={subjectId} 
                onValueChange={setSubjectId}
              >
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {subjects.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Please add subjects in the Attendance Tracker to use them here.
                </p>
              )}
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="location" className="flex items-center">
                Classroom / Location <span className="text-xs text-muted-foreground ml-1">(optional)</span>
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Room 101"
              />
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="notes" className="flex items-center">
                Notes <span className="text-xs text-muted-foreground ml-1">(optional)</span>
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional information about this class"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <div>
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  type="button"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleSave}
                disabled={!hasRequiredFields() || !isDirty()}
              >
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      {onDelete && (
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove this class from your timetable. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
};

export default TimetableEntryDialog;
