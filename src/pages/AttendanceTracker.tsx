import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase, handleError } from '@/lib/supabase';
import { Subject } from '@/types';
import Navbar from '@/components/layout/Navbar';
import SubjectCard from '@/components/attendance/SubjectCard';
import NewSubjectForm from '@/components/attendance/NewSubjectForm';
import AdSection from '@/components/layout/AdSection';
import TimetableDialog from '@/components/attendance/TimetableDialog';
import { Loader2, CalendarPlus } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface TimetableEntry {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  subject_id: string;
  location?: string;
}
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';

const AttendanceTracker = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [timetableDialogOpen, setTimetableDialogOpen] = useState(false);
  const [showTimetableOnly, setShowTimetableOnly] = useState(false);
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    } else if (user) {
      fetchSubjects();
      fetchTimetableEntries();
    }
  }, [user, authLoading, navigate]);

  const fetchTimetableEntries = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('timetable')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      setTimetableEntries(data || []);
    } catch (error) {
      handleError(error);
    }
  };

  // Get current day of the week
  const getCurrentDay = (): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  // Get today's subject IDs from timetable
  const getTodaySubjectIds = (): string[] => {
    const currentDay = getCurrentDay();
    const todayEntries = timetableEntries.filter(entry => entry.day_of_week === currentDay);
    return [...new Set(todayEntries.map(entry => entry.subject_id))];
  };

  // Get today's timetable entries sorted by time
  const getTodaySortedEntries = () => {
    const currentDay = getCurrentDay();
    return timetableEntries
      .filter(entry => entry.day_of_week === currentDay)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  // Get location for a subject from today's timetable
  const getSubjectLocation = (subjectId: string): string | undefined => {
    const currentDay = getCurrentDay();
    const entry = timetableEntries.find(
      e => e.day_of_week === currentDay && e.subject_id === subjectId
    );
    return entry?.location;
  };

  // Get timing for a subject from today's timetable
  const getSubjectTiming = (subjectId: string): string | undefined => {
    const currentDay = getCurrentDay();
    const entry = timetableEntries.find(
      e => e.day_of_week === currentDay && e.subject_id === subjectId
    );
    if (!entry) return undefined;
    
    const formatTime = (time: string): string => {
      const [hour] = time.split(':');
      const hourNum = parseInt(hour, 10);
      return hourNum > 12 ? `${hourNum - 12} PM` : `${hourNum} ${hourNum === 12 ? 'PM' : 'AM'}`;
    };
    
    return `${formatTime(entry.start_time)} - ${formatTime(entry.end_time)}`;
  };

  // Filter and sort subjects based on toggle
  const filteredSubjects = showTimetableOnly
    ? getTodaySortedEntries()
        .map(entry => subjects.find(s => s.id === entry.subject_id))
        .filter((s): s is Subject => s !== undefined)
    : subjects;

  const fetchSubjects = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setSubjects(data || []);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle subject deletion
  const handleDeleteSubject = (id: string) => {
    setSubjects(subjects.filter(subject => subject.id !== id));
  };

  // Calculate overall attendance percentage
  const calculateOverallAttendance = () => {
    if (subjects.length === 0) return 0;
    
    const totalAttended = subjects.reduce((sum, subject) => sum + subject.classes_attended, 0);
    const totalConducted = subjects.reduce((sum, subject) => sum + subject.classes_conducted, 0);
    
    return totalConducted > 0 ? parseFloat(((totalAttended / totalConducted) * 100).toFixed(1)) : 0;
  };

  const overallAttendance = calculateOverallAttendance();
  
  // Prepare data for pie chart
  const chartData = [
    { name: 'Attended', value: overallAttendance },
    { name: 'Missed', value: 100 - overallAttendance },
  ];
  
  const COLORS = ['#4ade80', '#f87171'];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background transition-colors duration-300">
        <Loader2 size={30} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-300">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 animate-fade-in">
          <header className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
                  Attendance Tracker
                </h1>
                <p className="text-muted-foreground max-w-3xl">
                  Track your attendance for all subjects. Add new subjects and keep track of your attendance percentage.
                </p>
              </div>
              <Button 
                onClick={() => setTimetableDialogOpen(true)}
                className="gap-2 shrink-0"
              >
                <CalendarPlus className="h-4 w-4" />
                Add Timetable
              </Button>
            </div>
          </header>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-6">
            <div className="lg:col-span-2">
              <NewSubjectForm onSuccess={fetchSubjects} />
            </div>
            
            <div className="lg:col-span-1">
              <Card className="h-full bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Overall Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  {subjects.length > 0 ? (
                    <>
                      <div className="flex justify-center items-center mb-4">
                        <div className={`text-3xl font-bold ${
                          overallAttendance >= 75 ? 'text-green-500 dark:text-green-400' : 
                          overallAttendance >= 65 ? 'text-yellow-500 dark:text-yellow-400' : 
                          'text-red-500 dark:text-red-400'
                        }`}>
                          {overallAttendance}%
                        </div>
                      </div>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value}%`} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Add subjects to see overall attendance
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 mb-4">
            <Switch
              id="timetable-toggle"
              checked={showTimetableOnly}
              onCheckedChange={setShowTimetableOnly}
            />
            <Label htmlFor="timetable-toggle" className="text-sm font-medium">
              {showTimetableOnly ? "Today's Timetable" : "All Subjects"}
            </Label>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={30} className="animate-spin text-muted-foreground" />
            </div>
          ) : filteredSubjects.length > 0 ? (
            <div className="space-y-4">
              {filteredSubjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  onDelete={handleDeleteSubject}
                  onUpdate={fetchSubjects}
                  location={showTimetableOnly ? getSubjectLocation(subject.id) : undefined}
                  timing={showTimetableOnly ? getSubjectTiming(subject.id) : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border border-dashed border-muted rounded-lg">
              <h3 className="text-xl font-medium mb-2 text-foreground">
                {showTimetableOnly ? "No classes today" : "No subjects yet"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {showTimetableOnly 
                  ? "You have no classes scheduled for today"
                  : "Add your first subject to start tracking attendance"}
              </p>
            </div>
          )}
        </div>
      </main>
      
      <AdSection />
      
      <footer className="py-6 border-t border-border">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-sm text-muted-foreground">
            Developed By J Riteesh Reddy
          </p>
        </div>
      </footer>

      <TimetableDialog
        open={timetableDialogOpen}
        onOpenChange={setTimetableDialogOpen}
        subjects={subjects}
      />
    </div>
  );
};

export default AttendanceTracker;
