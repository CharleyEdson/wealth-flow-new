-- Promote a user to super_admin by email.
-- Replace the email literal before running.

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::public.app_role
FROM auth.users
WHERE email = 'you@example.com'
ON CONFLICT (user_id, role) DO NOTHING;
