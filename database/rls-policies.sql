-- =====================================================
-- RLS POLICIES FOR MOBILE APP ACCESS
-- =====================================================
-- Run this in Supabase SQL Editor to allow mobile app users
-- to access their data properly

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile" ON users
FOR SELECT
USING (auth.uid() = id);

-- Allow admins/super_admins to read all users (for dashboard)
CREATE POLICY "Admins can read all users" ON users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('super_admin', 'admin')
  )
);

-- =====================================================
-- HAZARDS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can read hazards" ON hazards;
DROP POLICY IF EXISTS "Authenticated users can create hazards" ON hazards;
DROP POLICY IF EXISTS "Users can update own hazards" ON hazards;

-- Allow authenticated users to read all hazards
CREATE POLICY "Authenticated users can read hazards" ON hazards
FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow authenticated users to create hazards
CREATE POLICY "Authenticated users can create hazards" ON hazards
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own hazards
CREATE POLICY "Users can update own hazards" ON hazards
FOR UPDATE
USING (auth.uid() = reported_by);

-- =====================================================
-- WELLS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can read wells" ON wells;
DROP POLICY IF EXISTS "Authenticated users can create wells" ON wells;
DROP POLICY IF EXISTS "Users can update own wells" ON wells;

-- Allow authenticated users to read all wells
CREATE POLICY "Authenticated users can read wells" ON wells
FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow authenticated users to create wells
CREATE POLICY "Authenticated users can create wells" ON wells
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own wells
CREATE POLICY "Users can update own wells" ON wells
FOR UPDATE
USING (auth.uid() = created_by OR auth.uid() = assigned_to);

-- =====================================================
-- HSE TASKS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can read assigned tasks" ON hse_tasks;
DROP POLICY IF EXISTS "Users can update assigned tasks" ON hse_tasks;

-- Allow authenticated users to read tasks assigned to them
CREATE POLICY "Users can read assigned tasks" ON hse_tasks
FOR SELECT
USING (
  auth.uid() = assigned_to OR 
  auth.uid() = assigned_by OR
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('super_admin', 'admin', 'manager')
  )
);

-- Allow users to update tasks assigned to them
CREATE POLICY "Users can update assigned tasks" ON hse_tasks
FOR UPDATE
USING (auth.uid() = assigned_to);

-- =====================================================
-- DAILY REPORTS TABLE POLICIES  
-- =====================================================

DROP POLICY IF EXISTS "Users can read own reports" ON daily_reports;
DROP POLICY IF EXISTS "Users can create reports" ON daily_reports;

-- Allow users to read their own reports
CREATE POLICY "Users can read own reports" ON daily_reports
FOR SELECT
USING (auth.uid() = submitted_by);

-- Allow users to create reports
CREATE POLICY "Users can create reports" ON daily_reports
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- VOLUNTARY ACTIONS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can manage own voluntary actions" ON voluntary_actions;

-- Allow users to manage their own voluntary actions
CREATE POLICY "Users can manage own voluntary actions" ON voluntary_actions
FOR ALL
USING (auth.uid() = user_id);

-- =====================================================
-- VOLUNTARY ACTION TEMPLATES (read-only for all)
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can read templates" ON voluntary_action_templates;

CREATE POLICY "Authenticated users can read templates" ON voluntary_action_templates
FOR SELECT
USING (auth.role() = 'authenticated');

-- =====================================================
-- SAFETY CHECKLIST TEMPLATES (read-only for all)
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can read safety templates" ON safety_checklist_templates;

CREATE POLICY "Authenticated users can read safety templates" ON safety_checklist_templates
FOR SELECT
USING (auth.role() = 'authenticated');

-- =====================================================
-- WELL SAFETY CHECKLIST
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can manage well checklists" ON well_safety_checklist;

CREATE POLICY "Authenticated users can manage well checklists" ON well_safety_checklist
FOR ALL
USING (auth.role() = 'authenticated');

-- =====================================================
-- PROJECTS & UNITS (read-only for all authenticated)
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can read projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can read units" ON units;

CREATE POLICY "Authenticated users can read projects" ON projects
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read units" ON units
FOR SELECT
USING (auth.role() = 'authenticated');

-- =====================================================
-- Enable RLS on all tables (if not already enabled)
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hazards ENABLE ROW LEVEL SECURITY;
ALTER TABLE wells ENABLE ROW LEVEL SECURITY;
ALTER TABLE hse_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE voluntary_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voluntary_action_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE well_safety_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
