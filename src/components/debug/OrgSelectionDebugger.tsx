// Real-time debugging component for organization selection
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface OrgSelectionDebuggerProps {
  organizations: Array<{
    id: string;
    name: string;
  }>;
}

export default function OrgSelectionDebugger({ organizations }: OrgSelectionDebuggerProps) {
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  
  useEffect(() => {
    console.log('🔍 OrgSelectionDebugger: Organizations received:', organizations);
    
    // Check for the problematic "12" value
    const problematicOrg = organizations?.find(org => org.id === '12');
    if (problematicOrg) {
      const errorMsg = `🚨 CRITICAL: Found organization with ID "12": ${JSON.stringify(problematicOrg)}`;
      console.error(errorMsg);
      setDebugLogs(prev => [...prev, errorMsg]);
    }
    
    // Log all organization IDs for inspection
    const orgInfo = organizations?.map(org => ({
      id: org.id,
      id_type: typeof org.id,
      name: org.name,
      is_numeric: /^\d+$/.test(String(org.id)),
      is_uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(org.id))
    })) || [];
    
    const logMsg = `Organizations analysis: ${JSON.stringify(orgInfo, null, 2)}`;
    console.log(logMsg);
    setDebugLogs(prev => [...prev.slice(-10), logMsg]); // Keep last 10 logs
    
    // Also intercept any potential localStorage/sessionStorage access
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      if (value === '12' || value?.includes('12')) {
        const errorMsg = `⚠️ localStorage.setItem detected suspicious value: ${key} = ${value}`;
        console.warn(errorMsg);
        setDebugLogs(prev => [...prev.slice(-10), errorMsg]);
      }
      return originalSetItem.call(this, key, value);
    };
    
    // Check existing localStorage for "12" values
    Object.keys(localStorage).forEach(key => {
      const value = localStorage.getItem(key);
      if (value === '12' || value?.includes('12')) {
        const errorMsg = `⚠️ Found suspicious localStorage entry: ${key} = ${value}`;
        console.warn(errorMsg);
        setDebugLogs(prev => [...prev.slice(-10), errorMsg]);
      }
    });
    
    return () => {
      localStorage.setItem = originalSetItem;
    };
  }, [organizations]);
  
  return (
    <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
      <CardHeader>
        <CardTitle className="text-red-800 dark:text-red-200 text-sm flex items-center gap-2">
          🔍 Organization Selection Debugger
          {organizations?.find(org => org.id === '12') && (
            <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">CRITICAL: "12" DETECTED</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Organizations count: {organizations?.length || 0}
          </div>
          
          {organizations && organizations.length > 0 && (
            <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto">
              {organizations.map((org, index) => (
                <div 
                  key={org.id} 
                  className={`text-xs p-1 rounded ${
                    org.id === '12' 
                      ? 'bg-red-200 text-red-800 border border-red-400' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  [{index}] ID: "{org.id}" ({typeof org.id}) - {org.name}
                  {/^\d+$/.test(String(org.id)) && (
                    <span className="ml-2 bg-orange-200 text-orange-800 px-1 rounded">NUMERIC</span>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {debugLogs.length > 0 && (
            <div className="mt-4">
              <div className="text-xs font-semibold text-red-800 dark:text-red-200">Debug Logs:</div>
              <div className="max-h-32 overflow-y-auto text-xs bg-red-100 dark:bg-red-900 p-2 rounded">
                {debugLogs.slice(-5).map((log, index) => (
                  <div key={index} className="text-red-800 dark:text-red-200 break-all">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
