/**
 * Comprehensive Recharts warning suppression for defaultProps warnings
 *
 * This suppresses only the specific warnings from Recharts about defaultProps
 * being removed from function components, while preserving all other warnings.
 */

// Store the original console.warn
const originalWarn = console.warn;

// Override console.warn to filter out specific Recharts warnings
console.warn = (...args: any[]) => {
  // Handle different argument formats
  let message: string;

  if (args.length === 0) {
    originalWarn.apply(console, args);
    return;
  }

  // Check if first argument is a format string with %s placeholders
  if (typeof args[0] === 'string' && args[0].includes('%s')) {
    // Handle React warning format: "Warning: %s: Support for defaultProps..."
    const formatString = args[0];
    const additionalArgs = args.slice(1);

    // Check for the specific defaultProps warning pattern
    if (formatString.includes('Support for defaultProps will be removed from function components')) {
      // Check if any of the additional arguments contain XAxis or YAxis
      const hasRechartsComponent = additionalArgs.some(arg =>
        typeof arg === 'string' && (arg.includes('XAxis') || arg.includes('YAxis'))
      );

      if (hasRechartsComponent && process.env.NODE_ENV === 'development') {
        // Silently ignore this specific Recharts warning
        return;
      }
    }
  }

  // Fallback: convert all arguments to string for pattern matching
  message = args.join(' ');

  // Additional checks for various warning formats
  const isRechartsDefaultPropsWarning =
    message.includes('Support for defaultProps will be removed from function components') &&
    (message.includes('XAxis') || message.includes('YAxis') || message.includes('XAxis2') || message.includes('YAxis2'));

  // Also check for specific Recharts component patterns
  const isRechartsComponentWarning =
    (message.includes('defaultProps') || message.includes('Default props')) &&
    (message.includes('recharts') ||
     message.includes('XAxis') ||
     message.includes('YAxis') ||
     message.includes('node_modules/.vite/deps/recharts.js'));

  // Suppress if it's any recognized Recharts warning in development
  if ((isRechartsDefaultPropsWarning || isRechartsComponentWarning) && process.env.NODE_ENV === 'development') {
    // Silently ignore this warning in development
    console.debug('Suppressed Recharts defaultProps warning');
    return;
  }

  // Allow all other warnings to pass through
  originalWarn.apply(console, args);
};

// Export a cleanup function if needed
export const restoreConsoleWarn = () => {
  console.warn = originalWarn;
};
