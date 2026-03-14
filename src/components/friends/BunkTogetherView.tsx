import { useState, useEffect } from 'react';
import { supabase, handleError } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, PartyPopper, X } from 'lucide-react';

interface SubjectData {
  id: string;
  name: string;
  classes_attended: number;
  classes_conducted: number;
  required_percentage: number;
}

interface TimetableEntry {
  day_of_week: string;
  start_time: string;
  end_time: string;
  subject_id: string | null;
}

interface BunkableSlot {
  time: string;
  mySubject: string;
  friendSubject: string;
  myAttendanceAfter: string;
  friendAttendanceAfter: string;
}

interface BunkTogetherViewProps {
  friendUserId: string;
  friendName: string;
  onClose: () => void;
}

const getDayName = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
};

const canBunk = (attended: number, conducted: number, required: number): boolean => {
  if (conducted === 0) return false;
  // After missing one more class: attended / (conducted + 1)
  const newPct = (attended / (conducted + 1)) * 100;
  return newPct >= required;
};

const BunkTogetherView = ({ friendUserId, friendName, onClose }: BunkTogetherViewProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bunkableSlots, setBunkableSlots] = useState<BunkableSlot[]>([]);
  const today = getDayName();

  useEffect(() => {
    if (user) calculateBunkableSlots();
  }, [user, friendUserId]);

  const calculateBunkableSlots = async () => {
    if (!user) return;
    try {
      setLoading(true);

      // Fetch both users' timetable and subjects in parallel
      const [myTimetable, friendTimetable, mySubjects, friendSubjects] = await Promise.all([
        supabase.from('timetable').select('day_of_week, start_time, end_time, subject_id').eq('user_id', user.id).eq('day_of_week', today),
        supabase.from('timetable').select('day_of_week, start_time, end_time, subject_id').eq('user_id', friendUserId).eq('day_of_week', today),
        supabase.from('subjects').select('id, name, classes_attended, classes_conducted, required_percentage').eq('user_id', user.id),
        supabase.from('subjects').select('id, name, classes_attended, classes_conducted, required_percentage').eq('user_id', friendUserId),
      ]);

      if (myTimetable.error) throw myTimetable.error;
      if (friendTimetable.error) throw friendTimetable.error;
      if (mySubjects.error) throw mySubjects.error;
      if (friendSubjects.error) throw friendSubjects.error;

      const mySubjectMap = new Map<string, SubjectData>((mySubjects.data || []).map(s => [s.id, s]));
      const friendSubjectMap = new Map<string, SubjectData>((friendSubjects.data || []).map(s => [s.id, s]));

      const normalize = (t: string) => t.substring(0, 5);
      const slots: BunkableSlot[] = [];

      for (const myEntry of (myTimetable.data || [])) {
        if (!myEntry.subject_id) continue;
        const mySubject = mySubjectMap.get(myEntry.subject_id);
        if (!mySubject) continue;

        // Find friend's entry at the same time
        const friendEntry = (friendTimetable.data || []).find(
          fe => fe.subject_id && normalize(fe.start_time) === normalize(myEntry.start_time) && normalize(fe.end_time) === normalize(myEntry.end_time)
        );
        if (!friendEntry || !friendEntry.subject_id) continue;

        const friendSubject = friendSubjectMap.get(friendEntry.subject_id);
        if (!friendSubject) continue;

        // Check if both can bunk
        const iCanBunk = canBunk(mySubject.classes_attended, mySubject.classes_conducted, mySubject.required_percentage);
        const friendCanBunk = canBunk(friendSubject.classes_attended, friendSubject.classes_conducted, friendSubject.required_percentage);

        if (iCanBunk && friendCanBunk) {
          const myNewPct = (mySubject.classes_attended / (mySubject.classes_conducted + 1)) * 100;
          const friendNewPct = (friendSubject.classes_attended / (friendSubject.classes_conducted + 1)) * 100;

          const startH = parseInt(normalize(myEntry.start_time).split(':')[0]);
          const period = startH >= 12 ? 'PM' : 'AM';
          const displayH = startH > 12 ? startH - 12 : startH === 0 ? 12 : startH;

          slots.push({
            time: `${displayH}:00 ${period}`,
            mySubject: mySubject.name,
            friendSubject: friendSubject.name,
            myAttendanceAfter: myNewPct.toFixed(1) + '%',
            friendAttendanceAfter: friendNewPct.toFixed(1) + '%',
          });
        }
      }

      setBunkableSlots(slots);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="mt-4">
        <CardContent className="flex justify-center py-6">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <PartyPopper size={18} />
          Bunk Together — {today}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X size={14} />
        </Button>
      </CardHeader>
      <CardContent>
        {bunkableSlots.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No common bunkable classes today. Either schedules don't overlap or attendance is too low to skip.
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Classes you and {friendName} can both safely skip today:
            </p>
            {bunkableSlots.map((slot, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-green-500/10 dark:bg-green-500/15">
                <div className="text-sm font-bold text-green-600 dark:text-green-400 min-w-[70px]">
                  {slot.time}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-foreground">You: <span className="font-medium">{slot.mySubject}</span></span>
                    <span className="text-muted-foreground">→ {slot.myAttendanceAfter}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-foreground">{friendName}: <span className="font-medium">{slot.friendSubject}</span></span>
                    <span className="text-muted-foreground">→ {slot.friendAttendanceAfter}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BunkTogetherView;
