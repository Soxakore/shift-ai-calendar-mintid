import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart3,
  Building,
  Calendar,
  Cog6Tooth,
  History,
  Home,
  LogOut,
  Mail,
  Bell,
  Search,
  Settings,
  Shield,
  TrendingUp,
  User,
  Users,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface GlobalNavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const GlobalNavigation = ({ currentPath, onNavigate, searchTerm, onSearchChange }: GlobalNavigationProps) => {
  const [open, setOpen] = useState(false);
  const [isSearchPopoverOpen, setIsSearchPopoverOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signOut } = useSupabaseAuth();

  const navigationItems = [
    { path: '/super-admin', label: 'Overview', icon: BarChart3 },
    { path: '/super-admin/users', label: 'Users', icon: Users },
    { path: '/super-admin/analytics', label: 'Analytics', icon: TrendingUp },
    { path: '/super-admin/security', label: 'Security', icon: Shield },
    { path: '/super-admin/2fa', label: '2FA Management', icon: Shield },
    { path: '/super-admin/system', label: 'System', icon: Settings },
    { path: '/history', label: 'History', icon: History },
  ];

  const quickCommands = [
    { id: 'new-user', label: 'Create New User', action: () => {
      toast({
        title: "➕ New User",
        description: "Navigating to user management...",
      });
      onNavigate('/super-admin/users');
    }},
    { id: 'new-org', label: 'Create New Organization', action: () => {
      toast({
        title: "🏢 New Organization",
        description: "Feature coming soon!",
      });
    }},
    { id: 'view-analytics', label: 'View System Analytics', action: () => {
      toast({
        title: "📊 Analytics",
        description: "Navigating to system analytics...",
      });
      onNavigate('/super-admin/analytics');
    }},
    { id: 'system-settings', label: 'Adjust System Settings', action: () => {
      toast({
        title: "⚙️ System Settings",
        description: "Navigating to system settings...",
      });
      onNavigate('/super-admin/system');
    }},
    { id: 'security-dashboard', label: 'Open Security Dashboard', action: () => {
      toast({
        title: "🛡️ Security Dashboard",
        description: "Navigating to security dashboard...",
      });
      onNavigate('/super-admin/security');
    }},
    { id: 'unlock-2fa', label: 'Unlock User 2FA', action: () => {
      toast({
        title: "🔓 2FA Unlock",
        description: "Navigate to 2FA Management to unlock user accounts",
      });
      onNavigate('/super-admin/2fa');
    }},
    { id: 'view-history', label: 'View Audit History', action: () => {
      navigate('/history');
    }},
  ];

  const handleNavigation = (path: string) => {
    onNavigate(path);
    setOpen(false);
  };

  const handleSearch = (term: string) => {
    onSearchChange(term);
  };

  const handleClearSearch = () => {
    onSearchChange('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <div className="border-b bg-secondary text-secondary-foreground">
      <div className="container flex items-center gap-4 py-2">
        {/* Command Dialog */}
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            <CommandGroup heading="Navigation">
              {navigationItems.map((item) => (
                <CommandItem
                  key={item.path}
                  onSelect={() => handleNavigation(item.path)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup heading="Quick Actions">
              {quickCommands.map((command) => (
                <CommandItem key={command.id} onSelect={command.action}>
                  <span>{command.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>

        {/* Open Command Menu Button */}
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Search className="mr-2 h-4 w-4" />
          Search / Open Menu...
        </Button>

        {/* Search Input with Popover */}
        <Popover open={isSearchPopoverOpen} onOpenChange={setIsSearchPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="ml-auto relative">
              <Search className="mr-2 h-4 w-4" />
              Search System
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="px-4 py-2">
              <Input
                ref={searchInputRef}
                placeholder="Search users, logs, organizations..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="mb-2"
              />
              {searchTerm && (
                <Button variant="ghost" size="sm" className="absolute top-2 right-2" onClick={handleClearSearch}>
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
              <p className="text-sm text-muted-foreground">
                Search across users, audit logs, organizations, and more.
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default GlobalNavigation;
