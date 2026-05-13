"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ChevronRight, ChevronLeft, Home, Play, ArrowRight, CheckCircle2, Info, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { useSettings } from "@/lib/settings-context"

interface Step {
  title: string
  content: string
  interactive?: boolean
  demoGrid?: number[][]
}

const TUTORIAL_STEPS_EN: Step[] = [
  {
    title: "Welcome to adoku",
    content: "Sudoku is a logic-based number puzzle. The goal is to fill the grid so that every row, column, and box contains all digits from 1 to 9.",
  },
  {
    title: "The Grid",
    content: "The standard grid is 9x9, divided into nine 3x3 'boxes'. Let's look at one of these boxes.",
    interactive: true,
    demoGrid: [
      [5, 3, 0],
      [6, 0, 0],
      [0, 9, 8]
    ]
  },
  {
    title: "The Golden Rule",
    content: "Each digit (1-9) must appear exactly ONCE in each row, column, and 3x3 box. No duplicates allowed!",
  },
  {
    title: "Placing Numbers",
    content: "Select a cell, then tap a number to place it. If you're unsure, you can use 'Notes' mode to pencil in candidates.",
  },
  {
    title: "Spotting Mistakes",
    content: "Don't worry about mistakes! Adoku highlights conflicts in red if you enable auto-check. Correct answers become 'locked' and cannot be changed.",
  },
  {
    title: "Dopamine & Streaks",
    content: "Place numbers quickly and correctly to build your streak! High streaks multiply your points. Complete rows, columns, and boxes for big bonuses.",
  },
  {
    title: "You're Ready",
    content: "That's the basics. The best way to learn is to play. Ready to start your first puzzle?",
  }
]

const TUTORIAL_STEPS_RU: Step[] = [
  {
    title: "Добро пожаловать в adoku",
    content: "Судоку — это логическая головоломка. Цель — заполнить сетку так, чтобы каждая строка, столбец и блок содержали все цифры от 1 до 9.",
  },
  {
    title: "Сетка",
    content: "Стандартная сетка 9x9 разделена на девять блоков 3x3. Давайте посмотрим на один из таких блоков.",
    interactive: true,
    demoGrid: [
      [5, 3, 0],
      [6, 0, 0],
      [0, 9, 8]
    ]
  },
  {
    title: "Золотое Правило",
    content: "Каждая цифра (1-9) должна появляться ровно ОДИН РАЗ в каждой строке, столбце и блоке 3x3. Дубликаты запрещены!",
  },
  {
    title: "Размещение Чисел",
    content: "Выберите ячейку, затем нажмите на число, чтобы разместить его. Если вы не уверены, используйте режим 'Заметки'.",
  },
  {
    title: "Ошибки — это нормально",
    content: "Не бойтесь ошибаться! Adoku подсветит конфликты красным. Верные ответы блокируются и их нельзя изменить.",
  },
  {
    title: "Очки и Серии",
    content: "Ставьте числа быстро и правильно, чтобы копить серию! Высокая серия умножает очки. Завершайте ряды и блоки для бонусов.",
  },
  {
    title: "Вы Готовы",
    content: "Это основы. Лучший способ научиться — начать играть. Готовы к первой головоломке?",
  }
]

