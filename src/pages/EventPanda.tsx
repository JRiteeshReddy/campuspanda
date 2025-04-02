import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Bell, 
  Calendar, 
  Clock, 
  FileText,
  PieChart, 
  Plus, 
  Users,
  Trash2,
  Edit,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import Navbar from '@/components/layout/Navbar';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { supabase, handleError, parseJsonArray } from '@/lib/supabase';
import { EventNotice, EventTask, EventTeam } from '@/types';

const EventPanda = () => {
  const [notices, setNotices] = useState<EventNotice[]>([]);
  const [tasks, setTasks] = useState<EventTask[]>([]);
  const [teams, setTeams] = useState<EventTeam[]>([]);
  const [isNoticeDialogOpen, setIsNoticeDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [currentNotice, setCurrentNotice] = useState<Partial<EventNotice>>({
    title: '',
    description: '',
    deadline: '',
    type: 'general'
  });
  const [currentTask, setCurrentTask] = useState<Partial<EventTask>>({
    name: '',
    assigned_to: '',
    due_date: '',
    priority: 'Medium',
    status: 'Pending'
  });
  const [currentTeam, setCurrentTeam] = useState<Partial<EventTeam>>({
    name: '',
    members: [],
    events: []
  });
  const [newMember, setNewMember] = useState('');
  const [newEvent, setNewEvent] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotices();
      fetchTasks();
      fetchTeams();
    }
  }, [user]);

  const fetchNotices = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('event_notices')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;

      setNotices(data as EventNotice[]);
    } catch (error) {
      handleError(error);
    }
  };

  const fetchTasks = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('event_tasks')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setTasks(data as EventTask[]);
    } catch (error) {
      handleError(error);
    }
  };

  const fetchTeams = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('event_teams')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const processedData = data?.map(team => ({
        ...team,
        members: parseJsonArray(team.members),
        events: parseJsonArray(team.events)
      })) as EventTeam[];
      
      setTeams(processedData);
    } catch (error) {
      handleError(error);
    }
  };

  const addNotice = async () => {
    if (!user) return;
    if (!currentNotice.title) {
      toast.error('Notice title is required');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('event_notices')
        .insert([
          {
            user_id: user.id,
            title: currentNotice.title,
            description: currentNotice.description || null,
            deadline: currentNotice.deadline || null,
            type: currentNotice.type || 'general',
          }
        ])
        .select();
        
      if (error) throw error;
      toast.success('Notice added successfully');
      
      const newNotices = [...(data as EventNotice[] || []), ...notices];
      setNotices(newNotices);
      
      setCurrentNotice({ title: '', description: '', deadline: '', type: 'general' });
      setIsNoticeDialogOpen(false);
    } catch (error) {
      handleError(error);
    }
  };

  const addTask = async () => {
    if (!user) return;
    if (!currentTask.name) {
      toast.error('Task name is required');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('event_tasks')
        .insert([
          {
            user_id: user.id,
            name: currentTask.name,
            assigned_to: currentTask.assigned_to || null,
            due_date: currentTask.due_date || null,
            priority: currentTask.priority || 'Medium',
            status: currentTask.status || 'Pending',
          }
        ])
        .select();
        
      if (error) throw error;
      toast.success('Task added successfully');
      
      const newTasks = [...(data as EventTask[] || []), ...tasks];
      setTasks(newTasks);
      
      setCurrentTask({ name: '', assigned_to: '', due_date: '', priority: 'Medium', status: 'Pending' });
      setIsTaskDialogOpen(false);
    } catch (error) {
      handleError(error);
    }
  };

  const addTeam = async () => {
    if (!user) return;
    if (!currentTeam.name) {
      toast.error('Team name is required');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('event_teams')
        .insert([
          {
            user_id: user.id,
            name: currentTeam.name,
            members: currentTeam.members || [],
            events: currentTeam.events || [],
          }
        ])
        .select();
        
      if (error) throw error;
      toast.success('Team added successfully');
      
      const processedData = data?.map(team => ({
        ...team,
        members: parseJsonArray(team.members),
        events: parseJsonArray(team.events)
      })) as EventTeam[];
      
      setTeams([...(processedData || []), ...teams]);
      
      setCurrentTeam({ name: '', members: [], events: [] });
      setIsTeamDialogOpen(false);
    } catch (error) {
      handleError(error);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: 'Pending' | 'In Progress' | 'Completed') => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('event_tasks')
        .update({ status: newStatus })
        .eq('id', taskId);
        
      if (error) throw error;
      
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      
      toast.success('Task status updated');
    } catch (error) {
      handleError(error);
    }
  };

  const deleteNotice = async (noticeId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('event_notices')
        .delete()
        .eq('id', noticeId);
        
      if (error) throw error;
      
      setNotices(notices.filter(notice => notice.id !== noticeId));
      toast.success('Notice deleted successfully');
    } catch (error) {
      handleError(error);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('event_tasks')
        .delete()
        .eq('id', taskId);
        
      if (error) throw error;
      
      setTasks(tasks.filter(task => task.id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      handleError(error);
    }
  };

  const deleteTeam = async (teamId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('event_teams')
        .delete()
        .eq('id', teamId);
        
      if (error) throw error;
      
      setTeams(teams.filter(team => team.id !== teamId));
      toast.success('Team deleted successfully');
    } catch (error) {
      handleError(error);
    }
  };

  const addMemberToTeam = () => {
    if (!newMember.trim()) return;
    
    setCurrentTeam({
      ...currentTeam,
      members: [...(currentTeam.members || []), newMember.trim()]
    });
    
    setNewMember('');
  };

  const addEventToTeam = () => {
    if (!newEvent.trim()) return;
    
    setCurrentTeam({
      ...currentTeam,
      events: [...(currentTeam.events || []), newEvent.trim()]
    });
    
    setNewEvent('');
  };

  const removeMemberFromTeam = (memberIndex: number) => {
    const updatedMembers = [...(currentTeam.members || [])];
    updatedMembers.splice(memberIndex, 1);
    setCurrentTeam({ ...currentTeam, members: updatedMembers });
  };

  const removeEventFromTeam = (eventIndex: number) => {
    const updatedEvents = [...(currentTeam.events || [])];
    updatedEvents.splice(eventIndex, 1);
    setCurrentTeam({ ...currentTeam, events: updatedEvents });
  };

  const calculateTaskStats = () => {
    const pending = tasks.filter(task => task.status === 'Pending').length;
    const inProgress = tasks.filter(task => task.status === 'In Progress').length;
    const completed = tasks.filter(task => task.status === 'Completed').length;
    const total = tasks.length;
    
    const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const chartData = [
      { name: 'Pending', value: pending },
      { name: 'In Progress', value: inProgress },
      { name: 'Completed', value: completed }
    ];
    
    return { progressPercentage, chartData };
  };

  const { progressPercentage, chartData } = calculateTaskStats();

  return (
    <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12 animate-fade-in">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-[#0071e3] dark:text-white">
              EventPanda
            </h1>
            <p className="text-xl text-muted-foreground dark:text-white/80">
              Manage tasks, track deadlines, and collaborate seamlessly for any event.
            </p>
          </div>
          
          <div className="space-y-8">
            {/* Section 1: Notice Board */}
            <Card className="shadow-lg border border-border dark:border-white/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Bell className="h-6 w-6" /> Notice Board
                  </CardTitle>
                  <CardDescription>Important updates and deadlines</CardDescription>
                </div>
                <Dialog open={isNoticeDialogOpen} onOpenChange={setIsNoticeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-1">
                      <Plus className="h-4 w-4" /> New Notice
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Notice</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="title" className="text-right text-sm font-medium">Title</label>
                        <Input
                          id="title"
                          className="col-span-3"
                          value={currentNotice.title}
                          onChange={(e) => setCurrentNotice({...currentNotice, title: e.target.value})}
                          placeholder="Notice title"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="description" className="text-right text-sm font-medium">Description</label>
                        <Textarea
                          id="description"
                          className="col-span-3"
                          value={currentNotice.description || ''}
                          onChange={(e) => setCurrentNotice({...currentNotice, description: e.target.value})}
                          placeholder="Notice description"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="deadline" className="text-right text-sm font-medium">Deadline</label>
                        <Input
                          id="deadline"
                          type="datetime-local"
                          className="col-span-3"
                          value={currentNotice.deadline || ''}
                          onChange={(e) => setCurrentNotice({...currentNotice, deadline: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="type" className="text-right text-sm font-medium">Type</label>
                        <Select 
                          value={currentNotice.type} 
                          onValueChange={(value: 'urgent' | 'upcoming' | 'general') => 
                            setCurrentNotice({...currentNotice, type: value})
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="urgent">Urgent</SelectItem>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="general">General</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={addNotice}>Add Notice</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {notices.length === 0 ? (
                  <div className="text-center py-12 bg-muted/30 rounded-lg">
                    <Bell className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-lg font-medium">No notices yet</p>
                    <p className="text-muted-foreground mb-4">Add important updates and deadlines to keep your team informed.</p>
                    <Button onClick={() => setIsNoticeDialogOpen(true)}>Add Your First Notice</Button>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[300px] overflow-auto">
                    {notices.map((notice) => (
                      <div 
                        key={notice.id} 
                        className={`p-4 rounded-lg flex items-start gap-3 cursor-pointer hover:bg-muted transition-colors
                          ${notice.type === 'urgent' ? 'bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30' : 
                            notice.type === 'upcoming' ? 'bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30' : 
                            'bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30'}`
                        }
                      >
                        {notice.type === 'urgent' ? (
                          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                        ) : notice.type === 'upcoming' ? (
                          <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                        ) : (
                          <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        )}
                        <div className="flex-grow">
                          <h3 className={`font-medium 
                            ${notice.type === 'urgent' ? 'text-red-900 dark:text-red-300' : 
                              notice.type === 'upcoming' ? 'text-amber-900 dark:text-amber-300' : 
                              'text-blue-900 dark:text-blue-300'}`
                          }>
                            {notice.title}
                          </h3>
                          {notice.description && (
                            <p className="text-sm text-muted-foreground mt-1">{notice.description}</p>
                          )}
                          {notice.deadline && (
                            <div className="mt-2 flex items-center text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" /> 
                              Due by: {new Date(notice.deadline).toLocaleString()}
                            </div>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => deleteNotice(notice.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section 2: Task Assignment System */}
            <Card className="shadow-lg border border-border dark:border-white/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <FileText className="h-6 w-6" /> Task Assignment
                  </CardTitle>
                  <CardDescription>Manage event-related tasks</CardDescription>
                </div>
                <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-1">
                      <Plus className="h-4 w-4" /> New Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Task</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="name" className="text-right text-sm font-medium">Name</label>
                        <Input
                          id="name"
                          className="col-span-3"
                          value={currentTask.name}
                          onChange={(e) => setCurrentTask({...currentTask, name: e.target.value})}
                          placeholder="Task name"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="assignedTo" className="text-right text-sm font-medium">Assigned To</label>
                        <Input
                          id="assignedTo"
                          className="col-span-3"
                          value={currentTask.assigned_to || ''}
                          onChange={(e) => setCurrentTask({...currentTask, assigned_to: e.target.value})}
                          placeholder="Person responsible"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="dueDate" className="text-right text-sm font-medium">Due Date</label>
                        <Input
                          id="dueDate"
                          type="datetime-local"
                          className="col-span-3"
                          value={currentTask.due_date || ''}
                          onChange={(e) => setCurrentTask({...currentTask, due_date: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="priority" className="text-right text-sm font-medium">Priority</label>
                        <Select 
                          value={currentTask.priority as string} 
                          onValueChange={(value: 'Low' | 'Medium' | 'High') => 
                            setCurrentTask({...currentTask, priority: value})
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="status" className="text-right text-sm font-medium">Status</label>
                        <Select 
                          value={currentTask.status as string} 
                          onValueChange={(value: 'Pending' | 'In Progress' | 'Completed') => 
                            setCurrentTask({...currentTask, status: value})
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={addTask}>Add Task</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <div className="text-center py-12 bg-muted/30 rounded-lg">
                    <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-lg font-medium">No tasks yet</p>
                    <p className="text-muted-foreground mb-4">Add tasks to manage your event more efficiently.</p>
                    <Button onClick={() => setIsTaskDialogOpen(true)}>Add Your First Task</Button>
                  </div>
                ) : (
                  <div className="overflow-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 font-medium">Task Name</th>
                          <th className="text-left py-3 px-2 font-medium">Assigned To</th>
                          <th className="text-left py-3 px-2 font-medium">Due Date</th>
                          <th className="text-left py-3 px-2 font-medium">Priority</th>
                          <th className="text-left py-3 px-2 font-medium">Status</th>
                          <th className="text-left py-3 px-2 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasks.map((task) => (
                          <tr key={task.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-2">{task.name}</td>
                            <td className="py-3 px-2">{task.assigned_to || '-'}</td>
                            <td className="py-3 px-2">{task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}</td>
                            <td className="py-3 px-2">
                              <span 
                                className={`px-2 py-1 rounded text-xs font-medium
                                  ${task.priority === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 
                                    task.priority === 'Medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' : 
                                    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`
                                }
                              >
                                {task.priority}
                              </span>
                            </td>
                            <td className="py-3 px-2">
                              <Select 
                                value={task.status} 
                                onValueChange={(value: 'Pending' | 'In Progress' | 'Completed') => 
                                  updateTaskStatus(task.id, value)
                                }
                              >
                                <SelectTrigger className={`w-32 h-8 text-xs px-2 ${
                                  task.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200' : 
                                  task.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200' : 
                                  'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200'
                                }`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pending">Pending</SelectItem>
                                  <SelectItem value="In Progress">In Progress</SelectItem>
                                  <SelectItem value="Completed">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"  
                                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                  onClick={() => deleteTask(task.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section 3: Teams System */}
            <Card className="shadow-lg border border-border dark:border-white/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Users className="h-6 w-6" /> Teams
                  </CardTitle>
                  <CardDescription>Collaborate with team members</CardDescription>
                </div>
                <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-1">
                      <Plus className="h-4 w-4" /> New Team
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Create New Team</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="teamName" className="text-right text-sm font-medium">Team Name</label>
                        <Input
                          id="teamName"
                          className="col-span-3"
                          value={currentTeam.name}
                          onChange={(e) => setCurrentTeam({...currentTeam, name: e.target.value})}
                          placeholder="Team name"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-start gap-4">
                        <label htmlFor="members" className="text-right text-sm font-medium pt-2">Members</label>
                        <div className="col-span-3 space-y-2">
                          <div className="flex space-x-2">
                            <Input
                              id="members"
                              value={newMember}
                              onChange={(e) => setNewMember(e.target.value)}
                              placeholder="Add team member"
                              className="flex-grow"
                            />
                            <Button type="button" onClick={addMemberToTeam} size="sm">Add</Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {currentTeam.members?.map((member, index) => (
                              <div key={index} className="flex items-center bg-secondary/20 px-2 py-1 rounded-md text-sm">
                                {member}
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-5 w-5 ml-1 text-muted-foreground hover:text-destructive"
                                  onClick={() => removeMemberFromTeam(index)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-start gap-4">
                        <label htmlFor="events" className="text-right text-sm font-medium pt-2">Events</label>
                        <div className="col-span-3 space-y-2">
                          <div className="flex space-x-2">
                            <Input
                              id="events"
                              value={newEvent}
                              onChange={(e) => setNewEvent(e.target.value)}
                              placeholder="Add event"
                              className="flex-grow"
                            />
                            <Button type="button" onClick={addEventToTeam} size="sm">Add</Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {currentTeam.events?.map((event, index) => (
                              <div key={index} className="flex items-center bg-primary/20 px-2 py-1 rounded-md text-sm">
                                {event}
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-5 w-5 ml-1 text-muted-foreground hover:text-destructive"
                                  onClick={() => removeEventFromTeam(index)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={addTeam}>Create Team</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {teams.length === 0 ? (
                  <div className="text-center py-12 bg-muted/30 rounded-lg">
                    <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-lg font-medium">No teams yet</p>
                    <p className="text-muted-foreground mb-4">Create teams to collaborate on events together.</p>
                    <Button onClick={() => setIsTeamDialogOpen(true)}>Create Your First Team</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teams.map((team) => (
                      <Card key={team.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <CardHeader className="bg-muted/50">
                          <CardTitle>{team.name}</CardTitle>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteTeam(team.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Members:</p>
                            {team.members.length > 0 ? (
                              <ul className="text-sm">
                                {team.members.map((member, index) => (
                                  <li key={index} className="ml-2">• {member}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-xs text-muted-foreground italic">No members added</p>
                            )}
                            
                            <p className="text-sm font-medium mt-4">Events:</p>
                            {team.events.length > 0 ? (
                              <ul className="text-sm">
                                {team.events.map((event, index) => (
                                  <li key={index} className="ml-2">• {event}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-xs text-muted-foreground italic">No events assigned</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section 4: Progress Dashboard */}
            <Card className="shadow-lg border border-border dark:border-white/10">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <PieChart className="h-6 w-6" /> Progress Dashboard
                </CardTitle>
                <CardDescription>Track event completion</CardDescription>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <div className="text-center py-12 bg-muted/30 rounded-lg">
                    <PieChart className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-lg font-medium">No data to display yet</p>
                    <p className="text-muted-foreground mb-4">Add tasks to see your progress dashboard.</p>
                    <Button onClick={() => setIsTaskDialogOpen(true)}>Add Your First Task</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Overall Progress</h3>
                      <Progress value={progressPercentage} className="h-4" />
                      <p className="text-center text-sm text-muted-foreground">{progressPercentage}% complete</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-4">Task Breakdown</h3>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            width={500}
                            height={200}
                            data={chartData}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <RechartsTooltip />
                            <Bar dataKey="value" fill="#0071e3" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-4">Upcoming Deadlines</h3>
                      <div className="space-y-2">
                        {tasks
                          .filter(task => task.status !== 'Completed' && task.due_date)
                          .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
                          .slice(0, 3)
                          .map((task) => (
                            <div key={task.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                              <span>{task.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {task.due_date && new Date(task.due_date).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        {tasks.filter(task => task.status !== 'Completed' && task.due_date).length === 0 && (
                          <p className="text-center text-muted-foreground py-4">No upcoming deadlines</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <footer className="py-6 border-t border-border dark:border-white/10">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-sm text-muted-foreground dark:text-white/60">
            Developed By J Riteesh Reddy
          </p>
        </div>
      </footer>
    </div>
  );
};

export default EventPanda;
