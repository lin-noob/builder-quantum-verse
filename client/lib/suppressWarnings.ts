// Suppress React deprecation warnings from third-party libraries
if (typeof console !== 'undefined') {
  const originalWarn = console.warn;

  console.warn = (...args: any[]) => {
    // Convert all arguments to strings to check for warning patterns
    const message = args.join(' ');

    // Suppress Recharts defaultProps warnings - these are library-level issues
    // that will be fixed in future Recharts updates
    if (message.includes('Support for defaultProps will be removed from function components')) {
      // Check for any Recharts component mentioned in the warning
      const rechartsComponents = [
        'XAxis', 'YAxis', 'XAxis2', 'YAxis2', 'CartesianGrid', 'Tooltip', 'Line',
        'Surface', 'ChartLayoutContextProvider', 'CategoricalChartWrapper',
        'recharts', 'LineChart', 'ResponsiveContainer', 'Legend'
      ];

      if (rechartsComponents.some(component => message.includes(component))) {
        return;
      }
    }

    // Also suppress if the stack trace contains recharts references
    if (message.includes('defaultProps') && message.includes('recharts.js')) {
      return;
    }

    // Allow other warnings through
    originalWarn.apply(console, args);
  };
}

export {};
