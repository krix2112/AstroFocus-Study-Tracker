-- SQL Script to Import Student Roll Numbers
-- Run this in your Supabase SQL Editor after creating the users table
-- Replace the roll numbers below with your actual student data

-- Example: Insert multiple students at once
-- Format: INSERT INTO users (roll_no) VALUES ('J25xxxxxxx'), ('J25yyyyyyy'), ...;

-- Replace the example roll numbers below with your actual student roll numbers
INSERT INTO users (roll_no) VALUES
  ('J251234567'),
  ('J251234568'),
  ('J251234569')
  -- Add more roll numbers here, one per line
  -- Make sure each roll number follows the format: J25 + 7 digits
  -- Example: ('J251234570'), ('J251234571'), etc.
ON CONFLICT (roll_no) DO NOTHING;

-- To verify the import, run:
-- SELECT * FROM users ORDER BY roll_no;


