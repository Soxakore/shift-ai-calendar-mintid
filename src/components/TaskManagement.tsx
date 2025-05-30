
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Calendar, Clock, User, CheckCircle, AlertCircle, Circle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  createdAt: string;
}

const TaskManagement = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Complete weekly inventory',
      description: 'Count and record all kitchen supplies',
      dueDate: '2025-06-02',
      status: 'pending',
      priority: 'high',
      assignedTo: 'Mary Cook',
      createdAt: '2025-05-30'
    },
    {
      id: '2',
      title: 'Deep clean fryer',
      description: 'Perform maintenance on deep fryer unit #2',
      dueDate: '2025-06-01',
      status: 'in-progress',
      priority: 'medium',
      assignedTo: 'John Doe',
      createdAt: '2025-05-29'
    },
    {
      id: '3',
      title: 'Train new employee',
      description: 'Onboard new team member on safety protocols',
      dueDate: '2025-05-31',
      status: 'completed',
      priority: 'high',
      assignedTo: 'Jane Smith',
      createdAt: '2025-05-28'
    }
  ]);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignedTo: ''
  });

  const addTask = () => {
    if (!newTask.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task title",
        variant: "destructive"
      });
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      ...newTask,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setTasks([...tasks, task]);
    setNewTask({ title: '', description: '', dueDate: '', priority: 'medium', assignedTo: '' });
    
    toast({
      title: "✅ Task Created",
      description: `"${task.title}" has been added successfully`
    });
  };

  const updateTaskStatus = (id: string, status: 'pending' | 'in-progress' | 'completed') => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, status } : task
    ));
    
    const task = tasks.find(t => t.id === id);
    toast({
      title: "📋 Task Updated",
      description: `"${task?.title}" status changed to ${status}`
    });
  };

  const deleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    setTasks(tasks.filter(t => t.id !== id));
    
    toast({
      title: "🗑️ Task Deleted",
      description: `"${task?.title}" has been removed`
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in-progress': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default: return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Task */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Task Management</h2>
          <p className="text-gray-600">Manage and track team tasks</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  placeholder="Enter task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Task description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={newTask.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewTask({ ...newTask, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="assignedTo">Assign To</Label>
                <Input
                  id="assignedTo"
                  placeholder="Employee name"
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                />
              </div>
              
              <Button onClick={addTask} className="w-full">Create Task</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {getStatusIcon(task.status)}
                  {task.title}
                </CardTitle>
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">{task.description}</p>
              
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                Due: {task.dueDate}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <User className="w-4 h-4" />
                {task.assignedTo}
              </div>
              
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(task.status)}>
                  {task.status.replace('-', ' ')}
                </Badge>
                
                <div className="flex gap-1">
                  {task.status !== 'completed' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateTaskStatus(task.id, task.status === 'pending' ? 'in-progress' : 'completed')}
                      >
                        {task.status === 'pending' ? 'Start' : 'Complete'}
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteTask(task.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {tasks.filter(t => t.status === 'pending').length}
              </div>
              <p className="text-sm text-gray-500">Pending Tasks</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {tasks.filter(t => t.status === 'in-progress').length}
              </div>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {tasks.filter(t => t.status === 'completed').length}
              </div>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskManagement;
