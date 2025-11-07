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
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [exportFormat, setExportFormat] = useState<'markdown' | 'csv' | 'json' | 'excel'>('excel')
  const {fetchAllUserName, teamMetrics, teamMembersName, fetchQuarterlyMetrics} = useGithub();
  console.log("teamMetrics:", teamMetrics);

  useEffect(() => {
    // Initialize selectedTeam from localStorage after component mounts
    const savedTeam = localStorage.getItem('selectedTeam')
    if (savedTeam) {
      setSelectedTeam(savedTeam)
    }
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
      
      // Only set default team if no team is currently selected and localStorage doesn't have a saved team
      const savedTeam = localStorage.getItem('selectedTeam')
      if (data && data.length > 0 && !selectedTeam && !savedTeam) {
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

        {/* Team Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Team</CardTitle>
            <CardDescription>Choose your team and optionally compare with another team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between gap-4">
              <div>
                <label className="text-sm font-medium">Your Team</label>
                <Select value={selectedTeam} onValueChange={(value) => { setSelectedTeam(value); localStorage.setItem('selectedTeam', value); }}>
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
          />
        )}
      </div>
    </main>
  )
}
