"use client"

import { useRouter } from "next/navigation"
import { Bell, User, TrafficCone as Traffic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { clearAuthToken } from "@/lib/auth"

interface HeaderProps {
  onThemeToggle: () => void
  darkMode: boolean
}

export default function Header({ onThemeToggle, darkMode }: HeaderProps) {
  const router = useRouter()

  const handleLogout = () => {
    clearAuthToken()
    router.push("/login")
  }

  return (
    <header className="border-b border-white/10 glass-effect sticky top-0 z-50">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/20 border border-accent/50">
            <Traffic className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Smart Traffic Management</h1>
            <p className="text-xs text-muted-foreground">Real-time monitoring & control</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative hover:bg-white/5">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#ff006e] rounded-full"></span>
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-white/5">
            <User className="w-5 h-5" />
          </Button>
          <Button onClick={handleLogout} className="bg-accent hover:bg-accent/90">
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
