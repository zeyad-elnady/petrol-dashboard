-- Fix RLS policies on users table to allow reading user data
-- Run this in the Supabase SQL Editor

-- First, check if RLS is even enabled
-- You can disable RLS entirely for the users table if this is an admin-only dashboard:
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- OR create a policy that allows anonymous (anon) role to read:
CREATE POLICY "Allow public reading of users"
ON users
FOR SELECT
TO anon
USING (true);

-- Also ensure authenticated users can read:
CREATE POLICY "Allow authenticated reading of users"
ON users
FOR SELECT
TO authenticated
USING (true);

-- If the above policies already exist, drop them first:
-- DROP POLICY IF EXISTS "Allow public reading of users" ON users;
-- DROP POLICY IF EXISTS "Allow authenticated reading of users" ON users;
-- DROP POLICY IF EXISTS "Allow reading user data" ON users;
-- Then run the CREATE statements above.
