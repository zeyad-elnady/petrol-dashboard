'use client';

import { useEffect, useState } from 'react';

export default function ReportSchedulePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [timeSlot1, setTimeSlot1] = useState('08:00');
    const [timeSlot2, setTimeSlot2] = useState('20:00');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        loadSchedule();
    }, []);

    const loadSchedule = async () => {
        try {
            const response = await fetch('/api/reports/schedule');
            const data = await response.json();

            if (data.schedule) {
                // Convert TIME to HH:MM format
                setTimeSlot1(data.schedule.time_slot_1?.substring(0, 5) || '08:00');
                setTimeSlot2(data.schedule.time_slot_2?.substring(0, 5) || '20:00');
            }
        } catch (error) {
            console.error('Failed to load schedule:', error);
            setMessage({ type: 'error', text: 'Failed to load schedule' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            const response = await fetch('/api/reports/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    time_slot_1: `${timeSlot1}:00`,
                    time_slot_2: `${timeSlot2}:00`,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Schedule updated successfully!' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to update schedule' });
            }
        } catch (error) {
            console.error('Error saving schedule:', error);
            setMessage({ type: 'error', text: 'Failed to update schedule' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8">
                <p className="text-gray-600">Loading schedule...</p>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="max-w-2xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Report Schedule</h1>
                <p className="text-gray-600 mb-8">
                    Configure the times when engineers must submit daily reports.
                    They will receive reminders at these times.
                </p>

                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                    <div className="space-y-6">
                        {/* Time Slot 1 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Morning Report Time
                            </label>
                            <input
                                type="time"
                                value={timeSlot1}
                                onChange={(e) => setTimeSlot1(e.target.value)}
                                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                First daily report submission time
                            </p>
                        </div>

                        {/* Time Slot 2 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Evening Report Time
                            </label>
                            <input
                                type="time"
                                value={timeSlot2}
                                onChange={(e) => setTimeSlot2(e.target.value)}
                                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Second daily report submission time
                            </p>
                        </div>

                        {/* Message */}
                        {message && (
                            <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                {message.text}
                            </div>
                        )}

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition"
                        >
                            {saving ? 'Saving...' : 'Save Schedule'}
                        </button>
                    </div>
                </div>

                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">📱 How it works:</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Engineers will receive reminders at the configured times</li>
                        <li>• When they open the app, a mandatory daily report modal will appear</li>
                        <li>• They cannot use the app until the report is submitted</li>
                        <li>• Two reports are required per day per well</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
