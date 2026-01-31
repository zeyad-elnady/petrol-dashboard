-- =====================================================
-- MIGRATION: Add HSE Lead and Ops Roles
-- =====================================================
-- Run this SQL in Supabase SQL Editor to update existing database
-- This adds 'hse_lead' and 'ops' roles to the users table

-- Step 1: Drop the existing constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Step 2: Add new constraint with updated roles
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('super_admin', 'admin', 'hse_lead', 'ops', 'engineer', 'manager', 'field_engineer', 'hse_officer'));

-- Verify the constraint was updated
SELECT 
  constraint_name, 
  check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'users_role_check';
