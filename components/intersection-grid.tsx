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
  vehicleCounts: {
    bus: number
    motorcycle: number
    truck: number
    fireTruck: number
    ambulance: number
  }
  status: "Normal" | "Moderate" | "Heavy" | "Critical"
  lastUpdate: string
  lanes: { north: "red" | "yellow" | "green"; south: "red" | "yellow" | "green"; east: "red" | "yellow" | "green"; west: "red" | "yellow" | "green" }
  signalTiming?: SignalTimingRecord
}

type DetectionRecord = {
  id: number
  camera_id: number
  vehicle_count: number
  congestion_level: number
  timestamp: string
  vehicle_types?: {
    bus?: number
    motorcycle?: number
    truck?: number
    fire_truck?: number
    ambulance?: number
  }
}

type SignalTimingRecord = {
  id: number
  green_time: number
  red_time: number
  yellow_time: number
  direction: string
  timestamp: string
}

type LiveTrafficState = {
  detections: DetectionRecord[]
  signalTimings: Record<string, SignalTimingRecord | undefined>
}

const API_URL = "/api/traffic/cognition-records?limit=20"
const SIGNAL_API_URL = "/api/traffic/signal-timings"

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

function getSignalColorFromTiming(record: SignalTimingRecord, nowMs: number = Date.now()): "red" | "yellow" | "green" {
  const green = Math.max(0, record.green_time)
  const yellow = Math.max(0, record.yellow_time)
  const red = Math.max(0, record.red_time)
  const cycle = green + yellow + red

  if (cycle <= 0) {
    return "red"
  }

  const startMs = getTimestampMs(record.timestamp)
  if (startMs <= 0) {
    if (red >= green && red >= yellow) return "red"
    if (yellow >= green && yellow >= red) return "yellow"
    return "green"
  }

  const elapsedSeconds = Math.floor((nowMs - startMs) / 1000)
  const phase = ((elapsedSeconds % cycle) + cycle) % cycle

  if (phase < green) {
    return "green"
  }

  if (phase < green + yellow) {
    return "yellow"
  }

  return "red"
}

function getDynamicTrafficFactorFromSignal(timing?: SignalTimingRecord, nowMs: number = Date.now()) {
  if (!timing) {
    return 1
  }

  const green = Math.max(0, timing.green_time)
  const yellow = Math.max(0, timing.yellow_time)
  const red = Math.max(0, timing.red_time)
  const cycle = green + yellow + red

  if (cycle <= 0) {
    return 1
  }

  const startMs = getTimestampMs(timing.timestamp)
  if (startMs <= 0) {
    return 1
  }

  const elapsedSeconds = Math.floor((nowMs - startMs) / 1000)
  const phase = ((elapsedSeconds % cycle) + cycle) % cycle

  if (phase < green) {
    const progress = green > 0 ? phase / green : 1
    return 1.15 - 0.45 * progress
  }

  if (phase < green + yellow) {
    const offset = phase - green
    const progress = yellow > 0 ? offset / yellow : 1
    return 0.75 + 0.15 * progress
  }

  const offset = phase - green - yellow
  const progress = red > 0 ? offset / red : 1
  return 0.9 + 0.45 * progress
}

function getDynamicCarsFromSignal(baseCars: number, timing?: SignalTimingRecord, nowMs: number = Date.now()) {
  const safeBase = Math.max(0, baseCars)
  const factor = getDynamicTrafficFactorFromSignal(timing, nowMs)

  return Math.max(0, Math.round(safeBase * factor))
}

