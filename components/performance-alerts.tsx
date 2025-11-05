"use client"

import { useMemo } from "react"
import type { Developer, GitHubMetrics } from "@/lib/types"
import { AlertCircle, TrendingDown } from "lucide-react"

interface PerformanceAlertsProps {
  developers: Developer[]
  metrics: GitHubMetrics[]
  thresholds?: {
    productivityThreshold: number
    collaborationThreshold: number
    reviewQualityThreshold: number
  }
}

export function PerformanceAlerts({
  developers,
  metrics,
  thresholds = { productivityThreshold: 60, collaborationThreshold: 60, reviewQualityThreshold: 60 },
}: PerformanceAlertsProps) {
  const alerts = useMemo(() => {
    return metrics
      .map((m) => {
        const dev = developers.find((d) => d.id === m.developerId)
        const issues = []

        if (m.productivityScore < thresholds.productivityThreshold) {
          issues.push(`Low productivity (${Math.round(m.productivityScore)}%)`)
        }
        if (m.collaborationScore < thresholds.collaborationThreshold) {
          issues.push(`Low collaboration (${Math.round(m.collaborationScore)}%)`)
        }
        if (m.reviewQualityScore < thresholds.reviewQualityThreshold) {
          issues.push(`Low review quality (${Math.round(m.reviewQualityScore)}%)`)
        }

        return { developer: dev, issues }
      })
      .filter((a) => a.issues.length > 0)
  }, [developers, metrics, thresholds])

  if (alerts.length === 0) {
    return null
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle size={20} className="text-yellow-600 dark:text-yellow-400" />
        <h3 className="font-semibold text-foreground">Performance Alerts</h3>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {alerts.map((alert) => (
          <div
            key={alert.developer?.id}
            className="flex items-start gap-3 p-2 bg-background rounded border border-border/50"
          >
            <TrendingDown size={16} className="text-yellow-600 dark:text-yellow-400 mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm text-foreground">{alert.developer?.name}</p>
              <p className="text-xs text-muted-foreground">{alert.issues.join(", ")}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
