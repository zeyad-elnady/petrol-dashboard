'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/api-client';
import {
    CheckSquare,
    Calendar,
    User,
    FileText,
    Image as ImageIcon,
    CheckCircle,
    XCircle
} from 'lucide-react';

type Checklist = {
    id: string;
    well_id: string;
    section_id: string;
    type: string;
    status: string;
    data: any;
    photos: any[];
    submitted_by: string;
    submitted_at: string;
};

export default function ChecklistsPage() {
    const [checklists, setChecklists] = useState<Checklist[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);

    useEffect(() => {
        loadChecklists();
    }, []);

    const loadChecklists = async () => {
        setLoading(true);
        try {
            // Fetch all checklists (in a real app, we'd paginate or filter)
            // For now, we'll fetch for the first active well or just all
            const { data: wells } = await db.getWells();
            if (wells && wells.length > 0) {
                const allChecklists = [];
                for (const well of wells) {
                    const { data } = await db.getChecklists(well.id);
                    if (data) allChecklists.push(...data);
                }
                setChecklists(allChecklists.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()));
            }
        } catch (error) {
            console.error('Error loading checklists:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Safety Checklists</h1>
                    <p className="text-gray-600">Review submitted operational checklists</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Checklist List */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <h2 className="font-semibold text-gray-900">Recent Submissions</h2>
                    </div>
                    <div className="overflow-y-auto max-h-[600px]">
                        {checklists.map((checklist) => (
                            <div
                                key={checklist.id}
                                onClick={() => setSelectedChecklist(checklist)}
                                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors
                  ${selectedChecklist?.id === checklist.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-medium text-gray-900">{checklist.type}</span>
                                    <span className={`px-2 py-0.5 text-xs rounded-full 
                    ${checklist.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {checklist.status}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-500 mb-2">
                                    Well ID: {checklist.well_id.substring(0, 8)}...
                                </div>
                                <div className="flex items-center text-xs text-gray-400">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {new Date(checklist.submitted_at).toLocaleDateString()}
                                    <User className="w-3 h-3 ml-3 mr-1" />
                                    Engineer
                                </div>
                            </div>
                        ))}
                        {checklists.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                No checklists found
                            </div>
                        )}
                    </div>
                </div>

                {/* Checklist Details */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {selectedChecklist ? (
                        <div className="h-full flex flex-col">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{selectedChecklist.type} Checklist</h2>
                                        <p className="text-gray-500 mt-1">Submitted on {new Date(selectedChecklist.submitted_at).toLocaleString()}</p>
                                    </div>
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                                        Download PDF
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1">
                                {/* Checklist Items */}
                                <div className="mb-8">
                                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                        <CheckSquare className="w-5 h-5 mr-2 text-blue-600" />
                                        Checklist Items
                                    </h3>
                                    <div className="space-y-3">
                                        {selectedChecklist.data?.items?.map((item: any, index: number) => (
                                            <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                                {item.checked ? (
                                                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                                ) : (
                                                    <XCircle className="w-5 h-5 text-red-500 mr-3" />
                                                )}
                                                <span className={item.checked ? 'text-gray-900' : 'text-gray-500'}>{item.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Photos */}
                                {selectedChecklist.photos && selectedChecklist.photos.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                            <ImageIcon className="w-5 h-5 mr-2 text-blue-600" />
                                            Evidence Photos
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {selectedChecklist.photos.map((photo: any, index: number) => (
                                                <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200">
                                                    <img
                                                        src={photo.url}
                                                        alt={photo.caption || 'Evidence'}
                                                        className="w-full h-48 object-cover"
                                                    />
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-white text-sm">
                                                        {photo.caption}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 p-12">
                            <FileText className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-lg">Select a checklist to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
