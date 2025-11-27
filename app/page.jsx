"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { PRCommentAnalysis } from "@/components/pr-comment-analysis"
import { TeamDevelopersSection } from "@/components/team-developers-section"
import axios from "axios"
import { DashboardHeader } from "@/components/dashboard-header"
import { useTeams } from "@/lib/context/teamsContext"
import { useTeamData } from "@/lib/context/teamDataContext"

export default function Dashboard() {
  const { teams, loading, fetchTeams } = useTeams()
  const { fetchTeamData: fetchTeamDataFromContext, getTeamData, isLoadingTeam, clearCache } = useTeamData()
  const [selectedTeam, setSelectedTeam] = useState("")
  const [syncing, setSyncing] = useState(false)
  const [exportFormat, setExportFormat] = useState('excel')
  const [lastQuarterData, setLastQuarterData] = useState([]);

  useEffect(() => {
    const savedTeam = localStorage.getItem('selectedTeam')
    if (savedTeam) {
      setSelectedTeam(savedTeam)
    }
    // Fetch teams only if not already cached
    fetchTeams();
  }, [fetchTeams])

  useEffect(() => {
    if (selectedTeam) {
      fetchTeamData(selectedTeam);
    }
  }, [selectedTeam]);

  const fetchTeamData = async (teamId) => {
    try {
      // Check if we have cached data first
      const cachedData = getTeamData(teamId);
      if (cachedData) {
        setLastQuarterData(cachedData);
      }
      
      // Fetch from context (which handles caching internally)
      const data = await fetchTeamDataFromContext(teamId);
      setLastQuarterData(data);
    } catch (error) {
      console.error("Error fetching team data:", error);
    }
  };

  const lastQuarterLoading = selectedTeam ? isLoadingTeam(selectedTeam) : false;

  const handleSyncComments = async () => {
    if (!selectedTeam) return
    try {
      setSyncing(true);
      await axios.post('http://localhost:4000/prs/refresh-team-prs', { team_id: selectedTeam });
      
      // Clear cache and refetch teams to update last_sync
      clearCache(selectedTeam);
      await fetchTeams(true); // Force refresh teams
      await fetchTeamData(selectedTeam); // Refetch team data
      
      alert("Comments synced successfully!");
    } catch (error) {
      console.error("Error syncing comments:", error)
    } finally {
      setSyncing(false);
    }
  }

  const handleExport = async () => {
   // Export team data using utility function
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
        <DashboardHeader title={"Hy-vee activity tracker"} onExport={handleExport} />

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
                    {teams?.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">last synced</label>
                {
                  teams?.find((t) => t.id === selectedTeam)?.last_sync ? (
                    <p className="mt-1 text-sm">
                      {new Date(teams.find((t) => t.id === selectedTeam)?.last_sync).toLocaleString()}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">Never synced</p>
                  )
                }
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
              lastQuarterData={lastQuarterData}
              lastQuarterLoading={lastQuarterLoading}
            />
          </div>
        )}

        {/* Comment Analysis */}
        {selectedTeam && (
          <PRCommentAnalysis
            teamId={selectedTeam}
            compareTeamId={'9e48e063-1272-40ac-8d31-6300783d03d4'}
          />
        )}
      </div>
    </main>
  )
}
