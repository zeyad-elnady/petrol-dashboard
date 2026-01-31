// Mock API for development - matches Supabase client interface
// This allows development without Supabase connection

import mockData from '@/database/mock-data.json';

// Types
type User = typeof mockData.users[0];
type Well = typeof mockData.wells[0];
type Hazard = typeof mockData.hazards[0];
type Task = typeof mockData.hse_tasks[0];
type DailyReport = typeof mockData.daily_reports[0];

// Simulate async delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock authentication state
let currentUser: User | null = null;

// Mock auth helpers
export const mockAuthHelpers = {
    signIn: async (email: string, password: string) => {
        await delay(500);
        const user = mockData.users.find(u => u.email === email && u.password === password);

        if (user) {
            currentUser = user;
            // Store in localStorage for persistence
            if (typeof window !== 'undefined') {
                localStorage.setItem('mockUser', JSON.stringify(user));
            }
            return {
                data: { user, session: { access_token: 'mock-token' } },
                error: null
            };
        }

        return {
            data: null,
            error: { message: 'Invalid credentials' }
        };
    },

    signOut: async () => {
        await delay(200);
        currentUser = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('mockUser');
        }
        return { error: null };
    },

    getCurrentUser: async () => {
        await delay(100);
        if (typeof window !== 'undefined' && !currentUser) {
            const stored = localStorage.getItem('mockUser');
            if (stored) {
                currentUser = JSON.parse(stored);
            }
        }
        return currentUser;
    },

    onAuthStateChange: (callback: (event: string, session: any) => void) => {
        // Mock implementation - just call callback once
        setTimeout(() => {
            if (currentUser) {
                callback('SIGNED_IN', { user: currentUser });
            }
        }, 100);
        return { data: { subscription: { unsubscribe: () => { } } } };
    }
};

// Helper to get user details
const getUserDetails = (userId: string | null) => {
    if (!userId) return null;
    const user = mockData.users.find(u => u.id === userId);
    return user ? { first_name: user.first_name, last_name: user.last_name } : null;
};

