"use client"

import { useState } from "react"

interface MetricsDisplayToggleProps {
  onToggle: (visibleMetrics: Record<string, boolean>) => void
}

export function MetricsDisplayToggle({ onToggle }: MetricsDisplayToggleProps) {
  const [visibleMetrics, setVisibleMetrics] = useState({
    productivity: true,
    collaboration: true,
    reviewQuality: true,
    prMetrics: true,
    commitMetrics: true,
    issueMetrics: true,
  })

  const handleToggle = (metric: string) => {
    const updated = { ...visibleMetrics, [metric]: !visibleMetrics[metric] }
    setVisibleMetrics(updated)
    onToggle(updated)
  }

  const visibleCount = Object.values(visibleMetrics).filter(Boolean).length
  const totalCount = Object.keys(visibleMetrics).length

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground">Display Options</h3>
        <span className="text-xs text-muted-foreground">
          {visibleCount} of {totalCount} visible
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex items-center gap-2 p-2 bg-background rounded cursor-pointer hover:bg-background/80">
          <input
            type="checkbox"
            checked={visibleMetrics.productivity}
            onChange={() => handleToggle("productivity")}
            className="rounded"
          />
          <span className="text-sm">Productivity</span>
        </label>

        <label className="flex items-center gap-2 p-2 bg-background rounded cursor-pointer hover:bg-background/80">
          <input
            type="checkbox"
            checked={visibleMetrics.collaboration}
            onChange={() => handleToggle("collaboration")}
            className="rounded"
          />
          <span className="text-sm">Collaboration</span>
        </label>

        <label className="flex items-center gap-2 p-2 bg-background rounded cursor-pointer hover:bg-background/80">
          <input
            type="checkbox"
            checked={visibleMetrics.reviewQuality}
            onChange={() => handleToggle("reviewQuality")}
            className="rounded"
          />
          <span className="text-sm">Review Quality</span>
        </label>

        <label className="flex items-center gap-2 p-2 bg-background rounded cursor-pointer hover:bg-background/80">
          <input
            type="checkbox"
            checked={visibleMetrics.prMetrics}
            onChange={() => handleToggle("prMetrics")}
            className="rounded"
          />
          <span className="text-sm">PR Metrics</span>
        </label>

        <label className="flex items-center gap-2 p-2 bg-background rounded cursor-pointer hover:bg-background/80">
          <input
            type="checkbox"
            checked={visibleMetrics.commitMetrics}
            onChange={() => handleToggle("commitMetrics")}
            className="rounded"
          />
          <span className="text-sm">Commits</span>
        </label>

        <label className="flex items-center gap-2 p-2 bg-background rounded cursor-pointer hover:bg-background/80">
          <input
            type="checkbox"
            checked={visibleMetrics.issueMetrics}
            onChange={() => handleToggle("issueMetrics")}
            className="rounded"
          />
          <span className="text-sm">Issues</span>
        </label>
      </div>
    </div>
  )
}
