"use client"

import { useState, useEffect } from "react"
import { DeveloperPerformanceCard } from "./developer-performance-card"
import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface TeamDevelopersSectionProps {
  teamId: string
  teamName: string
}

export function TeamDevelopersSection({ teamId, teamName }: TeamDevelopersSectionProps) {
  const [developers, setDevelopers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeveloperMetrics()
  }, [teamId])

  const fetchDeveloperMetrics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/github/developer-metrics?teamId=${teamId}`)
      const data = await response.json()

      if (data.teamMembers) {
        setDevelopers(data.teamMembers)
      }
    } catch (error) {
      console.error("Error fetching developer metrics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!developers || developers.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>No team members found. Assign developers to this team in the admin panel.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{teamName} Team Members</h2>
        <p className="text-muted-foreground">Quarterly performance comparison and individual metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {developers.map((dev: any) => (
          <DeveloperPerformanceCard key={dev.github_user_id} developer={dev} />
        ))}
      </div>
    </div>
  )
}
