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

    // Suppress React warning format with %s placeholders
    if (message.includes("Support for defaultProps will be removed from function components") ||
        message.includes("Use JavaScript default parameters instead")) {
      return true;
    }

    // Suppress specific Recharts component warnings by name
    if ((message.includes("XAxis") || message.includes("YAxis") ||
         message.includes("LineChart") || message.includes("ResponsiveContainer")) &&
        (message.includes("defaultProps") || message.includes("function components"))) {
      return true;
    }

    // Suppress by file path - recharts library files
    if (message.includes("/deps/recharts.js") &&
        (message.includes("defaultProps") || message.includes("function components"))) {
      return true;
    }

    // Suppress createRoot warnings if they're about duplicate calls
    if (message.includes("createRoot") && message.includes("already been passed to createRoot")) {
      return true;
    }

    // Suppress ResizeObserver warnings
    if (message.includes("ResizeObserver loop completed with undelivered notifications")) {
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

  // Suppress ResizeObserver errors globally
  const originalErrorHandler = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    if (typeof message === 'string' && message.includes('ResizeObserver loop completed with undelivered notifications')) {
      return true; // Suppress the error
    }
    if (originalErrorHandler) {
      return originalErrorHandler(message, source, lineno, colno, error);
    }
    return false;
  };

  // Handle unhandled promise rejections for ResizeObserver
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && typeof event.reason === 'string' &&
        event.reason.includes('ResizeObserver loop completed with undelivered notifications')) {
      event.preventDefault();
    }
  });
}

// This file only sets up console warning suppression
// No exports needed
