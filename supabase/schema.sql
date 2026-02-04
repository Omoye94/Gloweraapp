-- Glowera Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE habit_category AS ENUM ('nutrition', 'movement', 'supplements', 'hobbies', 'self_care', 'reflection');
CREATE TYPE habit_frequency AS ENUM ('daily', 'weekly', 'custom');
CREATE TYPE completion_type AS ENUM ('gently', 'fully');
CREATE TYPE plant_growth_stage AS ENUM ('seed', 'sprout', 'bud', 'bloom', 'glow');
CREATE TYPE reminder_preference AS ENUM ('gentle', 'minimal', 'none');
CREATE TYPE point_source AS ENUM ('habit_gently', 'habit_fully', 'daily_complete', 'challenge', 'reflection');

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  focus_areas TEXT[] DEFAULT '{}',
  reminder_preference reminder_preference DEFAULT 'gentle',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habits table
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category habit_category NOT NULL,
  icon TEXT DEFAULT 'star',
  color TEXT DEFAULT '#E8B4CB',
  frequency habit_frequency DEFAULT 'daily',
  custom_days TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habit completions table
CREATE TABLE habit_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  completed_at DATE NOT NULL DEFAULT CURRENT_DATE,
  completion_type completion_type NOT NULL,
  points_earned INTEGER NOT NULL DEFAULT 0,
  UNIQUE(habit_id, completed_at)
);

-- Plants table (Glow Garden)
CREATE TABLE plants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'My Glow Plant',
  plant_type TEXT DEFAULT 'default',
  growth_stage plant_growth_stage DEFAULT 'seed',
  growth_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Challenges table
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 7,
  habit_prompts JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenge participations table
CREATE TABLE challenge_participations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  days_completed INTEGER DEFAULT 0,
  UNIQUE(user_id, challenge_id)
);

-- Reflections table
CREATE TABLE reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  mood TEXT,
  prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community pods table
CREATE TABLE community_pods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  max_members INTEGER DEFAULT 8,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pod memberships table
CREATE TABLE pod_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pod_id UUID NOT NULL REFERENCES community_pods(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pod_id, user_id)
);

