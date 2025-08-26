// Pre-load Recharts warning suppression
// This runs before any modules are loaded to catch warnings at the earliest possible point

(function() {
  'use strict';

  // Run immediately when script loads, before any React or Recharts initialization
  if (typeof console !== 'undefined') {
    // Store original console methods
    const originalMethods = {
      warn: console.warn.bind(console),
      error: console.error.bind(console),
      log: console.log.bind(console),
      info: console.info.bind(console),
      debug: console.debug.bind(console),
    };

    // Ultra-aggressive detection for Recharts defaultProps warnings
    const isRechartsDefaultPropsWarning = function() {
      const args = Array.prototype.slice.call(arguments);
      if (!args || args.length === 0) return false;

      try {
        // Handle the exact React warning format:
        // console.warn("Warning: %s: Support for defaultProps...", "XAxis", ...)
        if (args.length >= 2) {
          const firstArg = String(args[0] || '');
          const secondArg = String(args[1] || '');

          // Check for React's warning pattern with Recharts components
          if ((firstArg.indexOf('Warning: %s: Support for defaultProps') !== -1 ||
               firstArg.indexOf('Support for defaultProps will be removed') !== -1) &&
              (secondArg.indexOf('XAxis') !== -1 ||
               secondArg.indexOf('YAxis') !== -1 ||
               secondArg.indexOf('XAxis2') !== -1 ||
               secondArg.indexOf('YAxis2') !== -1)) {
            return true;
          }
        }

        // Check combined message for broader patterns
        const fullMessage = args.join(' ').toLowerCase();
        
        // Specific patterns from the error logs
        return (fullMessage.indexOf('support for defaultprops') !== -1 && 
                (fullMessage.indexOf('xaxis') !== -1 || 
                 fullMessage.indexOf('yaxis') !== -1 || 
                 fullMessage.indexOf('recharts') !== -1)) ||
               (fullMessage.indexOf('defaultprops') !== -1 && 
                fullMessage.indexOf('deps/recharts.js') !== -1) ||
               (fullMessage.indexOf('736abde510b74e08aed97b2f9a8bd1a4') !== -1) ||
               (fullMessage.indexOf('fly.dev') !== -1 && 
                fullMessage.indexOf('recharts.js') !== -1);
      } catch (e) {
        return false;
      }
    };

    // Override console methods immediately with safe assignment
    var safeSetConsoleMethod = function(method, value) {
      try {
        Object.defineProperty(console, method, {
          value: value,
          writable: true,
          configurable: true
        });
      } catch (e) {
        try {
          console[method] = value;
        } catch (e2) {
          // Console method can't be overridden in this environment
        }
      }
    };

    safeSetConsoleMethod('warn', function() {
      if (!isRechartsDefaultPropsWarning.apply(null, arguments)) {
        originalMethods.warn.apply(console, arguments);
      }
    });

    safeSetConsoleMethod('error', function() {
      if (!isRechartsDefaultPropsWarning.apply(null, arguments)) {
        originalMethods.error.apply(console, arguments);
      }
    });

    safeSetConsoleMethod('log', function() {
      if (!isRechartsDefaultPropsWarning.apply(null, arguments)) {
        originalMethods.log.apply(console, arguments);
      }
    });

    // Set up global flags for React and Recharts
    if (typeof window !== 'undefined') {
      window.__SUPPRESS_RECHARTS_WARNINGS__ = true;
      window.__REACT_DEVTOOLS_SUPPRESS_WARNINGS__ = true;
      
      // Set up process.env if it doesn't exist
      if (!window.process) window.process = { env: {} };
      if (!window.process.env) window.process.env = {};
      window.process.env.__SUPPRESS_WARNING__ = 'true';

      // Global error suppression
      var originalOnError = window.onerror;
      window.onerror = function(message, source, lineno, colno, error) {
        if (typeof message === 'string' && isRechartsDefaultPropsWarning(message)) {
          return true; // Suppress the error
        }
        if (originalOnError) {
          return originalOnError.call(this, message, source, lineno, colno, error);
        }
        return false;
      };

      var originalOnUnhandledRejection = window.onunhandledrejection;
      window.onunhandledrejection = function(event) {
        if (event && event.reason && isRechartsDefaultPropsWarning(String(event.reason))) {
          event.preventDefault();
          return;
        }
        if (originalOnUnhandledRejection) {
          return originalOnUnhandledRejection.call(this, event);
        }
      };
    }

    // Prevent console methods from being restored
    if (typeof Object !== 'undefined' && Object.defineProperty) {
      try {
        ['warn', 'error', 'log'].forEach(function(method) {
          Object.defineProperty(console, method, {
            value: console[method],
            writable: false,
            configurable: false,
          });
        });
      } catch (e) {
        // Ignore if properties can't be made non-configurable
      }
    }
  }
})();
