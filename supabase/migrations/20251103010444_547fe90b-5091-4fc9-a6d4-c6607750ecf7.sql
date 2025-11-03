-- Add RLS policies to allow users to manage their own accounts

-- Allow users to insert their own accounts
CREATE POLICY "Users can insert their own accounts"
ON accounts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own accounts
CREATE POLICY "Users can update their own accounts"
ON accounts FOR UPDATE
USING (auth.uid() = user_id);

-- Allow users to delete their own accounts
CREATE POLICY "Users can delete their own accounts"
ON accounts FOR DELETE
USING (auth.uid() = user_id);