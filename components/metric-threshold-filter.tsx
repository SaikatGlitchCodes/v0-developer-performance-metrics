"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface MetricThresholdFilterProps {
  onApply: (thresholds: Record<string, number>) => void
  defaultThresholds?: Record<string, number>
}

export function MetricThresholdFilter({ onApply, defaultThresholds = {} }: MetricThresholdFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [thresholds, setThresholds] = useState(
    defaultThresholds || {
      productivityThreshold: 60,
      collaborationThreshold: 60,
      reviewQualityThreshold: 60,
    },
  )

  const handleChange = (key: string, value: number) => {
    const updated = { ...thresholds, [key]: value }
    setThresholds(updated)
  }

  const handleApply = () => {
    onApply(thresholds)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg hover:bg-card transition-colors text-sm font-medium"
      >
        Score Thresholds
        <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-lg p-4 shadow-lg z-50">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Productivity Score Threshold</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={thresholds.productivityThreshold}
                  onChange={(e) => handleChange("productivityThreshold", Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-semibold min-w-12 text-right">{thresholds.productivityThreshold}%</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Collaboration Score Threshold</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={thresholds.collaborationThreshold}
                  onChange={(e) => handleChange("collaborationThreshold", Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-semibold min-w-12 text-right">{thresholds.collaborationThreshold}%</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Review Quality Threshold</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={thresholds.reviewQualityThreshold}
                  onChange={(e) => handleChange("reviewQualityThreshold", Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-semibold min-w-12 text-right">{thresholds.reviewQualityThreshold}%</span>
              </div>
            </div>

            <button
              onClick={handleApply}
              className="w-full px-3 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity font-medium"
            >
              Apply Thresholds
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
