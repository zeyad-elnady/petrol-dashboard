'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Plus, Trash2 } from 'lucide-react';

interface HierarchyItem {
    id: string;
    country: string;
    project: string | null;
    unit: string | null;
    unit_number: string | null;
}

export default function HierarchyManagementPage() {
    const [hierarchyData, setHierarchyData] = useState<HierarchyItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set());
    const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
    const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

    // Add modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [addType, setAddType] = useState<'country' | 'project' | 'unit' | 'unit_number'>('country');
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedUnit, setSelectedUnit] = useState('');
    const [newValue, setNewValue] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadHierarchy();
    }, []);

    const loadHierarchy = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/hierarchy');
            const data = await response.json();
            setHierarchyData(data.raw || []);
        } catch (error) {
            console.error('Error loading hierarchy:', error);
            alert('Failed to load hierarchy');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (item: HierarchyItem) => {
        const label = item.unit_number || item.unit || item.project || item.country;
        if (!confirm(`Are you sure you want to delete "${label}"? This will also delete all child items.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/hierarchy/${item.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete');

            alert('✅ Deleted successfully');
            loadHierarchy();
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Failed to delete item');
        }
    };

    const handleAdd = async () => {
        if (!newValue.trim()) {
            alert('Please enter a value');
            return;
        }

        try {
            setSaving(true);
            const payload: any = { country: '' };

            if (addType === 'country') {
                payload.country = newValue.trim();
            } else if (addType === 'project') {
                if (!selectedCountry) {
                    alert('Please select a country');
                    return;
                }
                payload.country = selectedCountry;
                payload.project = newValue.trim();
            } else if (addType === 'unit') {
                if (!selectedCountry || !selectedProject) {
                    alert('Please select country and project');
                    return;
                }
                payload.country = selectedCountry;
                payload.project = selectedProject;
                payload.unit = newValue.trim();
            } else if (addType === 'unit_number') {
                if (!selectedCountry || !selectedProject || !selectedUnit) {
                    alert('Please select country, project, and unit');
                    return;
                }
                payload.country = selectedCountry;
                payload.project = selectedProject;
                payload.unit = selectedUnit;
                payload.unit_number = newValue.trim();
            }

            const response = await fetch('/api/hierarchy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to add');
            }

            alert('✅ Added successfully!');
            setShowAddModal(false);
            setNewValue('');
            setSelectedCountry('');
            setSelectedProject('');
            setSelectedUnit('');
            loadHierarchy();
        } catch (error: any) {
            console.error('Error adding:', error);
            alert(error.message || 'Failed to add item');
        } finally {
            setSaving(false);
        }
    };

    const toggleCountry = (country: string) => {
        const newSet = new Set(expandedCountries);
        if (newSet.has(country)) {
            newSet.delete(country);
        } else {
            newSet.add(country);
        }
        setExpandedCountries(newSet);
    };

    const toggleProject = (key: string) => {
        const newSet = new Set(expandedProjects);
        if (newSet.has(key)) {
            newSet.delete(key);
        } else {
            newSet.add(key);
        }
        setExpandedProjects(newSet);
    };

    const toggleUnit = (key: string) => {
        const newSet = new Set(expandedUnits);
        if (newSet.has(key)) {
            newSet.delete(key);
        } else {
            newSet.add(key);
        }
        setExpandedUnits(newSet);
    };

    // Group data for display
    const countries = [...new Set(hierarchyData.map(item => item.country))];

    const getProjects = (country: string) => {
        return hierarchyData
            .filter(item => item.country === country && item.project && !item.unit)
            .map(item => item.project!);
    };

    const getUnits = (country: string, project: string) => {
        return hierarchyData
            .filter(item => item.country === country && item.project === project && item.unit && !item.unit_number)
            .map(item => item.unit!);
    };

    const getUnitNumbers = (country: string, project: string, unit: string) => {
        return hierarchyData.filter(
            item => item.country === country && item.project === project && item.unit === unit && item.unit_number
        );
    };

    const getItemId = (country: string, project?: string | null, unit?: string | null, unitNumber?: string | null) => {
        const item = hierarchyData.find(
            i => i.country === country &&
                i.project === (project || null) &&
                i.unit === (unit || null) &&
                i.unit_number === (unitNumber || null)
        );
        return item?.id;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Well Hierarchy Management</h1>
                        <p className="mt-2 text-gray-600">Add or remove countries, projects, units, and unit numbers</p>
                    </div>
                    <button
                        onClick={() => {
                            setAddType('country');
                            setShowAddModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-5 h-5" />
                        Add Country
                    </button>
                </div>

                {/* Hierarchy Tree */}
                <div className="bg-white rounded-lg shadow p-6">
                    {countries.map((country) => {
                        const countryId = getItemId(country);
                        const projects = getProjects(country);
                        const isExpanded = expandedCountries.has(country);

                        return (
                            <div key={country} className="mb-4">
                                {/* Country Row */}
                                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100">
                                    <button onClick={() => toggleCountry(country)} className="text-blue-600">
                                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                    </button>
                                    <span className="flex-1 font-semibold text-blue-900">{country}</span>
                                    <button
                                        onClick={() => {
                                            setSelectedCountry(country);
                                            setAddType('project');
                                            setShowAddModal(true);
                                        }}
                                        className="text-blue-600 hover:text-blue-800"
                                        title="Add project"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                    {countryId && (
                                        <button
                                            onClick={() => handleDelete({ id: countryId, country, project: null, unit: null, unit_number: null })}
                                            className="text-red-600 hover:text-red-800"
                                            title="Delete country"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {/* Projects */}
                                {isExpanded && (
                                    <div className="ml-8 mt-2">
                                        {projects.map((project) => {
                                            const projectId = getItemId(country, project);
                                            const units = getUnits(country, project);
                                            const projectKey = `${country}-${project}`;
                                            const isProjectExpanded = expandedProjects.has(projectKey);

                                            return (
                                                <div key={project} className="mb-3">
                                                    {/* Project Row */}
                                                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg hover:bg-green-100">
                                                        <button onClick={() => toggleProject(projectKey)} className="text-green-600">
                                                            {isProjectExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                        </button>
                                                        <span className="flex-1 font-medium text-green-900">{project}</span>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedCountry(country);
                                                                setSelectedProject(project);
                                                                setAddType('unit');
                                                                setShowAddModal(true);
                                                            }}
                                                            className="text-green-600 hover:text-green-800"
                                                            title="Add unit"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                        {projectId && (
                                                            <button
                                                                onClick={() => handleDelete({ id: projectId, country, project, unit: null, unit_number: null })}
                                                                className="text-red-600 hover:text-red-800"
                                                                title="Delete project"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Units */}
                                                    {isProjectExpanded && (
                                                        <div className="ml-8 mt-2">
                                                            {units.map((unit) => {
                                                                const unitId = getItemId(country, project, unit);
                                                                const unitNumbers = getUnitNumbers(country, project, unit);
                                                                const unitKey = `${country}-${project}-${unit}`;
                                                                const isUnitExpanded = expandedUnits.has(unitKey);

                                                                return (
                                                                    <div key={unit} className="mb-2">
                                                                        {/* Unit Row */}
                                                                        <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg hover:bg-yellow-100">
                                                                            <button onClick={() => toggleUnit(unitKey)} className="text-yellow-600">
                                                                                {isUnitExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                                            </button>
                                                                            <span className="flex-1 text-yellow-900">{unit}</span>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setSelectedCountry(country);
                                                                                    setSelectedProject(project);
                                                                                    setSelectedUnit(unit);
                                                                                    setAddType('unit_number');
                                                                                    setShowAddModal(true);
                                                                                }}
                                                                                className="text-yellow-600 hover:text-yellow-800"
                                                                                title="Add unit number"
                                                                            >
                                                                                <Plus className="w-4 h-4" />
                                                                            </button>
                                                                            {unitId && (
                                                                                <button
                                                                                    onClick={() => handleDelete({ id: unitId, country, project, unit, unit_number: null })}
                                                                                    className="text-red-600 hover:text-red-800"
                                                                                    title="Delete unit"
                                                                                >
                                                                                    <Trash2 className="w-4 h-4" />
                                                                                </button>
                                                                            )}
                                                                        </div>

                                                                        {/* Unit Numbers */}
                                                                        {isUnitExpanded && (
                                                                            <div className="ml-8 mt-1 space-y-1">
                                                                                {unitNumbers.map((item) => (
                                                                                    <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100">
                                                                                        <span className="flex-1 text-sm text-gray-700">{item.unit_number}</span>
                                                                                        <button
                                                                                            onClick={() => handleDelete(item)}
                                                                                            className="text-red-600 hover:text-red-800"
                                                                                            title="Delete unit number"
                                                                                        >
                                                                                            <Trash2 className="w-4 h-4" />
                                                                                        </button>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Add {addType.replace('_', ' ')}
                        </h2>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {addType === 'country' && 'Country Name'}
                                {addType === 'project' && `Project Name (under ${selectedCountry})`}
                                {addType === 'unit' && `Unit Name (under ${selectedCountry} → ${selectedProject})`}
                                {addType === 'unit_number' && `Unit Number (under ${selectedCountry} → ${selectedProject} → ${selectedUnit})`}
                            </label>
                            <input
                                type="text"
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={`Enter ${addType.replace('_', ' ')} name`}
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setNewValue('');
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAdd}
                                disabled={saving || !newValue.trim()}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300"
                            >
                                {saving ? 'Adding...' : 'Add'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
