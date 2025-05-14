
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useDocumentTitle } from '@/hooks/use-document-title';
import ProfileMenu from '@/components/ui/ProfileMenu';
import { Home, BookOpen, CalendarCheck, FileText, Calendar, MessageSquare, Cpu } from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  
  // Use the custom hook to update document title
  useDocumentTitle();
  
  const logoSrc = theme === 'light' 
    ? "/lovable-uploads/3c2c04b3-4321-4d75-acf9-9ba8a3dda8d5.png" 
    : "/lovable-uploads/259a2ad1-1ce7-481c-bdf3-3df888799e9d.png";
  
  const currentPath = window.location.pathname;

  return (
    <nav className="w-full h-16 px-6 sm:px-8 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md z-50 fixed top-0 left-0 right-0 transition-colors duration-300">
      <div className="flex items-center">
        <Link to="/" className="flex items-center space-x-2">
          <img src={logoSrc} alt="CampusPanda Logo" className="h-10 w-auto object-contain" />
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {user ? (
          <>
            {(currentPath === '/attendance' || currentPath === '/assignments' || currentPath === '/notes' || currentPath === '/events' || currentPath === '/chat' || currentPath === '/ai') && (
              <Link to="/" className="flex items-center text-foreground hover:text-primary transition-colors mr-2">
                <Home size={20} />
                <span className="ml-1 hidden sm:inline-block">Home</span>
              </Link>
            )}
            
            {(currentPath === '/assignments' || currentPath === '/notes' || currentPath === '/events' || currentPath === '/chat' || currentPath === '/ai') && (
              <Link to="/attendance" className="flex items-center text-foreground hover:text-primary transition-colors mr-2">
                <BookOpen size={20} />
                <span className="ml-1 hidden sm:inline-block">Attendance</span>
              </Link>
            )}
            
            {(currentPath === '/attendance' || currentPath === '/notes' || currentPath === '/events' || currentPath === '/chat' || currentPath === '/ai') && (
              <Link to="/assignments" className="flex items-center text-foreground hover:text-primary transition-colors mr-2">
                <CalendarCheck size={20} />
                <span className="ml-1 hidden sm:inline-block">Assignments</span>
              </Link>
            )}
            
            {(currentPath === '/attendance' || currentPath === '/assignments' || currentPath === '/events' || currentPath === '/chat' || currentPath === '/ai') && (
              <Link to="/notes" className="flex items-center text-foreground hover:text-primary transition-colors mr-2">
                <FileText size={20} />
                <span className="ml-1 hidden sm:inline-block">Notes</span>
              </Link>
            )}
            
            {(currentPath === '/attendance' || currentPath === '/assignments' || currentPath === '/notes' || currentPath === '/chat' || currentPath === '/ai') && (
              <Link to="/events" className="flex items-center text-foreground hover:text-primary transition-colors mr-2">
                <Calendar size={20} />
                <span className="ml-1 hidden sm:inline-block">Events</span>
              </Link>
            )}
            
            {(currentPath === '/attendance' || currentPath === '/assignments' || currentPath === '/notes' || currentPath === '/events' || currentPath === '/ai') && (
              <Link to="/chat" className="flex items-center text-foreground hover:text-primary transition-colors mr-2">
                <MessageSquare size={20} />
                <span className="ml-1 hidden sm:inline-block">Chat</span>
              </Link>
            )}
            
            {(currentPath === '/attendance' || currentPath === '/assignments' || currentPath === '/notes' || currentPath === '/events' || currentPath === '/chat') && (
              <Link to="/ai" className="flex items-center text-foreground hover:text-primary transition-colors mr-2">
                <Cpu size={20} />
                <span className="ml-1 hidden sm:inline-block">AI</span>
              </Link>
            )}
            
            <ProfileMenu />
          </>
        ) : (
          <div className="flex items-center space-x-4">
            <Link to="/login" className="nav-link">
              Log in
            </Link>
            <Link to="/signup" className="btn-primary text-sm">
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
