"use client"

import { useState, useEffect } from "react"
import IntersectionCard from "@/components/intersection-card"
import { getAccessToken, getTokenType } from "@/lib/auth"

type Intersection = {
  id: number
  name: string
  trafficColor: "red" | "yellow" | "green"
  congestion: number
  cars: number
  status: "Normal" | "Moderate" | "Heavy" | "Critical"
  lastUpdate: string
  lanes: { north: number; south: number; east: number; west: number }
}

type DetectionRecord = {
  id: number
  camera_id: number
  vehicle_count: number
  congestion_level: number
  timestamp: string
}

const API_URL = "https://judgingly-cicatrisant-milly.ngrok-free.dev/traffic/cognition-records?limit=20"

function getCongestionFromLevel(level: number) {
  const normalized = Math.max(1, Math.min(4, level))
  const map: Record<number, number> = {
    1: 25,
    2: 50,
    3: 75,
    4: 95,
  }

  return map[normalized]
}

function getTrafficColor(congestion: number): "red" | "yellow" | "green" {
  if (congestion > 80) return "red"
  if (congestion > 55) return "yellow"
  return "green"
}

function getStatus(congestion: number): "Normal" | "Moderate" | "Heavy" | "Critical" {
  if (congestion > 80) return "Critical"
  if (congestion > 60) return "Heavy"
  if (congestion > 40) return "Moderate"
  return "Normal"
}

function getLaneSplit(cars: number) {
  const safeCars = Math.max(0, cars)
  const north = Math.max(1, Math.round(safeCars * 0.3))
  const south = Math.max(1, Math.round(safeCars * 0.25))
  const east = Math.max(1, Math.round(safeCars * 0.3))
  const west = Math.max(1, safeCars - north - south - east)

  return { north, south, east, west }
}

function getRelativeTime(timestamp: string) {
  const date = new Date(timestamp)
  const diffMs = Date.now() - date.getTime()

  if (Number.isNaN(diffMs) || diffMs < 0) {
    return "now"
  }

  const seconds = Math.floor(diffMs / 1000)
  if (seconds < 60) return "now"

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function IntersectionGrid() {
  const [intersections, setIntersections] = useState<Intersection[]>([
    {
      id: 1,
      name: "North-South",
      trafficColor: "green" as const,
      congestion: 25,
      cars: 12,
      status: "Normal" as const,
      lastUpdate: "2 min ago",
      lanes: { north: 8, south: 4, east: 12, west: 6 },
    },
    {
      id: 2,
      name: "East-West",
      trafficColor: "red" as const,
      congestion: 85,
      cars: 48,
      status: "Critical" as const,
      lastUpdate: "1 min ago",
      lanes: { north: 35, south: 28, east: 42, west: 31 },
    },
  ])

  useEffect(() => {
    let isMounted = true

    const fetchDetectionRecords = async () => {
      try {
        const accessToken = getAccessToken()
        const tokenType = getTokenType() ?? "bearer"
        const headers: HeadersInit = {
          Accept: "application/json",
        }

        if (accessToken) {
          headers.Authorization = `${tokenType} ${accessToken}`
        }

        const response = await fetch(API_URL, {
          method: "GET",
          headers,
          cache: "no-store",
        })

        if (!response.ok) {
          return
        }

        const records: DetectionRecord[] = await response.json()
        if (!Array.isArray(records) || records.length === 0) {
          return
        }

        const latestByCamera = new Map<number, DetectionRecord>()
        for (const record of records) {
          if (!latestByCamera.has(record.camera_id)) {
            latestByCamera.set(record.camera_id, record)
          }
        }

        const latestTwo = [...latestByCamera.values()].slice(0, 2)
        if (latestTwo.length === 0 || !isMounted) {
          return
        }

        const nextIntersections: Intersection[] = latestTwo.map((record, index) => {
          const congestion = getCongestionFromLevel(record.congestion_level)
          const cars = Math.max(0, record.vehicle_count)

          return {
            id: index + 1,
            name: `Intersection ${index === 0 ? "A" : "B"}`,
            trafficColor: getTrafficColor(congestion),
            congestion,
            cars,
            status: getStatus(congestion),
            lastUpdate: getRelativeTime(record.timestamp),
            lanes: getLaneSplit(cars),
          }
        })

        if (nextIntersections.length === 1) {
          nextIntersections.push({
            ...nextIntersections[0],
            id: 2,
            name: "Intersection B",
          })
        }

        setIntersections(nextIntersections)
      } catch {
        // Keep the previous UI state if the API is temporarily unavailable.
      }
    }

    fetchDetectionRecords()
    const interval = setInterval(fetchDetectionRecords, 5000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
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
