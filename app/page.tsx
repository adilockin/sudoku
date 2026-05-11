"use client"

import { Flame } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { LeftColumn } from "@/components/left-column"
import { SudokuBoard } from "@/components/sudoku-board"
import { RightColumn } from "@/components/right-column"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Mobile Streak Banner */}
      <div className="md:hidden flex items-center justify-center gap-2 py-3 bg-secondary/50 border-b">
        <Flame className="h-5 w-5 text-orange-500" />
        <span className="font-semibold">12 Days</span>
        <span className="text-muted-foreground text-sm">streak</span>
      </div>

      <main className="container px-4 py-6 md:py-8">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr_280px] xl:grid-cols-[300px_1fr_300px]">
          {/* Left Column - Hidden on mobile, shown on lg+ */}
          <aside className="hidden lg:block">
            <LeftColumn />
          </aside>

          {/* Center Column - Sudoku Board */}
          <div className="order-first lg:order-none">
            <SudokuBoard />
          </div>

          {/* Right Column */}
          <aside className="space-y-6">
            <RightColumn />
            
            {/* Mobile-only: Show left column content below right column */}
            <div className="lg:hidden">
              <LeftColumn />
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
