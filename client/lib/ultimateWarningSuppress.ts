// Ultimate warning suppression for Recharts defaultProps warnings
// This uses the most aggressive approach to completely eliminate these warnings

// Store original console methods before any other code runs
const originalWarn = console.warn;
const originalError = console.error;

// Create immediate suppression
console.warn = function(...args: any[]) {
  // Check for Recharts defaultProps warnings
  const message = args.join(' ');
  
  // Multiple detection patterns
  if (
    // Pattern 1: Direct defaultProps warning
    message.includes('Support for defaultProps will be removed') ||
    
    // Pattern 2: React warning format with component names
    (message.includes('Warning:') && message.includes('defaultProps') && 
     (message.includes('XAxis') || message.includes('YAxis'))) ||
    
    // Pattern 3: Any Recharts component with defaultProps
    (message.includes('defaultProps') && 
     /\b(XAxis|YAxis|Tooltip|Legend|ResponsiveContainer|LineChart|AreaChart|BarChart)\b/i.test(message)) ||
    
    // Pattern 4: File path based detection
    (message.includes('defaultProps') && message.includes('recharts.js')) ||
    
    // Pattern 5: Stack trace based detection
    (message.includes('defaultProps') && args.some(arg => 
      String(arg).includes('28514:22') || // XAxis2 line
      String(arg).includes('28575:22') || // YAxis2 line
      String(arg).includes('deps/recharts.js')
    ))
  ) {
    // Completely suppress these warnings
    return;
  }
  
  // Call original warn for other messages
  originalWarn.apply(console, args);
};

console.error = function(...args: any[]) {
  const message = args.join(' ');
  
  // Also suppress error-level defaultProps warnings
  if (message.includes('defaultProps') && 
      (message.includes('XAxis') || message.includes('YAxis') || message.includes('recharts'))) {
    return;
  }
  
  originalError.apply(console, args);
};

// Immediate execution wrapper to ensure this runs first
(() => {
  // Set up React DevTools hook to suppress warnings at source
  if (typeof window !== 'undefined') {
    // Flag to indicate suppression is active
    (window as any).__RECHARTS_SUPPRESSION_ACTIVE__ = true;
    
    // Override React's warning system if possible
    Object.defineProperty(window, '__REACT_DEV_TOOLS_SUPPRESS_WARNINGS__', {
      value: true,
      writable: false,
      configurable: false
    });
    
    // Try to intercept React's internal warning calls
    const originalConsoleMethod = window.console.warn;
    window.console.warn = function(...args) {
      const fullMessage = args.map(arg => String(arg || '')).join(' ');
      
      // Block all Recharts defaultProps warnings
      if (fullMessage.toLowerCase().includes('defaultprops') && 
          (fullMessage.includes('XAxis') || 
           fullMessage.includes('YAxis') ||
           fullMessage.includes('recharts') ||
           fullMessage.includes('28514') ||
           fullMessage.includes('28575'))) {
        return; // Completely block
      }
      
      return originalConsoleMethod.apply(this, args);
    };
  }
})();

export {};
