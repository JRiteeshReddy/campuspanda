
import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useTheme } from '@/context/ThemeContext';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const logoSrc = theme === 'light' 
    ? "/lovable-uploads/c0858d5f-c932-484a-9e3f-31b896b122d7.png" 
    : "/lovable-uploads/7ff12a1f-6bcd-4d7a-a698-64c8f474e6a3.png";
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background transition-colors duration-300 p-4 sm:p-6">
      <div className="w-full max-w-md bg-card rounded-xl shadow-subtle p-6 sm:p-8 animate-scale-in relative">
        <div className="absolute right-6 top-6">
          <ThemeToggle showLabel={false} />
        </div>
        
        <div className="flex flex-col items-center mb-8">
          <img src={logoSrc} alt="Logo" className="h-16 w-auto mb-6" />
        </div>
        
        <button 
          onClick={() => navigate(-1)}
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
    </div>
  );
};

export default AuthLayout;
