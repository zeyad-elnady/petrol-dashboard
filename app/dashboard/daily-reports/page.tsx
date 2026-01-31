'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface DailyReport {
    id: string;
    well_id: string;
    report_date: string;
    time_slot: number;
    drilling_depth: number;
    mud_weight: number;
    pump_pressure: number;
    incidents: string;
    remarks: string;
    submitted_at: string;
    wells: { well_id: string; name: string; location: string };
    users: { first_name: string; last_name: string; email: string };
}

export default function DailyReportsPage() {
    const [reports, setReports] = useState<DailyReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedWell, setSelectedWell] = useState<string>('');
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadReports();
    }, [selectedWell, selectedUser, startDate, endDate]);

    const loadReports = async () => {
        try {
            const params = new URLSearchParams();
            if (selectedWell) params.append('well_id', selectedWell);
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);

            const response = await fetch(`/api/reports/daily?${params}`);
            const data = await response.json();

            if (data.reports) {
                let filtered = data.reports;
                if (selectedUser) {
                    filtered = filtered.filter((r: DailyReport) =>
                        r.users?.email === selectedUser
                    );
                }
                setReports(filtered);
            }
        } catch (error) {
            console.error('Failed to load reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const uniqueUsers = Array.from(
        new Set(reports.map(r => r.users?.email).filter(Boolean))
    ).map(email => {
        const user = reports.find(r => r.users?.email === email)?.users;
        return user;
    }).filter(Boolean);

    // Group by well first, then by date within each well
    const groupedByWell = reports.reduce((acc, report) => {
        const wellKey = report.well_id;
        if (!acc[wellKey]) {
            acc[wellKey] = {
                well: report.wells,
                dates: {}
            };
        }
        const dateKey = report.report_date;
        if (!acc[wellKey].dates[dateKey]) {
            acc[wellKey].dates[dateKey] = [];
        }
        acc[wellKey].dates[dateKey].push(report);
        return acc;
    }, {} as Record<string, { well: any; dates: Record<string, DailyReport[]> }>);

    const toggleGroup = (key: string) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(key)) {
            newExpanded.delete(key);
        } else {
            newExpanded.add(key);
        }
        setExpandedGroups(newExpanded);
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Reports</h1>
            <p className="text-gray-700 mb-8">
                View all submitted daily reports organized by well and date
            </p>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Filter by Engineer
                        </label>
                        <select
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                        >
                            <option value="">All Engineers</option>
                            {uniqueUsers.map((user: any) => (
                                <option key={user.email} value={user.email}>
                                    {user.first_name} {user.last_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setSelectedWell('');
                                setSelectedUser('');
                                setStartDate('');
                                setEndDate('');
                            }}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Reports Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <p className="text-gray-700">Loading reports...</p>
                </div>
            ) : Object.keys(groupedByWell).length === 0 ? (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
                    <p className="text-gray-700">No reports found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Object.entries(groupedByWell).map(([wellId, wellData]) => {
                        const dateEntries = Object.entries(wellData.dates).sort(
                            ([a], [b]) => new Date(b).getTime() - new Date(a).getTime()
                        );
                        const totalReports = dateEntries.reduce((sum, [, reports]) => sum + reports.length, 0);

                        return (
                            <div
                                key={wellId}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                            >
                                {/* Well Header */}
                                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-white">
                                    <h3 className="font-bold text-lg">
                                        {wellData.well?.name || wellData.well?.well_id || wellId}
                                    </h3>
                                    <p className="text-blue-100 text-sm">
                                        📍 {wellData.well?.location || 'N/A'} • {totalReports} report(s)
                                    </p>
                                </div>

                                {/* Date Groups */}
                                <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                                    {dateEntries.map(([date, dayReports]) => {
                                        const groupKey = `${wellId}-${date}`;
                                        const isExpanded = expandedGroups.has(groupKey);

                                        return (
                                            <div key={date}>
                                                {/* Date Header (Clickable) */}
                                                <button
                                                    onClick={() => toggleGroup(groupKey)}
                                                    className="w-full px-4 py-3 flex justify-between items-center hover:bg-gray-50 transition"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {isExpanded ? (
                                                            <ChevronDown className="w-4 h-4 text-gray-600" />
                                                        ) : (
                                                            <ChevronRight className="w-4 h-4 text-gray-600" />
                                                        )}
                                                        <span className="font-medium text-gray-900">
                                                            {new Date(date).toLocaleDateString('en-US', {
                                                                weekday: 'short',
                                                                month: 'short',
                                                                day: 'numeric',
                                                            })}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                                                        {dayReports.length} report(s)
                                                    </span>
                                                </button>

                                                {/* Expanded Report Details */}
                                                {isExpanded && (
                                                    <div className="bg-gray-50 px-4 pb-3 space-y-2">
                                                        {dayReports
                                                            .sort((a, b) => a.time_slot - b.time_slot)
                                                            .map((report) => (
                                                                <div
                                                                    key={report.id}
                                                                    className="bg-white rounded-lg p-3 border border-gray-200"
                                                                >
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${report.time_slot === 1
                                                                                ? 'bg-blue-100 text-blue-800'
                                                                                : 'bg-purple-100 text-purple-800'
                                                                            }`}>
                                                                            {report.time_slot === 1 ? '🌅 AM' : '🌙 PM'}
                                                                        </span>
                                                                        <span className="text-xs text-gray-600">
                                                                            {report.users?.first_name} {report.users?.last_name}
                                                                        </span>
                                                                    </div>
                                                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                                                        <div>
                                                                            <p className="text-gray-600">Depth</p>
                                                                            <p className="font-semibold text-gray-900">{report.drilling_depth || 'N/A'}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-gray-600">Mud Wt</p>
                                                                            <p className="font-semibold text-gray-900">{report.mud_weight || 'N/A'}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-gray-600">Pressure</p>
                                                                            <p className="font-semibold text-gray-900">{report.pump_pressure || 'N/A'}</p>
                                                                        </div>
                                                                    </div>
                                                                    {report.incidents && (
                                                                        <div className="mt-2 text-xs">
                                                                            <p className="text-red-600 font-medium">⚠️ {report.incidents}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
