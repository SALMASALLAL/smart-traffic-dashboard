interface StatCardProps {
  label: string
  value: number | string
  /** Color of the value text. Defaults to the dashboard accent green. */
  valueColor?: string
  /** When true, shows a pulsing placeholder instead of the value. */
  loading?: boolean
}

/**
 * Reusable stat card matching the dashboard "Cars Detected" card style.
 * Single source of truth for the card visuals so every metric box stays in sync.
 */
export default function StatCard({ label, value, valueColor = "#00ff41", loading = false }: StatCardProps) {
  return (
    <div
      className="rounded-lg p-4 border border-white/10 hover:border-accent/30 transition-colors text-center"
      style={{ background: "rgba(255,255,255,0.05)" }}
    >
      <p className="text-xs text-muted-foreground font-semibold uppercase mb-2 tracking-wider">{label}</p>
      {loading ? (
        <div className="mx-auto h-8 w-12 animate-pulse rounded bg-white/10" />
      ) : (
        <p className="text-3xl font-bold" style={{ color: valueColor }}>
          {value}
        </p>
      )}
    </div>
  )
}
