import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { orgName, token, teamId } = await {
      orgName: request.nextUrl.searchParams.get("orgName")!,
      token: request.nextUrl.searchParams.get("token")!,
      teamId: request.nextUrl.searchParams.get("teamId")!,
    }

    if (!orgName || !token || !teamId) {
      return NextResponse.json({ error: "orgName, token, and teamId are required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get team members
    const { data: teamMembers, error: membersError } = await supabase
      .from("team_members")
      .select(
        `
        github_users (
          github_username,
          github_id,
          id
        )
      `,
      )
      .eq("team_id", teamId)

    if (membersError) throw membersError

    const members = teamMembers?.flatMap((m) => m.github_users) || []

    if (members.length === 0) {
      return NextResponse.json({
        prs: [],
        message: "No team members found",
      })
    }

    // Fetch PRs for each team member
    const allPRs: any[] = []

    for (const member of members) {
      try {
        const response = await fetch(
          `https://github.hy-vee.cloud/api/v3/search/issues?q=author:${member.github_username}+org:${orgName}+type:pr&per_page=100`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github.v3+json",
            },
          },
        )

        if (!response.ok) continue

        const data = await response.json()

        for (const pr of data.items || []) {
          allPRs.push({
            github_pr_id: pr.id,
            team_id: teamId,
            github_user_id: member.id,
            pr_number: pr.number,
            pr_title: pr.title,
            pr_url: pr.html_url,
            comments_count: pr.comments,
            created_at: pr.created_at,
            merged_at: pr.pull_request?.merged_at || null,
            closed_at: pr.closed_at,
            status: pr.pull_request?.merged_at ? "merged" : pr.state,
          })
        }
      } catch (err) {
        console.error(`Error fetching PRs for ${member.github_username}:`, err)
      }
    }

    return NextResponse.json({
      prs: allPRs,
      count: allPRs.length,
    })
  } catch (error) {
    console.error("Error fetching PRs:", error)
    return NextResponse.json({ error: "Failed to fetch PRs from GitHub" }, { status: 500 })
  }
}
