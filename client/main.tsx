// Immediate warning suppression - must be first
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  const msg = args.join(' ');
  if (msg.includes('defaultProps') && (msg.includes('XAxis') || msg.includes('YAxis'))) return;
  originalWarn(...args);
};

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(<App />);
