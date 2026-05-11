"use client"

import { useState } from "react"
import { Undo2, Eraser, Lightbulb, PenLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

// Sample puzzle data - 0 means empty cell
const initialPuzzle = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
]

// Notes for demonstration
const sampleNotes: Record<string, number[]> = {
  "0-2": [1, 4],
  "1-1": [2, 4, 7],
  "2-0": [1, 2],
}

export function SudokuBoard() {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>({ row: 2, col: 4 })
  const [puzzle, setPuzzle] = useState(initialPuzzle)
  const [notesMode, setNotesMode] = useState(false)

  const handleCellClick = (row: number, col: number) => {
    setSelectedCell({ row, col })
  }

  const handleNumberClick = (num: number) => {
    if (selectedCell && initialPuzzle[selectedCell.row][selectedCell.col] === 0) {
      const newPuzzle = puzzle.map((row, i) =>
        row.map((cell, j) => (i === selectedCell.row && j === selectedCell.col ? num : cell))
      )
      setPuzzle(newPuzzle)
    }
  }

  const isInSameBox = (row1: number, col1: number, row2: number, col2: number) => {
    return Math.floor(row1 / 3) === Math.floor(row2 / 3) && Math.floor(col1 / 3) === Math.floor(col2 / 3)
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 md:p-6">
        {/* Sudoku Grid */}
        <div className="aspect-square max-w-md mx-auto mb-6">
          <div className="grid grid-cols-9 gap-0 border-2 border-foreground/80 rounded-lg overflow-hidden">
            {puzzle.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                const isHighlighted =
                  selectedCell &&
                  (selectedCell.row === rowIndex ||
                    selectedCell.col === colIndex ||
                    isInSameBox(selectedCell.row, selectedCell.col, rowIndex, colIndex))
                const isPrefilled = initialPuzzle[rowIndex][colIndex] !== 0
                const notes = sampleNotes[`${rowIndex}-${colIndex}`]
                const showNotes = cell === 0 && notes && notes.length > 0

                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    className={cn(
                      "aspect-square flex items-center justify-center text-lg md:text-xl font-semibold transition-all relative",
                      "border-r border-b border-border/60",
                      // Thicker borders for 3x3 boxes
                      colIndex % 3 === 2 && colIndex !== 8 && "border-r-2 border-r-foreground/50",
                      rowIndex % 3 === 2 && rowIndex !== 8 && "border-b-2 border-b-foreground/50",
                      // Cell states
                      isSelected && "bg-primary/30 ring-2 ring-primary ring-inset",
                      !isSelected && isHighlighted && "bg-primary/10",
                      !isSelected && !isHighlighted && "bg-card hover:bg-secondary/50",
                      // Text colors
                      isPrefilled ? "text-foreground" : "text-primary"
                    )}
                  >
                    {showNotes ? (
                      <div className="grid grid-cols-3 gap-0 text-[8px] md:text-[10px] text-muted-foreground p-0.5">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                          <span key={n} className={cn("leading-none", !notes.includes(n) && "invisible")}>
                            {n}
                          </span>
                        ))}
                      </div>
                    ) : cell !== 0 ? (
                      cell
                    ) : null}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Number Keypad */}
        <div className="grid grid-cols-9 gap-2 max-w-md mx-auto mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <Button
              key={num}
              variant="secondary"
              className="aspect-square text-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => handleNumberClick(num)}
            >
              {num}
            </Button>
          ))}
        </div>

        {/* Control Panel */}
        <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap">
          <Button variant="outline" size="sm" className="gap-2">
            <Undo2 className="h-4 w-4" />
            <span className="hidden sm:inline">Undo</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Eraser className="h-4 w-4" />
            <span className="hidden sm:inline">Erase</span>
          </Button>
          <div className="flex items-center gap-2 rounded-lg border bg-secondary/50 px-3 py-2">
            <PenLine className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm hidden sm:inline">Notes</span>
            <Switch checked={notesMode} onCheckedChange={setNotesMode} />
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Lightbulb className="h-4 w-4" />
            <span className="hidden sm:inline">Hint</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
