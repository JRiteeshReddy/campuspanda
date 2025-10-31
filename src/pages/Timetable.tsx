
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase, handleError } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import AdSection from '@/components/layout/AdSection';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import TimetableGrid from '@/components/timetable/TimetableGrid';
import { Subject } from '@/types';
import FeedbackLink from '@/components/layout/FeedbackLink';

const Timetable = () => {
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
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      setSubjects(data || []);
    } catch (error) {
      handleError(error);
      toast.error("Could not load your subjects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
              Weekly Timetable
            </h1>
            <p className="text-muted-foreground max-w-3xl">
              Manage your weekly class schedule. Click on any time slot to add or edit a class.
              {subjects.length === 0 && (
                <span className="block mt-2 text-amber-500 dark:text-amber-400">
                  Please add subjects in the Attendance Tracker first before creating your timetable.
                </span>
              )}
            </p>
          </header>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={30} className="animate-spin text-muted-foreground" />
            </div>
          ) : (
            <TimetableGrid subjects={subjects} />
          )}
        </div>
      </main>
      
      <FeedbackLink />
      
      <AdSection />
      
      <footer className="py-6 border-t border-border">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-sm text-muted-foreground">
            Developed By J Riteesh Reddy
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Timetable;