-- Pod messages table
CREATE TABLE pod_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pod_id UUID NOT NULL REFERENCES community_pods(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  emoji_reactions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Points ledger table
CREATE TABLE points_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  source point_source NOT NULL,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habit_completions_user_id ON habit_completions(user_id);
CREATE INDEX idx_habit_completions_completed_at ON habit_completions(completed_at);
CREATE INDEX idx_plants_user_id ON plants(user_id);
CREATE INDEX idx_challenge_participations_user_id ON challenge_participations(user_id);
CREATE INDEX idx_reflections_user_id ON reflections(user_id);
CREATE INDEX idx_pod_memberships_user_id ON pod_memberships(user_id);
CREATE INDEX idx_pod_messages_pod_id ON pod_messages(pod_id);
CREATE INDEX idx_points_ledger_user_id ON points_ledger(user_id);

-- Helper functions
CREATE OR REPLACE FUNCTION increment_user_points(user_id UUID, points_to_add INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET total_points = total_points + points_to_add,
      updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_plant_points(user_id UUID, points_to_add INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE plants
  SET growth_points = growth_points + points_to_add,
      updated_at = NOW()
  WHERE plants.user_id = increment_plant_points.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_plants_updated_at BEFORE UPDATE ON plants
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE pod_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE pod_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_ledger ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Habits policies
CREATE POLICY "Users can view own habits" ON habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own habits" ON habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habits" ON habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own habits" ON habits FOR DELETE USING (auth.uid() = user_id);

-- Habit completions policies
CREATE POLICY "Users can view own completions" ON habit_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own completions" ON habit_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own completions" ON habit_completions FOR DELETE USING (auth.uid() = user_id);

-- Plants policies
CREATE POLICY "Users can view own plant" ON plants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own plant" ON plants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own plant" ON plants FOR UPDATE USING (auth.uid() = user_id);

-- Challenges policies (public read)
CREATE POLICY "Anyone can view active challenges" ON challenges FOR SELECT USING (is_active = true);

-- Challenge participations policies
CREATE POLICY "Users can view own participations" ON challenge_participations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own participations" ON challenge_participations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own participations" ON challenge_participations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own participations" ON challenge_participations FOR DELETE USING (auth.uid() = user_id);

-- Reflections policies
CREATE POLICY "Users can view own reflections" ON reflections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own reflections" ON reflections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own reflections" ON reflections FOR DELETE USING (auth.uid() = user_id);

-- Community pods policies (public read)
CREATE POLICY "Anyone can view pods" ON community_pods FOR SELECT USING (true);

-- Pod memberships policies
CREATE POLICY "Users can view pod memberships" ON pod_memberships FOR SELECT USING (true);
CREATE POLICY "Users can join pods" ON pod_memberships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave pods" ON pod_memberships FOR DELETE USING (auth.uid() = user_id);

-- Pod messages policies (pod members only)
CREATE POLICY "Pod members can view messages" ON pod_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM pod_memberships WHERE pod_id = pod_messages.pod_id AND user_id = auth.uid()));
CREATE POLICY "Pod members can send messages" ON pod_messages FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM pod_memberships WHERE pod_id = pod_messages.pod_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own messages" ON pod_messages FOR UPDATE USING (auth.uid() = user_id);

-- Points ledger policies
CREATE POLICY "Users can view own points" ON points_ledger FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add own points" ON points_ledger FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Seed initial challenges
INSERT INTO challenges (title, description, duration_days, habit_prompts) VALUES
(
  'Romanticize Your Morning',
  'Transform your mornings into a beautiful ritual. 7 days of gentle morning habits to help you start each day with intention and joy.',
  7,
  '[
    {"day": 1, "prompt": "Wake up 15 minutes earlier and stretch gently", "category": "movement"},
    {"day": 2, "prompt": "Prepare a nourishing breakfast you love", "category": "nutrition"},
    {"day": 3, "prompt": "Write 3 things you are grateful for", "category": "reflection"},
    {"day": 4, "prompt": "Do a 5-minute skincare routine mindfully", "category": "self_care"},
    {"day": 5, "prompt": "Listen to music that makes you feel alive", "category": "hobbies"},
    {"day": 6, "prompt": "Take your vitamins with intention", "category": "supplements"},
    {"day": 7, "prompt": "Reflect on your week of beautiful mornings", "category": "reflection"}
  ]'
),
(
  'Soft Girl Reset',
  'A gentle 10-day reset focused on self-compassion, rest, and nurturing your inner softness.',
  10,
  '[
    {"day": 1, "prompt": "Give yourself permission to rest today", "category": "self_care"},
    {"day": 2, "prompt": "Drink extra water and add something you enjoy to it", "category": "nutrition"},
    {"day": 3, "prompt": "Move your body in a way that feels like play", "category": "movement"},
    {"day": 4, "prompt": "Write a love letter to yourself", "category": "reflection"},
    {"day": 5, "prompt": "Take a slow, mindful walk outside", "category": "movement"},
    {"day": 6, "prompt": "Nourish yourself with a homemade meal", "category": "nutrition"},
    {"day": 7, "prompt": "Do something creative just for fun", "category": "hobbies"},
    {"day": 8, "prompt": "Practice saying no to one thing that drains you", "category": "self_care"},
    {"day": 9, "prompt": "Take your supplements and feel gratitude for your body", "category": "supplements"},
    {"day": 10, "prompt": "Celebrate how far you have come", "category": "reflection"}
  ]'
),
(
  'Glow From the Inside',
  'A 14-day journey focusing on inner wellness through nutrition, supplements, and mindful eating.',
  14,
  '[
    {"day": 1, "prompt": "Start your day with warm lemon water", "category": "nutrition"},
    {"day": 2, "prompt": "Take your vitamins and notice how they support you", "category": "supplements"},
    {"day": 3, "prompt": "Eat one meal without screens", "category": "nutrition"},
    {"day": 4, "prompt": "Add an extra serving of vegetables today", "category": "nutrition"},
    {"day": 5, "prompt": "Try a new healthy recipe", "category": "hobbies"},
    {"day": 6, "prompt": "Research a supplement that could support your goals", "category": "supplements"},
    {"day": 7, "prompt": "Reflect on how food makes you feel", "category": "reflection"},
    {"day": 8, "prompt": "Prep healthy snacks for the week", "category": "nutrition"},
    {"day": 9, "prompt": "Take your supplements consistently", "category": "supplements"},
    {"day": 10, "prompt": "Cook a colorful plate", "category": "nutrition"},
    {"day": 11, "prompt": "Stay hydrated - aim for 8 glasses", "category": "nutrition"},
    {"day": 12, "prompt": "Notice how your energy has changed", "category": "reflection"},
    {"day": 13, "prompt": "Share a healthy meal with someone you love", "category": "nutrition"},
    {"day": 14, "prompt": "Celebrate your inner glow journey", "category": "reflection"}
  ]'
),
(
  'That Girl Energy (Gentle Edition)',
  'Embrace productive, healthy habits without the pressure. 7 days of gentle productivity and self-improvement.',
  7,
  '[
    {"day": 1, "prompt": "Make your bed and tidy one space", "category": "self_care"},
    {"day": 2, "prompt": "Move your body for at least 20 minutes", "category": "movement"},
    {"day": 3, "prompt": "Plan and prepare a nourishing meal", "category": "nutrition"},
    {"day": 4, "prompt": "Read or learn something new for 15 minutes", "category": "hobbies"},
    {"day": 5, "prompt": "Do a morning and evening skincare routine", "category": "self_care"},
    {"day": 6, "prompt": "Journal about your goals and dreams", "category": "reflection"},
    {"day": 7, "prompt": "Celebrate being your own version of that girl", "category": "reflection"}
  ]'
);

-- Seed initial community pods
INSERT INTO community_pods (name, max_members) VALUES
('Morning Glow Circle', 8),
('Soft Reset Squad', 8),
('Wellness Wanderers', 8),
('Gentle Growth Garden', 8),
('Self-Care Sunflowers', 8);
