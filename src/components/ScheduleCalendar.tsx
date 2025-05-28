
import { useState } from 'react';

interface Shift {
  id: string;
  start: string;
  end: string;
  hours: number;
  type?: string;
}

interface ScheduleCalendarProps {
  currentDate: Date;
}

const ScheduleCalendar = ({ currentDate }: ScheduleCalendarProps) => {
  const [shifts] = useState<Record<string, Shift>>({
    '2025-05-01': { id: '1', start: '20:50', end: '07:08', hours: 6, type: 'Night' },
    '2025-05-02': { id: '2', start: '20:50', end: '09:00', hours: 16 },
    '2025-05-06': { id: '3', start: '28:30', end: 'fri', hours: 30 },
    '2025-05-07': { id: '4', start: '22:30', end: 'fri', hours: 26 },
    '2025-05-27': { id: '5', start: '20:50', end: '03:00', hours: 84 },
  });

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
          const dateKey = formatDateKey(day);
          const shift = shifts[dateKey];
          const isInCurrentMonth = isCurrentMonth(day);
          
          return (
            <div
              key={index}
              className={`
                min-h-[80px] p-1 border border-gray-200 rounded-lg
                ${isInCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                hover:bg-blue-50 transition-colors cursor-pointer
              `}
            >
              <div className={`text-sm ${isInCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                {day.getDate()}
              </div>
              
              {shift && (
                <div className="mt-1">
                  <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded text-center">
                    <div className="font-medium">{shift.hours} h</div>
                    <div className="text-xs">{shift.start}-{shift.end}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScheduleCalendar;
