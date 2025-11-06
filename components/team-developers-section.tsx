"use client"

import { DeveloperPerformanceCard } from "./developer-performance-card"
import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useGithub } from "@/lib/context/githubData"

interface TeamDevelopersSectionProps {
  teamName: string  
}

export function TeamDevelopersSection({  teamName }: TeamDevelopersSectionProps) {
  const {teamMetrics, loading: githubLoading} = useGithub();
  if (githubLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!teamMetrics || teamMetrics.length === 0) {
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
        {teamMetrics.map((dev:any) => (
          <DeveloperPerformanceCard key={dev.member} developer={dev} />
        ))}
      </div>
    </div>
  )
}
