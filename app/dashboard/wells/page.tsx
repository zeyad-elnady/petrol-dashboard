'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/api-client';
import { Search, Filter, Eye, MapPin } from 'lucide-react';

type Well = {
    id: string;
    name: string;
    location: string;
    rig_id: string;
    rig_name: string;
    status: string;
    created_by_user?: { first_name: string; last_name: string };
    updated_at: string;
};

export default function WellsPage() {
    const [wells, setWells] = useState<Well[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        loadWells();
    }, []);

    const loadWells = async () => {
        const { data } = await db.getWells();
        if (data) {
            setWells(data as Well[]);
        }
        setLoading(false);
    };

    const filteredWells = wells.filter(well => {
        const matchesSearch = well.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            well.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            well.rig_id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || well.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
            draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
            in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'In Progress' },
            completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
            suspended: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Suspended' },
            abandoned: { bg: 'bg-red-100', text: 'text-red-700', label: 'Abandoned' }
        };
        const config = statusConfig[status] || statusConfig.draft;
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading wells...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Wells Management</h1>
                    <p className="text-gray-600 mt-2">Manage drilling well records and operations</p>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Total: {filteredWells.length}</span>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, location, or rig..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
                        >
                            <option value="all">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="suspended">Suspended</option>
                            <option value="abandoned">Abandoned</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Wells Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredWells.map((well) => (
                    <div
                        key={well.id}
                        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100"
                    >
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{well.name}</h3>
                                    <div className="flex items-center text-gray-600 text-sm">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        {well.location}
                                    </div>
                                </div>
                                {getStatusBadge(well.status)}
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Rig ID:</span>
                                    <span className="font-semibold text-gray-900">{well.rig_id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Rig Name:</span>
                                    <span className="font-semibold text-gray-900">{well.rig_name}</span>
                                </div>
                                {well.created_by_user && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Created By:</span>
                                        <span className="font-semibold text-gray-900">
                                            {well.created_by_user.first_name} {well.created_by_user.last_name}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Last Updated:</span>
                                    <span className="font-semibold text-gray-900">
                                        {new Date(well.updated_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <button className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2">
                                    <Eye className="w-4 h-4" />
                                    <span>View Details</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredWells.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl shadow-md">
                    <p className="text-gray-600">No wells found matching your criteria</p>
                </div>
            )}
        </div>
    );
}
