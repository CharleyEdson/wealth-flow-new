# Supabase Rebuild Runbook

Use this when the original Supabase project has been deleted and you need to reconnect this app to a new project.

## 1) Create a new Supabase project

In Supabase dashboard, create a new project and copy:

- Project URL
- Project anon/public key
- Project reference ID
- Service role key

Enable Email auth in `Authentication -> Providers -> Email`.

## 2) Update local app environment

Edit `.env`:

```bash
VITE_SUPABASE_PROJECT_ID="your_new_project_ref"
VITE_SUPABASE_PUBLISHABLE_KEY="your_new_anon_key"
VITE_SUPABASE_URL="https://your_new_project_ref.supabase.co"
```

## 3) Install and link Supabase CLI

If not installed:

```bash
brew install supabase/tap/supabase
```

Or use npm:

```bash
npx supabase --version
```

Login and link:

```bash
supabase login
supabase link --project-ref your_new_project_ref
```

Then set `supabase/config.toml`:

```toml
project_id = "your_new_project_ref"
```

## 4) Apply all migrations

```bash
supabase db push
```

This provisions tables/policies/functions/triggers from `supabase/migrations`.

## 5) Set function secrets and deploy edge functions

```bash
supabase secrets set SUPABASE_URL=https://your_new_project_ref.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
supabase functions deploy secure-signup
supabase functions deploy calculate-monthly-net-worth
```

## 6) Bootstrap first super admin

1. Sign up a user from the app (open signup is currently enabled).
2. Run this SQL in Supabase SQL editor, replacing the email:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::public.app_role
FROM auth.users
WHERE email = 'you@example.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

Or use the helper file in `supabase/scripts/bootstrap_super_admin.sql`.

## 7) Verify core functionality

- Signup/login/logout works.
- `/home` loads.
- `/admin` loads for super admin only.
- Accounts CRUD works.
- Cash flow CRUD works.
- Statement and business info save works.
- `/plan` enforces auth and loads.

## 8) Optional hardening after recovery

When ready to go back to invite-only:

1. Revert app signup path from `supabase.auth.signUp(...)` to the `secure-signup` function.
2. Hide/remove open signup UX.
3. Disable public self-signup in Supabase Auth settings.
