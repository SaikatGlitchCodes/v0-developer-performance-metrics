import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const githubUsername = request.nextUrl.searchParams.get("username")
    const token = request.nextUrl.searchParams.get("token")
    const org = request.nextUrl.searchParams.get("org")

    if (!githubUsername || !token || !org) {
      return NextResponse.json({ error: "username, token, and org are required" }, { status: 400 })
    }

    const response = await fetch(
      `https://github.hy-vee.cloud/api/v3/search/issues?q=author:${githubUsername}+org:${org}+type:pr&per_page=100&sort=created&order=desc`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      },
    )

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const data = await response.json()

    const enrichedIssues = (data.items || []).map((item: any) => ({
      id: item.id,
      number: item.number,
      title: item.title,
      state: item.state,
      comments: item.comments,
      created_at: item.created_at,
      updated_at: item.updated_at,
      closed_at: item.closed_at,
      url: item.html_url,
      user: item.user,
      labels: item.labels,
    }))

    return NextResponse.json({
      total_count: data.total_count,
      items: enrichedIssues,
      incomplete_results: data.incomplete_results,
    })
  } catch (error) {
    console.error("[v0] Error fetching user issues:", error)
    return NextResponse.json({ error: "Failed to fetch issues from GitHub" }, { status: 500 })
  }
}
