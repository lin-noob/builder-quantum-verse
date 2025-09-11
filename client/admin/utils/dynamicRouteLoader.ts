import React from "react";

// Pre-register all page modules under client/**/pages for lazy loading
const modulesA = import.meta.glob("./client/**/pages/**/*.{tsx,ts}");
const modulesB = import.meta.glob("/client/**/pages/**/*.{tsx,ts}");
const pageModules: Record<string, () => Promise<any>> = {
  ...modulesA,
  ...modulesB,
};

export function loadLazyComponentByPath(componentPath: string): React.LazyExoticComponent<React.ComponentType<any>> | null {
  const candidates = [
    componentPath,
    componentPath.replace(/^\/+/, "./"), // /client/... -> ./client/...
    componentPath.startsWith("./") ? componentPath.slice(1) : `.${componentPath}`,
  ];
  for (const key of candidates) {
    const loader = (pageModules as Record<string, () => Promise<any>>)[key];
    if (loader) {
      return React.lazy(loader as () => Promise<{ default: React.ComponentType<any> }>);
    }
  }
  return null;
}
