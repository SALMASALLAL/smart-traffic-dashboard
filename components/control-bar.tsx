import { Play, Zap, BarChart3, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ControlBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 glass-effect border-t border-white/10">
      <div className="px-6 py-4 flex items-center justify-center gap-4">
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 rounded-full px-6">
          <Play className="w-4 h-4" />
          Manual Control
        </Button>
        <Button
          variant="outline"
          className="border-accent/50 hover:bg-accent/10 text-accent gap-2 rounded-full px-6 bg-transparent"
        >
          <Zap className="w-4 h-4" />
          Auto Mode
        </Button>
        <Button variant="outline" className="border-white/20 hover:bg-white/10 gap-2 rounded-full px-6 bg-transparent">
          <BarChart3 className="w-4 h-4" />
          View Reports
        </Button>
        <Button variant="outline" className="border-white/20 hover:bg-white/10 gap-2 rounded-full px-6 bg-transparent">
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </div>
    </div>
  )
}
