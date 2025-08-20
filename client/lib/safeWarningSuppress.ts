// Safe warning suppression that doesn't modify read-only properties
// This approach only overrides console methods and avoids touching React DevTools

if (typeof window !== 'undefined') {
  // Store original console methods
  const originalWarn = console.warn;
  const originalError = console.error;
  
  // Comprehensive list of patterns to suppress
  const suppressPatterns = [
    // Recharts defaultProps warnings
    'Support for defaultProps will be removed from function components',
    'Use JavaScript default parameters instead',
    'XAxis',
    'YAxis',
    'XAxis2', 
    'YAxis2',
    'recharts.js',
    'function components in a future major release',
    
    // Stack trace patterns
    'at XAxis2',
    'at YAxis2', 
    'at Surface',
    'at ChartLayoutContextProvider2',
    'at CategoricalChartWrapper',
    
    // URL patterns
    'https://736abde510b74e08aed97b2f9a8bd1a4-1ace5ac283d148ebbec32708f.fly.dev/node_modules/.vite/deps/recharts.js',
    '/deps/recharts.js',
    
    // Generic patterns
    'defaultProps',
    'Warning: %s'
  ];
  
  // Function to check if a message should be suppressed
  const shouldSuppress = (args: any[]): boolean => {
    // Check each argument individually
    for (const arg of args) {
      const argStr = String(arg).toLowerCase();

      // Check if any argument contains suppression patterns
      for (const pattern of suppressPatterns) {
        if (argStr.includes(pattern.toLowerCase())) {
          return true;
        }
      }

      // Special check for React warning format with %s placeholders
      if (argStr.includes('support for defaultprops will be removed') ||
          argStr.includes('use javascript default parameters instead') ||
          argStr.includes('xaxis') ||
          argStr.includes('yaxis')) {
        return true;
      }
    }

    // Also check the full concatenated message
    const fullMessage = args.join(' ').toLowerCase();
    return suppressPatterns.some(pattern =>
      fullMessage.includes(pattern.toLowerCase())
    );
  };
  
  // Override console.warn
  console.warn = function(...args: any[]) {
    if (shouldSuppress(args)) {
      return; // Suppress the warning
    }
    originalWarn.apply(console, args);
  };
  
  // Override console.error
  console.error = function(...args: any[]) {
    if (shouldSuppress(args)) {
      return; // Suppress the error
    }
    originalError.apply(console, args);
  };
  
  // Handle window errors
  const originalOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    if (typeof message === 'string') {
      const shouldSuppressError = suppressPatterns.some(pattern =>
        message.toLowerCase().includes(pattern.toLowerCase())
      );
      
      if (shouldSuppressError) {
        return true; // Prevent default error handling
      }
    }
    
    if (originalOnError) {
      return originalOnError.call(this, message, source, lineno, colno, error);
    }
    return false;
  };
  
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && typeof event.reason === 'string') {
      const shouldSuppressRejection = suppressPatterns.some(pattern =>
        event.reason.toLowerCase().includes(pattern.toLowerCase())
      );
      
      if (shouldSuppressRejection) {
        event.preventDefault();
        return;
      }
    }
  });
}

export {};
