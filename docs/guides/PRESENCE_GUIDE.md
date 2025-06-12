# 🌐 Supabase Presence - Real-time Collaboration Guide

## What You Can Build with Supabase Presence

Supabase Presence allows you to track user state in real-time across clients. Here's what you can build for your MinTid application:

## 🎯 **Practical Use Cases We've Built**

### 1. **🟢 Live Employee Status Dashboard**
**Component:** `LiveEmployeeDashboard.tsx`

**Features:**
- Real-time online/offline/busy status
- Current activity tracking (working, break, meeting)
- Device type detection (desktop, mobile, tablet)
- Location awareness (which department/area)
- Activity feed with timestamps

**Benefits:**
- Managers see who's available instantly
- Employees can coordinate breaks and meetings
- Emergency response - know who's on-site
- Reduce interruptions by seeing busy status

### 2. **👥 Collaborative Schedule Editor**
**Component:** `CollaborativeScheduleEditor.tsx`

**Features:**
- See who's editing which dates in real-time
- Prevent scheduling conflicts
- Live cursors and selection indicators
- Activity-based notifications
- Conflict warnings and resolution

**Benefits:**
- Multiple managers can work on schedules simultaneously
- Prevent overwriting each other's work
- Coordinate schedule changes efficiently
- Real-time feedback on conflicts

### 3. **🔔 Presence-Aware Notifications**
**Function:** `presence-notifications`

