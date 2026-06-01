import CityMap from "@/components/city-map"
import AlertPanel from "@/components/alert-panel"

export default function MapAndAlerts() {
  return (
    <div className="space-y-4">
      <CityMap />
      <AlertPanel />
    </div>
  )
}
