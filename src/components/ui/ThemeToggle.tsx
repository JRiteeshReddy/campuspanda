
import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface ThemeToggleProps {
  showLabel?: boolean;
}

const ThemeToggle = ({ showLabel = true }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Wait until mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      {showLabel && (
        <div className="flex items-center">
          <Sun size={16} className={`mr-2 ${theme === 'dark' ? 'opacity-50' : ''}`} />
          <Switch 
            checked={theme === 'dark'}
            onCheckedChange={toggleTheme}
            aria-label="Toggle theme"
          />
          <Moon size={16} className={`ml-2 ${theme === 'light' ? 'opacity-50' : ''}`} />
        </div>
      )}
      
      {!showLabel && (
        <button 
          onClick={toggleTheme} 
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-accent"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      )}
    </div>
  );
};

export default ThemeToggle;
