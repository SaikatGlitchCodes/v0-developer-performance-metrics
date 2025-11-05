"use client"

import type { Developer, GitHubMetrics } from "@/lib/types"
import { MetricCard } from "./metric-card"
import { Github, Mail } from "lucide-react"

interface DeveloperCardProps {
  developer: Developer
  metrics: GitHubMetrics
  onExpand?: (developerId: string) => void
}

export function DeveloperCard({ developer, metrics, onExpand }: DeveloperCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
      {/* Header */}
      <div className="mb-4 pb-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground mb-1">{developer.name}</h3>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <a
            href={`https://github.com/${developer.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-foreground"
          >
            <Github size={14} />
            {developer.username}
          </a>
          <a href={`mailto:${developer.email}`} className="flex items-center gap-1 hover:text-foreground">
            <Mail size={14} />
            Email
          </a>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <MetricCard label="PRs Created" value={metrics.prCreated} type="number" />
        <MetricCard label="PRs Merged" value={metrics.prMerged} type="number" />
        <MetricCard label="Comments Given" value={metrics.reviewCommentsGiven} type="number" />
        <MetricCard label="Review Time" value={metrics.prReviewTime} type="hours" />
      </div>

      {/* Score Section */}
      <div className="grid grid-cols-3 gap-3 py-4 border-t border-b border-border">
        <MetricCard label="Productivity" value={metrics.productivityScore} type="score" />
        <MetricCard label="Collaboration" value={metrics.collaborationScore} type="score" />
        <MetricCard label="Review Quality" value={metrics.reviewQualityScore} type="score" />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <MetricCard label="Commits" value={metrics.commitCount} type="number" />
        <MetricCard label="Issues Closed" value={metrics.issuesClosed} type="number" />
        <MetricCard label="Lines Added" value={Math.round(metrics.linesAdded / 100)} type="number" />
        <MetricCard label="Comments Received" value={metrics.reviewCommentsReceived} type="number" />
      </div>

      {/* Action Button */}
      {onExpand && (
        <button
          onClick={() => onExpand(developer.id)}
          className="w-full mt-4 px-3 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity text-sm font-medium"
        >
          View Detailed Metrics
        </button>
      )}
    </div>
  )
}
