/*
# Fix RLS policies and add defaults for proper functionality

## Problems Fixed
1. `chats` INSERT policy only allows `auth.uid() = user_id`, but admin needs to create chats for other users
2. `chats` UPDATE policy doesn't allow staff (who aren't yet staff_id) to claim open chats via direct SQL
3. `adoption_requests.user_id` missing DEFAULT auth.uid() - causes insert failures when frontend omits user_id
4. `favorites.user_id` missing DEFAULT auth.uid() - causes insert failures when frontend omits user_id
5. `chat_messages` insert should also work for admin messaging in a chat they created

## Changes
- `chats` INSERT: allow admin/staff to create chats for any user
- `chats` UPDATE: allow admin/staff to update any chat (claiming, closing)
- `adoption_requests.user_id`: add DEFAULT auth.uid()
- `favorites.user_id`: add DEFAULT auth.uid()
- `adoption_requests` INSERT: fix to work with DEFAULT user_id
*/

-- Fix chats INSERT policy: allow admin/staff to create chats for any user
DROP POLICY IF EXISTS "insert_chats" ON chats;
CREATE POLICY "insert_chats" ON chats FOR INSERT
TO authenticated WITH CHECK (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);

-- Fix chats UPDATE policy: allow admin/staff to update any chat
DROP POLICY IF EXISTS "update_chats" ON chats;
CREATE POLICY "update_chats" ON chats FOR UPDATE
TO authenticated USING (
  auth.uid() = staff_id OR
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
) WITH CHECK (
  auth.uid() = staff_id OR
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);

-- Fix adoption_requests: add DEFAULT auth.uid() so frontend inserts work
ALTER TABLE adoption_requests ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Fix favorites: add DEFAULT auth.uid() so frontend inserts work
ALTER TABLE favorites ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Fix chat_messages INSERT: also allow admin to send messages in any active chat
DROP POLICY IF EXISTS "insert_chat_messages" ON chat_messages;
CREATE POLICY "insert_chat_messages" ON chat_messages FOR INSERT
TO authenticated WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM chats
    WHERE id = chat_id AND (
      chats.user_id = auth.uid() OR
      chats.staff_id = auth.uid() OR
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
    )
    AND chats.status IN ('open', 'claimed')
  )
);
