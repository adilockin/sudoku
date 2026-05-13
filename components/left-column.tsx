"use client"

import { Keyboard } from "lucide-react"

const shortcuts = [
  { action: "Place number", keys: "1-9" },
  { action: "Move cursor", keys: "↑↓←→" },
  { action: "Erase", keys: "⌫" },
  { action: "Toggle notes", keys: "N" },
  { action: "Undo", keys: "⌘Z" },
]

export function LeftColumn() {
  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
        <Keyboard className="h-4 w-4" />
        Shortcuts
      </h3>
      <div className="space-y-2.5">
        {shortcuts.map((s) => (
          <div key={s.action} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{s.action}</span>
            <kbd className="px-2 py-0.5 rounded-lg bg-white/10 border border-white/10 text-xs font-mono backdrop-blur-sm">
              {s.keys}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  )
}
