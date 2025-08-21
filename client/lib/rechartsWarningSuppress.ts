// Specialized Recharts defaultProps warning suppressor
// This targets the specific React 18+ warnings from Recharts components

(() => {
  'use strict';
  
  // Store original console methods
  const originalConsole = {
    warn: console.warn,
    error: console.error,
  };
  
  // Check if a warning should be suppressed
  const shouldSuppressRecharts = (...args: any[]): boolean => {
    if (!args || args.length === 0) return false;
    
    try {
      // Check for React defaultProps warning pattern: console.warn("Warning: %s: Support...", "XAxis", ...)
      if (args.length >= 2) {
        const firstArg = String(args[0] || '');
        const secondArg = String(args[1] || '');
        
        // Match React's warning format for defaultProps
        if (firstArg.includes('Support for defaultProps will be removed') ||
            firstArg.includes('Warning: %s: Support for defaultProps will be removed')) {
          
          // Check if it's about Recharts components
          if (secondArg.includes('XAxis') || 
              secondArg.includes('YAxis') ||
              secondArg.includes('XAxis2') ||
              secondArg.includes('YAxis2') ||
              secondArg.includes('Tooltip') ||
              secondArg.includes('Legend') ||
              secondArg.includes('ResponsiveContainer')) {
            return true;
          }
        }
      }
      
      // Fallback: check all arguments for Recharts defaultProps warnings
      const fullMessage = args.map(arg => String(arg || '')).join(' ');
      
      const isDefaultPropsWarning = fullMessage.includes('Support for defaultProps will be removed');
      const isRechartsComponent = /\b(XAxis|YAxis|XAxis2|YAxis2|Tooltip|Legend|ResponsiveContainer|LineChart|AreaChart|BarChart)\b/i.test(fullMessage);
      const hasRechartsTrace = fullMessage.includes('deps/recharts.js') || 
                              fullMessage.includes('node_modules/recharts') ||
                              fullMessage.includes('recharts.js');
      
      return isDefaultPropsWarning && (isRechartsComponent || hasRechartsTrace);
      
    } catch (error) {
      // If detection fails, don't suppress to be safe
      return false;
    }
  };
  
  // Create suppression wrapper
  const createSuppressor = (originalMethod: Function) => {
    return function(this: any, ...args: any[]) {
      if (shouldSuppressRecharts(...args)) {
        // Suppress Recharts warnings completely
        return;
      }
      // Call original method for all other warnings
      return originalMethod.apply(this, args);
    };
  };
  
  // Apply suppression to console methods
  console.warn = createSuppressor(originalConsole.warn);
  console.error = createSuppressor(originalConsole.error);
  
  // Dev info
  if (typeof window !== 'undefined') {
    (window as any).__RECHARTS_WARNINGS_SUPPRESSED__ = true;
  }
  
})();

export {};
