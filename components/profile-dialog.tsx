"use client"

import { useState } from "react"
import { User, Trophy, Clock, Target, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useProfile, type DifficultyStats } from "@/lib/profile-context"
import { useSettings } from "@/lib/settings-context"
import type { Difficulty } from "@/lib/sudoku-engine"
import { createClient } from "@/lib/supabase/client"

function formatTime(seconds: number | null): string {
  if (seconds === null) return "--:--"
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

function StatCard({ title, value, icon: Icon, subtitle }: any) {
  return (
    <div className="bg-transparent border-t border-white/10 rounded-none py-4 flex items-center gap-4">
      <div className="p-3 bg-white/10 rounded-none">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-white/70 uppercase tracking-widest font-bold font-sans">{title}</p>
        <p className="text-xl font-bold font-mono text-white/90">{value}</p>
        {subtitle && <p className="text-[10px] text-white/50 uppercase font-sans tracking-wider">{subtitle}</p>}
      </div>
    </div>
  )
}

function DifficultyRow({ diff, stats }: { diff: string, stats: DifficultyStats }) {
  return (
    <div className="grid grid-cols-4 gap-2 text-sm py-2 border-b border-white/10 last:border-0 items-center">
      <div className="uppercase font-sans font-bold text-white/80">{diff}</div>
      <div className="text-center font-mono text-white/60">{stats.played}</div>
      <div className="text-center font-mono text-white/60">{stats.won}</div>
      <div className="text-right font-mono text-white/90">{formatTime(stats.bestTime)}</div>
    </div>
  )
}

export function ProfileDialog({ children }: { children?: React.ReactNode }) {
  const { settings } = useSettings()
  const { profile, user, updateUsername, resetProfile } = useProfile()
  const [isEditing, setIsEditing] = useState(!profile.username && !user)
  const [tempName, setTempName] = useState(profile.username)
  
  // Supabase Auth states
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState("")
  const [isLoginMode, setIsLoginMode] = useState(true)
  const supabase = createClient()

  const handleSaveGuest = () => {
    if (tempName.trim()) {
      updateUsername(tempName.trim())
      setIsEditing(false)
    }
  }

  const [confirmPassword, setConfirmPassword] = useState("")
  const [authSuccessMsg, setAuthSuccessMsg] = useState("")

  const handleSupabaseAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError("")
    setAuthSuccessMsg("")
    
    if (!isLoginMode) {
      if (password !== confirmPassword) {
        setAuthError("Passwords do not match.")
        setAuthLoading(false)
        return
      }
      if (password.length < 6) {
        setAuthError("Password must be at least 6 characters.")
        setAuthLoading(false)
        return
      }
    }

    try {
      let result;
      if (isLoginMode) {
        result = await supabase.auth.signInWithPassword({ email, password })
        if (result.error) throw result.error
        setIsEditing(false)
      } else {
        result = await supabase.auth.signUp({ email, password })
        if (result.error) throw result.error
        
        // Show success message for email verification
        if (result.data?.user && !result.data.session) {
          setAuthSuccessMsg("Account created! Please check your email for the verification link.")
        } else {
          setIsEditing(false)
        }
      }
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed")
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    resetProfile()
    setIsEditing(true)
  }

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all local progress and stats?")) {
      resetProfile()
      if (!user) {
        setIsEditing(true)
        setTempName("")
      }
    }
  }

  const [open, setOpen] = useState(false)

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      setIsEditing(!profile.username && !user)
      setTempName(profile.username)
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setAuthError("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <User className="h-5 w-5" />
            <span className="sr-only">Profile</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-black/30 border border-white/10 text-white shadow-2xl backdrop-blur-3xl rounded-none p-6 md:p-8">
        <DialogHeader>
          <DialogTitle className="font-sans text-xl tracking-[0.3em] uppercase font-bold text-center text-white/90">
            {settings.language === "ru" ? "Профиль" : "User Profile"}
          </DialogTitle>
          <DialogDescription className="text-center text-white/50 uppercase tracking-widest text-[10px]">
            {settings.language === "ru" ? "Статистика и настройки аккаунта" : "View your stats and manage account"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {isEditing && !user ? (
            <div className="space-y-6">
              {/* Auth Form */}
              <form onSubmit={handleSupabaseAuth} className="space-y-4">
                <h3 className="text-[10px] font-sans font-bold text-white/90 bg-black/40 border-y border-white/10 uppercase tracking-[0.2em] px-3 py-1.5 mb-4 shadow-sm">
                  {isLoginMode ? (settings.language === "ru" ? "Вход в аккаунт" : "Cloud Login") : (settings.language === "ru" ? "Создать аккаунт" : "Create Account")}
                </h3>
                {authError && <p className="text-xs text-destructive text-center">{authError}</p>}
                {authSuccessMsg && (
                  <div className="bg-white/10 border border-white/20 p-3 text-center rounded-none">
                    <p className="text-[10px] text-white/90 font-sans font-bold tracking-widest uppercase">{authSuccessMsg}</p>
                  </div>
                )}
                <Input
                  type="email"
                  placeholder={settings.language === "ru" ? "Адрес электронной почты" : "Email address"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-center h-10 rounded-none font-sans"
                  required
                />
                <Input
                  type="password"
                  placeholder={settings.language === "ru" ? "Пароль" : "Password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-center h-10 rounded-none font-sans"
                  required
                />
                {!isLoginMode && (
                  <Input
                    type="password"
                    placeholder={settings.language === "ru" ? "Подтвердите Пароль" : "Confirm Password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-center h-10 rounded-none font-sans"
                    required
                  />
                )}
                <Button 
                  type="submit"
                  className="w-full bg-white/10 text-white hover:bg-white/20 transition-colors h-10 uppercase tracking-[0.2em] text-xs rounded-none font-sans font-bold"
                  disabled={authLoading || !email || !password || (!isLoginMode && !confirmPassword)}
                >
                  {authLoading ? (settings.language === "ru" ? "Загрузка..." : "Processing...") : (isLoginMode ? (settings.language === "ru" ? "Войти" : "Sign In") : (settings.language === "ru" ? "Регистрация" : "Sign Up"))}
                </Button>
                <button 
                  type="button" 
                  onClick={() => setIsLoginMode(!isLoginMode)}
                  className="w-full text-[10px] text-white/50 hover:text-white uppercase tracking-widest mt-2 font-bold font-sans"
                >
                  {isLoginMode ? (settings.language === "ru" ? "Нет аккаунта? Создать" : "Need an account? Sign Up") : (settings.language === "ru" ? "Уже есть аккаунт? Войти" : "Already have an account? Sign In")}
                </button>
              </form>

              {/* Guest Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-sans font-bold">
                  <span className="bg-transparent px-2 text-white/50 tracking-widest backdrop-blur-sm">{settings.language === "ru" ? "Или играть локально" : "Or play locally"}</span>
                </div>
              </div>

              {/* Guest Form */}
              <div className="space-y-4">
                <Input
                  placeholder={settings.language === "ru" ? "Имя гостя..." : "Enter guest callsign..."}
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-center h-10 rounded-none font-sans"
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveGuest()}
                />
                <Button 
                  onClick={handleSaveGuest} 
                  variant="outline"
                  className="w-full bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:text-white transition-colors h-10 uppercase tracking-[0.2em] text-xs rounded-none font-sans font-bold"
                  disabled={!tempName.trim()}
                >
                  {settings.language === "ru" ? "Продолжить как гость" : "Continue as Guest"}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Profile Header */}
              <div className="flex justify-between items-center bg-transparent py-4 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-none bg-white/10 flex items-center justify-center font-sans font-bold text-xl text-white uppercase border border-white/20">
                    {profile.username?.charAt(0) || user?.email?.charAt(0) || "P"}
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-lg tracking-wider text-white/90">{profile.username || user?.email}</h3>
                    <p className="text-[10px] text-white/50 uppercase tracking-widest flex items-center gap-2 font-sans font-bold">
                      {user ? <span className="text-white/80">{settings.language === "ru" ? "Облачный профиль" : "Cloud Synced"}</span> : (settings.language === "ru" ? "Локальный профиль" : "Local Profile")}
                    </p>
                  </div>
                </div>
                {!user && (
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-white/50 hover:text-white rounded-none font-sans tracking-[0.2em] text-[10px] font-bold uppercase">
                    {settings.language === "ru" ? "Изменить" : "Edit"}
                  </Button>
                )}
              </div>

              {/* Main Stats */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard title="Games Won" value={profile.stats.totalGamesWon} icon={Trophy} subtitle={`Out of ${profile.stats.totalGamesPlayed} played`} />
                <StatCard title="Mistakes" value={profile.stats.totalMistakes} icon={AlertCircle} subtitle="Total errors made" />
              </div>

              {/* Detailed Stats */}
              <div className="bg-transparent border-t border-white/10 rounded-none py-4">
                <h3 className="text-[10px] font-sans font-bold text-white/90 bg-black/40 border-y border-white/10 uppercase tracking-[0.2em] px-3 py-1.5 mb-4 shadow-sm">
                  {settings.language === "ru" ? "СТАТИСТИКА ПО УРОВНЯМ" : "PERFORMANCE BY MODE"}
                </h3>
                <div className="grid grid-cols-4 gap-2 text-[10px] uppercase tracking-widest text-white/50 mb-2 px-1 font-sans font-bold">
                  <div>Mode</div>
                  <div className="text-center">Games</div>
                  <div className="text-center">Wins</div>
                  <div className="text-right">Best Time</div>
                </div>
                {(["easy", "medium", "hard", "expert"] as Difficulty[]).map(diff => (
                  <DifficultyRow key={diff} diff={diff} stats={profile.stats.difficulties[diff]} />
                ))}
              </div>

              <div className="pt-4 border-t border-white/10 flex gap-4">
                {user && (
                  <Button variant="outline" onClick={handleLogout} className="flex-1 rounded-none border border-white/20 text-white/70 hover:bg-white/10 hover:text-white text-xs uppercase tracking-[0.2em] font-sans font-bold h-12">
                    {settings.language === "ru" ? "Выйти" : "Sign Out"}
                  </Button>
                )}
                <Button variant="ghost" onClick={handleReset} className="flex-1 rounded-none bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:text-white transition-colors text-xs uppercase tracking-[0.2em] font-sans font-bold h-12">
                  {settings.language === "ru" ? "Сбросить статистику" : "Reset Stats"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
