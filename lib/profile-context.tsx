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

export interface GameRecord {
  id: string;
  date: string;
  difficulty: Difficulty;
  time: number;
  score: number;
  mistakes: number;
  hintsUsed: number;
  completed: boolean;
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
  gameHistory: GameRecord[];
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
  gameHistory: [],
};

interface ProfileContextValue {
  profile: UserProfile;
  user: User | null;
  updateUsername: (name: string) => void;
  recordGameStart: (difficulty: Difficulty) => void;
  recordGameWin: (difficulty: Difficulty, time: number, score: number, mistakes?: number, hintsUsed?: number) => void;
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

  const recordGameWin = (difficulty: Difficulty, time: number, score: number, mistakes: number = 0, hintsUsed: number = 0) => {
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
      
      // Save game history
      const record: GameRecord = {
        id: Math.random().toString(36).substring(2, 15),
        date: new Date().toISOString(),
        difficulty,
        time,
        score,
        mistakes,
        hintsUsed,
        completed: true,
      };
      
      p.gameHistory = [record, ...(p.gameHistory || [])].slice(0, 50); // Keep last 50 games
      
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
