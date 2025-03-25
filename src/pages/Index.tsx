
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, CalendarCheck, FileText, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';

const Index = () => {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  
  const handleGetStarted = (path: string) => {
    navigate(path);
  };
  
  return <div className="min-h-screen bg-white dark:bg-gradient-dark flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 animate-fade-in">
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-apple-blue dark:text-white mb-4">
              CampusBuddy
            </h1>
            <p className="text-xl text-muted-foreground dark:text-white/80 max-w-2xl mx-auto">
              Track. Manage. Succeed.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {/* Attendance Tracker */}
            <button onClick={() => handleGetStarted('/attendance')} className="square-button group dark:bg-white/5 dark:border-white/10 dark:text-white">
              <div className="mb-4 p-4 w-16 h-16 rounded-full bg-indigo-600/10 flex items-center justify-center text-indigo-600 dark:bg-indigo-600/20 dark:text-white">
                <BookOpen size={30} />
              </div>
              <h2 className="text-xl font-medium text-apple-text dark:text-white mb-2">Attendance Tracker</h2>
              <p className="text-muted-foreground dark:text-white/70 text-sm text-center mb-4">
                Track your class attendance and stay on top of requirements
              </p>
              <div className="mt-auto flex items-center justify-center text-indigo-600 dark:text-white font-medium text-sm">
                <span>Get Started</span>
                <ArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
            
            {/* Assignment Tracker */}
            <button onClick={() => handleGetStarted('/assignments')} className="square-button group dark:bg-white/5 dark:border-white/10 dark:text-white">
              <div className="mb-4 p-4 w-16 h-16 rounded-full bg-indigo-600/10 flex items-center justify-center text-indigo-600 dark:bg-indigo-600/20 dark:text-white">
                <CalendarCheck size={30} />
              </div>
              <h2 className="text-xl font-medium text-apple-text dark:text-white mb-2">Assignment Tracker</h2>
              <p className="text-muted-foreground dark:text-white/70 text-sm text-center mb-4">
                Keep track of your assignments and deadlines
              </p>
              <div className="mt-auto flex items-center justify-center text-indigo-600 dark:text-white font-medium text-sm">
                <span>Get Started</span>
                <ArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
            
            {/* Notes Organizer - Replaces the Timetable option */}
            <button onClick={() => handleGetStarted('/notes')} className="square-button group dark:bg-white/5 dark:border-white/10 dark:text-white">
              <div className="mb-4 p-4 w-16 h-16 rounded-full bg-indigo-600/10 flex items-center justify-center text-indigo-600 dark:bg-indigo-600/20 dark:text-white">
                <FileText size={30} />
              </div>
              <h2 className="text-xl font-medium text-apple-text dark:text-white mb-2">Notes Organizer</h2>
              <p className="text-muted-foreground dark:text-white/70 text-sm text-center mb-4">
                Create, organize, and manage your study notes
              </p>
              <div className="mt-auto flex items-center justify-center text-indigo-600 dark:text-white font-medium text-sm">
                <span>Get Started</span>
                <ArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          </div>
        </div>
      </main>
      
      <footer className="py-6 border-t border-border dark:border-white/10">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-sm text-muted-foreground dark:text-white/60">
            Developed By J Riteesh Reddy
          </p>
        </div>
      </footer>
    </div>;
};

export default Index;
