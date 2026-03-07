"use client";

import { useCallback, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

function getSystemTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getResolvedTheme(theme: Theme): "dark" | "light" {
  return theme === "system" ? getSystemTheme() : theme;
}

function readSavedTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem("difflab-theme") as Theme | null;
  if (saved && ["dark", "light", "system"].includes(saved)) return saved;
  return "dark";
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(readSavedTheme);

  // Apply theme attribute to DOM whenever theme changes
  useEffect(() => {
    document.documentElement.dataset.theme = getResolvedTheme(theme);
  }, [theme]);

  // Listen for system theme changes when in "system" mode
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      document.documentElement.dataset.theme = getSystemTheme();
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    localStorage.setItem("difflab-theme", next);
  }, []);

  const cycleTheme = useCallback(() => {
    const order: Theme[] = ["dark", "light", "system"];
    setThemeState((prev) => {
      const next = order[(order.indexOf(prev) + 1) % order.length];
      localStorage.setItem("difflab-theme", next);
      return next;
    });
  }, []);

  return { theme, setTheme, cycleTheme };
}
