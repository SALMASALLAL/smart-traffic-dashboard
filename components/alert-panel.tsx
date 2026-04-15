import { AlertTriangle, AlertCircle, Info, Zap } from "lucide-react"

interface Alert {
  id: number
  type: "warning" | "critical" | "info" | "maintenance"
  title: string
  message: string
  time: string
}

export default function AlertPanel() {
  const alerts: Alert[] = [
    {
      id: 1,
      type: "critical",
      title: "High Congestion",
      message: "Intersection B experiencing critical congestion",
      time: "1 min ago",
    },
    {
      id: 2,
      type: "warning",
      title: "Heavy Traffic",
      message: "Heavy traffic detected at Intersection C",
      time: "3 min ago",
    },
    {
      id: 3,
      type: "maintenance",
      title: "Signal Maintenance",
      message: "Camera offline at Zone 3",
      time: "5 min ago",
    },
    {
      id: 4,
      type: "info",
      title: "System Update",
      message: "Traffic patterns updated successfully",
      time: "10 min ago",
    },
  ]

  const getAlertStyle = (type: string) => {
    const styles: Record<string, { border: string; bg: string; icon: string }> = {
      critical: { border: "#ff006e", bg: "rgba(255, 0, 110, 0.1)", icon: "#ff006e" },
      warning: { border: "#ffa500", bg: "rgba(255, 165, 0, 0.1)", icon: "#ffa500" },
      maintenance: { border: "#ffff00", bg: "rgba(255, 255, 0, 0.1)", icon: "#ffff00" },
      info: { border: "#00ff41", bg: "rgba(0, 255, 65, 0.1)", icon: "#00ff41" },
    }
    return styles[type] || styles.info
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="w-4 h-4" style={{ color: "#ff006e" }} />
      case "warning":
        return <AlertCircle className="w-4 h-4" style={{ color: "#ffa500" }} />
      case "maintenance":
        return <Zap className="w-4 h-4" style={{ color: "#ffff00" }} />
      case "info":
        return <Info className="w-4 h-4" style={{ color: "#00ff41" }} />
      default:
        return null
    }
  }

  return (
    <div className="glass-effect rounded-xl p-4">
      <h3 className="text-sm font-semibold text-white mb-3">Real-time Alerts</h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {alerts.map((alert) => {
          const alertStyle = getAlertStyle(alert.type)
          return (
            <div
              key={alert.id}
              className="p-3 rounded-lg border-l-2 transition-all duration-300 hover:bg-white/10"
              style={{
                borderLeftColor: alertStyle.border,
                backgroundColor: alertStyle.bg,
              }}
            >
              <div className="flex items-start gap-2">
                <div className="mt-1">{getAlertIcon(alert.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{alert.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{alert.message}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
