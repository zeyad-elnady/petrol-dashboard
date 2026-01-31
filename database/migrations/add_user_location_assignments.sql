-- =====================================================
-- MIGRATION: Add User Location Assignments Table
-- =====================================================
-- Run this SQL in Supabase SQL Editor to create the table for location-based access control
-- This allows super admins to assign users to specific countries, projects, and units

-- Create user_location_assignments table
CREATE TABLE IF NOT EXISTS user_location_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    country VARCHAR(100),
    project VARCHAR(255),
    unit VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Drop existing indexes if they exist (to make migration idempotent)
DROP INDEX IF EXISTS idx_user_location_assignments_user_id;
DROP INDEX IF EXISTS idx_user_location_assignments_country;
DROP INDEX IF EXISTS idx_user_location_assignments_project;
DROP INDEX IF EXISTS idx_user_location_assignments_unique;

-- Add indexes for better query performance
CREATE INDEX idx_user_location_assignments_user_id ON user_location_assignments(user_id);
CREATE INDEX idx_user_location_assignments_country ON user_location_assignments(country);
CREATE INDEX idx_user_location_assignments_project ON user_location_assignments(project);

-- Add unique constraint to prevent duplicate assignments
CREATE UNIQUE INDEX idx_user_location_assignments_unique 
ON user_location_assignments(user_id, country, COALESCE(project, ''), COALESCE(unit, ''));

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS update_user_location_assignments_updated_at ON user_location_assignments;

-- Add trigger for updated_at
CREATE TRIGGER update_user_location_assignments_updated_at 
BEFORE UPDATE ON user_location_assignments 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE user_location_assignments IS 'Stores location-based access assignments for users (HSE Lead, Ops, Engineers)';

-- Verify table was created
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_location_assignments'
ORDER BY ordinal_position;
