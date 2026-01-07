-- Database Schema for CosmoStudy Grade Calculator
-- Run this SQL in your Supabase SQL Editor

-- Create users table with all student details
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Remove old roll_no column if it exists (migration from old schema)
ALTER TABLE users DROP COLUMN IF EXISTS roll_no;

-- Add columns if they don't exist (handles both new and existing tables)
ALTER TABLE users ADD COLUMN IF NOT EXISTS admission_no TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS registration_no TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS student_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile TEXT;

-- Create unique indexes (will be ignored if they already exist)
CREATE UNIQUE INDEX IF NOT EXISTS users_admission_no_unique ON users(admission_no) WHERE admission_no IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_registration_no_unique ON users(registration_no) WHERE registration_no IS NOT NULL;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_registration_no ON users(registration_no);
CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile);
CREATE INDEX IF NOT EXISTS idx_users_admission_no ON users(admission_no);

-- Create grade_calculator_subjects table
CREATE TABLE IF NOT EXISTS grade_calculator_subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  marks DECIMAL(5,2) NOT NULL CHECK (marks >= 0 AND marks <= 100),
  credits DECIMAL(4,2) NOT NULL CHECK (credits > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_grade_calculator_subjects_user_id ON grade_calculator_subjects(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_calculator_subjects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running this script)
DROP POLICY IF EXISTS "Allow read users" ON users;
DROP POLICY IF EXISTS "Allow insert users" ON users;
DROP POLICY IF EXISTS "Users can view own subjects" ON grade_calculator_subjects;
DROP POLICY IF EXISTS "Users can insert own subjects" ON grade_calculator_subjects;
DROP POLICY IF EXISTS "Users can update own subjects" ON grade_calculator_subjects;
DROP POLICY IF EXISTS "Users can delete own subjects" ON grade_calculator_subjects;

-- Create policies for users table
-- Allow anyone to read users (for checking if registration_no exists)
CREATE POLICY "Allow read users" ON users
  FOR SELECT
  USING (true);

-- Allow anyone to insert new users
CREATE POLICY "Allow insert users" ON users
  FOR INSERT
  WITH CHECK (true);

-- Create policies for grade_calculator_subjects table
-- Users can only see their own subjects
CREATE POLICY "Users can view own subjects" ON grade_calculator_subjects
  FOR SELECT
  USING (true); -- Simplified: allow all reads (you can restrict by user_id if needed)

-- Users can insert their own subjects
CREATE POLICY "Users can insert own subjects" ON grade_calculator_subjects
  FOR INSERT
  WITH CHECK (true); -- Simplified: allow all inserts

-- Users can update their own subjects
CREATE POLICY "Users can update own subjects" ON grade_calculator_subjects
  FOR UPDATE
  USING (true); -- Simplified: allow all updates

-- Users can delete their own subjects
CREATE POLICY "Users can delete own subjects" ON grade_calculator_subjects
  FOR DELETE
  USING (true); -- Simplified: allow all deletes

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

-- Note: For production, you may want to add more restrictive RLS policies
-- that check user_id matches the authenticated user's ID

