-- Create financial_plans table
CREATE TABLE public.financial_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.financial_plans ENABLE ROW LEVEL SECURITY;

-- Super admins can manage all plans
CREATE POLICY "Super admins can manage all financial plans"
ON public.financial_plans
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Users can view their own plan
CREATE POLICY "Users can view their own financial plan"
ON public.financial_plans
FOR SELECT
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_financial_plans_updated_at
BEFORE UPDATE ON public.financial_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();