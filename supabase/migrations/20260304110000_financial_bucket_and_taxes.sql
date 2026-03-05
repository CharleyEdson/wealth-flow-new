-- Add financial bucket classification to accounts and support taxes cash-flow category.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'financial_bucket') THEN
    CREATE TYPE public.financial_bucket AS ENUM (
      'cash',
      'after_tax',
      'pre_tax',
      'real_estate',
      'business',
      'debt'
    );
  END IF;
END
$$;

ALTER TABLE public.accounts
ADD COLUMN IF NOT EXISTS financial_bucket public.financial_bucket;

UPDATE public.accounts
SET financial_bucket = CASE account_type
  WHEN 'checking_account' THEN 'cash'::public.financial_bucket
  WHEN 'savings_account' THEN 'cash'::public.financial_bucket
  WHEN 'brokerage_account' THEN 'after_tax'::public.financial_bucket
  WHEN 'roth_ira' THEN 'after_tax'::public.financial_bucket
  WHEN 'ira' THEN 'pre_tax'::public.financial_bucket
  WHEN 'traditional_401k' THEN 'pre_tax'::public.financial_bucket
  WHEN 'roth_401k' THEN 'pre_tax'::public.financial_bucket
  WHEN 'primary_residence' THEN 'real_estate'::public.financial_bucket
  WHEN 'rental_property' THEN 'real_estate'::public.financial_bucket
  WHEN 'business' THEN 'business'::public.financial_bucket
  WHEN 'credit_card' THEN 'debt'::public.financial_bucket
  WHEN 'student_loan' THEN 'debt'::public.financial_bucket
  WHEN 'mortgage' THEN 'debt'::public.financial_bucket
  WHEN 'auto_loan' THEN 'debt'::public.financial_bucket
  WHEN 'other_loan' THEN 'debt'::public.financial_bucket
  ELSE 'after_tax'::public.financial_bucket
END
WHERE financial_bucket IS NULL;

ALTER TABLE public.accounts
ALTER COLUMN financial_bucket SET DEFAULT 'after_tax'::public.financial_bucket;

ALTER TABLE public.accounts
ALTER COLUMN financial_bucket SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_accounts_financial_bucket
  ON public.accounts(financial_bucket);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'outflow_category' AND e.enumlabel = 'taxes'
  ) THEN
    ALTER TYPE public.outflow_category ADD VALUE 'taxes';
  END IF;
END
$$;
