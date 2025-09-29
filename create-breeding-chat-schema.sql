-- Create breeding chat system
-- This script creates tables for managing chats between pet owners who have accepted breeding requests

-- Create chat_rooms table to store chat conversations
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  breeding_match_id UUID REFERENCES breeding_matches(id) ON DELETE CASCADE NOT NULL,
  owner1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  owner2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(breeding_match_id)
);

-- Create chat_messages table to store individual messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_rooms
CREATE POLICY "Users can view their own chat rooms" ON chat_rooms
  FOR SELECT USING (
    auth.uid() = owner1_id OR auth.uid() = owner2_id
  );

CREATE POLICY "Users can create chat rooms for their breeding matches" ON chat_rooms
  FOR INSERT WITH CHECK (
    (auth.uid() = owner1_id OR auth.uid() = owner2_id) AND
    EXISTS (
      SELECT 1 FROM breeding_matches 
      WHERE id = breeding_match_id 
      AND status = 'accepted'
      AND (owner_id = auth.uid() OR partner_owner_id = auth.uid())
    )
  );

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in their chat rooms" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_rooms 
      WHERE id = chat_room_id 
      AND (owner1_id = auth.uid() OR owner2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages to their chat rooms" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM chat_rooms 
      WHERE id = chat_room_id 
      AND (owner1_id = auth.uid() OR owner2_id = auth.uid())
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_rooms_breeding_match_id ON chat_rooms(breeding_match_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_owner1_id ON chat_rooms(owner1_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_owner2_id ON chat_rooms(owner2_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_room_id ON chat_messages(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Add comments
COMMENT ON TABLE chat_rooms IS 'Chat rooms for pet owners with accepted breeding requests';
COMMENT ON TABLE chat_messages IS 'Individual messages within chat rooms';
COMMENT ON COLUMN chat_messages.message_type IS 'Type of message: text, image, or system notification';
