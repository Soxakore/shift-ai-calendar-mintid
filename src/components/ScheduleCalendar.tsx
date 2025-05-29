
import { useState, useEffect } from 'react';
import { getShifts, addShift } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

interface Shift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  type?: 'Day' | 'Night' | 'Overtime';
  createdAt?: string;
}

interface ScheduleCalendarProps {
  currentDate: Date;
}

const ScheduleCalendar = ({ currentDate }: ScheduleCalendarProps) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newShift, setNewShift] = useState<{
    startTime: string;
    endTime: string;
    type: 'Day' | 'Night' | 'Overtime';
  }>({
    startTime: '',
    endTime: '',
    type: 'Day'
  });

  useEffect(() => {
    loadShifts();
  }, []);

  const loadShifts = () => {
    const allShifts = getShifts();
    setShifts(allShifts);
  };

  const handleAddShift = () => {
    if (selectedDate && newShift.startTime && newShift.endTime) {
      const hours = calculateHours(newShift.startTime, newShift.endTime);
      const shift = {
        date: selectedDate,
        startTime: newShift.startTime,
        endTime: newShift.endTime,
        hours: hours,
        type: newShift.type,
        createdAt: new Date().toISOString()
      };
      
      addShift(shift);
      loadShifts();
      setIsDialogOpen(false);
      setNewShift({ startTime: '', endTime: '', type: 'Day' });
      setSelectedDate('');
    }
  };

  const openAddShiftDialog = (date: Date) => {
    setSelectedDate(formatDateKey(date));
    setIsDialogOpen(true);
  };

  const getShiftForDate = (date: Date) => {
    const dateKey = formatDateKey(date);
    return shifts.find(shift => shift.date === dateKey);
  };

  const calculateHours = (startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const start = startHour + startMin / 60;
    let end = endHour + endMin / 60;
    
    // Handle overnight shifts
    if (end < start) {
      end += 24;
    }
    
    return Math.round((end - start) * 10) / 10;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDay = new Date(startDate);
    
    while (days.length < 42) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="w-full">
      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const shift = getShiftForDate(day);
          const isInCurrentMonth = isCurrentMonth(day);
          const hours = shift ? calculateHours(shift.startTime, shift.endTime) : 0;
          
          return (
            <div
              key={index}
              className={`
                min-h-[80px] p-1 border border-gray-200 rounded-lg
                ${isInCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                hover:bg-blue-50 transition-colors cursor-pointer
              `}
              onClick={() => isInCurrentMonth && openAddShiftDialog(day)}
            >
              <div className={`text-sm ${isInCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                {day.getDate()}
              </div>
              
              {shift && (
                <div className="mt-1">
                  <div className={`text-xs px-2 py-1 rounded text-center ${
                    shift.type === 'Overtime' ? 'bg-red-100 text-red-800' :
                    shift.type === 'Night' ? 'bg-purple-100 text-purple-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    <div className="font-medium">{hours}h</div>
                    <div className="text-xs">{shift.startTime}-{shift.endTime}</div>
                  </div>
                </div>
              )}
              
              {!shift && isInCurrentMonth && (
                <div className="mt-1 flex justify-center">
                  <Plus className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Shift Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Shift for {selectedDate}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={newShift.startTime}
                onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={newShift.endTime}
                onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="type">Shift Type</Label>
              <select
                id="type"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={newShift.type}
                onChange={(e) => setNewShift({ ...newShift, type: e.target.value as 'Day' | 'Night' | 'Overtime' })}
              >
                <option value="Day">Day Shift</option>
                <option value="Night">Night Shift</option>
                <option value="Overtime">Overtime</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddShift}>
                Add Shift
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduleCalendar;
