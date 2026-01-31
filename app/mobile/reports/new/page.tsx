'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Calendar, MapPin, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

export default function NewDailyReportPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        well: 'Well Alpha-7',
        status: 'safe',
        operationsSummary: '',
        issues: '',
        next24Hours: ''
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
                <h1 className="font-semibold text-lg">Daily Report</h1>
                <div className="w-10" />
            </div>

            <div className="flex-1 p-4 space-y-6">
                {/* Context */}
                <section className="bg-white p-4 rounded-xl shadow-sm space-y-3">
                    <div className="flex items-center text-gray-700">
                        <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                        <span className="font-medium">{formData.date}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                        <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                        <span className="font-medium">{formData.well}</span>
                    </div>
                </section>

                {/* Status */}
                <section className="bg-white p-4 rounded-xl shadow-sm space-y-3">
                    <h2 className="font-medium text-gray-900">Safety Status</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setFormData({ ...formData, status: 'safe' })}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all
                ${formData.status === 'safe'
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : 'border-gray-100 bg-white text-gray-400'}`}
                        >
                            <CheckCircle className="w-8 h-8 mb-2" />
                            <span className="font-bold">Safe Operations</span>
                        </button>
                        <button
                            onClick={() => setFormData({ ...formData, status: 'issues' })}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all
                ${formData.status === 'issues'
                                    ? 'border-red-500 bg-red-50 text-red-700'
                                    : 'border-gray-100 bg-white text-gray-400'}`}
                        >
                            <AlertTriangle className="w-8 h-8 mb-2" />
                            <span className="font-bold">Issues Reported</span>
                        </button>
                    </div>
                </section>

                {/* Operations */}
                <section className="bg-white p-4 rounded-xl shadow-sm space-y-4">
                    <h2 className="font-medium text-gray-900">Operations Summary</h2>

                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Last 24 Hours</label>
                        <textarea
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl min-h-[100px] focus:bg-white transition-colors"
                            placeholder="What was accomplished?"
                            value={formData.operationsSummary}
                            onChange={e => setFormData({ ...formData, operationsSummary: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Next 24 Hours</label>
                        <textarea
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl min-h-[80px] focus:bg-white transition-colors"
                            placeholder="Planned activities..."
                            value={formData.next24Hours}
                            onChange={e => setFormData({ ...formData, next24Hours: e.target.value })}
                        />
                    </div>

                    {formData.status === 'issues' && (
                        <div className="animate-in slide-in-from-top duration-300">
                            <label className="text-xs font-medium text-red-500 uppercase mb-2 block">Issues / Incidents</label>
                            <textarea
                                className="w-full p-3 bg-red-50 border border-red-200 rounded-xl min-h-[80px] text-red-900 placeholder-red-300"
                                placeholder="Describe any safety issues or delays..."
                                value={formData.issues}
                                onChange={e => setFormData({ ...formData, issues: e.target.value })}
                            />
                        </div>
                    )}
                </section>
            </div>

            {/* Submit */}
            <div className="p-4 bg-white border-t sticky bottom-0 pb-safe-area-inset-bottom">
                <button
                    onClick={handleSubmit}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
                >
                    Submit Daily Report
                </button>
            </div>
        </div>
    );
}
