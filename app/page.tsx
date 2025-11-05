"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { PRCommentAnalysis } from "@/components/pr-comment-analysis"
import { TeamDevelopersSection } from "@/components/team-developers-section"
import { createClient } from "@/lib/supabase/client"

interface Team {
  id: string
  name: string
}

export default function Dashboard() {
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string>("")
  const [comparisonTeam, setComparisonTeam] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase.from("teams").select("id, name")

      if (error) throw error

      setTeams(data || [])
      if (data && data.length > 0) {
        setSelectedTeam(data[0].id)
      }
    } catch (error) {
      console.error("Error fetching teams:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSyncComments = async () => {
    if (!selectedTeam) return

    const token = prompt("Enter your GitHub Personal Access Token:")
    if (!token) return

    try {
      setSyncing(true)
      const response = await fetch("/api/github/fetch-pr-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: selectedTeam,
          token,
          org: "Digital",
          repo: "my-pharmacy", // Update this based on your repo
        }),
      })

      const data = await response.json()
      alert(`Synced ${data.commentsCount} comments from ${data.analysisCount} PRs`)
    } catch (error) {
      console.error("Error syncing comments:", error)
      alert("Failed to sync PR comments")
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Developer Performance Metrics</h1>
          <p className="text-muted-foreground">GitHub PR Analysis by Team with Comment Source Breakdown</p>
        </div>

        {/* Team Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Team</CardTitle>
            <CardDescription>Choose your team and optionally compare with another team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Your Team</label>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Reviewers (Optional)</label>
                <Select value={comparisonTeam} onValueChange={setComparisonTeam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select comparison team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={handleSyncComments} disabled={syncing} className="w-full">
                  {syncing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Sync PR Comments
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Members Performance Cards */}
        {selectedTeam && (
          <div className="mb-12">
            <TeamDevelopersSection
              teamId={selectedTeam}
              teamName={teams.find((t) => t.id === selectedTeam)?.name || ""}
            />
          </div>
        )}

        {/* Comment Analysis */}
        {selectedTeam && (
          <PRCommentAnalysis
            teamId={selectedTeam}
            teamName={teams.find((t) => t.id === selectedTeam)?.name || ""}
            comparisonTeamId={comparisonTeam}
            comparisonTeamName={teams.find((t) => t.id === comparisonTeam)?.name}
          />
        )}
      </div>
    </main>
  )
}
