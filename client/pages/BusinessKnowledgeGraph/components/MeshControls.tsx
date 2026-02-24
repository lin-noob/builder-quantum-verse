import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { useGraphStore } from '../store/useGraphStore';
import { cn } from '@/lib/utils';
import { GraphTheme } from '../theme/graphTheme';

export function MeshControls() {
  const mode = useGraphStore(state => state.mode);
  const filters = useGraphStore(state => state.filters) || {};
  const setFilters = useGraphStore(state => state.setFilters);
  const [searchTerm, setSearchTerm] = useState('');

  // Sync internal state with store
  useEffect(() => {
    if (filters.search !== searchTerm) {
        setSearchTerm(filters.search || '');
    }
  }, [filters.search]);

  const handleSearch = (term: string) => {
      setSearchTerm(term);
      setFilters({
          ...filters,
          search: term
      });
  };

  const toggleStatus = (status: string) => {
      const currentStatuses = filters.status || [];
      const newStatuses = currentStatuses.includes(status)
          ? currentStatuses.filter(s => s !== status)
          : [...currentStatuses, status];
      
      setFilters({
          ...filters,
          status: newStatuses
      });
  };

  if (mode !== 'mesh') return null;

  return (
    <div className="absolute top-4 left-4 z-50 flex flex-col gap-3 w-80">
      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-white/90 backdrop-blur-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm transition-all"
          placeholder="Search instances by ID..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {searchTerm && (
            <button 
                onClick={() => handleSearch('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
            </button>
        )}
      </div>

      {/* Quick Filters (Pills) */}
      <div className="flex flex-wrap gap-2">
          {['Active', 'Stuck', 'Failed', 'Done'].map(status => {
              const isActive = filters.status?.includes(status);
              const colorMap: Record<string, string> = {
                  'Active': GraphTheme.colors.status.Active,
                  'Stuck': GraphTheme.colors.status.Stuck,
                  'Failed': GraphTheme.colors.status.Failed,
                  'Done': GraphTheme.colors.status.Done,
              };
              
              return (
                  <button
                    key={status}
                    onClick={() => toggleStatus(status)}
                    className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium border transition-all shadow-sm backdrop-blur-sm",
                        isActive 
                            ? "bg-white text-slate-800 border-transparent ring-2 ring-offset-1" 
                            : "bg-white/60 text-slate-500 border-slate-200 hover:bg-white"
                    )}
                    style={{
                        borderColor: isActive ? colorMap[status] : undefined,
                        boxShadow: isActive ? `0 0 0 1px ${colorMap[status]}` : undefined
                    }}
                  >
                    <span 
                        className="inline-block w-2 h-2 rounded-full mr-1.5"
                        style={{ backgroundColor: colorMap[status] }} 
                    />
                    {status}
                  </button>
              );
          })}
      </div>
    </div>
  );
}
