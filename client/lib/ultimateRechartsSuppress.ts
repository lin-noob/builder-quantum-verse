// Ultimate Recharts warning suppression - development only
// 🚀 仅在开发环境运行，避免生产环境性能开销

// Early exit for non-development environments
const isDevelopment = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

if (isDevelopment) {
  // Only run suppression logic in development
  (function () {
    "use strict";

    // Run suppression immediately on script load
    const createUltimateSuppression = () => {
      if (typeof console === "undefined") return;

      // Store original methods with strong binding
      const ORIGINAL_METHODS = {
        warn: console.warn?.bind?.(console) || (() => {}),
        error: console.error?.bind?.(console) || (() => {}),
        log: console.log?.bind?.(console) || (() => {}),
        info: console.info?.bind?.(console) || (() => {}),
        debug: console.debug?.bind?.(console) || (() => {}),
      };

      // Enhanced pattern detection for the exact warning format
      const isRechartsWarning = (...args: any[]): boolean => {
        if (!args || args.length === 0) return false;

        try {
          // Handle the exact warning pattern we're seeing:
          // "Warning: %s: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.%s XAxis"

          // Check for the exact format string patterns
          const formatPatterns = [
            "Warning: %s: Support for defaultProps will be removed from function components",
            "Support for defaultProps will be removed from function components in a future major release",
            "Use JavaScript default parameters instead.%s",
            "Warning: %s: Support for defaultProps",
          ];

          const rechartsComponents = [
            "XAxis",
            "YAxis",
            "XAxis2",
            "YAxis2",
            "ZAxis",
            "Line",
            "Area",
            "Bar",
            "Scatter",
            "ResponsiveContainer",
            "LineChart",
            "AreaChart",
            "BarChart",
            "ScatterChart",
            "Tooltip",
            "Legend",
            "CartesianGrid",
          ];

          const deploymentPatterns = [
            "736abde510b74e08aed97b2f9a8bd1a4",
            "fly.dev",
            "deps/recharts.js",
            "node_modules/.vite/deps/recharts.js",
            "/recharts.js?v=",
          ];

          // Convert all arguments to string representation
          const argStrings = args.map((arg) => {
            if (arg === null || arg === undefined) return "";
            if (typeof arg === "object") {
              try {
                return JSON.stringify(arg);
              } catch {
                return String(arg);
              }
            }
            return String(arg);
          });

          const combinedMessage = argStrings.join(" ");
          const lowerMessage = combinedMessage.toLowerCase();

          // Check for format patterns
          const hasFormatPattern = formatPatterns.some(
            (pattern) =>
              combinedMessage.includes(pattern) ||
              lowerMessage.includes(pattern.toLowerCase()),
          );

          // Check for Recharts components
          const hasRechartsComponent = rechartsComponents.some(
            (component) =>
              combinedMessage.includes(component) ||
              lowerMessage.includes(component.toLowerCase()),
          );

          // Check for deployment-specific patterns
          const hasDeploymentPattern = deploymentPatterns.some(
            (pattern) =>
              combinedMessage.includes(pattern) ||
              lowerMessage.includes(pattern.toLowerCase()),
          );

          // Super aggressive check - suppress if ANY of these conditions are met
          const shouldSuppress =
            hasFormatPattern ||
            (hasRechartsComponent && lowerMessage.includes("defaultprops")) ||
            (hasDeploymentPattern && lowerMessage.includes("defaultprops")) ||
            (lowerMessage.includes("defaultprops") &&
              (lowerMessage.includes("xaxis") ||
                lowerMessage.includes("yaxis") ||
                lowerMessage.includes("recharts"))) ||
            // Stack trace patterns
            lowerMessage.includes("at xaxis2") ||
            lowerMessage.includes("at yaxis2") ||
            lowerMessage.includes("categoricalchartwrapper") ||
            lowerMessage.includes("chartlayoutcontextprovider") ||
            // Specific to our deployment
            lowerMessage.includes("performancetrend");

          return shouldSuppress;
        } catch (error) {
          // If detection fails, err on the side of suppression for known patterns
          const safeMessage = args.join(" ").toLowerCase();
          return (
            safeMessage.includes("defaultprops") &&
            (safeMessage.includes("axis") || safeMessage.includes("recharts"))
          );
        }
      };

      // Create intercepting console methods
      const createInterceptor = (originalMethod: Function) => {
        return function (...args: any[]) {
          if (isRechartsWarning(...args)) {
            // Completely suppress - don't even log in development
            return;
          }
          return originalMethod.apply(console, args);
        };
      };

      // Apply console overrides using Object.defineProperty to handle read-only properties
      try {
        Object.defineProperty(console, "warn", {
          value: createInterceptor(ORIGINAL_METHODS.warn),
          writable: true,
          configurable: true,
        });
      } catch (e) {
        // If that fails, try direct assignment as fallback
        try {
          console.warn = createInterceptor(ORIGINAL_METHODS.warn);
        } catch (e2) {
          // If both fail, console overriding isn't possible in this environment
        }
      }

      try {
        Object.defineProperty(console, "error", {
          value: createInterceptor(ORIGINAL_METHODS.error),
          writable: true,
          configurable: true,
        });
      } catch (e) {
        try {
          console.error = createInterceptor(ORIGINAL_METHODS.error);
        } catch (e2) {}
      }

      // Browser-specific suppressions
      if (typeof window !== "undefined") {
        // Global error handlers
        const originalOnError = window.onerror;
        window.onerror = function (message, source, lineno, colno, error) {
          if (typeof message === "string" && isRechartsWarning(message)) {
            return true; // Suppress the error
          }
          if (originalOnError) {
            return originalOnError.call(
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

        const originalOnUnhandledRejection = window.onunhandledrejection;
        window.onunhandledrejection = function (event) {
          if (event?.reason && isRechartsWarning(String(event.reason))) {
            event.preventDefault();
            return;
          }
          if (originalOnUnhandledRejection) {
            return originalOnUnhandledRejection.call(this, event);
          }
        };

        // React DevTools suppression
        try {
          (window as any).__REACT_DEVTOOLS_SUPPRESS_WARNINGS__ = true;
          (window as any).__SUPPRESS_RECHARTS_WARNINGS__ = true;
          (window as any).__RECHARTS_QUIET__ = true;
        } catch (e) {
          // Ignore errors in environment setup
        }
      }
    };

    // Apply suppression immediately
    createUltimateSuppression();

    // Also apply after DOM content is loaded
    if (typeof document !== "undefined") {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", createUltimateSuppression);
      }
    }
  })();
}

// ES module export
export {};
