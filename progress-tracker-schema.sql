-- Progress & Performance Tracker Database Schema
-- Run this SQL in your Supabase SQL Editor after running database-schema.sql

-- Create progress_semester_performance table
CREATE TABLE IF NOT EXISTS progress_semester_performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 8),
  subject_name TEXT NOT NULL,
  cie1 DECIMAL(5,2) NOT NULL CHECK (cie1 >= 0 AND cie1 <= 20),
  cie2 DECIMAL(5,2) NOT NULL CHECK (cie2 >= 0 AND cie2 <= 20),
  cie3 DECIMAL(5,2) CHECK (cie3 >= 0 AND cie3 <= 20),
  internal DECIMAL(5,2) NOT NULL CHECK (internal >= 0 AND internal <= 40),
  end_sem DECIMAL(5,2) NOT NULL CHECK (end_sem >= 0 AND end_sem <= 60),
  total DECIMAL(5,2) NOT NULL CHECK (total >= 0 AND total <= 100),
  status TEXT NOT NULL CHECK (status IN ('PASS', 'INTERNAL_BACK', 'EXTERNAL_BACK', 'SEMESTER_BACK')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create progress_sgpa_trajectory table
CREATE TABLE IF NOT EXISTS progress_sgpa_trajectory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 8),
  sgpa DECIMAL(4,2) NOT NULL CHECK (sgpa >= 0 AND sgpa <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id, semester)
);

-- Create indexes for progress tables
CREATE INDEX IF NOT EXISTS idx_progress_semester_performance_user_id ON progress_semester_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_semester_performance_semester ON progress_semester_performance(semester);
CREATE INDEX IF NOT EXISTS idx_progress_sgpa_trajectory_user_id ON progress_sgpa_trajectory(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_sgpa_trajectory_semester ON progress_sgpa_trajectory(semester);

-- Enable RLS for progress tables
ALTER TABLE progress_semester_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_sgpa_trajectory ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own progress" ON progress_semester_performance;
DROP POLICY IF EXISTS "Users can insert own progress" ON progress_semester_performance;
DROP POLICY IF EXISTS "Users can update own progress" ON progress_semester_performance;
DROP POLICY IF EXISTS "Users can delete own progress" ON progress_semester_performance;
DROP POLICY IF EXISTS "Users can view own sgpa" ON progress_sgpa_trajectory;
DROP POLICY IF EXISTS "Users can insert own sgpa" ON progress_sgpa_trajectory;
DROP POLICY IF EXISTS "Users can update own sgpa" ON progress_sgpa_trajectory;

-- Create policies for progress_semester_performance
CREATE POLICY "Users can view own progress" ON progress_semester_performance
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own progress" ON progress_semester_performance
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own progress" ON progress_semester_performance
  FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete own progress" ON progress_semester_performance
  FOR DELETE
  USING (true);

-- Create policies for progress_sgpa_trajectory
CREATE POLICY "Users can view own sgpa" ON progress_sgpa_trajectory
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own sgpa" ON progress_sgpa_trajectory
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own sgpa" ON progress_sgpa_trajectory
  FOR UPDATE
  USING (true);

