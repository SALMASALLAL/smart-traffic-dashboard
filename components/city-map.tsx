export default function CityMap() {
  return (
    <div className="glass-effect rounded-xl p-4 h-48 relative overflow-hidden">
      <h3 className="text-sm font-semibold text-white mb-3">City Map</h3>
      <svg className="w-full h-full" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
        {/* Road Grid */}
        <line x1="50" y1="0" x2="50" y2="200" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
        <line x1="150" y1="0" x2="150" y2="200" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
        <line x1="250" y1="0" x2="250" y2="200" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />

        <line x1="0" y1="50" x2="300" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
        <line x1="0" y1="100" x2="300" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
        <line x1="0" y1="150" x2="300" y2="150" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />

        {/* Intersection A - Green */}
        <circle cx="50" cy="50" r="8" fill="#00ff41" opacity="0.6" />
        <circle cx="50" cy="50" r="8" fill="none" stroke="#00ff41" strokeWidth="1" opacity="0.8">
          <animate attributeName="r" from="8" to="14" dur="2s" repeatCount="indefinite" opacity="0.2" />
        </circle>
        <text x="60" y="48" fill="rgba(255,255,255,0.6)" fontSize="10">
          A
        </text>

        {/* Intersection B - Red */}
        <circle cx="150" cy="50" r="8" fill="#ff006e" opacity="0.6" />
        <circle cx="150" cy="50" r="8" fill="none" stroke="#ff006e" strokeWidth="1" opacity="0.8">
          <animate attributeName="r" from="8" to="14" dur="1.2s" repeatCount="indefinite" opacity="0.2" />
        </circle>
        <text x="160" y="48" fill="rgba(255,255,255,0.6)" fontSize="10">
          B
        </text>

        {/* Intersection C - Yellow */}
        <circle cx="250" cy="100" r="8" fill="#ffff00" opacity="0.6" />
        <circle cx="250" cy="100" r="8" fill="none" stroke="#ffff00" strokeWidth="1" opacity="0.8">
          <animate attributeName="r" from="8" to="14" dur="1.6s" repeatCount="indefinite" opacity="0.2" />
        </circle>
        <text x="260" y="103" fill="rgba(0,0,0,0.6)" fontSize="10">
          C
        </text>

        {/* Intersection D - Green */}
        <circle cx="50" cy="150" r="8" fill="#00ff41" opacity="0.6" />
        <circle cx="50" cy="150" r="8" fill="none" stroke="#00ff41" strokeWidth="1" opacity="0.8">
          <animate attributeName="r" from="8" to="14" dur="2.2s" repeatCount="indefinite" opacity="0.2" />
        </circle>
        <text x="60" y="153" fill="rgba(255,255,255,0.6)" fontSize="10">
          D
        </text>
      </svg>
    </div>
  )
}
