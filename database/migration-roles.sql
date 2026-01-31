-- =====================================================
-- MIGRATION: Add Super Admin and Engineer Roles
-- =====================================================
-- Run this SQL in Supabase SQL Editor to update existing database
-- This adds 'super_admin' and 'engineer' roles to the users table

-- Step 1: Drop the existing constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Step 2: Add new constraint with updated roles
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('super_admin', 'admin', 'engineer', 'manager', 'field_engineer', 'hse_officer'));

-- Step 3: (Optional) Upgrade an existing admin to super_admin
-- Uncomment and modify the email below to create your first super admin
-- UPDATE users SET role = 'super_admin' WHERE email = 'admin@example.com';

-- Verify the constraint was updated
SELECT 
  constraint_name, 
  check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'users_role_check';
