
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Calendar, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';

interface Shift {
  id: string;
  userId: string;
  userName: string;
  date: string;
  startTime: string;
  endTime: string;
  role: string;
  status: 'confirmed' | 'pending' | 'conflict';
}

const ScheduleManagement = () => {
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('2024-05');
  
  const [shifts, setShifts] = useState<Shift[]>([
    {
      id: '1',
      userId: '1',
      userName: 'John Smith',
      date: '2024-05-10',
      startTime: '08:00',
      endTime: '16:00',
      role: 'Office',
      status: 'confirmed'
    },
    {
      id: '2',
      userId: '2',
      userName: 'Jane Doe',
      date: '2024-05-10',
      startTime: '16:00',
      endTime: '00:00',
      role: 'Night Shift',
      status: 'pending'
    },
    {
      id: '3',
      userId: '1',
      userName: 'John Smith',
      date: '2024-05-11',
      startTime: '07:00',
      endTime: '15:00',
      role: 'Morning',
      status: 'conflict'
    }
  ]);

  const [newShift, setNewShift] = useState({
    userId: '',
    date: '',
    startTime: '',
    endTime: '',
    role: ''
  });

  const users = [
    { id: '1', name: 'John Smith' },
    { id: '2', name: 'Jane Doe' },
    { id: '3', name: 'Michael Brown' }
  ];

  const addShift = () => {
    const user = users.find(u => u.id === newShift.userId);
    if (!user) return;

    const shift: Shift = {
      id: Date.now().toString(),
      userId: newShift.userId,
      userName: user.name,
      date: newShift.date,
      startTime: newShift.startTime,
      endTime: newShift.endTime,
      role: newShift.role,
      status: 'pending'
    };
    
    setShifts([...shifts, shift]);
    setNewShift({ userId: '', date: '', startTime: '', endTime: '', role: '' });
  };

  const deleteShift = (id: string) => {
    setShifts(shifts.filter(shift => shift.id !== id));
  };

  const filteredShifts = shifts.filter(shift => 
    (selectedUser === 'all' || shift.userId === selectedUser) &&
    shift.date.startsWith(selectedMonth)
  );

  const conflictCount = shifts.filter(shift => shift.status === 'conflict').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Schedule Management
          </CardTitle>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Assign Shift
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign New Shift</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Select value={newShift.userId} onValueChange={(value) => setNewShift({ ...newShift, userId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select User" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="date"
                    value={newShift.date}
                    onChange={(e) => setNewShift({ ...newShift, date: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="time"
                      placeholder="Start Time"
                      value={newShift.startTime}
                      onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
                    />
                    <Input
                      type="time"
                      placeholder="End Time"
                      value={newShift.endTime}
                      onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
                    />
                  </div>
                  <Input
                    placeholder="Role/Department"
                    value={newShift.role}
                    onChange={(e) => setNewShift({ ...newShift, role: e.target.value })}
                  />
                  <Button onClick={addShift} className="w-full">Assign Shift</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-48"
            />
            {conflictCount > 0 && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span>{conflictCount} conflict(s) detected</span>
              </div>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShifts.map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell>{shift.userName}</TableCell>
                  <TableCell>{shift.date}</TableCell>
                  <TableCell>{shift.startTime} - {shift.endTime}</TableCell>
                  <TableCell>{shift.role}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      shift.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      shift.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {shift.status}
                    </span>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button size="sm" variant="outline">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteShift(shift.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleManagement;
