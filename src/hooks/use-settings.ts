"use client";

import { useState, useCallback } from "react";

interface Settings {
  formatOnPaste: boolean;
  ignoreWhitespace: boolean;
}

const STORAGE_KEY = "difflab-settings";

const defaults: Settings = {
  formatOnPaste: false,
  ignoreWhitespace: false,
};

function readSettings(): Settings {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch {}
  return defaults;
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(readSettings);

  const updateSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  return { settings, updateSetting };
}
