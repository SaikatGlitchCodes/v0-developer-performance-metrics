"use client"

import { useMemo } from "react"
import type { GitHubMetrics } from "@/lib/types"
import { MetricCard } from "./metric-card"

interface TeamStatsGridProps {
  metrics: GitHubMetrics[]
}

export function TeamStatsGrid({ metrics }: TeamStatsGridProps) {
  const stats = useMemo(() => {
    if (metrics.length === 0) {
      return { totalCommits: 0, totalReviews: 0, avgReviewTime: 0, totalIssues: 0 }
    }

    const totalCommits = metrics.reduce((sum, m) => sum + m.commitCount, 0)
    const totalReviews = metrics.reduce((sum, m) => sum + m.reviewCommentsGiven + m.reviewCommentsReceived, 0)
    const avgReviewTime = metrics.reduce((sum, m) => sum + m.prReviewTime, 0) / metrics.length
    const totalIssues = metrics.reduce((sum, m) => sum + m.issuesClosed, 0)

    return { totalCommits, totalReviews, avgReviewTime, totalIssues }
  }, [metrics])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard label="Total Commits" value={stats.totalCommits} type="number" />
      <MetricCard label="Total Reviews" value={stats.totalReviews} type="number" />
      <MetricCard label="Avg Review Time" value={stats.avgReviewTime} type="hours" />
      <MetricCard label="Issues Closed" value={stats.totalIssues} type="number" />
    </div>
  )
}
