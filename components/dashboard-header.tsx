"use client"

import { Download, Settings } from "lucide-react"

interface DashboardHeaderProps {
  title: string
  onExport?: () => void
  onSettings?: () => void
}

export function DashboardHeader({ title, onExport, onSettings }: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-foreground mb-2">{title}</h1>
      <p className="text-muted-foreground mb-6">Team-wise developer performance insights</p>

      <div className="flex gap-3">
        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <Download size={16} />
            Export Report
          </button>
        )}
        {onSettings && (
          <button
            onClick={onSettings}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <Settings size={16} />
            Settings
          </button>
        )}
      </div>
    </div>
  )
}
