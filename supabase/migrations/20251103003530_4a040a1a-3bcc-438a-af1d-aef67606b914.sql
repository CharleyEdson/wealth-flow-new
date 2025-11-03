-- Create enum for flow types
CREATE TYPE public.flow_type AS ENUM ('inflow', 'outflow');

-- Create enum for inflow categories
CREATE TYPE public.inflow_category AS ENUM (
  'salary',
  'investment_income',
  'interest_income',
  'business_income',
  'other_income'
);

-- Create enum for outflow categories
CREATE TYPE public.outflow_category AS ENUM (
  'savings',
  'transfers',
  'expenses',
  'debt_payments'
);

-- Create cash_flow_items table
CREATE TABLE public.cash_flow_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  flow_type flow_type NOT NULL,
  inflow_category inflow_category,
  outflow_category outflow_category,
  frequency TEXT NOT NULL DEFAULT 'monthly',
  linked_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CHECK (
    (flow_type = 'inflow' AND inflow_category IS NOT NULL AND outflow_category IS NULL) OR
    (flow_type = 'outflow' AND outflow_category IS NOT NULL AND inflow_category IS NULL)
  )
);

-- Add savings_amount to accounts table
ALTER TABLE public.accounts
ADD COLUMN savings_amount NUMERIC DEFAULT 0;

-- Enable RLS on cash_flow_items
ALTER TABLE public.cash_flow_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cash_flow_items
CREATE POLICY "Users can view their own cash flow items"
  ON public.cash_flow_items
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cash flow items"
  ON public.cash_flow_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cash flow items"
  ON public.cash_flow_items
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cash flow items"
  ON public.cash_flow_items
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all cash flow items"
  ON public.cash_flow_items
  FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can manage all cash flow items"
  ON public.cash_flow_items
  FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_cash_flow_items_updated_at
  BEFORE UPDATE ON public.cash_flow_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Create indexes
CREATE INDEX idx_cash_flow_items_user_id ON public.cash_flow_items(user_id);
CREATE INDEX idx_cash_flow_items_flow_type ON public.cash_flow_items(flow_type);
CREATE INDEX idx_cash_flow_items_linked_account ON public.cash_flow_items(linked_account_id);