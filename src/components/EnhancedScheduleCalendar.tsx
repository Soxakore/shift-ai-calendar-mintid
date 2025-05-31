
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScheduleItem {
  day: string;
  date: number;
  hours: string;
  time: string;
}

interface DayNote {
  date: number;
  note: string;
  timestamp: string;
  status: 'pending' | 'handled';
}

interface EnhancedScheduleCalendarProps {
  currentDate: Date;
  scheduleData: ScheduleItem[];
}

const EnhancedScheduleCalendar = ({ currentDate, scheduleData }: EnhancedScheduleCalendarProps) => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [dayNotes, setDayNotes] = useState<DayNote[]>([]);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const calculateHours = (timeRange: string): number => {
    if (!timeRange || !timeRange.includes('-')) return 0;
    
    const [startTime, endTime] = timeRange.split('-');
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let start = startHour + (startMin || 0) / 60;
    let end = endHour + (endMin || 0) / 60;
    
    // Handle overnight shifts
    if (end < start) {
      end += 24;
    }
    
    return Math.round((end - start) * 10) / 10;
  };

  const handleDayClick = (date: number) => {
    setSelectedDate(date);
    const existingNote = dayNotes.find(note => note.date === date);
    setNoteText(existingNote?.note || '');
    setIsNoteDialogOpen(true);
  };

  const handleSaveNote = () => {
    if (!selectedDate || !noteText.trim()) return;

    const newNote: DayNote = {
      date: selectedDate,
      note: noteText.trim(),
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    setDayNotes(prev => {
      const filtered = prev.filter(note => note.date !== selectedDate);
      return [...filtered, newNote];
    });

    // Send notification to manager/admin
    toast({
      title: "Note Sent to Manager",
      description: `Your note for ${currentDate.toLocaleDateString('en-US', { month: 'long' })} ${selectedDate} has been sent to your manager.`,
    });

    setIsNoteDialogOpen(false);
    setNoteText('');
    setSelectedDate(null);
  };

  const handleMarkAsHandled = (date: number) => {
    setDayNotes(prev => 
      prev.map(note => 
        note.date === date ? { ...note, status: 'handled' } : note
      )
    );
    
    toast({
      title: "Note Handled",
      description: "Manager has acknowledged your note.",
    });
  };

  // Generate calendar days
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    
    // Adjust to start on Monday
    const dayOfWeek = firstDay.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(startDate.getDate() - mondayOffset);
    
    const days = [];
    const currentDay = new Date(startDate);
    
    while (days.length < 42) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const days = getDaysInMonth();

  return (
    <div className="w-full">
      {/* Week headers */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 py-3">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid - now with broader spacing */}
      <div className="grid grid-cols-7 gap-3">
        {days.map((day, index) => {
          const dayNumber = day.getDate();
          const isInCurrentMonth = isCurrentMonth(day);
          const scheduleItem = scheduleData.find(item => item.date === dayNumber && isInCurrentMonth);
          const dayNote = dayNotes.find(note => note.date === dayNumber);
          const hours = scheduleItem ? calculateHours(scheduleItem.time) : 0;
          
          return (
            <div
              key={index}
              className={`
                min-h-[100px] p-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl
                ${isInCurrentMonth ? 'bg-white dark:bg-slate-700' : 'bg-gray-50 dark:bg-slate-800'}
                hover:bg-blue-50 dark:hover:bg-slate-600 transition-colors cursor-pointer
                hover:border-blue-300 dark:hover:border-blue-500
              `}
              onClick={() => isInCurrentMonth && handleDayClick(dayNumber)}
            >
              <div className={`text-lg font-medium mb-2 ${isInCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}`}>
                {dayNumber}
              </div>
              
              {scheduleItem && (
                <div className="mb-2">
                  <div className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-lg text-center">
                    <div className="font-medium">{hours}h</div>
                    <div className="text-xs mt-1 leading-tight">{scheduleItem.time}</div>
                  </div>
                </div>
              )}

              {dayNote && (
                <div className="mb-2">
                  <div className={`text-xs px-2 py-1 rounded-lg flex items-center gap-1 ${
                    dayNote.status === 'handled' 
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                  }`}>
                    <MessageSquare className="w-3 h-3" />
                    <span className="truncate">{dayNote.note.substring(0, 15)}...</span>
                  </div>
                </div>
              )}
              
              {!scheduleItem && !dayNote && isInCurrentMonth && (
                <div className="flex justify-center items-center h-8">
                  <Plus className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Note Dialog */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Add Note for {currentDate.toLocaleDateString('en-US', { month: 'long' })} {selectedDate}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="note">Note for Manager/Admin</Label>
              <Textarea
                id="note"
                placeholder="Enter your note (e.g., need time off, schedule change request, etc.)"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsNoteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveNote}
                disabled={!noteText.trim()}
              >
                Send to Manager
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notes Summary */}
      {dayNotes.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Your Notes This Month</h4>
          <div className="space-y-2">
            {dayNotes.map((note) => (
              <div key={note.date} className="flex items-center justify-between p-2 bg-white dark:bg-slate-700 rounded">
                <div className="flex-1">
                  <span className="text-sm font-medium">{currentDate.toLocaleDateString('en-US', { month: 'short' })} {note.date}: </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{note.note}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    note.status === 'handled' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {note.status === 'handled' ? 'Handled' : 'Pending'}
                  </span>
                  {note.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkAsHandled(note.date)}
                      className="text-xs"
                    >
                      Mark Handled
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedScheduleCalendar;
