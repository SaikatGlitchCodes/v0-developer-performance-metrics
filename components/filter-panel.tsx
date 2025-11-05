"use client"

import type { FilterOptions } from "@/lib/types"
import { useState } from "react"
import { X } from "lucide-react"

interface FilterPanelProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
}

export function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleCommentFilterChange = (field: "minComments" | "maxComments", value: number) => {
    onFiltersChange({
      ...filters,
      [field]: value,
    })
  }

  const handleMetricFilterChange = (field: string, value: number) => {
    onFiltersChange({
      ...filters,
      metricsFilter: {
        ...filters.metricsFilter,
        [field]: value,
      },
    })
  }

  const handleDateChange = (field: "start" | "end", value: string) => {
    const date = new Date(value)
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: date,
      },
    })
  }

  const handleSortChange = (field: "sortBy" | "sortOrder", value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value as any,
    })
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <h3 className="font-semibold text-foreground">Advanced Filters</h3>
        <button className="text-muted-foreground hover:text-foreground">
          <X size={18} className={`transition-transform ${isExpanded ? "rotate-45" : ""}`} />
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-6">
          {/* Comment Filtering */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Comments Range</label>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">Min</label>
                <input
                  type="number"
                  min="0"
                  value={filters.minComments}
                  onChange={(e) => handleCommentFilterChange("minComments", Number.parseInt(e.target.value) || 0)}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">Max</label>
                <input
                  type="number"
                  min="0"
                  value={filters.maxComments}
                  onChange={(e) => handleCommentFilterChange("maxComments", Number.parseInt(e.target.value) || 999)}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded text-sm"
                />
              </div>
            </div>
          </div>

          {/* Metrics Filters */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Min PRs</label>
              <input
                type="number"
                min="0"
                value={filters.metricsFilter.minPRs}
                onChange={(e) => handleMetricFilterChange("minPRs", Number.parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-background border border-border rounded text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Min Commits</label>
              <input
                type="number"
                min="0"
                value={filters.metricsFilter.minCommits}
                onChange={(e) => handleMetricFilterChange("minCommits", Number.parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-background border border-border rounded text-sm"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Date Range</label>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">Start</label>
                <input
                  type="date"
                  value={filters.dateRange.start.toISOString().split("T")[0]}
                  onChange={(e) => handleDateChange("start", e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">End</label>
                <input
                  type="date"
                  value={filters.dateRange.end.toISOString().split("T")[0]}
                  onChange={(e) => handleDateChange("end", e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded text-sm"
                />
              </div>
            </div>
          </div>

          {/* Sorting */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleSortChange("sortBy", e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded text-sm"
              >
                <option value="name">Name</option>
                <option value="productivity">Productivity</option>
                <option value="collaboration">Collaboration</option>
                <option value="reviews">Review Quality</option>
                <option value="comments">Comments</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Order</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleSortChange("sortOrder", e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded text-sm"
              >
                <option value="desc">Highest First</option>
                <option value="asc">Lowest First</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
