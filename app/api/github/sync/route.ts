import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { token, owner, repo, usernames, since } = await request.json()

    if (!token || !owner || !repo) {
      return NextResponse.json({ error: "Missing required parameters: token, owner, repo" }, { status: 400 })
    }

    // This endpoint handles syncing GitHub data
    // In a production app, this would update your database with fresh metrics
    const response = await fetch("http://localhost:3000/api/github/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, owner, repo, usernames, since }),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error syncing GitHub data:", error)
    return NextResponse.json({ error: "Failed to sync GitHub data" }, { status: 500 })
  }
}
