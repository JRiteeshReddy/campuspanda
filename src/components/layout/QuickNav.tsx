
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, CalendarCheck, FileText, Calendar, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const QuickNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Attendance', path: '/attendance', icon: BookOpen },
    { name: 'Assignments', path: '/assignments', icon: CalendarCheck },
    { name: 'Notes', path: '/notes', icon: FileText },
    { name: 'Events', path: '/events', icon: Calendar },
    { name: 'Chat', path: '/chat', icon: MessageSquare }
  ];

  return (
    <div className="fixed top-16 left-0 right-0 z-40 flex justify-center bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center px-4 py-1">
        <TooltipProvider>
          {navItems.map((item) => (
            <Tooltip key={item.path}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "p-2 mx-1 rounded-md transition-colors",
                    currentPath === item.path 
                      ? "text-primary bg-primary/10" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  aria-label={item.name}
                >
                  <item.icon size={20} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
};

export default QuickNav;
