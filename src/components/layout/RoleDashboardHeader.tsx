import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getActionDataAttributes } from '@/config/superAdminActionRegistry';

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
    iconContainer: 'border-white/20 bg-[hsl(var(--sa-accent)/0.14)] text-[hsl(var(--sa-text-primary))] shadow-[var(--sa-shadow-glass-sm)]',
    roleBadge: 'bg-[hsl(var(--sa-accent))] text-slate-950',
    focus: 'focus:border-[hsl(var(--sa-accent)/0.55)] focus:ring-[hsl(var(--sa-accent)/0.5)]',
    dividerGlow: 'via-indigo-300/45',
    avatar: 'from-indigo-400 to-blue-500 text-white',
  },
  blue: {
    iconContainer: 'border-white/20 bg-[hsl(var(--sa-accent)/0.14)] text-[hsl(var(--sa-text-primary))] shadow-[var(--sa-shadow-glass-sm)]',
    roleBadge: 'bg-[hsl(var(--sa-accent))] text-slate-950',
    focus: 'focus:border-[hsl(var(--sa-accent)/0.55)] focus:ring-[hsl(var(--sa-accent)/0.5)]',
    dividerGlow: 'via-blue-300/45',
    avatar: 'from-blue-400 to-cyan-500 text-slate-950',
  },
  emerald: {
    iconContainer: 'border-white/20 bg-[hsl(var(--sa-accent)/0.14)] text-[hsl(var(--sa-text-primary))] shadow-[var(--sa-shadow-glass-sm)]',
    roleBadge: 'bg-[hsl(var(--sa-accent))] text-slate-950',
    focus: 'focus:border-[hsl(var(--sa-accent)/0.55)] focus:ring-[hsl(var(--sa-accent)/0.5)]',
    dividerGlow: 'via-emerald-300/45',
    avatar: 'from-emerald-400 to-teal-500 text-slate-950',
  },
  slate: {
    iconContainer: 'border-white/20 bg-[hsl(var(--sa-accent)/0.14)] text-[hsl(var(--sa-text-primary))] shadow-[var(--sa-shadow-glass-sm)]',
    roleBadge: 'bg-[hsl(var(--sa-accent))] text-slate-950',
    focus: 'focus:border-[hsl(var(--sa-accent)/0.55)] focus:ring-[hsl(var(--sa-accent)/0.5)]',
    dividerGlow: 'via-slate-300/40',
    avatar: 'from-slate-400 to-slate-600 text-white',
  },
};

const metaToneStyles: Record<MetaTone, string> = {
  neutral: 'bg-[hsl(var(--sa-surface-2)/0.72)] text-[hsl(var(--sa-text-secondary))] border-white/15',
  success: 'bg-[hsl(var(--sa-success)/0.2)] text-emerald-100 border-emerald-400/35',
  warning: 'bg-[hsl(var(--sa-warning)/0.2)] text-amber-100 border-amber-400/35',
  danger: 'bg-[hsl(var(--sa-danger)/0.2)] text-rose-100 border-rose-400/35',
  accent: 'bg-[hsl(var(--sa-accent)/0.2)] text-indigo-100 border-indigo-300/35',
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
  const searchActionAttrs = getActionDataAttributes('header.search');

  return (
    <header className={cn('sticky top-0 z-50 border-b border-white/15 bg-[hsl(var(--sa-bg)/0.78)] backdrop-blur-2xl', className)}>
      <div className={cn('pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent to-transparent', style.dividerGlow)} />
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <div className={cn('rounded-xl border p-2.5', style.iconContainer)}>
            {icon}
          </div>
          <div className="min-w-0">
            <h1 className="truncate font-display sa-text-30 font-bold tracking-tight text-[hsl(var(--sa-text-primary))]">{title}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 sa-text-12 text-[hsl(var(--sa-text-secondary))]">
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
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--sa-text-secondary))] group-focus-within:text-[hsl(var(--sa-text-primary))]" />
              <input
                value={searchValue || ''}
                onChange={(event) => onSearchChange?.(event.target.value)}
                placeholder={searchPlaceholder}
                aria-label="Search super admin resources"
                {...searchActionAttrs}
                className={cn(
                  'sa-focus-ring h-10 w-full rounded-xl border border-white/[0.16] bg-[hsl(var(--sa-surface-1)/0.72)] pl-10 pr-3 sa-text-14 text-[hsl(var(--sa-text-primary))] placeholder:text-[hsl(var(--sa-text-secondary))] outline-none transition-colors',
                  style.focus
                )}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          {actions}
          <div className="hidden lg:flex items-center gap-3 rounded-xl border border-white/15 bg-[hsl(var(--sa-surface-1)/0.72)] px-3 py-2 backdrop-blur-xl">
            <div className="text-right">
              <p className="sa-text-14 font-semibold text-[hsl(var(--sa-text-primary))]">{userName}</p>
              <p className="sa-text-12 text-[hsl(var(--sa-text-secondary))]">{userRoleLabel}</p>
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
