import { type NextRequest, NextResponse } from "next/server"

interface GitHubUser {
  login: string
  id: number
  avatar_url: string
  name: string | null
  bio: string | null
  company: string | null
  location: string | null
}

export async function POST(request: NextRequest) {
  try {
    const { token, org } = await request.json()

    if (!token || !org) {
      return NextResponse.json({ error: "GitHub token and organization name are required" }, { status: 400 })
    }

    // Fetch all organization members
    const membersResponse = await fetch(`https://github.hy-vee.cloud/api/v3/orgs/${org}/members?per_page=100`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!membersResponse.ok) {
      return NextResponse.json(
        { error: `Failed to fetch GitHub members: ${membersResponse.statusText}` },
        { status: membersResponse.status },
      )
    }

    const members: GitHubUser[] = await membersResponse.json()

    // Fetch additional user details for each member
    const detailedUsers = await Promise.all(
      members.map(async (member) => {
        try {
          const userResponse = await fetch(`https://github.hy-vee.cloud/api/v3/users/${member.login}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github.v3+json",
            },
          })

          if (userResponse.ok) {
            const userDetails = await userResponse.json()
            return {
              github_username: userDetails.login,
              github_id: userDetails.id,
              display_name: userDetails.name || userDetails.login,
              avatar_url: userDetails.avatar_url,
              bio: userDetails.bio,
              company: userDetails.company,
              location: userDetails.location,
            }
          }
        } catch (error) {
          console.error(`Error fetching details for ${member.login}:`, error)
        }

        return {
          github_username: member.login,
          github_id: member.id,
          display_name: member.name || member.login,
          avatar_url: member.avatar_url,
          bio: member.bio,
          company: member.company,
          location: member.location,
        }
      }),
    )

    return NextResponse.json({ users: detailedUsers })
  } catch (error) {
    console.error("Error in fetch-org-members:", error)
    return NextResponse.json({ error: "Failed to fetch organization members" }, { status: 500 })
  }
}
