-- Weekly Reflections Migration
-- Adds support for weekly recaps in the daily_reflections table

-- Add new columns for reflection type and period tracking
ALTER TABLE daily_reflections
ADD COLUMN IF NOT EXISTS reflection_type TEXT NOT NULL DEFAULT 'daily',
ADD COLUMN IF NOT EXISTS period_start DATE,
ADD COLUMN IF NOT EXISTS period_end DATE;

-- Backfill existing daily rows: set period_start = reflection_date
UPDATE daily_reflections
SET period_start = reflection_date
WHERE reflection_type = 'daily' AND period_start IS NULL;

-- Create unique index for weekly reflections (one per user per week)
CREATE UNIQUE INDEX IF NOT EXISTS idx_weekly_reflections_user_period
ON daily_reflections(user_id, reflection_type, period_start)
WHERE reflection_type = 'weekly';

-- Create index for faster lookups by reflection type
CREATE INDEX IF NOT EXISTS idx_daily_reflections_type
ON daily_reflections(reflection_type);

-- Note: The existing unique index on (user_id, reflection_date) remains for daily rows
-- RLS policies already in place will continue to work since they check auth.uid() = user_id
