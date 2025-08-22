import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// Import warning suppression for Recharts defaultProps warnings
import "./lib/rechartsWarningSuppress";

// Add additional layer of Recharts warning suppression
if (process.env.NODE_ENV === 'development') {
  const originalConsoleWarn = console.warn;
  console.warn = (...args: any[]) => {
    // Comprehensive check for Recharts defaultProps warnings
    const messageStr = args.join(' ');

    const isRechartsWarning =
      (messageStr.includes('defaultProps') &&
       (messageStr.includes('XAxis') || messageStr.includes('YAxis'))) ||
      (messageStr.includes('Support for defaultProps will be removed') &&
       messageStr.includes('recharts')) ||
      messageStr.includes('node_modules/.vite/deps/recharts.js');

    if (isRechartsWarning) {
      // Complete silence for Recharts warnings
      return;
    }

    // Allow all other warnings
    originalConsoleWarn.apply(console, args);
  };
}

// Add global error handling for AbortErrors
if (process.env.NODE_ENV === 'development') {
  // Catch any remaining unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason &&
        (event.reason.name === 'AbortError' ||
         event.reason.name === 'DOMException' ||
         (event.reason.message && (
           event.reason.message.includes('aborted') ||
           event.reason.message.includes('signal is aborted')
         )))) {
      event.preventDefault();
      console.debug('Global AbortError suppressed at application level');
    }
  });

  // Catch any remaining global errors
  window.addEventListener('error', (event) => {
    if (event.error &&
        (event.error.name === 'AbortError' ||
         event.error.name === 'DOMException' ||
         (event.error.message && (
           event.error.message.includes('aborted') ||
           event.error.message.includes('signal is aborted')
         )))) {
      event.preventDefault();
      console.debug('Global error suppressed at application level');
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