// Mock database helpers
export const mockDbHelpers = {
    // Wells
    getWells: async () => {
        await delay(300);
        const wellsWithUsers = mockData.wells.map(well => ({
            ...well,
            created_by_user: getUserDetails(well.created_by)
        }));
        return { data: wellsWithUsers, error: null };
    },

    getWellById: async (id: string) => {
        await delay(200);
        const well = mockData.wells.find(w => w.id === id);
        if (!well) return { data: null, error: { message: 'Well not found' } };

        const checklists = mockData.well_safety_checklists
            .filter(c => c.well_id === id)
            .map(c => ({
                ...c,
                safety_checklist_templates: mockData.safety_checklist_templates.find(t => t.id === c.checklist_item_id)
            }));

        return {
            data: {
                ...well,
                created_by_user: getUserDetails(well.created_by),
                well_safety_checklist: checklists,
                well_photos: [],
                well_voice_notes: []
            },
            error: null
        };
    },

    // Drilling Workflow
    getProjects: async () => {
        await delay(200);
        return { data: mockData.projects, error: null };
    },

    getUnits: async (projectId?: string) => {
        await delay(200);
        let units = mockData.units;
        if (projectId) {
            units = units.filter(u => u.project_id === projectId);
        }
        return { data: units, error: null };
    },

    getWellSections: async (wellId: string) => {
        await delay(200);
        const sections = mockData.well_sections.filter(s => s.well_id === wellId);
        return { data: sections, error: null };
    },

    getChecklists: async (wellId: string, sectionId?: string) => {
        await delay(200);
        let checklists = mockData.checklists.filter(c => c.well_id === wellId);
        if (sectionId) {
            checklists = checklists.filter(c => c.section_id === sectionId);
        }
        return { data: checklists, error: null };
    },

    getApprovals: async (entityType: string, entityId: string) => {
        await delay(200);
        const approvals = mockData.approvals.filter(a =>
            a.entity_type === entityType && a.entity_id === entityId
        );
        return { data: approvals, error: null };
    },

    // Hazards
    getHazards: async () => {
        await delay(300);
        const hazardsWithUsers = mockData.hazards.map(hazard => ({
            ...hazard,
            reported_by_user: getUserDetails(hazard.reported_by)
        }));
        return { data: hazardsWithUsers, error: null };
    },

    getHazardById: async (id: string) => {
        await delay(200);
        const hazard = mockData.hazards.find(h => h.id === id);
        if (!hazard) return { data: null, error: { message: 'Hazard not found' } };

        return {
            data: {
                ...hazard,
                reported_by_user: getUserDetails(hazard.reported_by)
            },
            error: null
        };
    },

    updateHazardStatus: async (id: string, status: string) => {
        await delay(400);
        const hazard = mockData.hazards.find(h => h.id === id);
        if (!hazard) return { data: null, error: { message: 'Hazard not found' } };

        hazard.status = status as any;
        hazard.updated_at = new Date().toISOString();
        if (status === 'closed') {
            hazard.resolved_at = new Date().toISOString();
        }

        return { data: hazard, error: null };
    },

    // Tasks
    getTasks: async () => {
        await delay(300);
        const tasksWithUsers = mockData.hse_tasks.map(task => ({
            ...task,
            assigned_to_user: getUserDetails(task.assigned_to)
        }));
        return { data: tasksWithUsers, error: null };
    },

    updateTaskStatus: async (id: string, status: string) => {
        await delay(400);
        const task = mockData.hse_tasks.find(t => t.id === id);
        if (!task) return { data: null, error: { message: 'Task not found' } };

        task.status = status as any;
        task.updated_at = new Date().toISOString();
        if (status === 'in_progress') {
            task.started_at = new Date().toISOString();
        } else if (status === 'completed') {
            task.completed_at = new Date().toISOString();
        }

        return { data: task, error: null };
    },

    // Daily Reports
    getDailyReports: async () => {
        await delay(300);
        const reportsWithUsers = mockData.daily_reports.map(report => ({
            ...report,
            submitted_by_user: getUserDetails(report.submitted_by)
        }));
        return { data: reportsWithUsers, error: null };
    },

    // Users
    getUsers: async () => {
        await delay(300);
        // Don't expose passwords
        const usersWithoutPasswords = mockData.users.map(({ password, ...user }) => user);
        return { data: usersWithoutPasswords, error: null };
    },

    // Dashboard Stats
    getDashboardStats: async () => {
        await delay(200);
        const stats = {
            active_wells: mockData.wells.filter(w => w.status === 'in_progress').length,
            completed_wells: mockData.wells.filter(w => w.status === 'completed').length,
            open_hazards: mockData.hazards.filter(h => h.status === 'open').length,
            in_progress_hazards: mockData.hazards.filter(h => h.status === 'in_progress').length,
            high_priority_hazards: mockData.hazards.filter(h => h.priority === 'high' && ['open', 'in_progress'].includes(h.status)).length,
            overdue_tasks: mockData.hse_tasks.filter(t => t.status === 'overdue').length,
            pending_tasks: mockData.hse_tasks.filter(t => t.status === 'pending').length,
            todays_reports: mockData.daily_reports.filter(r => r.report_date === new Date().toISOString().split('T')[0]).length,
            active_users: mockData.users.filter(u => u.status === 'active').length
        };
        return { data: stats, error: null };
    },

    // Create new user (for super admin - mock implementation)
    createUser: async (userData: {
        email: string;
        password: string;
        first_name: string;
        last_name: string;
        role: 'admin' | 'engineer';
        phone?: string;
    }) => {
        await delay(500);

        // Check if email already exists
        if (mockData.users.some(u => u.email === userData.email)) {
            return { data: null, error: { message: 'Email already exists' } };
        }

        const newUser = {
            id: `user-${Date.now()}`,
            email: userData.email,
            password: userData.password,
            first_name: userData.first_name,
            last_name: userData.last_name,
            role: userData.role,
            status: 'active' as const,
            phone: userData.phone || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_login_at: null,
            profile_picture_url: null,
            metadata: {}
        };

        // Add to mock data array
        (mockData.users as any[]).push(newUser);

        return { data: newUser, error: null };
    }
};

// Mock storage helpers
export const mockStorageHelpers = {
    uploadWellPhoto: async (wellId: string, file: File) => {
        await delay(1000);
        // Return a mock URL
        return {
            data: `https://images.unsplash.com/photo-${Date.now()}?w=400`,
            error: null
        };
    },

    uploadHazardPhoto: async (hazardId: string, file: File, type: 'before' | 'after') => {
        await delay(1000);
        return {
            data: `https://images.unsplash.com/photo-${Date.now()}?w=400`,
            error: null
        };
    }
};

// Mock realtime helpers
export const mockRealtimeHelpers = {
    subscribeToWells: (callback: (payload: any) => void) => {
        // Mock implementation - no real subscription
        return {
            unsubscribe: () => { }
        };
    },

    subscribeToHazards: (callback: (payload: any) => void) => {
        return {
            unsubscribe: () => { }
        };
    },

    subscribeToTasks: (callback: (payload: any) => void) => {
        return {
            unsubscribe: () => { }
        };
    }
};
