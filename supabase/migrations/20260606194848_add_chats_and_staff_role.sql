-- Add staff role support
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin', 'staff'));

-- Create chats table for Telegram-like conversations
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'claimed', 'closed')),
  subject TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ
);

ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Anyone can see their own chats; staff/admin can see all open/claimed
CREATE POLICY "select_chats" ON chats FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id OR 
    auth.uid() = staff_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

-- Any authenticated user can create a chat
CREATE POLICY "insert_chats" ON chats FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Staff can claim (update staff_id, status) and close chats; admin can do anything
CREATE POLICY "update_chats" ON chats FOR UPDATE
  TO authenticated USING (
    auth.uid() = staff_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Only admin can delete chats
CREATE POLICY "delete_chats" ON chats FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create chat_messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Participants of a chat can see messages; staff/admin too
CREATE POLICY "select_chat_messages" ON chat_messages FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM chats WHERE id = chat_id AND (chats.user_id = auth.uid() OR chats.staff_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))))
  );

-- Only chat participants can send messages
CREATE POLICY "insert_chat_messages" ON chat_messages FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (SELECT 1 FROM chats WHERE id = chat_id AND (chats.user_id = auth.uid() OR chats.staff_id = auth.uid()) AND chats.status IN ('open', 'claimed'))
  );

-- No update/delete on messages
CREATE POLICY "delete_chat_messages" ON chat_messages FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
