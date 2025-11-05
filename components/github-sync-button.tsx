"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Github } from "lucide-react"

interface GitHubSyncButtonProps {
  onSyncComplete?: () => void
}

export function GitHubSyncButton({ onSyncComplete }: GitHubSyncButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSync = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Token is only obtained from user input via prompt
      const token = prompt("Enter your GitHub Personal Access Token:")

      if (!token) {
        setError("GitHub token is required")
        setIsLoading(false)
        return
      }

      const response = await fetch("/api/github/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          owner: "your-org",
          repo: "your-repo",
          usernames: ["alice-j", "bob-smith", "carol-w"],
          since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to sync GitHub metrics")
      }

      const data = await response.json()
      console.log("Synced metrics:", data)
      onSyncComplete?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button onClick={handleSync} disabled={isLoading} variant="outline" size="sm">
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Github className="w-4 h-4 mr-2" />}
        {isLoading ? "Syncing..." : "Sync GitHub"}
      </Button>
      {error && <span className="text-sm text-destructive">{error}</span>}
    </div>
  )
}
