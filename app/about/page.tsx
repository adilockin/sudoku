"use client"

import Link from "next/link"
import { useSettings } from "@/lib/settings-context"
import { ArrowLeft, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  const { settings } = useSettings()

  return (
    <div className="relative min-h-screen flex flex-col bg-background text-white overflow-hidden font-sans">
      {/* Background aesthetic */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-white/5 rounded-full blur-[120px]" />
        <div className="absolute top-[10%] right-[-10%] w-[40vw] h-[40vw] bg-white/5 rounded-full blur-[100px]" />
      </div>

      <header className="relative z-10 p-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
          <span className="font-serif text-2xl tracking-widest uppercase font-light">adoku</span>
        </Link>
        <Link href="/">
          <Button variant="ghost" size="sm" className="rounded-xl gap-2 text-xs hover:bg-white/10 hover:text-white transition-colors uppercase tracking-widest">
            <ArrowLeft className="h-4 w-4" />
            {settings.language === "ru" ? "Назад" : "Back"}
          </Button>
        </Link>
      </header>

      <main className="flex-1 relative z-10 container max-w-2xl mx-auto flex flex-col items-center justify-center p-8 text-center space-y-12">
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-4xl md:text-5xl font-serif tracking-tight uppercase tracking-[0.2em] opacity-90">
            {settings.language === "ru" ? "Об Adoku" : "About Adoku"}
          </h2>
          
          <div className="w-12 h-[1px] bg-white/20 mx-auto"></div>

          <div className="space-y-8 text-lg md:text-xl font-light text-white/60 leading-relaxed font-sans">
            <p>
              {settings.language === "ru" 
                ? "Adoku — это пространство для концентрации и спокойствия. Мы создали этот проект, чтобы классическая игра в Судоку обрела новую жизнь в современном, минималистичном исполнении."
                : "Adoku is a space for focus and tranquility. We created this project to bring classic Sudoku to life in a modern, minimalist form."}
            </p>

            <p>
              {settings.language === "ru" 
                ? "Приятный, глубокий интерфейс с эффектом матового стекла и мягкое музыкальное сопровождение помогут вам полностью погрузиться в процесс решения задач, отвлекаясь от повседневной суеты."
                : "A pleasant, deep interface with a frosted glass effect and soft musical accompaniment will help you fully immerse yourself in the puzzle-solving process, distracting you from the daily hustle and bustle."}
            </p>

            <p>
              {settings.language === "ru" 
                ? "Наша цель — сделать тренировку мозга не только полезной, но и эстетически приятной. Каждая деталь интерфейса и каждый звук были тщательно подобраны для вашего комфорта."
                : "Our goal is to make brain training not only useful but also aesthetically pleasing. Every detail of the interface and every sound has been carefully selected for your comfort."}
            </p>
          </div>
        </div>

        <div className="pt-12 opacity-30 flex flex-col items-center gap-2">
          <Heart className="h-5 w-5 animate-pulse" />
          <p className="text-[10px] uppercase tracking-[0.3em]">
            {settings.language === "ru" ? "Сделано с любовью" : "Made with love"}
          </p>
        </div>
      </main>

      <footer className="relative z-10 p-8 flex justify-center text-[10px] uppercase tracking-[0.2em] text-white/20">
        © 2026 adoku project
      </footer>
    </div>
  )
}
