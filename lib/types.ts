// Data models for the dashboard
export interface Developer {
  id: string
  name: string
  username: string
  avatar?: string
  email: string
}

export interface Team {
  id: string
  name: string
  description: string
  members: string[] // developer IDs
  createdAt: Date
}

export interface GitHubMetrics {
  developerId: string
  period: string // e.g., "2025-11-01:2025-11-05"

  // Pull Request Metrics
  prCreated: number
  prMerged: number
  prRejected: number
  prReviewTime: number // average hours

  // Commits
  commitCount: number

  // Code Review
  reviewCommentsGiven: number
  reviewCommentsReceived: number

  // Issues
  issuesCreated: number
  issuesClosed: number

  // Code Changes
  linesAdded: number
  linesDeleted: number

  // Calculated Metrics
  collaborationScore: number // 0-100
  productivityScore: number // 0-100
  reviewQualityScore: number // 0-100

  updatedAt: Date
}

export interface FilterOptions {
  teams: string[]
  minComments: number
  maxComments: number
  dateRange: {
    start: Date
    end: Date
  }
  sortBy: "name" | "productivity" | "collaboration" | "reviews" | "comments"
  sortOrder: "asc" | "desc"
  metricsFilter: {
    minPRs: number
    minCommits: number
    minCommentCount: number
  }
}
