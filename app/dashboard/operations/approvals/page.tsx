'use client';

import { useEffect, useState } from 'react';

interface Well {
    id: string;
    well_id: string;
    well_name: string;
    name?: string;
    well_type: string;
    location: string;
    field?: string;
    hole_size?: string;
    casing_size?: string;
    artificial_lift?: string;
    status: string;
    submitted_at: string;
    current_step?: number;
    checklist_data: any;
}

export default function ApprovalsPage() {
    const [pendingWells, setPendingWells] = useState<Well[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedWell, setSelectedWell] = useState<Well | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [expandedWells, setExpandedWells] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadPendingWells();
    }, []);

    const loadPendingWells = async () => {
        try {
            const response = await fetch('/api/wells/pending-approval');
            const result = await response.json();
            if (result.data) {
                setPendingWells(result.data);
            }
        } catch (error) {
            console.error('Failed to load pending wells:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (wellId: string) => {
        if (!confirm('Are you sure you want to approve this well?')) return;

        try {
            console.log('Approving well:', wellId);
            const response = await fetch(`/api/wells/${wellId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approvedBy: 'current-user-id' }),
            });

            const result = await response.json();
            console.log('Approve response:', result);

            if (response.ok) {
                alert('Well approved successfully!');
                loadPendingWells(); // Reload the list
            } else {
                console.error('Approve failed:', result);
                alert(`Failed to approve well: ${result.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Failed to approve well:', error);
            alert(`Error: ${error}`);
        }
    };

    const handleReject = async () => {
        if (!selectedWell || !rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        try {
            const response = await fetch(`/api/wells/${selectedWell.id}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reason: rejectionReason,
                    rejectedBy: 'current-user-id' // Replace with actual user ID
                }),
            });

            if (response.ok) {
                alert('Well rejected');
                setShowRejectModal(false);
                setRejectionReason('');
                setSelectedWell(null);
                loadPendingWells();
            }
        } catch (error) {
            console.error('Failed to reject well:', error);
            alert('Failed to reject well');
        }
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Wells for Review</h1>

            {pendingWells.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <p className="text-gray-600">No wells to review</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {pendingWells.map((well) => {
                        const isExpanded = expandedWells.has(well.id);
                        return (
                            <div key={well.id} className="bg-white rounded-lg shadow-md border border-gray-200">
                                {/* Compact Header - Always Visible */}
                                <div className="p-4 flex justify-between items-center">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-xl font-bold text-gray-900">{well.well_id}</h2>
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                {well.status}
                                            </span>
                                        </div>
                                        <div className="flex gap-6 mt-2 text-sm text-gray-600">
                                            <span>📍 {well.location || 'N/A'}</span>
                                            <span>🏭 {well.field || 'N/A'}</span>
                                            <span>📅 {new Date(well.submitted_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                const newExpanded = new Set(expandedWells);
                                                if (isExpanded) {
                                                    newExpanded.delete(well.id);
                                                } else {
                                                    newExpanded.add(well.id);
                                                }
                                                setExpandedWells(newExpanded);
                                            }}
                                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition text-sm"
                                        >
                                            {isExpanded ? '▲ Hide Details' : '▼ View Details'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedWell(well);
                                                handleApprove(well.id);
                                            }}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition text-sm"
                                        >
                                            ✓ Approve
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedWell(well);
                                                setShowRejectModal(true);
                                            }}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition text-sm"
                                        >
                                            ✗ Reject
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Details - Conditionally Visible */}
                                {isExpanded && (
                                    <div className="border-t border-gray-200 p-6">
                                        {/* Well Details Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6 bg-gray-50 p-4 rounded-lg">
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Well Type</p>
                                                <p className="font-semibold text-gray-900">{well.well_type || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Hole Size</p>
                                                <p className="font-semibold text-gray-900">{well.hole_size || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Casing Size</p>
                                                <p className="font-semibold text-gray-900">{well.casing_size || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Artificial Lift</p>
                                                <p className="font-semibold text-gray-900">{well.artificial_lift || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Submitted At</p>
                                                <p className="font-semibold text-gray-900">
                                                    {new Date(well.submitted_at).toLocaleString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Current Step</p>
                                                <p className="font-semibold text-gray-900">{well.current_step} / 9</p>
                                            </div>
                                        </div>

                                        {/* Checklist Details */}
                                        {well.checklist_data && (
                                            <div className="mb-6">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h3 className="text-lg font-semibold text-gray-900">Pre-Spud Checklist</h3>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-green-500 h-2 rounded-full"
                                                                style={{ width: `${(well.checklist_data.filter((i: any) => i.checked).length / well.checklist_data.length) * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-semibold">
                                                            {well.checklist_data.filter((i: any) => i.checked).length}/{well.checklist_data.length}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                                                    <div className="space-y-3">
                                                        {well.checklist_data.map((item: any, index: number) => (
                                                            <div key={item.id} className="bg-white rounded-lg p-3 border border-gray-200">
                                                                <div className="flex items-start gap-3">
                                                                    <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${item.checked ? 'bg-green-500' : 'bg-gray-300'
                                                                        }`}>
                                                                        {item.checked && (
                                                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0z" clipRule="evenodd" />
                                                                            </svg>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <span className={`text-sm font-medium block mb-2 ${item.checked ? 'text-gray-900' : 'text-gray-500'}`}>
                                                                            {item.label}
                                                                        </span>

                                                                        {/* Notes */}
                                                                        {item.notes && item.notes.trim() && (
                                                                            <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-100">
                                                                                <p className="text-xs font-semibold text-blue-900 mb-1">Note:</p>
                                                                                <p className="text-sm text-blue-800">{item.notes}</p>
                                                                            </div>
                                                                        )}

                                                                        {/* Photos */}
                                                                        {item.photos && item.photos.length > 0 && (
                                                                            <div className="mt-2">
                                                                                <p className="text-xs font-semibold text-gray-700 mb-2">
                                                                                    Photos ({item.photos.length}):
                                                                                </p>
                                                                                <div className="flex flex-wrap gap-2">
                                                                                    {item.photos.map((photo: any, photoIndex: number) => {
                                                                                        const photoUrl = typeof photo === 'string' ? photo : (photo.uri || photo.url);
                                                                                        const isLocal = photoUrl && (photoUrl.startsWith('file:') || photoUrl.startsWith('/'));

                                                                                        if (isLocal) {
                                                                                            return (
                                                                                                <div key={photoIndex} className="relative group w-20 h-20 bg-yellow-50 border border-yellow-200 rounded flex flex-col items-center justify-center p-1 text-center">
                                                                                                    <span className="text-[10px] text-yellow-600 font-semibold leading-tight">Not Uploaded</span>
                                                                                                    <span className="text-[9px] text-yellow-500 mt-0.5 break-all opacity-70">Local File</span>
                                                                                                </div>
                                                                                            );
                                                                                        }

                                                                                        return (
                                                                                            <div key={photoIndex} className="relative group">
                                                                                                <img
                                                                                                    src={photoUrl}
                                                                                                    alt={`Photo ${photoIndex + 1}`}
                                                                                                    className="w-20 h-20 object-cover rounded border border-gray-300 hover:border-blue-500 transition-colors cursor-pointer"
                                                                                                    onError={(e) => {
                                                                                                        console.error('Failed to load photo:', photoUrl);
                                                                                                        e.currentTarget.style.display = 'none';
                                                                                                        const errorDiv = document.createElement('div');
                                                                                                        errorDiv.className = 'w-20 h-20 bg-red-100 border border-red-300 rounded flex items-center justify-center text-xs text-red-600 p-1 text-center';
                                                                                                        errorDiv.textContent = 'Failed';
                                                                                                        e.currentTarget.parentNode?.appendChild(errorDiv);
                                                                                                    }}
                                                                                                    onClick={() => setSelectedPhoto(photoUrl)}
                                                                                                />
                                                                                            </div>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {/* Voice Notes */}
                                                                        {item.voiceNotes && item.voiceNotes.length > 0 && (
                                                                            <div className="mt-2">
                                                                                <p className="text-xs font-semibold text-gray-700 mb-1">
                                                                                    Voice Notes ({item.voiceNotes.length}):
                                                                                </p>
                                                                                <div className="space-y-1">
                                                                                    {item.voiceNotes.map((note: any, noteIndex: number) => {
                                                                                        const noteUrl = typeof note === 'string' ? note : (note.uri || note.url);
                                                                                        return (
                                                                                            <div key={noteIndex}>
                                                                                                <audio
                                                                                                    controls
                                                                                                    className="w-full h-8"
                                                                                                    src={noteUrl}
                                                                                                />
                                                                                                {/* Debug link since audio tag hides errors */}
                                                                                                <a href={noteUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 hover:underline block mt-0.5 ml-1">
                                                                                                    Open Audio
                                                                                                </a>
                                                                                            </div>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}


            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4 text-black">Reject Well</h3>
                        <p className="text-black mb-4">
                            Please provide a reason for rejection:
                        </p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 text-black focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            rows={4}
                            placeholder="Enter rejection reason..."
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectionReason('');
                                    setSelectedWell(null);
                                }}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
                            >
                                Confirm Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Photo Modal */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <div className="relative max-w-7xl max-h-full">
                        <button
                            onClick={() => setSelectedPhoto(null)}
                            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition z-10"
                        >
                            ✕
                        </button>
                        <img
                            src={selectedPhoto}
                            alt="Full size"
                            className="max-w-full max-h-screen object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div >
    );
}
