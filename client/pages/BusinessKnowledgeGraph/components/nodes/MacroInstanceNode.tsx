import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { useGraphStore } from '../../store/useGraphStore';
import { InstanceNode } from '@shared/businessKnowledgeGraphTypes';
import { GraphTheme } from '../../theme/graphTheme';

type MacroInstanceNodeProps = NodeProps<InstanceNode>;

export function MacroInstanceNode({ data, selected }: MacroInstanceNodeProps) {
  const setFocusedInstanceId = useGraphStore(state => state.setFocusedInstanceId);
  const setHoveredInstanceId = useGraphStore(state => state.setHoveredInstanceId);
  const setMode = useGraphStore(state => state.setMode);

  const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setFocusedInstanceId(data.id);
      setMode('focus');
  };

  const handleMouseEnter = () => setHoveredInstanceId(data.id);
  const handleMouseLeave = () => setHoveredInstanceId(undefined);
  const showLabels = useGraphStore(state => state.showLabels);

  const status = data.status || 'Active';
  const color = GraphTheme.colors.status[status] || GraphTheme.colors.status.Active;

  return (
    <div 
      className={cn(
        "rounded-full cursor-pointer transition-all",
        selected && "ring-1 ring-white"
      )}
      style={{
        width: GraphTheme.sizes.macro.instance,
        height: GraphTheme.sizes.macro.instance,
        backgroundColor: color,
        // Macro Mode: No shadow, no border (or extremely faint)
        border: 'none', 
        boxShadow: 'none',
        transition: GraphTheme.animation.transition,
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={`${data.id}`}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />

      {showLabels && (
        <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: 2,
            fontSize: 8,
            color: GraphTheme.colors.text.label,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            opacity: 0.7
        }}>
            {data.id}
        </div>
      )}
    </div>
  );
}
