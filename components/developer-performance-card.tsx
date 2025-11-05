"use client"

import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

interface DeveloperPerformanceCardProps {
  developer: {
    github_user: {
      github_username: string
      display_name: string
      avatar_url: string
    }
    prs?: Array<{
      created_at: string
      merged_at: string | null
      total_comments: number
    }>
  }
  org?: string
  token?: string
}

export function DeveloperPerformanceCard({ developer, org = "Digital", token }: DeveloperPerformanceCardProps) {
  const { github_user } = developer
  const user = github_user
  const [issues, setIssues] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showIssues, setShowIssues] = useState(false)

  const calculateMetrics = () => {
    const prs = developer.prs || []
    if (prs.length === 0) {
      return {
        totalPRs: 0,
        mergedPRs: 0,
        averageComments: 0,
        mergeRate: 0,
      }
    }

    const now = new Date()
    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

    const recentPRs = prs.filter((pr) => new Date(pr.created_at) >= threeMonthsAgo)
    const mergedPRs = recentPRs.filter((pr) => pr.merged_at !== null)
    const totalComments = recentPRs.reduce((sum, pr) => sum + (pr.total_comments || 0), 0)

    return {
      totalPRs: recentPRs.length,
      mergedPRs: mergedPRs.length,
      averageComments: recentPRs.length > 0 ? Math.round(totalComments / recentPRs.length) : 0,
      mergeRate: recentPRs.length > 0 ? Math.round((mergedPRs.length / recentPRs.length) * 100) : 0,
    }
  }

  const handleFetchIssues = async () => {
    try {
      setLoading(true)
      const userToken = token || prompt("Enter your GitHub Personal Access Token:")

      if (!userToken) {
        setLoading(false)
        return
      }

      const response = await fetch(
        `/api/github/user-issues?username=${user?.github_username}&token=${userToken}&org=${org}`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch issues")
      }

      const data = await response.json()
      setIssues(data.items || [])
      setShowIssues(true)
    } catch (error) {
      console.error("[v0] Error fetching issues:", error)
      alert("Failed to fetch issues from GitHub")
    } finally {
      setLoading(false)
    }
  }

  const metrics = calculateMetrics()

  const MetricBadge = ({
    label,
    value,
    unit = "",
  }: {
    label: string
    value: number | string
    unit?: string
  }) => {
    return (
      <div className="flex items-center justify-between py-2 px-3 bg-secondary/30 rounded-lg">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">
          {value}
          {unit}
        </span>
      </div>
    )
  }

  return (
    <>
      <Link href={`/engineer/${user?.github_username}`}>
        <Card className="overflow-hidden border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer h-full">
          <CardContent className="p-4">
            {/* Header with avatar */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border/30">
              <Image
                src={user?.avatar_url || "https://i.sstatic.net/frlIf.png"}
                alt={user?.display_name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{user?.display_name}</p>
                <p className="text-xs text-muted-foreground truncate">@{user?.github_username}</p>
              </div>
            </div>

            {/* Metrics Display (Last 3 Months) */}
            <div className="space-y-2">
              <MetricBadge label="Total PRs" value={metrics.totalPRs} />
              <MetricBadge label="Merged PRs" value={metrics.mergedPRs} />
              <MetricBadge label="Merge Rate" value={metrics.mergeRate} unit="%" />
              <MetricBadge label="Avg Comments" value={metrics.averageComments} />
            </div>

            {/* CTA */}
            <div className="mt-4 pt-4 border-t border-border/30">
              <p className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                View full profile →
              </p>
            </div>
          </CardContent>
        </Card>
      </Link>

      {showIssues && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">PRs by {user?.display_name}</h2>
                <button onClick={() => setShowIssues(false)} className="text-muted-foreground hover:text-foreground">
                  ✕
                </button>
              </div>

              {issues.length === 0 ? (
                <p className="text-muted-foreground">No PRs found</p>
              ) : (
                <div className="space-y-3">
                  {issues.map((issue) => (
                    <a
                      key={issue.id}
                      href={issue.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 border rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            #{issue.number} - {issue.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(issue.created_at).toLocaleDateString()} • {issue.comments} comments
                          </p>
                        </div>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${
                            issue.state === "open" ? "bg-green-500/20 text-green-700" : "bg-gray-500/20 text-gray-700"
                          }`}
                        >
                          {issue.state}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowIssues(false)}
                className="mt-4 w-full py-2 px-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
              >
                Close
              </button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
