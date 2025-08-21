// Safe warning suppression that doesn't interfere with React core functionality
(() => {
  'use strict';
  
  // Only suppress specific console.warn calls, not console itself
  const originalWarn = console.warn;
  
  console.warn = function(...args) {
    // Only check for specific defaultProps warnings from Recharts
    if (args.length >= 2) {
      const firstArg = String(args[0] || '');
      const secondArg = String(args[1] || '');
      
      // Specific pattern for React defaultProps warnings about Recharts components
      if (firstArg.includes('Warning: %s: Support for defaultProps will be removed') &&
          (secondArg.includes('XAxis') || secondArg.includes('YAxis') || 
           secondArg.includes('ResponsiveContainer') || secondArg.includes('LineChart'))) {
        return; // Suppress this specific warning
      }
    }
    
    // For all other warnings, call the original function
    return originalWarn.apply(this, args);
  };
})();

export {};
