"use client"

import { useState, useEffect, use } from "react"
import axios from "axios"
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
import { Loader2 } from "lucide-react"

export function PRCommentAnalysis({ teamId, teamName, comparisonTeamId, comparisonTeamName }) {
  const [prComments, setPRComments] = useState([])
  const [allUsernames, setAllUsernames] = useState([])
  const [showAllPRs, setShowAllPRs] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedGraph, setSelectedGraph] = useState("total");
  const [totalPrs, setTotalPRs] = useState(0);

  const GITHUB_TOKEN = "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"
  const GITHUB_API_BASE = "https://github.hy-vee.cloud/api/v3"

  const fetchAllTeamMembersUserName = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/team-management/team-members?teamId=${teamId}`
      );
      const data = await response.json();
      const user_names = data.team_members.map(member => member.github_user.github_username);
      const allPrs = await Promise.all(user_names.map(async (username) => {
        return await axios(`https://github.hy-vee.cloud/api/v3/search/issues?q=author:${username}`, {
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
          },
          });
      }));
      setShowAllPRs(allPrs);
      console.log('allPrs', allPrs);
      console.log(allPrs.map(val=>val.data.items.map(i=>i.comments_url)).flat());
      setTotalPRs(allPrs.map(prs => prs.data.total_count).reduce((a, b) => a + b, 0));
    } catch (error) {
      console.error("Error fetching PR comment analysis:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllTeamMembersUserName()
  }, [teamId])






  const getChartData = () => {
    const map = new Map()

    quarterlyData.forEach((q) => {
      map.set(q.quarter, {
        quarter: q.quarter,
        [`${teamName} - Team Members`]: q.teamMemberComments,
        [`${teamName} - External`]: q.externalComments,
      })
    })

    if (comparisonData.length > 0) {
      comparisonData.forEach((q) => {
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
      { teamMembers: 0, external: 0 },
    )

    return [
      { name: "Team Members", value: totals.teamMembers },
      { name: "External", value: totals.external },
    ]
  }

  const COLORS = ["#3b82f6", "#ef4444"]

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchCommentAnalysis}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Refresh"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quarterlyData.reduce((sum, q) => sum + q.totalComments, 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">All quarters</p>
          </CardContent>
        </Card> */}

        {/* <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">By Team Members </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quarterlyData.reduce((sum, q) => sum + q.teamMemberComments, 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {(
                (quarterlyData.reduce((sum, q) => sum + q.teamMemberComments, 0) /
                  (quarterlyData.reduce((sum, q) => sum + q.totalComments, 0) || 1)) *
                100
              ).toFixed(1)}
              % of total
            </p>
          </CardContent>
        </Card> */}

        {/* <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">By External </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quarterlyData.reduce((sum, q) => sum + q.externalComments, 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {(
                (quarterlyData.reduce((sum, q) => sum + q.externalComments, 0) /
                  (quarterlyData.reduce((sum, q) => sum + q.totalComments, 0) || 1)) *
                100
              ).toFixed(1)}
              % of total
            </p>
          </CardContent>
        </Card> */}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total PRs </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPrs}</div>
            <p className="text-xs text-muted-foreground mt-1">All quarters</p>
          </CardContent>
        </Card>
      </div>

      {/* Graph Selection and Display */}
      {/* <Card>
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
                Total
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
                      <Bar dataKey={`${comparisonTeamName} - Team Members`} fill="#60a5fa" />
                      <Bar dataKey={`${comparisonTeamName} - External`} fill="#fca5a5" />
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
                  <Line type="monotone" dataKey={`${teamName} - Team Members`} stroke={COLORS[0]} />
                  <Line type="monotone" dataKey={`${teamName} - External`} stroke={COLORS[1]} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card> */}

      {/* PRs with Comment Breakdown */}
      {/* <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>PR Comment Breakdown</CardTitle>
            <CardDescription>Comments by source (Team Members vs External)</CardDescription>
          </div>
          <Button onClick={() => setShowAllPRs(!showAllPRs)} variant="outline">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : showAllPRs ? "Hide All" : "Show All"}
          </Button>
        </CardHeader>
        {showAllPRs && (
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {prComments.length > 0 ? (
                <div className="space-y-3">
                  {prComments.map((item) => (
                    <div key={item.id} className="p-4 border rounded-lg hover:bg-muted/50 transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <a
                            href={item.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-medium"
                          >
                            #{item.number}: {item.title}
                          </a>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(item.created_at).toLocaleDateString()} • by {item.author}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="text-sm">
                            <span className="font-medium text-blue-600">{item.team_member_comments}</span>
                            <span className="text-muted-foreground"> team member</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-red-600">{item.external_comments}</span>
                            <span className="text-muted-foreground"> external</span>
                          </div>
                          <div className="text-sm font-medium">{item.total_comments} total</div>
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
      </Card> */}
    </div>
  )
}
