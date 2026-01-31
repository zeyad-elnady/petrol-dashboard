'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
    LayoutDashboard,
    Wrench,
    AlertTriangle,
    ListTodo,
    FileText,
    Users,
    Settings,
    ChevronLeft,
    Shield,
    Activity
} from 'lucide-react';

type SidebarProps = {
    isOpen: boolean;
};

type MenuItem = {
    label: string;
    href: string;
    icon: any;
    allowedRoles?: string[]; // If undefined, shown to all
};

const menuItems: MenuItem[] = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard }, // Shown to all
    { label: 'Operations', href: '/dashboard/operations', icon: Activity, allowedRoles: ['super_admin', 'admin', 'ops'] },
    { label: 'Hazards', href: '/dashboard/hazards', icon: AlertTriangle, allowedRoles: ['super_admin', 'admin', 'hse_lead'] },
    { label: 'Tasks', href: '/dashboard/tasks', icon: ListTodo, allowedRoles: ['super_admin', 'admin', 'ops'] },
    { label: 'Daily Reports', href: '/dashboard/reports', icon: FileText, allowedRoles: ['super_admin', 'admin', 'ops'] },
    { label: 'Users', href: '/dashboard/users', icon: Users, allowedRoles: ['super_admin', 'admin'] },
    { label: 'Hierarchy Management', href: '/dashboard/hierarchy-management', icon: Wrench, allowedRoles: ['super_admin', 'admin'] },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings }, // Shown to all
];

export default function Sidebar({ isOpen }: SidebarProps) {
    const pathname = usePathname();
    const { user } = useAuth();

    // Filter menu items based on user role
    const filteredMenuItems = menuItems.filter(item => {
        // If no allowedRoles specified, show to everyone
        if (!item.allowedRoles) return true;
        // Otherwise check if user's role is in allowedRoles
        return user?.role && item.allowedRoles.includes(user.role);
    });

    return (
        <aside
            className={`fixed left-0 top-0 h-full bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl transition-all duration-300 z-40
        ${isOpen ? 'w-64' : 'w-20'}`}
        >
            {/* Logo/Header */}
            <div className="flex items-center justify-center h-16 border-b border-gray-700 px-4">
                {isOpen ? (
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-lg">HSE Admin</span>
                    </div>
                ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5" />
                    </div>
                )}
            </div>

            {/* Navigation Menu */}
            <nav className="mt-8 px-3">
                <ul className="space-y-2">
                    {filteredMenuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group
                    ${isActive
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg'
                                            : 'hover:bg-gray-700/50 hover:translate-x-1'
                                        }`}
                                    title={!isOpen ? item.label : ''}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                                    {isOpen && (
                                        <span className={`ml-3 font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                                            {item.label}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Version/Footer */}
            {isOpen && (
                <div className="absolute bottom-4 left-0 right-0 px-6">
                    <div className="text-xs text-gray-500 text-center">
                        <p>Version 1.0.0</p>
                        <p className="mt-1">© 2025 HSE Admin</p>
                    </div>
                </div>
            )}
        </aside>
    );
}
