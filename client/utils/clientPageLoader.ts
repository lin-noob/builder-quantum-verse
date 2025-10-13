import React from "react";

const modulesA = import.meta.glob("@/pages/**/*.{tsx,ts}");
const modulesB = import.meta.glob("@/admin/pages/**/*.{tsx,ts}");
const modules: Record<string, () => Promise<any>> = {
  ...modulesA,
  ...modulesB,
};

export function loadLazyClientComponent(componentPath?: string) {
  if (!componentPath) {
    return null;
  }

  // 尝试从映射表中找到对应的组件
  const loaderExact = modules[componentPath];
  if (loaderExact) {
    return React.lazy(loaderExact as any);
  }

  // 如果映射表中没有找到，尝试根据路径规则动态构造
  const normalizedCandidates = [
    componentPath.replace(/^\/client\/pages\//, "@/pages/"),
    componentPath.replace(/^\/client\/admin\/pages\//, "@/admin/pages/"),
  ];

  for (const key of normalizedCandidates) {
    const loader = modules[key];
    if (loader) {
      return React.lazy(loader as any);
    }
  }

  // 最后尝试动态 import，不同路径都试一遍
  const importCandidates = [...normalizedCandidates, componentPath];
  for (const p of importCandidates) {
    try {
      return React.lazy(() => import(/* @vite-ignore */ p));
    } catch (_) {
      // 继续尝试下一个候选
    }
  }

  console.warn(`无法加载动态组件: ${componentPath}`);
  return null;
}