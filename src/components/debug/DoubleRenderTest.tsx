import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

let renderCount = 0;

const DoubleRenderTest = () => {
  renderCount++;
  
  console.log(`🧪 DoubleRenderTest render #${renderCount}`);
  
  return (
    <Card style={{ border: '2px solid red', margin: '10px' }}>
      <CardHeader>
        <CardTitle>Double Render Test - Render #{renderCount}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This component has rendered {renderCount} times.</p>
        <p>If you see this twice visually, we have double rendering.</p>
        <p>Check console for render count.</p>
      </CardContent>
    </Card>
  );
};

export default DoubleRenderTest;
