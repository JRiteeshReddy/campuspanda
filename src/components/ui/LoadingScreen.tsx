
import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  isLoading: boolean;
}

const LoadingScreen = ({ isLoading }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (isLoading) {
      // Start at 0 and gradually increase to 90 over 2 seconds
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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center animate-fade-in bg-gradient-light dark:bg-gradient-dark">
      <div className="relative flex flex-col items-center">
        <div className="animate-float">
          <img 
            src="/lovable-uploads/a48eb2f3-2b6f-400e-8ec6-bcaf06948cb8.png" 
            alt="CampusPanda Logo" 
            className="h-32 w-auto animate-pulse"
            style={{ 
              filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.3))', 
              animation: 'pulse 2s infinite' 
            }}
          />
        </div>
        <div className="mt-8 w-64">
          <div className="h-2 bg-black/30 rounded-full overflow-hidden shadow-[0_0_10px_rgba(0,0,0,0.3)]">
            <div 
              className="h-full bg-white transition-all"
              style={{ 
                width: `${progress}%`,
                boxShadow: '0 0 15px 5px rgba(255,255,255,0.8), 0 0 30px 8px rgba(255,255,255,0.6), 0 0 45px 12px rgba(255,255,255,0.4)'
              }}
            ></div>
          </div>
          <p className="text-xs text-center mt-2 text-white">
            {progress < 100 ? 'Loading...' : 'Ready!'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
