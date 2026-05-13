"use client"

import { Sun, Moon, User, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "next-themes"
import Link from "next/link"
import { SettingsDialog } from "@/components/settings-dialog"

export function Navbar() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="glass-nav sticky top-0 z-50 w-full">
      <div className="container flex h-14 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/90 shadow-lg shadow-primary/20" style={{ transform: 'perspective(400px) rotateY(-3deg)' }}>
            <Leaf className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">adoku</span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          <SettingsDialog />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9 rounded-xl"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
            <AvatarImage src="/avatar.png" alt="User avatar" />
            <AvatarFallback className="bg-secondary/60 backdrop-blur-sm">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}

