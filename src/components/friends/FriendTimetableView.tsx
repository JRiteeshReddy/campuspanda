import { useState, useEffect } from 'react';
import { supabase, handleError } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, X, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import BunkTogetherView from './BunkTogetherView';

interface TimetableEntry {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  subject_id: string;
  location?: string;
}

interface SubjectData {
  id: string;
  name: string;
  classes_attended: number;
  classes_conducted: number;
  required_percentage: number;
}

interface FriendTimetableViewProps {
  friendUserId: string;
  friendName: string;
  onClose: () => void;
}

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

const FriendTimetableView = ({ friendUserId, friendName, onClose }: FriendTimetableViewProps) => {
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);

  useEffect(() => {
    fetchFriendData();
  }, [friendUserId]);

  const fetchFriendData = async () => {
    try {
      setLoading(true);
      const [timetableRes, subjectsRes] = await Promise.all([
        supabase.from('timetable').select('*').eq('user_id', friendUserId),
        supabase.from('subjects').select('id, name, classes_attended, classes_conducted, required_percentage').eq('user_id', friendUserId),
      ]);

      if (timetableRes.error) throw timetableRes.error;
      if (subjectsRes.error) throw subjectsRes.error;

      setEntries(timetableRes.data || []);
      setSubjects(subjectsRes.data || []);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const normalizeTime = (time: string) => time.substring(0, 5);

  const getSlotEntry = (day: string, startTime: string, endTime: string) =>
    entries.find(
      e => e.day_of_week === day &&
        normalizeTime(e.start_time) === normalizeTime(startTime) &&
        normalizeTime(e.end_time) === normalizeTime(endTime)
    );

  const getSubject = (id: string) => subjects.find(s => s.id === id);

  const getAttendanceStatus = (subjectId: string): 'good' | 'bad' | 'unknown' => {
    const s = getSubject(subjectId);
    if (!s || s.classes_conducted === 0) return 'unknown';
    const pct = (s.classes_attended / s.classes_conducted) * 100;
    return pct >= s.required_percentage ? 'good' : 'bad';
  };

  const getAttendancePct = (subjectId: string): string => {
    const s = getSubject(subjectId);
    if (!s || s.classes_conducted === 0) return '0%';
    return ((s.classes_attended / s.classes_conducted) * 100).toFixed(1) + '%';
  };

  if (loading) {
    return (
      <Card className="mt-6">
        <CardContent className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">{friendName}'s Timetable</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X size={16} />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {/* Subject attendance summary */}
        {subjects.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pb-3">
            {subjects.map(s => {
              const pct = s.classes_conducted > 0 ? (s.classes_attended / s.classes_conducted) * 100 : 0;
              const isGood = pct >= s.required_percentage;
              return (
                <span
                  key={s.id}
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    isGood
                      ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                      : 'bg-red-500/15 text-red-600 dark:text-red-400'
                  }`}
                >
                  {s.name}: {pct.toFixed(1)}% ({s.classes_attended}/{s.classes_conducted})
                </span>
              );
            })}
          </div>
        )}

        {entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground px-4">
            This friend hasn't set up their timetable yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse table-fixed">
              <thead>
                <tr className="bg-muted/50 dark:bg-muted/20">
                  <th className={`border border-border font-medium text-muted-foreground ${isMobile ? 'p-0.5 text-[10px] w-10' : 'p-2 text-sm w-20'}`}>Day</th>
                  {timeSlots.map(slot => (
                    <th key={slot.start} className={`border border-border text-center font-medium text-muted-foreground ${isMobile ? 'p-0.5 text-[10px]' : 'p-2 text-sm'}`}>
                      {isMobile ? slot.label.replace(' AM', 'A').replace(' PM', 'P') : slot.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {daysOfWeek.map(day => (
                  <tr key={day} className="hover:bg-muted/30 dark:hover:bg-muted/10">
                    <td className={`border border-border font-medium ${isMobile ? 'p-0.5 text-[10px]' : 'p-2 text-sm'}`}>
                      {isMobile ? day.substring(0, 3) : day}
                    </td>
                    {timeSlots.map(slot => {
                      const entry = getSlotEntry(day, slot.start, slot.end);
                      if (!entry || !entry.subject_id) {
                        return (
                          <td key={`${day}-${slot.start}`} className={`border border-border p-0 ${isMobile ? 'h-10' : 'h-16'}`}>
                            <div className="w-full h-full" />
                          </td>
                        );
                      }

                      const status = getAttendanceStatus(entry.subject_id);
                      const subject = getSubject(entry.subject_id);
                      const bgClass = status === 'good'
                        ? 'bg-green-500/20 dark:bg-green-500/30'
                        : status === 'bad'
                        ? 'bg-red-500/20 dark:bg-red-500/30'
                        : 'bg-primary/10 dark:bg-primary/20';
                      const textClass = status === 'good'
                        ? 'text-green-700 dark:text-green-400'
                        : status === 'bad'
                        ? 'text-red-700 dark:text-red-400'
                        : 'text-foreground';

                      return (
                        <td key={`${day}-${slot.start}`} className={`border border-border p-0 ${isMobile ? 'h-10' : 'h-16'}`}>
                          <div className={`w-full h-full flex flex-col ${bgClass} ${isMobile ? 'p-0.5' : 'p-1'}`}>
                            <span className={`truncate font-bold ${textClass} ${isMobile ? 'text-[7px] leading-tight' : 'text-xs'}`}>
                              {subject?.name || 'Unknown'}
                            </span>
                            <span className={`text-muted-foreground truncate ${isMobile ? 'text-[6px] leading-tight' : 'text-[10px]'}`}>
                              {getAttendancePct(entry.subject_id)}
                            </span>
                            {entry.location && (
                              <span className={`text-muted-foreground truncate ${isMobile ? 'text-[6px] leading-tight' : 'text-[10px]'}`}>
                                {entry.location}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FriendTimetableView;
