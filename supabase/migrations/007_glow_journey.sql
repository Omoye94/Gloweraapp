-- Journey events timeline
CREATE TABLE IF NOT EXISTS journey_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_journey_events_user_id ON journey_events(user_id);
CREATE INDEX idx_journey_events_created_at ON journey_events(user_id, created_at DESC);

ALTER TABLE journey_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journey_events" ON journey_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own journey_events" ON journey_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own journey_events" ON journey_events FOR DELETE USING (auth.uid() = user_id);

-- Future self messages
CREATE TABLE IF NOT EXISTS future_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  deliver_at TIMESTAMPTZ NOT NULL,
  delivered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_future_messages_user_id ON future_messages(user_id);
CREATE INDEX idx_future_messages_deliver ON future_messages(user_id, delivered, deliver_at);

ALTER TABLE future_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own future_messages" ON future_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own future_messages" ON future_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own future_messages" ON future_messages FOR UPDATE USING (auth.uid() = user_id);
