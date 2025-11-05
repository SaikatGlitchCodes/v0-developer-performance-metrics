import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const teamId = request.nextUrl.searchParams.get("teamId");
    const comparisonTeamId =
      request.nextUrl.searchParams.get("comparisonTeamId");

    if (!teamId) {
      return NextResponse.json(
        { error: "teamId is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch all team members for the main team
    const allTeamMembersResponse = await supabase
      .from("team_members")
      .select(
        `github_users (
          github_username
        )`
      )
      .eq("team_id", teamId);

    if (allTeamMembersResponse.error) throw allTeamMembersResponse.error;
    const teamMemberUsernames = allTeamMembersResponse.data.map((m) => m.github_users?.github_username);
    console.log("Team Member Usernames:", teamMemberUsernames);

    // Fetch PR for the main team
    


    return NextResponse.json({
      // quarterlyCommentAnalysis,
      // comparisonAnalysis,
      // prComments: prComments || [],
    });
  } catch (error) {
    console.error("Error getting PR comment analysis:", error);
    return NextResponse.json(
      { error: "Failed to get PR comment analysis" },
      { status: 500 }
    );
  }
}

function calculateQuarterlyCommentAnalysis(analysis: any[]) {
  const quarterMap = new Map<
    string,
    {
      totalComments: number;
      teamMemberComments: number;
      externalComments: number;
      prCount: number;
    }
  >();

  analysis.forEach((item) => {
    const date = new Date(item.pull_requests?.created_at || item.created_at);
    const quarter = `${date.getFullYear()}-Q${
      Math.floor(date.getMonth() / 3) + 1
    }`;

    if (!quarterMap.has(quarter)) {
      quarterMap.set(quarter, {
        totalComments: 0,
        teamMemberComments: 0,
        externalComments: 0,
        prCount: 0,
      });
    }

    const data = quarterMap.get(quarter)!;
    data.totalComments += item.total_comments || 0;
    data.teamMemberComments += item.team_member_comments || 0;
    data.externalComments += item.external_comments || 0;
    data.prCount += 1;
  });

  const result = Array.from(quarterMap.entries())
    .map(([quarter, data]) => ({
      quarter,
      totalComments: data.totalComments,
      teamMemberComments: data.teamMemberComments,
      externalComments: data.externalComments,
      prCount: data.prCount,
      teamMemberPercent:
        data.totalComments > 0
          ? ((data.teamMemberComments / data.totalComments) * 100).toFixed(2)
          : 0,
      externalPercent:
        data.totalComments > 0
          ? ((data.externalComments / data.totalComments) * 100).toFixed(2)
          : 0,
    }))
    .sort((a, b) => b.quarter.localeCompare(a.quarter));

  return result;
}
