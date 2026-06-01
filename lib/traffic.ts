// Shared traffic-dashboard types, config, and helpers.
// Single source of truth for both the grid (data grouping) and the card (render).

export type RoadKey = "north_south" | "east_west"
export type TrafficMode = "red" | "yellow" | "green"
export type TrafficStatus = "Normal" | "Moderate" | "Heavy" | "Critical"

export type VehicleTypeCounts = {
  car: number
  truck: number
  bus: number
  motorcycle: number
  ambulance: number
  fire_truck: number
}

// Signal timings are identified by `direction`.
export type SignalTimingRecord = {
  id: number
  direction: string
  traffic_mode?: string
  traffic_flow?: number
  green_time?: number
  yellow_time?: number
  red_time?: number
  timestamp: string
}

// Cognition records are identified by `camera_id` (no direction).
export type CognitionRecord = {
  id: number
  camera_id: number
  vehicle_count: number
  congestion_level: number
  timestamp: string
  vehicle_types?: Partial<VehicleTypeCounts>
}

export type RoadConfig = {
  key: RoadKey
  label: string
  cameraId: number
}

// Road config is the source of truth for the rendered card list.
export const ROAD_CONFIG: RoadConfig[] = [
  { key: "north_south", label: "North-South", cameraId: 1 },
  { key: "east_west", label: "East-West", cameraId: 2 },
]

// Cognition records carry only camera_id, so map camera -> road direction.
export const CAMERA_DIRECTION_MAP: Record<number, RoadKey> = {
  1: "north_south",
  2: "east_west",
}

export const DEFAULT_VEHICLE_TYPES: VehicleTypeCounts = {
  car: 0,
  truck: 0,
  bus: 0,
  motorcycle: 0,
  ambulance: 0,
  fire_truck: 0,
}

// Object key is also the React key for each vehicle-type box.
export const VEHICLE_TYPE_LABELS: Record<keyof VehicleTypeCounts, string> = {
  car: "Car",
  truck: "Truck",
  bus: "Bus",
  motorcycle: "Motorcycle",
  ambulance: "Ambulance",
  fire_truck: "Fire Truck",
}

// Canonical direction key. Maps every spelling to the same internal key:
//   "north_south" | "North-South" | "North South" -> "north_south"
//   "east_west"   | "East-West"   | "East West"   -> "east_west"
export const normalizeDirection = (direction?: string): string => {
  if (!direction) return ""
  return String(direction)
    .trim()
    .toLowerCase()
    .replace(/-/g, "_")
    .replace(/\s+/g, "_")
}

// The active light comes ONLY from signalTiming.traffic_mode. Anything missing
// or unrecognized falls back to "red".
export function normalizeTrafficMode(mode?: string): TrafficMode {
  const value = String(mode ?? "").trim().toLowerCase()
  if (value === "green") return "green"
  if (value === "yellow") return "yellow"
  return "red"
}

// Map a sparse vehicle_types object (the API omits zero counts) onto a full
// object with every type present, defaulting to 0.
export function normalizeVehicleTypes(types?: Partial<VehicleTypeCounts>): VehicleTypeCounts {
  return { ...DEFAULT_VEHICLE_TYPES, ...(types ?? {}) }
}

// Congestion level (0..4) -> percentage for the progress bar. 0 stays 0.
export function getCongestionPercent(level: number): number {
  if (!level || level <= 0) return 0
  const normalized = Math.max(1, Math.min(4, level))
  const map: Record<number, number> = { 1: 25, 2: 50, 3: 75, 4: 95 }
  return map[normalized] ?? 0
}

export function getStatus(congestionPercent: number): TrafficStatus {
  if (congestionPercent > 80) return "Critical"
  if (congestionPercent > 60) return "Heavy"
  if (congestionPercent > 40) return "Moderate"
  return "Normal"
}

export function getTimestampMs(timestamp?: string): number {
  if (!timestamp) return 0
  const value = new Date(timestamp).getTime()
  return Number.isNaN(value) ? 0 : value
}

export function getRelativeTime(timestamp?: string): string {
  if (!timestamp) return "—"
  const diffMs = Date.now() - getTimestampMs(timestamp)
  if (getTimestampMs(timestamp) === 0 || diffMs < 0) return "now"

  const seconds = Math.floor(diffMs / 1000)
  if (seconds < 60) return "now"

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
