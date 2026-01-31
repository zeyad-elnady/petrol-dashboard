'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/api-client';
import Link from 'next/link';
import {
    Bell,
    Plus,
    AlertTriangle,
    Droplet,
    FileText,
    ChevronRight,
    Clock
} from 'lucide-react';

export default function MobileHomePage() {
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<any>({
        pendingTasks: 0,
        activeHazards: 0
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const currentUser = await auth.getCurrentUser();
        setUser(currentUser);

        const { data: tasks } = await db.getTasks();
        const { data: hazards } = await db.getHazards();

        if (tasks && hazards) {
            setStats({
                pendingTasks: tasks.filter((t: any) => t.assigned_to === currentUser?.id && t.status === 'pending').length,
                activeHazards: hazards.filter((h: any) => h.status === 'open').length
            });
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <header className="bg-blue-600 text-white p-6 rounded-b-3xl shadow-lg">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-blue-100 text-sm">Welcome back,</p>
                        <h1 className="text-2xl font-bold">{user?.first_name || 'Engineer'}</h1>
                    </div>
                    <button className="p-2 bg-blue-500 rounded-full hover:bg-blue-400 relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full border-2 border-blue-500"></span>
                    </button>
                </div>

                {/* Quick Stats */}
                <div className="flex space-x-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex-1">
                        <div className="text-2xl font-bold">{stats.pendingTasks}</div>
                        <div className="text-xs text-blue-100">Pending Tasks</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex-1">
                        <div className="text-2xl font-bold">{stats.activeHazards}</div>
                        <div className="text-xs text-blue-100">Active Hazards</div>
                    </div>
                </div>
            </header>

            <div className="p-6 space-y-8">
                {/* Quick Actions */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/mobile/hazards/new" className="bg-red-50 p-4 rounded-xl border border-red-100 active:scale-95 transition-transform">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-3 text-red-600">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <span className="font-semibold text-gray-900 block">Report Hazard</span>
                            <span className="text-xs text-gray-500">Safety first</span>
                        </Link>

                        <Link href="/mobile/wells/new" className="bg-blue-50 p-4 rounded-xl border border-blue-100 active:scale-95 transition-transform">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3 text-blue-600">
                                <Droplet className="w-5 h-5" />
                            </div>
                            <span className="font-semibold text-gray-900 block">New Well</span>
                            <span className="text-xs text-gray-500">Start drilling</span>
                        </Link>

                        <Link href="/mobile/reports/new" className="bg-green-50 p-4 rounded-xl border border-green-100 active:scale-95 transition-transform">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-3 text-green-600">
                                <FileText className="w-5 h-5" />
                            </div>
                            <span className="font-semibold text-gray-900 block">Daily Report</span>
                            <span className="text-xs text-gray-500">Log progress</span>
                        </Link>

                        <Link href="/mobile/tasks" className="bg-purple-50 p-4 rounded-xl border border-purple-100 active:scale-95 transition-transform">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-3 text-purple-600">
                                <Clock className="w-5 h-5" />
                            </div>
                            <span className="font-semibold text-gray-900 block">My Tasks</span>
                            <span className="text-xs text-gray-500">View schedule</span>
                        </Link>
                    </div>
                </section>

                {/* Recent Activity */}
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                        <Link href="/mobile/activity" className="text-sm text-blue-600">View All</Link>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                                    <FileText className="w-5 h-5 text-gray-500" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900">Daily Report Submitted</h3>
                                    <p className="text-xs text-gray-500">Well Alpha-7 • 2 hours ago</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
