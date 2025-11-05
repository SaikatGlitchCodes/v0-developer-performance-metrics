-- Create table to store individual PR comments with author info
CREATE TABLE IF NOT EXISTS public.pr_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_comment_id INTEGER NOT NULL UNIQUE,
  pull_request_id UUID NOT NULL REFERENCES public.pull_requests(id) ON DELETE CASCADE,
  github_user_id UUID REFERENCES public.github_users(id) ON DELETE SET NULL,
  comment_author_username TEXT NOT NULL,
  comment_body TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  stored_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create table to store comment analysis per PR (team members vs others)
CREATE TABLE IF NOT EXISTS public.pr_comment_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pull_request_id UUID NOT NULL REFERENCES public.pull_requests(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  total_comments INTEGER DEFAULT 0,
  team_member_comments INTEGER DEFAULT 0,
  external_comments INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(pull_request_id, team_id)
);

-- Enable RLS
ALTER TABLE public.pr_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pr_comment_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "pr_comments_select_all" ON public.pr_comments FOR SELECT USING (true);
CREATE POLICY "pr_comments_insert" ON public.pr_comments FOR INSERT WITH CHECK (true);

CREATE POLICY "pr_comment_analysis_select_all" ON public.pr_comment_analysis FOR SELECT USING (true);
CREATE POLICY "pr_comment_analysis_insert" ON public.pr_comment_analysis FOR INSERT WITH CHECK (true);
CREATE POLICY "pr_comment_analysis_update" ON public.pr_comment_analysis FOR UPDATE USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pr_comments_pr ON public.pr_comments(pull_request_id);
CREATE INDEX IF NOT EXISTS idx_pr_comments_author ON public.pr_comments(comment_author_username);
CREATE INDEX IF NOT EXISTS idx_pr_comment_analysis_team ON public.pr_comment_analysis(team_id);
CREATE INDEX IF NOT EXISTS idx_pr_comment_analysis_pr ON public.pr_comment_analysis(pull_request_id);
