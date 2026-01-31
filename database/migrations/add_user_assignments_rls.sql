-- =====================================================
-- RLS POLICIES: User Location Assignments
-- =====================================================
-- Run this after creating the user_location_assignments table
-- Enables Row Level Security and sets up policies

-- Enable RLS
ALTER TABLE user_location_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to make migration idempotent)
DROP POLICY IF EXISTS "Admins can view all assignments" ON user_location_assignments;
DROP POLICY IF EXISTS "Users can view own assignments" ON user_location_assignments;
DROP POLICY IF EXISTS "Admins can insert assignments" ON user_location_assignments;
DROP POLICY IF EXISTS "Admins can update assignments" ON user_location_assignments;
DROP POLICY IF EXISTS "Admins can delete assignments" ON user_location_assignments;

-- Policy: Super admins and admins can view all assignments
CREATE POLICY "Admins can view all assignments"
ON user_location_assignments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('super_admin', 'admin')
  )
);

-- Policy: Users can view their own assignments
CREATE POLICY "Users can view own assignments"
ON user_location_assignments FOR SELECT
USING (user_id = auth.uid());

-- Policy: Super admins and admins can insert assignments
CREATE POLICY "Admins can insert assignments"
ON user_location_assignments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('super_admin', 'admin')
  )
);

-- Policy: Super admins and admins can update assignments
CREATE POLICY "Admins can update assignments"
ON user_location_assignments FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('super_admin', 'admin')
  )
);

-- Policy: Super admins and admins can delete assignments
CREATE POLICY "Admins can delete assignments"
ON user_location_assignments FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('super_admin', 'admin')
  )
);

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'user_location_assignments';
