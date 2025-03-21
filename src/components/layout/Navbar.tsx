
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import ProfileMenu from '@/components/ui/ProfileMenu';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav className="w-full h-16 px-6 sm:px-8 flex items-center justify-between border-b border-border bg-white/80 backdrop-blur-md z-50 fixed top-0 left-0 right-0">
      <div className="flex items-center">
        <Link to="/" className="flex items-center space-x-2">
          {/* Logo placeholder */}
          <div className="h-8 w-8 rounded-md bg-apple-blue flex items-center justify-center text-white font-semibold">
            A
          </div>
          <span className="text-lg font-semibold text-apple-text hidden sm:inline-block">
            Student Tracker
          </span>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {user ? (
          <ProfileMenu />
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
