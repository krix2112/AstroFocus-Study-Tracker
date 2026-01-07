# Complete Setup Instructions

## Step 1: Update Supabase Configuration ✅

The configuration has been updated in `src/env.ts`:
- **Project URL**: `https://dnlnsguxfzxhksexuqly.supabase.co`
- **Anon Key**: `sb_publishable_i3Qa5nsUYrPT9G9ioIgTCA_76mUXDnG`

## Step 2: Create Database Tables

1. Go to your Supabase project: https://supabase.com/dashboard/project/dnlnsguxfzxhksexuqly
2. Click **SQL Editor** in the left sidebar
3. Open `database-schema.sql` from your project
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)

This will create:
- `users` table with columns: `id`, `admission_no`, `registration_no`, `student_name`, `mobile`, `created_at`
- `grade_calculator_subjects` table
- Indexes for faster lookups
- Row Level Security (RLS) policies

## Step 3: Import All Student Data

1. In the SQL Editor, open `import-all-students-complete.sql`
2. **IMPORTANT**: Review the data - the script includes sample data from the PDF
3. If your PDF has more students, add them to the INSERT statement
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **Run**

**Note**: The import script includes:
- AIML students (J250211001 to J250211178)
- CSE students (partial list - you may need to add more)

To add more students, use this format:
```sql
('J25AIMLXXX', 'J250211XXX', 'STUDENT NAME', 'MOBILE_NUMBER'),
```

## Step 4: Verify the Import

Run this in the SQL Editor:
```sql
SELECT COUNT(*) as total_students FROM users;
SELECT COUNT(*) as aiml_students FROM users WHERE registration_no LIKE 'J250211%';
SELECT COUNT(*) as cse_students FROM users WHERE registration_no LIKE 'J250210%';
SELECT * FROM users LIMIT 10;
```

## Step 5: Test the Application

1. Run your app: `npm run dev`
2. Go to the login page
3. Enter:
   - **Registration Number**: Enter the 7 digits after J25 (e.g., "0211001" for J250211001)
   - **Mobile Number**: Enter the mobile number from the database
4. Click "Sign In"
5. You should see:
   - Dashboard with student name
   - Admission number displayed under the name
   - Sidebar showing registration number

## Features Implemented ✅

1. ✅ **Two-Factor Login**: Registration Number + Mobile Number
2. ✅ **Complete Student Data**: Admission No, Registration No, Name, Mobile
3. ✅ **Dashboard Display**: Shows student name and admission number
4. ✅ **Sidebar Display**: Shows registration number
5. ✅ **Validation**: Both credentials must match to login

## Troubleshooting

**Error: "Invalid credentials"**
- Check that both registration number and mobile number match exactly
- Verify the data in your database: `SELECT * FROM users WHERE registration_no = 'J250211001';`

**Error: "Table does not exist"**
- Make sure you ran `database-schema.sql` first
- Check that tables were created: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`

**Missing Students**
- Add them to the import script using the format shown above
- Or insert individually: `INSERT INTO users (admission_no, registration_no, student_name, mobile) VALUES ('J25AIMLXXX', 'J250211XXX', 'NAME', 'MOBILE');`

## Next Steps

1. Complete the student import with all data from your PDF
2. Test login with multiple students
3. Verify all data is correct in the database


