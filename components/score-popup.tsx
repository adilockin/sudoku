"use client"

import { useEffect, useState } from "react"
import { useGame } from "@/lib/game-context"
import type { ScoreEvent } from "@/lib/score-engine"
import { cn } from "@/lib/utils"

interface PopupItem {
  id: number
  event: ScoreEvent
}

let popupId = 0

export function ScorePopup() {
  const { state, clearPopups } = useGame()
  const [popups, setPopups] = useState<PopupItem[]>([])

  useEffect(() => {
    if (state.score.pendingPopups.length > 0) {
      const newPopups = state.score.pendingPopups.map((event) => ({
        id: ++popupId,
        event,
      }))
      setPopups((prev) => [...prev, ...newPopups])
      clearPopups()

      const ids = newPopups.map((p) => p.id)
      setTimeout(() => {
        setPopups((prev) => prev.filter((p) => !ids.includes(p.id)))
      }, 1500)
    }
  }, [state.score.pendingPopups, clearPopups])

  if (popups.length === 0) return null

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col items-end gap-1.5 pointer-events-none">
      {popups.map((popup) => (
        <div
          key={popup.id}
          className={cn(
            "score-popup-anim glass-popup rounded-full px-4 py-1.5 text-sm font-bold",
            popup.event.points > 0
              ? "text-primary"
              : "text-destructive"
          )}
        >
          <span>
            {popup.event.points > 0 ? "+" : ""}
            {popup.event.points}
          </span>
          {popup.event.details && (
            <span className="ml-1.5 text-xs opacity-70 font-medium">
              {popup.event.details}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
