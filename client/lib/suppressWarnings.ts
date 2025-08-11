// Suppress React deprecation warnings from third-party libraries
if (typeof console !== 'undefined') {
  const originalWarn = console.warn;

  console.warn = (...args: any[]) => {
    // Convert all arguments to strings to check for warning patterns
    const message = args.join(' ');

    // Suppress Recharts defaultProps warnings - these are library-level issues
    // that will be fixed in future Recharts updates
    if (message.includes('Support for defaultProps will be removed from function components')) {
      if (message.includes('XAxis') ||
          message.includes('YAxis') ||
          message.includes('XAxis2') ||
          message.includes('YAxis2') ||
          message.includes('CartesianGrid') ||
          message.includes('Tooltip') ||
          message.includes('Line') ||
          message.includes('recharts')) {
        return;
      }
    }

    // Allow other warnings through
    originalWarn.apply(console, args);
  };
}

export {};
