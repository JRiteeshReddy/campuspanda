
import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Bell, 
  Calendar, 
  CheckCircle, 
  Clock, 
  FileText,
  PieChart, 
  Plus, 
  Users
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import Navbar from '@/components/layout/Navbar';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Sample data for demonstration
const noticeData = [
  { id: 1, type: 'urgent', title: 'Submit venue booking receipt', deadline: '2023-06-15', description: 'Need the receipt for accounting purposes' },
  { id: 2, type: 'upcoming', title: 'Finalize catering menu', deadline: '2023-06-20', description: 'Need to confirm final headcount' },
  { id: 3, type: 'general', title: 'Team meeting', deadline: '2023-06-17', description: 'Weekly sync at 10 AM' },
  { id: 4, type: 'urgent', title: 'Confirm speaker availability', deadline: '2023-06-16', description: 'Follow up with all speakers' },
];

const taskData = [
  { id: 1, name: 'Book venue', assignedTo: 'John Doe', dueDate: '2023-06-18', priority: 'High', status: 'Completed' },
  { id: 2, name: 'Send invitations', assignedTo: 'Jane Smith', dueDate: '2023-06-20', priority: 'Medium', status: 'In Progress' },
  { id: 3, name: 'Arrange catering', assignedTo: 'Mike Johnson', dueDate: '2023-06-25', priority: 'High', status: 'Pending' },
  { id: 4, name: 'Setup equipment', assignedTo: 'Sarah Williams', dueDate: '2023-06-30', priority: 'Medium', status: 'Pending' },
];

const teamData = [
  { id: 1, name: 'Marketing Team', members: ['John Doe (Lead)', 'Jane Smith', 'Mike Johnson'], events: ['Product Launch', 'Annual Conference'] },
  { id: 2, name: 'Logistics Team', members: ['Sarah Williams (Lead)', 'David Brown', 'Lisa Davis'], events: ['Annual Conference', 'Workshop Series'] },
  { id: 3, name: 'Content Team', members: ['Michael Clark (Lead)', 'Emma Wilson', 'Robert Taylor'], events: ['Product Launch'] },
];

const chartData = [
  { name: 'Pending', value: 10 },
  { name: 'In Progress', value: 5 },
  { name: 'Completed', value: 15 },
];

const EventPanda = () => {
  const [activeTab, setActiveTab] = useState('notice');

  // Calculate progress percentage
  const totalTasks = chartData.reduce((sum, item) => sum + item.value, 0);
  const completedTasks = chartData.find(item => item.name === 'Completed')?.value || 0;
  const progressPercentage = Math.round((completedTasks / totalTasks) * 100);

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
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[300px] overflow-auto">
                  {noticeData.map((notice) => (
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
                      <div>
                        <h3 className={`font-medium 
                          ${notice.type === 'urgent' ? 'text-red-900 dark:text-red-300' : 
                            notice.type === 'upcoming' ? 'text-amber-900 dark:text-amber-300' : 
                            'text-blue-900 dark:text-blue-300'}`
                        }>
                          {notice.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">{notice.description}</p>
                        <div className="mt-2 flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" /> Due by: {notice.deadline}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                <button className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-2 rounded-md hover:bg-primary/90 transition-colors">
                  <Plus className="h-4 w-4" /> New Task
                </button>
              </CardHeader>
              <CardContent>
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
                      {taskData.map((task) => (
                        <tr key={task.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-2">{task.name}</td>
                          <td className="py-3 px-2">{task.assignedTo}</td>
                          <td className="py-3 px-2">{task.dueDate}</td>
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
                            <span 
                              className={`px-2 py-1 rounded text-xs font-medium
                                ${task.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                                  task.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 
                                  'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'}`
                              }
                            >
                              {task.status}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                Edit
                              </button>
                              <button className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                <button className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-2 rounded-md hover:bg-primary/90 transition-colors">
                  <Plus className="h-4 w-4" /> New Team
                </button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teamData.map((team) => (
                    <Card key={team.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardHeader className="bg-muted/50">
                        <CardTitle>{team.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Members:</p>
                          <ul className="text-sm">
                            {team.members.map((member, index) => (
                              <li key={index} className="ml-2">• {member}</li>
                            ))}
                          </ul>
                          <p className="text-sm font-medium mt-4">Events:</p>
                          <ul className="text-sm">
                            {team.events.map((event, index) => (
                              <li key={index} className="ml-2">• {event}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <button className="text-primary hover:underline text-sm">
                            View Details
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
                          <Tooltip />
                          <Bar dataKey="value" fill="#0071e3" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-4">Upcoming Deadlines</h3>
                    <div className="space-y-2">
                      {taskData
                        .filter(task => task.status !== 'Completed')
                        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                        .slice(0, 3)
                        .map((task) => (
                          <div key={task.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                            <span>{task.name}</span>
                            <span className="text-sm text-muted-foreground">{task.dueDate}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
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
