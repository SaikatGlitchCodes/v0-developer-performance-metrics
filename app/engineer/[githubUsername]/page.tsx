"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Github, TrendingUp, TrendingDown, Calendar, GitPullRequest, MessageSquare } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"

interface Developer {
  id: string
  github_username: string
  display_name: string
  avatar_url: string
  github_id: number
}

interface PRData {
  id: string
  pr_number: number
  pr_title: string
  pr_url: string
  created_at: string
  merged_at: string
  closed_at: string
  status: string
  comments_count: number
}

interface QuarterMetrics {
  quarter: string
  prs_created: number
  prs_merged: number
  prs_reviewed: number
  review_comments: number
  productivity_score: number
  merge_rate: number
}

export default function EngineerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const githubUsername = params.githubUsername as string

  const [developer, setDeveloper] = useState<Developer | null>(null)
  const [prs, setPrs] = useState<PRData[]>([])
  const [metrics, setMetrics] = useState<QuarterMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQuarter, setSelectedQuarter] = useState<string>("")

  useEffect(() => {
    if (githubUsername) {
      fetchDeveloperData()
    }
  }, [githubUsername])

  const fetchDeveloperData = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // Fetch developer info
      const { data: devData, error: devError } = await supabase
        .from("github_users")
        .select("*")
        .eq("github_username", githubUsername)
        .single()

      if (devError || !devData) throw new Error("Developer not found")

      setDeveloper(devData)

      // Fetch PRs for last 6 months
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

      const { data: prData, error: prError } = await supabase
        .from("pull_requests")
        .select("*")
        .eq("github_user_id", devData.id)
        .gte("created_at", sixMonthsAgo.toISOString())
        .order("created_at", { ascending: false })

      if (!prError && prData) {
        setPrs(prData)
      }

      // Fetch quarterly metrics for last 3 quarters
      const { data: metricsData, error: metricsError } = await supabase
        .from("developer_metrics")
        .select("*")
        .eq("github_user_id", devData.id)
        .order("quarter", { ascending: false })
        .limit(3)

      if (!metricsError && metricsData) {
        setMetrics(metricsData.reverse())
        if (metricsData.length > 0) {
          setSelectedQuarter(metricsData[metricsData.length - 1].quarter)
        }
      }
    } catch (error) {
      console.error("Error fetching developer data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading profile...</p>
        </div>
      </main>
    )
  }

  if (!developer) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-lg font-semibold mb-4">Developer not found</p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  // Calculate productivity trends
  const currentMetrics = metrics[metrics.length - 1]
  const previousMetrics = metrics.length > 1 ? metrics[metrics.length - 2] : null

  const productivityChange = previousMetrics
    ? ((currentMetrics?.productivity_score || 0) - (previousMetrics?.productivity_score || 0)).toFixed(1)
    : 0

  const mergeRateChange = previousMetrics
    ? ((currentMetrics?.merge_rate || 0) - (previousMetrics?.merge_rate || 0)).toFixed(1)
    : 0

  const reviewCommentChange = previousMetrics
    ? (currentMetrics?.review_comments || 0) - (previousMetrics?.review_comments || 0)
    : 0

  const prsByDate = new Map<string, PRData[]>()
  prs.forEach((pr) => {
    const date = new Date(pr.created_at).toISOString().split("T")[0]
    if (!prsByDate.has(date)) {
      prsByDate.set(date, [])
    }
    prsByDate.get(date)!.push(pr)
  })

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header with back button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              {developer.avatar_url && (
                <img
                  src={"https://avatars.githubusercontent.com/u/627410?v=4&size=80"}
                  alt={developer.display_name}
                  className="w-24 h-24 rounded-full border-4 border-primary"
                />
              )}
              <div>
                <h1 className="text-4xl font-bold mb-2">{developer.display_name || developer.github_username}</h1>
                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                  <Github className="w-4 h-4" />
                  <a
                    href={`https://github.hy-vee.cloud/${developer.github_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary underline"
                  >
                    @{developer.github_username}
                  </a>
                </div>
                <p className="text-sm text-muted-foreground">Developer Profile • Last 6 Months</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quarterly Metrics Overview */}
        {metrics.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Productivity Score */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>Productivity</span>
                  {Number(productivityChange) > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentMetrics?.productivity_score.toFixed(1) || 0}%</div>
                <p className={`text-xs mt-2 ${Number(productivityChange) >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {Number(productivityChange) >= 0 ? "+" : ""}
                  {productivityChange}% from last quarter
                </p>
              </CardContent>
            </Card>

            {/* Merge Rate */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>Merge Rate</span>
                  {Number(mergeRateChange) > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentMetrics?.merge_rate.toFixed(1) || 0}%</div>
                <p className={`text-xs mt-2 ${Number(mergeRateChange) >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {Number(mergeRateChange) >= 0 ? "+" : ""}
                  {mergeRateChange.toFixed(1)}% from last quarter
                </p>
              </CardContent>
            </Card>

            {/* PRs Created */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <GitPullRequest className="w-4 h-4" />
                  PRs Created
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentMetrics?.prs_created || 0}</div>
                <p className="text-xs text-muted-foreground mt-2">{currentMetrics?.prs_merged || 0} merged</p>
              </CardContent>
            </Card>

            {/* Review Comments */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>Reviews</span>
                  {reviewCommentChange > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentMetrics?.review_comments || 0}</div>
                <p className={`text-xs mt-2 ${reviewCommentChange > 0 ? "text-green-600" : "text-red-600"}`}>
                  {reviewCommentChange > 0 ? "+" : ""}
                  {reviewCommentChange} from last quarter
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quarterly Comparison */}
        {metrics.length > 1 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">3-Month Improvement Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {metrics.map((metric, idx) => (
                  <div key={metric.quarter} className="p-4 rounded-lg border">
                    <h3 className="font-semibold mb-3 text-center">{metric.quarter}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">PRs Created:</span>
                        <span className="font-medium">{metric.prs_created}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">PRs Merged:</span>
                        <span className="font-medium">{metric.prs_merged}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Merge Rate:</span>
                        <span className="font-medium">{metric.merge_rate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Reviews:</span>
                        <span className="font-medium">{metric.review_comments}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Productivity:</span>
                        <span className="font-medium">{metric.productivity_score.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* PR Timeline Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              PR Timeline (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {prs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No PRs found in the last 6 months</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {Array.from(prsByDate.entries())
                  .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
                  .map(([date, dayPrs]) => (
                    <div key={date} className="border-l-4 border-primary pl-4 py-2">
                      <p className="text-sm font-semibold text-primary mb-2">{new Date(date).toLocaleDateString()}</p>
                      <div className="space-y-2">
                        {dayPrs.map((pr) => (
                          <div
                            key={pr.id}
                            className="bg-muted p-3 rounded-lg flex items-start justify-between hover:bg-muted/80 transition-colors cursor-pointer"
                          >
                            <div className="flex-1">
                              <a
                                href={pr.pr_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium hover:text-primary underline"
                              >
                                #{pr.pr_number}: {pr.pr_title}
                              </a>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  variant={
                                    pr.status === "merged"
                                      ? "default"
                                      : pr.status === "closed"
                                        ? "secondary"
                                        : "outline"
                                  }
                                >
                                  {pr.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" />
                                  {pr.comments_count} comments
                                </span>
                                {pr.merged_at && (
                                  <span className="text-xs text-green-600">
                                    Merged {new Date(pr.merged_at).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total PRs (6 months)</span>
              <span className="font-semibold">{prs.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Merged PRs</span>
              <span className="font-semibold">{prs.filter((p) => p.status === "merged").length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Comments Received</span>
              <span className="font-semibold">{prs.reduce((sum, p) => sum + p.comments_count, 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Avg Comments per PR</span>
              <span className="font-semibold">
                {prs.length > 0 ? (prs.reduce((sum, p) => sum + p.comments_count, 0) / prs.length).toFixed(1) : 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
