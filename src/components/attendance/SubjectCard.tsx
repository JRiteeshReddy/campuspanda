
import { useState } from 'react';
import { Subject, AttendanceSuggestion } from '@/types';
import { supabase, handleError } from '@/lib/supabase';
import { Check, X, Loader2, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface SubjectCardProps {
  subject: Subject;
  onUpdate: () => void;
}

const SubjectCard = ({ subject, onUpdate }: SubjectCardProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [actionType, setActionType] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    name: subject.name,
    classes_attended: subject.classes_attended,
    classes_conducted: subject.classes_conducted,
    required_percentage: subject.required_percentage
  });
  
  const attendancePercentage = subject.classes_conducted > 0
    ? Math.round((subject.classes_attended / subject.classes_conducted) * 100 * 10) / 10
    : 0;
  
  const getAttendanceColor = (percentage: number, required: number) => {
    if (percentage >= required) return 'text-green-500 dark:text-green-400';
    return 'text-red-500 dark:text-red-400';
  };

  const getProgressColor = (percentage: number, required: number) => {
    if (percentage >= required) return 'bg-green-500';
    return 'bg-red-500';
  };
  
  const getSuggestion = (attended: number, conducted: number, required: number): AttendanceSuggestion => {
    const currentPercentage = conducted > 0 ? (attended / conducted) * 100 : 0;
    
    if (currentPercentage >= required) {
      // Can bunk classes
      let classesToBunk = 0;
      let simulatedAttended = attended;
      let simulatedConducted = conducted;
      
      while (true) {
        simulatedConducted += 1;
        const newPercentage = (simulatedAttended / simulatedConducted) * 100;
        if (newPercentage < required) break;
        classesToBunk += 1;
      }
      
      return { type: 'bunk', count: classesToBunk };
    } else {
      // Need to attend classes
      let classesToAttend = 0;
      let simulatedAttended = attended;
      let simulatedConducted = conducted;
      
      while (true) {
        simulatedAttended += 1;
        simulatedConducted += 1;
        const newPercentage = (simulatedAttended / simulatedConducted) * 100;
        classesToAttend += 1;
        if (newPercentage >= required) break;
      }
      
      return { type: 'attend', count: classesToAttend };
    }
  };
  
  const suggestion = getSuggestion(
    subject.classes_attended, 
    subject.classes_conducted, 
    subject.required_percentage
  );
  
  const markPresent = async () => {
    try {
      setLoading(true);
      setActionType('present');
      
      const { error } = await supabase
        .from('subjects')
        .update({
          classes_attended: subject.classes_attended + 1,
          classes_conducted: subject.classes_conducted + 1,
        })
        .eq('id', subject.id);
      
      if (error) throw error;
      
      toast.success(`Marked present for ${subject.name}`);
      onUpdate();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };
  
  const markAbsent = async () => {
    try {
      setLoading(true);
      setActionType('absent');
      
      const { error } = await supabase
        .from('subjects')
        .update({
          classes_conducted: subject.classes_conducted + 1,
        })
        .eq('id', subject.id);
      
      if (error) throw error;
      
      toast.success(`Marked absent for ${subject.name}`);
      onUpdate();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      setActionType('delete');
      
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', subject.id);
      
      if (error) throw error;
      
      toast.success(`Deleted ${subject.name}`);
      onUpdate();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  const handleEdit = async () => {
    try {
      setLoading(true);
      setActionType('edit');

      // Validate the inputs
      if (
        editValues.classes_attended > editValues.classes_conducted ||
        editValues.classes_attended < 0 ||
        editValues.classes_conducted < 0 ||
        editValues.required_percentage < 0 ||
        editValues.required_percentage > 100 ||
        !editValues.name.trim()
      ) {
        throw new Error('Please enter valid values');
      }
      
      const { error } = await supabase
        .from('subjects')
        .update({
          name: editValues.name,
          classes_attended: editValues.classes_attended,
          classes_conducted: editValues.classes_conducted,
          required_percentage: editValues.required_percentage
        })
        .eq('id', subject.id);
      
      if (error) throw error;
      
      toast.success(`Updated ${editValues.name}`);
      onUpdate();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditValues(prev => ({
      ...prev,
      [name]: name === 'name' ? value : parseInt(value) || 0
    }));
  };
  
  return (
    <div className="flex items-start justify-between p-4 bg-background hover:bg-muted/30 rounded-lg transition-colors">
      {/* Left side content */}
      <div className="flex flex-col">
        <h3 className="text-xl font-bold text-foreground mb-1">
          {subject.name.toLowerCase()}
        </h3>
        <div className="text-lg font-bold mb-1">
          {subject.classes_attended}/{subject.classes_conducted}
        </div>
        <div className="text-sm text-muted-foreground">
          {suggestion.type === 'bunk' ? (
            <span>On Track. May miss: {suggestion.count}</span>
          ) : (
            <span>Classes needed to attend: {suggestion.count}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-3">
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-7 px-2 text-xs"
            >
              <Edit size={14} className="mr-1" />
              Edit
            </Button>
          </DialogTrigger>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-7 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-100/10"
              >
                <Trash2 size={14} className="mr-1" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Subject</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p>Are you sure you want to delete <span className="font-medium">{subject.name}</span>? This action cannot be undone.</p>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  onClick={handleDelete} 
                  disabled={loading && actionType === 'delete'}
                  variant="destructive"
                >
                  {loading && actionType === 'delete' ? (
                    <Loader2 size={18} className="animate-spin mr-2" />
                  ) : null}
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Right side - circular progress and action buttons */}
      <div className="flex flex-col items-center">
        {/* Circular progress indicator */}
        <div className="relative h-24 w-24 mb-3">
          <div 
            className="absolute inset-0 rounded-full flex items-center justify-center border-4 border-muted"
            style={{
              background: `conic-gradient(
                ${attendancePercentage >= subject.required_percentage ? '#22c55e' : '#ef4444'} 
                ${attendancePercentage * 3.6}deg, 
                rgba(255, 255, 255, 0.1) 0
              )`
            }}
          >
            <div className="bg-background h-[80%] w-[80%] rounded-full flex items-center justify-center">
              <span className={cn("font-bold text-lg", getAttendanceColor(attendancePercentage, subject.required_percentage))}>
                {attendancePercentage}%
              </span>
            </div>
          </div>
        </div>
        
        {/* Attendance action buttons */}
        <div className="flex gap-2">
          <Button
            onClick={markPresent}
            disabled={loading}
            size="icon"
            className="h-9 w-9 bg-green-500 hover:bg-green-600"
          >
            {loading && actionType === 'present' ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Check size={16} />
            )}
          </Button>
          
          <Button
            onClick={markAbsent}
            disabled={loading}
            size="icon"
            className="h-9 w-9 bg-red-500 hover:bg-red-600"
          >
            {loading && actionType === 'absent' ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <X size={16} />
            )}
          </Button>
        </div>
      </div>
      
      {/* Edit Dialog */}
      <Dialog>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Subject Name</Label>
              <Input 
                id="name" 
                name="name"
                value={editValues.name} 
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="classes_attended">Classes Attended</Label>
              <Input 
                id="classes_attended" 
                name="classes_attended"
                type="number"
                min="0"
                max={editValues.classes_conducted}
                value={editValues.classes_attended} 
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="classes_conducted">Classes Conducted</Label>
              <Input 
                id="classes_conducted" 
                name="classes_conducted"
                type="number"
                min={editValues.classes_attended}
                value={editValues.classes_conducted} 
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="required_percentage">Required Percentage</Label>
              <Input 
                id="required_percentage" 
                name="required_percentage"
                type="number"
                min="0"
                max="100"
                value={editValues.required_percentage} 
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleEdit} 
              disabled={loading && actionType === 'edit'}
            >
              {loading && actionType === 'edit' ? (
                <Loader2 size={18} className="animate-spin mr-2" />
              ) : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubjectCard;
