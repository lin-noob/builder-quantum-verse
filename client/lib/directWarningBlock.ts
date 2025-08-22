// Direct warning blocking - intercepts React's exact warning format
// This targets the specific format React uses for defaultProps warnings

// Execute immediately to catch warnings as early as possible
(function() {
  'use strict';
  
  // Store the original console.warn
  const originalWarn = console.warn;
  
  // Completely override console.warn with our custom handler
  console.warn = function(...args: any[]) {
    // Convert all arguments to strings for analysis
    const argStrings = args.map(arg => {
      if (arg === null || arg === undefined) return '';
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    });
    
    // Check for the exact React warning pattern
    // React calls: console.warn("Warning: %s: Support for defaultProps...", "XAxis", stackTrace)
    if (args.length >= 2) {
      const firstArg = argStrings[0];
      const secondArg = argStrings[1];
      
      // Pattern 1: Exact React warning format
      if (firstArg.includes('Warning: %s: Support for defaultProps will be removed') &&
          (secondArg === 'XAxis' || secondArg === 'YAxis' || 
           secondArg === 'XAxis2' || secondArg === 'YAxis2')) {
        // Block completely
        return;
      }
    }
    
    // Pattern 2: Check the full message for any Recharts defaultProps warning
    const fullMessage = argStrings.join(' ').toLowerCase();
    
    const hasDefaultPropsWarning = fullMessage.includes('support for defaultprops will be removed');
    const hasRechartsComponent = /\b(xaxis|yaxis|tooltip|legend|responsivecontainer)\b/i.test(fullMessage);
    const hasRechartsTrace = fullMessage.includes('recharts.js') || 
                            fullMessage.includes('28514:22') || 
                            fullMessage.includes('28575:22');
    
    if (hasDefaultPropsWarning && (hasRechartsComponent || hasRechartsTrace)) {
      // Block Recharts defaultProps warnings
      return;
    }
    
    // Allow all other warnings through
    originalWarn.apply(console, args);
  };
  
  // Also override window.console.warn in case it's accessed differently
  if (typeof window !== 'undefined' && window.console) {
    window.console.warn = console.warn;
  }
  
  // Set a global flag to indicate this is active
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).__DIRECT_WARNING_BLOCK_ACTIVE__ = true;
  }
  
})();

export {};
