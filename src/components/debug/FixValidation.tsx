import React, { useRef, useEffect } from 'react';
import { usePresence } from '@/hooks/usePresence';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

const FixValidation = () => {
  const renderCount = useRef(0);
  renderCount.current += 1;
  
  const { user } = useSupabaseAuth();
  const { onlineUsers, totalOnlineUsers } = usePresence('test-channel', user);
  
  useEffect(() => {
    console.log(`✅ FixValidation render #${renderCount.current} - Users: ${totalOnlineUsers}`);
  });

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <h3 className="text-lg font-semibold text-green-800 mb-2">
        🔧 Double Rendering Fix Validation
      </h3>
      <div className="text-sm text-green-700">
        <p><strong>Render Count:</strong> {renderCount.current}</p>
        <p><strong>Online Users:</strong> {totalOnlineUsers}</p>
        <p><strong>Expected:</strong> Should render only once per state change</p>
      </div>
      <div className="mt-3 text-xs text-green-600">
        Check browser console for render logs with 🔄, 🔑, and 🔥 emojis
      </div>
    </div>
  );
};

export default FixValidation;
