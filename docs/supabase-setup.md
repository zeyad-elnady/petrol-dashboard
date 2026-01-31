# Supabase Setup Guide

This guide will help you set up Supabase as the backend for the Drilling Operations & HSE Admin Dashboard.

## Prerequisites

- A Supabase account (free tier is sufficient for development)
- Node.js and npm installed locally

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in the details:
   - **Name**: `petrol-app-admin`
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free (can upgrade later)
5. Click "Create new project"
6. Wait 2-3 minutes for project initialization

## Step 2: Deploy Database Schema

1. In your Supabase dashboard, navigate to **SQL Editor** (left sidebar)
2. Click "+ New query"
3. Open the file `my-app/database/schema.sql` from your local project
4. Copy the entire contents and paste into the SQL Editor
5. Click "Run" button (or press `Ctrl+Enter`)
6. Verify all tables were created by checking the **Table Editor**

Expected tables:
- users
- wells
- safety_checklist_templates
- well_safety_checklist
- well_photos
- well_voice_notes
- hazards
- hse_tasks
- voluntary_action_templates
- voluntary_actions
- daily_reports
- activity_log
- notifications
- system_settings

## Step 3: Configure Authentication

1. Navigate to **Authentication** → **Providers** in the left sidebar
2. Enable **Email** provider (should be enabled by default)
3. Optional: Enable additional providers
   - Google OAuth
   - GitHub OAuth
   - Microsoft OAuth
4. Configure email templates (optional):
   - Navigate to **Authentication** → **Email Templates**
   - Customize confirmation, password reset templates

## Step 4: Set Up Storage Buckets

1. Navigate to **Storage** in the left sidebar
2. Click "Create a new bucket"
3. Create the following buckets:

### Bucket 1: Well Photos
- **Name**: `well-photos`
- **Public**: Yes (or implement RLS policies)
- **Allowed MIME types**: `image/*`
- **Maximum file size**: 5 MB

### Bucket 2: Well Voice Notes
- **Name**: `well-voice-notes`
- **Public**: No (use signed URLs)
- **Allowed MIME types**: `audio/*`
- **Maximum file size**: 10 MB

### Bucket 3: Hazard Photos
- **Name**: `hazard-photos`
- **Public**: Yes
- **Allowed MIME types**: `image/*`
- **Maximum file size**: 5 MB

## Step 5: Configure Row Level Security (RLS)

Row Level Security ensures users can only access data they're authorized to see.

### Enable RLS on all tables

In the SQL Editor, run:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wells ENABLE ROW LEVEL SECURITY;
ALTER TABLE well_safety_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE well_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE well_voice_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE hazards ENABLE ROW LEVEL SECURITY;
ALTER TABLE hse_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE voluntary_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
```

### Create RLS Policies

```sql
-- USERS TABLE POLICIES
-- Admins can view all users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (
    auth.uid() = id
  );

-- Admins can insert/update/delete users
CREATE POLICY "Admins can manage users" ON users
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- WELLS TABLE POLICIES
-- Authenticated users can view wells
CREATE POLICY "Authenticated users can view wells" ON wells
  FOR SELECT USING (auth.role() = 'authenticated');

-- Field engineers can create wells
CREATE POLICY "Field engineers can create wells" ON wells
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' IN ('field_engineer', 'admin', 'manager')
  );

-- Creators and admins can update their wells
CREATE POLICY "Users can update own wells" ON wells
  FOR UPDATE USING (
    created_by = auth.uid() OR auth.jwt() ->> 'role' IN ('admin', 'manager')
  );

-- HAZARDS TABLE POLICIES
-- Authenticated users can view hazards
CREATE POLICY "Authenticated users can view hazards" ON hazards
  FOR SELECT USING (auth.role() = 'authenticated');

-- Authenticated users can create hazards
CREATE POLICY "Users can create hazards" ON hazards
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Reporters, assignees, and admins can update hazards
CREATE POLICY "Authorized users can update hazards" ON hazards
  FOR UPDATE USING (
    reported_by = auth.uid() OR 
    assigned_to = auth.uid() OR 
    auth.jwt() ->> 'role' IN ('admin', 'hse_officer', 'manager')
  );

-- HSE TASKS POLICIES
-- Users can view their assigned tasks
CREATE POLICY "Users can view their tasks" ON hse_tasks
  FOR SELECT USING (
    assigned_to = auth.uid() OR 
    assigned_by = auth.uid() OR
    auth.jwt() ->> 'role' IN ('admin', 'manager')
  );

-- Managers and admins can create tasks
CREATE POLICY "Managers can create tasks" ON hse_tasks
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' IN ('admin', 'manager')
  );

-- Assignees and managers can update tasks
CREATE POLICY "Authorized users can update tasks" ON hse_tasks
  FOR UPDATE USING (
    assigned_to = auth.uid() OR 
    auth.jwt() ->> 'role' IN ('admin', 'manager')
  );

-- DAILY REPORTS POLICIES
-- Authenticated users can view reports
CREATE POLICY "Authenticated users can view reports" ON daily_reports
  FOR SELECT USING (auth.role() = 'authenticated');

-- Authenticated users can create reports
CREATE POLICY "Users can create reports" ON daily_reports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- NOTIFICATIONS POLICIES
-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());
```

## Step 6: Insert Sample Data

You can insert sample data using the Table Editor or run SQL:

```sql
-- Insert admin user (password hash for "admin123")
INSERT INTO users (email, password_hash, first_name, last_name, role, status)
VALUES (
  'admin@company.com',
  '$2a$10$YourHashedPasswordHere',
  'Admin',
  'User',
  'admin',
  'active'
);

-- Insert more sample data from mock-data.json
-- (You can use the Table Editor for this)
```

## Step 7: Get API Credentials

1. Navigate to **Settings** → **API** in your Supabase dashboard
2. Copy the following values:

```
Project URL: https://yourproject.supabase.co
anon key: eyJhbGc...
service_role key: eyJhbGc... (keep this secret!)
```

3. Add these to your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_USE_MOCK_DATA=false
```

## Step 8: Generate TypeScript Types

Install Supabase CLI:

```bash
npm install -g supabase
```

Login to Supabase:

```bash
supabase login
```

Generate types:

```bash
supabase gen types typescript --project-id "your-project-ref" > lib/database-types.ts
```

Your project ref can be found in the URL: `https://app.supabase.com/project/[your-project-ref]`

## Step 9: Test Connection

1. Start your Next.js development server:
```bash
cd my-app
npm run dev
```

2. Navigate to http://localhost:3000/login
3. Try logging in with a user you created in Supabase
4. Verify data loads from Supabase database

## Troubleshooting

### Error: "Invalid JWT"
- Verify your `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Make sure you're using the anon key, not the service role key for client-side code

### Error: "Row Level Security policy violation"
- Check that RLS policies are created correctly
- Verify user has the correct role in the users table
- Use Supabase SQL Editor to test queries directly

### Files not uploading
- Verify storage buckets are created
- Check bucket permissions and MIME type restrictions
- Ensure user is authenticated when uploading

### Data not appearing
- Verify schema was deployed successfully (check Table Editor)
- Check RLS policies allow your user to view the data
- Confirm correct table names match your code

## Next Steps

1. ✅ Supabase project created and configured
2. ✅ Schema deployed
3. ✅ Authentication enabled
4. ✅ Storage buckets created
5. ✅ RLS policies configured
6. 📱 Connect mobile app to Supabase
7. 💻 Test admin dashboard with real data
8. 🚀 Deploy to production

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
