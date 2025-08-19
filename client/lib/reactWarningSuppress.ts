// React-specific warning suppression for defaultProps deprecation warnings
// This specifically targets the Recharts XAxis/YAxis defaultProps warnings

if (typeof window !== "undefined") {
  // Store the original console.warn
  const originalWarn = console.warn;
  
  // Create a more aggressive warning filter
  console.warn = function(...args: any[]) {
    // Convert arguments to string for pattern matching
    const message = args.join(' ');
    
    // Specific patterns for Recharts warnings
    const rechartPatterns = [
      'Support for defaultProps will be removed from function components',
      'XAxis',
      'YAxis', 
      'XAxis2',
      'YAxis2',
      'recharts.js',
      'Use JavaScript default parameters instead',
      'at XAxis2',
      'at YAxis2',
      'at Surface',
      'at ChartLayoutContextProvider2',
      'at CategoricalChartWrapper'
    ];
    
    // Check if this warning should be suppressed
    const shouldSuppress = rechartPatterns.some(pattern => 
      message.includes(pattern)
    );
    
    if (shouldSuppress) {
      return; // Completely suppress the warning
    }
    
    // Allow other warnings through
    originalWarn.apply(console, args);
  };
  
  // Also intercept React's internal warning system
  if (typeof (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined') {
    try {
      const hook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
      const originalOnCommitFiberRoot = hook.onCommitFiberRoot;
      
      hook.onCommitFiberRoot = function(id: any, root: any, priorityLevel: any) {
        try {
          // Suppress React DevTools warnings during commit
          const originalConsoleWarn = console.warn;
          console.warn = () => {}; // Temporarily disable warnings
          
          if (originalOnCommitFiberRoot) {
            originalOnCommitFiberRoot.call(this, id, root, priorityLevel);
          }
          
          console.warn = originalConsoleWarn; // Restore warnings
        } catch (e) {
          // Restore warnings in case of error
          console.warn = originalWarn;
        }
      };
    } catch (e) {
      // Ignore if DevTools hook manipulation fails
    }
  }
}

export {};
