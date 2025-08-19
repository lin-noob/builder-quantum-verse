import React from "react";

interface SuppressedChartProps {
  children: React.ReactNode;
}

/**
 * Simplified wrapper component that just passes through children
 * Warning suppression is handled globally now
 */
const SuppressedChart: React.FC<SuppressedChartProps> = ({ children }) => {
  return <div className="recharts-container">{children}</div>;
};

export default SuppressedChart;
