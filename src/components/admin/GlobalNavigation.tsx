
import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  Search, Command, Home, Users, Building, 
  BarChart3, Shield, Settings, History,
  ChevronRight
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';

interface NavigationItem {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  path: string;
  badge?: string;
}

interface GlobalNavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', title: 'Dashboard', icon: Home, path: '/super-admin' },
  { id: 'users', title: 'User Management', icon: Users, path: '/super-admin/users' },
  { id: 'organizations', title: 'Organizations', icon: Building, path: '/super-admin/organizations' },
  { id: 'analytics', title: 'Analytics', icon: BarChart3, path: '/super-admin/analytics' },
  { id: 'security', title: 'Security', icon: Shield, path: '/super-admin/security', badge: 'New' },
  { id: 'history', title: 'Audit History', icon: History, path: '/history' },
  { id: 'settings', title: 'System Settings', icon: Settings, path: '/super-admin/settings' },
];

export default function GlobalNavigation({ 
  currentPath, 
  onNavigate, 
  searchTerm, 
  onSearchChange 
}: GlobalNavigationProps) {
  const [commandOpen, setCommandOpen] = React.useState(false);

  const breadcrumbs = React.useMemo(() => {
    const parts = currentPath.split('/').filter(Boolean);
    const crumbs = [{ title: 'Super Admin', path: '/super-admin' }];
    
    if (parts.length > 1) {
      const item = navigationItems.find(nav => nav.path === currentPath);
      if (item) {
        crumbs.push({ title: item.title, path: currentPath });
      }
    }
    
    return crumbs;
  }, [currentPath]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setCommandOpen(true);
    }
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown as any);
    return () => document.removeEventListener('keydown', handleKeyDown as any);
  }, []);

  return (
    <>
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Navigation Bar */}
          <div className="flex items-center justify-between py-3">
            {/* Breadcrumbs */}
            <div className="flex items-center space-x-2">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.path} className="flex items-center">
                  {index > 0 && <ChevronRight className="h-4 w-4 text-slate-400 mx-2" />}
                  <button
                    onClick={() => onNavigate(crumb.path)}
                    className={`text-sm font-medium ${
                      index === breadcrumbs.length - 1
                        ? 'text-slate-900 dark:text-slate-100'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    {crumb.title}
                  </button>
                </div>
              ))}
            </div>

            {/* Search and Commands */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search... (⌘K)"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onClick={() => setCommandOpen(true)}
                  className="pl-10 w-80 cursor-pointer"
                  readOnly
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCommandOpen(true)}
                className="flex items-center gap-2"
              >
                <Command className="h-4 w-4" />
                <span className="hidden sm:inline">Quick Actions</span>
              </Button>
            </div>
          </div>

          {/* Secondary Navigation */}
          <div className="flex items-center space-x-1 pb-3 overflow-x-auto">
            {navigationItems.map((item) => {
              const isActive = currentPath === item.path;
              const Icon = item.icon;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onNavigate(item.path)}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                  {item.badge && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Command Dialog */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.id}
                  onSelect={() => {
                    onNavigate(item.path);
                    setCommandOpen(false);
                  }}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => setCommandOpen(false)}>
              <Users className="mr-2 h-4 w-4" />
              <span>Create New User</span>
            </CommandItem>
            <CommandItem onSelect={() => setCommandOpen(false)}>
              <Building className="mr-2 h-4 w-4" />
              <span>Create Organization</span>
            </CommandItem>
            <CommandItem onSelect={() => setCommandOpen(false)}>
              <History className="mr-2 h-4 w-4" />
              <span>View Audit Logs</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
