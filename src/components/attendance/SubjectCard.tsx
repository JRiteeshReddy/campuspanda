
import { useState } from 'react';
import { Subject, AttendanceSuggestion } from '@/types';
import { supabase, handleError } from '@/lib/supabase';
import { 
  PlusCircle, 
  MinusCircle, 
  AlertTriangle, 
  Check, 
  Info, 
  Loader2 
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

interface SubjectCardProps {
  subject: Subject;
  onUpdate: () => void;
}

const SubjectCard = ({ subject, onUpdate }: SubjectCardProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [actionType, setActionType] = useState<string | null>(null);
  
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
      
      <CardFooter className="flex justify-between">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={markPresent}
                disabled={loading}
                variant="outline" 
                className="w-1/2 mr-2 border-apple-green hover:bg-apple-green/10 text-apple-green hover:text-apple-green"
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
                className="w-1/2 border-apple-red hover:bg-apple-red/10 text-apple-red hover:text-apple-red"
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
      </CardFooter>
    </Card>
  );
};

export default SubjectCard;
