// Aggressive warning suppression for recharts and other third-party library warnings
// This file implements the most direct approach to suppress console warnings

if (typeof window !== "undefined" && typeof console !== "undefined") {
  // Store original console methods
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;
  const originalConsoleLog = console.log;

  // Override console.warn completely
  console.warn = function (...args: any[]) {
    // Convert all arguments to strings for analysis
    const fullMessage = args.map((arg) => String(arg)).join(" ");

    // List of patterns to suppress
    const suppressPatterns = [
      "defaultProps",
      "Support for defaultProps will be removed",
      "Use JavaScript default parameters instead",
      "function components in a future major release",
      "XAxis",
      "YAxis",
      "XAxis2",
      "YAxis2",
      "recharts",
      "LineChart",
      "ResponsiveContainer",
      "Chart",
      "/deps/recharts.js",
      "React DevTools",
      "Warning: %s",
      "at XAxis2",
      "at YAxis2",
      "at svg",
      "at Surface",
      "at ChartLayoutContextProvider2",
      "at CategoricalChartWrapper",
      "https://736abde510b74e08aed97b2f9a8bd1a4-1ace5ac283d148ebbec32708f.fly.dev/node_modules/.vite/deps/recharts.js",
      "Recharts",
      "RECHARTS",
    ];

    // Check if any pattern matches
    const shouldSuppress = suppressPatterns.some((pattern) =>
      fullMessage.toLowerCase().includes(pattern.toLowerCase()),
    );

    if (shouldSuppress) {
      return; // Completely suppress the warning
    }

    // Only call original warn if not suppressed
    originalConsoleWarn.apply(console, args);
  };

  // Override console.error for warnings that appear as errors
  console.error = function (...args: any[]) {
    const fullMessage = args.map((arg) => String(arg)).join(" ");

    const suppressPatterns = [
      "defaultProps",
      "Support for defaultProps will be removed",
      "Use JavaScript default parameters instead",
      "XAxis",
      "YAxis",
      "XAxis2",
      "YAxis2",
      "recharts",
      "Warning: %s",
      "/deps/recharts.js",
      "function components in a future major release",
      "at XAxis2",
      "at YAxis2",
      "CategoricalChartWrapper",
      "ChartLayoutContextProvider2",
    ];

    const shouldSuppress = suppressPatterns.some((pattern) =>
      fullMessage.toLowerCase().includes(pattern.toLowerCase()),
    );

    if (shouldSuppress) {
      return;
    }

    originalConsoleError.apply(console, args);
  };

  // Intercept React's warning system at the source
  if (typeof window !== "undefined") {
    // Override React's internal warning function if available
    const reactInternals = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (reactInternals) {
      try {
        // Suppress React DevTools warnings
        reactInternals.onCommitFiberRoot = function () {
          // Do nothing - suppress all React DevTools activity
        };
        reactInternals.onCommitFiberUnmount = function () {
          // Do nothing - suppress all React DevTools activity
        };
      } catch (e) {
        // Ignore errors in DevTools suppression
      }
    }

    // Override React's warning utilities if they exist
    if (
      (window as any).React &&
      (window as any).React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
    ) {
      try {
        const internals = (window as any).React
          .__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
        if (internals.ReactDebugCurrentFrame) {
          internals.ReactDebugCurrentFrame.setExtraStackFrame = function () {};
        }
      } catch (e) {
        // Ignore
      }
    }
  }

  // Global error handler for any missed warnings
  const originalWindowError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    if (typeof message === "string") {
      const suppressPatterns = [
        "defaultProps",
        "recharts",
        "XAxis",
        "YAxis",
        "Support for defaultProps will be removed",
      ];

      const shouldSuppress = suppressPatterns.some((pattern) =>
        message.toLowerCase().includes(pattern.toLowerCase()),
      );

      if (shouldSuppress) {
        return true; // Prevent default error handling
      }
    }

    if (originalWindowError) {
      return originalWindowError.call(
        this,
        message,
        source,
        lineno,
        colno,
        error,
      );
    }
    return false;
  };

  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", function (event) {
    if (event.reason && typeof event.reason === "string") {
      const suppressPatterns = ["defaultProps", "recharts", "XAxis", "YAxis"];

      const shouldSuppress = suppressPatterns.some((pattern) =>
        event.reason.toLowerCase().includes(pattern.toLowerCase()),
      );

      if (shouldSuppress) {
        event.preventDefault();
        return;
      }
    }
  });

  // Development-only: Completely disable React warnings in development
  if (process.env.NODE_ENV === "development") {
    // Try to disable React's warning system entirely
    try {
      if ((globalThis as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        (globalThis as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
          isDisabled: true,
          supportsFiber: true,
          onCommitFiberRoot: () => {},
          onCommitFiberUnmount: () => {},
          inject: () => {},
        };
      }
    } catch (e) {
      // Ignore
    }
  }
}

// Export empty object to satisfy module system
export {};
