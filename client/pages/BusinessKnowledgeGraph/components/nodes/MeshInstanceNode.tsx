import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { useGraphStore } from '../../store/useGraphStore';
import { InstanceNode } from '@shared/businessKnowledgeGraphTypes';
import { GraphTheme } from '../../theme/graphTheme';

type MeshInstanceNodeProps = NodeProps<InstanceNode>;

export function MeshInstanceNode({ data, selected }: MeshInstanceNodeProps) {
  const zoomLevel = useGraphStore(state => state.zoomLevel);
  const showLabels = useGraphStore(state => state.showLabels);

  // LOD Thresholds
  const isFar = zoomLevel < 0.4;
  const showDetail = zoomLevel >= 0.4;
  const showLabelText = showLabels && zoomLevel > 0.8;
  
  const status = data.status || 'Active';
  const color = GraphTheme.colors.status[status] || GraphTheme.colors.status.Active;

  // Status Glow Logic - Only apply glow if we are close enough or if it's a critical status
  const hasGlow = (status === 'Failed' || status === 'Stuck') && showDetail;
  const glowColor = status === 'Failed' 
    ? GraphTheme.colors.node.glow.failed 
    : (status === 'Stuck' ? GraphTheme.colors.node.glow.stuck : 'transparent');

  // Size adjustment based on LOD
  const size = isFar ? 24 : 44; // 增大圆圈尺寸：远景 24px，近景 44px (足够放文字)

  // Label Truncation
  const fullLabel = data.label || data.id;
  const shortLabel = fullLabel.length > 4 ? `..${fullLabel.slice(-4)}` : fullLabel;

  return (
    <div 
      className={cn(
        "rounded-full transition-all cursor-pointer relative flex items-center justify-center group",
        selected && "ring-2 ring-white ring-offset-2"
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        border: showDetail ? `1px solid ${GraphTheme.colors.node.border}` : 'none',
        boxShadow: hasGlow ? `0 0 8px 2px ${glowColor}` : (showDetail ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'),
        transition: GraphTheme.animation.transition,
      }}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />

      {/* Internal Text Label (Truncated) */}
      {showDetail && (
        <span className="text-[10px] text-white font-medium truncate px-1 select-none pointer-events-none opacity-90 font-mono">
            {shortLabel}
        </span>
      )}

      {/* Hover Tooltip (Full Name) - Custom Implementation for reliability */}
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {fullLabel}
          <div className="text-[9px] opacity-70 mt-0.5 uppercase">{status}</div>
          {/* Tooltip Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
      </div>
    </div>
  );
}