function getDynamicVehicleCounts(
  baseCounts: { bus: number; motorcycle: number; truck: number; fireTruck: number; ambulance: number },
  timing?: SignalTimingRecord,
  nowMs: number = Date.now(),
) {
  const factor = getDynamicTrafficFactorFromSignal(timing, nowMs)
  return {
    bus: Math.max(0, Math.round(baseCounts.bus * factor)),
    motorcycle: Math.max(0, Math.round(baseCounts.motorcycle * factor)),
    truck: Math.max(0, Math.round(baseCounts.truck * factor)),
    fireTruck: Math.max(0, Math.round(baseCounts.fireTruck * factor)),
    ambulance: Math.max(0, Math.round(baseCounts.ambulance * factor)),
  }
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

function getTimestampMs(timestamp: string) {
  const value = new Date(timestamp).getTime()
  return Number.isNaN(value) ? 0 : value
}

function normalizeDirection(direction: string) {
  return direction.trim().toLowerCase().replace(/[_\s]+/g, "-")
}

function getSignalTimingForDirection(liveState: LiveTrafficState, direction: string) {
  return liveState.signalTimings[normalizeDirection(direction)]
}

function buildIntersections(liveState: LiveTrafficState, nowMs: number): Intersection[] {
  const northSouthTiming = getSignalTimingForDirection(liveState, "North-South")
  const eastWestTiming = getSignalTimingForDirection(liveState, "East-West")
  const northSouthSignal = northSouthTiming ? getSignalColorFromTiming(northSouthTiming, nowMs) : "green"
  const eastWestSignal = eastWestTiming ? getSignalColorFromTiming(eastWestTiming, nowMs) : "red"

  // Build two intersections per latest detection: North-South and East-West
  const latest = liveState.detections.slice(0, 1)
  if (latest.length === 0) return []

  const record = latest[0]
  const congestion = getCongestionFromLevel(record.congestion_level)
  const baseCars = Math.max(0, record.vehicle_count)
  const nsCars = getDynamicCarsFromSignal(baseCars, northSouthTiming, nowMs)
  const ewCars = getDynamicCarsFromSignal(baseCars, eastWestTiming, nowMs)

  const baseVehicleCounts = {
    bus: Math.max(0, record.vehicle_types?.bus ?? Math.round(baseCars * 0.1)),
    motorcycle: Math.max(0, record.vehicle_types?.motorcycle ?? Math.round(baseCars * 0.35)),
    truck: Math.max(0, record.vehicle_types?.truck ?? Math.round(baseCars * 0.12)),
    fireTruck: Math.max(0, record.vehicle_types?.fire_truck ?? Math.round(baseCars * 0.01)),
    ambulance: Math.max(0, record.vehicle_types?.ambulance ?? Math.round(baseCars * 0.02)),
  }
  const nsVehicleCounts = getDynamicVehicleCounts(baseVehicleCounts, northSouthTiming, nowMs)
  const ewVehicleCounts = getDynamicVehicleCounts(baseVehicleCounts, eastWestTiming, nowMs)

  const nsLanes: Intersection["lanes"] = {
    north: northSouthSignal,
    south: northSouthSignal,
    east: "red",
    west: "red",
  }

  const ewLanes: Intersection["lanes"] = {
    north: "red",
    south: "red",
    east: eastWestSignal,
    west: eastWestSignal,
  }

  const nsIntersection: Intersection = {
    id: 1,
    name: "North-South",
    trafficColor: getTrafficColor(congestion),
    congestion,
    cars: nsCars,
    vehicleCounts: nsVehicleCounts,
    status: getStatus(congestion),
    lastUpdate: getRelativeTime(record.timestamp),
    lanes: nsLanes,
    signalTiming: northSouthTiming,
  }

  const ewIntersection: Intersection = {
    id: 2,
    name: "East-West",
    trafficColor: getTrafficColor(congestion),
    congestion,
    cars: Math.max(0, Math.round(ewCars * 0.9)),
    vehicleCounts: ewVehicleCounts,
    status: getStatus(congestion),
    lastUpdate: getRelativeTime(record.timestamp),
    lanes: ewLanes,
    signalTiming: eastWestTiming,
  }

  return [nsIntersection, ewIntersection]
}

export default function IntersectionGrid() {
  const [nowMs, setNowMs] = useState(Date.now())
  const [liveState, setLiveState] = useState<LiveTrafficState | null>(null)
  const [intersections, setIntersections] = useState<Intersection[]>([
    {
      id: 1,
      name: "North-South",
      trafficColor: "green" as const,
      congestion: 25,
      cars: 12,
      vehicleCounts: { bus: 2, motorcycle: 4, truck: 1, fireTruck: 0, ambulance: 0 },
      status: "Normal" as const,
      lastUpdate: "2 min ago",
      lanes: { north: "green", south: "green", east: "red", west: "red" },
      signalTiming: undefined,
    },
    {
      id: 2,
      name: "East-West",
      trafficColor: "red" as const,
      congestion: 30,
      cars: 8,
      vehicleCounts: { bus: 1, motorcycle: 2, truck: 1, fireTruck: 0, ambulance: 0 },
      status: "Moderate" as const,
      lastUpdate: "2 min ago",
      lanes: { north: "red", south: "red", east: "green", west: "green" },
      signalTiming: undefined,
    },
  ])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const ticker = setInterval(() => {
      setNowMs(Date.now())
    }, 1000)

    return () => {
      clearInterval(ticker)
    }
  }, [])

  useEffect(() => {
    if (!liveState) {
      return
    }

    setIntersections(buildIntersections(liveState, nowMs))
  }, [liveState, nowMs])

  useEffect(() => {
    let isMounted = true

    const fetchDetectionRecords = async () => {
      setLoading(true)
      setError(null)

      try {
        const accessToken = getAccessToken()
        if (!accessToken) {
          setLoading(false)
          setError("Missing authentication token")
          return
        }

        const tokenType = getTokenType() ?? "bearer"
        const headers: HeadersInit = {
          Accept: "application/json",
        }

        headers.Authorization = `${tokenType} ${accessToken}`

        const response = await fetch(`${API_URL}&_t=${Date.now()}`, {
          method: "GET",
          headers,
          cache: "no-store",
        })

        const signalResponse = await fetch(`${SIGNAL_API_URL}?_t=${Date.now()}`, {
          method: "GET",
          headers,
          cache: "no-store",
        })

        if (!response.ok) {
          setError("Unable to load detection records")
          setLoading(false)
          return
        }

        const records: DetectionRecord[] = await response.json()
        if (!Array.isArray(records) || records.length === 0) {
          setError("No detection records available")
          setLoading(false)
          return
        }

        const signalTimings: Record<string, SignalTimingRecord | undefined> = {}
        if (signalResponse.ok) {
          const signalBody = await signalResponse.json()
          const items = Array.isArray(signalBody) ? signalBody : []

          for (const item of items) {
            if (!item || typeof item !== "object" || typeof (item as any).direction !== "string") {
              continue
            }

            const record = item as SignalTimingRecord
            const key = normalizeDirection(record.direction)
            const existing = signalTimings[key]

            if (!existing || getTimestampMs(record.timestamp) > getTimestampMs(existing.timestamp)) {
              signalTimings[key] = record
            }
          }
        }

        const latestByCamera = new Map<number, DetectionRecord>()
        for (const record of records) {
          const existing = latestByCamera.get(record.camera_id)
          if (!existing || getTimestampMs(record.timestamp) > getTimestampMs(existing.timestamp)) {
            latestByCamera.set(record.camera_id, record)
          }
        }

        const latestOne = [...latestByCamera.values()]
          .sort((a, b) => getTimestampMs(b.timestamp) - getTimestampMs(a.timestamp))
          .slice(0, 1)
        if (latestOne.length === 0 || !isMounted) {
          setLoading(false)
          return
        }

        const nextLiveState: LiveTrafficState = {
          detections: latestOne,
          signalTimings,
        }

        setLiveState(nextLiveState)
        setIntersections(buildIntersections(nextLiveState, Date.now()))
        setLoading(false)
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unable to load traffic data")
        setLoading(false)
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
    <div className="grid grid-cols-2 gap-4 w-full">
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
          signalTiming={intersection.signalTiming}
        />
      ))}
    </div>
  )
}
