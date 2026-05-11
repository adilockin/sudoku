"use client"

import { Timer, Heart, Sparkles, Send } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function RightColumn() {
  return (
    <div className="space-y-6">
      {/* Game Stats Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Game Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Timer className="h-5 w-5" />
              <span className="text-sm">Time</span>
            </div>
            <span className="text-3xl font-bold font-mono tracking-tight">04:32</span>
          </div>

          {/* Difficulty */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Difficulty</span>
            <Badge className="bg-destructive/80 text-destructive-foreground hover:bg-destructive/80">
              Hard
            </Badge>
          </div>

          {/* Mistakes */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Mistakes</span>
            <div className="flex items-center gap-1">
              <Heart className="h-5 w-5 fill-destructive text-destructive" />
              <Heart className="h-5 w-5 fill-destructive text-destructive" />
              <Heart className="h-5 w-5 text-muted-foreground/30" />
              <span className="ml-2 text-sm font-medium">1/3</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Coach Card - Premium Feature */}
      <Card className="relative overflow-hidden border-primary/30">
        {/* Glowing border effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 opacity-50 blur-sm pointer-events-none" />
        
        <CardHeader className="pb-3 relative">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Coach
            <Badge variant="secondary" className="text-xs ml-auto">
              PRO
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div className="rounded-lg bg-secondary/70 p-4 border border-border/50">
            <p className="text-sm leading-relaxed">
              <span className="font-semibold text-primary">AI Coach:</span>{" "}
              Based on row 4, the number 7 can only be placed in the top right cell of this 3×3 block.
            </p>
          </div>
          <Button 
            variant="outline" 
            className="w-full gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50"
          >
            <Sparkles className="h-4 w-4" />
            Ask AI
          </Button>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button 
        size="lg" 
        className="w-full gap-2 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/25"
      >
        <Send className="h-5 w-5" />
        Submit Solution
      </Button>
    </div>
  )
}
