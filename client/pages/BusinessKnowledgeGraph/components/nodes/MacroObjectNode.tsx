import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { useGraphStore } from '../../store/useGraphStore';
import { ObjectTypeNode } from '@shared/businessKnowledgeGraphTypes';
import { GraphTheme } from '../../theme/graphTheme';

type MacroObjectNodeProps = NodeProps<ObjectTypeNode>;

export function MacroObjectNode({ data, selected }: MacroObjectNodeProps) {
  const toggleTypeExpansion = useGraphStore(state => state.toggleTypeExpansion);
  const showLabels = useGraphStore(state => state.showLabels);
  
  const count = data.instanceCount || 0;
  const { objectBase, objectFactor } = GraphTheme.sizes.macro;
  const size = objectBase + Math.log(count + 1) * objectFactor;
  
  return (
    <div 
      className={cn(
        "rounded-full flex items-center justify-center cursor-pointer backdrop-blur-sm hover:scale-105",
        selected && "ring-2 ring-primary ring-offset-2"
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: data.color, 
        opacity: 0.8,
        boxShadow: 'none',
        border: `1px solid ${data.color}`,
        transition: GraphTheme.animation.transition
      }}
      onClick={() => toggleTypeExpansion(data.id)}
    >
      <div className="text-center pointer-events-none select-none text-white drop-shadow-md">
        {showLabels && <div className="font-bold text-sm">{data.name}</div>}
        <div className="text-xs opacity-90">{count}</div>
      </div>
      
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}
