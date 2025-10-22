import React from "react";

const DemoModeBadge: React.FC = () => {
  const flag = (import.meta as any)?.env?.VITE_DEMO_MODE;
  const isDemo = flag === true || flag === "true";
  const isProd = (import.meta as any)?.env?.PROD;

  if (!isDemo || isProd) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50"
      aria-live="polite"
      aria-label="演示模式提示"
    >
      <div className="flex items-center gap-2 rounded-md border border-yellow-300 bg-yellow-100/80 px-3 py-2 text-yellow-900 shadow-sm">
        <span className="inline-block h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
        <span className="text-sm font-medium">演示模式 · 数据非真实</span>
      </div>
    </div>
  );
};

export default DemoModeBadge;