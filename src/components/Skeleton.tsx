import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '',
  variant = 'text',
  width = '100%',
  height = variant === 'text' ? '1rem' : '200px',
  lines = 1
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full'
  };

  const skeletonStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses[variant]}`}
            style={{
              ...skeletonStyle,
              width: index === lines - 1 ? '75%' : skeletonStyle.width
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={skeletonStyle}
    />
  );
};

// Skeleton components for specific use cases
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-4 border rounded-lg space-y-3 ${className}`}>
    <Skeleton variant="text" height="1.5rem" width="60%" />
    <Skeleton variant="text" lines={2} />
    <div className="flex space-x-2">
      <Skeleton variant="rectangular" width="80px" height="32px" />
      <Skeleton variant="rectangular" width="80px" height="32px" />
    </div>
  </div>
);

export const SkeletonCalendar: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    <div className="flex justify-between items-center">
      <Skeleton variant="text" width="200px" height="2rem" />
      <div className="flex space-x-2">
        <Skeleton variant="circular" width="40px" height="40px" />
        <Skeleton variant="circular" width="40px" height="40px" />
      </div>
    </div>
    <div className="grid grid-cols-7 gap-2">
      {Array.from({ length: 35 }).map((_, index) => (
        <Skeleton key={index} variant="rectangular" height="60px" />
      ))}
    </div>
  </div>
);

export const SkeletonChart: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    <Skeleton variant="text" width="150px" height="1.5rem" />
    <Skeleton variant="rectangular" height="300px" />
    <div className="flex justify-center space-x-4">
      <Skeleton variant="text" width="60px" />
      <Skeleton variant="text" width="60px" />
      <Skeleton variant="text" width="60px" />
    </div>
  </div>
);

export default Skeleton;
