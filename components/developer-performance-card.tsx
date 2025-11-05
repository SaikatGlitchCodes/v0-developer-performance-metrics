"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import Image from "next/image"

interface DeveloperPerformanceCardProps {
  developer: {
    github_user: {
      github_username: string
      display_name: string
      avatar_url: string
    }
    currentMetrics: {
      productivity_score: number
      code_review_quality_score: number
      merge_rate: number
      review_comments: number
      prs_created: number
      prs_merged: number
    } | null
    previousMetrics: any
    improvements: {
      productivity: { change: number; percentage: number }
      codeReviewQuality: { change: number; percentage: number }
      mergeRate: { change: number; percentage: number }
      reviewComments: { change: number; percentage: number }
    }
  }
}

export function DeveloperPerformanceCard({ developer }: DeveloperPerformanceCardProps) {
  const { github_user } = developer
  const user = github_user

  // if (!currentMetrics) {
  //   return (
  //     <Card className="overflow-hidden border border-border/50 hover:border-primary/50 transition-colors">
  //       <CardContent className="p-4 text-center text-muted-foreground">
  //         <p className="text-sm">No metrics available for {user.display_name}</p>
  //       </CardContent>
  //     </Card>
  //   )
  // }

  const MetricBadge = ({
    label,
    value,
    change,
    percentage,
  }: {
    label: string
    value: number | string
    change: number
    percentage: number
  }) => {
    const isPositive = change >= 0
    const isNeutral = change === 0

    return (
      <div className="flex items-center justify-between py-2 px-3 bg-secondary/30 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">{value}</span>
          <div
            className={`flex items-center gap-0.5 text-xs font-medium ${
              isPositive && !isNeutral ? "text-green-500" : isNeutral ? "text-muted-foreground" : "text-red-500"
            }`}
          >
            {isNeutral ? (
              <Minus className="w-3 h-3" />
            ) : isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{isNeutral ? "0" : `${isPositive ? "+" : ""}${percentage}%`}</span>
          </div>
        </div>
      </div>
    )
  }

  const ScoreCircle = ({ score, label }: { score: number; label: string }) => {
    const getScoreColor = (s: number) => {
      if (s >= 80) return "#10b981" // green
      if (s >= 60) return "#f59e0b" // amber
      return "#ef4444" // red
    }

    return (
      <div className="flex flex-col items-center gap-2">
        <div
          className="relative w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg"
          style={{
            background: `conic-gradient(${getScoreColor(score)} 0deg ${(score / 100) * 360}deg, #e5e7eb ${(score / 100) * 360}deg)`,
          }}
        >
          <div className="w-14 h-14 rounded-full bg-background flex items-center justify-center">
            {Math.round(score)}
          </div>
        </div>
        <span className="text-xs font-medium text-muted-foreground text-center">{label}</span>
      </div>
    )
  }

  return (
    <Card className="overflow-hidden border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg">
      <CardContent className="p-4">
        {/* Header with avatar */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border/30">
          <Image
            src={"https://i.sstatic.net/frlIf.png"}
            alt={user?.display_name}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <p className="font-semibold text-sm">{user?.display_name}</p>
            <p className="text-xs text-muted-foreground">@{user?.github_username}</p>
          </div>
        </div>

        Main metrics scores
        {/* <div className="grid grid-cols-2 gap-4 mb-4">
          <ScoreCircle score={currentMetrics.productivity_score} label="Productivity" />
          <ScoreCircle score={currentMetrics.code_review_quality_score} label="Review Quality" />
        </div> */}

        {/* Detailed metrics with quarterly comparison */}
        {/* <div className="space-y-2 mb-4">
          <MetricBadge
            label="Merge Rate"
            value={`${Math.round(currentMetrics.merge_rate)}%`}
            change={improvements.mergeRate.change}
            percentage={improvements.mergeRate.percentage}
          />
          <MetricBadge
            label="Review Comments"
            value={currentMetrics.review_comments}
            change={improvements.reviewComments.change}
            percentage={improvements.reviewComments.percentage}
          />
          <MetricBadge
            label="PRs Created"
            value={currentMetrics.prs_created}
            change={currentMetrics.prs_created - (developer.previousMetrics?.prs_created || 0)}
            percentage={
              ((currentMetrics.prs_created - (developer.previousMetrics?.prs_created || 0)) /
                (developer.previousMetrics?.prs_created || 1)) *
              100
            }
          />
          <MetricBadge
            label="PRs Merged"
            value={currentMetrics.prs_merged}
            change={currentMetrics.prs_merged - (developer.previousMetrics?.prs_merged || 0)}
            percentage={
              ((currentMetrics.prs_merged - (developer.previousMetrics?.prs_merged || 0)) /
                (developer.previousMetrics?.prs_merged || 1)) *
              100
            }
          />
        </div> */}

        {/* Quarterly comparison summary */}
        <div className="text-xs text-muted-foreground bg-secondary/20 rounded-lg p-2">
          {/* <p>
            <span className="font-medium">Productivity:</span>{" "}
            <span className={improvements.productivity.percentage >= 0 ? "text-green-600" : "text-red-600"}>
              {improvements.productivity.percentage >= 0 ? "+" : ""}
              {improvements.productivity.percentage.toFixed(1)}%
            </span>
          </p>
          <p>
            <span className="font-medium">Review Quality:</span>{" "}
            <span className={improvements.codeReviewQuality.percentage >= 0 ? "text-green-600" : "text-red-600"}>
              {improvements.codeReviewQuality.percentage >= 0 ? "+" : ""}
              {improvements.codeReviewQuality.percentage.toFixed(1)}%
            </span>
          </p> */}
        </div>
      </CardContent>
    </Card>
  )
}
