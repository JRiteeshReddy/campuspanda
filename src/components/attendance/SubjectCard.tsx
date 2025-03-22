
import { useState } from 'react';
import { Subject, AttendanceSuggestion } from '@/types';
import { supabase, handleError } from '@/lib/supabase';
import { 
  PlusCircle, 
  MinusCircle, 
  AlertTriangle, 
  Check, 
  Info, 
  Loader2,
  Trash2,
  Edit,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    ? Math.round((subject.classes_attended / subject.classes_conducted) * 100)
    : 0;
  
  const getAttendanceColor = (percentage: number, required: number) => {
    if (percentage >= required) return 'text-apple-green';
    if (percentage >= required - 10) return 'text-apple-yellow';
    return 'text-apple-red';
  };
  
  const getSuggestion = (attended: number, conducted: number, required: number): AttendanceSuggestion => {
    const currentPercentage = conducted > 0 ? (attended / conducted) * 100 : 0;
    
    if (currentPercentage >= required) {
      // Can bunk classes
      // Calculate how many consecutive classes can be bunked while maintaining req %
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
      // Calculate how many consecutive classes need to be attended to reach req %
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
    <Card className="card-hover border h-full overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="font-medium flex justify-between items-start gap-2 text-xl">
          <span className="truncate">{subject.name}</span>
          <span 
            className={`text-base rounded-full px-3 py-1 ${
              getAttendanceColor(attendancePercentage, subject.required_percentage)
            } bg-opacity-10 font-medium`}
          >
            {attendancePercentage}%
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Attended:</span>
          <span className="font-medium">{subject.classes_attended}/{subject.classes_conducted}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Required:</span>
          <span className="font-medium">{subject.required_percentage}%</span>
        </div>
        
        <div className="mt-4 p-3 rounded-lg bg-muted text-sm flex items-start gap-2">
          {suggestion.type === 'bunk' ? (
            <>
              <Check size={18} className="text-apple-green shrink-0 mt-0.5" />
              <span>
                You can <span className="font-medium">miss {suggestion.count}</span> more {suggestion.count === 1 ? 'class' : 'classes'} and still meet the required attendance.
              </span>
            </>
          ) : (
            <>
              <AlertTriangle size={18} className="text-apple-yellow shrink-0 mt-0.5" />
              <span>
                You need to attend <span className="font-medium">at least {suggestion.count}</span> more consecutive {suggestion.count === 1 ? 'class' : 'classes'} to meet the requirement.
              </span>
            </>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between flex-wrap gap-2">
        <div className="flex gap-2 w-full">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={markPresent}
                  disabled={loading}
                  variant="outline" 
                  className="flex-1 border-apple-green hover:bg-apple-green/10 text-apple-green hover:text-apple-green"
                >
                  {loading && actionType === 'present' ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <PlusCircle size={18} />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mark as Present</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={markAbsent}
                  disabled={loading}
                  variant="outline" 
                  className="flex-1 border-apple-red hover:bg-apple-red/10 text-apple-red hover:text-apple-red"
                >
                  {loading && actionType === 'absent' ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <MinusCircle size={18} />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mark as Absent</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex gap-2 w-full">
          {/* Edit Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline"
                className="flex-1 border-apple-blue hover:bg-apple-blue/10 text-apple-blue hover:text-apple-blue"
              >
                <Edit size={18} />
              </Button>
            </DialogTrigger>
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

          {/* Delete Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline"
                className="flex-1 border-apple-red hover:bg-apple-red/10 text-apple-red hover:text-apple-red"
              >
                <Trash2 size={18} />
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
      </CardFooter>
    </Card>
  );
};

export default SubjectCard;
