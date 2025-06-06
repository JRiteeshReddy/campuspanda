
import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import FeedbackLink from './FeedbackLink';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  onBackClick?: () => void;
  hideFeedback?: boolean;
}

const AuthLayout = ({ children, title, subtitle, onBackClick, hideFeedback = false }: AuthLayoutProps) => {
  const navigate = useNavigate();
  
  // Always use dark mode logo
  const logoSrc = "/lovable-uploads/259a2ad1-1ce7-481c-bdf3-3df888799e9d.png";
  
  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background transition-colors duration-300 p-4 sm:p-6">
      <div className="w-full max-w-md bg-card rounded-xl shadow-subtle p-6 sm:p-8 animate-scale-in relative">
        <div className="flex flex-col items-center mb-8">
          <img src={logoSrc} alt="Logo" className="h-16 w-auto mb-6" />
        </div>
        
        <button 
          onClick={handleBackClick}
          className="mb-6 flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back
        </button>
        
        <div className="space-y-2 text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>
        
        {children}
      </div>
      
      {!hideFeedback && (
        <div className="mt-6 w-full max-w-md">
          <FeedbackLink />
        </div>
      )}
    </div>
  );
};

export default AuthLayout;
