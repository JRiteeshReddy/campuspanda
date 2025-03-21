
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, LogOut, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Subject } from '@/types';

const ProfileMenu = () => {
  const { user, signOut } = useAuth();
  const [totalAttendance, setTotalAttendance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTotalAttendance();
    }
  }, [user]);

  const fetchTotalAttendance = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subjects')
        .select('classes_attended, classes_conducted')
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        let totalAttended = 0;
        let totalConducted = 0;
        
        data.forEach((subject: Subject) => {
          totalAttended += subject.classes_attended;
          totalConducted += subject.classes_conducted;
        });
        
        const percentage = totalConducted > 0 
          ? Math.round((totalAttended / totalConducted) * 100) 
          : 0;
          
        setTotalAttendance(percentage);
      } else {
        setTotalAttendance(null);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center space-x-1 outline-none">
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
          <User size={16} className="text-muted-foreground" />
        </div>
        <ChevronDown size={16} className="text-muted-foreground" />
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56 animate-scale-in">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <div className="px-2 py-1.5 text-sm">
          <div className="text-muted-foreground">
            {user?.email}
          </div>
          
          {totalAttendance !== null ? (
            <div className="mt-1 flex items-center">
              <div className="text-sm font-medium">
                Overall Attendance: 
                <span 
                  className={`ml-1 font-semibold ${
                    totalAttendance >= 75 
                      ? 'text-apple-green' 
                      : totalAttendance >= 60 
                        ? 'text-apple-yellow' 
                        : 'text-apple-red'
                  }`}
                >
                  {totalAttendance}%
                </span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground mt-1">
              No attendance data
            </div>
          )}
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="cursor-pointer flex items-center text-destructive focus:text-destructive"
          onClick={() => signOut()}
        >
          <LogOut size={16} className="mr-2" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileMenu;
