-- Template system v1

-- 1) Templates
CREATE TABLE IF NOT EXISTS public.plan_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  version INTEGER NOT NULL DEFAULT 1,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2) Pages inside template
CREATE TABLE IF NOT EXISTS public.plan_template_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.plan_templates(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  is_optional BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(template_id, page_number)
);

-- 3) Library components scoped to template
CREATE TABLE IF NOT EXISTS public.plan_template_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.plan_templates(id) ON DELETE CASCADE,
  component_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  category TEXT NOT NULL,
  default_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  default_manual_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4) Page component instances
CREATE TABLE IF NOT EXISTS public.plan_template_page_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_page_id UUID NOT NULL REFERENCES public.plan_template_pages(id) ON DELETE CASCADE,
  template_component_id UUID NOT NULL REFERENCES public.plan_template_components(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 1,
  visibility_default BOOLEAN NOT NULL DEFAULT true,
  instance_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  instance_manual_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(template_page_id, position)
);

-- 5) Client plan snapshots
CREATE TABLE IF NOT EXISTS public.client_financial_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_template_id UUID REFERENCES public.plan_templates(id) ON DELETE SET NULL,
  source_template_version INTEGER,
  snapshot_version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_plan_templates_created_by ON public.plan_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_plan_template_pages_template_id ON public.plan_template_pages(template_id);
CREATE INDEX IF NOT EXISTS idx_plan_template_components_template_id ON public.plan_template_components(template_id);
CREATE INDEX IF NOT EXISTS idx_plan_template_page_components_page_id ON public.plan_template_page_components(template_page_id);
CREATE INDEX IF NOT EXISTS idx_client_financial_plans_user_id ON public.client_financial_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_client_financial_plans_source_template_id ON public.client_financial_plans(source_template_id);

ALTER TABLE public.plan_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_template_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_template_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_template_page_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_financial_plans ENABLE ROW LEVEL SECURITY;

-- Super admin full access on template system tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'plan_templates'
      AND policyname = 'Super admins can manage plan templates'
  ) THEN
    CREATE POLICY "Super admins can manage plan templates"
    ON public.plan_templates
    FOR ALL
    USING (has_role(auth.uid(), 'super_admin'::app_role))
    WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'plan_template_pages'
      AND policyname = 'Super admins can manage template pages'
  ) THEN
    CREATE POLICY "Super admins can manage template pages"
    ON public.plan_template_pages
    FOR ALL
    USING (has_role(auth.uid(), 'super_admin'::app_role))
    WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'plan_template_components'
      AND policyname = 'Super admins can manage template components'
  ) THEN
    CREATE POLICY "Super admins can manage template components"
    ON public.plan_template_components
    FOR ALL
    USING (has_role(auth.uid(), 'super_admin'::app_role))
    WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'plan_template_page_components'
      AND policyname = 'Super admins can manage page components'
  ) THEN
    CREATE POLICY "Super admins can manage page components"
    ON public.plan_template_page_components
    FOR ALL
    USING (has_role(auth.uid(), 'super_admin'::app_role))
    WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'client_financial_plans'
      AND policyname = 'Users can view their own client financial plans'
  ) THEN
    CREATE POLICY "Users can view their own client financial plans"
    ON public.client_financial_plans
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'client_financial_plans'
      AND policyname = 'Users can update their own client financial plans'
  ) THEN
    CREATE POLICY "Users can update their own client financial plans"
    ON public.client_financial_plans
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'client_financial_plans'
      AND policyname = 'Super admins can manage all client financial plans'
  ) THEN
    CREATE POLICY "Super admins can manage all client financial plans"
    ON public.client_financial_plans
    FOR ALL
    USING (has_role(auth.uid(), 'super_admin'::app_role))
    WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
  END IF;
END
$$;

CREATE TRIGGER update_plan_templates_updated_at
BEFORE UPDATE ON public.plan_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_plan_template_pages_updated_at
BEFORE UPDATE ON public.plan_template_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_plan_template_components_updated_at
BEFORE UPDATE ON public.plan_template_components
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_plan_template_page_components_updated_at
BEFORE UPDATE ON public.plan_template_page_components
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_client_financial_plans_updated_at
BEFORE UPDATE ON public.client_financial_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();
