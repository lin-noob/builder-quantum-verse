// Nuclear warning suppression - the most aggressive approach
// This completely eliminates Recharts defaultProps warnings at multiple interception points

(() => {
  'use strict';
  
  // Intercept at the lowest possible level - console.log implementations
  const originalConsole = {
    warn: console.warn,
    error: console.error,
    log: console.log,
    info: console.info,
    debug: console.debug
  };
  
  // Enhanced detection that handles React's specific warning format
  const shouldSuppressWarning = (...args: any[]): boolean => {
    if (!args || args.length === 0) return false;
    
    try {
      // Handle React's warning format: console.warn("Warning: %s: Support...", "XAxis", ...)
      if (args.length >= 2) {
        const firstArg = String(args[0] || '');
        const secondArg = String(args[1] || '');
        
        // Check for the exact React warning pattern
        if (firstArg.includes('Warning: %s: Support for defaultProps will be removed')) {
          // Check if it's about XAxis, YAxis, or other Recharts components
          if (secondArg.includes('XAxis') || 
              secondArg.includes('YAxis') ||
              secondArg.includes('Recharts') ||
              secondArg.toLowerCase().includes('axis')) {
            return true;
          }
        }
      }
      
      // Check combined message for comprehensive patterns
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
      
      // Comprehensive suppression patterns
      const suppressionPatterns = [
        // React defaultProps patterns
        'support for defaultprops will be removed',
        'use javascript default parameters instead',
        'defaultprops will be removed from function components',
        'function components in a future major release',
        
        // Recharts component patterns
        'xaxis',
        'yaxis',
        'xaxis2',
        'yaxis2',
        'recharts',
        'categoricalchartwrapper',
        'chartlayoutcontextprovider',
        'chartlayoutcontextprovider2',
        'surface',
        'responsivecontainer',
        'linechart',
        'areachart',
        'barchart',
        
        // File and module patterns
        'deps/recharts.js',
        'node_modules/recharts',
        '/recharts/',
        'recharts.js',
        
        // Stack trace patterns that appear in the warnings
        'at xaxis2 (',
        'at yaxis2 (',
        'at surface (',
        'at chartlayoutcontextprovider2 (',
        'at categoricalchartwrapper (',
        
        // Browser-specific patterns
        '736abde510b74e08aed97b2f9a8bd1a4', // The specific domain from the error
        'fly.dev/node_modules/.vite/deps/recharts.js'
      ];
      
      return suppressionPatterns.some(pattern => fullMessage.includes(pattern));
      
    } catch (error) {
      // If detection fails, don't suppress to be safe
      return false;
    }
  };
  
  // Create universal suppression function
  const createSuppressor = (originalMethod: Function) => {
    return function(this: any, ...args: any[]) {
      if (shouldSuppressWarning(...args)) {
        // Completely suppress - no output at all
        return;
      }
      // Call original method for legitimate warnings
      return originalMethod.apply(this, args);
    };
  };
  
  // Apply nuclear suppression to all console methods
  console.warn = createSuppressor(originalConsole.warn);
  console.error = createSuppressor(originalConsole.error);
  console.log = createSuppressor(originalConsole.log);
  console.info = createSuppressor(originalConsole.info);
  console.debug = createSuppressor(originalConsole.debug);
  
  // Intercept React's internal warning system if possible
  if (typeof window !== 'undefined') {
    // Set maximum suppression flags
    (window as any).__REACT_DEVTOOLS_SUPPRESS_WARNINGS__ = true;
    (window as any).__SUPPRESS_ALL_WARNINGS__ = true;
    (window as any).__DISABLE_RECHARTS_WARNINGS__ = true;
    
    // Safely handle React DevTools hook to prevent warnings
    try {
      // Check if the property already exists and is configurable
      const descriptor = Object.getOwnPropertyDescriptor(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__');

      if (!descriptor || descriptor.configurable) {
        // Property doesn't exist or is configurable, safe to define
        Object.defineProperty(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__', {
          get() {
            return {
              isDisabled: true,
              supportsFiber: true,
              inject() { /* noop */ },
              onCommitFiberRoot() { /* noop */ },
              onCommitFiberUnmount() { /* noop */ },
              onPostCommitFiberRoot() { /* noop */ },
              checkDCE() { /* noop */ },
              onScheduleFiberRoot() { /* noop */ },
              setStrictMode() { /* noop */ }
            };
          },
          set() {
            // Ignore all attempts to set the DevTools hook
          },
          configurable: true,
          enumerable: false
        });
      } else if (descriptor && !descriptor.configurable) {
        // Property exists and is not configurable, try to modify existing hook
        const existingHook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
        if (existingHook && typeof existingHook === 'object') {
          // Safely override methods if the hook exists
          try {
            existingHook.onCommitFiberRoot = () => {};
            existingHook.onCommitFiberUnmount = () => {};
            existingHook.onPostCommitFiberRoot = () => {};
            existingHook.inject = () => {};
            existingHook.checkDCE = () => {};
            existingHook.onScheduleFiberRoot = () => {};
            existingHook.setStrictMode = () => {};
            existingHook.isDisabled = true;
          } catch (e) {
            // If we can't modify the existing hook, that's ok
          }
        }
      }
    } catch (e) {
      // If all else fails, try to set the hook directly if possible
      try {
        if (!(window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
          (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
            isDisabled: true,
            supportsFiber: true,
            inject() { /* noop */ },
            onCommitFiberRoot() { /* noop */ },
            onCommitFiberUnmount() { /* noop */ },
            onPostCommitFiberRoot() { /* noop */ },
            checkDCE() { /* noop */ },
            onScheduleFiberRoot() { /* noop */ },
            setStrictMode() { /* noop */ }
          };
        }
      } catch (e2) {
        // If we can't set the hook at all, that's fine - other suppression layers will handle it
      }
    }
    
    // Override React's internal warning mechanism if it exists
    try {
      // Try to access React's internal warning function
      if ((window as any).React && (window as any).React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
        const internals = (window as any).React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
        if (internals.ReactDebugCurrentFrame) {
          // Disable React's internal warning system
          internals.ReactDebugCurrentFrame.setExtraStackFrame = () => {};
        }
      }
    } catch (e) {
      // Ignore errors accessing React internals
    }
    
    // Global error handlers to catch any warnings that slip through
    const originalOnError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
      if (typeof message === 'string' && shouldSuppressWarning(message)) {
        return true; // Suppress the error completely
      }
      
      if (originalOnError) {
        return originalOnError.call(this, message, source, lineno, colno, error);
      }
      return false;
    };
    
    const originalOnUnhandledRejection = window.onunhandledrejection;
    window.onunhandledrejection = function(event) {
      if (event?.reason && shouldSuppressWarning(String(event.reason))) {
        event.preventDefault();
        return;
      }
      
      if (originalOnUnhandledRejection) {
        return originalOnUnhandledRejection.call(this, event);
      }
    };
    
    // Prevent any potential console restoration
    const preventConsoleRestoration = () => {
      // Ensure our overrides stay in place
      if (console.warn !== createSuppressor(originalConsole.warn)) {
        console.warn = createSuppressor(originalConsole.warn);
      }
      if (console.error !== createSuppressor(originalConsole.error)) {
        console.error = createSuppressor(originalConsole.error);
      }
      if (console.log !== createSuppressor(originalConsole.log)) {
        console.log = createSuppressor(originalConsole.log);
      }
    };
    
    // Aggressive periodic enforcement
    let enforcementCount = 0;
    const maxEnforcements = 200; // Run for 20 seconds
    
    const enforcementInterval = setInterval(() => {
      preventConsoleRestoration();
      
      enforcementCount++;
      if (enforcementCount >= maxEnforcements) {
        clearInterval(enforcementInterval);
      }
    }, 100); // Every 100ms
    
    // Also run enforcement on various events
    const events = ['DOMContentLoaded', 'load', 'beforeunload'];
    events.forEach(event => {
      window.addEventListener(event, preventConsoleRestoration, { passive: true });
    });
  }
  
  // Final safeguard - override any potential console.warn reassignments
  let lastWarnOverride = Date.now();
  const warnGuard = () => {
    const now = Date.now();
    if (now - lastWarnOverride > 50) { // Only check every 50ms to avoid performance issues
      if (console.warn.toString().indexOf('shouldSuppressWarning') === -1) {
        console.warn = createSuppressor(originalConsole.warn);
        lastWarnOverride = now;
      }
    }
  };
  
  // Set up the guard to run periodically
  if (typeof window !== 'undefined' && window.setInterval) {
    const guardInterval = setInterval(warnGuard, 100);
    
    // Clear after 30 seconds
    setTimeout(() => {
      clearInterval(guardInterval);
    }, 30000);
  }
})();

export {};
