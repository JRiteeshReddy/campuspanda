
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase, handleError } from '@/lib/supabase';
import { Subject } from '@/types';
import { toast } from 'sonner';
import TimetableSlot from './TimetableSlot';
import TimetableEntryDialog from './TimetableEntryDialog';
import BunkTableDialog from './BunkTableDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays } from 'lucide-react';

interface TimetableEntry {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  subject_id: string;
  location?: string;
  notes?: string;
}

interface TimetableGridProps {
  subjects: Subject[];
}

const TimetableGrid = ({ subjects }: TimetableGridProps) => {
  const { user } = useAuth();
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<{
    day: string;
    startTime: string;
    endTime: string;
    entry?: TimetableEntry;
  } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bunkTableOpen, setBunkTableOpen] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    { start: '08:00', end: '09:00', label: '8 AM' },
    { start: '09:00', end: '10:00', label: '9 AM' },
    { start: '10:00', end: '11:00', label: '10 AM' },
    { start: '11:00', end: '12:00', label: '11 AM' },
    { start: '12:00', end: '13:00', label: '12 PM' },
    { start: '13:00', end: '14:00', label: '1 PM' },
    { start: '14:00', end: '15:00', label: '2 PM' },
    { start: '15:00', end: '16:00', label: '3 PM' },
    { start: '16:00', end: '17:00', label: '4 PM' },
  ];

  useEffect(() => {
    if (user) {
      fetchTimetableEntries();
    }
  }, [user]);

  const fetchTimetableEntries = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('timetable')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setTimetableEntries(data || []);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (day: string, startTime: string, endTime: string) => {
    const existingEntry = timetableEntries.find(
      entry => entry.day_of_week === day && entry.start_time === startTime && entry.end_time === endTime
    );
    
    setSelectedSlot({ 
      day, 
      startTime, 
      endTime, 
      entry: existingEntry 
    });
    setDialogOpen(true);
  };

  const handleSaveEntry = async (data: {
    subject_id: string;
    location?: string;
    notes?: string;
  }) => {
    if (!user || !selectedSlot) return;
    
    try {
      // If there's an existing entry, update it
      if (selectedSlot.entry) {
        const { error } = await supabase
          .from('timetable')
          .update({
            subject_id: data.subject_id,
            location: data.location || null,
            notes: data.notes || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedSlot.entry.id);
        
        if (error) throw error;
        
        toast.success('Timetable entry updated');
      } else {
        // Otherwise, create a new entry
        const { error } = await supabase
          .from('timetable')
          .insert({
            user_id: user.id,
            day_of_week: selectedSlot.day,
            start_time: selectedSlot.startTime,
            end_time: selectedSlot.endTime,
            subject_id: data.subject_id,
            location: data.location || null,
            notes: data.notes || null
          });
        
        if (error) throw error;
        
        toast.success('Timetable entry added');
      }
      
      // Refresh timetable entries
      fetchTimetableEntries();
      setDialogOpen(false);
    } catch (error) {
      handleError(error);
    }
  };

  const handleDeleteEntry = async () => {
    if (!selectedSlot?.entry) return;
    
    try {
      const { error } = await supabase
        .from('timetable')
        .delete()
        .eq('id', selectedSlot.entry.id);
      
      if (error) throw error;
      
      toast.success('Timetable entry removed');
      fetchTimetableEntries();
      setDialogOpen(false);
    } catch (error) {
      handleError(error);
    }
  };

  // Function to get the subject name by ID
  const getSubjectName = (subjectId: string): string => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown Subject';
  };

  // Function to determine if a slot has an entry
  const getSlotEntry = (day: string, startTime: string, endTime: string): TimetableEntry | undefined => {
    return timetableEntries.find(
      entry => entry.day_of_week === day && entry.start_time === startTime && entry.end_time === endTime
    );
  };

  // Function to calculate attendance status for color coding
  const getAttendanceStatus = (subjectId: string): 'good' | 'bad' | 'unknown' => {
    const subject = subjects.find(s => s.id === subjectId);
    
    if (!subject) return 'unknown';
    
    const attendancePercentage = subject.classes_conducted > 0 
      ? (subject.classes_attended / subject.classes_conducted) * 100 
      : 0;
    
    if (attendancePercentage >= subject.required_percentage) {
      return 'good'; // Above required percentage
    } else {
      return 'bad'; // Below required percentage
    }
  };

  // Calculate current day of the week
  const getCurrentDay = (): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayIndex = new Date().getDay();
    
    // If it's Sunday, return Monday as the default view
    return currentDayIndex === 0 ? 'Monday' : days[currentDayIndex];
  };

  // Calculate how many classes can be safely skipped for a subject
  const calculateBunkableClasses = (subject: Subject): number => {
    if (subject.classes_conducted === 0) return 0;
    
    const currentAttendance = subject.classes_attended;
    const currentTotal = subject.classes_conducted;
    const requiredPercentage = subject.required_percentage;
    
    // Calculate how many classes can be missed while maintaining required percentage
    let bunkableClasses = 0;
    let tempTotal = currentTotal;
    let tempAttendance = currentAttendance;
    
    while (true) {
      const nextPercentage = (tempAttendance / (tempTotal + 1)) * 100;
      if (nextPercentage < requiredPercentage) break;
      
      tempTotal += 1;
      bunkableClasses += 1;
    }
    
    return bunkableClasses;
  };

  // Get today's classes and their bunkable status
  const getTodayClasses = () => {
    const currentDay = getCurrentDay();
    const todayEntries = timetableEntries.filter(entry => entry.day_of_week === currentDay);
    
    return todayEntries.map(entry => {
      const subject = subjects.find(s => s.id === entry.subject_id);
      if (!subject) return null;
      
      const formattedTime = `${formatTime(entry.start_time)} - ${formatTime(entry.end_time)}`;
      const canBunk = getAttendanceStatus(entry.subject_id) === 'good';
      
      return {
        subjectId: entry.subject_id,
        name: getSubjectName(entry.subject_id),
        time: formattedTime,
        canBunk
      };
    }).filter(Boolean) as {
      subjectId: string;
      name: string;
      time: string;
      canBunk: boolean;
    }[];
  };

  // Format time for display
  const formatTime = (time: string): string => {
    const [hour] = time.split(':');
    const hourNum = parseInt(hour, 10);
    return hourNum > 12 ? `${hourNum - 12} PM` : `${hourNum} ${hourNum === 12 ? 'PM' : 'AM'}`;
  };

  // Get bunkable subjects data
  const getBunkableSubjectsData = () => {
    return subjects.map(subject => {
      const attendancePercentage = subject.classes_conducted > 0 
        ? (subject.classes_attended / subject.classes_conducted) * 100 
        : 0;
      
      return {
        subjectId: subject.id,
        name: subject.name,
        bunkableClasses: calculateBunkableClasses(subject),
        currentAttendance: attendancePercentage,
        requiredAttendance: subject.required_percentage
      };
    });
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Weekly Schedule</h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={() => setBunkTableOpen(true)}
        >
          <CalendarDays className="h-4 w-4" />
          Bunk Table
        </Button>
      </div>
      
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50 dark:bg-muted/20">
                  <th className="border border-border p-2 text-left font-medium text-muted-foreground w-20">Day</th>
                  {timeSlots.map(slot => (
                    <th key={slot.start} className="border border-border p-2 text-center font-medium text-muted-foreground w-16">
                      {slot.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {daysOfWeek.map(day => (
                  <tr key={day} className="hover:bg-muted/30 dark:hover:bg-muted/10">
                    <td className="border border-border p-2 text-sm font-medium">
                      {day}
                    </td>
                    {timeSlots.map(slot => {
                      const entry = getSlotEntry(day, slot.start, slot.end);
                      const attendanceStatus = entry?.subject_id 
                        ? getAttendanceStatus(entry.subject_id) 
                        : 'unknown';
                      
                      return (
                        <td 
                          key={`${day}-${slot.start}`} 
                          className="border border-border p-0 h-16 w-16"
                          onClick={() => handleOpenDialog(day, slot.start, slot.end)}
                        >
                          <TimetableSlot
                            entry={entry}
                            subjectName={entry ? getSubjectName(entry.subject_id) : ''}
                            location={entry?.location}
                            attendanceStatus={attendanceStatus}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {selectedSlot && (
        <TimetableEntryDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          subjects={subjects}
          selectedDay={selectedSlot.day}
          selectedTime={`${selectedSlot.startTime} - ${selectedSlot.endTime}`}
          currentSubjectId={selectedSlot.entry?.subject_id}
          currentLocation={selectedSlot.entry?.location}
          currentNotes={selectedSlot.entry?.notes}
          onSave={handleSaveEntry}
          onDelete={selectedSlot.entry ? handleDeleteEntry : undefined}
        />
      )}

      <BunkTableDialog
        open={bunkTableOpen}
        onOpenChange={setBunkTableOpen}
        bunkableSubjects={getBunkableSubjectsData()}
        todayClasses={getTodayClasses()}
        currentDay={getCurrentDay()}
      />
    </div>
  );
};

export default TimetableGrid;
