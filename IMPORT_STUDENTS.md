# Import Student Roll Numbers

## Option 1: Using SQL Script (Recommended)

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Open the `import-students.sql` file
4. Replace the example roll numbers with your actual student roll numbers
5. Make sure each roll number is in the format: `J25xxxxxxx` (J25 + 7 digits)
6. Run the SQL script

**Example:**
```sql
INSERT INTO users (roll_no) VALUES
  ('J251234567'),
  ('J251234568'),
  ('J251234569'),
  ('J251234570')
ON CONFLICT (roll_no) DO NOTHING;
```

## Option 2: Using Supabase Table Editor

1. Go to **Table Editor** in Supabase
2. Select the `users` table
3. Click **Insert** → **Insert row**
4. Enter the roll number (e.g., `J251234567`)
5. Click **Save**
6. Repeat for each student

## Option 3: Bulk Import via CSV

1. Create a CSV file with one column: `roll_no`
2. Format:
   ```
   roll_no
   J251234567
   J251234568
   J251234569
   ```
3. In Supabase, go to **Table Editor** → `users` table
4. Click **Import data via CSV**
5. Upload your CSV file

## Verify Import

After importing, verify the data:
```sql
SELECT COUNT(*) as total_students FROM users;
SELECT * FROM users ORDER BY roll_no LIMIT 10;
```

## Troubleshooting

**Error: "duplicate key value violates unique constraint"**
- The roll number already exists in the database
- This is okay - the `ON CONFLICT DO NOTHING` clause will skip duplicates

**Error: "relation 'users' does not exist"**
- Make sure you've run the `database-schema.sql` script first
- Check that the `users` table was created successfully

**Students can't login after import**
- Verify the roll numbers in the database match exactly what students are entering
- Check that the format is correct: `J25` + 7 digits
- Make sure there are no extra spaces or characters

