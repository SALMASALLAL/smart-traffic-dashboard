"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import IntersectionGrid from "@/components/intersection-grid"
import MapAndAlerts from "@/components/map-and-alerts"
import ControlBar from "@/components/control-bar"

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header onThemeToggle={() => setDarkMode(!darkMode)} darkMode={darkMode} />

      <main className="p-6 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">Active Intersections</h2>
            <IntersectionGrid />
          </div>

          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">City Monitor</h2>
            <MapAndAlerts />
          </div>
        </div>
      </main>

      <ControlBar />
    </div>
  )
}
