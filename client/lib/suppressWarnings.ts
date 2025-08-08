// Suppress React deprecation warnings from third-party libraries
if (typeof console !== 'undefined') {
  const originalWarn = console.warn;
  
  console.warn = (...args: any[]) => {
    // Suppress Recharts defaultProps warnings - these are library-level issues
    // that will be fixed in future Recharts updates
    if (args[0]?.includes?.('defaultProps will be removed from function components')) {
      if (args[0]?.includes?.('XAxis') || args[0]?.includes?.('YAxis')) {
        return;
      }
    }
    
    // Allow other warnings through
    originalWarn.apply(console, args);
  };
}

export {};
