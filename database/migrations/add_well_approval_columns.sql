-- Migration: Add columns for well approval workflow
-- Run this in Supabase SQL Editor

-- Add new columns to wells table
ALTER TABLE wells 
ADD COLUMN IF NOT EXISTS well_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS well_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS well_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS well_shape VARCHAR(100),
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS field VARCHAR(255),
ADD COLUMN IF NOT EXISTS hole_size VARCHAR(100),
ADD COLUMN IF NOT EXISTS casing_size VARCHAR(100),
ADD COLUMN IF NOT EXISTS artificial_lift VARCHAR(100),
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS current_step INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS checklist_data JSONB,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wells_well_id ON wells(well_id);
CREATE INDEX IF NOT EXISTS idx_wells_status ON wells(status);
CREATE INDEX IF NOT EXISTS idx_wells_submitted_at ON wells(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_wells_created_by ON wells(created_by);

-- Add comment to checklist_data column
COMMENT ON COLUMN wells.checklist_data IS 'Stores Pre-Spud checklist items with notes, photos, and documents as JSON';

-- Sample query to verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'wells'
ORDER BY ordinal_position;
