-- =====================================================
-- SIMPLIFIED RLS POLICIES - RUN THIS FIRST
-- =====================================================
-- This fixes common RLS issues by using simpler policies

-- Disable RLS temporarily to clean up
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE hazards DISABLE ROW LEVEL SECURITY;
ALTER TABLE wells DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "Users can read own profile" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Admins can read all users" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can read hazards" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can create hazards" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Users can update own hazards" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can read wells" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can create wells" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Users can update own wells" ON ' || r.tablename;
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hazards ENABLE ROW LEVEL SECURITY;
ALTER TABLE wells ENABLE ROW LEVEL SECURITY;

-- USERS TABLE - Simple policy allowing users to read their own record
CREATE POLICY "users_select_own" ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- HAZARDS TABLE - Allow all authenticated users full access
CREATE POLICY "hazards_select_all" ON hazards
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "hazards_insert_all" ON hazards
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "hazards_update_all" ON hazards
FOR UPDATE
TO authenticated
USING (true);

-- WELLS TABLE - Allow all authenticated users full access
CREATE POLICY "wells_select_all" ON wells
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "wells_insert_all" ON wells
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "wells_update_all" ON wells
FOR UPDATE
TO authenticated
USING (true);

-- Test query - Run this to verify it works
-- SELECT * FROM users WHERE id = auth.uid();
