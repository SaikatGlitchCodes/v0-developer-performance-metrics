-- Create table to store developer performance metrics per quarter
CREATE TABLE IF NOT EXISTS public.developer_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_user_id UUID NOT NULL REFERENCES public.github_users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  quarter TEXT NOT NULL, -- Format: "2025-Q1"
  prs_created INTEGER DEFAULT 0,
  prs_merged INTEGER DEFAULT 0,
  prs_reviewed INTEGER DEFAULT 0,
  review_comments INTEGER DEFAULT 0,
  commits_count INTEGER DEFAULT 0,
  code_review_quality_score DECIMAL(5, 2) DEFAULT 0, -- 0-100
  productivity_score DECIMAL(5, 2) DEFAULT 0, -- 0-100
  merge_rate DECIMAL(5, 2) DEFAULT 0, -- percentage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(github_user_id, team_id, quarter)
);

-- Enable RLS
ALTER TABLE public.developer_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "developer_metrics_select_all" ON public.developer_metrics FOR SELECT USING (true);
CREATE POLICY "developer_metrics_insert" ON public.developer_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "developer_metrics_update" ON public.developer_metrics FOR UPDATE USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_developer_metrics_user_team ON public.developer_metrics(github_user_id, team_id);
CREATE INDEX IF NOT EXISTS idx_developer_metrics_quarter ON public.developer_metrics(quarter);
CREATE INDEX IF NOT EXISTS idx_developer_metrics_team_quarter ON public.developer_metrics(team_id, quarter);
