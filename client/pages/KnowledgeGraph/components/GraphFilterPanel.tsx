import React from 'react';
import { X } from 'lucide-react';

interface FilterState {
    objectType?: string;
    status: string[];
}

interface GraphFilterPanelProps {
  onClose: () => void;
  initialFilters?: FilterState;
}

export const GraphFilterPanel: React.FC<GraphFilterPanelProps> = ({ onClose, initialFilters }) => {
  return (
    <div className="p-4 flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-slate-800">Filters</h3>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded"><X className="h-4 w-4 text-slate-500" /></button>
        </div>
        
        {initialFilters?.objectType && (
            <div className="mb-4 p-2 bg-blue-50 border border-blue-100 rounded-md">
                <span className="text-xs text-blue-600 font-medium">Active Context:</span>
                <div className="font-bold text-blue-800">{initialFilters.objectType}</div>
            </div>
        )}

        <div className="space-y-6">
            <div>
                <label className="text-xs font-medium text-slate-500 uppercase mb-2 block">Status</label>
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="rounded text-blue-600 focus:ring-blue-500" 
                            defaultChecked={initialFilters?.status.includes('Active')} 
                        /> Active
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="rounded text-blue-600 focus:ring-blue-500" 
                            defaultChecked={initialFilters?.status.includes('Completed')} 
                        /> Completed
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="rounded text-blue-600 focus:ring-blue-500" 
                            defaultChecked={initialFilters?.status.includes('Failed')} 
                        /> Failed
                    </label>
                     <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="rounded text-blue-600 focus:ring-blue-500" 
                            defaultChecked={initialFilters?.status.includes('Stuck')} 
                        /> Stuck
                    </label>
                </div>
            </div>

            <div>
                 <label className="text-xs font-medium text-slate-500 uppercase mb-2 block">Time Range</label>
                 <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                     <option>Last 24 Hours</option>
                     <option>Last 7 Days</option>
                     <option>Last 30 Days</option>
                     <option>All Time</option>
                 </select>
            </div>
            
            <div>
                 <label className="text-xs font-medium text-slate-500 uppercase mb-2 block">Attributes</label>
                 <input type="text" placeholder="Filter by attribute..." className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-sm mb-2" />
            </div>
        </div>
        
        <div className="mt-auto pt-4 border-t border-slate-100">
            <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">
                Apply Filters
            </button>
        </div>
    </div>
  );
};
