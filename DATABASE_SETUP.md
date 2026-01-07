# Database Setup Guide

## Prerequisites
- Supabase account (free tier works)
- Your Supabase project URL and anon key

### Getting Your Supabase Credentials

1. Go to your Supabase project: https://supabase.com/dashboard/project/yruuizwfmnognsnfunrt
2. Navigate to **Project Settings** → **API**
3. Copy the following:
   - **Project URL**: `https://yruuizwfmnognsnfunrt.supabase.co` (already configured)
   - **anon/public key**: Copy the `anon` `public` key
4. Update `src/env.ts` with your anon key, or create a `.env` file in the root directory:
   ```
   VITE_SUPABASE_URL=https://yruuizwfmnognsnfunrt.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

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

**Error: "ERR_NAME_NOT_RESOLVED" or "Cannot connect to database: The Supabase project URL cannot be resolved"**
- **Most common cause**: Your Supabase project is paused or deleted
  - Go to [Supabase Dashboard](https://supabase.com/dashboard)
  - Check if your project is paused (free tier projects pause after 1 week of inactivity)
  - If paused, click "Restore project" to reactivate it
  - If deleted, you'll need to create a new project and update the URL/API key
- **Check the URL**: Verify the Supabase URL in `src/env.ts` matches your project's API URL
  - Go to Project Settings → API in your Supabase dashboard
  - Copy the "Project URL" and update `VITE_SUPABASE_URL` in `src/env.ts`
- **Network issues**: Check your internet connection and DNS settings
- **Browser extensions**: Disable CORS or ad-blocking extensions that might interfere

**Error: "relation does not exist"**
- Make sure you've run the SQL schema in Supabase SQL Editor
- Check that tables were created successfully

**Subjects not loading**
- Check browser console for errors
- Verify your user is logged in
- Check Supabase logs for database errors


