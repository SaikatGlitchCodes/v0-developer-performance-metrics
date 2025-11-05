"use client"

import { useMemo } from "react"
import type { Developer, GitHubMetrics } from "@/lib/types"
import { MetricCard } from "./metric-card"

interface MetricsSummaryProps {
  developers: Developer[]
  metrics: GitHubMetrics[]
}

export function MetricsSummary({ developers, metrics }: MetricsSummaryProps) {
  const summary = useMemo(() => {
    if (metrics.length === 0) {
      return {
        avgProductivity: 0,
        avgCollaboration: 0,
        avgReviewQuality: 0,
        totalPRs: 0,
        totalCommits: 0,
        avgPRMergeRate: 0,
        topDeveloper: null,
      }
    }

    const totalProductivity = metrics.reduce((sum, m) => sum + m.productivityScore, 0)
    const totalCollaboration = metrics.reduce((sum, m) => sum + m.collaborationScore, 0)
    const totalReviewQuality = metrics.reduce((sum, m) => sum + m.reviewQualityScore, 0)
    const totalPRs = metrics.reduce((sum, m) => sum + m.prCreated, 0)
    const totalCommits = metrics.reduce((sum, m) => sum + m.commitCount, 0)
    const totalMerged = metrics.reduce((sum, m) => sum + m.prMerged, 0)

    const topMetrics = metrics.reduce((best, current) => {
      const currentScore = current.productivityScore + current.collaborationScore + current.reviewQualityScore
      const bestScore = best.productivityScore + best.collaborationScore + best.reviewQualityScore
      return currentScore > bestScore ? current : best
    })

    const topDeveloper = developers.find((d) => d.id === topMetrics.developerId)

    return {
      avgProductivity: totalProductivity / metrics.length,
      avgCollaboration: totalCollaboration / metrics.length,
      avgReviewQuality: totalReviewQuality / metrics.length,
      totalPRs,
      totalCommits,
      avgPRMergeRate: totalPRs > 0 ? (totalMerged / totalPRs) * 100 : 0,
      topDeveloper,
    }
  }, [developers, metrics])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <MetricCard label="Avg Productivity" value={summary.avgProductivity} type="score" />
      <MetricCard label="Avg Collaboration" value={summary.avgCollaboration} type="score" />
      <MetricCard label="Avg Review Quality" value={summary.avgReviewQuality} type="score" />
      <MetricCard label="Total PRs" value={summary.totalPRs} type="number" />
    </div>
  )
}
