import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Only catch non-critical errors (like recharts warnings)
    const errorMessage = error.message || "";

    // Don't catch critical app errors
    if (
      errorMessage.includes("ChunkLoadError") ||
      errorMessage.includes("Network Error") ||
      errorMessage.includes("TypeError") ||
      errorMessage.includes("ReferenceError")
    ) {
      throw error; // Re-throw critical errors
    }

    // Suppress warnings and non-critical errors
    if (
      errorMessage.includes("defaultProps") ||
      errorMessage.includes("recharts") ||
      errorMessage.includes("Warning:") ||
      errorMessage.includes("Console warning")
    ) {
      return { hasError: false }; // Don't show error UI for warnings
    }

    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log only non-suppressed errors
    const errorMessage = error.message || "";

    if (
      !errorMessage.includes("defaultProps") &&
      !errorMessage.includes("recharts") &&
      !errorMessage.includes("Warning:")
    ) {
      console.error("Error Boundary caught an error:", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">
              Please refresh the page
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
