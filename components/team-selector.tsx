"use client"

import type { Team } from "@/lib/types"
import { ChevronDown } from "lucide-react"
import { useState } from "react"

interface TeamSelectorProps {
  teams: Team[]
  selectedTeams: string[]
  onTeamsChange: (teamIds: string[]) => void
}

export function TeamSelector({ teams, selectedTeams, onTeamsChange }: TeamSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleTeam = (teamId: string) => {
    if (selectedTeams.includes(teamId)) {
      onTeamsChange(selectedTeams.filter((id) => id !== teamId))
    } else {
      onTeamsChange([...selectedTeams, teamId])
    }
  }

  const selectedCount = selectedTeams.length
  const allSelected = selectedCount === teams.length

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
      >
        <span className="text-sm font-medium">
          {selectedCount === 0
            ? "Select Teams"
            : selectedCount === 1
              ? teams.find((t) => selectedTeams.includes(t.id))?.name
              : `${selectedCount} Teams`}
        </span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50">
          <div className="p-2">
            <button
              onClick={() => {
                if (allSelected) {
                  onTeamsChange([])
                } else {
                  onTeamsChange(teams.map((t) => t.id))
                }
              }}
              className="w-full text-left px-3 py-2 rounded hover:bg-muted text-sm font-medium"
            >
              {allSelected ? "Deselect All" : "Select All"}
            </button>
            <div className="border-t border-border my-2" />
            {teams.map((team) => (
              <label key={team.id} className="flex items-center gap-2 px-3 py-2 rounded hover:bg-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTeams.includes(team.id)}
                  onChange={() => toggleTeam(team.id)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">{team.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
