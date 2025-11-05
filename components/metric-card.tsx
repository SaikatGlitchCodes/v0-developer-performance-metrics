"use client"
import { getMetricColor, formatMetricValue } from "@/lib/utils-metrics"
import { TrendingUp, TrendingDown } from "lucide-react"

interface MetricCardProps {
  label: string
  value: number
  type: "number" | "hours" | "score"
  change?: number
}

export function MetricCard({ label, value, type, change }: MetricCardProps) {
  const colorClass = getMetricColor(value, type === "score" ? 70 : 50)

  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="flex items-baseline justify-between">
        <div className={`text-lg font-semibold ${colorClass}`}>{formatMetricValue(value, type)}</div>
        {change !== undefined && change !== 0 && (
          <div
            className={`flex items-center gap-1 text-xs ${change > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
          >
            {change > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(change).toFixed(0)}%
          </div>
        )}
      </div>
    </div>
  )
}
