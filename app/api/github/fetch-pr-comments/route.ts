import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { token, teamId, org, repo } = await request.json()

    if (!token || !teamId || !org || !repo) {
      return NextResponse.json({ error: "token, teamId, org, and repo are required" }, { status: 400 })
    }

    const supabase = await createClient()
    // Get team members for comment categorization
    const { data: teamMembers, error: membersError } = await supabase
      .from("team_members")
      .select(
        `
        github_users (
          github_username,
          id
        )
      `,
      )
      .eq("team_id", teamId)

    if (membersError) throw membersError

    const teamMemberUsernames = new Set(
      teamMembers?.flatMap((m) => m.github_users?.map((u: any) => u.github_username) || []) || [],
    )
    console.log("Team Member Usernames:", Array.from(teamMemberUsernames))
    const allComments: any[] = []
    const commentAnalysis: any[] = []

    // for (const pr of prs) {
    //   try {
    //     const response = await fetch(
    //       `https://github.hy-vee.cloud/api/v3/repos/${org}/${repo}/issues/${pr.pr_number}/comments?per_page=100`,
    //       {
    //         headers: {
    //           Authorization: `token ${token}`,
    //           Accept: "application/vnd.github.v3+json",
    //         },
    //       },
    //     )

    //     if (!response.ok) continue

    //     const comments = await response.json()

    //     let teamMemberComments = 0
    //     let externalComments = 0

    //     for (const comment of comments) {
    //       allComments.push({
    //         github_comment_id: comment.id,
    //         pull_request_id: pr.id,
    //         comment_author_username: comment.user.login,
    //         comment_body: comment.body,
    //         created_at: comment.created_at,
    //       })

    //       // Categorize comment source
    //       if (teamMemberUsernames.has(comment.user.login)) {
    //         teamMemberComments++
    //       } else {
    //         externalComments++
    //       }
    //     }

    //     // Store comment analysis
    //     commentAnalysis.push({
    //       pull_request_id: pr.id,
    //       team_id: teamId,
    //       total_comments: comments.length,
    //       team_member_comments: teamMemberComments,
    //       external_comments: externalComments,
    //     })
    //   } catch (err) {
    //     console.error(`Error fetching comments for PR #${pr.pr_number}:`, err)
    //   }
    // }

    // Store comments and analysis in database
    if (allComments.length > 0) {
      const { error: insertCommentsError } = await supabase
        .from("pr_comments")
        .upsert(allComments, { onConflict: "github_comment_id" })

      if (insertCommentsError) throw insertCommentsError
    }

    if (commentAnalysis.length > 0) {
      const { error: insertAnalysisError } = await supabase
        .from("pr_comment_analysis")
        .upsert(commentAnalysis, { onConflict: "pull_request_id,team_id" })

      if (insertAnalysisError) throw insertAnalysisError
    }

    return NextResponse.json({
      commentsCount: allComments.length,
      analysisCount: commentAnalysis.length,
      teamMemberUsernames: Array.from(teamMemberUsernames),
    })
  } catch (error) {
    console.error("Error fetching PR comments:", error)
    return NextResponse.json({ error: "Failed to fetch PR comments" }, { status: 500 })
  }
}
