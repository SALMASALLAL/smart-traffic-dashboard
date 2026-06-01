import { MapPin } from "lucide-react"

interface IntersectionCardProps {
  name: string
  trafficColor: "red" | "yellow" | "green"
  congestion: number
  cars: number
  status: "Normal" | "Moderate" | "Heavy" | "Critical"
  lastUpdate: string
  lanes: {
    north: "red" | "yellow" | "green"
    south: "red" | "yellow" | "green"
    east: "red" | "yellow" | "green"
    west: "red" | "yellow" | "green"
  }
}

export default function IntersectionCard({
  name,
  trafficColor,
  congestion,
  cars,
  status,
  lastUpdate,
  lanes,
}: IntersectionCardProps) {
  const getStatusStyle = (status: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      Normal: { bg: "rgba(0, 255, 65, 0.2)", border: "rgba(0, 255, 65, 0.5)", text: "#00ff41" },
      Moderate: { bg: "rgba(255, 255, 0, 0.2)", border: "rgba(255, 255, 0, 0.5)", text: "#ffff00" },
      Heavy: { bg: "rgba(255, 165, 0, 0.2)", border: "rgba(255, 165, 0, 0.5)", text: "#ffa500" },
      Critical: { bg: "rgba(255, 0, 110, 0.2)", border: "rgba(255, 0, 110, 0.5)", text: "#ff006e" },
    }
    return colors[status] || colors.Normal
  }

  const getTrafficLight = (color: string) => {
    switch (color) {
      case "red":
        return "traffic-glow-red"
      case "yellow":
        return "traffic-glow-yellow"
      case "green":
        return "traffic-glow-green"
      default:
        return ""
    }
  }

  const getLaneColor = (color: "red" | "yellow" | "green"): string => {
    if (color === "red") return "#ff006e"
    if (color === "yellow") return "#ffff00"
    return "#00ff41"
  }

  const getCongestionBarColor = (congestion: number): string => {
    if (congestion > 80) return "#ff006e"
    if (congestion > 60) return "#ffa500"
    if (congestion > 40) return "#ffff00"
    return "#00ff41"
  }

  const getCombinedNorthSouthSignal = (
    north: "red" | "yellow" | "green",
    south: "red" | "yellow" | "green",
  ): "red" | "yellow" | "green" => {
    if (north === "red" || south === "red") return "red"
    if (north === "yellow" || south === "yellow") return "yellow"
    return "green"
  }

  const statusStyle = getStatusStyle(status)
  const northSouthSignal = getCombinedNorthSouthSignal(lanes.north, lanes.south)

  return (
    <div className="glass-effect rounded-xl p-6 transition-all duration-300 group border-2 border-white/10 hover:border-accent/30">
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>Updated: {lastUpdate}</span>
          </div>
        </div>
        <div
          className="px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap"
          style={{
            backgroundColor: statusStyle.bg,
            borderColor: statusStyle.border,
            color: statusStyle.text,
          }}
        >
          {status}
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <div
          className={`w-20 h-20 ${getTrafficLight(trafficColor)} transition-all duration-300 group-hover:scale-110`}
        />
      </div>

      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Congestion Level</span>
          <span className="text-lg font-bold text-accent">{congestion}%</span>
        </div>
        <div
          className="w-full rounded-full h-2.5 border border-white/10 overflow-hidden"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${congestion}%`, backgroundColor: getCongestionBarColor(congestion) }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-5">
        <div
          className="rounded-lg p-4 border border-white/10 hover:border-accent/30 transition-colors text-center"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <p className="text-xs text-muted-foreground font-semibold uppercase mb-2 tracking-wider">Cars Detected</p>
          <p className="text-3xl font-bold" style={{ color: "#00ff41" }}>
            {cars}
          </p>
        </div>
        {/* <div
          className="rounded-lg p-4 border border-white/10 hover:border-accent/30 transition-colors"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <p className="text-xs text-muted-foreground font-semibold uppercase mb-2 tracking-wider">Avg Speed</p>
          <p className="text-3xl font-bold text-accent">{Math.max(5, 45 - congestion / 2).toFixed(0)}km/h</p>
        </div> */}
      </div>

      <div className="rounded-lg p-4 border border-white/10" style={{ background: "rgba(255,255,255,0.05)" }}>
        <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Signal Status</p>
        <div className="flex justify-center">
          <div className="rounded-2xl bg-[#0f1115] border border-white/10 px-5 py-4 shadow-[0_8px_28px_rgba(0,0,0,0.35)]">
            <div className="flex flex-row items-center gap-3">
              {(["red", "yellow", "green"] as const).map((color) => {
                const isActive = northSouthSignal === color
                return (
                  <div
                    key={color}
                    className="h-12 w-12 rounded-full border-4 border-[#2f333b] transition-all duration-300"
                    style={{
                      backgroundColor: getLaneColor(color),
                      opacity: isActive ? 1 : 0.25,
                      boxShadow: isActive ? `0 0 16px ${getLaneColor(color)}` : "none",
                    }}
                  />
                )
              })}
            </div>
            <span className="mt-2 block text-center text-xs font-semibold text-muted-foreground">N/S</span>
          </div>
        </div>
      </div>
    </div>
  )
}
