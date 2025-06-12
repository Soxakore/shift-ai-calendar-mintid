import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Calendar, 
  Bell, 
  Monitor,
  Code,
  Zap,
  Eye,
  MessageSquare
} from 'lucide-react';
import LiveEmployeeDashboard from '@/components/LiveEmployeeDashboard';
import CollaborativeScheduleEditor from '@/components/CollaborativeScheduleEditor';
import DoubleRenderTest from '@/components/debug/DoubleRenderTest';
import FixValidation from '@/components/debug/FixValidation';
import DoubleRenderFixSummary from '@/components/debug/DoubleRenderFixSummary';

const PresenceDemo = () => {
  const [activeDemo, setActiveDemo] = useState('overview');

  const features = [
    {
      icon: <Users className="h-8 w-8 text-blue-500" />,
      title: "Real-time Employee Status",
      description: "See who's online, away, or busy with live activity tracking",
      benefits: ["Instant availability awareness", "Activity-based status", "Device detection", "Location tracking"]
    },
    {
      icon: <Calendar className="h-8 w-8 text-green-500" />,
      title: "Collaborative Schedule Editing",
      description: "Multiple managers can edit schedules simultaneously without conflicts",
      benefits: ["Conflict prevention", "Live editing indicators", "Real-time collaboration", "Change notifications"]
    },
    {
      icon: <Bell className="h-8 w-8 text-orange-500" />,
      title: "Presence-Aware Notifications",
      description: "Smart notifications that adapt to user status and activity",
      benefits: ["Context-aware delivery", "Priority-based routing", "Multi-channel support", "Reduced interruptions"]
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-purple-500" />,
      title: "Live Communication",
      description: "Real-time chat and coordination features",
      benefits: ["Typing indicators", "Read receipts", "Status integration", "Team coordination"]
    }
  ];

  const codeExamples = [
    {
      title: "Basic Presence Hook",
      language: "typescript",
      code: `// Track user presence in real-time
const { onlineUsers, startTracking, updateStatus } = usePresence('workspace', user);

// Start tracking when user logs in
useEffect(() => {
  if (user) {
    startTracking({
      status: 'online',
      current_activity: 'working',
      location: 'office'
    });
  }
}, [user]);`
    },
    {
      title: "Collaborative Editing",
      language: "typescript", 
      code: `// Collaborative schedule editing
const schedulePresence = usePresence(\`schedule_\${scheduleId}\`, user);

// Check if someone else is editing
const isBeingEdited = schedulePresence.onlineUsers.some(
  u => u.current_activity === 'editing'
);

// Update your activity
const startEditing = () => {
  updateStatus({ current_activity: 'editing' });
};`
    },
    {
      title: "Smart Notifications",
      language: "typescript",
      code: `// Send presence-aware notifications
const sendNotification = async (message: string) => {
  const { data } = await supabase.functions.invoke('presence-notifications', {
    body: {
      type: 'announcement',
      message,
      priority: 'high',
      sender_id: user.id,
      channels: ['employee_workspace']
    }
  });
  return data;
};`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Double Render Test - DEBUGGING */}
        <DoubleRenderTest />
        
        {/* Fix Validation Test - DEBUGGING */}
        <FixValidation />
        
        {/* Double Render Fix Summary - DEBUGGING */}
        <DoubleRenderFixSummary />
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Zap className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Supabase Presence</h1>
            <Badge variant="secondary" className="text-sm">Real-time Collaboration</Badge>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your MinaTid application with real-time presence, live collaboration, and smart notifications.
            See who's online, what they're doing, and collaborate in real-time.
          </p>
        </div>

        {/* Demo Navigation */}
        <Tabs value={activeDemo} onValueChange={setActiveDemo} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="live-status">Live Status</TabsTrigger>
            <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
            <TabsTrigger value="code">Implementation</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      {feature.icon}
                      <span>{feature.title}</span>
                    </CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center space-x-2">
                          <div className="h-2 w-2 bg-green-500 rounded-full" />
                          <span className="text-sm text-gray-600">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>What You Get with Presence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">Real-time</div>
                    <div className="text-sm text-blue-600">Status Updates</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">Multi-user</div>
                    <div className="text-sm text-green-600">Collaboration</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">Smart</div>
                    <div className="text-sm text-purple-600">Notifications</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">Live</div>
                    <div className="text-sm text-orange-600">Activity Feed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Status Tab */}
          <TabsContent value="live-status" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5" />
                  <span>Live Employee Status Dashboard</span>
                </CardTitle>
                <CardDescription>
                  See real-time employee status, activity, and availability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LiveEmployeeDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Collaboration Tab */}
          <TabsContent value="collaboration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Collaborative Schedule Editor</span>
                </CardTitle>
                <CardDescription>
                  Multiple users can edit schedules simultaneously with conflict prevention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CollaborativeScheduleEditor />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Code Implementation Tab */}
          <TabsContent value="code" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {codeExamples.map((example, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Code className="h-5 w-5" />
                      <span>{example.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{example.code}</code>
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Implementation Guide */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Implementation Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">1. Install Hook</h4>
                    <p className="text-sm text-gray-600">
                      Use the `usePresence` hook in your components to track and display real-time user status.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">2. Add Components</h4>
                    <p className="text-sm text-gray-600">
                      Drop in pre-built components like `LiveEmployeeDashboard` for instant functionality.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">3. Deploy Functions</h4>
                    <p className="text-sm text-gray-600">
                      Deploy Edge Functions for advanced features like smart notifications and analytics.
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <Button className="flex items-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <span>View Documentation</span>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Code className="h-4 w-4" />
                    <span>See Full Code</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Add Real-time Collaboration?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Transform your MinaTid application with presence awareness, live collaboration, 
              and smart notifications. Your team will love the enhanced coordination and real-time visibility.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button size="lg" variant="secondary">
                Get Started Now
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                View Full Guide
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PresenceDemo;
