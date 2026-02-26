import React from 'react';
import { Button } from '@/components/ui/button';
import type { SuperAdminActionId } from '@/types/superAdminUI';
import { getActionDataAttributes } from '@/config/superAdminActionRegistry';

interface EmptyStatePanelProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionId?: SuperAdminActionId;
  onAction?: () => void;
}

export default function EmptyStatePanel({
  title,
  description,
  actionLabel,
  actionId,
  onAction,
}: EmptyStatePanelProps) {
  const actionAttrs = actionId ? getActionDataAttributes(actionId) : {};

  return (
    <div className="rounded-[var(--sa-radius-md)] border border-white/10 bg-[hsl(var(--sa-surface-1)/0.55)] px-5 py-8 text-center">
      <h3 className="sa-text-20 font-semibold text-[hsl(var(--sa-text-primary))]">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl sa-text-14 text-[hsl(var(--sa-text-secondary))]">{description}</p>
      {actionLabel && onAction ? (
        <Button
          type="button"
          onClick={onAction}
          className="sa-focus-ring mt-4 bg-[hsl(var(--sa-accent))] text-slate-950 hover:bg-[hsl(var(--sa-accent)/0.9)]"
          {...actionAttrs}
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
