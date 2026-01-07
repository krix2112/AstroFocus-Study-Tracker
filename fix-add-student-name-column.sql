-- Quick Fix: Add student_name column to users table
-- Run this in your Supabase SQL Editor if you get the error about student_name column not existing

-- Add the student_name column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS student_name TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'student_name';



