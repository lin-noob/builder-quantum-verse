/**
 * Targeted Recharts warning suppression for defaultProps warnings
 * 
 * This suppresses only the specific warnings from Recharts about defaultProps
 * being removed from function components, while preserving all other warnings.
 */

// Store the original console.warn
const originalWarn = console.warn;

// Override console.warn to filter out specific Recharts warnings
console.warn = (...args: any[]) => {
  // Convert arguments to string for pattern matching
  const message = args.join(' ');
  
  // Check if this is a Recharts defaultProps warning
  const isRechartsDefaultPropsWarning = 
    message.includes('Support for defaultProps will be removed from function components') &&
    (message.includes('XAxis') || message.includes('YAxis'));
  
  // Only suppress if it's the specific Recharts warning we want to ignore
  if (isRechartsDefaultPropsWarning && process.env.NODE_ENV === 'development') {
    // Silently ignore this warning in development
    return;
  }
  
  // Allow all other warnings to pass through
  originalWarn.apply(console, args);
};

// Export a cleanup function if needed
export const restoreConsoleWarn = () => {
  console.warn = originalWarn;
};
