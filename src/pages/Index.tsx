
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, CalendarCheck, FileText, ArrowRight, Calendar, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import { useIsMobile } from '@/hooks/use-mobile';
import FeedbackLink from '@/components/layout/FeedbackLink';

const Index = () => {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const isMobile = useIsMobile();
  
  const handleGetStarted = (path: string) => {
    navigate(path);
  };
  
  return <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 animate-fade-in">
          <div className="text-center mb-8 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-[#0071e3] dark:text-white">CampusPanda
          </h1>
            <p className="text-xl text-muted-foreground dark:text-white/80">
              Track. Manage. Succeed.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
            {/* Attendance Tracker */}
            <button 
              onClick={() => handleGetStarted('/attendance')} 
              className="mobile-card-button group dark:bg-white/5 dark:border-white/10 dark:text-white 
                        transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl 
                        hover:bg-gradient-to-br hover:from-indigo-50 hover:to-blue-100 
                        dark:hover:bg-gradient-to-br dark:hover:from-indigo-900/30 dark:hover:to-blue-800/20"
            >
              <div className="mb-2 sm:mb-4 p-2 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-indigo-600/10 
                           flex items-center justify-center text-indigo-600 dark:bg-indigo-600/20 dark:text-white
                           group-hover:scale-110 transition-transform duration-300">
                <BookOpen size={isMobile ? 24 : 30} />
              </div>
              <h2 className="text-xs sm:text-xl font-medium text-apple-text dark:text-white mb-1 sm:mb-2">Attendance Tracker</h2>
              <p className="text-[10px] sm:text-sm text-muted-foreground dark:text-white/70 text-center mb-2 sm:mb-4 line-clamp-2 sm:line-clamp-none">
                Track your class attendance
              </p>
              <div className="mt-auto flex items-center justify-center text-indigo-600 dark:text-white font-medium text-xs sm:text-sm">
                <span>Get Started</span>
                <ArrowRight size={isMobile ? 14 : 16} className="ml-1 transition-transform group-hover:translate-x-2" />
              </div>
            </button>
            
            {/* Assignment Tracker */}
            <button 
              onClick={() => handleGetStarted('/assignments')} 
              className="mobile-card-button group dark:bg-white/5 dark:border-white/10 dark:text-white 
                        transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl 
                        hover:bg-gradient-to-br hover:from-pink-50 hover:to-purple-100 
                        dark:hover:bg-gradient-to-br dark:hover:from-pink-900/30 dark:hover:to-purple-800/20"
            >
              <div className="mb-2 sm:mb-4 p-2 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-indigo-600/10 
                           flex items-center justify-center text-indigo-600 dark:bg-indigo-600/20 dark:text-white
                           group-hover:scale-110 transition-transform duration-300">
                <CalendarCheck size={isMobile ? 24 : 30} />
              </div>
              <h2 className="text-xs sm:text-xl font-medium text-apple-text dark:text-white mb-1 sm:mb-2">Assignment Tracker</h2>
              <p className="text-[10px] sm:text-sm text-muted-foreground dark:text-white/70 text-center mb-2 sm:mb-4 line-clamp-2 sm:line-clamp-none">
                Track assignments and deadlines
              </p>
              <div className="mt-auto flex items-center justify-center text-indigo-600 dark:text-white font-medium text-xs sm:text-sm">
                <span>Get Started</span>
                <ArrowRight size={isMobile ? 14 : 16} className="ml-1 transition-transform group-hover:translate-x-2" />
              </div>
            </button>
            
            {/* Notes Organizer */}
            <button 
              onClick={() => handleGetStarted('/notes')} 
              className="mobile-card-button group dark:bg-white/5 dark:border-white/10 dark:text-white 
                        transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl 
                        hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-100 
                        dark:hover:bg-gradient-to-br dark:hover:from-blue-900/30 dark:hover:to-cyan-800/20"
            >
              <div className="mb-2 sm:mb-4 p-2 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-indigo-600/10 
                           flex items-center justify-center text-indigo-600 dark:bg-indigo-600/20 dark:text-white
                           group-hover:scale-110 transition-transform duration-300">
                <FileText size={isMobile ? 24 : 30} />
              </div>
              <h2 className="text-xs sm:text-xl font-medium text-apple-text dark:text-white mb-1 sm:mb-2">Notes Organizer</h2>
              <p className="text-[10px] sm:text-sm text-muted-foreground dark:text-white/70 text-center mb-2 sm:mb-4 line-clamp-2 sm:line-clamp-none">
                Organize your study notes
              </p>
              <div className="mt-auto flex items-center justify-center text-indigo-600 dark:text-white font-medium text-xs sm:text-sm">
                <span>Get Started</span>
                <ArrowRight size={isMobile ? 14 : 16} className="ml-1 transition-transform group-hover:translate-x-2" />
              </div>
            </button>
            
            {/* EventPanda - Updated Card */}
            <button 
              onClick={() => handleGetStarted('/events')} 
              className="mobile-card-button group dark:bg-white/5 dark:border-white/10 dark:text-white 
                        transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl 
                        hover:bg-gradient-to-br hover:from-green-50 hover:to-teal-100 
                        dark:hover:bg-gradient-to-br dark:hover:from-green-900/30 dark:hover:to-teal-800/20"
            >
              <div className="mb-2 sm:mb-4 p-2 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-green-600/10 
                           flex items-center justify-center text-green-600 dark:bg-green-600/20 dark:text-white
                           group-hover:scale-110 transition-transform duration-300">
                <Calendar size={isMobile ? 24 : 30} />
              </div>
              <h2 className="text-xs sm:text-xl font-medium text-apple-text dark:text-white mb-1 sm:mb-2">
                EventPanda
              </h2>
              <p className="text-[10px] sm:text-sm text-muted-foreground dark:text-white/70 text-center mb-2 sm:mb-4 line-clamp-2 sm:line-clamp-none">
                Stay on Track with Your Events
              </p>
              <div className="mt-auto flex items-center justify-center text-green-600 dark:text-white font-medium text-xs sm:text-sm">
                <span>Get Started</span>
                <ArrowRight size={isMobile ? 14 : 16} className="ml-1 transition-transform group-hover:translate-x-2" />
              </div>
            </button>
            
            {/* Coming Soon Card */}
            <button 
              className="mobile-card-button group dark:bg-white/5 dark:border-white/10 dark:text-white 
                        transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl 
                        hover:bg-gradient-to-br hover:from-amber-50 hover:to-yellow-100 
                        dark:hover:bg-gradient-to-br dark:hover:from-amber-900/30 dark:hover:to-yellow-800/20"
            >
              <div className="mb-2 sm:mb-4 p-2 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-amber-600/10 
                           flex items-center justify-center text-amber-600 dark:bg-amber-600/20 dark:text-white
                           group-hover:scale-110 transition-transform duration-300">
                <Clock size={isMobile ? 24 : 30} />
              </div>
              <h2 className="text-xs sm:text-xl font-medium text-apple-text dark:text-white mb-1 sm:mb-2">
                Coming Soon
              </h2>
              <p className="text-[10px] sm:text-sm text-muted-foreground dark:text-white/70 text-center mb-2 sm:mb-4 line-clamp-2 sm:line-clamp-none">
                New features on the way
              </p>
              <div className="mt-auto flex items-center justify-center text-amber-600 dark:text-white font-medium text-xs sm:text-sm">
                <span>Stay Tuned</span>
                <ArrowRight size={isMobile ? 14 : 16} className="ml-1 transition-transform group-hover:translate-x-2" />
              </div>
            </button>
          </div>
        </div>
      </main>
      
      <FeedbackLink />
      
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
