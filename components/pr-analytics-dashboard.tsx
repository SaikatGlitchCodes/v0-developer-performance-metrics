"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Loader2 } from "lucide-react"

interface PRAnalyticsProps {
  teamId: string
  teamName: string
  comparisonTeamId?: string
  comparisonTeamName?: string
}

interface QuarterlyData {
  quarter: string
  totalPRs: number
  totalComments: number
  avgCommentsPerPR: number
  developerCount: number
}

export function PRAnalyticsDashboard({ teamId, teamName, comparisonTeamId, comparisonTeamName }: PRAnalyticsProps) {
  const [quarterlyData, setQuarterlyData] = useState<QuarterlyData[]>([])
  const [comparisonData, setComparisonData] = useState<QuarterlyData[]>([])
  const [prs, setPRs] = useState<any[]>([])
  const [showAllPRs, setShowAllPRs] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedGraph, setSelectedGraph] = useState<"comments" | "prs" | "avg">("comments")

  useEffect(() => {
    fetchAnalytics()
  }, [teamId])

  useEffect(() => {
    if (comparisonTeamId) {
      fetchComparisonAnalytics()
    }
  }, [comparisonTeamId])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/github/pr-analytics?teamId=${teamId}`)
      const data = await response.json()
      setQuarterlyData(data.quarterlyData || [])
      setPRs(data.prs || [])
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComparisonAnalytics = async () => {
    try {
      const response = await fetch(`/api/github/pr-analytics?teamId=${comparisonTeamId}`)
      const data = await response.json()
      setComparisonData(data.quarterlyData || [])
    } catch (error) {
      console.error("Error fetching comparison analytics:", error)
    }
  }

  const getMergedChartData = () => {
    const map = new Map()

    quarterlyData.forEach((q) => {
      map.set(q.quarter, {
        ...q,
        teamName: teamName,
      })
    })

    if (comparisonData.length > 0) {
      comparisonData.forEach((q) => {
        const existing = map.get(q.quarter) || { quarter: q.quarter }
        map.set(q.quarter, {
          ...existing,
          ...q,
          comparisonTeamName: comparisonTeamName,
        })
      })
    }

    return Array.from(map.values()).sort((a, b) => b.quarter.localeCompare(a.quarter))
  }

  const chartData = getMergedChartData()

  const getGraphData = () => {
    if (selectedGraph === "comments") {
      return chartData.map((d) => ({
        quarter: d.quarter,
        [teamName]: d.totalComments,
        ...(comparisonTeamName && { [comparisonTeamName]: d.comparison_total_comments }),
      }))
    } else if (selectedGraph === "prs") {
      return chartData.map((d) => ({
        quarter: d.quarter,
        [teamName]: d.totalPRs,
        ...(comparisonTeamName && { [comparisonTeamName]: d.comparison_total_prs }),
      }))
    } else {
      return chartData.map((d) => ({
        quarter: d.quarter,
        [teamName]: Number.parseFloat(d.avgCommentsPerPR),
        ...(comparisonTeamName && { [comparisonTeamName]: d.comparison_avg_comments }),
      }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total PRs ({teamName})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quarterlyData.reduce((sum, q) => sum + q.totalPRs, 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">All quarters</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Comments ({teamName})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quarterlyData.reduce((sum, q) => sum + q.totalComments, 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">All quarters</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Comments/PR ({teamName})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                quarterlyData.reduce((sum, q) => sum + Number.parseFloat(q.avgCommentsPerPR as any), 0) /
                (quarterlyData.length || 1)
              ).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Average across quarters</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Latest Quarter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quarterlyData[0]?.quarter || "N/A"}</div>
            <p className="text-xs text-muted-foreground mt-1">Most recent</p>
          </CardContent>
        </Card>
      </div>

      {/* Graph Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Quarterly Comparison</CardTitle>
              <CardDescription>
                {teamName} {comparisonTeamName ? `vs ${comparisonTeamName}` : ""} performance over quarters
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedGraph === "comments" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGraph("comments")}
              >
                Comments
              </Button>
              <Button
                variant={selectedGraph === "prs" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGraph("prs")}
              >
                PRs
              </Button>
              <Button
                variant={selectedGraph === "avg" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGraph("avg")}
              >
                Avg Comments/PR
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              [teamName]: {
                label: teamName,
                color: "hsl(var(--chart-1))",
              },
              ...(comparisonTeamName && {
                [comparisonTeamName]: {
                  label: comparisonTeamName,
                  color: "hsl(var(--chart-2))",
                },
              }),
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              {selectedGraph === "comments" ? (
                <BarChart data={getGraphData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey={teamName} fill="var(--color-team1)" />
                  {comparisonTeamName && <Bar dataKey={comparisonTeamName} fill="var(--color-team2)" />}
                </BarChart>
              ) : (
                <LineChart data={getGraphData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line type="monotone" dataKey={teamName} stroke="var(--color-team1)" />
                  {comparisonTeamName && (
                    <Line type="monotone" dataKey={comparisonTeamName} stroke="var(--color-team2)" />
                  )}
                </LineChart>
              )}
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* All PRs Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pull Requests</CardTitle>
            <CardDescription>All PRs from {teamName}</CardDescription>
          </div>
          <Button
            onClick={() => {
              setShowAllPRs(!showAllPRs)
              if (!showAllPRs) fetchAnalytics()
            }}
            variant="outline"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : showAllPRs ? "Hide" : "Show All PRs"}
          </Button>
        </CardHeader>
        {showAllPRs && (
          <CardContent>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {prs.length > 0 ? (
                prs.map((pr) => (
                  <div key={pr.github_pr_id} className="p-4 border rounded-lg hover:bg-muted/50 transition">
                    <div className="flex items-start justify-between">
                      <div>
                        <a
                          href={pr.pr_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-medium"
                        >
                          #{pr.pr_number}: {pr.pr_title}
                        </a>
                        <p className="text-sm text-muted-foreground mt-1">
                          by {pr.github_users?.github_username} · {new Date(pr.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-secondary">
                          {pr.comments_count} comments
                        </span>
                        <p className="text-xs text-muted-foreground mt-2 capitalize">{pr.status}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No PRs found</p>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
