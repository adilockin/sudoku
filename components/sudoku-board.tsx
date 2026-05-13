"use client"

import { Undo2, Eraser, Lightbulb, PenLine } from "lucide-react"
import { cn } from "@/lib/utils"
import { useGame } from "@/lib/game-context"
import { useSettings } from "@/lib/settings-context"
import { getNumberCounts } from "@/lib/sudoku-engine"

export function SudokuBoard() {
  const {
    state,
    selectCell,
    placeNumber,
    erase,
    undo,
    hint,
    toggleNotesMode,
    isCellPrefilled,
    isCellMistake,
    isCellSelected,
    isCellHighlighted,
    isCellSameNumber,
    getCellNotes,
  } = useGame()
  const { settings } = useSettings()

  const numberCounts = getNumberCounts(state.puzzle)

  return (
    <div className="w-full flex flex-col items-center space-y-6 md:space-y-8 z-10 pointer-events-auto">
      {/* Sudoku Grid - Minimal Slow Roads style */}
      <div className="aspect-square w-full max-w-[400px] md:max-w-[480px] mx-auto">
        <div className="grid grid-cols-9 h-full w-full border-2 border-white/20 bg-black/10 backdrop-blur-sm shadow-2xl">
          {state.puzzle.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const selected = isCellSelected(rowIndex, colIndex)
              const highlighted = isCellHighlighted(rowIndex, colIndex)
              const sameNum = isCellSameNumber(rowIndex, colIndex)
              const prefilled = isCellPrefilled(rowIndex, colIndex)
              const mistake = isCellMistake(rowIndex, colIndex)
              const notes = getCellNotes(rowIndex, colIndex)
              const hasValue = cell !== 0

              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => selectCell(rowIndex, colIndex)}
                  className={cn(
                    "aspect-square flex items-center justify-center text-lg sm:text-xl md:text-2xl font-serif relative transition-all duration-150 touch-manipulation",
                    // Minimal borders
                    colIndex % 3 === 2 && colIndex !== 8 && "border-r border-r-white/30",
                    colIndex % 3 !== 2 && colIndex !== 8 && "border-r border-r-white/5",
                    rowIndex % 3 === 2 && rowIndex !== 8 && "border-b border-b-white/30",
                    rowIndex % 3 !== 2 && rowIndex !== 8 && "border-b border-b-white/5",
                    // Selection & highlighting
                    selected && "bg-white/20 ring-1 ring-inset ring-white/50 z-10",
                    !selected && highlighted && "bg-white/5",
                    !selected && sameNum && !highlighted && "bg-white/10",
                    !selected && !highlighted && !sameNum && "hover:bg-white/5",
                    // Text colors
                    mistake && "text-destructive font-bold hud-text-glow",
                    prefilled && !mistake && state.initialPuzzle[rowIndex][colIndex] !== 0 && "text-white/90 font-bold drop-shadow-md",
                    prefilled && !mistake && state.initialPuzzle[rowIndex][colIndex] === 0 && "text-white/90 font-medium",
                    !prefilled && !mistake && hasValue && "text-white/90 font-medium",
                  )}
                >
                  {hasValue ? (
                    <span className={cn(
                      "transition-transform",
                      selected && "scale-110"
                    )}>
                      {cell}
                    </span>
                  ) : notes.length > 0 ? (
                    <div className="grid grid-cols-3 gap-0 w-full h-full p-0.5">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                        <span
                          key={n}
                          className={cn(
                            "flex items-center justify-center text-[9px] sm:text-[10px] font-sans leading-none",
                            notes.includes(n) ? "text-white/50" : "text-transparent"
                          )}
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Number Keypad & Controls together in a minimal row */}
      <div className="flex flex-col items-center gap-4 max-w-[480px] w-full">
        {/* Numpad */}
        <div className="flex justify-between w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
            const isFullyPlaced = settings.dimCompletedNumbers && numberCounts[num] >= 9
            return (
              <button
                key={num}
                className={cn(
                  "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center text-base sm:text-lg md:text-xl font-serif transition-all relative border border-transparent rounded-sm touch-manipulation",
                  isFullyPlaced && "opacity-20 cursor-not-allowed",
                  !isFullyPlaced && "text-white/80 hover:text-white hover:border-white/20 hover:bg-white/5",
                  state.notesMode && !isFullyPlaced && "text-white/50 text-xs sm:text-sm"
                )}
                onClick={() => !isFullyPlaced && placeNumber(num)}
                disabled={isFullyPlaced}
              >
                {num}
              </button>
            )
          })}
        </div>

        {/* Tools */}
        <div className="flex items-center justify-around w-full text-white/50 font-sans text-[10px] sm:text-xs tracking-[0.1em] sm:tracking-[0.2em] uppercase mt-4">
          <button 
            onClick={undo}
            disabled={state.history.length === 0}
            className="flex flex-col items-center gap-1 hover:text-white disabled:opacity-30 transition-colors group touch-manipulation min-w-[60px]"
          >
            <Undo2 className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
            <span>{settings.language === "ru" ? "Назад" : "Undo"}</span>
          </button>
          
          <button 
            onClick={erase}
            className="flex flex-col items-center gap-1 hover:text-white transition-colors group touch-manipulation min-w-[60px]"
          >
            <Eraser className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
            <span>{settings.language === "ru" ? "Стереть" : "Erase"}</span>
          </button>

          <button 
            onClick={toggleNotesMode}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors group touch-manipulation min-w-[60px]",
              state.notesMode ? "text-white" : "hover:text-white"
            )}
          >
            <PenLine className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
            <span>{settings.language === "ru" ? "Заметки" : "Notes"}</span>
          </button>

          <button 
            onClick={hint}
            disabled={state.hintsUsed >= state.maxHints}
            className="flex flex-col items-center gap-1 hover:text-white disabled:opacity-30 transition-colors group touch-manipulation min-w-[60px]"
          >
            <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
            <span>{settings.language === "ru" ? "Подсказка" : "Hint"} ({state.maxHints - state.hintsUsed})</span>
          </button>
        </div>
      </div>
    </div>
  )
}
