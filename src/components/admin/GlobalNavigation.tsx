import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart3,
  Building,
  Calendar,
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
    { path: '/super-admin/users-page', label: 'User Management', icon: Users },
    { path: '/super-admin/organizations', label: 'Organizations', icon: Building },
    { path: '/super-admin/create-manager', label: 'Create Manager', icon: User },
    { path: '/super-admin/analytics', label: 'Analytics', icon: TrendingUp },
    { path: '/super-admin/security', label: 'Security', icon: Shield },
    { path: '/super-admin/2fa', label: '2FA Management', icon: Shield },
    { path: '/super-admin/system', label: 'System', icon: Settings },
    { path: '/history', label: 'History', icon: History },
  ];

  const quickCommands = [
    { id: 'new-user', label: 'Create New User', action: () => {
      navigate('/super-admin/users-page');
      setOpen(false);
    }},
    { id: 'new-manager', label: 'Create New Manager', action: () => {
      navigate('/super-admin/create-manager');
      setOpen(false);
    }},
    { id: 'new-org', label: 'Create New Organization', action: () => {
      navigate('/super-admin/organizations');
      setOpen(false);
    }},
    { id: 'view-analytics', label: 'View System Analytics', action: () => {
      onNavigate('/super-admin/analytics');
      setOpen(false);
    }},
    { id: 'system-settings', label: 'Adjust System Settings', action: () => {
      onNavigate('/super-admin/system');
      setOpen(false);
    }},
    { id: 'security-dashboard', label: 'Open Security Dashboard', action: () => {
      onNavigate('/super-admin/security');
      setOpen(false);
    }},
    { id: 'unlock-2fa', label: 'Unlock User 2FA', action: () => {
      onNavigate('/super-admin/2fa');
      setOpen(false);
    }},
    { id: 'view-history', label: 'View Audit History', action: () => {
      navigate('/history');
      setOpen(false);
    }},
  ];

  // Add keyboard shortcut for command dialog
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleNavigation = (path: string) => {
    // Handle navigation to new pages directly
    if (path === '/super-admin/organizations' || 
        path === '/super-admin/users-page' || 
        path === '/super-admin/create-manager') {
      navigate(path);
    } else {
      onNavigate(path);
    }
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

  const handleCommandSearch = (value: string) => {
    // This handles the search within the command dialog
    console.log('Command search:', value);
  };

  return (
    <div className="border-b bg-secondary text-secondary-foreground">
      <div className="container flex items-center gap-4 py-2">
        {/* Command Dialog */}
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput 
            placeholder="Type a command or search..." 
            onValueChange={handleCommandSearch}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            <CommandGroup heading="Navigation">
              {navigationItems.map((item) => (
                <CommandItem
                  key={item.path}
                  onSelect={() => handleNavigation(item.path)}
                  className="cursor-pointer"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                  <CommandShortcut className="ml-auto">
                    {item.path === currentPath && '✓'}
                  </CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Quick Actions">
              {quickCommands.map((command) => (
                <CommandItem 
                  key={command.id} 
                  onSelect={command.action}
                  className="cursor-pointer"
                >
                  <span>{command.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>

        {/* Open Command Menu Button */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setOpen(true)}
          className="relative"
        >
          <Search className="mr-2 h-4 w-4" />
          Search / Open Menu...
          <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>

        {/* Search Input with Popover */}
        <Popover open={isSearchPopoverOpen} onOpenChange={setIsSearchPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="ml-auto relative">
              <Search className="mr-2 h-4 w-4" />
              Search System
              {searchTerm && (
                <Badge className="ml-2 bg-blue-500 text-white text-xs">
                  Active
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">System Search</h4>
                <p className="text-sm text-muted-foreground">
                  Search across users, logs, organizations, and more.
                </p>
              </div>
              <div className="relative">
                <Input
                  ref={searchInputRef}
                  placeholder="Search users, logs, organizations..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pr-8"
                />
                {searchTerm && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-1 top-1 h-6 w-6 p-0" 
                    onClick={handleClearSearch}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              {searchTerm && (
                <div className="text-sm text-muted-foreground">
                  Searching for: <strong>"{searchTerm}"</strong>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default GlobalNavigation;
