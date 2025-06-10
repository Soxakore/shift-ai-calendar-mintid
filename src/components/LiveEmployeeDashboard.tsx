import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Clock, 
  MapPin, 
  Monitor, 
  Smartphone, 
  Tablet,
  Circle,
  Coffee,
  Phone,
  Briefcase
} from 'lucide-react';
import { usePresence, UserPresence } from '@/hooks/usePresence';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

const LiveEmployeeDashboard = () => {
  const { user, profile } = useSupabaseAuth();
  const { 
    onlineUsers, 
    isTracking, 
    startTracking, 
    updateStatus, 
    totalOnlineUsers 
  } = usePresence('employee_workspace', user);

  useEffect(() => {
    if (user && !isTracking) {
      startTracking({
        status: 'online',
        current_activity: 'working',
        location: profile?.department_id || 'office'
      });
    }
  }, [user, isTracking, startTracking, profile]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'away': return 'text-yellow-500';
      case 'busy': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'online': return 'default';
      case 'away': return 'secondary';
      case 'busy': return 'destructive';
      default: return 'outline';
    }
  };

  const getActivityIcon = (activity?: string) => {
    switch (activity) {
      case 'working': return <Briefcase className="h-4 w-4" />;
      case 'break': return <Coffee className="h-4 w-4" />;
      case 'meeting': return <Phone className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getDeviceIcon = (device?: string) => {
    switch (device) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const handleStatusChange = (newStatus: 'online' | 'away' | 'busy') => {
    updateStatus({ status: newStatus });
  };

  const handleActivityChange = (activity: 'working' | 'break' | 'meeting') => {
    updateStatus({ current_activity: activity });
  };

  const groupedUsers = onlineUsers.reduce((acc, user) => {
    const status = user.status;
    if (!acc[status]) acc[status] = [];
    acc[status].push(user);
    return acc;
  }, {} as Record<string, UserPresence[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Live Employee Status</h2>
          <Badge variant="outline" className="ml-2">
            {totalOnlineUsers} online
          </Badge>
        </div>

        {/* Personal Status Controls */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Your status:</span>
          <div className="flex space-x-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange('online')}
              className="text-green-600 hover:bg-green-50"
            >
              <Circle className="h-3 w-3 mr-1 fill-current" />
              Online
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange('away')}
              className="text-yellow-600 hover:bg-yellow-50"
            >
              <Circle className="h-3 w-3 mr-1 fill-current" />
              Away
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange('busy')}
              className="text-red-600 hover:bg-red-50"
            >
              <Circle className="h-3 w-3 mr-1 fill-current" />
              Busy
            </Button>
          </div>
        </div>
      </div>

      {/* Activity Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Current Activity</CardTitle>
          <CardDescription>Let others know what you're working on</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleActivityChange('working')}
            >
              <Briefcase className="h-4 w-4 mr-1" />
              Working
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleActivityChange('break')}
            >
              <Coffee className="h-4 w-4 mr-1" />
              On Break
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleActivityChange('meeting')}
            >
              <Phone className="h-4 w-4 mr-1" />
              In Meeting
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Online Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-600">
              <Circle className="h-4 w-4 fill-current" />
              <span>Online ({groupedUsers.online?.length || 0})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {groupedUsers.online?.map((user) => (
              <div key={user.user_id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {user.display_name?.slice(0, 2).toUpperCase() || 'UN'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{user.display_name}</div>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      {getActivityIcon(user.current_activity)}
                      <span>{user.current_activity || 'idle'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {getDeviceIcon(user.device)}
                  {user.location && (
                    <div className="flex items-center space-x-1 text-xs">
                      <MapPin className="h-3 w-3" />
                      <span>{user.location}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {(!groupedUsers.online || groupedUsers.online.length === 0) && (
              <div className="text-center text-muted-foreground text-sm py-4">
                No users currently online
              </div>
            )}
          </CardContent>
        </Card>

        {/* Away Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-yellow-600">
              <Circle className="h-4 w-4 fill-current" />
              <span>Away ({groupedUsers.away?.length || 0})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {groupedUsers.away?.map((user) => (
              <div key={user.user_id} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {user.display_name?.slice(0, 2).toUpperCase() || 'UN'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{user.display_name}</div>
                    <div className="text-xs text-muted-foreground">
                      Last seen: {new Date(user.last_seen).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                {getDeviceIcon(user.device)}
              </div>
            ))}
            {(!groupedUsers.away || groupedUsers.away.length === 0) && (
              <div className="text-center text-muted-foreground text-sm py-4">
                No users currently away
              </div>
            )}
          </CardContent>
        </Card>

        {/* Busy Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <Circle className="h-4 w-4 fill-current" />
              <span>Busy ({groupedUsers.busy?.length || 0})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {groupedUsers.busy?.map((user) => (
              <div key={user.user_id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {user.display_name?.slice(0, 2).toUpperCase() || 'UN'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{user.display_name}</div>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      {getActivityIcon(user.current_activity)}
                      <span>{user.current_activity || 'busy'}</span>
                    </div>
                  </div>
                </div>
                {getDeviceIcon(user.device)}
              </div>
            ))}
            {(!groupedUsers.busy || groupedUsers.busy.length === 0) && (
              <div className="text-center text-muted-foreground text-sm py-4">
                No users currently busy
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Real-time Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Live updates from your team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {onlineUsers.slice(0, 5).map((user) => (
              <div key={user.user_id} className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-lg">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {user.display_name?.slice(0, 2).toUpperCase() || 'UN'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-sm">
                  <span className="font-medium">{user.display_name}</span>
                  <span className="text-muted-foreground"> is </span>
                  <Badge variant={getStatusBadgeVariant(user.status)} className="text-xs">
                    {user.status}
                  </Badge>
                  {user.current_activity && (
                    <>
                      <span className="text-muted-foreground"> and </span>
                      <span className="font-medium">{user.current_activity}</span>
                    </>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(user.last_seen).toLocaleTimeString()}
                </span>
              </div>
            ))}
            {onlineUsers.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                No activity to display. Be the first to join!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveEmployeeDashboard;
