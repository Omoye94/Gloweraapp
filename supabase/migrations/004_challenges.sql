-- Challenges Migration
-- Creates tables for user challenges and per-day task/reflection tracking

-- Table: user_challenges
CREATE TABLE IF NOT EXISTS user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only one active challenge per user at a time
CREATE UNIQUE INDEX idx_user_challenges_one_active
ON user_challenges (user_id) WHERE status = 'active';

-- Lookup by user
CREATE INDEX idx_user_challenges_user_id
ON user_challenges (user_id);

-- Updated_at trigger
CREATE TRIGGER update_user_challenges_updated_at
BEFORE UPDATE ON user_challenges
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenges"
ON user_challenges FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own challenges"
ON user_challenges FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges"
ON user_challenges FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own challenges"
ON user_challenges FOR DELETE
USING (auth.uid() = user_id);

-- Table: user_challenge_days
CREATE TABLE IF NOT EXISTS user_challenge_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_challenge_id UUID NOT NULL REFERENCES user_challenges(id) ON DELETE CASCADE,
  day_index INT NOT NULL,
  date DATE NOT NULL,
  task_1_done BOOLEAN DEFAULT FALSE,
  task_2_done BOOLEAN DEFAULT FALSE,
  reflection_text TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- One row per day_index per challenge
CREATE UNIQUE INDEX idx_challenge_days_unique_day
ON user_challenge_days (user_challenge_id, day_index);

-- One row per date per challenge
CREATE UNIQUE INDEX idx_challenge_days_unique_date
ON user_challenge_days (user_challenge_id, date);

-- Lookup by user_challenge
CREATE INDEX idx_challenge_days_challenge
ON user_challenge_days (user_challenge_id);

-- RLS
ALTER TABLE user_challenge_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenge days"
ON user_challenge_days FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own challenge days"
ON user_challenge_days FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenge days"
ON user_challenge_days FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own challenge days"
ON user_challenge_days FOR DELETE
USING (auth.uid() = user_id);
