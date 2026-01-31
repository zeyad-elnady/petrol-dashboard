-- =====================================================
-- DRILLING OPERATIONS & HSE MOBILE APP - DATABASE SCHEMA
-- =====================================================
-- This schema supports a comprehensive admin dashboard
-- for managing drilling operations and HSE activities
-- New Version: Updated for 9-step wizard with enhanced data fields
-- =====================================================

-- =====================================================
-- USERS & AUTHENTICATION
-- =====================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'admin', 'engineer', 'manager', 'field_engineer', 'hse_officer')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    profile_picture_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- =====================================================
-- PROJECTS & UNITS (HIERARCHY)
-- =====================================================

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    unit_type VARCHAR(50) NOT NULL CHECK (unit_type IN ('Rig', 'HFBU', 'Rigless')),
    unit_number VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_units_project ON units(project_id);

-- =====================================================
-- WELLS MANAGEMENT
-- =====================================================

CREATE TABLE wells (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Step 1: Basic Data
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    rig_id VARCHAR(100), -- Legacy field, use unit_id instead
    unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
    rig_name VARCHAR(255),
    
    -- New Workflow Fields
    well_type VARCHAR(50),
    well_shape VARCHAR(50) CHECK (well_shape IN ('Vertical', 'Deviated (J shape)', 'Deviated (S shape)', 'Horizontal')),
    surface_coordinates VARCHAR(100),
    
    notes TEXT,
    
    -- Step 4: Additional Details (Personnel)
    operator_name VARCHAR(255),
    supervisor_name VARCHAR(255),
    
    -- Step 5: Equipment Inspection
    drilling_rig_model VARCHAR(255),
    mud_pumps VARCHAR(255),
    blowout_preventer TEXT,
    
    -- Step 6: Environmental Data
    temperature DECIMAL(5,2),  -- in Celsius
    wind_speed DECIMAL(5,2),   -- in km/h
    weather_conditions VARCHAR(100),
    soil_type VARCHAR(100),
    
    -- Step 8: Final Comments
    final_comments TEXT,
    
    -- Well Status
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'suspended', 'abandoned')),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_wells_status ON wells(status);
CREATE INDEX idx_wells_created_by ON wells(created_by);
CREATE INDEX idx_wells_assigned_to ON wells(assigned_to);
CREATE INDEX idx_wells_rig_id ON wells(rig_id);
CREATE INDEX idx_wells_created_at ON wells(created_at DESC);

-- =====================================================
-- SAFETY CHECKLISTS
-- =====================================================

CREATE TABLE safety_checklist_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_required BOOLEAN DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE well_safety_checklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    well_id UUID NOT NULL REFERENCES wells(id) ON DELETE CASCADE,
    checklist_item_id UUID NOT NULL REFERENCES safety_checklist_templates(id) ON DELETE CASCADE,
    is_checked BOOLEAN DEFAULT false,
    checked_at TIMESTAMP WITH TIME ZONE,
    checked_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(well_id, checklist_item_id)
);

CREATE INDEX idx_safety_checklist_well ON well_safety_checklist(well_id);

-- =====================================================
-- WELL PHOTOS
-- =====================================================

CREATE TABLE well_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    well_id UUID NOT NULL REFERENCES wells(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,  -- Local file URI or cloud storage URL
    caption TEXT,
    file_size_bytes BIGINT,  -- File size in bytes
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_well_photos_well ON well_photos(well_id);

-- =====================================================
-- WELL VOICE NOTES
-- =====================================================

CREATE TABLE well_voice_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    well_id UUID NOT NULL REFERENCES wells(id) ON DELETE CASCADE,
    audio_url TEXT NOT NULL,  -- Local file URI or cloud storage URL
    duration_seconds INTEGER NOT NULL,
    file_size_bytes BIGINT,  -- File size in bytes
    transcription TEXT,
    recorded_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_well_voice_notes_well ON well_voice_notes(well_id);

-- =====================================================
-- DRILLING SECTIONS & OPERATIONS
-- =====================================================

CREATE TABLE well_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    well_id UUID NOT NULL REFERENCES wells(id) ON DELETE CASCADE,
    section_name VARCHAR(100) NOT NULL, -- e.g., "12.25 inch Section"
    hole_size DECIMAL(5,2),
    casing_size DECIMAL(5,2),
    mud_data JSONB,
    target_depth DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'drilling', 'casing', 'cementing', 'completed')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_well_sections_well ON well_sections(well_id);

