import { Octokit } from "@octokit/rest"
import type { GitHubUser, GitHubPullRequest, GitHubComment, PRCommentAnalysis, TeamMember } from "./types"

// GitHub API client for fetching metrics using Octokit
export class GitHubClient {
  private octokit: Octokit

  constructor(token: string, useEnterprise: boolean = false) {
    this.octokit = new Octokit({
      auth: token,
      ...(useEnterprise && { baseUrl: "https://github.hy-vee.cloud/api/v3" })
    })
  }

  async getUser(username: string): Promise<GitHubUser> {
    const { data } = await this.octokit.rest.users.getByUsername({
      username,
    })
    
    return {
      login: data.login,
      id: data.id,
      name: data.name,
      avatar_url: data.avatar_url,
      html_url: data.html_url,
    }
  }

  async getUserPullRequests(
    owner: string,
    repo: string,
    username: string,
    since?: string,
    state: "open" | "closed" | "all" = "all"
  ): Promise<GitHubPullRequest[]> {
    const allPRs: GitHubPullRequest[] = []
    let page = 1
    let hasMore = true

    while (hasMore && page <= 10) { // Limit to 10 pages per repo
      try {
        const { data } = await this.octokit.rest.pulls.list({
          owner,
          repo,
          state,
          per_page: 100,
          page,
          sort: "created",
          direction: "desc",
        })

        if (data.length === 0) {
          hasMore = false
          break
        }

        // Filter by author
        let userPRs = data.filter(pr => pr.user?.login === username)
        
        // Filter by date if since is provided
        if (since) {
          const sinceDate = new Date(since)
          userPRs = userPRs.filter(pr => new Date(pr.created_at) >= sinceDate)
        }

        const mappedPRs = userPRs.map(this.mapPullRequest)
        allPRs.push(...mappedPRs)

        // Check if we have more pages
        if (data.length < 100) {
          hasMore = false
        } else {
          page++
        }

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        console.error(`Error fetching PRs from ${owner}/${repo} page ${page}:`, error)
        hasMore = false
      }
    }

    return allPRs
  }

  async getAllUserPullRequestsFromRepos(
    username: string,
    repositories: Array<{ owner: string; repo: string }>,
    since?: string,
    state: "open" | "closed" | "all" = "all"
  ): Promise<GitHubPullRequest[]> {
    const allPRs: GitHubPullRequest[] = []

    for (const { owner, repo } of repositories) {
      try {
        console.log(`Fetching PRs for ${username} from ${owner}/${repo}`)
        const repoPRs = await this.getUserPullRequests(owner, repo, username, since, state)
        allPRs.push(...repoPRs)
        console.log(`Found ${repoPRs.length} PRs in ${owner}/${repo}`)
      } catch (error) {
        console.error(`Error fetching PRs from ${owner}/${repo}:`, error)
      }
    }

    console.log(`Total PRs found for ${username} across all repos: ${allPRs.length}`)
    return allPRs
  }

  async searchUserPullRequests(
    username: string,
    org?: string,
    since?: string
  ) {
    let repos: any[] = [];
    let page = 1;
    // while (true) {
    //   const res =  this.octokit.search.issuesAndPullRequests({
    //     q: `author:${username} is:pr`,
    //     per_page: 100,
    //     page,
    //   });

    //   repos = repos.concat(res.data.items);

    //   if (res.data.items.length < 100) {
    //     break;
    //   }
    //   page++;
    // }
    return repos;
  }

  async getPullRequestComments(
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<GitHubComment[]> {
    // Get both issue comments and review comments
    const [issueComments, reviewComments] = await Promise.all([
      this.octokit.rest.issues.listComments({
        owner,
        repo,
        issue_number: prNumber,
        per_page: 100,
      }),
      this.octokit.rest.pulls.listReviewComments({
        owner,
        repo,
        pull_number: prNumber,
        per_page: 100,
      }),
    ])

    const allComments = [
      ...issueComments.data.map(comment => ({
        id: comment.id,
        user: {
          login: comment.user?.login || "",
          id: comment.user?.id || 0,
          name: comment.user?.name || null,
          avatar_url: comment.user?.avatar_url || "",
          html_url: comment.user?.html_url || "",
        },
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        body: comment.body || "",
        html_url: comment.html_url,
        author_association: comment.author_association as GitHubComment["author_association"],
      })),
      ...reviewComments.data.map(comment => ({
        id: comment.id,
        user: {
          login: comment.user?.login || "",
          id: comment.user?.id || 0,
          name: comment.user?.name || null,
          avatar_url: comment.user?.avatar_url || "",
          html_url: comment.user?.html_url || "",
        },
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        body: comment.body || "",
        html_url: comment.html_url,
        author_association: comment.author_association as GitHubComment["author_association"],
      })),
    ]

    return allComments.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }

  async analyzePRComments(
    prs: GitHubPullRequest[],
    teamMembers: TeamMember[]
  ): Promise<PRCommentAnalysis[]> {
    const teamMemberUsernames = teamMembers.map(member => member.github_user.github_username)
    
    const analyses = await Promise.all(
      prs.map(async (pr) => {
        try {
          // Parse repository info from PR URL
          const urlParts = pr.html_url.split('/')
          const repoOwner = urlParts[urlParts.length - 4]
          const repoName = urlParts[urlParts.length - 3]
          
          const comments = await this.getPullRequestComments(repoOwner, repoName, pr.number)
          
          const teamMemberComments = comments.filter(comment =>
            teamMemberUsernames.includes(comment.user.login)
          ).length
          
          const externalComments = comments.length - teamMemberComments

          return {
            pr,
            totalComments: comments.length,
            teamMemberComments,
            externalComments,
            comments,
            teamMembersList: teamMemberUsernames,
          }
        } catch (error) {
          console.error(`Error analyzing comments for PR #${pr.number}:`, error)
          return {
            pr,
            totalComments: 0,
            teamMemberComments: 0,
            externalComments: 0,
            comments: [],
            teamMembersList: teamMemberUsernames,
          }
        }
      })
    )

    return analyses
  }

  private mapPullRequest(pr: any): GitHubPullRequest {
    return {
      id: pr.id,
      number: pr.number,
      title: pr.title,
      html_url: pr.html_url,
      state: pr.state,
      created_at: pr.created_at,
      updated_at: pr.updated_at,
      closed_at: pr.closed_at,
      merged_at: pr.merged_at,
      user: {
        login: pr.user?.login || "",
        id: pr.user?.id || 0,
        name: pr.user?.name || null,
        avatar_url: pr.user?.avatar_url || "",
        html_url: pr.user?.html_url || "",
      },
      comments: pr.comments || 0,
      review_comments: pr.review_comments || 0,
      commits: pr.commits || 0,
      additions: pr.additions || 0,
      deletions: pr.deletions || 0,
      changed_files: pr.changed_files || 0,
    }
  }

  async getRepositoryCommits(owner: string, repo: string, author: string, since: string): Promise<any[]> {
    const { data } = await this.octokit.rest.repos.listCommits({
      owner,
      repo,
      author,
      since,
      per_page: 100,
    })
    return data
  }

  async getRepositoryIssues(owner: string, repo: string, creator: string, since: string): Promise<any[]> {
    const { data } = await this.octokit.rest.issues.listForRepo({
      owner,
      repo,
      creator,
      since,
      per_page: 100,
      state: "all",
    })
    return data
  }
}
