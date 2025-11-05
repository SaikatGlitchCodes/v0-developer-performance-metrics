import { type NextRequest, NextResponse } from "next/server"
import { GitHubClient } from "@/lib/github-client"
import { MetricsEngine, type RawGitHubData } from "@/lib/metrics-engine"

export async function POST(request: NextRequest) {
  try {
    const { token, owner, repo, usernames, since } = await request.json()

    if (!token || !owner || !repo || !usernames || !since) {
      return NextResponse.json(
        { error: "Missing required parameters: token, owner, repo, usernames, since" },
        { status: 400 },
      )
    }

    const client = new GitHubClient(token)
    const metrics = []

    for (const username of usernames) {
      try {
        // Fetch user data
        const user = await client.getUser(username)

        // Fetch PRs
        const prs = await client.getUserPullRequests(owner, repo, username, since)
        const prsMerged = prs.filter((pr) => pr.merged_at).length
        const prsRejected = prs.filter((pr) => pr.closed_at && !pr.merged_at).length
        const prCreated = prs.length

        // Calculate average PR review time
        const prReviewTimes = prs
          .filter((pr) => pr.merged_at)
          .map((pr) => {
            const created = new Date(pr.created_at).getTime()
            const merged = new Date(pr.merged_at!).getTime()
            return (merged - created) / (1000 * 60 * 60) // Convert to hours
          })
        const prReviewTimeHours =
          prReviewTimes.length > 0 ? prReviewTimes.reduce((a, b) => a + b) / prReviewTimes.length : 0

        // Fetch review comments from PRs
        let reviewCommentsGiven = 0
        for (const pr of prs) {
          const reviews = await client.getPullRequestReviews(owner, repo, pr.number)
          reviewCommentsGiven += reviews
            .filter((r) => r.user.login === username)
            .reduce((sum, r) => sum + (r.body ? 1 : 0), 0)
        }

        // Fetch commits
        const commits = await client.getRepositoryCommits(owner, repo, username, since)
        const commitCount = commits.length

        // Calculate code changes
        const totalLinesAdded = 0
        const totalLinesDeleted = 0
        // Note: This is simplified; real implementation would need to fetch commit details

        // Fetch issues
        const issues = await client.getRepositoryIssues(owner, repo, username, since)
        const issuesCreated = issues.length
        const issuesClosed = issues.filter((i) => i.closed_at).length

        // Estimate review comments received (simplified)
        const reviewCommentsReceived = Math.round(prsMerged * 1.5)

        const rawData: RawGitHubData = {
          prsCreated: prCreated,
          prsMerged,
          prsRejected,
          prReviewTimeHours,
          commitCount,
          reviewCommentsGiven,
          reviewCommentsReceived,
          issuesCreated,
          issuesClosed,
          linesAdded: totalLinesAdded,
          linesDeleted: totalLinesDeleted,
          reviewParticipationRate: Math.min(1, (reviewCommentsGiven + reviewCommentsReceived) / 50),
        }

        const userMetrics = MetricsEngine.toMetrics(user.id.toString(), rawData)
        metrics.push(userMetrics)
      } catch (error) {
        console.error(`Error fetching metrics for ${username}:`, error)
      }
    }

    return NextResponse.json({ metrics })
  } catch (error) {
    console.error("Error in metrics API:", error)
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 })
  }
}
