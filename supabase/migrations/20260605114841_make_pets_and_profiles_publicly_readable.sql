-- Make pets readable by anyone (including anonymous users)
-- Drop the existing select policy that requires authentication
DROP POLICY IF EXISTS "select_pets" ON pets;

-- Create new policy that allows anyone to read pets
CREATE POLICY "select_pets_public" ON pets FOR SELECT
  TO anon, authenticated USING (true);

-- Also make profiles readable by their owner even for anon page display
-- The existing select_own_profile is fine, but let's allow anyone to see basic profile info for pet cards
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_profiles" ON profiles FOR SELECT
  TO anon, authenticated USING (true);
