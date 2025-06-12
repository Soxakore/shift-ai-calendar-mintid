import React, { useEffect } from 'react';

// This component intercepts and monitors RPC calls to detect the "12" issue
const RpcCallMonitor: React.FC = () => {
  useEffect(() => {
    if (import.meta.env.DEV) {
      // Create a wrapper around the supabase rpc function
      const originalFetch = window.fetch;
      
      window.fetch = async (...args) => {
        const [resource, config] = args;
        
        // Check if this is a Supabase RPC call
        if (typeof resource === 'string' && resource.includes('/rest/v1/rpc/')) {
          console.log('🔍 RPC CALL INTERCEPTED:', resource);
          
          if (config?.body) {
            try {
              const body = JSON.parse(config.body as string);
              console.log('📦 RPC Body:', body);
              
              // Check for the problematic "12" value
              const bodyStr = JSON.stringify(body);
              if (bodyStr.includes('"12"') || bodyStr.includes("'12'")) {
                console.error('🚨 FOUND "12" IN RPC CALL!');
                console.error('🔍 Full body:', body);
                console.error('🔍 URL:', resource);
                console.trace('🔍 Call stack:');
                
                // Also check specific parameters
                if (body.p_organisation_id === '12') {
                  console.error('🚨 p_organisation_id is "12"!');
                  alert('CRITICAL: p_organisation_id is "12" - this will cause UUID error!');
                }
                if (body.p_department_id === '12') {
                  console.error('🚨 p_department_id is "12"!');
                  alert('CRITICAL: p_department_id is "12" - this will cause UUID error!');
                }
              }
            } catch (parseError) {
              console.warn('Could not parse RPC body:', parseError);
            }
          }
        }
        
        return originalFetch.apply(window, args);
      };
      
      console.log('🔍 RPC Call Monitor initialized');
      
      return () => {
        window.fetch = originalFetch;
        console.log('🔍 RPC Call Monitor cleaned up');
      };
    }
  }, []);

  return null; // This component renders nothing
};

export default RpcCallMonitor;
