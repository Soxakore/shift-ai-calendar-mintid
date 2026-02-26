import React from 'react';
import type { SuperAdminActionId } from '@/types/superAdminUI';
import { cn } from '@/lib/utils';
import { getActionDataAttributes } from '@/config/superAdminActionRegistry';

type ActionTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

interface ActionTileProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  actionId: SuperAdminActionId;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  tone?: ActionTone;
}

const toneClass: Record<ActionTone, string> = {
  neutral: 'border-white/10 hover:border-white/25 hover:bg-white/[0.07]',
  accent: 'border-indigo-300/20 hover:border-indigo-300/45 hover:bg-indigo-500/14',
  success: 'border-emerald-300/20 hover:border-emerald-300/45 hover:bg-emerald-500/14',
  warning: 'border-amber-300/20 hover:border-amber-300/45 hover:bg-amber-500/14',
  danger: 'border-rose-300/20 hover:border-rose-300/45 hover:bg-rose-500/14',
};

export default function ActionTile({
  actionId,
  title,
  description,
  icon,
  tone = 'neutral',
  className,
  ...props
}: ActionTileProps) {
  const dataAttrs = getActionDataAttributes(actionId);

  return (
    <button
      type="button"
      {...dataAttrs}
      {...props}
      className={cn(
        'sa-focus-ring group w-full rounded-[var(--sa-radius-md)] border bg-[hsl(var(--sa-surface-1)/0.6)] px-3 py-2.5 text-left shadow-[var(--sa-shadow-glass-sm)] transition-all duration-sa-md ease-sa-standard',
        'disabled:cursor-not-allowed disabled:opacity-60',
        toneClass[tone],
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {icon ? (
          <span className="mt-0.5 rounded-md border border-white/10 bg-white/[0.04] p-1.5 text-slate-200">{icon}</span>
        ) : null}
        <span className="min-w-0">
          <span className="block sa-text-14 font-semibold text-[hsl(var(--sa-text-primary))]">{title}</span>
          {description ? (
            <span className="mt-1 block sa-text-12 text-[hsl(var(--sa-text-secondary))]">{description}</span>
          ) : null}
        </span>
      </div>
    </button>
  );
}
