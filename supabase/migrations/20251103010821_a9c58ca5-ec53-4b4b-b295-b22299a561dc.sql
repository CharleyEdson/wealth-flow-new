-- Fix invite code enumeration vulnerability
DROP POLICY IF EXISTS "Anyone can view unused codes for validation" ON invite_codes;

-- Create a more secure policy that only allows super admins to view invite codes
CREATE POLICY "Only super admins can view invite codes"
ON invite_codes FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

-- Add explicit DELETE policy for statements_of_purpose
CREATE POLICY "Only super admins can delete statements"
ON statements_of_purpose FOR DELETE
USING (has_role(auth.uid(), 'super_admin'));