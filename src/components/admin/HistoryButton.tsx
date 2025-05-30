
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { History, Shield, Eye } from 'lucide-react';
import SecurityHistoryPanel from './SecurityHistoryPanel';

interface HistoryButtonProps {
  targetUserId?: string;
  targetOrgId?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showBadge?: boolean;
  className?: string;
}

export default function HistoryButton({
  targetUserId,
  targetOrgId,
  variant = 'outline',
  size = 'sm',
  showBadge = false,
  className = ''
}: HistoryButtonProps) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsHistoryOpen(true)}
        className={`flex items-center gap-2 ${className}`}
        title="View security and activity history"
      >
        <History className="h-4 w-4" />
        {size !== 'sm' && 'History'}
        {showBadge && (
          <Badge variant="secondary" className="ml-1">
            <Shield className="h-3 w-3 mr-1" />
            Security
          </Badge>
        )}
      </Button>

      <SecurityHistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </>
  );
}
