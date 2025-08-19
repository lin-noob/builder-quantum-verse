// Global React warning suppression - Applied at the very start of the application
// This overrides React's internal warning system before any components are rendered

// Override before React is loaded
if (typeof window !== 'undefined') {
  // Store original console methods
  const originalError = console.error;
  const originalWarn = console.warn;
  
  // Pattern matching for React warnings we want to suppress
  const suppressedPatterns = [
    // Recharts specific
    'Support for defaultProps will be removed from function components',
    'XAxis',
    'YAxis',
    'Use JavaScript default parameters instead',
    
    // React DevTools
    'React DevTools',
    
    // Other common warnings
    'Warning: %s'
  ];
  
  // Function to check if a message should be suppressed
  const shouldSuppress = (message: string): boolean => {
    return suppressedPatterns.some(pattern => 
      message.includes(pattern) || 
      message.toLowerCase().includes(pattern.toLowerCase())
    );
  };
  
  // Override console.error
  console.error = function(...args: any[]) {
    const message = args.join(' ');
    if (!shouldSuppress(message)) {
      originalError.apply(console, args);
    }
  };
  
  // Override console.warn
  console.warn = function(...args: any[]) {
    const message = args.join(' ');
    if (!shouldSuppress(message)) {
      originalWarn.apply(console, args);
    }
  };
  
  // Set up React DevTools suppression
  Object.defineProperty(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__', {
    value: {
      isDisabled: false,
      supportsFiber: true,
      inject: () => {},
      onCommitFiberRoot: () => {},
      onCommitFiberUnmount: () => {},
    },
    writable: false,
    configurable: false
  });
  
  // Suppress React warnings at the source
  const originalObjectDefineProperty = Object.defineProperty;
  try {
    Object.defineProperty = function(obj: any, prop: string, descriptor: PropertyDescriptor) {
      // Intercept React's warning system setup
      if (prop === 'warn' && obj === console) {
        descriptor.value = console.warn; // Use our overridden version
      }
      return originalObjectDefineProperty.call(this, obj, prop, descriptor);
    };
  } catch (e) {
    // Restore original if override fails
    Object.defineProperty = originalObjectDefineProperty;
  }
}

export {};
