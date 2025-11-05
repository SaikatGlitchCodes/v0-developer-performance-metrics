import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const teamId = request.nextUrl.searchParams.get("teamId")
    const comparisonTeamId = request.nextUrl.searchParams.get("comparisonTeamId")

    if (!teamId) {
      return NextResponse.json({ error: "teamId is required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: teamAnalysis, error: teamError } = await supabase
      .from("pr_comment_analysis")
      .select(
        `
        *,
        pull_requests (
          created_at,
          pr_number,
          pr_title
        )
      `,
      )
      .eq("team_id", teamId)
      .order("created_at", { ascending: false, foreignTable: "pull_requests" })

    if (teamError) throw teamError

    // Calculate quarterly breakdown for team member vs external comments
    const quarterlyCommentAnalysis = calculateQuarterlyCommentAnalysis(teamAnalysis || [])

    let comparisonAnalysis = null
    if (comparisonTeamId && comparisonTeamId !== "none") {
      const { data: compData, error: compError } = await supabase
        .from("pr_comment_analysis")
        .select(
          `
          *,
          pull_requests (
            created_at,
            pr_number,
            pr_title
          )
        `,
        )
        .eq("team_id", comparisonTeamId)

      if (compError) throw compError

      comparisonAnalysis = calculateQuarterlyCommentAnalysis(compData || [])
    }

    // Get detailed PR comments for display
    const { data: prComments, error: commentsError } = await supabase
      .from("pr_comment_analysis")
      .select(
        `
        *,
        pull_requests (
          id,
          pr_number,
          pr_title,
          pr_url,
          created_at,
          status
        )
      `,
      )
      .eq("team_id", teamId)
      .order("created_at", { ascending: false, foreignTable: "pull_requests" })
      .limit(50)

    if (commentsError) throw commentsError

    return NextResponse.json({
      quarterlyCommentAnalysis,
      comparisonAnalysis,
      prComments: prComments || [],
    })
  } catch (error) {
    console.error("Error getting PR comment analysis:", error)
    return NextResponse.json({ error: "Failed to get PR comment analysis" }, { status: 500 })
  }
}

function calculateQuarterlyCommentAnalysis(analysis: any[]) {
  const quarterMap = new Map<
    string,
    {
      totalComments: number
      teamMemberComments: number
      externalComments: number
      prCount: number
    }
  >()

  analysis.forEach((item) => {
    const date = new Date(item.pull_requests?.created_at || item.created_at)
    const quarter = `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`

    if (!quarterMap.has(quarter)) {
      quarterMap.set(quarter, {
        totalComments: 0,
        teamMemberComments: 0,
        externalComments: 0,
        prCount: 0,
      })
    }

    const data = quarterMap.get(quarter)!
    data.totalComments += item.total_comments || 0
    data.teamMemberComments += item.team_member_comments || 0
    data.externalComments += item.external_comments || 0
    data.prCount += 1
  })

  const result = Array.from(quarterMap.entries())
    .map(([quarter, data]) => ({
      quarter,
      totalComments: data.totalComments,
      teamMemberComments: data.teamMemberComments,
      externalComments: data.externalComments,
      prCount: data.prCount,
      teamMemberPercent: data.totalComments > 0 ? ((data.teamMemberComments / data.totalComments) * 100).toFixed(2) : 0,
      externalPercent: data.totalComments > 0 ? ((data.externalComments / data.totalComments) * 100).toFixed(2) : 0,
    }))
    .sort((a, b) => b.quarter.localeCompare(a.quarter))

  return result
}
