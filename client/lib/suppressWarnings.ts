// Suppress React deprecation warnings from third-party libraries
if (typeof console !== "undefined") {
  const originalWarn = console.warn;

  console.warn = (...args: any[]) => {
    // Convert all arguments to strings to check for warning patterns
    const message = args.join(" ");

    // More aggressive suppression for Recharts defaultProps warnings
    if (message.includes("Support for defaultProps will be removed")) {
      return; // Suppress all defaultProps warnings
    }

    // Suppress warnings that mention Recharts components
    const rechartsComponents = [
      "XAxis", "YAxis", "XAxis2", "YAxis2", "CartesianGrid", "Tooltip",
      "Line", "Surface", "ChartLayoutContextProvider", "ChartLayoutContextProvider2",
      "CategoricalChartWrapper", "recharts", "LineChart", "ResponsiveContainer",
      "Legend", "BarChart", "Area", "AreaChart", "PieChart", "ScatterChart",
      "RadarChart", "ComposedChart", "Treemap", "Sankey", "Funnel"
    ];

    if (rechartsComponents.some((component) => message.includes(component))) {
      return; // Suppress all Recharts-related warnings
    }

    // Suppress if stack trace contains recharts references
    if (message.includes("recharts.js")) {
      return;
    }

    // Check stack trace in error object for Recharts references
    const stackTrace = new Error().stack || "";
    if (stackTrace.includes("recharts") || stackTrace.includes("deps/recharts.js")) {
      return;
    }

    // Allow other warnings through
    originalWarn.apply(console, args);
  };
}

export {};
