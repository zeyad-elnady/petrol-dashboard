-- Create drilling_sections table to track progress through each section
CREATE TABLE IF NOT EXISTS drilling_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    well_id UUID REFERENCES wells(id) ON DELETE CASCADE,
    section_number INTEGER NOT NULL,
    
    -- Step 1: BHA Photos
    bha_photo_url TEXT,
    bit_photo_url TEXT,
    stabilizer_photo_url TEXT,
    motor_photo_url TEXT,
    mwd_photo_url TEXT,
    drilling_started_at TIMESTAMP WITH TIME ZONE,
    
    -- Step 2: TD
    td_value DECIMAL(10,2),
    td_approval_email TEXT,
    directional_survey_url TEXT,
    casing_running_started_at TIMESTAMP WITH TIME ZONE,
    
    -- Step 3: Casing
    casing_checklist JSONB,
    casing_tally_url TEXT,
    cementing_started_at TIMESTAMP WITH TIME ZONE,
    
    -- Step 4: Cementing
    cementing_checklist JSONB,
    bop_started_at TIMESTAMP WITH TIME ZONE,
    
    -- Step 5: Well Head & BOP
    wellhead_bop_checklist JSONB,
    section_completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_well_section UNIQUE(well_id, section_number)
);

CREATE INDEX idx_drilling_sections_well_id ON drilling_sections(well_id);
CREATE INDEX idx_drilling_sections_section_number ON drilling_sections(section_number);

COMMENT ON TABLE drilling_sections IS 'Tracks progress through each drilling section (5 steps per section)';
