// Netlify Functions API Client for Shift AI Calendar
// This provides a typed interface to interact with our Netlify Functions

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  domain: string;
  application: string;
  version: string;
  environment: string;
  services: {
    supabase: string;
    netlify: string;
  };
  performance: {
    responseTime: string;
    memory: any;
    uptime: number;
  };
  features: {
    authentication: string;
    roleBasedAccess: string;
    shiftScheduling: string;
    notifications: string;
  };
}

export interface EmailValidationResponse {
  email: string;
  isValid: boolean;
  domain: string;
  isCommonDomain: boolean;
  isBusinessEmail: boolean;
  suggestions: string[];
  checks: {
    format: boolean;
    domain: boolean;
    length: boolean;
  };
  timestamp: string;
}

export interface ScheduleExportResponse {
  success: boolean;
  data?: any;
  exportFormat: string;
  generatedAt: string;
}

export interface WebhookResponse {
  success: boolean;
  processed?: string;
  type?: string;
  timestamp: string;
}

class NetlifyFunctionsAPI {
  private baseURL: string;

  constructor() {
    // In production, this will be your domain
    this.baseURL = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'https://minatid.se';
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}/.netlify/functions/${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Error: ${response.status} - ${errorData.error || response.statusText}`);
    }

    return response.json();
  }

  // Health Check
  async healthCheck(): Promise<HealthCheckResponse> {
    return this.request<HealthCheckResponse>('health-check');
  }

  // Email Validation
  async validateEmail(email: string): Promise<EmailValidationResponse> {
    return this.request<EmailValidationResponse>('validate-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Schedule Export
  async exportSchedule(
    scheduleId: string,
    format: 'csv' | 'json' | 'html',
    options: {
      dateRange?: string;
      userRole?: string;
      authToken?: string;
    } = {}
  ): Promise<Response> {
    const url = `${this.baseURL}/.netlify/functions/export-schedule`;
    
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(options.authToken && { 'Authorization': `Bearer ${options.authToken}` }),
      },
      body: JSON.stringify({
        scheduleId,
        format,
        dateRange: options.dateRange,
        userRole: options.userRole,
      }),
    });
  }

  // Webhook Handler
  async sendWebhook(
    source: string,
    payload: any,
    signature?: string
  ): Promise<WebhookResponse> {
    return this.request<WebhookResponse>('webhook-handler', {
      method: 'POST',
      headers: {
        'X-Webhook-Source': source,
        ...(signature && { 'X-Webhook-Signature': signature }),
      },
      body: JSON.stringify(payload),
    });
  }

  // Helper method to download exported files
  async downloadSchedule(
    scheduleId: string,
    format: 'csv' | 'html',
    filename?: string,
    authToken?: string
  ): Promise<void> {
    try {
      const response = await this.exportSchedule(scheduleId, format, { authToken });
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `schedule-${scheduleId}-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }

  // Get JSON schedule data
  async getScheduleData(
    scheduleId: string,
    authToken?: string
  ): Promise<ScheduleExportResponse> {
    const response = await this.exportSchedule(scheduleId, 'json', { authToken });
    return response.json();
  }
}

// Export singleton instance
export const netlifyAPI = new NetlifyFunctionsAPI();

// React Hook for easy integration
import { useState, useEffect } from 'react';

export function useHealthCheck() {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        setLoading(true);
        const healthData = await netlifyAPI.healthCheck();
        setHealth(healthData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Health check failed');
        setHealth(null);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
    
    // Check health every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return { health, loading, error, refetch: () => netlifyAPI.healthCheck() };
}

export function useEmailValidation() {
  const [isValidating, setIsValidating] = useState(false);

  const validateEmail = async (email: string): Promise<EmailValidationResponse> => {
    setIsValidating(true);
    try {
      const result = await netlifyAPI.validateEmail(email);
      return result;
    } finally {
      setIsValidating(false);
    }
  };

  return { validateEmail, isValidating };
}

export function useScheduleExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportSchedule = async (
    scheduleId: string,
    format: 'csv' | 'html' | 'json',
    options: { authToken?: string; filename?: string } = {}
  ) => {
    setIsExporting(true);
    try {
      if (format === 'json') {
        return await netlifyAPI.getScheduleData(scheduleId, options.authToken);
      } else {
        await netlifyAPI.downloadSchedule(
          scheduleId, 
          format as 'csv' | 'html', 
          options.filename, 
          options.authToken
        );
      }
    } finally {
      setIsExporting(false);
    }
  };

  return { exportSchedule, isExporting };
}

// Type exports for component usage
export type {
  HealthCheckResponse,
  EmailValidationResponse,
  ScheduleExportResponse,
  WebhookResponse,
};

export default netlifyAPI;
