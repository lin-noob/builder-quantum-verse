// Suppress React deprecation warnings from third-party libraries
if (typeof console !== "undefined" && typeof window !== "undefined") {
  const originalWarn = console.warn;
  const originalError = console.error;

  // Suppress React DevTools warnings globally
  const originalReactDevToolsGlobalHook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (originalReactDevToolsGlobalHook) {
    (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
      ...originalReactDevToolsGlobalHook,
      onCommitFiberRoot: (...args: any[]) => {
        try {
          return originalReactDevToolsGlobalHook.onCommitFiberRoot?.(...args);
        } catch (e) {
          // Suppress React DevTools errors
        }
      },
      onCommitFiberUnmount: (...args: any[]) => {
        try {
          return originalReactDevToolsGlobalHook.onCommitFiberUnmount?.(...args);
        } catch (e) {
          // Suppress React DevTools errors
        }
      }
    };
  }

  // Function to check if a warning should be suppressed
  const shouldSuppressWarning = (message: string, ...allArgs: any[]): boolean => {
    // Convert message to string for consistent handling
    const msg = String(message);

    // Suppress all defaultProps warnings (mostly from Recharts)
    if (msg.includes("Support for defaultProps will be removed")) {
      return true;
    }

    // Suppress React warning format with %s placeholders - more comprehensive check
    if (msg.includes("defaultProps will be removed from function components") ||
        msg.includes("Use JavaScript default parameters instead") ||
        msg.includes("%s: Support for defaultProps") ||
        msg.includes("defaultProps will be removed") ||
        msg.includes("function components in a future major release")) {
      return true;
    }

    // Check if any argument contains recharts component names with defaultProps warnings
    const rechartsComponents = ["XAxis", "YAxis", "XAxis2", "YAxis2", "LineChart", "ResponsiveContainer", "Line", "Tooltip", "Legend"];
    for (const component of rechartsComponents) {
      if (msg.includes(component) &&
          (msg.includes("defaultProps") || msg.includes("function components"))) {
        return true;
      }

      // Also check in other arguments
      for (const arg of allArgs) {
        if (typeof arg === 'string' && arg.includes(component)) {
          return true;
        }
      }
    }

    // Suppress by file path - recharts library files
    if (msg.includes("/deps/recharts.js") &&
        (msg.includes("defaultProps") || msg.includes("function components"))) {
      return true;
    }

    // More comprehensive recharts detection
    if ((msg.includes("recharts") || msg.toLowerCase().includes("chart")) &&
        (msg.includes("defaultProps") || msg.includes("function components"))) {
      return true;
    }

    // Check all arguments for recharts patterns
    for (const arg of allArgs) {
      const argStr = String(arg);
      if (argStr.includes("recharts.js") ||
          rechartsComponents.some(comp => argStr.includes(comp))) {
        return true;
      }
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
    // Handle both string messages and formatted messages with placeholders
    const message = args.length > 0 ? String(args[0]) : "";
    const fullMessage = args.join(" ");

    // Pass all arguments to shouldSuppressWarning for comprehensive checking
    if (shouldSuppressWarning(message, ...args) ||
        shouldSuppressWarning(fullMessage, ...args)) {
      return;
    }

    // Additional individual argument checks
    for (const arg of args) {
      if (shouldSuppressWarning(String(arg), ...args)) {
        return;
      }
    }

    originalWarn.apply(console, args);
  };

  // Override console.error for React warnings that appear as errors
  console.error = (...args: any[]) => {
    const message = args.length > 0 ? String(args[0]) : "";
    const fullMessage = args.join(" ");

    // Pass all arguments to shouldSuppressWarning for comprehensive checking
    if (shouldSuppressWarning(message, ...args) ||
        shouldSuppressWarning(fullMessage, ...args)) {
      return;
    }

    // Additional individual argument checks
    for (const arg of args) {
      if (shouldSuppressWarning(String(arg), ...args)) {
        return;
      }
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

  // Intercept React warnings at the source if React is available
  if (typeof window !== 'undefined') {
    const originalSetTimeout = window.setTimeout;
    window.setTimeout = function(callback: any, delay?: number, ...args: any[]) {
      // Wrap callback to suppress warnings
      const wrappedCallback = function(...callbackArgs: any[]) {
        const originalConsoleWarn = console.warn;
        const originalConsoleError = console.error;

        // Temporarily disable warnings during React renders
        console.warn = (...warnArgs: any[]) => {
          const message = String(warnArgs[0] || '');
          if (!shouldSuppressWarning(message, ...warnArgs)) {
            originalConsoleWarn.apply(console, warnArgs);
          }
        };

        console.error = (...errorArgs: any[]) => {
          const message = String(errorArgs[0] || '');
          if (!shouldSuppressWarning(message, ...errorArgs)) {
            originalConsoleError.apply(console, errorArgs);
          }
        };

        try {
          return callback.apply(this, callbackArgs);
        } finally {
          // Restore original console methods
          console.warn = originalConsoleWarn;
          console.error = originalConsoleError;
        }
      };

      return originalSetTimeout.call(this, wrappedCallback, delay, ...args);
    };
  }
}

// This file only sets up console warning suppression
// No exports needed
