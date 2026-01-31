-- =====================================================
-- DAILY REPORTS SCHEDULING SYSTEM
-- =====================================================
-- Migration to add scheduled daily reports functionality
-- Run this in Supabase SQL Editor

-- Table to store admin-configured report times
CREATE TABLE IF NOT EXISTS report_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    time_slot_1 TIME NOT NULL,  -- e.g., '08:00:00' for morning report
    time_slot_2 TIME NOT NULL,  -- e.g., '20:00:00' for evening report
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default schedule (8 AM and 8 PM)
INSERT INTO report_schedules (time_slot_1, time_slot_2)
VALUES ('08:00:00', '20:00:00')
ON CONFLICT DO NOTHING;

-- Table to store submitted daily reports
CREATE TABLE IF NOT EXISTS daily_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    well_id UUID REFERENCES wells(id) ON DELETE CASCADE,
    submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    report_date DATE NOT NULL,
    time_slot INTEGER NOT NULL CHECK (time_slot IN (1, 2)), -- 1 = morning, 2 = evening
    
    -- Report fields (matching existing modal)
    drilling_depth DECIMAL(10,2),
    mud_weight DECIMAL(10,2),
    pump_pressure DECIMAL(10,2),
    incidents TEXT,
    remarks TEXT,
    
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one report per slot per day per well
    CONSTRAINT unique_report_slot UNIQUE(well_id, report_date, time_slot)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_reports_well_id ON daily_reports(well_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(report_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_reports_submitted_by ON daily_reports(submitted_by);
CREATE INDEX IF NOT EXISTS idx_daily_reports_well_date ON daily_reports(well_id, report_date DESC);

-- Add comments for documentation
COMMENT ON TABLE report_schedules IS 'Admin-configured times for daily report reminders';
COMMENT ON TABLE daily_reports IS 'Submitted daily reports from engineers, 2 per day per well';
COMMENT ON COLUMN daily_reports.time_slot IS '1 = morning report, 2 = evening report';

-- Verify tables were created
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('report_schedules', 'daily_reports')
ORDER BY table_name, ordinal_position;
