"use client"

import { Timer, Heart, Pause, Play, RotateCcw, Flame, Trophy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useGame, formatTime, getStreakMultiplier } from "@/lib/game-context"
import { useSettings } from "@/lib/settings-context"
import type { Difficulty } from "@/lib/sudoku-engine"
import { cn } from "@/lib/utils"

const difficultyColors: Record<Difficulty, string> = {
  easy: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20",
  medium: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  hard: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20",
  expert: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
}

export function RightColumn() {
  const { state, pause, resume, newGame } = useGame()
  const { settings } = useSettings()

  const difficulties: Difficulty[] = ["easy", "medium", "hard", "expert"]
  const streakMultiplier = getStreakMultiplier(state.score.currentStreak)

  return (
    <div className="space-y-4">
      {/* Game Stats Card */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Game Stats
        </h3>

        {/* Timer */}
        {settings.showTimer && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Timer className="h-4 w-4" />
              <span className="text-sm">Time</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight">
                {formatTime(state.timer)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg"
                onClick={state.isPaused ? resume : pause}
                disabled={state.isComplete || state.isGameOver}
              >
                {state.isPaused ? (
                  <Play className="h-3.5 w-3.5" />
                ) : (
                  <Pause className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Difficulty */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Difficulty</span>
          <Badge className={cn("capitalize border backdrop-blur-sm", difficultyColors[state.difficulty])}>
            {state.difficulty}
          </Badge>
        </div>

        {/* Mistakes */}
        {settings.showMistakeCount && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Lives</span>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: state.maxMistakes }).map((_, i) => (
                <Heart
                  key={i}
                  className={cn(
                    "h-4 w-4 transition-all duration-300",
                    i < state.maxMistakes - state.mistakes
                      ? "fill-destructive text-destructive scale-100"
                      : "text-muted-foreground/20 scale-90"
                  )}
                />
              ))}
              <span className="ml-1 text-xs font-medium font-mono text-muted-foreground">
                {state.maxMistakes - state.mistakes}/{state.maxMistakes}
              </span>
            </div>
          </div>
        )}

        {/* Score */}
        {settings.showScore && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span className="text-sm">Score</span>
            </div>
            <span className="text-xl font-bold font-mono tracking-tight text-primary">
              {state.score.totalScore.toLocaleString()}
            </span>
          </div>
        )}

        {/* Streak */}
        {settings.showStreak && state.score.currentStreak > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Flame className={cn(
                "h-4 w-4 transition-colors",
                state.score.currentStreak >= 10 ? "text-orange-500" :
                state.score.currentStreak >= 5 ? "text-yellow-500" :
                "text-muted-foreground"
              )} />
              <span className="text-sm">Streak</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold font-mono">
                {state.score.currentStreak}
              </span>
              {streakMultiplier > 1 && (
                <Badge variant="secondary" className="font-mono text-xs bg-primary/10 text-primary border-primary/20">
                  ×{streakMultiplier}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Hints remaining */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Hints</span>
          <span className="text-sm font-medium font-mono">
            {state.maxHints - state.hintsUsed}/{state.maxHints}
          </span>
        </div>
      </div>

      {/* New Game */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          New Game
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {difficulties.map((diff) => (
            <Button
              key={diff}
              variant={state.difficulty === diff ? "default" : "outline"}
              size="sm"
              className={cn(
                "capitalize rounded-xl transition-all",
                state.difficulty !== diff && "bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10"
              )}
              onClick={() => newGame(diff)}
            >
              {diff}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
