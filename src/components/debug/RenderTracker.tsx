import React, { useRef, useEffect } from 'react';

interface RenderTrackerProps {
  componentName: string;
  children: React.ReactNode;
}

export const RenderTracker: React.FC<RenderTrackerProps> = ({ componentName, children }) => {
  const renderCount = useRef(0);
  const mountTime = useRef(Date.now());
  
  renderCount.current += 1;
  
  // Track renders with stack trace
  console.log(`🔥 ${componentName} render #${renderCount.current}`, {
    timestamp: Date.now() - mountTime.current,
    stack: new Error().stack?.split('\n').slice(2, 5).join('\n')
  });
  
  useEffect(() => {
    console.log(`✅ ${componentName} useEffect mount/update #${renderCount.current}`);
    
    return () => {
      console.log(`🗑️ ${componentName} cleanup #${renderCount.current}`);
    };
  });
  
  return <>{children}</>;
};

// Helper hook to track renders in any component
export const useRenderTracker = (componentName: string) => {
  const renderCount = useRef(0);
  const mountTime = useRef(Date.now());
  
  renderCount.current += 1;
  
  console.log(`🔥 ${componentName} render #${renderCount.current}`, {
    timestamp: Date.now() - mountTime.current
  });
  
  useEffect(() => {
    console.log(`✅ ${componentName} useEffect #${renderCount.current}`);
  });
  
  return renderCount.current;
};
