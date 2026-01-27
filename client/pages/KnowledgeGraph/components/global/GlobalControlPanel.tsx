
import React from 'react';
import { cn } from '@/lib/utils';

export interface GlobalFilterState {
    objectTypes: string[];
    statuses: string[];
    activity: '1h' | '24h' | '7d' | 'all';
}

interface GlobalControlPanelProps {
    filters: GlobalFilterState;
    onFilterChange: (newFilters: GlobalFilterState) => void;
    className?: string;
}

export const GlobalControlPanel: React.FC<GlobalControlPanelProps> = ({ filters, onFilterChange, className }) => {
    
    const toggleObjectType = (type: string) => {
        const newTypes = filters.objectTypes.includes(type)
            ? filters.objectTypes.filter(t => t !== type)
            : [...filters.objectTypes, type];
        onFilterChange({ ...filters, objectTypes: newTypes });
    };

    const toggleStatus = (status: string) => {
        const newStatuses = filters.statuses.includes(status)
            ? filters.statuses.filter(s => s !== status)
            : [...filters.statuses, status];
        onFilterChange({ ...filters, statuses: newStatuses });
    };

    const setActivity = (activity: GlobalFilterState['activity']) => {
        onFilterChange({ ...filters, activity });
    };

    return (
        <div className={cn("w-64 bg-white border-r border-slate-200 h-full flex flex-col shadow-sm z-10", className)}>
            <div className="p-4 border-b border-slate-200">
                <h2 className="font-semibold text-slate-800">Graph Controls</h2>
                <p className="text-xs text-slate-500 mt-1">Filter global instance view</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                
                {/* Object Types */}
                <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Object Types</h3>
                    <div className="space-y-2">
                        {['Customer', 'Order', 'Product', 'Supplier'].map(type => (
                            <label key={type} className="flex items-center space-x-2 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    checked={filters.objectTypes.includes(type)}
                                    onChange={() => toggleObjectType(type)}
                                />
                                <span className="text-sm text-slate-700 group-hover:text-slate-900">{type}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Status */}
                <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Status</h3>
                    <div className="space-y-2">
                        {[
                            { id: 'Active', color: 'bg-green-500' },
                            { id: 'Failed', color: 'bg-red-500' },
                            { id: 'Stuck', color: 'bg-orange-500' },
                            { id: 'Done', color: 'bg-slate-400' }
                        ].map(({ id, color }) => (
                            <label key={id} className="flex items-center space-x-2 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    checked={filters.statuses.includes(id)}
                                    onChange={() => toggleStatus(id)}
                                />
                                <div className={`w-2 h-2 rounded-full ${color}`} />
                                <span className="text-sm text-slate-700 group-hover:text-slate-900">{id}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Activity */}
                <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Recent Activity</h3>
                    <div className="space-y-1">
                        {[
                            { id: '1h', label: 'Last 1 Hour' },
                            { id: '24h', label: 'Last 24 Hours' },
                            { id: '7d', label: 'Last 7 Days' },
                            { id: 'all', label: 'All Time' }
                        ].map(({ id, label }) => (
                            <button
                                key={id}
                                onClick={() => setActivity(id as any)}
                                className={cn(
                                    "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                                    filters.activity === id 
                                        ? "bg-blue-50 text-blue-700 font-medium" 
                                        : "text-slate-600 hover:bg-slate-50"
                                )}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

            </div>
            
            <div className="p-4 border-t border-slate-200">
                <button 
                    onClick={() => onFilterChange({ 
                        objectTypes: ['Customer', 'Order', 'Product', 'Supplier'], 
                        statuses: ['Active', 'Failed', 'Stuck'], 
                        activity: '24h' 
                    })}
                    className="w-full py-2 px-4 bg-slate-100 text-slate-600 rounded-md text-sm hover:bg-slate-200 transition-colors"
                >
                    Reset Filters
                </button>
            </div>
        </div>
    );
};
