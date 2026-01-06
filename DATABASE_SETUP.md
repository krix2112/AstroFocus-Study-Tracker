# Database Setup Guide

## Prerequisites
- Supabase account (free tier works)
- Your Supabase project URL and anon key (already configured in `src/env.ts`)

## Step 1: Create Database Tables

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `database-schema.sql`
4. Click **Run** to execute the SQL

This will create:
- `users` table - stores user roll numbers
- `grade_calculator_subjects` table - stores subjects for each user
- Row Level Security (RLS) policies for data access

## Step 2: Verify Tables

1. Go to **Table Editor** in Supabase
2. You should see two tables:
   - `users`
   - `grade_calculator_subjects`

## Step 3: Test Authentication

1. Run your app: `npm run dev`
2. Navigate to the login page
3. Enter any roll number (e.g., "2024CS001")
4. Click "Sign In / Sign Up"
5. If the roll number doesn't exist, a new user will be created automatically

## Step 4: Test Grade Calculator

1. After logging in, go to "Grade Calculator"
2. Add a subject with marks and credits
3. The data will be saved to the database
4. Refresh the page - your subjects should persist!

## Features

✅ **Roll Number Authentication**
- Simple roll number-based login
- Automatic user creation
- No password required (for simplicity)

✅ **Database Integration**
- All subjects stored in Supabase
- Data persists across sessions
- Each user's data is isolated

✅ **Real-time Sync**
- Changes sync immediately to database
- Loading and syncing indicators
- Error handling for failed operations

## Security Notes

The current RLS policies allow all operations for simplicity. For production, you may want to:
- Add more restrictive policies
- Implement proper user authentication
- Add password protection
- Add rate limiting

## Troubleshooting

**Error: "Database not configured"**
- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in your `.env` file
- Or verify the fallback values in `src/env.ts` are correct

**Error: "relation does not exist"**
- Make sure you've run the SQL schema in Supabase SQL Editor
- Check that tables were created successfully

**Subjects not loading**
- Check browser console for errors
- Verify your user is logged in
- Check Supabase logs for database errors

