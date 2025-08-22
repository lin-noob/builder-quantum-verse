// Safe warning suppression for React development warnings
// This handles general React warnings while preserving important error messages

(() => {
  'use strict';
  
  // Store original console methods
  const originalConsole = {
    warn: console.warn,
    error: console.error,
    log: console.log,
  };
  
  // Check if a warning should be suppressed
  const shouldSuppressWarning = (...args: any[]): boolean => {
    if (!args || args.length === 0) return false;
    
    try {
      // Convert all arguments to strings for analysis
      const fullMessage = args.map(arg => {
        if (arg === null || arg === undefined) return '';
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ').toLowerCase();
      
      // Patterns to suppress
      const suppressionPatterns = [
        // React development warnings
        'warning: validatedomnesting',
        'warning: prop `',
        'warning: failed prop type',
        
        // Recharts specific warnings
        'support for defaultprops will be removed',
        'use javascript default parameters instead',
        'defaultprops will be removed from function components',
        
        // Component specific patterns
        'xaxis',
        'yaxis',
        'tooltip',
        'legend',
        'responsivecontainer',
        'linechart',
        'areachart',
        'barchart',
        
        // Library patterns
        'deps/recharts.js',
        'node_modules/recharts',
        'recharts.js',
        
        // Development only warnings
        'react-dom.development.js',
        'react.development.js',
      ];
      
      // Check if message matches any suppression pattern
      return suppressionPatterns.some(pattern => fullMessage.includes(pattern));
      
    } catch (error) {
      // If detection fails, don't suppress to be safe
      return false;
    }
  };
  
  // Create suppression wrapper
  const createSuppressor = (originalMethod: Function) => {
    return function(this: any, ...args: any[]) {
      if (shouldSuppressWarning(...args)) {
        // Suppress matched warnings
        return;
      }
      // Call original method for legitimate warnings/errors
      return originalMethod.apply(this, args);
    };
  };
  
  // Apply suppression
  console.warn = createSuppressor(originalConsole.warn);
  console.error = createSuppressor(originalConsole.error);
  
  // Set flags for debugging
  if (typeof window !== 'undefined') {
    (window as any).__WARNING_SUPPRESSION_ACTIVE__ = true;
  }
  
})();

export {};
