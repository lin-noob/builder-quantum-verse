import { useState, useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

type Theme = "light" | "dark" | "system";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("saas-ui-theme") as Theme) || "system";
    }
    return "system";
  });

  const [actualTheme, setActualTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    let resolvedTheme: "light" | "dark";
    if (theme === "system") {
      resolvedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } else {
      resolvedTheme = theme;
    }

    root.classList.add(resolvedTheme);
    setActualTheme(resolvedTheme);
    localStorage.setItem("saas-ui-theme", theme);
  }, [theme]);

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    if (theme === "system") {
      return <Monitor className="h-4 w-4" />;
    }
    return actualTheme === "light" ? (
      <Sun className="h-4 w-4" />
    ) : (
      <Moon className="h-4 w-4" />
    );
  };

  const getTitle = () => {
    if (theme === "system") {
      return `跟随系统 (${actualTheme === "light" ? "浅色" : "深色"})`;
    }
    return theme === "light" ? "浅色模式" : "深色模式";
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={cycleTheme}
      title={getTitle()}
      className="relative"
    >
      {getIcon()}
      {theme === "system" && (
        <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
      )}
    </Button>
  );
}
