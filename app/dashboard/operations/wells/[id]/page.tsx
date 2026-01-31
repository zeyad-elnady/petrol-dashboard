'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { ArrowLeft, Calendar, CheckCircle, Clock, MapPin, User } from 'lucide-react';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function WellDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [well, setWell] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWell();
    }, [params.id]);

    const loadWell = async () => {
        try {
            const { data, error } = await supabase
                .from('wells')
                .select('*')
                .eq('id', params.id)
                .single();

            if (error) throw error;
            setWell(data);
        } catch (error) {
            console.error('Error loading well:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading well details...</p>
                </div>
            </div>
        );
    }

    if (!well) {
        return (
            <div className="p-8">
                <p className="text-gray-600">Well not found</p>
            </div>
        );
    }

    // Parse checklist data - handle both array and object formats
    const renderChecklistData = () => {
        const checklist = well.checklist_data;

        if (!checklist) {
            return <p className="text-gray-600">No checklist data available</p>;
        }

        // If it's an array (old format), convert to readable format
        if (Array.isArray(checklist)) {
            return (
                <div className="space-y-4">
                    {checklist.map((item: any, idx: number) => (
                        <div key={idx} className="border-l-4 border-blue-500 bg-blue-50 pl-4 py-3 rounded">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">
                                        {typeof item === 'string' ? item : (item.label || item.text || item.description || `Checklist Item ${idx + 1}`)}
                                    </p>
                                    {typeof item === 'object' && item.notes && (
                                        <p className="text-sm text-gray-600 mt-1">📝 Note: {item.notes}</p>
                                    )}

                                    {/* Photos */}
                                    {typeof item === 'object' && item.photos && item.photos.length > 0 && (
                                        <div className="mt-3">
                                            <p className="text-xs font-semibold text-gray-700 mb-2">📷 Photos ({item.photos.length})</p>
                                            <div className="grid grid-cols-3 gap-2">
                                                {item.photos.map((photo: any, photoIdx: number) => {
                                                    const photoUrl = typeof photo === 'string' ? photo : (photo.url || photo.uri);
                                                    return (
                                                        <a
                                                            key={photoIdx}
                                                            href={photoUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="block"
                                                        >
                                                            <img
                                                                src={photoUrl}
                                                                alt={`Photo ${photoIdx + 1}`}
                                                                className="w-full h-24 object-cover rounded border border-gray-300 hover:opacity-80 transition cursor-pointer"
                                                            />
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Voice Recordings */}
                                    {typeof item === 'object' && item.voiceNotes && item.voiceNotes.length > 0 && (
                                        <div className="mt-3">
                                            <p className="text-xs font-semibold text-gray-700 mb-2">🎤 Voice Notes ({item.voiceNotes.length})</p>
                                            <div className="space-y-2">
                                                {item.voiceNotes.map((voice: any, voiceIdx: number) => {
                                                    const voiceUrl = typeof voice === 'string' ? voice : (voice.url || voice.uri);
                                                    return (
                                                        <audio
                                                            key={voiceIdx}
                                                            controls
                                                            className="w-full"
                                                            src={voiceUrl}
                                                        >
                                                            Your browser does not support the audio element.
                                                        </audio>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {typeof item === 'object' && (
                                    <span className={`ml-4 px-3 py-1 rounded-full text-xs font-semibold ${item.checked ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {item.checked ? '✓ Completed' : 'Pending'}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        // If it's an object with steps (new format)
        if (typeof checklist === 'object') {
            return (
                <div className="space-y-6">
                    {Object.entries(checklist).map(([stepKey, stepData]: [string, any]) => {
                        if (!stepData || typeof stepData !== 'object') return null;

                        const title = stepData.title || `Step ${stepKey}`;
                        const items = Array.isArray(stepData) ? stepData : (stepData.items || []);

                        return (
                            <div key={stepKey} className="mb-6 last:mb-0">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                                    {title}
                                </h3>

                                {items.length > 0 ? (
                                    <div className="space-y-2 ml-7">
                                        {items.map((item: any, idx: number) => (
                                            <div key={idx} className="border-l-2 border-gray-200 pl-4 py-2">
                                                <div className="flex items-start justify-between">
                                                    <p className="font-medium text-gray-700">
                                                        {typeof item === 'string' ? item : (item.text || `Item ${idx + 1}`)}
                                                    </p>
                                                    {typeof item === 'object' && (
                                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${item.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                            }`}>
                                                            {item.completed ? '✓ Done' : 'Pending'}
                                                        </span>
                                                    )}
                                                </div>
                                                {typeof item === 'object' && item.note && (
                                                    <p className="text-sm text-gray-600 mt-1">Note: {item.note}</p>
                                                )}

                                                {/* Photos */}
                                                {typeof item === 'object' && item.photos && item.photos.length > 0 && (
                                                    <div className="mt-3">
                                                        <p className="text-xs font-semibold text-gray-700 mb-2">📷 Photos ({item.photos.length})</p>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {item.photos.map((photo: any, photoIdx: number) => {
                                                                const photoUrl = typeof photo === 'string' ? photo : (photo.url || photo.uri);
                                                                return (
                                                                    <a
                                                                        key={photoIdx}
                                                                        href={photoUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="block"
                                                                    >
                                                                        <img
                                                                            src={photoUrl}
                                                                            alt={`Photo ${photoIdx + 1}`}
                                                                            className="w-full h-24 object-cover rounded border border-gray-300 hover:opacity-80 transition cursor-pointer"
                                                                        />
                                                                    </a>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Voice Recordings */}
                                                {typeof item === 'object' && item.voiceNotes && item.voiceNotes.length > 0 && (
                                                    <div className="mt-3">
                                                        <p className="text-xs font-semibold text-gray-700 mb-2">🎤 Voice Notes ({item.voiceNotes.length})</p>
                                                        <div className="space-y-2">
                                                            {item.voiceNotes.map((voice: any, voiceIdx: number) => {
                                                                const voiceUrl = typeof voice === 'string' ? voice : (voice.url || voice.uri);
                                                                return (
                                                                    <audio
                                                                        key={voiceIdx}
                                                                        controls
                                                                        className="w-full"
                                                                        src={voiceUrl}
                                                                    >
                                                                        Your browser does not support the audio element.
                                                                    </audio>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 ml-7">No items in this step</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            );
        }

        return <p className="text-gray-600">Invalid checklist format</p>;
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Operations
                </button>

                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{well.name || well.well_id}</h1>
                        <p className="text-gray-600 mt-1">{well.location || 'No location'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`px-4 py-2 rounded-lg font-semibold ${well.status === 'approved' ? 'bg-green-100 text-green-700' :
                            well.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                well.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                                    'bg-yellow-100 text-yellow-700'
                            }`}>
                            {well.status?.toUpperCase() || 'IN PROGRESS'}
                        </span>
                        <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold">
                            Step {well.current_step || 2}/9
                        </span>
                    </div>
                </div>
            </div>

            {/* Spud Date (if exists) */}
            {well.spud_date && (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 p-6 rounded-lg mb-6">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-blue-600" />
                        <div>
                            <p className="text-sm font-medium text-blue-900">Spud Date</p>
                            <p className="text-lg font-bold text-blue-700">
                                {new Date(well.spud_date).toLocaleString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
                    <dl className="space-y-3">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Well ID</dt>
                            <dd className="text-base text-gray-900">{well.well_id || 'N/A'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Field</dt>
                            <dd className="text-base text-gray-900">{well.field || 'N/A'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Rig Name</dt>
                            <dd className="text-base text-gray-900">{well.rig_name || 'N/A'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Rig ID</dt>
                            <dd className="text-base text-gray-900">{well.rig_id || 'N/A'}</dd>
                        </div>
                    </dl>
                </div>

                {/* Technical Details */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Technical Details</h2>
                    <dl className="space-y-3">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Well Type</dt>
                            <dd className="text-base text-gray-900">{well.well_type || 'N/A'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Well Shape</dt>
                            <dd className="text-base text-gray-900">{well.well_shape || 'N/A'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Hole Size</dt>
                            <dd className="text-base text-gray-900">{well.hole_size || 'N/A'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Casing Size</dt>
                            <dd className="text-base text-gray-900">{well.casing_size || 'N/A'}</dd>
                        </div>
                    </dl>
                </div>
            </div>

            {/* Pre-Spud Checklist */}
            {well.checklist_data && (
                <div className="mt-6 bg-white rounded-lg shadow-md border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Pre-Spud Checklist</h2>
                    {renderChecklistData()}
                </div>
            )}

            {/* Drilling Sections Data */}
            {well.metadata?.sections_data && well.metadata.sections_data.length > 0 && (
                <div className="mt-6 space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900">Drilling Operations</h2>
                    {well.metadata.sections_data.map((section: any, idx: number) => {
                        // Skip empty sections
                        if (!section || Object.keys(section).length === 0) return null;

                        return (
                            <div key={idx} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                                <h3 className="text-xl font-bold text-blue-800 mb-4 border-b pb-2">
                                    Section {idx + 1}
                                </h3>

                                <div className="space-y-6">
                                    {/* BHA Photos */}
                                    {(section.bhaPhoto || section.bitPhoto) && (
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">1. BHA & Bit Photos</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {[
                                                    { label: 'BHA', url: section.bhaPhoto },
                                                    { label: 'Bit', url: section.bitPhoto },
                                                    { label: 'Stabilizer', url: section.stabilizerPhoto },
                                                    { label: 'Motor', url: section.motorPhoto },
                                                    { label: 'MWD', url: section.mwdPhoto },
                                                ].map((photo, pIdx) => (
                                                    photo.url && (
                                                        <div key={pIdx}>
                                                            <p className="text-xs font-semibold text-gray-600 mb-1">{photo.label}</p>
                                                            <a href={photo.url} target="_blank" rel="noopener noreferrer">
                                                                <img src={photo.url} className="w-full h-32 object-cover rounded border border-gray-200 hover:opacity-80 transition" alt={photo.label} />
                                                            </a>
                                                        </div>
                                                    )
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* TD Data */}
                                    {section.tdValue && (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">2. Total Depth (TD)</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">TD Value</p>
                                                    <p className="font-bold text-lg">{section.tdValue}</p>
                                                    {section.tdApprovalEmail && (
                                                        <p className="text-sm text-gray-600 mt-1">Approval Email: {section.tdApprovalEmail}</p>
                                                    )}
                                                </div>
                                                {section.directionalSurvey && (
                                                    <div>
                                                        <p className="text-sm text-gray-500 mb-1">Directional Survey</p>
                                                        <a href={section.directionalSurvey} target="_blank" rel="noopener noreferrer">
                                                            <img src={section.directionalSurvey} className="h-20 w-auto rounded border" alt="Survey" />
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Casing */}
                                    {section.casingTally && (
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">3. Casing</h4>
                                            <div className="flex items-start gap-4">
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-600 mb-1">Casing Tally</p>
                                                    <a href={section.casingTally} target="_blank" rel="noopener noreferrer">
                                                        <img src={section.casingTally} className="h-32 w-auto rounded border" alt="Casing Tally" />
                                                    </a>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-semibold text-gray-600 mb-2">Checklist</p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        {[
                                                            'Casing on rack', 'Drifted', 'Thread cleaned', 'Centralizers ready'
                                                        ].map((item, cIdx) => (
                                                            <div key={cIdx} className="flex items-center gap-2">
                                                                <span className={section.casingChecklist?.[cIdx] ? 'text-green-500' : 'text-gray-300'}>
                                                                    {section.casingChecklist?.[cIdx] ? '✅' : '⬜'}
                                                                </span>
                                                                <span className="text-sm text-gray-700">{item}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Cementing & BOP Summaries */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">4. Cementing</h4>
                                            <div className="space-y-1">
                                                {['Lines pressure tested', 'Cement volume confirmed', 'Samples collected', 'Top of cement verified'].map((item, cIdx) => (
                                                    <div key={cIdx} className="flex items-center gap-2">
                                                        <span className={section.cementingChecklist?.[cIdx] ? 'text-green-500' : 'text-gray-300'}>
                                                            {section.cementingChecklist?.[cIdx] ? '✅' : '⬜'}
                                                        </span>
                                                        <span className="text-sm text-gray-700">{item}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">5. Wellhead & BOP</h4>
                                            <div className="space-y-1">
                                                {['Wellhead installed', 'BOP stack assembled', 'Pressure tested', 'Systems checked'].map((item, cIdx) => (
                                                    <div key={cIdx} className="flex items-center gap-2">
                                                        <span className={section.wellheadBopChecklist?.[cIdx] ? 'text-green-500' : 'text-gray-300'}>
                                                            {section.wellheadBopChecklist?.[cIdx] ? '✅' : '⬜'}
                                                        </span>
                                                        <span className="text-sm text-gray-700">{item}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Timeline */}
            <div className="mt-6 bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Timeline</h2>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-sm font-medium text-gray-500">Created</p>
                            <p className="text-base text-gray-900">
                                {new Date(well.created_at).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    {well.submitted_at && (
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-blue-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Submitted</p>
                                <p className="text-base text-gray-900">
                                    {new Date(well.submitted_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    )}
                    {well.approved_at && (
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Approved</p>
                                <p className="text-base text-gray-900">
                                    {new Date(well.approved_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
