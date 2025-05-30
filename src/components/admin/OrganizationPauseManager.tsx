
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Pause, Play, CreditCard, Calendar } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  is_paused?: boolean;
  pause_reason?: string;
  paused_at?: string;
}

interface OrganizationPauseManagerProps {
  organization: Organization;
  onPauseChange: (orgId: string, isPaused: boolean) => void;
}

export default function OrganizationPauseManager({ 
  organization, 
  onPauseChange 
}: OrganizationPauseManagerProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePauseOrganization = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onPauseChange(organization.id, true);
      
      toast({
        title: "⏸️ Organization Paused",
        description: `${organization.name} has been paused. Users cannot access features until payment is resolved.`,
        variant: "destructive"
      });
    } catch (error) {
      toast({
        title: "❌ Pause Failed",
        description: "Failed to pause organization. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResumeOrganization = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onPauseChange(organization.id, false);
      
      toast({
        title: "▶️ Organization Resumed",
        description: `${organization.name} has been reactivated. Users can now access all features.`,
      });
    } catch (error) {
      toast({
        title: "❌ Resume Failed",
        description: "Failed to resume organization. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {organization.is_paused ? (
        <>
          <Badge variant="destructive" className="text-white">
            <Pause className="h-3 w-3 mr-1" />
            Paused
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResumeOrganization}
            disabled={isProcessing}
            className="text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 border-green-300 dark:border-green-600"
          >
            <Play className="h-4 w-4 mr-1" />
            {isProcessing ? 'Resuming...' : 'Resume'}
          </Button>
        </>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handlePauseOrganization}
          disabled={isProcessing}
          className="text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100 border-yellow-300 dark:border-yellow-600"
        >
          <Pause className="h-4 w-4 mr-1" />
          {isProcessing ? 'Pausing...' : 'Pause'}
        </Button>
      )}
      
      {organization.is_paused && organization.paused_at && (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Since {new Date(organization.paused_at).toLocaleDateString()}
        </span>
      )}
    </div>
  );
}
