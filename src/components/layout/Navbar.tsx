
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import ProfileMenu from '@/components/ui/ProfileMenu';
import { Home, BookOpen, CalendarCheck, FileText } from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  
  const logoSrc = theme === 'light' 
    ? "/lovable-uploads/3a03d6f2-dedf-4107-8b06-8944fc1b13be.png" 
    : "/lovable-uploads/984a254c-11ac-4a97-ac8c-d0bcdeaf791c.png";
  
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
            {(currentPath === '/attendance' || currentPath === '/assignments' || currentPath === '/notes') && (
              <Link to="/" className="flex items-center text-foreground hover:text-primary transition-colors mr-2">
                <Home size={20} />
                <span className="ml-1 hidden sm:inline-block">Home</span>
              </Link>
            )}
            
            {(currentPath === '/assignments' || currentPath === '/notes') && (
              <Link to="/attendance" className="flex items-center text-foreground hover:text-primary transition-colors mr-2">
                <BookOpen size={20} />
                <span className="ml-1 hidden sm:inline-block">Attendance</span>
              </Link>
            )}
            
            {(currentPath === '/attendance' || currentPath === '/notes') && (
              <Link to="/assignments" className="flex items-center text-foreground hover:text-primary transition-colors mr-2">
                <CalendarCheck size={20} />
                <span className="ml-1 hidden sm:inline-block">Assignments</span>
              </Link>
            )}
            
            {(currentPath === '/attendance' || currentPath === '/assignments') && (
              <Link to="/notes" className="flex items-center text-foreground hover:text-primary transition-colors mr-2">
                <FileText size={20} />
                <span className="ml-1 hidden sm:inline-block">Notes</span>
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
