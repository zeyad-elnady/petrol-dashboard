'use client';

import { useEffect, useState } from 'react';
import { db, auth } from '@/lib/api-client';
import { CheckCircle, Clock, AlertCircle, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MobileTasksPage() {
    const router = useRouter();
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        setLoading(true);
        const user = await auth.getCurrentUser();
        const { data } = await db.getTasks();

        if (data && user) {
            // Filter tasks assigned to current user
            const myTasks = data.filter((t: any) => t.assigned_to === user.id);
            setTasks(myTasks);
        }
        setLoading(false);
    };

    const handleCompleteTask = async (taskId: string) => {
        // Optimistic update
        setTasks(tasks.map(t =>
            t.id === taskId ? { ...t, status: 'completed' } : t
        ));

        await db.updateTaskStatus(taskId, 'completed');
    };

    const filteredTasks = tasks.filter(t => {
        if (filter === 'pending') return t.status === 'pending' || t.status === 'in_progress';
        return t.status === filter;
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b flex items-center justify-between sticky top-0 z-10">
                <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-500">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="font-semibold text-lg">My Tasks</h1>
                <div className="w-10" />
            </div>

            {/* Filters */}
            <div className="bg-white p-2 flex space-x-2 border-b sticky top-[57px] z-10">
                {['pending', 'completed', 'overdue'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-colors
              ${filter === f
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Task List */}
            <div className="flex-1 p-4 space-y-4">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No {filter} tasks found</p>
                    </div>
                ) : (
                    filteredTasks.map((task) => (
                        <div key={task.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full
                  ${task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                        task.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                                            'bg-blue-100 text-blue-700'}`}>
                                    {task.priority.toUpperCase()}
                                </span>
                                <span className="text-xs text-gray-500 flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Due: {new Date(task.due_date).toLocaleDateString()}
                                </span>
                            </div>

                            <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{task.description}</p>

                            {task.status !== 'completed' && (
                                <button
                                    onClick={() => handleCompleteTask(task.id)}
                                    className="w-full py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Mark Complete
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
