import React from "react";
import { createRoot } from "react-dom/client";
// Ant Design 5.x 不再需要导入 reset.css
import "./global.css";
import App from "./App";
import { setupGlobalErrorHandler } from "./lib/errorHandler";
import { initializeConfig } from "./stores/configStore";
import { initializeI18n } from "./lib/i18n";

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

const root = createRoot(document.getElementById("root")!);

// Render a loading indicator while async initializations are running
root.render(
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      backgroundColor: "#f0f2f5",
      fontSize: "16px",
      color: "#555",
    }}
  >
    loading...
  </div>,
);

// Wait for all initializations to complete
Promise.all([
  initializeConfig().catch((error) => {
    console.warn("Failed to initialize config:", error);
  }),
  initializeI18n().catch((error) => {
    console.warn("Failed to initialize i18n:", error);
  }),
]).then(() => {
  root.render(<App />);
});
