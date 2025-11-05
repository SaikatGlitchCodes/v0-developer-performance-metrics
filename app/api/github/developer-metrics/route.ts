import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const teamId = request.nextUrl.searchParams.get("teamId")

    if (!teamId) {
      return NextResponse.json({ error: "teamId is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get all team members with their metrics
    const { data: teamMembers, error: membersError } = await supabase
      .from("team_members")
      .select(
        `
        id,
        github_user_id,
        github_users (
          id,
          github_username,
          display_name,
          avatar_url
        ),
        developer_metrics (
          quarter,
          prs_created,
          prs_merged,
          prs_reviewed,
          review_comments,
          commits_count,
          code_review_quality_score,
          productivity_score,
          merge_rate
        )
      `,
      )
      .eq("team_id", teamId)

    if (membersError) throw membersError

    // Process metrics to include quarterly comparison
    const membersWithComparison = (teamMembers || []).map((member: any) => {
      const metrics = member.developer_metrics || []
      const sortedByQuarter = metrics.sort((a: any, b: any) => b.quarter.localeCompare(a.quarter))

      const currentQuarter = sortedByQuarter[0] || null
      const previousQuarter = sortedByQuarter[1] || null

      const calculateChange = (current: number | null, previous: number | null) => {
        if (!current || !previous) return { change: 0, percentage: 0 }
        const change = current - previous
        const percentage = ((change / previous) * 100).toFixed(1)
        return { change: Number.parseFloat(change.toFixed(2)), percentage: Number.parseFloat(percentage) }
      }

      return {
        ...member,
        currentMetrics: currentQuarter,
        previousMetrics: previousQuarter,
        improvements: {
          productivity: calculateChange(currentQuarter?.productivity_score, previousQuarter?.productivity_score),
          codeReviewQuality: calculateChange(
            currentQuarter?.code_review_quality_score,
            previousQuarter?.code_review_quality_score,
          ),
          mergeRate: calculateChange(currentQuarter?.merge_rate, previousQuarter?.merge_rate),
          reviewComments: calculateChange(currentQuarter?.review_comments, previousQuarter?.review_comments),
        },
      }
    })

    return NextResponse.json({
      teamMembers: membersWithComparison,
    })
  } catch (error) {
    console.error("Error getting developer metrics:", error)
    return NextResponse.json({ error: "Failed to get developer metrics" }, { status: 500 })
  }
}
