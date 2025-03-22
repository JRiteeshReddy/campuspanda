
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import ProfileMenu from '@/components/ui/ProfileMenu';
import { Home } from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  
  const logoSrc = theme === 'light' 
    ? "/lovable-uploads/c0858d5f-c932-484a-9e3f-31b896b122d7.png" 
    : "/lovable-uploads/7ff12a1f-6bcd-4d7a-a698-64c8f474e6a3.png";

  return (
    <nav className="w-full h-16 px-6 sm:px-8 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md z-50 fixed top-0 left-0 right-0 transition-colors duration-300">
      <div className="flex items-center">
        <Link to="/" className="flex items-center space-x-2">
          <img src={logoSrc} alt="UniBuddy Logo" className="h-10 w-auto object-contain" />
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {user ? (
          <>
            {window.location.pathname === '/attendance' && (
              <Link to="/" className="flex items-center text-foreground hover:text-primary transition-colors mr-2">
                <Home size={20} />
                <span className="ml-1 hidden sm:inline-block">Home</span>
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
