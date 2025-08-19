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

    // AGGRESSIVE: Suppress all defaultProps related warnings
    if (msg.includes("defaultProps") || msg.includes("Default props")) {
      return true;
    }

    // AGGRESSIVE: Suppress all function component warnings
    if (msg.includes("function components") || msg.includes("Function components")) {
      return true;
    }

    // Suppress React warning format with %s placeholders - more comprehensive check
    if (msg.includes("Support for defaultProps will be removed") ||
        msg.includes("Use JavaScript default parameters instead") ||
        msg.includes("%s: Support for defaultProps") ||
        msg.includes("future major release")) {
      return true;
    }

    // SUPER AGGRESSIVE: Check if any argument contains recharts component names
    const rechartsComponents = ["XAxis", "YAxis", "XAxis2", "YAxis2", "LineChart", "ResponsiveContainer", "Line", "Tooltip", "Legend", "Chart", "Recharts"];
    for (const component of rechartsComponents) {
      if (msg.includes(component)) {
        return true; // Suppress ANY warning containing these component names
      }

      // Also check in other arguments
      for (const arg of allArgs) {
        if (typeof arg === 'string' && arg.includes(component)) {
          return true;
        }
      }
    }

    // AGGRESSIVE: Suppress any warning from recharts.js file
    if (msg.includes("recharts.js") || msg.includes("/deps/recharts") ||
        allArgs.some(arg => String(arg).includes("recharts"))) {
      return true;
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

  // Additional suppression for React DevTools if available
  if (typeof window !== 'undefined' && (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    try {
      const devTools = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (devTools.onCommitFiberRoot) {
        const originalCommit = devTools.onCommitFiberRoot;
        devTools.onCommitFiberRoot = function(...args: any[]) {
          try {
            return originalCommit.apply(this, args);
          } catch (e) {
            // Suppress React DevTools errors silently
          }
        };
      }
    } catch (e) {
      // Ignore any errors in DevTools suppression
    }
  }
}

// This file only sets up console warning suppression
// No exports needed
