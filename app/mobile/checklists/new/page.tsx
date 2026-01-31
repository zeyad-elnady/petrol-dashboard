'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, CheckSquare, Camera, AlertCircle } from 'lucide-react';

export default function NewChecklistPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [items, setItems] = useState<any[]>([
        { id: 1, text: 'Safety barriers in place', status: null, comment: '' },
        { id: 2, text: 'PPE checked for all crew', status: null, comment: '' },
        { id: 3, text: 'Equipment visually inspected', status: null, comment: '' },
        { id: 4, text: 'Permit to Work signed', status: null, comment: '' },
        { id: 5, text: 'Emergency escape route clear', status: null, comment: '' },
    ]);

    const templates = [
        { id: 'pre-spud', name: 'Pre-Spud Safety Check' },
        { id: 'casing', name: 'Casing Run Checklist' },
        { id: 'cementing', name: 'Cementing Pre-Job' },
        { id: 'tripping', name: 'Tripping Pipe Safety' },
    ];

    const handleItemStatus = (id: number, status: 'pass' | 'fail') => {
        setItems(items.map(i => i.id === id ? { ...i, status } : i));
    };

    const handleSubmit = async () => {
        // Mock submission
        await new Promise(resolve => setTimeout(resolve, 1000));
        router.push('/mobile');
    };

    const progress = Math.round((items.filter(i => i.status !== null).length / items.length) * 100);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b flex items-center justify-between sticky top-0 z-10">
                <button onClick={() => step === 1 ? router.back() : setStep(1)} className="p-2 -ml-2 text-gray-500">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="font-semibold text-lg">
                    {step === 1 ? 'New Checklist' : templates.find(t => t.id === selectedTemplate)?.name}
                </h1>
                <div className="w-10" />
            </div>

            <div className="flex-1 p-4">
                {step === 1 ? (
                    <div className="space-y-4 animate-in slide-in-from-right duration-300">
                        <h2 className="text-sm font-medium text-gray-500 uppercase ml-1">Select Template</h2>
                        {templates.map(template => (
                            <button
                                key={template.id}
                                onClick={() => { setSelectedTemplate(template.id); setStep(2); }}
                                className="w-full p-4 bg-white rounded-xl border border-gray-200 flex items-center justify-between hover:bg-blue-50 hover:border-blue-200 transition-all group"
                            >
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mr-3 group-hover:bg-blue-200">
                                        <CheckSquare className="w-5 h-5" />
                                    </div>
                                    <span className="font-medium text-gray-900">{template.name}</span>
                                </div>
                                <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">
                        {/* Progress Bar */}
                        <div className="bg-white p-4 rounded-xl shadow-sm">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-500">Completion</span>
                                <span className="font-bold text-blue-600">{progress}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Checklist Items */}
                        <div className="space-y-4">
                            {items.map(item => (
                                <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                    <p className="font-medium text-gray-900 mb-3">{item.text}</p>

                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleItemStatus(item.id, 'pass')}
                                            className={`flex-1 py-2 rounded-lg font-medium transition-colors
                        ${item.status === 'pass'
                                                    ? 'bg-green-100 text-green-700 ring-2 ring-green-500 ring-offset-1'
                                                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                        >
                                            Pass
                                        </button>
                                        <button
                                            onClick={() => handleItemStatus(item.id, 'fail')}
                                            className={`flex-1 py-2 rounded-lg font-medium transition-colors
                        ${item.status === 'fail'
                                                    ? 'bg-red-100 text-red-700 ring-2 ring-red-500 ring-offset-1'
                                                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                        >
                                            Fail
                                        </button>
                                        <button className="p-2 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100">
                                            <Camera className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {item.status === 'fail' && (
                                        <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                                            <textarea
                                                placeholder="Explain failure reason..."
                                                className="w-full p-2 text-sm border border-red-200 bg-red-50 rounded-lg text-red-900 placeholder-red-300 focus:outline-none focus:ring-1 focus:ring-red-500"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            {step === 2 && (
                <div className="p-4 bg-white border-t sticky bottom-0 pb-safe-area-inset-bottom">
                    <button
                        onClick={handleSubmit}
                        disabled={progress < 100}
                        className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all
              ${progress < 100
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
                    >
                        Submit Checklist
                    </button>
                </div>
            )}
        </div>
    );
}
