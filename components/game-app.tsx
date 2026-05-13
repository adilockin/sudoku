"use client"

import { useState } from "react"

import { SudokuBoard } from "@/components/sudoku-board"
import { GameModals } from "@/components/game-modals"
import { ScorePopup } from "@/components/score-popup"
import { GameProvider, useGame, formatTime } from "@/lib/game-context"
import { SettingsProvider, useSettings } from "@/lib/settings-context"
import { SoundProvider, useSound } from "@/lib/sound-context"
import { ProfileProvider } from "@/lib/profile-context"
import { Settings, Volume2, VolumeX, Gamepad2, Pause, Play, RotateCcw, User, Languages, Home } from "lucide-react"
import {
  Dialog as UI_Dialog,
  DialogContent as UI_DialogContent,
  DialogHeader as UI_DialogHeader,
  DialogTitle as UI_DialogTitle,
  DialogDescription as UI_DialogDescription,
} from "@/components/ui/dialog"
import { SettingsDialog } from "@/components/settings-dialog"
import { ProfileDialog } from "@/components/profile-dialog"
import { DifficultySelector } from "@/components/difficulty-selector"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

function SlowRoadsHUD() {
  const { state, pause, resume, newGame } = useGame()
  const { isMusicPlaying, toggleMusic } = useSound()
  const { settings, updateSetting } = useSettings()
  const router = useRouter()
  const [confirmAction, setConfirmAction] = useState<{ type: 'restart' | 'home', isOpen: boolean }>({ type: 'restart', isOpen: false })

  const handleAction = () => {
    if (confirmAction.type === 'restart') {
      newGame(state.difficulty)
    } else {
      router.push('/')
    }
    setConfirmAction(prev => ({ ...prev, isOpen: false }))
  }

  return (
    <>
      <div className="absolute bottom-0 w-full p-4 pb-4 sm:pb-6 md:p-12 flex justify-between items-end pointer-events-none z-20 font-sans tracking-widest text-white/90">
        {/* Left side: Score & Mistakes */}
        <div className="flex flex-col gap-3 sm:gap-6">
          <div className="flex flex-col">
            <div className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tighter" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
              {state.score.totalScore.toString().padStart(6, '0')}
            </div>
            <div className="text-[7px] sm:text-[10px] md:text-xs font-bold text-white/50 uppercase mt-0 sm:mt-1">
              {settings.language === "ru" ? "ОЧКИ" : "SCORE"}
            </div>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-1 sm:gap-1.5 h-4 sm:h-8">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-2 h-2 sm:w-4 sm:h-4 border transform rotate-45 transition-colors duration-300",
                    i < state.mistakes 
                      ? "bg-red-500 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]" 
                      : "bg-transparent border-white/20"
                  )}
                />
              ))}
            </div>
            <div className="text-[7px] sm:text-[10px] md:text-xs font-bold text-white/50 uppercase mt-0 sm:mt-1">
              {settings.language === "ru" ? "ОШИБКИ" : "MISTAKES"}
            </div>
          </div>
        </div>

        {/* Center: Difficulty / Status */}
        <div className="absolute left-1/2 bottom-4 sm:bottom-6 md:bottom-12 -translate-x-1/2 flex flex-col items-center pointer-events-auto">
          <DifficultySelector />
        </div>

        {/* Right side: Time */}
        <div className="flex flex-col items-end">
          <div className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tighter" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
            {formatTime(state.timer)}
          </div>
          <div className="text-[7px] sm:text-[10px] md:text-xs font-bold text-white/50 uppercase mt-0 sm:mt-1">
            {settings.language === "ru" ? "ВРЕМЯ" : "TIME"}
          </div>
        </div>

        {/* Right Top controls - clearly at the top for mobile */}
        <div className="absolute right-0 left-0 top-0 p-3 sm:p-4 md:p-8 flex flex-row justify-end items-center gap-1.5 sm:gap-4 text-white/50 pointer-events-auto">
          <button onClick={() => setConfirmAction({ type: 'restart', isOpen: true })} className="hover:text-white transition-colors focus:outline-none bg-black/40 p-2 md:p-0 md:bg-transparent rounded-full md:rounded-none touch-manipulation" title={settings.language === "ru" ? "Перезапуск" : "Restart Game"}>
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <button onClick={state.isPaused ? resume : pause} className="hover:text-white transition-colors focus:outline-none bg-black/40 p-2 md:p-0 md:bg-transparent rounded-full md:rounded-none touch-manipulation" title={settings.language === "ru" ? "Пауза / Продолжить" : "Pause / Resume"}>
            {state.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>

          <button onClick={toggleMusic} className="hover:text-white transition-colors focus:outline-none bg-black/40 p-2 md:p-0 md:bg-transparent rounded-full md:rounded-none touch-manipulation" title={settings.language === "ru" ? "Вкл/Выкл Музыку" : "Toggle Music"}>
            {isMusicPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button 
            onClick={() => updateSetting("language", settings.language === "ru" ? "en" : "ru")} 
            className="hover:text-white transition-colors focus:outline-none bg-black/40 p-2 md:p-0 md:bg-transparent rounded-full md:rounded-none touch-manipulation flex items-center gap-1" 
            title={settings.language === "ru" ? "Сменить язык" : "Change Language"}
          >
            <Languages className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">{settings.language.toUpperCase()}</span>
          </button>

          <ProfileDialog>
            <button className="hover:text-white transition-colors focus:outline-none bg-black/40 p-2 md:p-0 md:bg-transparent rounded-full md:rounded-none" title="Profile & Stats">
              <User className="w-4 h-4" />
            </button>
          </ProfileDialog>
          
          <SettingsDialog>
            <button className="hover:text-white transition-colors focus:outline-none bg-black/40 p-2 md:p-0 md:bg-transparent rounded-full md:rounded-none" title="Settings">
              <Settings className="w-4 h-4" />
            </button>
          </SettingsDialog>

          <button onClick={() => setConfirmAction({ type: 'home', isOpen: true })} className="hover:text-white transition-colors focus:outline-none bg-black/40 p-2 md:p-0 md:bg-transparent rounded-full md:rounded-none touch-manipulation" title={settings.language === "ru" ? "На главную" : "Home"}>
            <Home className="w-4 h-4" />
          </button>
        </div>
      </div>

      <UI_Dialog open={confirmAction.isOpen} onOpenChange={(open) => setConfirmAction(prev => ({ ...prev, isOpen: open }))}>
        <UI_DialogContent className="max-w-[320px] bg-black/80 border border-white/10 text-white backdrop-blur-2xl rounded-none p-6 text-center">
          <UI_DialogHeader>
            <UI_DialogTitle className="font-sans text-lg tracking-widest uppercase font-bold text-white/90">
              {settings.language === "ru" ? "Вы уверены?" : "Are you sure?"}
            </UI_DialogTitle>
            <UI_DialogDescription className="text-white/50 text-[10px] uppercase tracking-widest mt-2">
              {settings.language === "ru" 
                ? "Прогресс текущей игры будет потерян." 
                : "Your current game progress will be lost."}
            </UI_DialogDescription>
          </UI_DialogHeader>
          <div className="flex gap-3 mt-6">
            <button 
              onClick={() => setConfirmAction(prev => ({ ...prev, isOpen: false }))}
              className="flex-1 h-10 border border-white/10 hover:bg-white/5 transition-colors text-[10px] uppercase tracking-widest font-bold"
            >
              {settings.language === "ru" ? "Отмена" : "Cancel"}
            </button>
            <button 
              onClick={handleAction}
              className="flex-1 h-10 bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 transition-colors text-[10px] uppercase tracking-widest font-bold"
            >
              {settings.language === "ru" ? "Подтвердить" : "Confirm"}
            </button>
          </div>
        </UI_DialogContent>
      </UI_Dialog>
    </>
  )
}