**Features:**
- Smart notification routing based on online status
- Priority-based delivery methods
- Activity-aware messaging (don't disturb meetings)
- Multi-channel delivery (real-time, email, SMS)

**Benefits:**
- Urgent messages reach online users instantly
- Offline users get emails instead
- Respect user's current activity status
- Reduce notification fatigue

## 🛠 **Implementation Components**

### 📱 **React Hook: `usePresence`**

```typescript
const { 
  onlineUsers, 
  isTracking, 
  startTracking, 
  updateStatus 
} = usePresence('workspace_channel', currentUser);
```

**Key Features:**
- Automatic activity detection (mouse, keyboard)
- Visibility change tracking (tab switching)
- Device type detection
- Clean disconnect handling

### 🎨 **UI Components Created:**

1. **LiveEmployeeDashboard** - Real-time team status
2. **CollaborativeScheduleEditor** - Multi-user schedule editing
3. **PresenceIndicator** - Status badges and avatars
4. **ActivityFeed** - Live activity updates

### ⚡ **Edge Function Integration:**

- **presence-notifications** - Smart notification system
- Integration with existing functions for presence-aware features

## 🌟 **Advanced Features You Can Add**

### 🏢 **Department-Level Presence**
```typescript
// Track presence by department
const deptChannel = `department_${departmentId}`;
const { onlineUsers } = usePresence(deptChannel, user);

// See who's in each department
const salesTeam = onlineUsers.filter(u => u.location === 'sales');
const supportTeam = onlineUsers.filter(u => u.location === 'support');
```

### 📍 **Location-Based Features**
```typescript
// Track presence by physical location
const locationChannel = `location_${buildingId}_${floorId}`;

// Geofencing integration
navigator.geolocation.getCurrentPosition((position) => {
  updateStatus({ 
    location: getLocationFromCoords(position),
    status: 'on-site' 
  });
});
```

### 💬 **Real-time Messaging**
```typescript
// Chat integration with presence
const chatChannel = `chat_${teamId}`;

// Show typing indicators
const typingUsers = onlineUsers.filter(u => u.current_activity === 'typing');

// Auto-mark as read when user is online
if (user.status === 'online') {
  markMessagesAsRead();
}
```

### 🎮 **Gamification**
```typescript
// Activity streaks and points
const activityScore = calculatePresenceScore(user.last_seen, user.current_activity);

// Team presence challenges
const teamPresenceGoal = getDailyPresenceTarget();
const currentTeamPresence = onlineUsers.length;
```

## 🚀 **Real-time Features Matrix**

| Feature | Status | Implementation |
|---------|--------|----------------|
| ✅ Online Status | Complete | `usePresence` hook |
| ✅ Activity Tracking | Complete | Mouse/keyboard detection |
| ✅ Collaborative Editing | Complete | `CollaborativeScheduleEditor` |
| ✅ Smart Notifications | Complete | `presence-notifications` function |
| 🔄 Live Chat | Planned | Presence + messaging |
| 🔄 Cursor Tracking | Planned | Mouse position sharing |
| 🔄 Voice/Video Status | Planned | WebRTC integration |
| 🔄 Screen Sharing | Planned | WebRTC + presence |

## 📊 **Presence Data Structure**

```typescript
interface UserPresence {
  user_id: string;
  username: string;
  display_name: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  last_seen: string;
  current_activity?: 'working' | 'break' | 'meeting' | 'idle';
  location?: string;
  device?: 'desktop' | 'mobile' | 'tablet';
  cursor_position?: { x: number; y: number };
  custom_data?: Record<string, any>;
}
```

## 🔧 **Setup Instructions**

### 1. **Add to Your Page/Component:**
```typescript
import { usePresence } from '@/hooks/usePresence';
import LiveEmployeeDashboard from '@/components/LiveEmployeeDashboard';

// In your component
const YourDashboard = () => {
  return (
    <div>
      <LiveEmployeeDashboard />
      {/* Your other components */}
    </div>
  );
};
```

### 2. **Start Tracking Presence:**
```typescript
useEffect(() => {
  if (user) {
    startTracking({
      status: 'online',
      current_activity: 'working',
      location: 'main_office'
    });
  }
}, [user]);
```

### 3. **Update Status Dynamically:**
```typescript
// When user starts a meeting
const handleMeetingStart = () => {
  updateStatus({ 
    status: 'busy', 
    current_activity: 'meeting' 
  });
};

// When user goes on break
const handleBreakStart = () => {
  updateStatus({ 
    status: 'away', 
    current_activity: 'break' 
  });
};
```

## 🎯 **Integration Examples**

### 📅 **Schedule Management Integration**
```typescript
// Show who's viewing/editing schedules
const schedulePresence = usePresence(`schedule_${scheduleId}`, user);

// Prevent conflicts
if (schedulePresence.onlineUsers.some(u => u.current_activity === 'editing')) {
  showConflictWarning();
}
```

### 📊 **Dashboard Integration**
```typescript
// Show team activity on dashboard
const dashboardPresence = usePresence('main_dashboard', user);
const activeUsers = dashboardPresence.onlineUsers.length;

// Real-time metrics
const workingUsers = dashboardPresence.onlineUsers.filter(
  u => u.current_activity === 'working'
).length;
```

### 🔔 **Notification Integration**
```typescript
// Send presence-aware notifications
const sendNotification = async (message: string, priority: 'high' | 'normal') => {
  await supabase.functions.invoke('presence-notifications', {
    body: {
      type: 'announcement',
      message,
      priority,
      sender_id: user.id,
      channels: ['employee_workspace']
    }
  });
};
```

## 💡 **Best Practices**

### 🔄 **Performance Optimization**
- Throttle presence updates (don't update on every mouse move)
- Use channels to scope presence to relevant users
- Clean up subscriptions on component unmount
- Batch status updates when possible

### 🛡️ **Privacy & Security**
- Respect user privacy settings
- Allow users to control visibility
- Implement "invisible" mode
- Secure presence data with RLS policies

### 📱 **Cross-Platform Considerations**
- Detect device type for appropriate UX
- Handle mobile app backgrounding
- Sync presence across multiple tabs
- Graceful degradation for poor connections

## 🌐 **Channels Organisation**

```typescript
// Global workspace presence
'employee_workspace'

// Department-specific
'department_sales'
'department_engineering'

// Feature-specific
'schedule_editor'
'report_generator'
'chat_general'

// Location-specific
'office_floor_1'
'office_floor_2'
'remote_workers'
```

This comprehensive presence system transforms your MinTid application into a fully collaborative, real-time workforce management platform! 🚀

## 🎊 **Result: What You Get**

With Supabase Presence integration, your MinTid app becomes:

1. **🔴 Live & Interactive** - See real-time team activity
2. **👥 Collaborative** - Multiple users can work together seamlessly
3. **🎯 Context-Aware** - Smart notifications based on user status
4. **📱 Modern** - Real-time collaboration like Slack/Discord
5. **🚀 Professional** - Enterprise-grade presence features

Your employees and managers will love the enhanced collaboration and real-time awareness! ✨
