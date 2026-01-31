'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/api-client';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';
import {
    Activity,
    MapPin,
    MoreHorizontal,
    PlayCircle,
    CheckCircle,
    AlertTriangle,
    Clock,
    Search,
    Filter
} from 'lucide-react';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Project = {
    id: string;
    country: string;
    name: string;
};

type Unit = {
    id: string;
    project_id: string;
    unit_type: string;
    unit_number: string;
};

type Well = {
    id: string;
    name: string;
    status: string;
    unit_id: string;
    well_type: string;
    well_shape: string;
};

type RigStatus = {
    unit: Unit;
    project: Project;
    activeWell?: Well;
    currentSection?: any;
};

export default function OperationsPage() {
    const { user } = useAuth();
    const [rigStatuses, setRigStatuses] = useState<RigStatus[]>([]);
    const [supabaseWells, setSupabaseWells] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // Region filter
    const [userAssignments, setUserAssignments] = useState<any[]>([]);

    // Wells filtering state
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [userFilter, setUserFilter] = useState('all');
    const [users, setUsers] = useState<any[]>([]);
    const [availableRegions, setAvailableRegions] = useState<string[]>(['all']);

    useEffect(() => {
        if (user) {
            loadOperationsData();
        }
    }, [user]);

    const loadOperationsData = async () => {
        setLoading(true);
        try {
            // Fetch user assignments if Ops role
            if (user?.role === 'ops') {
                const response = await fetch(`/api/user-assignments?userId=${user.id}`);
                const result = await response.json();
                console.log('🔍 Ops user assignments:', result.data);
                setUserAssignments(result.data || []);
            } else {
                console.log('👤 User role:', user?.role);
            }

            // Fetch hierarchy from existing API
            const { data: projects } = await db.getProjects();
            const { data: units } = await db.getUnits();
            const { data: apiWells } = await db.getWells();

            // Store projects for region filter
            console.log('📍 Projects data:', projects);
            if (projects && projects.length > 0) {
                const allProjects = projects as any[];
                console.log('📍 All projects:', allProjects);
                // Extract unique countries from all projects
                const uniqueCountries = Array.from(new Set(
                    allProjects.map(p => p.country).filter(Boolean)
                )).sort();
                console.log('📍 Unique countries:', uniqueCountries);
                setAvailableRegions(['all', ...uniqueCountries as string[]]);
            } else {
                console.log('❌ No projects data found, using hardcoded regions');
                // Fallback to hardcoded regions if API returns empty
                setAvailableRegions(['all', 'Oman', 'Saudi', 'Mexico', 'UAE']);
            }

            // Also fetch wells directly from Supabase
            const { data: wells } = await supabase
                .from('wells')
                .select('*')
                .order('updated_at', { ascending: false });

            // Store Supabase wells separately
            setSupabaseWells(wells || []);

            // Fetch engineer users only (for filtering and display)
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('id, email, role')
                .in('role', ['engineer', 'field_engineer']);

            console.log('Users fetch result:', usersData);
            console.log('Users fetch ERROR:', JSON.stringify(usersError, null, 2));
            console.log('Wells with created_by:', (wells || []).map(w => ({ id: w.id, created_by: w.created_by })));

            setUsers(usersData || []);

            // Combine both sources for unit matching
            const allWells = [...(apiWells || []), ...(wells || [])];

            if (!projects || !units) return;

            // Map units to their status
            const statuses = await Promise.all(units.map(async (unit: any) => {
                const project = projects.find((p: any) => p.id === unit.project_id);
                const activeWell = allWells.find((w: any) => w.unit_id === unit.id && w.status === 'in_progress');

                let currentSection = null;
                if (activeWell) {
                    const { data: sections } = await db.getWellSections(activeWell.id);
                    if (sections && sections.length > 0) {
                        // Find the latest section or the one in progress
                        currentSection = sections.find((s: any) => s.status === 'drilling') || sections[sections.length - 1];
                    }
                }

                return {
                    unit,
                    project,
                    activeWell,
                    currentSection
                };
            }));

            setRigStatuses(statuses);
        } catch (error) {
            console.error('Error loading operations data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter wells based on search, status, and user
    const filteredWells = supabaseWells.filter(well => {
        const name = well.name || well.well_id || '';
        const location = well.location || '';
        const type = well.well_type || '';
        const country = (well as any).country || ''; // Wells have a country field
        const project = (well as any).project || ''; // Wells have a project field

        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            type.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || well.status === statusFilter;
        const matchesUser = userFilter === 'all' || well.created_by === userFilter;

        // Apply location-based filtering for Ops role
        let matchesLocation = true;
        if (user?.role === 'ops') {
            if (userAssignments.length === 0) {
                matchesLocation = false; // No assignments = no access
            } else {
                matchesLocation = userAssignments.some(assignment => {
                    // Check country and project fields directly
                    const assignedCountry = assignment.country?.toLowerCase();
                    const assignedProject = assignment.project?.toLowerCase();
                    const wellCountry = country.toLowerCase();
                    const wellProject = project.toLowerCase();

                    if (assignedCountry && wellCountry !== assignedCountry) return false;
                    if (assignedProject && wellProject !== assignedProject) return false;
                    return true;
                });
            }
        }

        // Apply region filter from Active Rigs filter buttons - use country field
        const matchesRegion = filter === 'all' || country.toLowerCase() === filter.toLowerCase();

        return matchesSearch && matchesStatus && matchesUser && matchesLocation && matchesRegion;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Drilling Operations</h1>
                    <p className="text-gray-600">Real-time status of all active units and wells</p>
                </div>
                <div className="flex space-x-2">
                    <a href="/dashboard/operations/approvals" className="px-4 py-2 bg-orange-100 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-200 transition-colors font-medium">
                        ⏳ Pending Approvals
                    </a>
                </div>
            </div>

            {/* Rig Cards Grid */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Active Rigs</h2>
                    {/* Region Filters - Dynamic based on actual countries in projects */}
                    <div className="flex space-x-2 overflow-x-auto">
                        {availableRegions.map((region) => (
                            <button
                                key={region}
                                onClick={() => setFilter(region)}
                                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors
                                ${filter === region
                                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                            >
                                {region === 'all' ? 'All Regions' : region}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {(() => {
                        const afterRegionFilter = rigStatuses.filter(status => filter === 'all' || status.project?.country === filter);

                        const afterOpsFilter = afterRegionFilter.filter(status => {
                            // Apply location-based filtering for Ops role
                            console.log(`📊 Filtering - Total: ${rigStatuses.length}, After region: ${afterRegionFilter.length}, User role: ${user?.role}, Assignments: ${userAssignments.length}`);

                            if (user?.role !== 'ops') return true;
                            if (userAssignments.length === 0) {
                                console.log('❌ No assignments found for Ops user');
                                return false; // No assignments = no access
                            }

                            const matches = userAssignments.some(assignment => {
                                // Check if project matches any assignment
                                console.log('🔎 Checking:', {
                                    assignment,
                                    rig: status.unit?.unit_number,
                                    project: status.project?.name,
                                    country: status.project?.country
                                });

                                if (assignment.country && status.project?.country !== assignment.country) {
                                    console.log('❌ Country mismatch');
                                    return false;
                                }
                                if (assignment.project && status.project?.name !== assignment.project) {
                                    console.log('❌ Project mismatch');
                                    return false;
                                }
                                if (assignment.unit && status.unit?.unit_number !== assignment.unit) {
                                    console.log('❌ Unit mismatch');
                                    return false;
                                }
                                console.log('✅ Match found!');
                                return true;
                            });

                            return matches;
                        });

                        return afterOpsFilter.map((status) => (
                            <div key={status.unit.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                {/* Card Header */}
                                <div className="p-5 border-b border-gray-100 bg-gray-50">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <h3 className="font-bold text-lg text-gray-900">{status.unit.unit_number}</h3>
                                                <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                                                    {status.unit.unit_type}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                                <MapPin className="w-3 h-3 mr-1" />
                                                {status.project?.country} - {status.project?.name}
                                            </div>
                                        </div>
                                        <div className={`w-3 h-3 rounded-full ${status.activeWell ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-5 space-y-4">
                                    {status.activeWell ? (
                                        <>
                                            <div>
                                                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Current Well</div>
                                                <div className="font-medium text-blue-600 flex items-center">
                                                    {status.activeWell.name}
                                                    <span className="ml-2 text-xs text-gray-400">({status.activeWell.well_type})</span>
                                                </div>
                                            </div>

                                            {status.currentSection ? (
                                                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-xs font-semibold text-blue-800">Current Phase</span>
                                                        <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                                                            {status.currentSection.status}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {status.currentSection.section_name}
                                                    </div>
                                                    <div className="mt-2 flex items-center text-xs text-gray-500">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        Started: {new Date(status.currentSection.started_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100 text-yellow-800 text-sm">
                                                    <AlertTriangle className="w-4 h-4 inline mr-2" />
                                                    No active section
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-4 pt-2">
                                                <div className="text-center p-2 bg-gray-50 rounded-lg">
                                                    <div className="text-xs text-gray-500">Depth</div>
                                                    <div className="font-bold text-gray-900">
                                                        {status.currentSection?.target_depth ? `${status.currentSection.target_depth}m` : '-'}
                                                    </div>
                                                </div>
                                                <div className="text-center p-2 bg-gray-50 rounded-lg">
                                                    <div className="text-xs text-gray-500">Shape</div>
                                                    <div className="font-bold text-gray-900">{status.activeWell.well_shape}</div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                                            <PlayCircle className="w-10 h-10 mb-2 opacity-50" />
                                            <p className="text-sm">No active operation</p>
                                            <button className="mt-2 text-blue-600 text-sm hover:underline">Start New Well</button>
                                        </div>
                                    )}
                                </div>

                                {/* Card Footer */}
                                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-xs text-gray-500">Last update: Just now</span>
                                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                        View Details &rarr;
                                    </button>
                                </div>
                            </div>
                        ));
                    })()}
                </div>
            </div>

            {/* Wells Section with Filters */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-lg font-semibold text-gray-900">Wells Management</h2>

                    {/* Wells Filters */}
                    <div className="flex flex-1 md:flex-none gap-3">
                        {/* Status Filter */}
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full md:w-40 pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white text-sm text-gray-900"
                            >
                                <option value="all">All Status</option>
                                <option value="draft">Draft</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="approved">Approved</option>
                                <option value="suspended">Suspended</option>
                            </select>
                            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
                        </div>

                        {/* User Filter */}
                        <div className="relative">
                            <select
                                value={userFilter}
                                onChange={(e) => setUserFilter(e.target.value)}
                                className="w-full md:w-48 pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white text-sm text-gray-900"
                            >
                                <option value="all">All Users</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.email || user.id.slice(0, 8)}
                                    </option>
                                ))}
                            </select>
                            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
                        </div>

                        {/* Search */}
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search wells..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-gray-900 placeholder:text-gray-500"
                            />
                        </div>
                    </div>
                </div>

                {filteredWells.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredWells.map((well) => (
                            <div
                                key={well.id}
                                onClick={() => window.location.href = `/dashboard/operations/wells/${well.id}`}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{well.name || well.well_id}</h3>
                                        <p className="text-sm text-gray-600">{well.well_type}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${well.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        well.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                            well.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                                                'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {well.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center text-gray-600">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        {well.location || 'N/A'}
                                    </div>
                                    <div className="text-gray-600">
                                        Step: {well.current_step || 1} / 9
                                    </div>
                                    <div className="text-gray-600">
                                        Created by: {users.find(u => u.id === well.created_by)?.email || well.created_by?.slice(0, 8) || 'Unknown'}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Updated: {new Date(well.updated_at).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                        <p className="text-gray-500">No wells found matching your criteria</p>
                    </div>
                )}
            </div>
        </div>
    );
}
