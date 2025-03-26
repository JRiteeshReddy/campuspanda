
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, CalendarCheck, FileText, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const handleGetStarted = (path: string) => {
    navigate(path);
  };
  
  return <div className="min-h-screen bg-white dark:bg-gradient-dark flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 animate-fade-in">
          <div className="text-center mb-8 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-apple-blue dark:text-white mb-4">
              CampusBuddy
            </h1>
            <p className="text-xl text-muted-foreground dark:text-white/80 max-w-2xl mx-auto">
              Track. Manage. Succeed.
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
            {/* Attendance Tracker */}
            <button onClick={() => handleGetStarted('/attendance')} 
              className="compact-button group dark:bg-white/5 dark:border-white/10 dark:text-white transition-all duration-300">
              <div className="mb-2 sm:mb-4 p-2 sm:p-4 w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-indigo-600/10 flex items-center justify-center text-indigo-600 dark:bg-indigo-600/20 dark:text-white">
                <BookOpen size={isMobile ? 20 : 30} />
              </div>
              <h2 className="text-sm sm:text-xl font-medium text-apple-text dark:text-white mb-1 sm:mb-2">Attendance Tracker</h2>
              <p className="text-xs sm:text-sm text-muted-foreground dark:text-white/70 text-center mb-2 sm:mb-4 line-clamp-2 sm:line-clamp-none">
                Track your class attendance
              </p>
              <div className="mt-auto flex items-center justify-center text-indigo-600 dark:text-white font-medium text-xs sm:text-sm">
                <span>Get Started</span>
                <ArrowRight size={isMobile ? 12 : 16} className="ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
            
            {/* Assignment Tracker */}
            <button onClick={() => handleGetStarted('/assignments')} 
              className="compact-button group dark:bg-white/5 dark:border-white/10 dark:text-white transition-all duration-300">
              <div className="mb-2 sm:mb-4 p-2 sm:p-4 w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-indigo-600/10 flex items-center justify-center text-indigo-600 dark:bg-indigo-600/20 dark:text-white">
                <CalendarCheck size={isMobile ? 20 : 30} />
              </div>
              <h2 className="text-sm sm:text-xl font-medium text-apple-text dark:text-white mb-1 sm:mb-2">Assignment Tracker</h2>
              <p className="text-xs sm:text-sm text-muted-foreground dark:text-white/70 text-center mb-2 sm:mb-4 line-clamp-2 sm:line-clamp-none">
                Track assignments and deadlines
              </p>
              <div className="mt-auto flex items-center justify-center text-indigo-600 dark:text-white font-medium text-xs sm:text-sm">
                <span>Get Started</span>
                <ArrowRight size={isMobile ? 12 : 16} className="ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
            
            {/* Notes Organizer */}
            <button onClick={() => handleGetStarted('/notes')} 
              className="compact-button group dark:bg-white/5 dark:border-white/10 dark:text-white transition-all duration-300">
              <div className="mb-2 sm:mb-4 p-2 sm:p-4 w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-indigo-600/10 flex items-center justify-center text-indigo-600 dark:bg-indigo-600/20 dark:text-white">
                <FileText size={isMobile ? 20 : 30} />
              </div>
              <h2 className="text-sm sm:text-xl font-medium text-apple-text dark:text-white mb-1 sm:mb-2">Notes Organizer</h2>
              <p className="text-xs sm:text-sm text-muted-foreground dark:text-white/70 text-center mb-2 sm:mb-4 line-clamp-2 sm:line-clamp-none">
                Organize your study notes
              </p>
              <div className="mt-auto flex items-center justify-center text-indigo-600 dark:text-white font-medium text-xs sm:text-sm">
                <span>Get Started</span>
                <ArrowRight size={isMobile ? 12 : 16} className="ml-1 transition-transform group-hover:translate-x-1" />
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
