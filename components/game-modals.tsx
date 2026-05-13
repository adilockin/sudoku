"use client"

import { Trophy, XCircle } from "lucide-react"
import { useGame, formatTime } from "@/lib/game-context"
import { useSettings } from "@/lib/settings-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { ScoreEvent } from "@/lib/score-engine"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

function ScoreBreakdown({ events, language }: { events: ScoreEvent[]; language: string }) {
  const groups: Record<string, { label: string; points: number }> = {}
  for (const e of events) {
    const label = getEventLabel(e.type, language)
    if (!groups[e.type]) {
      groups[e.type] = { label, points: 0 }
    }
    groups[e.type].points += e.points
  }

  const rows = Object.values(groups).filter((g) => g.points !== 0)
  if (rows.length === 0) return null

  return (
    <div className="w-full space-y-1.5 text-xs">
      {rows.map((row, i) => (
        <div key={i} className="flex justify-between border-b border-white/5 py-1">
          <span className="text-white/50 uppercase tracking-widest font-sans">{row.label}</span>
          <span className={row.points >= 0 ? "text-green-400 font-mono font-bold" : "text-red-400 font-mono font-bold"}>
            {row.points > 0 ? "+" : ""}
            {row.points}
          </span>
        </div>
      ))}
    </div>
  )
}

function getEventLabel(type: ScoreEvent["type"], language: string): string {
  if (language === "ru") {
    switch (type) {
      case "correct": return "Верные числа"
      case "streak": return "Бонус за серию"
      case "speed": return "Бонус за скорость"
      case "row": return "Ряды завершены"
      case "col": return "Столбцы завершены"
      case "box": return "Квадраты завершены"
      case "mistake": return "Ошибки"
      case "hint": return "Подсказки"
      case "completion": return "Головоломка решена"
      case "time": return "Бонус времени"
      case "no_mistake": return "Бонус за отсутствие ошибок"
      case "no_hint": return "Бонус за отсутствие подсказок"
      case "first": return "Первый ход"
      default: return type
    }
  }
  switch (type) {
    case "correct": return "Correct placements"
    case "streak": return "Streak bonuses"
    case "speed": return "Speed bonuses"
    case "row": return "Rows completed"
    case "col": return "Columns completed"
    case "box": return "Boxes completed"
    case "mistake": return "Mistakes"
    case "hint": return "Hints used"
    case "completion": return "Puzzle complete"
    case "time": return "Time bonus"
    case "no_mistake": return "No mistakes bonus"
    case "no_hint": return "Hints saved bonus"
    case "first": return "First move"
    default: return type
  }
}

export function GameModals() {
  const { state, newGame } = useGame()
  const { settings } = useSettings()

  const isOpen = state.isComplete || state.isGameOver
  const isWin = state.isComplete
  const lang = settings.language

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-[400px] max-h-[90vh] overflow-y-auto bg-black/40 border border-white/10 text-white shadow-2xl backdrop-blur-3xl rounded-none p-6 md:p-8 outline-none">
        <DialogHeader className="space-y-4">
          <div className="flex justify-center">
            {isWin ? (
              <div className="h-16 w-16 rounded-none bg-green-500/10 flex items-center justify-center border border-green-500/30">
                <Trophy className="h-8 w-8 text-green-500" />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-none bg-red-500/10 flex items-center justify-center border border-red-500/30">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            )}
          </div>
          
          <div className="text-center space-y-1">
            <DialogTitle className="text-2xl font-serif font-light uppercase tracking-[0.2em] text-white">
              {isWin 
                ? (lang === "ru" ? "Головоломка Решена" : "Puzzle Complete") 
                : (lang === "ru" ? "Игра Окончена" : "Game Over")}
            </DialogTitle>
            <DialogDescription className="text-white/50 text-[10px] uppercase tracking-[0.2em] font-sans font-bold">
              {isWin
                ? (lang === "ru" ? "Отличная работа!" : "Great job solving this puzzle!")
                : (lang === "ru" ? "Слишком много ошибок. Попробуйте снова!" : "Too many mistakes. Try again!")}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {isWin && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/5 border border-white/5 p-3 text-center">
                  <p className="text-lg font-mono font-bold text-white">{formatTime(state.timer)}</p>
                  <p className="text-[8px] text-white/40 uppercase tracking-widest font-bold">{lang === "ru" ? "Время" : "Time"}</p>
                </div>
                <div className="bg-white/5 border border-white/5 p-3 text-center">
                  <p className="text-lg font-mono font-bold text-white">{state.mistakes}</p>
                  <p className="text-[8px] text-white/40 uppercase tracking-widest font-bold">{lang === "ru" ? "Ошибки" : "Mistakes"}</p>
                </div>
                <div className="bg-white/5 border border-white/5 p-3 text-center">
                  <p className="text-lg font-mono font-bold text-white">{state.score.bestStreak}</p>
                  <p className="text-[8px] text-white/40 uppercase tracking-widest font-bold">{lang === "ru" ? "Серия" : "Streak"}</p>
                </div>
              </div>

              <div className="bg-white/10 border border-white/10 p-5 text-center shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
                <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] mb-2 font-bold">
                  {lang === "ru" ? "Итоговый Счет" : "Final Score"}
                </p>
                <p className="text-5xl font-bold font-sans tracking-tighter text-white">
                  {state.score.totalScore.toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-bold border-b border-white/10 pb-1">
                  {lang === "ru" ? "Детализация" : "Score Breakdown"}
                </p>
                <ScoreBreakdown events={state.score.scoreLog} language={lang} />
              </div>
            </div>
          )}

          {!isWin && (
            <div className="bg-red-500/5 border border-red-500/10 p-6 text-center">
              <p className="text-[10px] text-red-500/50 uppercase tracking-[0.3em] font-bold mb-2">
                {lang === "ru" ? "Ваш Счет" : "Your Score"}
              </p>
              <p className="text-4xl font-bold font-mono text-red-400">
                {state.score.totalScore.toLocaleString()}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
            <Button
              className="w-full rounded-none h-12 bg-white text-black hover:bg-white/90 uppercase tracking-[0.2em] text-xs font-bold"
              onClick={() => newGame(state.difficulty)}
            >
              {isWin 
                ? (lang === "ru" ? "Играть Снова" : "Play Again") 
                : (lang === "ru" ? "Попробовать Снова" : "Try Again")}
            </Button>
            <Link href="/" className="w-full">
              <Button
                variant="ghost"
                className="w-full rounded-none h-10 border border-white/10 text-white/50 hover:text-white uppercase tracking-[0.2em] text-[10px] font-bold"
              >
                {lang === "ru" ? "Главное Меню" : "Main Menu"}
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
