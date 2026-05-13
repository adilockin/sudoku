"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { Difficulty } from "./sudoku-engine";
import { createClient } from "./supabase/client";
import type { User } from "@supabase/supabase-js";

export interface DifficultyStats {
  played: number;
  won: number;
  bestTime: number | null; // in seconds
  bestScore: number | null;
}

export interface UserProfile {
  username: string;
  stats: {
    totalGamesPlayed: number;
    totalGamesWon: number;
    totalTimePlayed: number; // in seconds
    totalMistakes: number;
    difficulties: Record<Difficulty, DifficultyStats>;
  };
}

const DEFAULT_PROFILE: UserProfile = {
  username: "",
  stats: {
    totalGamesPlayed: 0,
    totalGamesWon: 0,
    totalTimePlayed: 0,
    totalMistakes: 0,
    difficulties: {
      easy: { played: 0, won: 0, bestTime: null, bestScore: null },
      medium: { played: 0, won: 0, bestTime: null, bestScore: null },
      hard: { played: 0, won: 0, bestTime: null, bestScore: null },
      expert: { played: 0, won: 0, bestTime: null, bestScore: null },
    },
  },
};

interface ProfileContextValue {
  profile: UserProfile;
  user: User | null;
  updateUsername: (name: string) => void;
  recordGameStart: (difficulty: Difficulty) => void;
  recordGameWin: (difficulty: Difficulty, time: number, score: number) => void;
  recordMistake: () => void;
  recordTimePlayed: (seconds: number) => void;
  resetProfile: () => void;
  isLoaded: boolean;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // 1. Load Local Profile
    const stored = localStorage.getItem("adoku-profile");
    if (stored) {
      try {
        setProfile(JSON.parse(stored));
      } catch (e) {}
    }
    setIsLoaded(true);

    // 2. Setup Supabase Auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);
        if (currentUser) {
          // Sync username with email if no username exists
          setProfile(prev => ({
            ...prev,
            username: prev.username || currentUser.email?.split('@')[0] || "Pilot"
          }));
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("adoku-profile", JSON.stringify(profile));
    }
  }, [profile, isLoaded]);

  const updateUsername = (name: string) => {
    setProfile((prev) => ({ ...prev, username: name }));
  };

  const recordGameStart = (difficulty: Difficulty) => {
    setProfile((prev) => {
      const p = { ...prev };
      p.stats.totalGamesPlayed++;
      p.stats.difficulties[difficulty].played++;
      return p;
    });
  };

  const recordGameWin = (difficulty: Difficulty, time: number, score: number) => {
    setProfile((prev) => {
      const p = { ...prev };
      p.stats.totalGamesWon++;
      
      const diffStats = p.stats.difficulties[difficulty];
      diffStats.won++;
      
      if (diffStats.bestTime === null || time < diffStats.bestTime) {
        diffStats.bestTime = time;
      }
      if (diffStats.bestScore === null || score > diffStats.bestScore) {
        diffStats.bestScore = score;
      }
      
      return p;
    });
  };

  const recordTimePlayed = (seconds: number) => {
    setProfile((prev) => {
      const p = { ...prev };
      p.stats.totalTimePlayed += seconds;
      return p;
    });
  };

  const recordMistake = () => {
    setProfile((prev) => {
      const p = { ...prev };
      p.stats.totalMistakes++;
      return p;
    });
  };

  const resetProfile = () => {
    setProfile(DEFAULT_PROFILE);
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        user,
        updateUsername,
        recordGameStart,
        recordGameWin,
        recordMistake,
        recordTimePlayed,
        resetProfile,
        isLoaded,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
