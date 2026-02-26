import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell, AlertTriangle, Shield, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  urgent: boolean;
  hasIsReadColumn: boolean;
}

interface NotificationDropdownProps {
  compact?: boolean;
  className?: string;
}

const mapNotification = (row: Record<string, unknown>): NotificationItem => {
  const readValue =
    typeof row.read === 'boolean'
      ? row.read
      : typeof row.is_read === 'boolean'
        ? row.is_read
        : false;

  const type = typeof row.type === 'string' ? row.type : 'system';
  const title = typeof row.title === 'string' && row.title.length > 0 ? row.title : 'Notification';
  const message = typeof row.message === 'string' && row.message.length > 0 ? row.message : 'You have a new notification.';
  const timestamp = typeof row.created_at === 'string' ? row.created_at : new Date().toISOString();
  const hasIsReadColumn = Object.prototype.hasOwnProperty.call(row, 'is_read');

  return {
    id: String(row.id),
    type,
    title,
    message,
    timestamp,
    read: readValue,
    urgent: type === 'security',
    hasIsReadColumn,
  };
};

const NotificationDropdown = ({ compact = false, className }: NotificationDropdownProps) => {
  const { toast } = useToast();
  const { profile } = useSupabaseAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const unreadCount = useMemo(() => notifications.filter((entry) => !entry.read).length, [notifications]);

  const fetchNotifications = useCallback(async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(25);

      if (profile.user_type === 'super_admin') {
        query = query.or(`user_id.eq.${profile.id},user_id.is.null`);
      } else {
        query = query.eq('user_id', profile.id);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const mapped = ((data || []) as Array<Record<string, unknown>>).map(mapNotification);
      setNotifications(mapped);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [profile?.id, profile?.user_type]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel(`header-notifications-${profile.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications, profile?.id]);

  const markAsRead = async (notificationId: string) => {
    const target = notifications.find((entry) => entry.id === notificationId);
    if (!target || target.read) return;

    setNotifications((prev) =>
      prev.map((entry) => (entry.id === notificationId ? { ...entry, read: true } : entry))
    );

    const updatePayload: Record<string, unknown> = target.hasIsReadColumn ? { is_read: true } : { read: true };
    const { error } = await supabase.from('notifications').update(updatePayload).eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((entry) => !entry.read);
    if (unread.length === 0) return;

    setNotifications((prev) => prev.map((entry) => ({ ...entry, read: true })));

    const ids = unread.map((entry) => entry.id);
    const hasIsReadColumn = unread.some((entry) => entry.hasIsReadColumn);
    const updatePayload: Record<string, unknown> = hasIsReadColumn ? { is_read: true } : { read: true };

    const { error } = await supabase.from('notifications').update(updatePayload).in('id', ids);
    if (error) {
      console.error('Error marking all notifications as read:', error);
      fetchNotifications();
      return;
    }

    toast({
      title: 'Notifications updated',
      description: 'All notifications marked as read.',
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'security':
        return <Shield className="h-4 w-4 text-[hsl(var(--sa-danger))]" />;
      case 'user':
        return <Users className="h-4 w-4 text-[hsl(var(--sa-accent))]" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-[hsl(var(--sa-warning))]" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return 'Just now';

    const diffInMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / (1000 * 60)));
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const triggerClass = compact
    ? 'relative h-9 w-9 rounded-lg border border-[hsl(var(--sa-border)/0.45)] bg-[hsl(var(--sa-surface-1)/0.75)] text-[hsl(var(--sa-text-primary))] hover:bg-[hsl(var(--sa-surface-2)/0.85)]'
    : 'relative border border-[hsl(var(--sa-border)/0.45)] bg-[hsl(var(--sa-surface-1)/0.75)] text-[hsl(var(--sa-text-primary))] hover:bg-[hsl(var(--sa-surface-2)/0.85)]';

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size={compact ? 'icon' : 'sm'} className={cn(triggerClass, className)}>
          <Bell className={cn('h-4 w-4', !compact && 'mr-2')} />
          {!compact && <span>Alerts</span>}
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 min-w-5 rounded-full bg-rose-500 px-1 text-[10px] text-white">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="z-50 w-80 max-h-96 overflow-y-auto border border-[hsl(var(--sa-border)/0.42)] bg-[hsl(var(--sa-surface-1)/0.95)] p-0 text-[hsl(var(--sa-text-primary))] backdrop-blur-2xl"
        align="end"
      >
        <Card className="border-0 bg-transparent shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-[hsl(var(--sa-text-primary))]">Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-7 px-2 text-xs text-[hsl(var(--sa-text-secondary))] hover:bg-[hsl(var(--sa-surface-2)/0.8)] hover:text-[hsl(var(--sa-text-primary))]"
                >
                  Mark all read
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-2 p-3 pt-0">
            {loading ? (
              <div className="py-6 text-center text-sm text-[hsl(var(--sa-text-secondary))]">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="py-6 text-center text-sm text-[hsl(var(--sa-text-secondary))]">No notifications yet.</div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => markAsRead(notification.id)}
                  className={cn(
                    'w-full rounded-lg border px-3 py-2 text-left transition-colors',
                    notification.read
                      ? 'border-[hsl(var(--sa-border)/0.2)] bg-[hsl(var(--sa-surface-2)/0.45)]'
                      : notification.urgent
                        ? 'border-[hsl(var(--sa-danger)/0.35)] bg-[hsl(var(--sa-danger)/0.1)]'
                        : 'border-[hsl(var(--sa-accent)/0.25)] bg-[hsl(var(--sa-accent)/0.1)]'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {getIcon(notification.type)}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={cn('truncate text-sm font-medium', notification.read ? 'text-[hsl(var(--sa-text-secondary))]' : 'text-[hsl(var(--sa-text-primary))]')}>
                          {notification.title}
                        </p>
                        {!notification.read && <span className="h-2 w-2 rounded-full bg-[hsl(var(--sa-accent))]" />}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-[hsl(var(--sa-text-secondary))]">{notification.message}</p>
                      <p className="mt-1 text-[11px] text-[hsl(var(--sa-text-secondary)/0.82)]">{formatTimestamp(notification.timestamp)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationDropdown;