export default function TutorialApp() {
  const { settings } = useSettings()
  const [currentStep, setCurrentStep] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const steps = settings.language === "ru" ? TUTORIAL_STEPS_RU : TUTORIAL_STEPS_EN

  // Tutorial Music
  useEffect(() => {
    const audio = new Audio("/sounds/tutorial.mp3")
    audio.loop = true
    audio.volume = 0
    audioRef.current = audio

    const playAudio = () => {
      audio.play().then(() => {
        setIsPlaying(true)
        let vol = 0
        const interval = setInterval(() => {
          vol += 0.05
          if (vol >= 0.4) {
            audio.volume = 0.4
            clearInterval(interval)
          } else {
            audio.volume = vol
          }
        }, 100)
      }).catch(() => {
        const handleFirstClick = () => {
          playAudio()
          window.removeEventListener('click', handleFirstClick)
        }
        window.addEventListener('click', handleFirstClick)
      })
    }

    playAudio()

    return () => {
      let vol = audio.volume
      const interval = setInterval(() => {
        vol -= 0.05
        if (vol <= 0) {
          audio.volume = 0
          audio.pause()
          clearInterval(interval)
        } else {
          audio.volume = vol
        }
      }, 50)
    }
  }, [])

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden relative text-white">
      {/* Background gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-white/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 md:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
          <span className="font-serif text-2xl tracking-widest uppercase font-light">adoku</span>
          <span className="font-sans font-bold tracking-[0.2em] text-[10px] md:text-xs opacity-50 uppercase mt-1">
            {settings.language === "ru" ? "Обучение" : "Tutorial"}
          </span>
        </Link>
        <Link href="/">
          <Button variant="ghost" size="sm" className="rounded-xl gap-2 text-xs hover:bg-white/10 hover:text-white transition-colors">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">{settings.language === "ru" ? "Выйти" : "Exit"}</span>
          </Button>
        </Link>
      </header>

      {/* Main Tutorial Content */}
      <main className="flex-1 relative z-10 container max-w-4xl mx-auto flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Progress Indicator */}
          <div className="flex justify-center gap-1.5">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "h-[2px] transition-all duration-500",
                  i === currentStep ? "w-8 bg-white" : "w-4 bg-white/20"
                )} 
              />
            ))}
          </div>

          {/* Icon/Visual Area */}
          <div className="flex justify-center h-48 sm:h-64 items-center">
            {step.demoGrid ? (
              <div className="grid grid-cols-3 gap-[1px] p-2 bg-white/20 shadow-2xl scale-125">
                {step.demoGrid.flat().map((n, i) => (
                  <div key={i} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-black/40 text-xl font-serif text-white/90 shadow-inner">
                    {n !== 0 ? n : ""}
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 w-32 flex items-center justify-center border border-white/10 shadow-lg bg-black/20">
                {currentStep === 0 && <Info className="h-12 w-12 text-white/60" />}
                {currentStep === 2 && <CheckCircle2 className="h-12 w-12 text-white/60" />}
                {currentStep === 3 && <Play className="h-12 w-12 text-white/60" />}
                {currentStep === 4 && <Lightbulb className="h-12 w-12 text-white/60" />}
                {currentStep === 5 && <Play className="h-12 w-12 text-white/60 animate-bounce" />}
                {currentStep === 6 && <CheckCircle2 className="h-12 w-12 text-white/90 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />}
              </div>
            )}
          </div>

          {/* Text Content */}
          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-serif tracking-tight">{step.title}</h2>
            <p className="text-white/60 text-lg sm:text-xl font-light leading-relaxed font-sans">
              {step.content}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 pt-8 font-sans tracking-widest text-xs uppercase">
            <Button 
              variant="outline" 
              onClick={prevStep} 
              disabled={currentStep === 0}
              className="rounded-none h-12 px-6 border-white/20 bg-transparent hover:bg-white/10 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {settings.language === "ru" ? "Назад" : "Back"}
            </Button>

            {isLastStep ? (
              <Link href="/play">
                <Button size="lg" className="rounded-none h-12 px-10 gap-2 bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  {settings.language === "ru" ? "Начать Путешествие" : "Begin Journey"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <Button size="lg" onClick={nextStep} className="rounded-none h-12 px-10 gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20">
                {settings.language === "ru" ? "Далее" : "Next"}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 p-8 flex justify-center text-[10px] uppercase tracking-[0.2em] text-white/30 font-sans">
        {settings.language === "ru" 
          ? `Шаг ${currentStep + 1} из ${steps.length}`
          : `Step ${currentStep + 1} of ${steps.length}`}
      </footer>
    </div>
  )
}
