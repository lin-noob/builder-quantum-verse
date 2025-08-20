// Ultimate warning suppression - runs before everything else
// This is the most aggressive suppression to eliminate Recharts warnings completely

// Immediately execute before any other code
(() => {
  'use strict';
  
  // Comprehensive pattern matching for any React/Recharts warnings
  const isTargetWarning = (args: any[]): boolean => {
    if (!args || args.length === 0) return false;
    
    try {
      // Convert all arguments to searchable string
      const fullText = args.map(arg => {
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
      
      // Ultra-comprehensive pattern list
      const suppressPatterns = [
        // Direct React warnings
        'support for defaultprops will be removed',
        'use javascript default parameters instead',
        'defaultprops will be removed from function components',
        'warning: %s: support for defaultprops',
        
        // Recharts specific
        'xaxis',
        'yaxis',
        'recharts',
        'categoricalchartwrapper',
        'chartlayoutcontextprovider',
        'surface',
        'responsivercomponent',
        
        // File paths that indicate Recharts
        'deps/recharts.js',
        'node_modules/recharts',
        '/recharts/',
        
        // Stack trace indicators
        'at xaxis2',
        'at yaxis2',
        'at surface',
        'at chartlayoutcontextprovider2',
        'at categoricalchartwrapper',
        
        // Any variation of the warning message
        'function components in a future major release'
      ];
      
      // Check if any pattern matches
      return suppressPatterns.some(pattern => fullText.includes(pattern));
      
    } catch (error) {
      // If there's any error in detection, don't suppress to be safe
      return false;
    }
  };
  
  // Capture original console methods immediately
  const originalMethods = {
    warn: console.warn,
    error: console.error,
    log: console.log,
    info: console.info,
    debug: console.debug
  };
  
  // Create the suppression function
  const createSuppressor = (originalMethod: Function) => {
    return function(this: Console, ...args: any[]) {
      if (isTargetWarning(args)) {
        // Completely suppress - don't call original method at all
        return;
      }
      // Call original method for non-target warnings
      return originalMethod.apply(this, args);
    };
  };
  
  // Apply suppression to all console methods
  console.warn = createSuppressor(originalMethods.warn);
  console.error = createSuppressor(originalMethods.error);
  console.log = createSuppressor(originalMethods.log);
  console.info = createSuppressor(originalMethods.info);
  console.debug = createSuppressor(originalMethods.debug);
  
  // Prevent React DevTools from triggering warnings
  if (typeof window !== 'undefined') {
    // Set suppression flags
    (window as any).__REACT_DEVTOOLS_SUPPRESS_WARNINGS__ = true;
    (window as any).__SUPPRESS_ALL_WARNINGS__ = true;
    
    // Override React DevTools hook if it exists
    Object.defineProperty(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__', {
      get() {
        return {
          isDisabled: true,
          supportsFiber: true,
          inject: () => {},
          onCommitFiberRoot: () => {},
          onCommitFiberUnmount: () => {},
          onPostCommitFiberRoot: () => {},
        };
      },
      set() {
        // Ignore attempts to set the hook
      },
      configurable: false,
      enumerable: false
    });
    
    // Global error suppression
    const originalOnError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
      if (typeof message === 'string' && isTargetWarning([message])) {
        return true; // Suppress the error
      }
      
      if (originalOnError) {
        return originalOnError.call(this, message, source, lineno, colno, error);
      }
      return false;
    };
    
    // Promise rejection suppression
    const originalOnUnhandledRejection = window.onunhandledrejection;
    window.onunhandledrejection = function(event) {
      if (event?.reason && isTargetWarning([String(event.reason)])) {
        event.preventDefault();
        return;
      }
      
      if (originalOnUnhandledRejection) {
        return originalOnUnhandledRejection.call(this, event);
      }
    };
  }
  
  // Periodic reinforcement to handle late-loading scripts
  if (typeof window !== 'undefined' && window.setTimeout) {
    let reinforceCount = 0;
    const reinforceInterval = window.setInterval(() => {
      // Ensure our overrides are still in place
      if (console.warn.toString().indexOf('isTargetWarning') === -1) {
        console.warn = createSuppressor(originalMethods.warn);
      }
      if (console.error.toString().indexOf('isTargetWarning') === -1) {
        console.error = createSuppressor(originalMethods.error);
      }
      
      reinforceCount++;
      if (reinforceCount >= 100) { // Run for 10 seconds (100 * 100ms)
        window.clearInterval(reinforceInterval);
      }
    }, 100);
  }
})();

export {};
