"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface GameSettings {
  language: "en" | "ru";
  autoCheck: boolean;
  highlightRowColBox: boolean;
  highlightSameNumbers: boolean;
  highlightConflicts: boolean;
  showMistakeCount: boolean;
  showTimer: boolean;
  showStreak: boolean;
  showScore: boolean;
  lockCorrectAnswers: boolean;
  autoRemoveNotes: boolean;
  dimCompletedNumbers: boolean;
}

const DEFAULT_SETTINGS: GameSettings = {
  language: "en",
  autoCheck: true,
  highlightRowColBox: true,
  highlightSameNumbers: true,
  highlightConflicts: true,
  showMistakeCount: true,
  showTimer: true,
  showStreak: true,
  showScore: true,
  lockCorrectAnswers: false,
  autoRemoveNotes: true,
  dimCompletedNumbers: true,
};

const STORAGE_KEY = "adoku-settings";

function loadSettings(): GameSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: GameSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

interface SettingsContextValue {
  settings: GameSettings;
  updateSetting: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setSettings(loadSettings());
    setLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (loaded) {
      saveSettings(settings);
    }
  }, [settings, loaded]);

  const updateSetting = useCallback(
    <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetSettings = useCallback(() => {
    setSettings({ ...DEFAULT_SETTINGS });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
