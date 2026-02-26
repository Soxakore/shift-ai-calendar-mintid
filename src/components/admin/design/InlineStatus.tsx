import React from 'react';
import { cn } from '@/lib/utils';

type StatusTone = 'neutral' | 'success' | 'warning' | 'danger' | 'accent';

interface InlineStatusProps {
  label: string;
  tone?: StatusTone;
  className?: string;
}

const toneClass: Record<StatusTone, string> = {
  neutral: 'border-slate-500/35 bg-slate-500/12 text-slate-200',
  success: 'border-emerald-400/35 bg-emerald-500/12 text-emerald-200',
  warning: 'border-amber-400/35 bg-amber-500/12 text-amber-100',
  danger: 'border-rose-400/35 bg-rose-500/12 text-rose-100',
  accent: 'border-indigo-400/35 bg-indigo-500/12 text-indigo-100',
};

export default function InlineStatus({ label, tone = 'neutral', className }: InlineStatusProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 sa-text-12 font-medium',
        toneClass[tone],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
}
