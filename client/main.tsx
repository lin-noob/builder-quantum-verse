import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// Import warning suppression for Recharts defaultProps warnings
import "./lib/rechartsWarningSuppress";

createRoot(document.getElementById("root")!).render(<App />);
