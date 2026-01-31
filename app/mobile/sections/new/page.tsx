'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ArrowDown, Layers, CheckCircle } from 'lucide-react';

export default function NewSectionPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        well: 'Well Alpha-7',
        sectionName: '12 1/4" Intermediate',
        startDepth: '500',
        endDepth: '2500',
        casingSize: '9 5/8"',
        cementingStatus: 'completed',
        comments: ''
    });

    const handleSubmit = async () => {
        // Mock submission
        await new Promise(resolve => setTimeout(resolve, 1000));
        router.push('/mobile');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b flex items-center justify-between sticky top-0 z-10">
                <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-500">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="font-semibold text-lg">Complete Section</h1>
                <div className="w-10" />
            </div>

            <div className="flex-1 p-4 space-y-6">
                {/* Well Info */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-blue-600 font-medium uppercase">Current Well</p>
                        <p className="font-bold text-gray-900">{formData.well}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <Layers className="w-5 h-5" />
                    </div>
                </div>

                {/* Section Details */}
                <section className="bg-white p-4 rounded-xl shadow-sm space-y-4">
                    <h2 className="font-medium text-gray-900">Section Details</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Section Name</label>
                        <select
                            className="w-full p-3 bg-white border border-gray-300 rounded-xl"
                            value={formData.sectionName}
                            onChange={e => setFormData({ ...formData, sectionName: e.target.value })}
                        >
                            <option>26" Surface</option>
                            <option>17 1/2" Intermediate</option>
                            <option>12 1/4" Intermediate</option>
                            <option>8 1/2" Production</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Depth (m)</label>
                            <input
                                type="number"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                                value={formData.startDepth}
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Depth (m)</label>
                            <input
                                type="number"
                                className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.endDepth}
                                onChange={e => setFormData({ ...formData, endDepth: e.target.value })}
                            />
                        </div>
                    </div>
                </section>

                {/* Casing & Cementing */}
                <section className="bg-white p-4 rounded-xl shadow-sm space-y-4">
                    <h2 className="font-medium text-gray-900">Casing & Cementing</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Casing Size</label>
                        <select
                            className="w-full p-3 bg-white border border-gray-300 rounded-xl"
                            value={formData.casingSize}
                            onChange={e => setFormData({ ...formData, casingSize: e.target.value })}
                        >
                            <option>20"</option>
                            <option>13 3/8"</option>
                            <option>9 5/8"</option>
                            <option>7"</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cementing Status</label>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setFormData({ ...formData, cementingStatus: 'completed' })}
                                className={`flex-1 py-3 rounded-xl font-medium border transition-all flex items-center justify-center
                  ${formData.cementingStatus === 'completed'
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-gray-200 bg-white text-gray-500'}`}
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Completed
                            </button>
                            <button
                                onClick={() => setFormData({ ...formData, cementingStatus: 'pending' })}
                                className={`flex-1 py-3 rounded-xl font-medium border transition-all flex items-center justify-center
                  ${formData.cementingStatus === 'pending'
                                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                                        : 'border-gray-200 bg-white text-gray-500'}`}
                            >
                                Pending
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            {/* Submit */}
            <div className="p-4 bg-white border-t sticky bottom-0 pb-safe-area-inset-bottom">
                <button
                    onClick={handleSubmit}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
                >
                    Complete Section
                </button>
            </div>
        </div>
    );
}
