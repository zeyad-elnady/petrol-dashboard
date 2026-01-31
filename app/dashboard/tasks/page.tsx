'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/api-client';
import { Search, Filter, Calendar, Clock, User } from 'lucide-react';

type Task = {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    assigned_to_user?: { first_name: string; last_name: string };
    due_date: string;
    assigned_at: string;
};

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        const { data } = await db.getTasks();
        if (data) {
            setTasks(data as Task[]);
        }
        setLoading(false);
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        const config: Record<string, { bg: string; text: string; label: string }> = {
            pending: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Pending' },
            in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'In Progress' },
            completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
            cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Cancelled' },
            overdue: { bg: 'bg-red-100', text: 'text-red-700', label: 'Overdue' }
        };
        const c = config[status] || config.pending;
        return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>{c.label}</span>;
    };

    const getPriorityBadge = (priority: string) => {
        const config: Record<string, { bg: string; text: string }> = {
            low: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
            medium: { bg: 'bg-orange-100', text: 'text-orange-700' },
            high: { bg: 'bg-red-100', text: 'text-red-700' }
        };
        const c = config[priority] || config.medium;
        return <span className={`px-2 py-1 rounded text-xs font-semibold ${c.bg} ${c.text} capitalize`}>{priority} Priority</span>;
    };

    const isOverdue = (task: Task) => {
        return task.status === 'overdue' || (new Date(task.due_date) < new Date() && task.status !== 'completed');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading tasks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Tasks Management</h1>
                    <p className="text-gray-600 mt-2">Monitor and manage HSE tasks</p>
                </div>
                <span className="text-sm text-gray-600">Total: {filteredTasks.length}</span>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="overdue">Overdue</option>
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                {filteredTasks.map((task) => (
                    <div
                        key={task.id}
                        className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border-l-4
              ${isOverdue(task) ? 'border-red-500' : 'border-blue-500'}`}
                    >
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{task.title}</h3>
                                    <p className="text-gray-600 text-sm">{task.description}</p>
                                </div>
                                <div className="flex flex-col gap-2 ml-4">
                                    {getStatusBadge(task.status)}
                                    {getPriorityBadge(task.priority)}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                {task.assigned_to_user && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <User className="w-4 h-4 mr-2" />
                                        <span>
                                            <span className="font-semibold text-gray-900">
                                                {task.assigned_to_user.first_name} {task.assigned_to_user.last_name}
                                            </span>
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center text-sm text-gray-600">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    <span>
                                        Due: <span className={`font-semibold ${isOverdue(task) ? 'text-red-600' : 'text-gray-900'}`}>
                                            {new Date(task.due_date).toLocaleDateString()}
                                        </span>
                                    </span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Clock className="w-4 h-4 mr-2" />
                                    <span>
                                        Assigned: <span className="font-semibold text-gray-900">
                                            {new Date(task.assigned_at).toLocaleDateString()}
                                        </span>
                                    </span>
                                </div>
                            </div>

                            {isOverdue(task) && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-700 font-semibold">⚠️ This task is overdue</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredTasks.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl shadow-md">
                    <p className="text-gray-600">No tasks found matching your criteria</p>
                </div>
            )}
        </div>
    );
}
