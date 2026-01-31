'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Well Hierarchy - same as mobile app
const WELL_HIERARCHY = {
    Oman: {
        Marmu: {
            Rigs: ['Rig 148', 'Rig 149', 'Rig 150', 'Rig 151'],
            HFBU: ['HFBU 1', 'HFBU 2', 'HFBU 3'],
            Rigless: ['Rigless 1', 'Rigless 2']
        },
        'Qarn Alam': {
            Rigs: ['Rig 152', 'Rig 153'],
            HFBU: ['HFBU 4', 'HFBU 5'],
        }
    },
    Saudi: {
        'Project A': {
            Rigs: ['Rig 201', 'Rig 202'],
            HFBU: ['HFBU 10']
        }
    },
    Mexico: {
        'Project B': {
            Rigs: ['Rig 301'],
        }
    },
    UAE: {
        'Project C': {
            Rigs: ['Rig 401', 'Rig 402'],
        }
    }
};

interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
}

interface LocationAssignment {
    id: string;
    user_id: string;
    country: string | null;
    project: string | null;
    unit: string | null;
    created_at: string;
}

export default function UserAssignmentsPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [assignments, setAssignments] = useState<LocationAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Form state for new assignment
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedUnit, setSelectedUnit] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            // Fetch engineers and field engineers
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('*')
                .in('role', ['engineer', 'field_engineer'])
                .order('first_name');

            if (usersError) throw usersError;

            // Fetch all assignments
            const { data: assignmentsData, error: assignmentsError } = await supabase
                .from('user_location_assignments')
                .select('*');

            if (assignmentsError) throw assignmentsError;

            setUsers(usersData || []);
            setAssignments(assignmentsData || []);
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const getUserAssignments = (userId: string) => {
        return assignments.filter(a => a.user_id === userId);
    };

    const handleAssignLocation = async () => {
        if (!selectedUser || !selectedCountry) {
            alert('Please select a country');
            return;
        }

        try {
            setSaving(true);
            const { error } = await supabase
                .from('user_location_assignments')
                .insert({
                    user_id: selectedUser.id,
                    country: selectedCountry,
                    project: selectedProject || null,
                    unit: selectedUnit || null
                });

            if (error) throw error;

            alert('✅ Assignment added successfully!');
            setShowModal(false);
            setSelectedCountry('');
            setSelectedProject('');
            setSelectedUnit('');
            loadData();
        } catch (error: any) {
            console.error('Error adding assignment:', error);
            if (error.code === '23505') {
                alert('This assignment already exists for this user');
            } else {
                alert('Failed to add assignment');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAssignment = async (assignmentId: string) => {
        if (!confirm('Are you sure you want to remove this assignment?')) return;

        try {
            const { error } = await supabase
                .from('user_location_assignments')
                .delete()
                .eq('id', assignmentId);

            if (error) throw error;

            alert('✅ Assignment removed');
            loadData();
        } catch (error) {
            console.error('Error deleting assignment:', error);
            alert('Failed to delete assignment');
        }
    };

    const formatAssignment = (assignment: LocationAssignment) => {
        const parts = [];
        if (assignment.country) parts.push(assignment.country);
        if (assignment.project) parts.push(assignment.project);
        if (assignment.unit) parts.push(assignment.unit);
        return parts.join(' → ') || 'Invalid';
    };

    const getAvailableProjects = () => {
        if (!selectedCountry) return [];
        return Object.keys((WELL_HIERARCHY as any)[selectedCountry] || {});
    };

    const getAvailableUnits = () => {
        if (!selectedCountry || !selectedProject) return [];
        return Object.keys((WELL_HIERARCHY as any)[selectedCountry]?.[selectedProject] || {});
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">User Location Assignments</h1>
                    <p className="mt-2 text-gray-600">
                        Manage which engineers can access which countries, projects, and units
                    </p>
                </div>

                {/* Users List */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Engineer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Assigned Locations
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => {
                                    const userAssignments = getUserAssignments(user.id);
                                    return (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.first_name} {user.last_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {userAssignments.length === 0 ? (
                                                    <span className="text-sm text-gray-400 italic">No locations assigned</span>
                                                ) : (
                                                    <div className="flex flex-wrap gap-2">
                                                        {userAssignments.map((assignment) => (
                                                            <div
                                                                key={assignment.id}
                                                                className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                                                            >
                                                                <span>{formatAssignment(assignment)}</span>
                                                                <button
                                                                    onClick={() => handleDeleteAssignment(assignment.id)}
                                                                    className="text-green-600 hover:text-green-900"
                                                                    title="Remove assignment"
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setShowModal(true);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-900 font-medium"
                                                >
                                                    + Add Assignment
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {users.length === 0 && (
                    <p className="text-center text-gray-500 mt-8">No engineers or field engineers found</p>
                )}
            </div>

            {/* Assignment Modal */}
            {showModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Assign Location
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Adding location for <strong>{selectedUser.first_name} {selectedUser.last_name}</strong>
                        </p>

                        {/* Country Selection */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Country *
                            </label>
                            <select
                                value={selectedCountry}
                                onChange={(e) => {
                                    setSelectedCountry(e.target.value);
                                    setSelectedProject('');
                                    setSelectedUnit('');
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Country</option>
                                {Object.keys(WELL_HIERARCHY).map((country) => (
                                    <option key={country} value={country}>{country}</option>
                                ))}
                            </select>
                        </div>

                        {/* Project Selection */}
                        {selectedCountry && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Project (Optional - Leave empty for all projects)
                                </label>
                                <select
                                    value={selectedProject}
                                    onChange={(e) => {
                                        setSelectedProject(e.target.value);
                                        setSelectedUnit('');
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Projects</option>
                                    {getAvailableProjects().map((project) => (
                                        <option key={project} value={project}>{project}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Unit Selection */}
                        {selectedCountry && selectedProject && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Unit (Optional - Leave empty for all units)
                                </label>
                                <select
                                    value={selectedUnit}
                                    onChange={(e) => setSelectedUnit(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Units</option>
                                    {getAvailableUnits().map((unit) => (
                                        <option key={unit} value={unit}>{unit}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Info Box */}
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                            <p className="text-sm text-blue-800">
                                <strong>Assignment: </strong>
                                {selectedCountry ? (
                                    <>
                                        {selectedCountry}
                                        {selectedProject && ` → ${selectedProject}`}
                                        {selectedUnit && ` → ${selectedUnit}`}
                                    </>
                                ) : (
                                    'Select a country to start'
                                )}
                            </p>
                            <p className="text-xs text-blue-600 mt-2">
                                {!selectedProject && selectedCountry && '✓ User will see all projects in this country'}
                                {selectedProject && !selectedUnit && '✓ User will see all units in this project'}
                                {selectedUnit && '✓ User will see only this specific unit'}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedCountry('');
                                    setSelectedProject('');
                                    setSelectedUnit('');
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssignLocation}
                                disabled={!selectedCountry || saving}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Saving...' : 'Add Assignment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
