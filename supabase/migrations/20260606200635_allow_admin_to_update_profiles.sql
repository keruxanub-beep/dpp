-- Allow admin to update any profile (for blocking/unblocking and role changes)
DROP POLICY IF EXISTS "update_own_profile" ON profiles;

CREATE POLICY "update_profiles" ON profiles FOR UPDATE
  TO authenticated USING (
    auth.uid() = id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  ) WITH CHECK (
    auth.uid() = id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
