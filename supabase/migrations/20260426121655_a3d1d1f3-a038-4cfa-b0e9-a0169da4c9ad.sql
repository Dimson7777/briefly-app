-- Drop old SignalDesk tables (cascade to child rows)
DROP TABLE IF EXISTS public.signals CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.interactions CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;

-- Slim profiles down for Briefly (drop unused stripe columns if present)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS stripe_customer_id;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS stripe_subscription_id;

-- Briefs
CREATE TABLE public.briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  client_name TEXT,
  client_company TEXT,
  project_type TEXT,
  deadline DATE,
  budget_min INTEGER,
  budget_max INTEGER,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','needs_changes','approved')),
  raw_notes TEXT,
  overview TEXT,
  goals TEXT,
  revision_limit INTEGER DEFAULT 2,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX briefs_user_idx ON public.briefs (user_id, updated_at DESC);

ALTER TABLE public.briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY briefs_all_own ON public.briefs
  FOR ALL TO public
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_briefs_updated_at
  BEFORE UPDATE ON public.briefs
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Deliverables
CREATE TABLE public.deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID NOT NULL REFERENCES public.briefs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX deliverables_brief_idx ON public.deliverables (brief_id, sort_order);

ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY deliverables_all_own ON public.deliverables
  FOR ALL TO public
  USING (EXISTS (SELECT 1 FROM public.briefs b WHERE b.id = brief_id AND b.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.briefs b WHERE b.id = brief_id AND b.user_id = auth.uid()));

-- Exclusions
CREATE TABLE public.exclusions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID NOT NULL REFERENCES public.briefs(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX exclusions_brief_idx ON public.exclusions (brief_id);

ALTER TABLE public.exclusions ENABLE ROW LEVEL SECURITY;

CREATE POLICY exclusions_all_own ON public.exclusions
  FOR ALL TO public
  USING (EXISTS (SELECT 1 FROM public.briefs b WHERE b.id = brief_id AND b.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.briefs b WHERE b.id = brief_id AND b.user_id = auth.uid()));

-- Assumptions
CREATE TABLE public.assumptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID NOT NULL REFERENCES public.briefs(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX assumptions_brief_idx ON public.assumptions (brief_id);

ALTER TABLE public.assumptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY assumptions_all_own ON public.assumptions
  FOR ALL TO public
  USING (EXISTS (SELECT 1 FROM public.briefs b WHERE b.id = brief_id AND b.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.briefs b WHERE b.id = brief_id AND b.user_id = auth.uid()));

-- Timeline items
CREATE TABLE public.timeline_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID NOT NULL REFERENCES public.briefs(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  due_date DATE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX timeline_items_brief_idx ON public.timeline_items (brief_id, sort_order);

ALTER TABLE public.timeline_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY timeline_items_all_own ON public.timeline_items
  FOR ALL TO public
  USING (EXISTS (SELECT 1 FROM public.briefs b WHERE b.id = brief_id AND b.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.briefs b WHERE b.id = brief_id AND b.user_id = auth.uid()));