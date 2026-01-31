-- =====================================================
-- CREATE USER RECORD FOR admin@example.com
-- =====================================================
-- Run this in Supabase SQL Editor

-- Step 1: Check if auth user exists and get the ID
DO $$
DECLARE
  auth_user_id UUID;
  auth_password_hash VARCHAR(255);
BEGIN
  -- Get the auth user ID and encrypted password
  SELECT id, encrypted_password INTO auth_user_id, auth_password_hash
  FROM auth.users 
  WHERE email = 'admin@example.com';
  
  IF auth_user_id IS NULL THEN
    RAISE EXCEPTION 'No auth user found with email admin@example.com. Please create the account in Supabase Auth first.';
  END IF;
  
  -- Check if user already exists in users table
  IF EXISTS (SELECT 1 FROM users WHERE id = auth_user_id) THEN
    RAISE NOTICE 'User record already exists for admin@example.com';
  ELSE
    -- Create the user record
    INSERT INTO users (
      id,
      email,
      password_hash,
      first_name,
      last_name,
      role,
      status,
      phone
    )
    VALUES (
      auth_user_id,
      'admin@example.com',
      auth_password_hash,
      'Admin',
      'User',
      'admin',
      'active',
      NULL  -- Set phone number if needed
    );
    
    RAISE NOTICE 'User record created successfully for admin@example.com';
  END IF;
END $$;

-- Verify the user was created
SELECT 
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  u.role,
  u.status,
  u.phone,
  u.created_at
FROM users u
WHERE u.email = 'admin@example.com';
