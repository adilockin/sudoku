"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import { useSettings } from "@/lib/settings-context"

export default function LandingPage() {
  const { theme, setTheme } = useTheme()
  const { settings } = useSettings()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (theme !== 'dark') {
      setTheme('dark')
    }
  }, [theme, setTheme])

  if (!mounted) return null

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden text-white bg-transparent">
      {/* Navbar exactly like ATMOS */}
      <header className="absolute top-0 left-0 w-full flex justify-between items-center p-8 z-20">
        <div className="flex items-end gap-1 opacity-60">
          <div className="w-[1px] h-3 bg-white animate-pulse"></div>
          <div className="w-[1px] h-4 bg-white animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-[1px] h-5 bg-white animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          <div className="w-[1px] h-3 bg-white animate-pulse" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-[1px] h-2 bg-white animate-pulse" style={{ animationDelay: '0.3s' }}></div>
          <div className="w-[1px] h-1 bg-white opacity-50 ml-1"></div>
          <div className="w-[1px] h-1 bg-white opacity-50"></div>
          <div className="w-[1px] h-1 bg-white opacity-50"></div>
        </div>
        
        <h1 className="font-serif text-3xl tracking-widest uppercase font-light">
          adoku
        </h1>
        
        <Link href="/about" className="text-sm font-sans tracking-wide hover:opacity-70 transition-opacity uppercase tracking-widest">
          {settings.language === "ru" ? "О Нас" : "About"}
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 pt-20 gap-6">
        <Link href="/play" className="group">
          <p className="font-serif text-2xl md:text-3xl tracking-[0.2em] uppercase text-white/80 group-hover:text-white transition-colors duration-300">
            {settings.language === "ru" ? "Нажмите чтобы начать" : "Click to start"}
          </p>
        </Link>
        <Link href="/tutorial" className="group">
          <p className="font-sans text-xs md:text-sm tracking-widest uppercase text-white/50 group-hover:text-white transition-colors duration-300">
            {settings.language === "ru" ? "Обучение" : "Tutorial"}
          </p>
        </Link>
      </main>

      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-white/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[40vw] h-[40vw] bg-white/5 rounded-full blur-[100px]" />
        
        {/* Fireflies */}
        <div className="absolute w-1 h-1 bg-white rounded-full top-[20%] left-[30%] blur-[1px] animate-firefly opacity-40 performance-gpu"></div>
        <div className="absolute w-1.5 h-1.5 bg-white rounded-full top-[45%] left-[60%] blur-[1px] animate-firefly-delayed animate-twinkle opacity-40 performance-gpu"></div>
        <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-[70%] left-[15%] animate-firefly-fast opacity-40 performance-gpu"></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-[10%] left-[80%] blur-[1px] animate-firefly opacity-40 performance-gpu"></div>
        <div className="absolute w-1.5 h-1.5 bg-white rounded-full top-[30%] left-[90%] blur-[1px] animate-firefly animate-twinkle opacity-40 performance-gpu"></div>
      </div>
    </div>
  )
}
