-- Daily Reflections Migration
-- Creates the daily_reflections table for one reflection per user per day

-- Create the daily_reflections table
CREATE TABLE IF NOT EXISTS daily_reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reflection_date DATE NOT NULL,
  prompt_text TEXT NOT NULL,
  mood TEXT,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index to ensure one reflection per user per day
CREATE UNIQUE INDEX idx_daily_reflections_user_date
ON daily_reflections(user_id, reflection_date);

-- Create index for faster lookups by user
CREATE INDEX idx_daily_reflections_user_id
ON daily_reflections(user_id);

-- Apply updated_at trigger
CREATE TRIGGER update_daily_reflections_updated_at
BEFORE UPDATE ON daily_reflections
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security
ALTER TABLE daily_reflections ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own reflections
CREATE POLICY "Users can view own daily reflections"
ON daily_reflections FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own daily reflections"
ON daily_reflections FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily reflections"
ON daily_reflections FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily reflections"
ON daily_reflections FOR DELETE
USING (auth.uid() = user_id);
