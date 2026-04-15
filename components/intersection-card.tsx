import { MapPin } from "lucide-react"

interface IntersectionCardProps {
  name: string
  trafficColor: "red" | "yellow" | "green"
  congestion: number
  cars: number
  status: "Normal" | "Moderate" | "Heavy" | "Critical"
  lastUpdate: string
  lanes: {
    north: number
    south: number
    east: number
    west: number
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

  const getLaneColor = (count: number): string => {
    if (count > 30) return "#ff006e"
    if (count > 20) return "#ffa500"
    if (count > 10) return "#ffff00"
    return "#00ff41"
  }

  const getCongestionBarColor = (congestion: number): string => {
    if (congestion > 80) return "#ff006e"
    if (congestion > 60) return "#ffa500"
    if (congestion > 40) return "#ffff00"
    return "#00ff41"
  }

  const statusStyle = getStatusStyle(status)

  return (
    <div className="glass-effect rounded-xl p-6 hover:border-accent/50 transition-all duration-300 group border-2 border-white/10 hover:border-accent/30">
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

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div
          className="rounded-lg p-4 border border-white/10 hover:border-accent/30 transition-colors"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <p className="text-xs text-muted-foreground font-semibold uppercase mb-2 tracking-wider">Cars Detected</p>
          <p className="text-3xl font-bold" style={{ color: "#00ff41" }}>
            {cars}
          </p>
        </div>
        <div
          className="rounded-lg p-4 border border-white/10 hover:border-accent/30 transition-colors"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <p className="text-xs text-muted-foreground font-semibold uppercase mb-2 tracking-wider">Avg Speed</p>
          <p className="text-3xl font-bold text-accent">{Math.max(5, 45 - congestion / 2).toFixed(0)}km/h</p>
        </div>
      </div>

      <div className="rounded-lg p-4 border border-white/10" style={{ background: "rgba(255,255,255,0.05)" }}>
        <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Lane Status</p>
        <div className="grid grid-cols-4 gap-2">
          {[lanes.north, lanes.south, lanes.east, lanes.west].map((count, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
              <div
                className="w-full h-10 rounded-md transition-opacity hover:opacity-100"
                style={{ backgroundColor: getLaneColor(count), opacity: 0.9 }}
              />
              <span className="text-xs font-semibold text-muted-foreground">{["N", "S", "E", "W"][idx]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
