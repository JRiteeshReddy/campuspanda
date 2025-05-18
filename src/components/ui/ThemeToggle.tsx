
import { useTheme } from '@/context/ThemeContext';
import { Moon } from 'lucide-react';

const ThemeToggle = () => {
  const { theme } = useTheme();

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center">
        <Moon size={16} className="ml-2" />
      </div>
    </div>
  );
};

export default ThemeToggle;