function GameContent() {
  const { state } = useGame()
  const { settings } = useSettings()

  return (
    <div className="fixed inset-0 bg-background overflow-hidden flex flex-col">
      {/* The game board in the center */}
      <main className="flex-1 flex items-center justify-center relative z-10 w-full h-full p-2 sm:p-4 pb-24 md:pb-32">
        <div className={cn("w-full max-w-lg transition-opacity duration-300", state.isPaused ? "opacity-0 pointer-events-none" : "opacity-100")}>
          <SudokuBoard />
        </div>
        
        {state.isPaused && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="text-3xl sm:text-4xl md:text-6xl font-serif font-light text-white/70 tracking-[0.5em] uppercase">
              {settings.language === "ru" ? "ПАУЗА" : "PAUSED"}
            </div>
          </div>
        )}
      </main>

      {/* The minimal HUD over the game */}
      <SlowRoadsHUD />

      <GameModals />
      <ScorePopup />

      {/* Snow particles overlay to match screenshot */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
        <div className="absolute w-1 h-1 bg-white rounded-full top-[20%] left-[30%] blur-[1px] animate-firefly performance-gpu"></div>
        <div className="absolute w-1.5 h-1.5 bg-white rounded-full top-[45%] left-[60%] blur-[1px] animate-firefly-delayed animate-twinkle performance-gpu"></div>
        <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-[70%] left-[15%] animate-firefly-fast performance-gpu"></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-[10%] left-[80%] blur-[1px] animate-firefly performance-gpu"></div>
        <div className="absolute w-2 h-2 bg-white rounded-full top-[80%] left-[75%] blur-[2px] animate-firefly-delayed animate-twinkle performance-gpu"></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-[50%] left-[10%] blur-[1px] animate-firefly-fast performance-gpu"></div>
        <div className="absolute w-1.5 h-1.5 bg-white rounded-full top-[30%] left-[90%] blur-[1px] animate-firefly animate-twinkle performance-gpu"></div>
      </div>
    </div>
  )
}

export default function GameApp() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  )
}
