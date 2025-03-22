
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase, handleError } from '@/lib/supabase';
import { Subject } from '@/types';
import Navbar from '@/components/layout/Navbar';
import SubjectCard from '@/components/attendance/SubjectCard';
import NewSubjectForm from '@/components/attendance/NewSubjectForm';
import { Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const AttendanceTracker = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    } else if (user) {
      fetchSubjects();
    }
  }, [user, authLoading, navigate]);

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

  // Calculate overall attendance percentage
  const calculateOverallAttendance = () => {
    if (subjects.length === 0) return 0;
    
    const totalAttended = subjects.reduce((sum, subject) => sum + subject.classes_attended, 0);
    const totalConducted = subjects.reduce((sum, subject) => sum + subject.classes_conducted, 0);
    
    return totalConducted > 0 ? Math.round((totalAttended / totalConducted) * 100) : 0;
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
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">
              Attendance Tracker
            </h1>
            <p className="text-muted-foreground max-w-3xl">
              Track your attendance for all subjects. Add new subjects and keep track of your attendance percentage.
            </p>
          </header>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
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
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={30} className="animate-spin text-muted-foreground" />
            </div>
          ) : subjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {subjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  onUpdate={fetchSubjects}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-muted rounded-lg">
              <h3 className="text-xl font-medium mb-2 text-foreground">No subjects yet</h3>
              <p className="text-muted-foreground mb-6">
                Add your first subject to start tracking attendance
              </p>
            </div>
          )}
        </div>
      </main>
      
      <footer className="py-6 border-t border-border">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Student Attendance Tracker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AttendanceTracker;
