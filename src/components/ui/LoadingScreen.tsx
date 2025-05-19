
import React from 'react';
import { Loader } from 'lucide-react';

interface LoadingScreenProps {
  isLoading: boolean;
}

const LoadingScreen = ({ isLoading }: LoadingScreenProps) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center animate-fade-in">
      <div className="relative flex flex-col items-center">
        <div className="animate-float">
          <img 
            src="/lovable-uploads/259a2ad1-1ce7-481c-bdf3-3df888799e9d.png" 
            alt="CampusPanda Logo" 
            className="h-32 w-auto animate-pulse" 
          />
        </div>
        <div className="mt-8">
          <Loader className="h-8 w-8 text-primary animate-spin" />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
