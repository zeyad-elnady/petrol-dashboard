-- =====================================================
-- MIGRATION: 9-Step Wizard Update
-- Generated: 2025-12-02
-- Description: Add new fields to support 9-step well wizard
-- =====================================================

-- This migration adds columns to the wells table for the new 9-step wizard
-- Steps 4, 5, 6, and 8 add additional data fields

BEGIN;

-- Step 4: Additional Details (Personnel)
ALTER TABLE wells ADD COLUMN IF NOT EXISTS operator_name VARCHAR(255);
ALTER TABLE wells ADD COLUMN IF NOT EXISTS supervisor_name VARCHAR(255);

-- Step 5: Equipment Inspection
ALTER TABLE wells ADD COLUMN IF NOT EXISTS drilling_rig_model VARCHAR(255);
ALTER TABLE wells ADD COLUMN IF NOT EXISTS mud_pumps VARCHAR(255);
ALTER TABLE wells ADD COLUMN IF NOT EXISTS blowout_preventer TEXT;

-- Step 6: Environmental Data
ALTER TABLE wells ADD COLUMN IF NOT EXISTS temperature DECIMAL(5,2);  -- in Celsius
ALTER TABLE wells ADD COLUMN IF NOT EXISTS wind_speed DECIMAL(5,2);   -- in km/h
ALTER TABLE wells ADD COLUMN IF NOT EXISTS weather_conditions VARCHAR(100);
ALTER TABLE wells ADD COLUMN IF NOT EXISTS soil_type VARCHAR(100);

-- Step 8: Final Comments
ALTER TABLE wells ADD COLUMN IF NOT EXISTS final_comments TEXT;

-- Add file size tracking for photos and voice notes
ALTER TABLE well_photos ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT;
ALTER TABLE well_voice_notes ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT;

-- Make duration_seconds required for voice notes (it wasn't before)
ALTER TABLE well_voice_notes ALTER COLUMN duration_seconds SET NOT NULL;

-- Update table comment
COMMENT ON TABLE wells IS 'Drilling well records with 9-step wizard data including personnel, equipment, and environmental information';

-- Add indexes for new searchable fields (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_wells_operator ON wells(operator_name);
CREATE INDEX IF NOT EXISTS idx_wells_supervisor ON wells(supervisor_name);
CREATE INDEX IF NOT EXISTS idx_wells_weather ON wells(weather_conditions);

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify the new columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'wells' 
  AND column_name IN (
    'operator_name', 'supervisor_name', 
    'drilling_rig_model', 'mud_pumps', 'blowout_preventer',
    'temperature', 'wind_speed', 'weather_conditions', 'soil_type',
    'final_comments'
  )
ORDER BY column_name;

-- =====================================================
-- ROLLBACK SCRIPT (if needed)
-- =====================================================

/*
BEGIN;

-- Remove new columns from wells table
ALTER TABLE wells DROP COLUMN IF EXISTS operator_name;
ALTER TABLE wells DROP COLUMN IF EXISTS supervisor_name;
ALTER TABLE wells DROP COLUMN IF EXISTS drilling_rig_model;
ALTER TABLE wells DROP COLUMN IF EXISTS mud_pumps;
ALTER TABLE wells DROP COLUMN IF EXISTS blowout_preventer;
ALTER TABLE wells DROP COLUMN IF EXISTS temperature;
ALTER TABLE wells DROP COLUMN IF EXISTS wind_speed;
ALTER TABLE wells DROP COLUMN IF EXISTS weather_conditions;
ALTER TABLE wells DROP COLUMN IF EXISTS soil_type;
ALTER TABLE wells DROP COLUMN IF EXISTS final_comments;

-- Remove file size columns
ALTER TABLE well_photos DROP COLUMN IF EXISTS file_size_bytes;
ALTER TABLE well_voice_notes DROP COLUMN IF EXISTS file_size_bytes;

-- Restore original table comment
COMMENT ON TABLE wells IS 'Drilling well records with lifecycle tracking';

-- Drop indexes
DROP INDEX IF EXISTS idx_wells_operator;
DROP INDEX IF EXISTS idx_wells_supervisor;
DROP INDEX IF EXISTS idx_wells_weather;

COMMIT;
*/
