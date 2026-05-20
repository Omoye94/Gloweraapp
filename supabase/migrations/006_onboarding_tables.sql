-- Onboarding Tables Migration
-- Creates habits, supplements, and garden_progress tables

-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_habits_user_id ON habits(user_id);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own habits"
ON habits FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own habits"
ON habits FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits"
ON habits FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits"
ON habits FOR DELETE USING (auth.uid() = user_id);

-- Create supplements table
CREATE TABLE IF NOT EXISTS supplements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  frequency TEXT DEFAULT 'daily',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_supplements_user_id ON supplements(user_id);

ALTER TABLE supplements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own supplements"
ON supplements FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own supplements"
ON supplements FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own supplements"
ON supplements FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own supplements"
ON supplements FOR DELETE USING (auth.uid() = user_id);

-- Create garden_progress table
CREATE TABLE IF NOT EXISTS garden_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  growth_stage TEXT NOT NULL DEFAULT 'seed',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_garden_progress_user_id ON garden_progress(user_id);

ALTER TABLE garden_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own garden progress"
ON garden_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own garden progress"
ON garden_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own garden progress"
ON garden_progress FOR UPDATE USING (auth.uid() = user_id);

-- Apply updated_at trigger to garden_progress
CREATE TRIGGER update_garden_progress_updated_at
BEFORE UPDATE ON garden_progress
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
