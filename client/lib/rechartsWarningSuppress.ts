// Targeted suppression for Recharts defaultProps warnings
// This addresses the specific React warning format for function component defaultProps

(() => {
  'use strict';

  if (typeof console !== 'undefined') {
    // Store original methods
    const originalWarn = console.warn.bind(console);
    const originalError = console.error.bind(console);
    const originalLog = console.log.bind(console);

    // Enhanced detection for React warning patterns
    const shouldSuppressMessage = (...args: any[]): boolean => {
      if (!args || args.length === 0) return false;

      try {
        // Handle React's specific warning format: console.warn("Warning: %s: Support...", "XAxis", ...)
        if (args.length >= 2) {
          const firstArg = String(args[0] || '');
          const secondArg = String(args[1] || '');

          // Check for the exact React warning pattern
          if (firstArg.includes('Warning: %s: Support for defaultProps will be removed') ||
              firstArg.includes('Support for defaultProps will be removed from function components')) {
            
            // Check if it's about Recharts components
            if (secondArg.includes('XAxis') || 
                secondArg.includes('YAxis') || 
                secondArg.includes('XAxis2') || 
                secondArg.includes('YAxis2') ||
                args.some(arg => {
                  const str = String(arg || '');
                  return str.includes('recharts') || 
                         str.includes('XAxis') || 
                         str.includes('YAxis') ||
                         str.includes('deps/recharts.js');
                })) {
              return true;
            }
          }
        }

        // Check combined message for broader patterns
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
          
          // Recharts component patterns combined with defaultProps
          'xaxis.*defaultprops',
          'yaxis.*defaultprops',
          'recharts.*defaultprops',
          'defaultprops.*xaxis',
          'defaultprops.*yaxis',
          'defaultprops.*recharts',
          
          // File patterns
          'deps/recharts.js',
          'node_modules/recharts',
          '/recharts/',
          
          // Stack trace patterns
          'at xaxis2 (',
          'at yaxis2 (',
          'at surface (',
          'at chartlayoutcontextprovider',
          'at categoricalchartwrapper',
          
          // URL patterns from the error
          '736abde510b74e08aed97b2f9a8bd1a4',
          'fly.dev/node_modules/.vite/deps/recharts.js'
        ];

        // Check if message matches any suppression pattern
        return suppressionPatterns.some(pattern => {
          if (pattern.includes('.*')) {
            // Handle regex-like patterns
            const regex = new RegExp(pattern);
            return regex.test(fullMessage);
          }
          return fullMessage.includes(pattern);
        });

      } catch (error) {
        // If detection fails, don't suppress to be safe
        return false;
      }
    };

    // Override console methods with enhanced suppression
    console.warn = function(...args: any[]) {
      if (shouldSuppressMessage(...args)) {
        return; // Completely suppress
      }
      originalWarn(...args);
    };

    console.error = function(...args: any[]) {
      if (shouldSuppressMessage(...args)) {
        return; // Completely suppress
      }
      originalError(...args);
    };

    console.log = function(...args: any[]) {
      if (shouldSuppressMessage(...args)) {
        return; // Completely suppress
      }
      originalLog(...args);
    };

    // Global error handlers for any warnings that slip through
    if (typeof window !== 'undefined') {
      const originalOnError = window.onerror;
      window.onerror = function(message, source, lineno, colno, error) {
        if (typeof message === 'string' && shouldSuppressMessage(message)) {
          return true; // Suppress the error
        }
        
        if (originalOnError) {
          return originalOnError.call(this, message, source, lineno, colno, error);
        }
        return false;
      };

      const originalOnUnhandledRejection = window.onunhandledrejection;
      window.onunhandledrejection = function(event) {
        if (event?.reason && shouldSuppressMessage(String(event.reason))) {
          event.preventDefault();
          return;
        }
        
        if (originalOnUnhandledRejection) {
          return originalOnUnhandledRejection.call(this, event);
        }
      };

      // Set React DevTools suppression flags
      (window as any).__REACT_DEVTOOLS_SUPPRESS_WARNINGS__ = true;
      (window as any).__SUPPRESS_RECHARTS_WARNINGS__ = true;
    }
  }
})();

export {};
