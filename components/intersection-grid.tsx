"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import IntersectionCard from "@/components/intersection-card"
import { getAccessToken, getTokenType, clearAuthToken } from "@/lib/auth"
import {
  type CognitionRecord,
  type SignalTimingRecord,
  CAMERA_DIRECTION_MAP,
  ROAD_CONFIG,
  getTimestampMs,
  normalizeDirection,
} from "@/lib/traffic"

const COGNITION_API_URL = "/api/cognition-records?limit=100"
const SIGNAL_API_URL = "/api/traffic/signal-timings?limit=50"

// Latest signal timing per direction. Signal records are identified by their
// own `direction` field — camera_id is never used here.
function groupSignalTimingsByDirection(signalTimings: SignalTimingRecord[]): Record<string, SignalTimingRecord> {
  return signalTimings.reduce<Record<string, SignalTimingRecord>>((acc, item) => {
    const directionKey = normalizeDirection(item?.direction)
    if (!directionKey) return acc

    const existing = acc[directionKey]
    if (!existing || getTimestampMs(item.timestamp) > getTimestampMs(existing.timestamp)) {
      acc[directionKey] = item
    }

    return acc
  }, {})
}

// Latest cognition record per direction, mapped from camera_id. A camera that is
// not in the map (or absent) leaves that direction empty — never duplicated.
function groupCognitionRecordsByDirection(cognitionRecords: CognitionRecord[]): Record<string, CognitionRecord> {
  return cognitionRecords.reduce<Record<string, CognitionRecord>>((acc, item) => {
    const directionKey = CAMERA_DIRECTION_MAP[item?.camera_id]
    if (!directionKey) return acc

    const existing = acc[directionKey]
    if (!existing || getTimestampMs(item.timestamp) > getTimestampMs(existing.timestamp)) {
      acc[directionKey] = item
    }

    return acc
  }, {})
}

export default function IntersectionGrid() {
  const router = useRouter()
  const [signalTimingsByDirection, setSignalTimingsByDirection] = useState<Record<string, SignalTimingRecord>>({})
  const [cognitionRecordsByDirection, setCognitionRecordsByDirection] = useState<Record<string, CognitionRecord>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    let intervalId: ReturnType<typeof setInterval> | null = null

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    }

    // Session is invalid/expired: stop hammering the API, surface a clear
    // message and send the user back to the login screen.
    const handleUnauthorized = () => {
      if (!isMounted) return
      stopPolling()
      setError("Unauthorized: check login/session/API token")
      setLoading(false)
      clearAuthToken()
      router.replace("/login")
    }

    const fetchTrafficData = async () => {
      if (!isMounted) return
      setError(null)

      const accessToken = getAccessToken()
      if (!accessToken) {
        handleUnauthorized()
        return
      }

      const tokenType = getTokenType() ?? "bearer"
      const headers: HeadersInit = {
        Accept: "application/json",
        Authorization: `${tokenType} ${accessToken}`,
      }

      try {
        const [cognitionResponse, signalResponse] = await Promise.all([
          fetch(`${COGNITION_API_URL}&_t=${Date.now()}`, { method: "GET", headers, cache: "no-store" }),
          fetch(`${SIGNAL_API_URL}&_t=${Date.now()}`, { method: "GET", headers, cache: "no-store" }),
        ])

        if (!isMounted) return

        // A 401 from either endpoint means the token is missing/expired.
        if (cognitionResponse.status === 401 || signalResponse.status === 401) {
          handleUnauthorized()
          return
        }

        if (!cognitionResponse.ok && !signalResponse.ok) {
          setError("Unable to load traffic data")
          setLoading(false)
          return
        }

        const cognitionRecords: CognitionRecord[] = cognitionResponse.ok
          ? await cognitionResponse.json().then((body) => (Array.isArray(body) ? body : []))
          : []
        const signalTimings: SignalTimingRecord[] = signalResponse.ok
          ? await signalResponse.json().then((body) => (Array.isArray(body) ? body : []))
          : []

        if (!isMounted) return

        setSignalTimingsByDirection(groupSignalTimingsByDirection(signalTimings))
        setCognitionRecordsByDirection(groupCognitionRecordsByDirection(cognitionRecords))
        setLoading(false)
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : "Unable to load traffic data")
        setLoading(false)
      }
    }

    fetchTrafficData()
    intervalId = setInterval(fetchTrafficData, 5000)

    return () => {
      isMounted = false
      stopPolling()
    }
  }, [router])

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/15 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {ROAD_CONFIG.map((road) => {
          const roadKey = normalizeDirection(road.key)
          // Signal data by direction; cognition data by camera_id -> direction.
          const signalTiming = signalTimingsByDirection[roadKey] ?? null
          const cognitionRecord = cognitionRecordsByDirection[roadKey] ?? null

          return (
            <IntersectionCard
              key={roadKey}
              road={road}
              signalTiming={signalTiming}
              cognitionRecord={cognitionRecord}
            />
          )
        })}
      </div>
    </div>
  )
}
