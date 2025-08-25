// Import early-stage suppression FIRST to catch warnings before React starts
import "./lib/earlyRechartsSuppress";

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { setupGlobalErrorHandler } from "./lib/errorHandler";

// Import comprehensive warning suppression for Recharts defaultProps warnings
import "./lib/rechartsWarningSuppress";
import "./lib/nuclearWarningSuppress";
import "./lib/finalWarningFix";

// Add final layer of Recharts warning suppression
if (process.env.NODE_ENV === "development") {
  const originalConsoleWarn = console.warn;
  console.warn = (...args: any[]) => {
    // Enhanced check for React's specific warning format
    if (args.length >= 2) {
      const firstArg = String(args[0] || "");
      const secondArg = String(args[1] || "");

      // Handle React's warning format: "Warning: %s: Support for defaultProps...", "XAxis"
      if (
        (firstArg.includes("Warning: %s: Support for defaultProps") ||
          firstArg.includes("Support for defaultProps will be removed")) &&
        (secondArg.includes("XAxis") ||
          secondArg.includes("YAxis") ||
          secondArg.includes("XAxis2") ||
          secondArg.includes("YAxis2"))
      ) {
        return; // Complete silence
      }
    }

    // Fallback comprehensive check
    const messageStr = args.join(" ");
    const isRechartsWarning =
      (messageStr.includes("defaultProps") &&
        (messageStr.includes("XAxis") || messageStr.includes("YAxis"))) ||
      (messageStr.includes("Support for defaultProps will be removed") &&
        (messageStr.includes("recharts") ||
          messageStr.includes("XAxis") ||
          messageStr.includes("YAxis"))) ||
      messageStr.includes("node_modules/.vite/deps/recharts.js") ||
      messageStr.includes("fly.dev/node_modules/.vite/deps/recharts.js");

    if (isRechartsWarning) {
      return; // Complete silence for Recharts warnings
    }

    // Allow all other warnings
    originalConsoleWarn.apply(console, args);
  };
}

// Initialize global error handler
setupGlobalErrorHandler();

// Add global error handling for AbortErrors
if (process.env.NODE_ENV === "development") {
  // Catch any remaining unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    if (
      event.reason &&
      (event.reason.name === "AbortError" ||
        event.reason.name === "DOMException" ||
        (event.reason.message &&
          (event.reason.message.includes("aborted") ||
            event.reason.message.includes("signal is aborted"))))
    ) {
      event.preventDefault();
      console.debug("Global AbortError suppressed at application level");
    }
  });

  // Catch any remaining global errors
  window.addEventListener("error", (event) => {
    if (
      event.error &&
      (event.error.name === "AbortError" ||
        event.error.name === "DOMException" ||
        (event.error.message &&
          (event.error.message.includes("aborted") ||
            event.error.message.includes("signal is aborted"))))
    ) {
      event.preventDefault();
      console.debug("Global error suppressed at application level");
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
