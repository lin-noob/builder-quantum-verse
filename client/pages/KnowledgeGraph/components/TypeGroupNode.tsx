import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ChevronDown, ChevronUp, Filter, MoreHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TypeGroupNodeData {
  label: string;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onFilterClick?: (filter: string) => void;
  onMoreFilters?: () => void;
  activeFilters?: string[];
  quickFilters?: string[];
  count?: number;
}

const TypeGroupNode = ({ id, data, selected }: NodeProps<TypeGroupNodeData>) => {
  const { 
    label, 
    isExpanded, 
    onToggleExpand, 
    onFilterClick, 
    onMoreFilters,
    activeFilters = [],
    quickFilters = ['Failed', 'Stuck', 'Warning'], // Defaults
    count
  } = data;

  return (
    <div className={cn(
      "group relative flex flex-col transition-all duration-300 ease-in-out",
      "bg-slate-50/80 backdrop-blur-sm border-2 rounded-2xl",
      selected ? "border-blue-500 shadow-md" : "border-slate-200 hover:border-blue-300",
      "min-w-[600px] min-h-[600px]" // Ensure enough space for children
    )}>
      {/* Handles for connecting to other Macro Nodes */}
      {/* We place handles on all sides to allow flexible connections */}
      <Handle type="source" position={Position.Top} className="opacity-0" />
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Right} className="opacity-0" />
      <Handle type="target" position={Position.Right} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
      <Handle type="target" position={Position.Bottom} className="opacity-0" />
      <Handle type="source" position={Position.Left} className="opacity-0" />
      <Handle type="target" position={Position.Left} className="opacity-0" />

      {/* Header Section */}
      <div className="flex flex-col w-full px-4 py-3 border-b border-slate-100 bg-white/50 rounded-t-2xl z-10">
        
        {/* Title Row */}
        <div 
          className="flex items-center justify-between cursor-pointer group/header"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(id);
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-slate-800">{label}</span>
            {count !== undefined && (
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </div>
          <button className="p-1 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {/* Quick Filters Row */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1 text-xs text-slate-400 mr-1">
            <Filter size={12} />
            <span>Filter:</span>
          </div>
          
          {quickFilters.map(filter => {
            const isActive = activeFilters.includes(filter);
            return (
              <button
                key={filter}
                className={cn(
                  "px-2 py-1 text-xs font-medium rounded-md transition-colors border",
                  isActive 
                    ? "bg-blue-100 text-blue-700 border-blue-200" 
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onFilterClick?.(filter);
                }}
              >
                {filter}
              </button>
            );
          })}

          <button 
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors ml-auto"
            onClick={(e) => {
              e.stopPropagation();
              onMoreFilters?.();
            }}
            title="More filters"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Content Area - Children nodes will be rendered here by React Flow */}
      {/* The background is handled by the container div */}
    </div>
  );
};

export default memo(TypeGroupNode);
