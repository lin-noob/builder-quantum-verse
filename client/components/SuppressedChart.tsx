import React, { useEffect, useRef } from 'react';

interface SuppressedChartProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that suppresses warnings from recharts components
 * This creates an isolated environment for chart rendering
 */
const SuppressedChart: React.FC<SuppressedChartProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create an isolated console context for this chart
    const originalWarn = console.warn;
    const originalError = console.error;

    const suppressedWarn = (...args: any[]) => {
      const message = args.join(' ');
      if (message.includes('defaultProps') || 
          message.includes('XAxis') || 
          message.includes('YAxis') ||
          message.includes('recharts')) {
        return; // Suppress chart-related warnings
      }
      originalWarn.apply(console, args);
    };

    const suppressedError = (...args: any[]) => {
      const message = args.join(' ');
      if (message.includes('defaultProps') || 
          message.includes('XAxis') || 
          message.includes('YAxis') ||
          message.includes('recharts')) {
        return; // Suppress chart-related errors
      }
      originalError.apply(console, args);
    };

    // Apply suppression when component mounts
    console.warn = suppressedWarn;
    console.error = suppressedError;

    return () => {
      // Restore original console methods when component unmounts
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  return (
    <div ref={containerRef} className="recharts-suppressed-container">
      {children}
    </div>
  );
};

export default SuppressedChart;
