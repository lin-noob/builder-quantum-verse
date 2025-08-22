import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// Import warning suppression for Recharts defaultProps warnings
import "./lib/rechartsWarningSuppress";

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
