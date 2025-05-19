
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';

interface LoadingScreenProps {
  isLoading: boolean;
}

const LoadingScreen = ({ isLoading }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (isLoading) {
      // Start at 0 and gradually increase to 100 over 2 seconds
      // Note: We stop at 90% and jump to 100 when actually loaded
      const interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prevProgress + 5;
        });
      }, 100);
      
      return () => clearInterval(interval);
    } else if (progress < 100) {
      // When loading is complete, jump to 100%
      setProgress(100);
    }
  }, [isLoading, progress]);

  if (!isLoading && progress === 100) return null;

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
        <div className="mt-8 w-64">
          <Progress value={progress} className="h-2 bg-slate-800 shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            <div 
              className="h-full w-full flex-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.7)] transition-all"
              style={{ transform: `translateX(-${100 - (progress || 0)}%)` }}
            ></div>
          </Progress>
          <p className="text-xs text-center mt-2 text-white">
            {progress < 100 ? 'Loading...' : 'Ready!'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
