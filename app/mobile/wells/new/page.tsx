'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Check, MapPin, Ruler, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function NewWellWizard() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        project: '',
        unit: '',
        name: '',
        type: 'Development',
        shape: 'Vertical',
        targetDepth: '',
        spudDate: new Date().toISOString().split('T')[0],
        comments: ''
    });

    const totalSteps = 4;

    const handleNext = () => {
        if (step < totalSteps) setStep(step + 1);
        else handleSubmit();
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else router.back();
    };

    const handleSubmit = async () => {
        // Mock submission
        await new Promise(resolve => setTimeout(resolve, 1000));
        router.push('/mobile');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b flex items-center justify-between sticky top-0 z-10">
                <button onClick={handleBack} className="p-2 -ml-2 text-gray-500">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex flex-col items-center">
                    <h1 className="font-semibold text-lg">New Well</h1>
                    <div className="flex space-x-1 mt-1">
                        {[1, 2, 3, 4].map(i => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${i <= step ? 'bg-blue-600' : 'bg-gray-200'}`}
                            />
                        ))}
                    </div>
                </div>
                <div className="w-10" />
            </div>

            <div className="flex-1 p-4">
                {step === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                                <MapPin className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Location</h2>
                            <p className="text-gray-500">Where is this well located?</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Project / Field</label>
                                <select
                                    className="w-full p-3 bg-white border border-gray-300 rounded-xl"
                                    value={formData.project}
                                    onChange={e => setFormData({ ...formData, project: e.target.value })}
                                >
                                    <option value="">Select Project</option>
                                    <option value="Oman Block 6">Oman Block 6</option>
                                    <option value="Saudi Ghawar">Saudi Ghawar</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rig / Unit</label>
                                <select
                                    className="w-full p-3 bg-white border border-gray-300 rounded-xl"
                                    value={formData.unit}
                                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                >
                                    <option value="">Select Unit</option>
                                    <option value="Rig 148">Rig 148</option>
                                    <option value="Rig 149">Rig 149</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Well Name</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-white border border-gray-300 rounded-xl"
                                    placeholder="e.g., AH-123"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
                                <Ruler className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Specifications</h2>
                            <p className="text-gray-500">Define well parameters</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Well Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Development', 'Exploration', 'Appraisal'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setFormData({ ...formData, type })}
                                            className={`p-3 rounded-lg text-sm font-medium border transition-all
                        ${formData.type === type
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-gray-200 bg-white text-gray-600'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Well Shape</label>
                                <select
                                    className="w-full p-3 bg-white border border-gray-300 rounded-xl"
                                    value={formData.shape}
                                    onChange={e => setFormData({ ...formData, shape: e.target.value })}
                                >
                                    <option value="Vertical">Vertical</option>
                                    <option value="Deviated (J)">Deviated (J-shape)</option>
                                    <option value="Deviated (S)">Deviated (S-shape)</option>
                                    <option value="Horizontal">Horizontal</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target Depth (m)</label>
                                <input
                                    type="number"
                                    className="w-full p-3 bg-white border border-gray-300 rounded-xl"
                                    placeholder="e.g., 3500"
                                    value={formData.targetDepth}
                                    onChange={e => setFormData({ ...formData, targetDepth: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                                <Calendar className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Spudding</h2>
                            <p className="text-gray-500">When does drilling start?</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Spud Date</label>
                                <input
                                    type="date"
                                    className="w-full p-3 bg-white border border-gray-300 rounded-xl"
                                    value={formData.spudDate}
                                    onChange={e => setFormData({ ...formData, spudDate: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Comments</label>
                                <textarea
                                    className="w-full p-3 bg-white border border-gray-300 rounded-xl min-h-[120px]"
                                    placeholder="Any specific instructions or notes..."
                                    value={formData.comments}
                                    onChange={e => setFormData({ ...formData, comments: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                                <Check className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Review</h2>
                            <p className="text-gray-500">Confirm details before creating</p>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 divide-y">
                            <div className="p-4 flex justify-between">
                                <span className="text-gray-500">Project</span>
                                <span className="font-medium">{formData.project}</span>
                            </div>
                            <div className="p-4 flex justify-between">
                                <span className="text-gray-500">Unit</span>
                                <span className="font-medium">{formData.unit}</span>
                            </div>
                            <div className="p-4 flex justify-between">
                                <span className="text-gray-500">Well Name</span>
                                <span className="font-medium text-blue-600">{formData.name}</span>
                            </div>
                            <div className="p-4 flex justify-between">
                                <span className="text-gray-500">Type</span>
                                <span className="font-medium">{formData.type}</span>
                            </div>
                            <div className="p-4 flex justify-between">
                                <span className="text-gray-500">Target Depth</span>
                                <span className="font-medium">{formData.targetDepth}m</span>
                            </div>
                            <div className="p-4 flex justify-between">
                                <span className="text-gray-500">Spud Date</span>
                                <span className="font-medium">{formData.spudDate}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-white border-t sticky bottom-0 pb-safe-area-inset-bottom">
                <button
                    onClick={handleNext}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center"
                >
                    {step === totalSteps ? 'Create Well' : 'Continue'}
                    {step !== totalSteps && <ChevronRight className="w-5 h-5 ml-1" />}
                </button>
            </div>
        </div>
    );
}
