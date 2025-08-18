// Suppress React deprecation warnings from third-party libraries
if (typeof console !== "undefined" && typeof window !== "undefined") {
  const originalWarn = console.warn;
  const originalError = console.error;

  // Function to check if a warning should be suppressed
  const shouldSuppressWarning = (message: string): boolean => {
    // Suppress all defaultProps warnings (mostly from Recharts)
    if (message.includes("Support for defaultProps will be removed")) {
      return true;
    }

    // Suppress React development warnings from third-party libraries
    if (message.includes("defaultProps") && (
      message.includes("recharts") ||
      message.includes("/deps/recharts.js") ||
      message.includes("XAxis") ||
      message.includes("YAxis") ||
      message.includes("LineChart") ||
      message.includes("ResponsiveContainer")
    )) {
      return true;
    }

    // Suppress createRoot warnings if they're about duplicate calls
    if (message.includes("createRoot") && message.includes("already been passed to createRoot")) {
      return true;
    }

    return false;
  };

  // Override console.warn
  console.warn = (...args: any[]) => {
    const message = args.join(" ");
    if (shouldSuppressWarning(message)) {
      return;
    }
    originalWarn.apply(console, args);
  };

  // Override console.error for React warnings that appear as errors
  console.error = (...args: any[]) => {
    const message = args.join(" ");
    if (shouldSuppressWarning(message)) {
      return;
    }
    originalError.apply(console, args);
  };
}

// This file only sets up console warning suppression
// No exports needed
