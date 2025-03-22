import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, CalendarCheck, Users, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
const Index = () => {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const handleGetStarted = () => {
    navigate('/attendance');
  };
  return <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12 text-apple-blue font-extrabold text-6xl">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 animate-fade-in">
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-apple-text mb-4">CampusBuddy</h1>
            <p className="text-muted-foreground max-w-2xl mx-[240px] my-0 text-2xl text-center">Track. Manage. Succeed</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {/* Attendance Tracker */}
            <button onClick={handleGetStarted} className="square-button group">
              <div className="mb-4 p-4 w-16 h-16 rounded-full bg-indigo-600/10 flex items-center justify-center text-indigo-600">
                <BookOpen size={30} />
              </div>
              <h2 className="text-xl font-medium text-apple-text mb-2">Attendance Tracker</h2>
              <p className="text-muted-foreground text-sm text-center mb-4">
                Track your class attendance and stay on top of requirements
              </p>
              <div className="mt-auto flex items-center justify-center text-indigo-600 font-medium text-sm">
                <span>Get Started</span>
                <ArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
            
            {/* Coming Soon - Option 1 */}
            <div className="square-button bg-muted/50 border-dashed cursor-default">
              <div className="mb-4 p-4 w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <CalendarCheck size={30} />
              </div>
              <h2 className="text-xl font-medium text-apple-text mb-2">Coming Soon</h2>
              <p className="text-muted-foreground text-sm text-center">
                New features are on the way
              </p>
              <div className="mt-auto">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  Coming Soon
                </span>
              </div>
            </div>
            
            {/* Coming Soon - Option 2 */}
            <div className="square-button bg-muted/50 border-dashed cursor-default">
              <div className="mb-4 p-4 w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Users size={30} />
              </div>
              <h2 className="text-xl font-medium text-apple-text mb-2">Coming Soon</h2>
              <p className="text-muted-foreground text-sm text-center">
                New features are on the way
              </p>
              <div className="mt-auto">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="py-6 border-t border-border">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} UniBuddy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>;
};
export default Index;