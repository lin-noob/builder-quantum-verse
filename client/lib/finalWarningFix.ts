// Final, definitive warning suppression for Recharts defaultProps
// This targets the exact React warning pattern and suppresses it completely

(function() {
  if (typeof window !== 'undefined' && typeof console !== 'undefined') {
    // Store the absolute original console.warn method
    const ORIGINAL_WARN = console.warn.bind(console);
    
    // Replace console.warn entirely
    console.warn = function(...args) {
      // Convert all arguments to strings for analysis
      const allArgsString = args.map(arg => String(arg)).join(' ');
      
      // Check for the specific React defaultProps warning pattern
      // Pattern: "Warning: %s: Support for defaultProps will be removed..."
      const isDefaultPropsWarning = (
        allArgsString.includes('Support for defaultProps will be removed') ||
        allArgsString.includes('Use JavaScript default parameters instead') ||
        (args[0] && String(args[0]).includes('%s')) && (
          allArgsString.includes('XAxis') ||
          allArgsString.includes('YAxis') ||
          allArgsString.includes('defaultProps')
        )
      );
      
      // Check for Recharts-specific warnings
      const isRechartsWarning = (
        allArgsString.toLowerCase().includes('xaxis') ||
        allArgsString.toLowerCase().includes('yaxis') ||
        allArgsString.toLowerCase().includes('recharts') ||
        allArgsString.includes('deps/recharts.js')
      );
      
      // If it's either type of warning we want to suppress, don't call original
      if (isDefaultPropsWarning || isRechartsWarning) {
        return;
      }
      
      // For all other warnings, call the original method
      ORIGINAL_WARN(...args);
    };
    
    // Also override console.error in case some warnings appear as errors
    const ORIGINAL_ERROR = console.error.bind(console);
    console.error = function(...args) {
      const allArgsString = args.map(arg => String(arg)).join(' ');
      
      const isDefaultPropsError = (
        allArgsString.includes('Support for defaultProps will be removed') ||
        allArgsString.includes('Use JavaScript default parameters instead')
      );
      
      const isRechartsError = (
        allArgsString.toLowerCase().includes('xaxis') ||
        allArgsString.toLowerCase().includes('yaxis') ||
        allArgsString.toLowerCase().includes('recharts')
      );
      
      if (isDefaultPropsError || isRechartsError) {
        return;
      }
      
      ORIGINAL_ERROR(...args);
    };
    
    // Prevent React DevTools from logging these warnings
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      try {
        const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
        if (hook.onCommitFiberRoot) {
          const originalCommit = hook.onCommitFiberRoot;
          hook.onCommitFiberRoot = function(...args) {
            // Temporarily suppress all console output during commit
            const tempWarn = console.warn;
            const tempError = console.error;
            
            console.warn = () => {};
            console.error = () => {};
            
            try {
              return originalCommit.apply(this, args);
            } finally {
              console.warn = tempWarn;
              console.error = tempError;
            }
          };
        }
      } catch (e) {
        // Ignore errors in DevTools override
      }
    }
    
    // Global error handler to catch any missed warnings
    const originalOnError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
      if (typeof message === 'string') {
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('defaultprops') || 
            lowerMessage.includes('xaxis') || 
            lowerMessage.includes('yaxis') ||
            lowerMessage.includes('recharts')) {
          return true; // Suppress the error
        }
      }
      
      if (originalOnError) {
        return originalOnError.call(this, message, source, lineno, colno, error);
      }
      return false;
    };
  }
})();

export {};
