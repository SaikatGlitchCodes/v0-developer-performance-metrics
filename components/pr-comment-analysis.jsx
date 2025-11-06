"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Loader2, GitPullRequest, MessageSquare, Users, ExternalLink } from "lucide-react"
import { useGithub } from "@/lib/context/githubData"

export function PRCommentAnalysis({ 
  teamId, 
  teamName, 
  comparisonTeamName,
}) {
  const { teamMembersName, teamMetrics, fetchQuarterlyMetrics } = useGithub();
  const totalNumberPRs = teamMetrics?.reduce((sum, tm) => sum + (tm ? tm.prCount : 0), 0) || 0;
  const totalInternalComments = teamMetrics?.reduce((sum, tm) => sum + (tm ? tm.teamCommentsCount : 0), 0) || 0;
  const totalExternalComments = teamMetrics?.reduce((sum, tm) => sum + (tm ? tm.otherCommentsCount : 0), 0) || 0;
  const totalNumberComments = totalInternalComments + totalExternalComments;

  // Local state for comparison data and UI state
  const [state, setState] = useState({
    comparisonQuarterlyData: [],
    loading: false,
    error: null,
    quarterlyData: [],
    totalPRs: 0,
    totalComments: 0,
    teamMembers: [],
    prAnalyses: []
  })
  
  const [selectedGraph, setSelectedGraph] = useState("total")
  const [showAllPRs, setShowAllPRs] = useState(false)

  // Real quarterly data loading effect
  useEffect(() => {
    if (teamId && teamMembersName.length > 0 && fetchQuarterlyMetrics) {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      fetchQuarterlyMetrics(4) // Fetch last 4 quarters
        .then((quarterlyData) => {
          // Generate PR analyses from the quarterly data
          const prAnalyses = [];
          quarterlyData.forEach(quarter => {
            quarter.metrics?.forEach(metric => {
              metric.repos?.forEach(pr => {
                const teamMemberComments = (metric.teamIssueComments?.filter(c => 
                  c.html_url?.includes(`/pull/${pr.number}/`)
                )?.length || 0) + (metric.teamReviewComments?.filter(c => 
                  c.html_url?.includes(`/pull/${pr.number}/`)
                )?.length || 0);
                
                const externalComments = (metric.otherIssueComments?.filter(c => 
                  c.html_url?.includes(`/pull/${pr.number}/`)
                )?.length || 0) + (metric.otherReviewComments?.filter(c => 
                  c.html_url?.includes(`/pull/${pr.number}/`)
                )?.length || 0);

                prAnalyses.push({
                  pr,
                  teamMemberComments,
                  externalComments,
                  totalComments: teamMemberComments + externalComments,
                  quarter: quarter.quarter
                });
              });
            });
          });

          const totalPRs = quarterlyData.reduce((sum, q) => sum + q.totalPRs, 0);
          const totalComments = quarterlyData.reduce((sum, q) => sum + q.totalComments, 0);

          setState(prev => ({
            ...prev,
            loading: false,
            quarterlyData,
            totalPRs,
            totalComments,
            prAnalyses: prAnalyses.sort((a, b) => new Date(b.pr.created_at) - new Date(a.pr.created_at))
          }));
        })
        .catch((error) => {
          console.error('Error fetching quarterly data:', error);
          setState(prev => ({
            ...prev,
            loading: false,
            error: error.message || 'Failed to fetch quarterly data'
          }));
        });
    }
  }, [teamId, teamMembersName, fetchQuarterlyMetrics]);

  // Get data from state
  const { quarterlyData, totalPRs, totalComments, loading, error, prAnalyses } = state

  // Refresh function
  const handleRefresh = () => {
    if (teamId && teamMembersName.length > 0 && fetchQuarterlyMetrics) {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      fetchQuarterlyMetrics(4) // Fetch last 4 quarters
        .then((quarterlyData) => {
          // Generate PR analyses from the quarterly data
          const prAnalyses = [];
          quarterlyData.forEach(quarter => {
            quarter.metrics?.forEach(metric => {
              metric.repos?.forEach(pr => {
                const teamMemberComments = (metric.teamIssueComments?.filter(c => 
                  c.html_url?.includes(`/pull/${pr.number}/`)
                )?.length || 0) + (metric.teamReviewComments?.filter(c => 
                  c.html_url?.includes(`/pull/${pr.number}/`)
                )?.length || 0);
                
                const externalComments = (metric.otherIssueComments?.filter(c => 
                  c.html_url?.includes(`/pull/${pr.number}/`)
                )?.length || 0) + (metric.otherReviewComments?.filter(c => 
                  c.html_url?.includes(`/pull/${pr.number}/`)
                )?.length || 0);

                prAnalyses.push({
                  pr,
                  teamMemberComments,
                  externalComments,
                  totalComments: teamMemberComments + externalComments,
                  quarter: quarter.quarter
                });
              });
            });
          });

          const totalPRs = quarterlyData.reduce((sum, q) => sum + q.totalPRs, 0);
          const totalComments = quarterlyData.reduce((sum, q) => sum + q.totalComments, 0);

          setState(prev => ({
            ...prev,
            loading: false,
            quarterlyData,
            totalPRs,
            totalComments,
            prAnalyses: prAnalyses.sort((a, b) => new Date(b.pr.created_at) - new Date(a.pr.created_at))
          }));
        })
        .catch((error) => {
          console.error('Error refreshing quarterly data:', error);
          setState(prev => ({
            ...prev,
            loading: false,
            error: error.message || 'Failed to refresh quarterly data'
          }));
        });
    }
  }

  // Chart data preparation
  const getChartData = () => {
    const map = new Map()

    quarterlyData.forEach((q) => {
      map.set(q.quarter, {
        quarter: q.quarter,
        [`${teamName} - Team Members`]: q.teamMemberComments,
        [`${teamName} - External`]: q.externalComments,
      })
    })

    if (state.comparisonQuarterlyData.length > 0) {
      state.comparisonQuarterlyData.forEach((q) => {
        const existing = map.get(q.quarter) || { quarter: q.quarter }
        map.set(q.quarter, {
          ...existing,
          [`${comparisonTeamName} - Team Members`]: q.teamMemberComments,
          [`${comparisonTeamName} - External`]: q.externalComments,
        })
      })
    }

    return Array.from(map.values()).sort((a, b) => b.quarter.localeCompare(a.quarter))
  }

  const getPieData = () => {
    const totals = quarterlyData.reduce(
      (acc, q) => ({
        teamMembers: acc.teamMembers + q.teamMemberComments,
        external: acc.external + q.externalComments,
      }),
      { teamMembers: 0, external: 0 }
    )

    return [
      { name: "Team Members", value: totals.teamMembers },
      { name: "External", value: totals.external },
    ]
  }

  const COLORS = ["#3b82f6", "#ef4444", "#60a5fa", "#fca5a5"]

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error: {error}</p>
            <Button onClick={handleRefresh} className="mt-4">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <GitPullRequest className="w-4 h-4" />
                Total PRs
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Refresh"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPRs}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 4 quarters</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Total Comments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalComments}</div>
            <p className="text-xs text-muted-foreground mt-1">All quarterly PR comments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              By Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quarterlyData.reduce((sum, q) => sum + q.teamMemberComments, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalComments > 0 ? (
                (quarterlyData.reduce((sum, q) => sum + q.teamMemberComments, 0) / totalComments * 100).toFixed(1)
              ) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              By External
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quarterlyData.reduce((sum, q) => sum + q.externalComments, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalComments > 0 ? (
                (quarterlyData.reduce((sum, q) => sum + q.externalComments, 0) / totalComments * 100).toFixed(1)
              ) : 0}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graph Selection and Display */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Comment Source Analysis</CardTitle>
              <CardDescription>
                Team Member vs External comments on PRs ({teamName}
                {comparisonTeamName ? ` vs ${comparisonTeamName}` : ""})
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedGraph === "total" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGraph("total")}
              >
                Trend
              </Button>
              <Button
                variant={selectedGraph === "split" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGraph("split")}
              >
                Split View
              </Button>
              <Button
                variant={selectedGraph === "pie" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGraph("pie")}
              >
                Distribution
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[400px] flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <ChartContainer
              config={{
                teamMembers: {
                  label: "Team Members",
                  color: "hsl(var(--chart-1))",
                },
                external: {
                  label: "External",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[400px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                {selectedGraph === "pie" ? (
                  <PieChart>
                    <Pie
                      data={getPieData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getPieData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                ) : selectedGraph === "split" ? (
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quarter" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey={`${teamName} - Team Members`} fill={COLORS[0]} />
                    <Bar dataKey={`${teamName} - External`} fill={COLORS[1]} />
                    {comparisonTeamName && (
                      <>
                        <Bar dataKey={`${comparisonTeamName} - Team Members`} fill={COLORS[2]} />
                        <Bar dataKey={`${comparisonTeamName} - External`} fill={COLORS[3]} />
                      </>
                    )}
                  </BarChart>
                ) : (
                  <LineChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quarter" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey={`${teamName} - Team Members`} stroke={COLORS[0]} strokeWidth={2} />
                    <Line type="monotone" dataKey={`${teamName} - External`} stroke={COLORS[1]} strokeWidth={2} />
                    {comparisonTeamName && (
                      <>
                        <Line type="monotone" dataKey={`${comparisonTeamName} - Team Members`} stroke={COLORS[2]} strokeWidth={2} />
                        <Line type="monotone" dataKey={`${comparisonTeamName} - External`} stroke={COLORS[3]} strokeWidth={2} />
                      </>
                    )}
                  </LineChart>
                )}
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* PRs with Comment Breakdown */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>PR Comment Breakdown</CardTitle>
            <CardDescription>Comments by source (Team Members vs External)</CardDescription>
          </div>
          <Button onClick={() => setShowAllPRs(!showAllPRs)} variant="outline">
            {showAllPRs ? "Hide All" : "Show All"}
          </Button>
        </CardHeader>
        {showAllPRs && (
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {prAnalyses && prAnalyses.length > 0 ? (
                <div className="space-y-3">
                  {prAnalyses.map((analysis) => (
                    <div key={analysis.pr.id} className="p-4 border rounded-lg hover:bg-muted/50 transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <a
                            href={analysis.pr.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-medium"
                          >
                            #{analysis.pr.number}: {analysis.pr.title}
                          </a>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(analysis.pr.created_at).toLocaleDateString()} • by {analysis.pr.user.login}
                            {analysis.pr.merged_at && (
                              <span className="ml-2 text-green-600">• Merged</span>
                            )}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="text-sm">
                            <span className="font-medium text-blue-600">{analysis.teamMemberComments}</span>
                            <span className="text-muted-foreground"> team member</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-red-600">{analysis.externalComments}</span>
                            <span className="text-muted-foreground"> external</span>
                          </div>
                          <div className="text-sm font-medium">{analysis.totalComments} total</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No PR data available</p>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}