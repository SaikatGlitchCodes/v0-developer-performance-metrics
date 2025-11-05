// GitHub API client for fetching metrics
interface GitHubUser {
  login: string
  id: number
  avatar_url: string
}

interface GitHubPullRequest {
  id: number
  number: number
  title: string
  user: GitHubUser
  created_at: string
  merged_at: string | null
  closed_at: string | null
  draft: boolean
  review_comments: number
  comments: number
}

interface GitHubCommit {
  commit: {
    message: string
    author: {
      date: string
    }
  }
  author: GitHubUser | null
}

interface GitHubIssue {
  number: number
  title: string
  user: GitHubUser
  created_at: string
  closed_at: string | null
  comments: number
}

export class GitHubClient {
  private token: string
  private baseUrl = "https://api.github.com"

  constructor(token: string) {
    this.token = token
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/vnd.github.v3+json",
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getUserPullRequests(
    owner: string,
    repo: string,
    username: string,
    since: string,
  ): Promise<GitHubPullRequest[]> {
    const prs = await this.fetch<GitHubPullRequest[]>(
      `/repos/${owner}/${repo}/pulls?state=all&creator=${username}&since=${since}&per_page=100`,
    )
    return prs
  }

  async getPullRequestReviews(owner: string, repo: string, prNumber: number): Promise<any[]> {
    return this.fetch(`/repos/${owner}/${repo}/pulls/${prNumber}/reviews?per_page=100`)
  }

  async getRepositoryCommits(owner: string, repo: string, author: string, since: string): Promise<GitHubCommit[]> {
    const commits = await this.fetch<GitHubCommit[]>(
      `/repos/${owner}/${repo}/commits?author=${author}&since=${since}&per_page=100`,
    )
    return commits
  }

  async getRepositoryIssues(owner: string, repo: string, creator: string, since: string): Promise<GitHubIssue[]> {
    const issues = await this.fetch<GitHubIssue[]>(
      `/repos/${owner}/${repo}/issues?state=all&creator=${creator}&since=${since}&per_page=100`,
    )
    return issues
  }

  async getUser(username: string): Promise<GitHubUser> {
    return this.fetch(`/users/${username}`)
  }
}
