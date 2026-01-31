'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/api-client';
import {
    User,
    Settings,
    LogOut,
    Bell,
    Moon,
    Shield,
    ChevronRight,
    Award,
    FileText,
    CheckSquare
} from 'lucide-react';

export default function MobileProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({
        tasksCompleted: 0,
        reportsSubmitted: 0,
        hazardsReported: 0
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        const currentUser = await auth.getCurrentUser();
        setUser(currentUser);

        if (currentUser) {
            // Mock stats loading
            const { data: tasks } = await db.getTasks();
            const { data: reports } = await db.getDailyReports();
            const { data: hazards } = await db.getHazards();

            if (tasks && reports && hazards) {
                setStats({
                    tasksCompleted: tasks.filter((t: any) => t.assigned_to === currentUser.id && t.status === 'completed').length,
                    reportsSubmitted: reports.filter((r: any) => r.submitted_by === currentUser.id).length,
                    hazardsReported: hazards.filter((h: any) => h.reported_by === currentUser.id).length
                });
            }
        }
    };

    const handleLogout = async () => {
        await auth.signOut();
        router.push('/login');
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header Profile Card */}
            <div className="bg-white p-6 pb-8 rounded-b-[2.5rem] shadow-sm relative z-10">
                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4 border-4 border-white shadow-lg">
                        <User className="w-10 h-10" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900">{user.first_name} {user.last_name}</h1>
                    <p className="text-gray-500 text-sm">{user.role} • ID: {user.employee_id || 'EMP-001'}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mt-8">
                    <div className="text-center">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mx-auto mb-2">
                            <CheckSquare className="w-5 h-5" />
                        </div>
                        <div className="font-bold text-gray-900">{stats.tasksCompleted}</div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold">Tasks</div>
                    </div>
                    <div className="text-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mx-auto mb-2">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div className="font-bold text-gray-900">{stats.reportsSubmitted}</div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold">Reports</div>
                    </div>
                    <div className="text-center">
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 mx-auto mb-2">
                            <Award className="w-5 h-5" />
                        </div>
                        <div className="font-bold text-gray-900">{stats.hazardsReported}</div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold">Hazards</div>
                    </div>
                </div>
            </div>

            {/* Settings List */}
            <div className="flex-1 p-4 space-y-6">
                <section>
                    <h2 className="text-sm font-bold text-gray-500 uppercase mb-3 ml-2">App Settings</h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y">
                        <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors first:rounded-t-xl">
                            <div className="flex items-center">
                                <Bell className="w-5 h-5 text-gray-400 mr-3" />
                                <span className="text-gray-700 font-medium">Notifications</span>
                            </div>
                            <div className="w-10 h-6 bg-blue-600 rounded-full relative">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                            </div>
                        </button>
                        <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center">
                                <Moon className="w-5 h-5 text-gray-400 mr-3" />
                                <span className="text-gray-700 font-medium">Dark Mode</span>
                            </div>
                            <div className="w-10 h-6 bg-gray-200 rounded-full relative">
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                            </div>
                        </button>
                        <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors last:rounded-b-xl">
                            <div className="flex items-center">
                                <Shield className="w-5 h-5 text-gray-400 mr-3" />
                                <span className="text-gray-700 font-medium">Security</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300" />
                        </button>
                    </div>
                </section>

                <section>
                    <h2 className="text-sm font-bold text-gray-500 uppercase mb-3 ml-2">Account</h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y">
                        <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl">
                            <div className="flex items-center">
                                <Settings className="w-5 h-5 text-gray-400 mr-3" />
                                <span className="text-gray-700 font-medium">Edit Profile</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300" />
                        </button>
                    </div>
                </section>

                <button
                    onClick={handleLogout}
                    className="w-full p-4 bg-red-50 text-red-600 font-bold rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors"
                >
                    <LogOut className="w-5 h-5 mr-2" />
                    Sign Out
                </button>

                <p className="text-center text-xs text-gray-400 pb-4">
                    Version 1.0.0 (Build 142)
                </p>
            </div>
        </div>
    );
}
