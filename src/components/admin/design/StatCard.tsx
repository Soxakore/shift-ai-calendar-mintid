import React from 'react';
import { cn } from '@/lib/utils';

type StatTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  note?: string;
  icon?: React.ReactNode;
  tone?: StatTone;
  className?: string;
}

const toneClasses: Record<StatTone, string> = {
  neutral: 'before:bg-slate-300/20',
  accent: 'before:bg-indigo-300/20',
  success: 'before:bg-emerald-300/20',
  warning: 'before:bg-amber-300/20',
  danger: 'before:bg-rose-300/20',
};

export default function StatCard({ label, value, note, icon, tone = 'neutral', className }: StatCardProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-[var(--sa-radius-lg)] border border-white/[0.1] bg-[linear-gradient(145deg,hsl(var(--sa-surface-1)/0.92),hsl(var(--sa-surface-2)/0.82))] p-5 shadow-[var(--sa-shadow-glass-md)] backdrop-blur-xl',
        'before:pointer-events-none before:absolute before:-right-8 before:-top-10 before:h-24 before:w-24 before:rounded-full before:blur-2xl',
        toneClasses[tone],
        className,
      )}
    >
      <header className="relative z-10 flex items-center justify-between gap-3">
        <h3 className="sa-text-14 font-semibold text-[hsl(var(--sa-text-secondary))]">{label}</h3>
        {icon ? <span className="text-[hsl(var(--sa-text-secondary))]">{icon}</span> : null}
      </header>
      <div className="relative z-10 mt-2">
        <div className="sa-text-30 font-bold text-[hsl(var(--sa-text-primary))]">{value}</div>
        {note ? <p className="mt-1 sa-text-12 text-[hsl(var(--sa-text-secondary))]">{note}</p> : null}
      </div>
    </section>
  );
}
