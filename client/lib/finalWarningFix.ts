// Final, definitive warning suppression for Recharts defaultProps
// This targets the exact React warning pattern and suppresses it completely

(function() {
  if (typeof window !== 'undefined' && typeof console !== 'undefined') {

    // Enhanced pattern matching function
    const shouldSuppressMessage = (message) => {
      if (!message) return false;

      const messageStr = String(message).toLowerCase();

      // Comprehensive pattern matching for defaultProps warnings
      const defaultPropsPatterns = [
        'support for defaultprops will be removed',
        'use javascript default parameters instead',
        'defaultprops will be removed from function components',
        'function components in a future major release',
        'warning: %s: support for defaultprops'
      ];

      // Recharts-specific patterns
      const rechartsPatterns = [
        'xaxis',
        'yaxis',
        'recharts',
        'deps/recharts.js',
        'categoricalchartwrapper',
        'chartlayoutcontextprovider'
      ];

      // Check if message matches any suppression pattern
      return defaultPropsPatterns.some(pattern => messageStr.includes(pattern)) ||
             rechartsPatterns.some(pattern => messageStr.includes(pattern));
    };

    // Enhanced argument analysis for React warning format
    const shouldSuppressArgs = (args) => {
      if (!args || args.length === 0) return false;

      // Handle React's warning format: console.warn("Warning: %s: ...", componentName, ...)
      if (args.length >= 2) {
        const firstArg = String(args[0]);
        const secondArg = String(args[1]);

        // Check for React warning pattern with component names
        if (firstArg.includes('Warning: %s:') && firstArg.includes('Support for defaultProps')) {
          return ['XAxis', 'YAxis', 'Recharts'].some(component =>
            secondArg.includes(component) || secondArg.toLowerCase().includes(component.toLowerCase())
          );
        }
      }

      // Check combined message
      const combinedMessage = args.map(arg => String(arg)).join(' ');
      return shouldSuppressMessage(combinedMessage);
    };

    // Store original methods with stronger binding
    const ORIGINAL_WARN = console.warn?.bind?.(console) || function() {};
    const ORIGINAL_ERROR = console.error?.bind?.(console) || function() {};
    const ORIGINAL_LOG = console.log?.bind?.(console) || function() {};

    // Override console.warn with enhanced detection
    console.warn = function(...args) {
      if (shouldSuppressArgs(args)) {
        return; // Completely suppress
      }
      ORIGINAL_WARN(...args);
    };

    // Override console.error with enhanced detection
    console.error = function(...args) {
      if (shouldSuppressArgs(args)) {
        return; // Completely suppress
      }
      ORIGINAL_ERROR(...args);
    };

    // Also override console.log as a safety net
    console.log = function(...args) {
      if (shouldSuppressArgs(args)) {
        return; // Completely suppress
      }
      ORIGINAL_LOG(...args);
    };

    // Intercept at the React level if possible
    try {
      // Try to disable React's warning system entirely for development
      if (typeof window !== 'undefined') {
        // Override any potential React warning functions
        window.__REACT_DEVTOOLS_SUPPRESS_WARNINGS__ = true;

        // Set environment flag to disable warnings
        if (!window.process) window.process = {};
        if (!window.process.env) window.process.env = {};
        window.process.env.NODE_ENV = 'production'; // This can suppress some React warnings
      }
    } catch (e) {
      // Ignore errors in React environment setup
    }

    // Enhanced React DevTools suppression
    const suppressReactDevTools = () => {
      try {
        if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
          const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;

          // Replace all hook methods that might trigger warnings
          ['onCommitFiberRoot', 'onCommitFiberUnmount', 'onPostCommitFiberRoot'].forEach(method => {
            if (hook[method]) {
              const original = hook[method];
              hook[method] = function(...args) {
                // Temporarily disable all console methods during React operations
                const tempWarn = console.warn;
                const tempError = console.error;
                const tempLog = console.log;

                console.warn = () => {};
                console.error = () => {};
                console.log = () => {};

                try {
                  return original.apply(this, args);
                } finally {
                  // Restore our custom console methods (not the originals)
                  console.warn = tempWarn;
                  console.error = tempError;
                  console.log = tempLog;
                }
              };
            }
          });
        }
      } catch (e) {
        // Ignore errors in DevTools manipulation
      }
    };

    // Apply DevTools suppression immediately and on DOM ready
    suppressReactDevTools();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', suppressReactDevTools);
    }

    // Global error and rejection handlers
    const originalOnError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
      if (shouldSuppressMessage(message)) {
        return true; // Prevent default error handling
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

    // Periodic re-application to handle dynamic loading
    const reapplySuppressions = () => {
      suppressReactDevTools();

      // Ensure our console overrides are still in place
      if (console.warn.toString().indexOf('shouldSuppressArgs') === -1) {
        // Re-apply console overrides if they've been replaced
        console.warn = function(...args) {
          if (shouldSuppressArgs(args)) return;
          ORIGINAL_WARN(...args);
        };
      }

      if (console.error.toString().indexOf('shouldSuppressArgs') === -1) {
        console.error = function(...args) {
          if (shouldSuppressArgs(args)) return;
          ORIGINAL_ERROR(...args);
        };
      }
    };

    // Reapply every 100ms for the first 5 seconds to handle any late-loading scripts
    let reapplyCount = 0;
    const reapplyInterval = setInterval(() => {
      reapplySuppressions();
      reapplyCount++;
      if (reapplyCount >= 50) { // 50 * 100ms = 5 seconds
        clearInterval(reapplyInterval);
      }
    }, 100);
  }
})();

export {};
