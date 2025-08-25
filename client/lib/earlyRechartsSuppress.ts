// Early-stage suppression that runs before React initialization
// This catches warnings at the earliest possible point

// Run immediately when module is loaded
(function() {
  'use strict';

  // Immediate console override before any other code runs
  const originalMethods = {
    warn: console.warn,
    error: console.error,
    log: console.log
  };

  // Ultra-specific detection for the exact error format we're seeing
  const isRechartsDefaultPropsWarning = (...args: any[]): boolean => {
    if (!args || args.length === 0) return false;

    // Handle the exact React warning format from the error:
    // console.warn("Warning: %s: Support for defaultProps...", "XAxis", additionalInfo)
    if (args.length >= 2) {
      const msg = String(args[0] || '');
      const component = String(args[1] || '');

      // Match the exact warning text and component names from the error
      if ((msg.includes('Warning: %s: Support for defaultProps will be removed') ||
           msg.includes('Support for defaultProps will be removed from function components')) &&
          (component === 'XAxis' || component === 'YAxis' || 
           component === 'XAxis2' || component === 'YAxis2' ||
           component.includes('Axis'))) {
        return true;
      }
    }

    // Additional patterns from the stack trace
    const fullMessage = args.join(' ').toLowerCase();
    return fullMessage.includes('support for defaultprops') &&
           (fullMessage.includes('xaxis') || fullMessage.includes('yaxis') || 
            fullMessage.includes('recharts') || fullMessage.includes('deps/recharts.js'));
  };

  // Override all console methods immediately
  console.warn = function(...args: any[]) {
    if (isRechartsDefaultPropsWarning(...args)) {
      return; // Silently ignore
    }
    originalMethods.warn.apply(console, args);
  };

  console.error = function(...args: any[]) {
    if (isRechartsDefaultPropsWarning(...args)) {
      return; // Silently ignore
    }
    originalMethods.error.apply(console, args);
  };

  console.log = function(...args: any[]) {
    if (isRechartsDefaultPropsWarning(...args)) {
      return; // Silently ignore
    }
    originalMethods.log.apply(console, args);
  };

  // Set up global handlers if running in browser
  if (typeof window !== 'undefined') {
    // Prevent any warning restoration
    Object.defineProperty(window, 'console', {
      value: console,
      writable: false,
      configurable: false
    });

    // Set environment flags for React
    if (!window.process) window.process = { env: {} } as any;
    if (!window.process.env) window.process.env = {} as any;
    
    // Add suppression flags
    (window as any).__SUPPRESS_RECHARTS_WARNINGS__ = true;
    (window as any).__REACT_DEVTOOLS_SUPPRESS_WARNINGS__ = true;
  }
})();

export {};
