-- Run this in the Supabase SQL editor to set up your database

CREATE TABLE plan_days (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  exercises JSONB NOT NULL DEFAULT '[]',
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE workout_history (
  id BIGSERIAL PRIMARY KEY,
  day_id TEXT NOT NULL,
  title TEXT NOT NULL,
  date BIGINT NOT NULL,
  ex_count INTEGER DEFAULT 0,
  moved INTEGER DEFAULT 0
);

CREATE TABLE last_values (
  key TEXT PRIMARY KEY,
  value NUMERIC NOT NULL
);

CREATE TABLE done_this_week (
  day_id TEXT PRIMARY KEY,
  week_start BIGINT NOT NULL
);

CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Disable RLS (personal app, no user accounts needed)
ALTER TABLE plan_days DISABLE ROW LEVEL SECURITY;
ALTER TABLE workout_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE last_values DISABLE ROW LEVEL SECURITY;
ALTER TABLE done_this_week DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings DISABLE ROW LEVEL SECURITY;
