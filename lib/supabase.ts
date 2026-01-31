// Supabase client configuration for production use
// This file sets up the Supabase client with TypeScript types

import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment variables
// Use placeholder values in development/mock mode to prevent errors
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Authentication helpers
export const authHelpers = {
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getCurrentUser: async () => {
    // First get auth session for token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    try {
      // Use API route to bypass RLS and get full user data
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch user from API');
        return null;
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Database query helpers
export const dbHelpers = {
  // Wells
  getWells: async () => {
    const { data, error } = await supabase
      .from('wells')
      .select('*, created_by_user:users!wells_created_by_fkey(first_name, last_name)')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  getWellById: async (id: string) => {
    const { data, error } = await supabase
      .from('wells')
      .select(`
        *,
        created_by_user:users!wells_created_by_fkey(first_name, last_name),
        well_safety_checklist(*, safety_checklist_templates(*)),
        well_photos(*),
        well_voice_notes(*)
      `)
      .eq('id', id)
      .single();
    return { data, error };
  },

  // Drilling Workflow
  getProjects: async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('name');
    return { data, error };
  },

  getUnits: async (projectId?: string) => {
    let query = supabase.from('units').select('*');
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    const { data, error } = await query.order('unit_number');
    return { data, error };
  },

  getWellSections: async (wellId: string) => {
    const { data, error } = await supabase
      .from('well_sections')
      .select('*')
      .eq('well_id', wellId)
      .order('created_at');
    return { data, error };
  },

  getChecklists: async (wellId: string, sectionId?: string) => {
    let query = supabase.from('checklists').select('*');
    query = query.eq('well_id', wellId);
    if (sectionId) {
      query = query.eq('section_id', sectionId);
    }
    const { data, error } = await query.order('created_at');
    return { data, error };
  },

  getApprovals: async (entityType: string, entityId: string) => {
    const { data, error } = await supabase
      .from('approvals')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at');
    return { data, error };
  },

  getHazards: async () => {
    const { data, error } = await supabase
      .from('hazards')
      .select('*, reported_by_user:users!hazards_reported_by_fkey(first_name, last_name)')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  getHazardById: async (id: string) => {
    const { data, error } = await supabase
      .from('hazards')
      .select('*, reported_by_user:users!hazards_reported_by_fkey(first_name, last_name)')
      .eq('id', id)
      .single();
    return { data, error };
  },

  updateHazardStatus: async (id: string, status: string) => {
    const { data, error } = await supabase
      .from('hazards')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  // Tasks
  getTasks: async () => {
    const { data, error } = await supabase
      .from('hse_tasks')
      .select('*, assigned_to_user:users!hse_tasks_assigned_to_fkey(first_name, last_name)')
      .order('due_date', { ascending: true });
    return { data, error };
  },

  updateTaskStatus: async (id: string, status: string) => {
    const updates: any = { status, updated_at: new Date().toISOString() };
    if (status === 'in_progress') {
      updates.started_at = new Date().toISOString();
    } else if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('hse_tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  // Daily Reports
  getDailyReports: async () => {
    const { data, error } = await supabase
      .from('daily_reports')
      .select('*, submitted_by_user:users!daily_reports_submitted_by_fkey(first_name, last_name)')
      .order('report_date', { ascending: false });
    return { data, error };
  },

  // Users
  getUsers: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    const { data, error } = await supabase
      .from('dashboard_statistics')
      .select('*')
      .single();
    return { data, error };
  },

  // Create new user (for super admin)
  createUser: async (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: 'admin' | 'engineer';
    phone?: string;
  }) => {
    // First create the auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // Auto-confirm email
    });

    if (authError) {
      return { data: null, error: authError };
    }

    // Then create the user record in the users table
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email: userData.email,
        password_hash: 'managed_by_supabase_auth',
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role,
        status: 'active',
        phone: userData.phone || null,
      }])
      .select()
      .single();

    return { data, error };
  }
};

// File upload helpers
export const storageHelpers = {
  uploadWellPhoto: async (wellId: string, file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${wellId} / ${Math.random()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('well-photos')
      .upload(fileName, file);

    if (error) return { data: null, error };

    const { data: { publicUrl } } = supabase.storage
      .from('well-photos')
      .getPublicUrl(fileName);

    return { data: publicUrl, error: null };
  },

  uploadHazardPhoto: async (hazardId: string, file: File, type: 'before' | 'after') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${hazardId} / ${type} - ${Math.random()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('hazard-photos')
      .upload(fileName, file);

    if (error) return { data: null, error };

    const { data: { publicUrl } } = supabase.storage
      .from('hazard-photos')
      .getPublicUrl(fileName);

    return { data: publicUrl, error: null };
  }
};

// Real-time subscription helpers
export const realtimeHelpers = {
  subscribeToWells: (callback: (payload: any) => void) => {
    return supabase
      .channel('wells-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'wells' },
        callback
      )
      .subscribe();
  },

  subscribeToHazards: (callback: (payload: any) => void) => {
    return supabase
      .channel('hazards-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'hazards' },
        callback
      )
      .subscribe();
  },

  subscribeToTasks: (callback: (payload: any) => void) => {
    return supabase
      .channel('tasks-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'hse_tasks' },
        callback
      )
      .subscribe();
  }
};

// Chat helpers
export const chatHelpers = {
  getMessages: async (limit: number = 50) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*, sender:users!chat_messages_user_id_fkey(first_name, last_name)')
      .order('created_at', { ascending: false })
      .limit(limit);

    // Reverse to show oldest first in the UI (if we want to scroll down)
    // But typically we fetch latest. 
    // Let's return as is and let UI handle sort direction or just fetch correct order.
    // Actually, usually chat needs ascending order for display
    if (data) {
      return { data: data.reverse(), error };
    }
    return { data, error };
  },

  sendMessage: async (message: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error('User not authenticated') };

    const { data, error } = await supabase
      .from('chat_messages')
      .insert([{
        user_id: user.id,
        message
      }])
      .select('*, sender:users!chat_messages_user_id_fkey(first_name, last_name)')
      .single();
    return { data, error };
  },

  subscribeToMessages: (callback: (payload: any) => void) => {
    return supabase
      .channel('public:chat_messages')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        callback
      )
      .subscribe();
  }
};
