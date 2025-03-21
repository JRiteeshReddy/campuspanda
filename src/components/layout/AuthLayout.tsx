
import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-apple-gray p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-subtle p-6 sm:p-8 animate-scale-in">
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