-- =====================================================
-- DYNAMIC CHECKLISTS (Workflow)
-- =====================================================

CREATE TABLE checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    well_id UUID REFERENCES wells(id) ON DELETE CASCADE,
    section_id UUID REFERENCES well_sections(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Pre-spud', 'Pre-release', 'BHA', 'Casing', 'Cementing', 'BOP', 'Well Head')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    data JSONB DEFAULT '{}', -- Stores checklist items and values
    photos JSONB DEFAULT '[]', -- Stores photo URLs and metadata
    submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_checklists_well ON checklists(well_id);
CREATE INDEX idx_checklists_section ON checklists(section_id);

-- =====================================================
-- APPROVALS
-- =====================================================

CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL, -- 'well', 'section', 'checklist'
    entity_id UUID NOT NULL,
    approval_type VARCHAR(100) NOT NULL, -- e.g., 'TD Confirmation'
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approver_email VARCHAR(255), -- For client approvals via mail
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL, -- For internal approvals
    approved_at TIMESTAMP WITH TIME ZONE,
    evidence_url TEXT, -- Uploaded email screenshot or document
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_approvals_entity ON approvals(entity_type, entity_id);

-- =====================================================
-- HAZARDS (HAZARD HUNT)
-- =====================================================

CREATE TABLE hazards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('housekeeping', 'ppe', 'equipment', 'environmental', 'other')),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed', 'cancelled')),
    before_photo_url TEXT,
    after_photo_url TEXT,
    additional_notes TEXT,
    reported_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_hazards_status ON hazards(status);
CREATE INDEX idx_hazards_priority ON hazards(priority);
CREATE INDEX idx_hazards_category ON hazards(category);
CREATE INDEX idx_hazards_reported_by ON hazards(reported_by);
CREATE INDEX idx_hazards_assigned_to ON hazards(assigned_to);
CREATE INDEX idx_hazards_created_at ON hazards(created_at DESC);

-- =====================================================
-- HSE TASKS
-- =====================================================

CREATE TABLE hse_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'overdue')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    assigned_to UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_tasks_status ON hse_tasks(status);
CREATE INDEX idx_tasks_priority ON hse_tasks(priority);
CREATE INDEX idx_tasks_assigned_to ON hse_tasks(assigned_to);
CREATE INDEX idx_tasks_assigned_by ON hse_tasks(assigned_by);
CREATE INDEX idx_tasks_due_date ON hse_tasks(due_date);

-- =====================================================
-- VOLUNTARY ACTIONS
-- =====================================================

CREATE TABLE voluntary_action_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE voluntary_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES voluntary_action_templates(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(template_id, user_id)
);

CREATE INDEX idx_voluntary_actions_user ON voluntary_actions(user_id);
CREATE INDEX idx_voluntary_actions_completed ON voluntary_actions(is_completed);

-- =====================================================
-- DAILY REPORTS
-- =====================================================

CREATE TABLE daily_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_date DATE NOT NULL,
    well_location VARCHAR(255) NOT NULL,
    operations_summary TEXT NOT NULL,
    safety_status VARCHAR(20) NOT NULL CHECK (safety_status IN ('safe', 'issues')),
    issues_description TEXT,
    submitted_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_daily_reports_date ON daily_reports(report_date DESC);
CREATE INDEX idx_daily_reports_submitted_by ON daily_reports(submitted_by);
CREATE INDEX idx_daily_reports_safety_status ON daily_reports(safety_status);
CREATE INDEX idx_daily_reports_well_location ON daily_reports(well_location);

-- =====================================================
-- ACTIVITY LOG (AUDIT TRAIL)
-- =====================================================

CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    details JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_log_user ON activity_log(user_id);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('task_assigned', 'task_overdue', 'hazard_assigned', 'daily_report_reminder', 'system')),
    is_read BOOLEAN DEFAULT false,
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- =====================================================
-- SYSTEM SETTINGS
-- =====================================================

CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- VIEWS FOR ANALYTICS
-- =====================================================

-- Summary view for dashboard statistics
CREATE VIEW dashboard_statistics AS
SELECT
    (SELECT COUNT(*) FROM wells WHERE status = 'in_progress') as active_wells,
    (SELECT COUNT(*) FROM wells WHERE status = 'completed') as completed_wells,
    (SELECT COUNT(*) FROM hazards WHERE status = 'open') as open_hazards,
    (SELECT COUNT(*) FROM hazards WHERE status = 'in_progress') as in_progress_hazards,
    (SELECT COUNT(*) FROM hazards WHERE priority = 'high' AND status IN ('open', 'in_progress')) as high_priority_hazards,
    (SELECT COUNT(*) FROM hse_tasks WHERE status = 'overdue') as overdue_tasks,
    (SELECT COUNT(*) FROM hse_tasks WHERE status = 'pending') as pending_tasks,
    (SELECT COUNT(*) FROM daily_reports WHERE report_date = CURRENT_DATE) as todays_reports,
    (SELECT COUNT(*) FROM users WHERE status = 'active') as active_users;

-- Recent activity view
CREATE VIEW recent_activities AS
SELECT
    'well' as entity_type,
    w.id as entity_id,
    w.name as entity_name,
    w.status,
    w.updated_at,
    u.first_name || ' ' || u.last_name as updated_by_name
FROM wells w
LEFT JOIN users u ON w.created_by = u.id
UNION ALL
SELECT
    'hazard' as entity_type,
    h.id as entity_id,
    h.subject as entity_name,
    h.status,
    h.updated_at,
    u.first_name || ' ' || u.last_name as updated_by_name
FROM hazards h
LEFT JOIN users u ON h.reported_by = u.id
UNION ALL
SELECT
    'task' as entity_type,
    t.id as entity_id,
    t.title as entity_name,
    t.status,
    t.updated_at,
    u.first_name || ' ' || u.last_name as updated_by_name
FROM hse_tasks t
LEFT JOIN users u ON u.id = t.assigned_to
ORDER BY updated_at DESC
LIMIT 50;

-- =====================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wells_updated_at BEFORE UPDATE ON wells FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hazards_updated_at BEFORE UPDATE ON hazards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hse_tasks_updated_at BEFORE UPDATE ON hse_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_reports_updated_at BEFORE UPDATE ON daily_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_voluntary_actions_updated_at BEFORE UPDATE ON voluntary_actions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE users IS 'Application users including admins, managers, field engineers, and HSE officers';
COMMENT ON TABLE wells IS 'Drilling well records with 9-step wizard data including personnel, equipment, and environmental information';
COMMENT ON TABLE safety_checklist_templates IS 'Pre-defined safety checklist items for well operations';
COMMENT ON TABLE well_safety_checklist IS 'Completed safety checklists for specific wells';
COMMENT ON TABLE well_photos IS 'Photos attached to well records';
COMMENT ON TABLE well_voice_notes IS 'Voice notes recorded for well operations';
COMMENT ON TABLE hazards IS 'Safety hazards reported via Hazard Hunt feature';
COMMENT ON TABLE hse_tasks IS 'Health, Safety, and Environment tasks assigned to field workers';
COMMENT ON TABLE voluntary_action_templates IS 'Templates for optional HSE activities';
COMMENT ON TABLE voluntary_actions IS 'User completions of voluntary HSE actions';
COMMENT ON TABLE daily_reports IS 'Mandatory daily operational reports from field engineers';
COMMENT ON TABLE activity_log IS 'Audit trail of all user actions in the system';
COMMENT ON TABLE notifications IS 'In-app notifications for users';
COMMENT ON TABLE system_settings IS 'System-wide configuration settings';
