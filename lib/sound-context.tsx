"use client";

import React, {
  createContext,
  useContext,
  useRef,
  useCallback,
  useEffect,
  useState,
} from "react";

// --- Sound Map ---

const SOUNDS = {
  bgm: "/sounds/bgm.mp3",
  gameStart: "/sounds/game-start.wav",
  correct: "/sounds/correct.mp3",
  streak: "/sounds/streak.mp3",
  reward: "/sounds/reward.wav",
  complete: "/sounds/complete.mp3",
} as const;

type SoundName = keyof typeof SOUNDS;

const STORAGE_KEY = "adoku-sound-settings";

interface SoundSettings {
  masterEnabled: boolean;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  musicVolume: number; // 0–1
  sfxVolume: number; // 0–1
}

const DEFAULT_SOUND_SETTINGS: SoundSettings = {
  masterEnabled: true,
  musicEnabled: true,
  sfxEnabled: true,
  musicVolume: 0.3,
  sfxVolume: 0.6,
};

function loadSoundSettings(): SoundSettings {
  if (typeof window === "undefined") return DEFAULT_SOUND_SETTINGS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_SOUND_SETTINGS, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_SOUND_SETTINGS;
}

function saveSoundSettings(settings: SoundSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

// --- Context ---

interface SoundContextValue {
  soundSettings: SoundSettings;
  updateSoundSetting: <K extends keyof SoundSettings>(
    key: K,
    value: SoundSettings[K]
  ) => void;
  playSfx: (name: Exclude<SoundName, "bgm">) => void;
  playMistakeBeep: () => void;
  playCorrectBeep: () => void;
  startMusic: () => void;
  stopMusic: () => void;
  toggleMusic: () => void;
  fadeAndRestart: () => void;
  isMusicPlaying: boolean;
}

const SoundContext = createContext<SoundContextValue | null>(null);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [soundSettings, setSoundSettings] = useState<SoundSettings>(
    DEFAULT_SOUND_SETTINGS
  );
  const [loaded, setLoaded] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  const musicRef = useRef<HTMLAudioElement | null>(null);
  const sfxCacheRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Load settings from localStorage
  useEffect(() => {
    setSoundSettings(loadSoundSettings());
    setLoaded(true);
  }, []);

  // Save settings
  useEffect(() => {
    if (loaded) saveSoundSettings(soundSettings);
  }, [soundSettings, loaded]);

  // Track user interaction for autoplay policy
  useEffect(() => {
    function handleInteraction() {
      setUserInteracted(true);
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    }
    window.addEventListener("click", handleInteraction);
    window.addEventListener("keydown", handleInteraction);
    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, []);

  // Initialize music element
  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = new Audio(SOUNDS.bgm);
    audio.loop = true;
    audio.volume = soundSettings.musicVolume;
    audio.preload = "auto";
    musicRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update music volume
  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.volume = soundSettings.musicVolume;
    }
  }, [soundSettings.musicVolume]);

  // Auto-start music after user interaction if enabled
  useEffect(() => {
    if (
      userInteracted &&
      soundSettings.masterEnabled &&
      soundSettings.musicEnabled &&
      musicRef.current &&
      !isMusicPlaying
    ) {
      musicRef.current
        .play()
        .then(() => setIsMusicPlaying(true))
        .catch(() => {});
    }
  }, [
    userInteracted,
    soundSettings.masterEnabled,
    soundSettings.musicEnabled,
    isMusicPlaying,
  ]);

  // Stop music if disabled
  useEffect(() => {
    if (
      (!soundSettings.masterEnabled || !soundSettings.musicEnabled) &&
      musicRef.current &&
      isMusicPlaying
    ) {
      musicRef.current.pause();
      setIsMusicPlaying(false);
    }
  }, [soundSettings.masterEnabled, soundSettings.musicEnabled, isMusicPlaying]);

  const startMusic = useCallback(() => {
    if (!musicRef.current) return;
    if (!soundSettings.masterEnabled || !soundSettings.musicEnabled) return;
    musicRef.current
      .play()
      .then(() => setIsMusicPlaying(true))
      .catch(() => {});
  }, [soundSettings.masterEnabled, soundSettings.musicEnabled]);

  const stopMusic = useCallback(() => {
    if (musicRef.current) {
      musicRef.current.pause();
      setIsMusicPlaying(false);
    }
  }, []);

  const toggleMusic = useCallback(() => {
    if (isMusicPlaying) {
      stopMusic();
      setSoundSettings(prev => ({ ...prev, musicEnabled: false }));
    } else {
      startMusic();
      setSoundSettings(prev => ({ ...prev, musicEnabled: true }));
    }
  }, [isMusicPlaying, startMusic, stopMusic]);

  // Fade music out then back in (for new game transitions)
  const fadeAndRestart = useCallback(() => {
    const audio = musicRef.current;
    if (!audio || !isMusicPlaying) return;

    const targetVolume = soundSettings.musicVolume;
    const fadeOutDuration = 800;
    const fadeInDuration = 2000;

    // Fade out
    const fadeOutStart = performance.now();
    function fadeOut(now: number) {
      const elapsed = now - fadeOutStart;
      const progress = Math.max(0, Math.min(elapsed / fadeOutDuration, 1));
      audio.volume = targetVolume * (1 - progress);
      if (progress < 1) {
        requestAnimationFrame(fadeOut);
      } else {
        audio.volume = 0;
        // Start fade in
        const fadeInStart = performance.now();
        function fadeIn(now: number) {
          const elapsed = now - fadeInStart;
          const progress = Math.max(0, Math.min(elapsed / fadeInDuration, 1));
          // Ease-in curve for smooth rise
          audio.volume = targetVolume * (progress * progress);
          if (progress < 1) {
            requestAnimationFrame(fadeIn);
          } else {
            audio.volume = targetVolume;
          }
        }
        requestAnimationFrame(fadeIn);
      }
    }
    requestAnimationFrame(fadeOut);
  }, [isMusicPlaying, soundSettings.musicVolume]);

  const playSfx = useCallback(
    (name: Exclude<SoundName, "bgm">) => {
      if (!soundSettings.masterEnabled || !soundSettings.sfxEnabled) return;

      const url = SOUNDS[name];
      // Clone audio for overlapping sounds
      let cached = sfxCacheRef.current.get(url);
      if (!cached) {
        cached = new Audio(url);
        sfxCacheRef.current.set(url, cached);
      }

      const clone = cached.cloneNode() as HTMLAudioElement;
      clone.volume = soundSettings.sfxVolume;
      clone.play().catch(() => {});
    },
    [soundSettings.masterEnabled, soundSettings.sfxEnabled, soundSettings.sfxVolume]
  );

  const playMistakeBeep = useCallback(() => {
    if (!soundSettings.masterEnabled || !soundSettings.sfxEnabled) return;

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 200;
      gain.gain.value = soundSettings.sfxVolume * 0.3;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  }, [soundSettings.masterEnabled, soundSettings.sfxEnabled, soundSettings.sfxVolume]);

  const playCorrectBeep = useCallback(() => {
    if (!soundSettings.masterEnabled || !soundSettings.sfxEnabled) return;

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(soundSettings.sfxVolume * 0.15, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }, [soundSettings.masterEnabled, soundSettings.sfxEnabled, soundSettings.sfxVolume]);

  const updateSoundSetting = useCallback(
    <K extends keyof SoundSettings>(key: K, value: SoundSettings[K]) => {
      setSoundSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  return (
    <SoundContext.Provider
      value={{
        soundSettings,
        updateSoundSetting,
        playSfx,
        playMistakeBeep,
        playCorrectBeep,
        startMusic,
        stopMusic,
        toggleMusic,
        fadeAndRestart,
        isMusicPlaying,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export function useSound(): SoundContextValue {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSound must be used within SoundProvider");
  return ctx;
}
