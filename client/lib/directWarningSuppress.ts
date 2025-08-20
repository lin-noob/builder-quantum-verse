// Direct suppression that targets the exact React warning pattern
// This is specifically designed to catch the "%s: Support for defaultProps" format

if (typeof window !== 'undefined') {
  // Store the original console.warn before any other libraries modify it
  const originalConsoleWarn = window.console.warn;
  
  // Override console.warn with a function that specifically targets React warnings
  window.console.warn = function(message, ...args) {
    // Check if this is the specific React defaultProps warning pattern
    if (typeof message === 'string' && message.includes('%s')) {
      // This is likely a React warning with format placeholders
      const formattedMessage = message;
      const firstArg = args[0];
      
      // Check if it's the defaultProps warning
      if (formattedMessage.includes('Support for defaultProps will be removed') ||
          (typeof firstArg === 'string' && (
            firstArg.includes('XAxis') || 
            firstArg.includes('YAxis') ||
            firstArg.includes('XAxis2') ||
            firstArg.includes('YAxis2')
          ))) {
        return; // Completely suppress this warning
      }
    }
    
    // Check individual arguments for Recharts components
    for (const arg of [message, ...args]) {
      if (typeof arg === 'string') {
        const lowercaseArg = arg.toLowerCase();
        if (lowercaseArg.includes('xaxis') || 
            lowercaseArg.includes('yaxis') ||
            lowercaseArg.includes('defaultprops') ||
            lowercaseArg.includes('recharts')) {
          return; // Suppress
        }
      }
    }
    
    // If not a warning we want to suppress, call the original
    originalConsoleWarn.apply(console, [message, ...args]);
  };
  
  // Also override the error method in case warnings appear as errors
  const originalConsoleError = window.console.error;
  window.console.error = function(message, ...args) {
    // Apply the same logic for errors
    if (typeof message === 'string' && message.includes('%s')) {
      const firstArg = args[0];
      if (message.includes('Support for defaultProps will be removed') ||
          (typeof firstArg === 'string' && (
            firstArg.includes('XAxis') || 
            firstArg.includes('YAxis')
          ))) {
        return; // Suppress
      }
    }
    
    // Check for Recharts-related errors
    for (const arg of [message, ...args]) {
      if (typeof arg === 'string') {
        const lowercaseArg = arg.toLowerCase();
        if (lowercaseArg.includes('xaxis') || 
            lowercaseArg.includes('yaxis') ||
            lowercaseArg.includes('defaultprops') ||
            lowercaseArg.includes('recharts')) {
          return; // Suppress
        }
      }
    }
    
    originalConsoleError.apply(console, [message, ...args]);
  };
}

export {};
