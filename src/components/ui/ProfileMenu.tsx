import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ChevronDown, LogOut, User, Home, BookOpen, CalendarCheck, FileText, Calendar, Trash2, RotateCcw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Subject } from '@/types';
import { PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';

const ProfileMenu = () => {
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  const currentPath = window.location.pathname;
  const [totalAttendance, setTotalAttendance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResetSubjectsDialog, setShowResetSubjectsDialog] = useState(false);
  const [showResetAttendanceDialog, setShowResetAttendanceDialog] = useState(false);

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
          ? parseFloat(((totalAttended / totalConducted) * 100).toFixed(1))
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

  // Prepare data for mini pie chart
  const chartData = totalAttendance !== null ? [
    { name: 'Attended', value: totalAttendance },
    { name: 'Missed', value: 100 - totalAttendance },
  ] : [];
  
  const COLORS = ['#4ade80', '#f87171'];

  const handleResetSubjects = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setTotalAttendance(null);
      toast.success('All subjects have been deleted');
      setShowResetSubjectsDialog(false);
      window.location.reload();
    } catch (error) {
      console.error('Error resetting subjects:', error);
      toast.error('Failed to reset subjects');
    }
  };

  const handleResetAttendance = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('subjects')
        .update({ classes_attended: 0, classes_conducted: 0 })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setTotalAttendance(0);
      toast.success('All attendance has been reset');
      setShowResetAttendanceDialog(false);
      window.location.reload();
    } catch (error) {
      console.error('Error resetting attendance:', error);
      toast.error('Failed to reset attendance');
    }
  };

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center space-x-1 outline-none">
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
          <User size={16} className="text-muted-foreground" />
        </div>
        <ChevronDown size={16} className="text-muted-foreground" />
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64 animate-scale-in bg-background">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {isMobile && (
          <>
            {currentPath !== '/' && (
              <DropdownMenuItem asChild>
                <Link to="/" className="flex items-center cursor-pointer">
                  <Home size={16} className="mr-2" />
                  <span>Home</span>
                </Link>
              </DropdownMenuItem>
            )}
            
            {currentPath !== '/attendance' && (
              <DropdownMenuItem asChild>
                <Link to="/attendance" className="flex items-center cursor-pointer">
                  <BookOpen size={16} className="mr-2" />
                  <span>Attendance</span>
                </Link>
              </DropdownMenuItem>
            )}
            
            {currentPath !== '/assignments' && (
              <DropdownMenuItem asChild>
                <Link to="/assignments" className="flex items-center cursor-pointer">
                  <CalendarCheck size={16} className="mr-2" />
                  <span>Assignments</span>
                </Link>
              </DropdownMenuItem>
            )}
            
            {currentPath !== '/notes' && (
              <DropdownMenuItem asChild>
                <Link to="/notes" className="flex items-center cursor-pointer">
                  <FileText size={16} className="mr-2" />
                  <span>Notes</span>
                </Link>
              </DropdownMenuItem>
            )}
            
            {currentPath !== '/events' && (
              <DropdownMenuItem asChild>
                <Link to="/events" className="flex items-center cursor-pointer">
                  <Calendar size={16} className="mr-2" />
                  <span>Events</span>
                </Link>
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator />
          </>
        )}
        
        <div className="px-2 py-1.5 text-sm">
          <div className="text-muted-foreground">
            {user?.email}
          </div>
          
          {totalAttendance !== null ? (
            <div className="mt-2 flex items-center justify-between">
              <div className="text-sm font-medium">
                Overall Attendance: 
                <span 
                  className={`ml-1 font-semibold ${
                    totalAttendance >= 75 
                      ? 'text-green-500 dark:text-green-400' 
                      : totalAttendance >= 60 
                        ? 'text-yellow-500 dark:text-yellow-400' 
                        : 'text-red-500 dark:text-red-400'
                  }`}
                >
                  {totalAttendance}%
                </span>
              </div>
              
              <div className="h-10 w-10">
                <PieChart width={40} height={40}>
                  <Pie
                    data={chartData}
                    cx={20}
                    cy={20}
                    innerRadius={8}
                    outerRadius={16}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground mt-1">
              No attendance data
            </div>
          )}
        </div>
        
        <DropdownMenuSeparator />
        
        <div className="px-2 py-1.5 flex gap-2">
          <button
            onClick={() => setShowResetSubjectsDialog(true)}
            className="flex-1 text-xs px-2 py-1.5 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors flex items-center justify-center gap-1"
          >
            <Trash2 size={12} />
            Reset Subjects
          </button>
          <button
            onClick={() => setShowResetAttendanceDialog(true)}
            className="flex-1 text-xs px-2 py-1.5 rounded bg-muted hover:bg-muted/80 transition-colors flex items-center justify-center gap-1"
          >
            <RotateCcw size={12} />
            Reset Attendance
          </button>
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

    <AlertDialog open={showResetSubjectsDialog} onOpenChange={setShowResetSubjectsDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset All Subjects?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will permanently delete all your subjects and their attendance data. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleResetSubjects} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete All Subjects
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog open={showResetAttendanceDialog} onOpenChange={setShowResetAttendanceDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset All Attendance?</AlertDialogTitle>
          <AlertDialogDescription>
            This will reset all attendance data (classes attended and conducted) to 0 for all subjects. Your subjects will remain intact.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleResetAttendance}>
            Reset Attendance
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};

export default ProfileMenu;
