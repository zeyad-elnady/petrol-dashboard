-- Add spud_date column to wells table
-- This records when drilling physically began

ALTER TABLE wells ADD COLUMN IF NOT EXISTS spud_date TIMESTAMP WITH TIME ZONE;

-- Add comment
COMMENT ON COLUMN wells.spud_date IS 'Actual date/time when drilling operations began (spud date)';
