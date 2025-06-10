import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Users, 
  Edit, 
  Eye, 
  MousePointer,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { usePresence } from '@/hooks/usePresence';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface ScheduleCollaborator {
  user_id: string;
  username: string;
  display_name: string;
  action: 'viewing' | 'editing' | 'selecting';
  target_date?: string;
  target_employee?: string;
  cursor_position?: { x: number; y: number };
  last_activity: string;
}

const CollaborativeScheduleEditor = () => {
  const { user } = useSupabaseAuth();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const { 
    onlineUsers, 
    isTracking, 
    startTracking, 
    updateStatus 
  } = usePresence('schedule_editor', user);

  useEffect(() => {
    if (user && !isTracking) {
      startTracking({
        status: 'online',
        current_activity: 'working',
        location: 'schedule_editor'
      });
    }
  }, [user, isTracking, startTracking]);

  // Track mouse movement for collaborative cursors
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = { x: e.clientX, y: e.clientY };
      setMousePosition(newPosition);
      
      // Update presence with cursor position (throttled)
      if (Math.random() < 0.1) { // Only update 10% of the time to avoid spam
        updateStatus({
          current_activity: 'viewing',
          location: 'schedule_editor'
        });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [updateStatus]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    updateStatus({
      current_activity: 'selecting',
      location: `schedule_editor_${date}`
    });
  };

  const handleStartEditing = () => {
    updateStatus({
      current_activity: 'editing',
      location: `schedule_editor_${selectedDate}`
    });
  };

  const getActivityIcon = (activity?: string) => {
    switch (activity) {
      case 'editing': return <Edit className="h-4 w-4 text-blue-500" />;
      case 'selecting': return <MousePointer className="h-4 w-4 text-orange-500" />;
      default: return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityColor = (activity?: string) => {
    switch (activity) {
      case 'editing': return 'bg-blue-100 text-blue-800';
      case 'selecting': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter users by their location to show only those in schedule editor
  const scheduleUsers = onlineUsers.filter(u => 
    u.location?.includes('schedule_editor')
  );

  // Group users by what they're doing
  const editingUsers = scheduleUsers.filter(u => u.current_activity === 'editing');
  const viewingUsers = scheduleUsers.filter(u => u.current_activity === 'viewing');
  const selectingUsers = scheduleUsers.filter(u => u.current_activity === 'selecting');

  const generateCalendarDays = () => {
    const today = new Date();
    const days = [];
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date.toISOString().split('T')[0]);
    }
    
    return days;
  };

  const getUsersOnDate = (date: string) => {
    return scheduleUsers.filter(u => 
      u.location?.includes(date)
    );
  };

  const isDateBeingEdited = (date: string) => {
    return scheduleUsers.some(u => 
      u.location?.includes(date) && u.current_activity === 'editing'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Live Collaborators */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Collaborative Schedule Editor</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{scheduleUsers.length} collaborating</span>
          </Badge>
          
          {/* Live Collaborators Avatars */}
          <div className="flex -space-x-2">
            {scheduleUsers.slice(0, 5).map((user) => (
              <Avatar key={user.user_id} className="h-8 w-8 border-2 border-white">
                <AvatarFallback className="text-xs">
                  {user.display_name?.slice(0, 2).toUpperCase() || 'UN'}
                </AvatarFallback>
              </Avatar>
            ))}
            {scheduleUsers.length > 5 && (
              <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium">
                +{scheduleUsers.length - 5}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-blue-600">
              <Edit className="h-5 w-5" />
              <span>Currently Editing</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editingUsers.length > 0 ? (
              <div className="space-y-2">
                {editingUsers.map((user) => (
                  <div key={user.user_id} className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {user.display_name?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-sm">
                      <div className="font-medium">{user.display_name}</div>
                      {user.location?.includes('_') && (
                        <div className="text-xs text-blue-600">
                          Editing {user.location.split('_')[1]}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No one is currently editing</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-orange-600">
              <MousePointer className="h-5 w-5" />
              <span>Selecting Dates</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectingUsers.length > 0 ? (
              <div className="space-y-2">
                {selectingUsers.map((user) => (
                  <div key={user.user_id} className="flex items-center space-x-2 p-2 bg-orange-50 rounded">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {user.display_name?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-sm">
                      <div className="font-medium">{user.display_name}</div>
                      <div className="text-xs text-orange-600">
                        Selecting schedules
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No one is selecting</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-gray-600">
              <Eye className="h-5 w-5" />
              <span>Viewing</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {viewingUsers.length > 0 ? (
              <div className="space-y-2">
                {viewingUsers.map((user) => (
                  <div key={user.user_id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {user.display_name?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-sm">
                      <div className="font-medium">{user.display_name}</div>
                      <div className="text-xs text-gray-600">
                        Browsing schedules
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No one is viewing</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Interactive Calendar Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule Calendar</CardTitle>
          <CardDescription>
            Click on a date to select it. See real-time collaboration as others work.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {generateCalendarDays().map((date) => {
              const usersOnDate = getUsersOnDate(date);
              const isBeingEdited = isDateBeingEdited(date);
              const isSelected = selectedDate === date;
              
              return (
                <div
                  key={date}
                  className={`
                    relative p-3 rounded-lg border-2 cursor-pointer transition-all
                    ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
                    ${isBeingEdited ? 'ring-2 ring-orange-300 ring-opacity-50' : ''}
                  `}
                  onClick={() => handleDateSelect(date)}
                >
                  <div className="text-sm font-medium">
                    {new Date(date).getDate()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  
                  {/* Show collaborators on this date */}
                  {usersOnDate.length > 0 && (
                    <div className="absolute -top-1 -right-1 flex -space-x-1">
                      {usersOnDate.slice(0, 3).map((user) => (
                        <div
                          key={user.user_id}
                          className={`
                            h-4 w-4 rounded-full border border-white
                            ${user.current_activity === 'editing' ? 'bg-blue-500' : 
                              user.current_activity === 'selecting' ? 'bg-orange-500' : 'bg-gray-400'}
                          `}
                          title={`${user.display_name} is ${user.current_activity}`}
                        />
                      ))}
                      {usersOnDate.length > 3 && (
                        <div className="h-4 w-4 rounded-full bg-gray-300 border border-white text-xs flex items-center justify-center">
                          +
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Warning for conflicts */}
                  {isBeingEdited && (
                    <div className="absolute bottom-1 right-1">
                      <AlertTriangle className="h-3 w-3 text-orange-500" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Actions */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>
              Actions for {new Date(selectedDate).toLocaleDateString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Button onClick={handleStartEditing}>
                <Edit className="h-4 w-4 mr-2" />
                Start Editing
              </Button>
              
              {isDateBeingEdited(selectedDate) && (
                <div className="flex items-center space-x-2 text-orange-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">
                    Someone else is editing this date
                  </span>
                </div>
              )}
            </div>
            
            {/* Show who's working on this date */}
            {getUsersOnDate(selectedDate).length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Others working on this date:</h4>
                <div className="flex space-x-2">
                  {getUsersOnDate(selectedDate).map((user) => (
                    <Badge
                      key={user.user_id}
                      variant="outline"
                      className={getActivityColor(user.current_activity)}
                    >
                      {getActivityIcon(user.current_activity)}
                      <span className="ml-1">{user.display_name}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CollaborativeScheduleEditor;
