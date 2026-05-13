"use client"

import { Trophy, XCircle } from "lucide-react"
import { useGame, formatTime } from "@/lib/game-context"
import { useSettings } from "@/lib/settings-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Difficulty } from "@/lib/sudoku-engine"
import type { ScoreEvent } from "@/lib/score-engine"

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
    <div className="w-full space-y-1.5 text-sm">
      {rows.map((row, i) => (
        <div key={i} className="flex justify-between">
          <span className="text-muted-foreground">{row.label}</span>
          <span className={row.points >= 0 ? "text-primary font-mono font-medium" : "text-destructive font-mono font-medium"}>
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

  if (!state.isComplete && !state.isGameOver) return null

  const isWin = state.isComplete
  const lang = settings.language

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl">
      <div className="bg-transparent border border-green-500/30 rounded-none p-8 max-w-sm w-full mx-4 text-center space-y-6">
        {/* Icon */}
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

        {/* Title */}
        <div>
          <h2 className="text-2xl font-serif font-light uppercase tracking-widest text-green-400">
            {isWin 
              ? (lang === "ru" ? "Головоломка Решена" : "Puzzle Complete") 
              : (lang === "ru" ? "Игра Окончена" : "Game Over")}
          </h2>
          <p className="text-white/50 mt-1 text-[10px] uppercase tracking-widest font-sans">
            {isWin
              ? (lang === "ru" ? "Отличная работа!" : "Great job solving this puzzle!")
              : (lang === "ru" ? "Слишком много ошибок. Попробуйте снова!" : "Too many mistakes. Try again!")}
          </p>
        </div>

        {/* Stats */}
        {isWin && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-none bg-green-500/5 border border-green-500/20 p-3">
                <p className="text-xl font-bold font-sans text-green-50">{formatTime(state.timer)}</p>
                <p className="text-[8px] text-green-500/60 uppercase tracking-widest font-sans">
                  {lang === "ru" ? "Время" : "Time"}
                </p>
              </div>
              <div className="rounded-none bg-green-500/5 border border-green-500/20 p-3">
                <p className="text-xl font-bold font-sans text-green-50">{state.mistakes}</p>
                <p className="text-[8px] text-green-500/60 uppercase tracking-widest font-sans">
                  {lang === "ru" ? "Ошибки" : "Mistakes"}
                </p>
              </div>
              <div className="rounded-none bg-green-500/5 border border-green-500/20 p-3">
                <p className="text-xl font-bold font-sans text-green-50">{state.score.bestStreak}</p>
                <p className="text-[8px] text-green-500/60 uppercase tracking-widest font-sans">
                  {lang === "ru" ? "Макс. Серия" : "Best Streak"}
                </p>
              </div>
            </div>

            {/* Total score */}
            <div className="rounded-none bg-green-500/10 border border-green-500/30 p-5">
              <p className="text-[10px] text-green-500/70 uppercase tracking-widest mb-1 font-sans font-bold">
                {lang === "ru" ? "Общий Счет" : "Total Score"}
              </p>
              <p className="text-4xl font-bold font-sans text-green-400">
                {state.score.totalScore.toLocaleString()}
              </p>
            </div>

            <ScoreBreakdown events={state.score.scoreLog} language={lang} />
          </div>
        )}

        {/* Game over — show final score */}
        {!isWin && (
          <div className="rounded-none bg-red-500/5 border border-red-500/20 p-5">
            <p className="text-[10px] text-red-500/70 uppercase tracking-widest font-sans font-bold mb-1">
              {lang === "ru" ? "Счет" : "Score"}
            </p>
            <p className="text-2xl font-bold font-sans text-red-400">
              {state.score.totalScore.toLocaleString()}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-4 border-t border-green-500/20">
          <Button
            className="w-full rounded-none h-11 bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 hover:text-green-300 uppercase tracking-widest text-xs font-sans font-bold"
            onClick={() => newGame(state.difficulty)}
          >
            {isWin 
              ? (lang === "ru" ? "Играть Снова" : "Play Again") 
              : (lang === "ru" ? "Попробовать Снова" : "Try Again")}
          </Button>
          <div className="flex gap-2">
            <Link href="/" className="flex-1">
              <Button
                variant="outline"
                className="w-full rounded-none h-11 border-green-500/30 text-white/50 hover:bg-green-500/10 hover:text-white uppercase tracking-widest text-[10px] font-sans"
              >
                {lang === "ru" ? "Главное Меню" : "Main Menu"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
