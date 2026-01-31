'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Mic, MapPin, X, Check } from 'lucide-react';
import Link from 'next/link';

export default function NewHazardPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        description: '',
        category: '',
        priority: 'medium',
        location: 'Well Alpha-7', // Mock auto-detected location
        photos: [] as string[]
    });

    const categories = [
        { id: 'unsafe_act', label: 'Unsafe Act', color: 'bg-red-100 text-red-700' },
        { id: 'unsafe_condition', label: 'Unsafe Condition', color: 'bg-orange-100 text-orange-700' },
        { id: 'environmental', label: 'Environmental', color: 'bg-green-100 text-green-700' },
        { id: 'equipment', label: 'Equipment', color: 'bg-blue-100 text-blue-700' }
    ];

    const handlePhotoCapture = () => {
        // Mock photo capture
        const mockPhoto = `https://images.unsplash.com/photo-1581092921461-eab62e97a783?w=400&q=80`;
        setFormData(prev => ({ ...prev, photos: [...prev.photos, mockPhoto] }));
    };

    const handleSubmit = async () => {
        // In a real app, we would upload photos and save data here
        await new Promise(resolve => setTimeout(resolve, 1000));
        router.push('/mobile');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b flex items-center justify-between sticky top-0 z-10">
                <Link href="/mobile" className="p-2 -ml-2 text-gray-500">
                    <X className="w-6 h-6" />
                </Link>
                <h1 className="font-semibold text-lg">Report Hazard</h1>
                <div className="w-10" /> {/* Spacer */}
            </div>

            <div className="flex-1 p-4 space-y-6">
                {/* Step 1: Photos */}
                <section className="bg-white p-4 rounded-xl shadow-sm space-y-4">
                    <h2 className="font-medium text-gray-900">1. Evidence</h2>
                    <div className="flex space-x-3 overflow-x-auto pb-2">
                        <button
                            onClick={handlePhotoCapture}
                            className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-300 active:bg-gray-200"
                        >
                            <Camera className="w-8 h-8 mb-1" />
                            <span className="text-xs">Add Photo</span>
                        </button>
                        {formData.photos.map((photo, i) => (
                            <div key={i} className="flex-shrink-0 w-24 h-24 relative rounded-lg overflow-hidden">
                                <img src={photo} alt="Evidence" className="w-full h-full object-cover" />
                                <button className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Step 2: Details */}
                <section className="bg-white p-4 rounded-xl shadow-sm space-y-4">
                    <h2 className="font-medium text-gray-900">2. Details</h2>

                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Category</label>
                        <div className="grid grid-cols-2 gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setFormData({ ...formData, category: cat.id })}
                                    className={`p-3 rounded-lg text-sm font-medium border transition-all
                    ${formData.category === cat.id
                                            ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 bg-white text-gray-600'}`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe the hazard..."
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-h-[100px]"
                        />
                        <button className="mt-2 flex items-center text-blue-600 text-sm font-medium">
                            <Mic className="w-4 h-4 mr-1" />
                            Add Voice Note
                        </button>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Location</label>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg text-gray-700">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            {formData.location}
                            <button className="ml-auto text-xs text-blue-600 font-medium">Change</button>
                        </div>
                    </div>
                </section>
            </div>

            {/* Submit Button */}
            <div className="p-4 bg-white border-t sticky bottom-0 pb-safe-area-inset-bottom">
                <button
                    onClick={handleSubmit}
                    disabled={!formData.category || !formData.description}
                    className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all
            ${(!formData.category || !formData.description)
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
                >
                    Submit Report
                </button>
            </div>
        </div>
    );
}
