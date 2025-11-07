"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { PRCommentAnalysis } from "@/components/pr-comment-analysis"
import { TeamDevelopersSection } from "@/components/team-developers-section"
import { createClient } from "@/lib/supabase/client"
import { DashboardHeader } from "@/components/dashboard-header"
import { useGithub } from "@/lib/context/githubData"
import { exportTeamData } from "@/lib/export-utils"

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
  const [exportFormat, setExportFormat] = useState<'markdown' | 'csv' | 'json'>('markdown')
  const {fetchAllUserName, teamMetrics, teamMembersName, fetchQuarterlyMetrics} = useGithub();
  console.log("teamMetrics:", teamMetrics);

  useEffect(() => {
    fetchTeams()
  }, [])

  useEffect(() => {
    if (selectedTeam) {
      fetchAllUserName(selectedTeam);
    }
  }, [selectedTeam]);

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
    try {
      setSyncing(true);
      fetchTeams();
    }catch (error) {
      console.error("Error syncing comments:", error)
    } finally {
      setSyncing(false);
    }
  }

  const handleExport = async () => {
    if (!selectedTeam || !teamMetrics.length || !teamMembersName.length) {
      alert('Please select a team and wait for data to load before exporting.');
      return;
    }

    try {
      const teamName = teams.find((t) => t.id === selectedTeam)?.name || 'Unknown Team';
      
      // Fetch quarterly data for comprehensive report
      let quarterlyData = [];
      if (fetchQuarterlyMetrics) {
        try {
          quarterlyData = await fetchQuarterlyMetrics(4);
        } catch (error) {
          console.warn('Could not fetch quarterly data for export:', error);
        }
      }

      exportTeamData(
        teamName,
        teamMembersName,
        teamMetrics,
        quarterlyData,
        exportFormat
      );
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
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
        <DashboardHeader title={"Hy-vee activity tracker"} onExport={handleExport}/>
        
        {/* Export Format Selection */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Export Format:</label>
              <Select value={exportFormat} onValueChange={(value: 'markdown' | 'csv' | 'json') => setExportFormat(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="markdown">Markdown (.md)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                  <SelectItem value="json">JSON (.json)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

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
              teamName={teams.find((t) => t.id === selectedTeam)?.name || ""}
            />
          </div>
        )}

        {/* Comment Analysis */}
        {selectedTeam && (
          <PRCommentAnalysis
            teamId={selectedTeam}
            teamName={teams.find((t) => t.id === selectedTeam)?.name || ""}
            comparisonTeamName={teams.find((t) => t.id === comparisonTeam)?.name}
          />
        )}
      </div>
    </main>
  )
}
