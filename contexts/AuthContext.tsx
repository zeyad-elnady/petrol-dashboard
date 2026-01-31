'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '@/lib/api-client';

type User = {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    status: string;
};

// Roles that can access the dashboard
const DASHBOARD_ROLES = ['super_admin', 'admin', 'hse_lead', 'ops'];
// Roles that can access the mobile app
const MOBILE_ROLES = ['engineer', 'manager', 'field_engineer', 'hse_officer'];

type AuthContextType = {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
    isSuperAdmin: () => boolean;
    canAccessDashboard: () => boolean;
    canAccessMobile: () => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const currentUser = await auth.getCurrentUser();
            setUser(currentUser as User);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email: string, password: string) => {
        const { data, error } = await auth.signIn(email, password);
        if (data && !error) {
            // Fetch full user details after auth
            const userData = await auth.getCurrentUser();
            setUser(userData as User);
            return { error: null };
        }
        return { error };
    };

    const signOut = async () => {
        await auth.signOut();
        setUser(null);
    };

    const isSuperAdmin = () => {
        return user?.role === 'super_admin';
    };

    const canAccessDashboard = () => {
        return user ? DASHBOARD_ROLES.includes(user.role) : false;
    };

    const canAccessMobile = () => {
        return user ? MOBILE_ROLES.includes(user.role) : false;
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signOut, isSuperAdmin, canAccessDashboard, canAccessMobile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
