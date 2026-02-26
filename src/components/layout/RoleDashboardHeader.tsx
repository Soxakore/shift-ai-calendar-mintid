import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

type HeaderAccent = 'indigo' | 'blue' | 'emerald' | 'slate';
type MetaTone = 'neutral' | 'success' | 'warning' | 'danger' | 'accent';

interface MetaItem {
  label: string;
  tone?: MetaTone;
}

interface RoleDashboardHeaderProps {
  title: string;
  subtitle?: string;
  roleLabel: string;
  icon: React.ReactNode;
  accent?: HeaderAccent;
  userName: string;
  userRoleLabel: string;
  metaItems?: MetaItem[];
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
  className?: string;
}

const accentStyles: Record<
  HeaderAccent,
  {
    iconContainer: string;
    roleBadge: string;
    focus: string;
    dividerGlow: string;
    avatar: string;
  }
> = {
  indigo: {
    iconContainer: 'border-indigo-300/40 bg-indigo-500/16 text-indigo-100 shadow-[0_0_28px_rgba(79,70,229,0.28)]',
    roleBadge: 'bg-indigo-500/90 text-white',
    focus: 'focus:border-indigo-300/60 focus:ring-indigo-300/60',
    dividerGlow: 'via-indigo-300/45',
    avatar: 'from-indigo-400 to-blue-500 text-white',
  },
  blue: {
    iconContainer: 'border-blue-300/40 bg-blue-500/16 text-blue-100 shadow-[0_0_28px_rgba(59,130,246,0.28)]',
    roleBadge: 'bg-blue-500/90 text-white',
    focus: 'focus:border-blue-300/60 focus:ring-blue-300/60',
    dividerGlow: 'via-blue-300/45',
    avatar: 'from-blue-400 to-cyan-500 text-slate-950',
  },
  emerald: {
    iconContainer: 'border-emerald-300/40 bg-emerald-500/16 text-emerald-100 shadow-[0_0_28px_rgba(16,185,129,0.28)]',
    roleBadge: 'bg-emerald-500/90 text-white',
    focus: 'focus:border-emerald-300/60 focus:ring-emerald-300/60',
    dividerGlow: 'via-emerald-300/45',
    avatar: 'from-emerald-400 to-teal-500 text-slate-950',
  },
  slate: {
    iconContainer: 'border-slate-300/30 bg-slate-500/14 text-slate-100 shadow-[0_0_28px_rgba(100,116,139,0.28)]',
    roleBadge: 'bg-slate-500/90 text-white',
    focus: 'focus:border-slate-300/60 focus:ring-slate-300/60',
    dividerGlow: 'via-slate-300/40',
    avatar: 'from-slate-400 to-slate-600 text-white',
  },
};

const metaToneStyles: Record<MetaTone, string> = {
  neutral: 'bg-slate-800/70 text-slate-200 border-slate-600/70',
  success: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30',
  warning: 'bg-amber-500/15 text-amber-200 border-amber-400/30',
  danger: 'bg-rose-500/15 text-rose-200 border-rose-400/30',
  accent: 'bg-indigo-500/15 text-indigo-100 border-indigo-300/30',
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'NA';

export default function RoleDashboardHeader({
  title,
  subtitle,
  roleLabel,
  icon,
  accent = 'indigo',
  userName,
  userRoleLabel,
  metaItems = [],
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search',
  actions,
  className,
}: RoleDashboardHeaderProps) {
  const style = accentStyles[accent];
  const initials = getInitials(userName);
  const hasSearch = typeof onSearchChange === 'function';

  return (
    <header className={cn('sticky top-0 z-50 border-b border-white/10 bg-[rgba(15,17,26,0.72)] backdrop-blur-2xl', className)}>
      <div className={cn('pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent to-transparent', style.dividerGlow)} />
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <div className={cn('rounded-xl border p-2.5', style.iconContainer)}>
            {icon}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight text-white sm:text-2xl">{title}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <Badge className={cn('border-0', style.roleBadge)}>{roleLabel}</Badge>
              {subtitle && <span>{subtitle}</span>}
              {metaItems.map((item) => (
                <span
                  key={`${item.label}-${item.tone || 'neutral'}`}
                  className={cn(
                    'rounded-full border px-2 py-0.5 text-[11px]',
                    metaToneStyles[item.tone || 'neutral']
                  )}
                >
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {hasSearch && (
          <div className="hidden md:flex w-80 max-w-[36vw] items-center">
            <div className="group relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 group-focus-within:text-slate-200" />
              <input
                value={searchValue || ''}
                onChange={(event) => onSearchChange?.(event.target.value)}
                placeholder={searchPlaceholder}
                className={cn(
                  'h-10 w-full rounded-xl border border-white/[0.1] bg-[rgba(15,17,26,0.62)] pl-10 pr-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors',
                  style.focus
                )}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          {actions}
          <div className="hidden lg:flex items-center gap-3 rounded-xl border border-white/10 bg-[rgba(26,28,46,0.75)] px-3 py-2 backdrop-blur-xl">
            <div className="text-right">
              <p className="text-sm font-semibold text-white">{userName}</p>
              <p className="text-xs text-slate-400">{userRoleLabel}</p>
            </div>
            <div className="relative">
              <div className={cn('flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold', style.avatar)}>
                {initials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
