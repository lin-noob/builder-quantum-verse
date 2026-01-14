import React from "react";

// 使用多种模式进行 Glob，确保能捕获到文件
// 键名通常会匹配 glob pattern 的写法
const modulesGlob = import.meta.glob([
  "/client/pages/**/*.{tsx,ts}",
  "/client/admin/pages/**/*.{tsx,ts}",
  "../pages/**/*.{tsx,ts}",
  "../admin/pages/**/*.{tsx,ts}"
]);

const modules: Record<string, () => Promise<any>> = {
  ...modulesGlob
};

export function loadLazyClientComponent(componentPath?: string) {
  if (!componentPath) {
    return null;
  }

  // 1. 直接精确匹配
  if (modules[componentPath]) {
    return React.lazy(modules[componentPath] as any);
  }

  // 2. 尝试常见的路径变体
  const variants = [
    componentPath,
    `/client/${componentPath.replace(/^@\//, "")}`, // @/pages/x -> /client/pages/x
    `/client/${componentPath.replace(/^client\//, "")}`, // client/pages/x -> /client/pages/x
    `../${componentPath.replace(/^@\//, "")}`, // @/pages/x -> ../pages/x (relative to utils)
    `../${componentPath.replace(/^client\//, "")}`, // client/pages/x -> ../pages/x
  ];

  for (const variant of variants) {
    if (modules[variant]) {
      return React.lazy(modules[variant] as any);
    }
  }

  // 3. 终极模糊匹配：匹配文件后缀
  // 如果 componentPath 是 "client/pages/EnterpriseModelOverview.tsx"
  // 我们尝试在 keys 中找以 "pages/EnterpriseModelOverview.tsx" 结尾的
  // 移除 @/ 或 client/ 前缀
  const cleanPath = componentPath
    .replace(/^@\//, "")
    .replace(/^client\//, "")
    .replace(/^\//, ""); // pages/EnterpriseModelOverview.tsx

  const foundKey = Object.keys(modules).find(key => {
    // 简单的后缀匹配可能不安全，确保至少包含 pages/ 或 admin/
    return key.endsWith(cleanPath) && (key.includes("/pages/") || key.includes("/admin/"));
  });

  if (foundKey) {
    return React.lazy(modules[foundKey] as any);
  }

  console.warn(`[ClientPageLoader] 无法在索引中找到组件: ${componentPath}。可用的 Keys 示例:`, Object.keys(modules).slice(0, 5));

  // 4. 最后的尝试：直接 import (仅对支持的路径格式有效)
  // 如果是 @/ 开头，Vite 在动态 import 中可能无法解析，除非在 vite.config 中配置了 alias 且在这里生效
  try {
    return React.lazy(() => import(/* @vite-ignore */ componentPath));
  } catch (error) {
    console.error(`[ClientPageLoader] 动态加载失败: ${componentPath}`, error);
    return null;
  }
}
