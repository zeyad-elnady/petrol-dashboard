'use client';

import { useEffect, useState, FormEvent } from 'react';
import { db } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Filter, Mail, Phone, Shield, UserPlus, X } from 'lucide-react';

type User = {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string | null;
    role: string;
    status: string;
    created_at: string;
    last_login_at?: string | null;
};

export default function UsersPage() {
    const { isSuperAdmin } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [selectedUserForAssignment, setSelectedUserForAssignment] = useState<User | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            // Use API route to bypass RLS
            const response = await fetch('/api/users/list');
            const result = await response.json();
            if (result.data) {
                setUsers(result.data as User[]);
            }
        } catch (error) {
            console.error('Failed to load users:', error);
        }
        setLoading(false);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleBadge = (role: string) => {
        const config: Record<string, { bg: string; text: string; label: string }> = {
            super_admin: { bg: 'bg-red-100', text: 'text-red-700', label: 'Super Admin' },
            admin: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Admin' },
            hse_lead: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'HSE Lead' },
            ops: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Ops' },
            engineer: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Engineer' },
            manager: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Manager' },
            field_engineer: { bg: 'bg-green-100', text: 'text-green-700', label: 'Field Engineer' },
            hse_officer: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'HSE Officer' }
        };
        const c = config[role] || config.field_engineer;
        return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>{c.label}</span>;
    };

    const getStatusBadge = (status: string) => {
        const config: Record<string, { bg: string; text: string }> = {
            active: { bg: 'bg-green-100', text: 'text-green-700' },
            inactive: { bg: 'bg-gray-100', text: 'text-gray-700' },
            suspended: { bg: 'bg-red-100', text: 'text-red-700' }
        };
        const c = config[status] || config.active;
        return <span className={`px-2 py-1 rounded text-xs font-semibold ${c.bg} ${c.text} capitalize`}>{status}</span>;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
                    <p className="text-gray-600 mt-2">Manage system users and roles</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">Total: {filteredUsers.length}</span>
                    {isSuperAdmin() && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2"
                        >
                            <UserPlus className="w-5 h-5" />
                            Create User
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                        <option value="all">All Roles</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="hse_lead">HSE Lead</option>
                        <option value="ops">Ops</option>
                        <option value="engineer">Engineer</option>
                        <option value="manager">Manager</option>
                        <option value="field_engineer">Field Engineer</option>
                        <option value="hse_officer">HSE Officer</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredUsers.map((user) => (
                    <div
                        key={user.id}
                        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100"
                    >
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                        <Shield className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {user.first_name} {user.last_name}
                                        </h3>
                                        <div className="flex items-center space-x-2 mt-1">
                                            {getRoleBadge(user.role)}
                                            {getStatusBadge(user.status)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center text-gray-600">
                                    <Mail className="w-4 h-4 mr-2" />
                                    <a href={`mailto:${user.email}`} className="hover:text-blue-600">{user.email}</a>
                                </div>
                                {user.phone && (
                                    <div className="flex items-center text-gray-600">
                                        <Phone className="w-4 h-4 mr-2" />
                                        <a href={`tel:${user.phone}`} className="hover:text-blue-600">{user.phone}</a>
                                    </div>
                                )}
                                <div className="pt-3 border-t border-gray-100 space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Member Since:</span>
                                        <span className="font-semibold text-gray-900">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {user.last_login_at && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Last Login:</span>
                                            <span className="font-semibold text-gray-900">
                                                {new Date(user.last_login_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Reset Password Button - Only for Super Admin */}
                                {isSuperAdmin() && (
                                    <div className="pt-3 border-t border-gray-100">
                                        <button
                                            onClick={() => {
                                                setSelectedUserId(user.id);
                                                setShowResetPasswordModal(true);
                                            }}
                                            className="w-full px-3 py-2 bg-amber-50 text-amber-700 font-medium text-sm rounded-lg hover:bg-amber-100 transition-colors border border-amber-200"
                                        >
                                            🔑 Reset Password
                                        </button>
                                    </div>
                                )}

                                {/* Assignments Button - For HSE Lead, Ops, and Engineers */}
                                {(isSuperAdmin() || user.role === 'admin') && ['hse_lead', 'ops', 'engineer', 'field_engineer'].includes(user.role) && (
                                    <div className={isSuperAdmin() ? "pt-2" : "pt-3 border-t border-gray-100"}>
                                        <button
                                            onClick={() => {
                                                setSelectedUserForAssignment(user);
                                                setShowAssignmentModal(true);
                                            }}
                                            className="w-full px-3 py-2 bg-blue-50 text-blue-700 font-medium text-sm rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                                        >
                                            🗺️ Manage Assignments
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredUsers.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl shadow-md">
                    <p className="text-gray-600">No users found matching your criteria</p>
                </div>
            )}

            {/* Create User Modal */}
            {showCreateModal && (
                <CreateUserModal
                    onClose={() => setShowCreateModal(false)}
                    onUserCreated={() => {
                        loadUsers();
                        setShowCreateModal(false);
                    }}
                />
            )}

            {/* Reset Password Modal */}
            {showResetPasswordModal && selectedUserId && (
                <ResetPasswordModal
                    userId={selectedUserId}
                    onClose={() => {
                        setShowResetPasswordModal(false);
                        setSelectedUserId(null);
                    }}
                />
            )}

            {/* Assignment Modal */}
            {showAssignmentModal && selectedUserForAssignment && (
                <AssignmentModal
                    user={selectedUserForAssignment}
                    onClose={() => {
                        setShowAssignmentModal(false);
                        setSelectedUserForAssignment(null);
                    }}
                />
            )}
        </div>
    );
}

// Create User Modal Component
function CreateUserModal({ onClose, onUserCreated }: { onClose: () => void; onUserCreated: () => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState<'admin' | 'engineer' | 'hse_lead' | 'ops'>('engineer');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Use API route for user creation (requires service role key)
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    first_name: firstName,
                    last_name: lastName,
                    role,
                    phone: phone || undefined,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.error || 'Failed to create user');
            } else {
                onUserCreated();
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Create New User</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">First Name</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">Last Name</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">Phone (Optional)</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">Role</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setRole('engineer')}
                                className={`p-3 rounded-lg border-2 transition-all ${role === 'engineer'
                                    ? 'border-cyan-500 bg-cyan-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="text-left">
                                    <p className="font-semibold text-gray-900">Engineer</p>
                                    <p className="text-xs text-gray-500">Mobile app access only</p>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('admin')}
                                className={`p-3 rounded-lg border-2 transition-all ${role === 'admin'
                                    ? 'border-purple-500 bg-purple-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="text-left">
                                    <p className="font-semibold text-gray-900">Admin</p>
                                    <p className="text-xs text-gray-500">Full dashboard access</p>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('hse_lead')}
                                className={`p-3 rounded-lg border-2 transition-all ${role === 'hse_lead'
                                    ? 'border-amber-500 bg-amber-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="text-left">
                                    <p className="font-semibold text-gray-900">HSE Lead</p>
                                    <p className="text-xs text-gray-500">Hazards access</p>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('ops')}
                                className={`p-3 rounded-lg border-2 transition-all ${role === 'ops'
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="text-left">
                                    <p className="font-semibold text-gray-900">Ops</p>
                                    <p className="text-xs text-gray-500">Operations access</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Reset Password Modal Component
function ResetPasswordModal({ userId, onClose }: { userId: string; onClose: () => void }) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validate password length
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/users/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    newPassword,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.error || 'Failed to reset password');
            } else {
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                }, 1500);
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">🔑 Reset Password</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-600">✓ Password reset successfully!</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                            disabled={success}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none disabled:bg-gray-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                            disabled={success}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none disabled:bg-gray-100"
                        />
                    </div>

                    {!success && (
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-lg hover:from-amber-700 hover:to-orange-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

// Assignment Modal Component
function AssignmentModal({ user, onClose }: { user: User; onClose: () => void }) {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedUnit, setSelectedUnit] = useState('');

    // Well Hierarchy
    const WELL_HIERARCHY: Record<string, Record<string, Record<string, string[]>>> = {
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

    useEffect(() => {
        loadAssignments();
    }, [user.id]);

    const loadAssignments = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/user-assignments?userId=${user.id}`);
            const result = await response.json();
            if (result.data) {
                setAssignments(result.data);
            }
        } catch (error) {
            console.error('Failed to load assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAssignment = async () => {
        if (!selectedCountry) {
            alert('Please select a country');
            return;
        }

        try {
            setSaving(true);
            const response = await fetch('/api/user-assignments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    country: selectedCountry,
                    project: selectedProject || null,
                    unit: selectedUnit || null
                })
            });

            const result = await response.json();
            if (result.error) {
                if (result.error.includes('already exists')) {
                    alert('This assignment already exists for this user');
                } else {
                    alert('Failed to add assignment');
                }
            } else {
                setSelectedCountry('');
                setSelectedProject('');
                setSelectedUnit('');
                loadAssignments();
            }
        } catch (error) {
            console.error('Error adding assignment:', error);
            alert('Failed to add assignment');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAssignment = async (assignmentId: string) => {
        if (!confirm('Remove this assignment?')) return;

        try {
            const response = await fetch(`/api/user-assignments?id=${assignmentId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                loadAssignments();
            } else {
                alert('Failed to delete assignment');
            }
        } catch (error) {
            console.error('Error deleting assignment:', error);
            alert('Failed to delete assignment');
        }
    };

    const formatAssignment = (assignment: any) => {
        const parts = [];
        if (assignment.country) parts.push(assignment.country);
        if (assignment.project) parts.push(assignment.project);
        if (assignment.unit) parts.push(assignment.unit);
        return parts.join(' → ') || 'Invalid';
    };

    const getAvailableProjects = () => {
        if (!selectedCountry) return [];
        return Object.keys(WELL_HIERARCHY[selectedCountry] || {});
    };

    const getAvailableUnits = () => {
        if (!selectedCountry || !selectedProject) return [];
        return Object.keys(WELL_HIERARCHY[selectedCountry]?.[selectedProject] || {});
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">Location Assignments</h2>
                            <p className="text-blue-100 text-sm mt-1">
                                {user.first_name} {user.last_name} - {getRoleBadgeText(user.role)}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {/* Current Assignments */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Assignments</h3>
                        {loading ? (
                            <p className="text-gray-500 text-sm">Loading...</p>
                        ) : assignments.length === 0 ? (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                                <p className="text-gray-500 text-sm">No locations assigned yet</p>
                                <p className="text-gray-400 text-xs mt-1">Add assignments below to grant access</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {assignments.map((assignment) => (
                                    <div
                                        key={assignment.id}
                                        className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3"
                                    >
                                        <span className="text-green-800 font-medium">{formatAssignment(assignment)}</span>
                                        <button
                                            onClick={() => handleDeleteAssignment(assignment.id)}
                                            className="text-green-600 hover:text-green-900 hover:bg-green-100 rounded-full p-1 transition-colors"
                                            title="Remove assignment"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Add New Assignment */}
                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Assignment</h3>

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
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                >
                                    <option value="">All Units</option>
                                    {getAvailableUnits().map((unit) => (
                                        <option key={unit} value={unit}>{unit}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Info Box */}
                        {selectedCountry && (
                            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Will assign: </strong>
                                    {selectedCountry}
                                    {selectedProject && ` → ${selectedProject}`}
                                    {selectedUnit && ` → ${selectedUnit}`}
                                </p>
                                <p className="text-xs text-blue-600 mt-2">
                                    {!selectedProject && '✓ User will see all projects in this country'}
                                    {selectedProject && !selectedUnit && '✓ User will see all units in this project'}
                                    {selectedUnit && '✓ User will see only this specific unit'}
                                </p>
                            </div>
                        )}

                        <button
                            onClick={handleAddAssignment}
                            disabled={!selectedCountry || saving}
                            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            {saving ? 'Adding...' : '+ Add Assignment'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function getRoleBadgeText(role: string) {
    const labels: Record<string, string> = {
        hse_lead: 'HSE Lead',
        ops: 'Ops',
        engineer: 'Engineer',
        field_engineer: 'Field Engineer'
    };
    return labels[role] || role;
}

