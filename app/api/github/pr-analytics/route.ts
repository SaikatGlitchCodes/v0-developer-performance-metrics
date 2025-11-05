import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const teamId = request.nextUrl.searchParams.get("teamId")

    if (!teamId) {
      return NextResponse.json({ error: "teamId is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get PR metrics for the team
    const { data: metrics, error } = await supabase
      .from("pr_metrics")
      .select("*")
      .eq("team_id", teamId)
      .order("quarter", { ascending: false })

    if (error) throw error

    // Get detailed PR data for comparison
    const { data: prs, error: prsError } = await supabase
      .from("pull_requests")
      .select("*, github_users(github_username)")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false })

    if (prsError) throw prsError

    // Calculate quarterly analytics
    const quarterlyData = calculateQuarterlyAnalytics(prs || [])

    return NextResponse.json({
      metrics,
      prs,
      quarterlyData,
    })
  } catch (error) {
    console.error("Error getting PR analytics:", error)
    return NextResponse.json({ error: "Failed to get PR analytics" }, { status: 500 })
  }
}

function calculateQuarterlyAnalytics(prs: any[]) {
  const quarterMap = new Map<
    string,
    {
      totalPRs: number
      totalComments: number
      avgComments: number
      developers: Set<string>
    }
  >()

  prs.forEach((pr) => {
    const date = new Date(pr.created_at)
    const quarter = `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`

    if (!quarterMap.has(quarter)) {
      quarterMap.set(quarter, {
        totalPRs: 0,
        totalComments: 0,
        avgComments: 0,
        developers: new Set(),
      })
    }

    const data = quarterMap.get(quarter)!
    data.totalPRs += 1
    data.totalComments += pr.comments_count || 0
    data.developers.add(pr.github_users?.github_username || "Unknown")
  })

  const result = Array.from(quarterMap.entries()).map(([quarter, data]) => ({
    quarter,
    totalPRs: data.totalPRs,
    totalComments: data.totalComments,
    avgCommentsPerPR: data.totalPRs > 0 ? (data.totalComments / data.totalPRs).toFixed(2) : 0,
    developerCount: data.developers.size,
  }))

  return result.sort((a, b) => b.quarter.localeCompare(a.quarter))
}
