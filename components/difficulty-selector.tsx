"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react"
import { useGame } from "@/lib/game-context"
import { useSettings } from "@/lib/settings-context"
import type { Difficulty } from "@/lib/sudoku-engine"
import { cn } from "@/lib/utils"

export function DifficultySelector() {
  const { state, newGame } = useGame()
  const { settings } = useSettings()
  const difficulties: Difficulty[] = ["easy", "medium", "hard", "expert"]
  
  const [tempDiff, setTempDiff] = useState<Difficulty>(state.difficulty)
  
  // Keep temp diff in sync if external state changes
  useEffect(() => { 
    setTempDiff(state.difficulty) 
  }, [state.difficulty])

  const handleNext = () => {
    const idx = difficulties.indexOf(tempDiff)
    setTempDiff(difficulties[(idx + 1) % difficulties.length])
  }
  
  const handlePrev = () => {
    const idx = difficulties.indexOf(tempDiff)
    setTempDiff(difficulties[(idx - 1 + difficulties.length) % difficulties.length])
  }

  const isChanged = tempDiff !== state.difficulty

  const getDiffLabel = (diff: Difficulty) => {
    if (settings.language === "ru") {
      const ruMap: Record<Difficulty, string> = {
        easy: "ЛЕГКО",
        medium: "СРЕДНЕ",
        hard: "СЛОЖНО",
        expert: "ЭКСПЕРТ"
      }
      return ruMap[diff]
    }
    return diff
  }

  const confirm = () => {
    newGame(tempDiff)
  }

  const cancel = () => setTempDiff(state.difficulty)

  return (
    <div className="flex flex-col items-center relative min-h-[40px]">
      <div className="flex items-center gap-3">
        <button onClick={handlePrev} className="text-white/30 hover:text-white transition-colors touch-manipulation focus:outline-none p-2 md:p-0">
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6"/>
        </button>
        <span className={cn(
          "text-[8px] sm:text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] w-[100px] sm:w-[120px] text-center transition-colors",
          isChanged ? "text-green-400" : "text-white/80"
        )}>
          {getDiffLabel(tempDiff)} {settings.language === "ru" ? "" : "MODE"}
        </span>
        <button onClick={handleNext} className="text-white/30 hover:text-white transition-colors touch-manipulation focus:outline-none p-2 md:p-0">
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6"/>
        </button>
      </div>

      <div className={cn(
        "absolute -bottom-8 flex items-center gap-6 transition-all duration-300",
        isChanged ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
      )}>
        <button onClick={cancel} className="text-[10px] text-white/50 hover:text-white uppercase tracking-widest flex items-center gap-1 touch-manipulation transition-colors">
          <X className="w-3 h-3"/> {settings.language === "ru" ? "ОТМЕНА" : "Cancel"}
        </button>
        <button onClick={confirm} className="text-[10px] text-green-400 hover:text-green-300 uppercase tracking-widest flex items-center gap-1 touch-manipulation transition-colors font-bold">
          <Check className="w-3 h-3"/> {settings.language === "ru" ? "СТАРТ" : "Confirm"}
        </button>
      </div>
    </div>
  )
}
