-- Ensure one plan per user so upsert(user_id) is valid
CREATE UNIQUE INDEX IF NOT EXISTS idx_financial_plans_user_id_unique
ON public.financial_plans(user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'financial_plans'
      AND policyname = 'Users can insert their own financial plan'
  ) THEN
    CREATE POLICY "Users can insert their own financial plan"
    ON public.financial_plans
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'financial_plans'
      AND policyname = 'Users can update their own financial plan'
  ) THEN
    CREATE POLICY "Users can update their own financial plan"
    ON public.financial_plans
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;
