import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase, handleError } from '@/lib/supabase';
import { Subject } from '@/types';
import { toast } from 'sonner';
import TimetableSlot from './TimetableSlot';
import TimetableEntryDialog from './TimetableEntryDialog';
import { Card, CardContent } from '@/components/ui/card';

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

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    { start: '08:00', end: '09:00', label: '8 AM - 9 AM' },
    { start: '09:00', end: '10:00', label: '9 AM - 10 AM' },
    { start: '10:00', end: '11:00', label: '10 AM - 11 AM' },
    { start: '11:00', end: '12:00', label: '11 AM - 12 PM' },
    { start: '12:00', end: '13:00', label: '12 PM - 1 PM' },
    { start: '13:00', end: '14:00', label: '1 PM - 2 PM' },
    { start: '14:00', end: '15:00', label: '2 PM - 3 PM' },
    { start: '15:00', end: '16:00', label: '3 PM - 4 PM' },
    { start: '16:00', end: '17:00', label: '4 PM - 5 PM' },
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

  return (
    <div className="mb-6">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50 dark:bg-muted/20">
                  <th className="border border-border p-3 text-left font-medium text-muted-foreground w-24">Time</th>
                  {daysOfWeek.map(day => (
                    <th key={day} className="border border-border p-3 text-center font-medium text-muted-foreground">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(slot => (
                  <tr key={slot.start} className="hover:bg-muted/30 dark:hover:bg-muted/10">
                    <td className="border border-border p-3 text-sm font-medium">
                      {slot.label}
                    </td>
                    {daysOfWeek.map(day => {
                      const entry = getSlotEntry(day, slot.start, slot.end);
                      
                      return (
                        <td 
                          key={`${day}-${slot.start}`} 
                          className="border border-border p-0 h-20"
                          onClick={() => handleOpenDialog(day, slot.start, slot.end)}
                        >
                          <TimetableSlot
                            entry={entry}
                            subjectName={entry ? getSubjectName(entry.subject_id) : ''}
                            location={entry?.location}
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
    </div>
  );
};

export default TimetableGrid;
