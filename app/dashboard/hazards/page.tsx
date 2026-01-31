'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Filter, Eye, MapPin, Image as ImageIcon } from 'lucide-react';

type Hazard = {
    id: string;
    subject: string;
    description: string;
    location: string;
    category: string;
    priority: string;
    status: string;
    before_photo_url?: string | null;
    after_photo_url?: string | null;
    reported_by_user?: { first_name: string; last_name: string };
    reported_at: string;
};

export default function HazardsPage() {
    const { user } = useAuth();
    const [hazards, setHazards] = useState<Hazard[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
    const [selectedHazard, setSelectedHazard] = useState<Hazard | null>(null);
    const [userAssignments, setUserAssignments] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            loadHazards();
        }
    }, [user]);

    const loadHazards = async () => {
        // Fetch user assignments if HSE Lead role
        if (user?.role === 'hse_lead') {
            const response = await fetch(`/api/user-assignments?userId=${user.id}`);
            const result = await response.json();
            setUserAssignments(result.data || []);
        }

        const { data } = await db.getHazards();
        if (data) {
            setHazards(data as Hazard[]);
        }
        setLoading(false);
    };

    const handleImageError = (hazardId: string) => {
        setBrokenImages(prev => new Set(prev).add(hazardId));
    };

    const isValidImageUrl = (url: string | null | undefined, hazardId: string) => {
        if (!url) return false;
        // Check if it's a local file URI (won't work in browser)
        if (url.startsWith('file://') || url.startsWith('content://')) return false;
        // Check if this image has failed to load before
        if (brokenImages.has(hazardId)) return false;
        return true;
    };

    const filteredHazards = hazards.filter(hazard => {
        const matchesSearch = hazard.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hazard.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hazard.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || hazard.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || hazard.priority === priorityFilter;

        // Apply location-based filtering for HSE Lead role
        let matchesLocation = true;
        if (user?.role === 'hse_lead') {
            if (userAssignments.length === 0) {
                matchesLocation = false; // No assignments = no access
            } else {
                matchesLocation = userAssignments.some(assignment => {
                    // Check if hazard location starts with assigned country
                    // This is a simple matching - you may need to adjust based on how locations are formatted
                    const hazardLocation = hazard.location.toLowerCase();
                    const assignedCountry = assignment.country?.toLowerCase();
                    const assignedProject = assignment.project?.toLowerCase();

                    if (assignedCountry && !hazardLocation.includes(assignedCountry)) return false;
                    if (assignedProject && !hazardLocation.includes(assignedProject)) return false;
                    return true;
                });
            }
        }

        return matchesSearch && matchesStatus && matchesPriority && matchesLocation;
    });

    const getStatusBadge = (status: string) => {
        const config: Record<string, { bg: string; text: string; label: string }> = {
            open: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Open' },
            in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'In Progress' },
            closed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Closed' },
            cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Cancelled' }
        };
        const c = config[status] || config.open;
        return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>{c.label}</span>;
    };

    const getPriorityBadge = (priority: string) => {
        const config: Record<string, { bg: string; text: string; label: string }> = {
            low: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Low' },
            medium: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Medium' },
            high: { bg: 'bg-red-100', text: 'text-red-700', label: 'High' }
        };
        const c = config[priority] || config.medium;
        return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>{c.label}</span>;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading hazards...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Hazard Management</h1>
                    <p className="text-gray-600 mt-2">Monitor and manage safety hazards</p>
                </div>
                <span className="text-sm text-gray-600">Total: {filteredHazards.length}</span>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search hazards..."
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
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="closed">Closed</option>
                    </select>
                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                        <option value="all">All Priority</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredHazards.map((hazard) => (
                    <div key={hazard.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100">
                        {isValidImageUrl(hazard.before_photo_url, hazard.id) ? (
                            <div className="h-48 bg-gray-200 relative overflow-hidden">
                                <img
                                    src={hazard.before_photo_url!}
                                    alt={hazard.subject}
                                    className="w-full h-full object-cover"
                                    onError={() => handleImageError(hazard.id)}
                                />
                                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-white text-xs flex items-center">
                                    <ImageIcon className="w-3 h-3 mr-1" />
                                    Before
                                </div>
                            </div>
                        ) : hazard.before_photo_url ? (
                            <div className="h-48 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                                <div className="text-center text-gray-500">
                                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">Photo uploaded from mobile</p>
                                    <p className="text-xs text-gray-400">(Not accessible from web)</p>
                                </div>
                            </div>
                        ) : null}
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="text-lg font-bold text-gray-900 flex-1">{hazard.subject}</h3>
                                <div className="flex flex-col gap-2 ml-3">
                                    {getPriorityBadge(hazard.priority)}
                                    {getStatusBadge(hazard.status)}
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{hazard.description}</p>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center text-gray-600">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    {hazard.location}
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Category:</span>
                                    <span className="font-semibold text-gray-900 capitalize">{hazard.category}</span>
                                </div>
                                {hazard.reported_by_user && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Reported By:</span>
                                        <span className="font-semibold text-gray-900">
                                            {hazard.reported_by_user.first_name} {hazard.reported_by_user.last_name}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Reported:</span>
                                    <span className="font-semibold text-gray-900">
                                        {new Date(hazard.reported_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => setSelectedHazard(hazard)}
                                    className="w-full py-2 px-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
                                >
                                    <Eye className="w-4 h-4" />
                                    <span>View Details</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredHazards.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl shadow-md">
                    <p className="text-gray-600">No hazards found matching your criteria</p>
                </div>
            )}

            {/* Hazard Details Modal */}
            {selectedHazard && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedHazard(null)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 text-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">{selectedHazard.subject}</h2>
                                    <div className="flex gap-2">
                                        {getPriorityBadge(selectedHazard.priority)}
                                        {getStatusBadge(selectedHazard.status)}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedHazard(null)}
                                    className="text-white hover:bg-white/20 rounded-full p-2 transition"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Photos */}
                            {(selectedHazard.before_photo_url || selectedHazard.after_photo_url) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {isValidImageUrl(selectedHazard.before_photo_url, selectedHazard.id) ? (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Before Photo</h3>
                                            <img
                                                src={selectedHazard.before_photo_url!}
                                                alt="Before"
                                                className="w-full h-64 object-cover rounded-lg"
                                                onError={() => handleImageError(selectedHazard.id)}
                                            />
                                        </div>
                                    ) : selectedHazard.before_photo_url ? (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Before Photo</h3>
                                            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <div className="text-center text-gray-500">
                                                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                                    <p className="text-sm">Photo from mobile</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}

                                    {isValidImageUrl(selectedHazard.after_photo_url, selectedHazard.id) ? (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 mb-2">After Photo</h3>
                                            <img
                                                src={selectedHazard.after_photo_url!}
                                                alt="After"
                                                className="w-full h-64 object-cover rounded-lg"
                                                onError={() => handleImageError(selectedHazard.id)}
                                            />
                                        </div>
                                    ) : selectedHazard.after_photo_url ? (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 mb-2">After Photo</h3>
                                            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <div className="text-center text-gray-500">
                                                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                                    <p className="text-sm">Photo from mobile</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            )}

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Description</h3>
                                    <p className="text-gray-900">{selectedHazard.description}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Location</h3>
                                    <div className="flex items-center text-gray-900">
                                        <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                                        {selectedHazard.location}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Category</h3>
                                    <p className="text-gray-900 capitalize">{selectedHazard.category}</p>
                                </div>

                                {selectedHazard.reported_by_user && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-700 mb-1">Reported By</h3>
                                        <p className="text-gray-900">
                                            {selectedHazard.reported_by_user.first_name} {selectedHazard.reported_by_user.last_name}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Reported Date</h3>
                                    <p className="text-gray-900">{new Date(selectedHazard.reported_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 p-6 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedHazard(null)}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
