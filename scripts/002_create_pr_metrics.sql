-- Create table to store PR metrics for each team
CREATE TABLE IF NOT EXISTS public.pr_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  quarter TEXT NOT NULL, -- Format: "2025-Q1", "2025-Q2", etc.
  year_month TEXT NOT NULL, -- Format: "2025-01", "2025-02", etc.
  total_prs INTEGER DEFAULT 0,
  total_pr_comments INTEGER DEFAULT 0,
  avg_comments_per_pr DECIMAL(10, 2) DEFAULT 0,
  developers_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, quarter)
);

-- Create table to store individual PR data
CREATE TABLE IF NOT EXISTS public.pull_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_pr_id INTEGER NOT NULL UNIQUE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  github_user_id UUID NOT NULL REFERENCES public.github_users(id) ON DELETE CASCADE,
  pr_number INTEGER NOT NULL,
  pr_title TEXT NOT NULL,
  pr_url TEXT,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  merged_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'open', -- open, merged, closed
  stored_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.pr_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pull_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "pr_metrics_select_all" ON public.pr_metrics FOR SELECT USING (true);
CREATE POLICY "pr_metrics_insert" ON public.pr_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "pr_metrics_update" ON public.pr_metrics FOR UPDATE USING (true);

CREATE POLICY "prs_select_all" ON public.pull_requests FOR SELECT USING (true);
CREATE POLICY "prs_insert" ON public.pull_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "prs_update" ON public.pull_requests FOR UPDATE USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pr_metrics_team_quarter ON public.pr_metrics(team_id, quarter);
CREATE INDEX IF NOT EXISTS idx_pull_requests_team ON public.pull_requests(team_id);
CREATE INDEX IF NOT EXISTS idx_pull_requests_created ON public.pull_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_pull_requests_github_user ON public.pull_requests(github_user_id);
