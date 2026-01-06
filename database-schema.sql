-- Database Schema for CosmoStudy Grade Calculator
-- Run this SQL in your Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  roll_no TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

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

-- Create policies for users table
-- Allow anyone to read users (for checking if roll_no exists)
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

-- Note: For production, you may want to add more restrictive RLS policies
-- that check user_id matches the authenticated user's ID

