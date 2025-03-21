
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase, handleError } from '@/lib/supabase';
import { Subject } from '@/types';
import Navbar from '@/components/layout/Navbar';
import SubjectCard from '@/components/attendance/SubjectCard';
import NewSubjectForm from '@/components/attendance/NewSubjectForm';
import { Loader2 } from 'lucide-react';

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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={30} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 animate-fade-in">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-apple-text mb-4">
              Attendance Tracker
            </h1>
            <p className="text-muted-foreground max-w-3xl">
              Track your attendance for all subjects. Add new subjects and keep track of your attendance percentage.
            </p>
          </header>
          
          <NewSubjectForm onSuccess={fetchSubjects} />
          
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
              <h3 className="text-xl font-medium mb-2">No subjects yet</h3>
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
