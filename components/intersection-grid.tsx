"use client"

import { useState, useEffect } from "react"
import IntersectionCard from "@/components/intersection-card"

export default function IntersectionGrid() {
  const [intersections, setIntersections] = useState([
    {
      id: 1,
      name: "Intersection A",
      trafficColor: "green" as const,
      congestion: 25,
      cars: 12,
      status: "Normal" as const,
      lastUpdate: "2 min ago",
      lanes: { north: 8, south: 4, east: 12, west: 6 },
    },
    {
      id: 2,
      name: "Intersection B",
      trafficColor: "red" as const,
      congestion: 85,
      cars: 48,
      status: "Critical" as const,
      lastUpdate: "1 min ago",
      lanes: { north: 35, south: 28, east: 42, west: 31 },
    },
    {
      id: 3,
      name: "Intersection C",
      trafficColor: "yellow" as const,
      congestion: 55,
      cars: 32,
      status: "Heavy" as const,
      lastUpdate: "3 min ago",
      lanes: { north: 18, south: 22, east: 25, west: 15 },
    },
    {
      id: 4,
      name: "Intersection D",
      trafficColor: "green" as const,
      congestion: 35,
      cars: 18,
      status: "Moderate" as const,
      lastUpdate: "2 min ago",
      lanes: { north: 10, south: 8, east: 15, west: 12 },
    },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setIntersections((prev) =>
        prev.map((intersection) => ({
          ...intersection,
          congestion: Math.max(0, Math.min(100, intersection.congestion + (Math.random() - 0.5) * 10)),
          cars: Math.max(5, Math.min(50, intersection.cars + Math.floor((Math.random() - 0.5) * 6))),
          lastUpdate: "now",
          trafficColor: intersection.congestion > 80 ? "red" : intersection.congestion > 55 ? "yellow" : "green",
          status:
            intersection.congestion > 80
              ? "Critical"
              : intersection.congestion > 60
                ? "Heavy"
                : intersection.congestion > 40
                  ? "Moderate"
                  : "Normal",
        })),
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {intersections.map((intersection) => (
        <IntersectionCard
          key={intersection.id}
          name={intersection.name}
          trafficColor={intersection.trafficColor}
          congestion={Math.round(intersection.congestion)}
          cars={intersection.cars}
          status={intersection.status}
          lastUpdate={intersection.lastUpdate}
          lanes={intersection.lanes}
        />
      ))}
    </div>
  )
}
