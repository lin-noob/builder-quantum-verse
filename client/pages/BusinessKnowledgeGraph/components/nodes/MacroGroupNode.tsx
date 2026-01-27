import React from 'react';
import { NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { useGraphStore } from '../../store/useGraphStore';
import { TypeGroupNode } from '@shared/businessKnowledgeGraphTypes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Filter, ChevronRight, Calendar, Activity } from 'lucide-react';
import { GraphTheme } from '../../theme/graphTheme';

type MacroGroupNodeProps = NodeProps<TypeGroupNode>;

export function MacroGroupNode({ data, selected }: MacroGroupNodeProps) {
  const toggleTypeExpansion = useGraphStore(state => state.toggleTypeExpansion);
  const setFilterDrawerOpen = useGraphStore(state => state.setFilterDrawerOpen);
  const setActiveFilterType = useGraphStore(state => state.setActiveFilterType);
  
  const handleOpenFilters = (e: React.MouseEvent) => {
      e.stopPropagation();
      setActiveFilterType(data.objectTypeId);
      setFilterDrawerOpen(true);
  };

  return (
    <div 
      className={cn(
        "relative rounded-3xl border-2 border-dashed backdrop-blur-md shadow-2xl flex flex-col",
        selected && "border-primary ring-4 ring-primary/10"
      )}
      style={{
        minWidth: GraphTheme.sizes.macro.groupMin,
        minHeight: GraphTheme.sizes.macro.groupMin,
        backgroundColor: 'rgba(255, 255, 255, 0.9)', // More opaque for "Giant Container" feel
        borderColor: data.color || GraphTheme.colors.group.border,
        transition: GraphTheme.animation.transition
      }}
    >
      {/* Header - Fixed Top Area */}
      <div 
        className="h-16 flex items-center justify-between px-6 border-b border-dashed rounded-t-3xl bg-slate-50/50"
        style={{ borderColor: data.color || GraphTheme.colors.group.border }}
      >
        {/* Left: Title & Stats */}
        <div className="flex items-center gap-3">
            <div className="w-3 h-8 rounded-full" style={{ backgroundColor: data.color }} />
            <span className="font-bold text-lg text-slate-800">{data.objectTypeId}</span>
            <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-slate-200 text-slate-700">
                {data.stats?.total || 0} Instances
            </Badge>
        </div>

        {/* Center: Quick Filters (Mock) */}
        <div className="flex items-center gap-2 nodrag" onClick={e => e.stopPropagation()}>
             <Select defaultValue="24h">
                <SelectTrigger className="w-[110px] h-8 text-xs bg-white border-slate-200">
                   <Calendar className="w-3 h-3 mr-2 text-slate-400"/>
                   <SelectValue placeholder="Time" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="1h">Last 1h</SelectItem>
                    <SelectItem value="24h">Last 24h</SelectItem>
                    <SelectItem value="7d">Last 7d</SelectItem>
                </SelectContent>
             </Select>

             <Select defaultValue="all">
                <SelectTrigger className="w-[110px] h-8 text-xs bg-white border-slate-200">
                   <Activity className="w-3 h-3 mr-2 text-slate-400"/>
                   <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="stuck">Stuck</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
             </Select>
        </div>
        
        {/* Right: Actions */}
        <div className="flex items-center gap-2 nodrag">
             <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs gap-1 text-slate-600 border-slate-200 hover:bg-slate-100"
                onClick={handleOpenFilters}
             >
                <Filter className="w-3 h-3" />
                More
                <ChevronRight className="w-3 h-3 opacity-50" />
             </Button>

             <div className="w-px h-6 bg-slate-300 mx-1" />

             <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                onClick={(e) => {
                    e.stopPropagation();
                    toggleTypeExpansion(data.id);
                }}
             >
                <X className="w-4 h-4" />
             </Button>
        </div>
      </div>

      {/* Body - Instance Area (React Flow handles children rendering via position, but visual container is here) */}
      <div className="flex-1 rounded-b-3xl bg-slate-50/30">
          {/* Background pattern or subtle grid could go here */}
      </div>
    </div>
  );
}