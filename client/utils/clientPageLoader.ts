import React from "react";

const modules = import.meta.glob("@/**/*.tsx");
export function loadLazyClientComponent(componentPath?: string) {
  if (!componentPath) {
    return null;
  }

  // 尝试从映射表中找到对应的组件

  const loader = modules[componentPath];

  if (loader) {
    return React.lazy(loader as any);
  }

  // 如果映射表中没有找到，尝试根据路径规则动态构造
  const normalizedPath = componentPath.replace(
    /^\/client\/pages\//,
    "@/pages/",
  );

  try {
    return React.lazy(() => import(/* @vite-ignore */ componentPath));
  } catch (error) {
    console.warn(`无法加载动态组件: ${componentPath}`, error);
    return null;
  }
}