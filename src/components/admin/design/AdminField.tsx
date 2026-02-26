import React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface AdminFieldProps {
  id: string;
  label: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function AdminField({
  id,
  label,
  helperText,
  errorText,
  required = false,
  children,
  className,
}: AdminFieldProps) {
  return (
    <div className={cn('sa-stack-1', className)}>
      <Label htmlFor={id} className="sa-text-14 font-semibold text-[hsl(var(--sa-text-primary))]">
        {label}
        {required ? <span className="ml-1 text-[hsl(var(--sa-danger))]">*</span> : null}
      </Label>
      {children}
      {errorText ? (
        <p className="sa-text-12 text-[hsl(var(--sa-danger))]">{errorText}</p>
      ) : helperText ? (
        <p className="sa-text-12 text-[hsl(var(--sa-text-secondary))]">{helperText}</p>
      ) : null}
    </div>
  );
}
