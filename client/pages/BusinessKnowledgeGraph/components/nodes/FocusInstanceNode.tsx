import { Handle, Position, NodeProps } from '@xyflow/react';
import { cn } from "@/lib/utils";
import { InstanceNode } from "@shared/businessKnowledgeGraphTypes";
import { GraphTheme } from '../../theme/graphTheme';
import { useGraphStore } from '../../store/useGraphStore';

type FocusInstanceNodeProps = NodeProps<InstanceNode & { schema?: { name: string; type: string; description?: string }[]; focusEffect?: number }>;

export function FocusInstanceNode({ data, selected }: FocusInstanceNodeProps) {
  const showLabels = useGraphStore(state => state.showLabels);
  const status = data.status || 'Active';
  const color = GraphTheme.colors.status[status] || GraphTheme.colors.status.Active;
  
  const hasGlow = true; // Always glow in focus mode for the center node
  const glowColor = status === 'Failed' 
    ? GraphTheme.colors.node.glow.failed 
    : (status === 'Stuck' ? GraphTheme.colors.node.glow.stuck : GraphTheme.colors.node.glow.active);

  return (
    <div className="relative flex items-center justify-center">
        {/* Soft Glow Halo */}
        <div 
            className="absolute rounded-full"
            style={{ 
                width: GraphTheme.sizes.focus.center,
                height: GraphTheme.sizes.focus.center,
                backgroundColor: glowColor,
                opacity: 0.6,
                filter: 'blur(12px)',
                transition: GraphTheme.animation.transition,
                zIndex: -1,
            }}
        />

        {/* Main Node Body */}
        <div 
            className={cn(
                "rounded-full flex items-center justify-center border-2 bg-white relative",
                selected && "ring-2 ring-white ring-offset-2"
            )}
            style={{
                width: GraphTheme.sizes.focus.instance,
                height: GraphTheme.sizes.focus.instance,
                borderColor: color,
                // Inner color fill (optional, or white with colored border)
                // User said: "节点填充色 = 状态色". So we should fill it.
                backgroundColor: color,
                boxShadow: `0 0 15px ${glowColor}`,
                transition: GraphTheme.animation.transition,
            }}
        >
             {/* ID / Label - Minimal inside */}
            <div 
                className="text-[10px] font-bold text-white truncate px-1 max-w-full"
                style={{ 
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                }}
            >
                {data.id}
            </div>
        </div>

        <Handle type="target" position={Position.Top} className="opacity-0" />
        <Handle type="source" position={Position.Bottom} className="opacity-0" />

        {showLabels && (
            <div style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginTop: 8,
                fontSize: 12,
                fontWeight: 600,
                color: GraphTheme.colors.text.label,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                opacity: 0.9,
                textShadow: '0 1px 2px white'
            }}>
                {data.label || data.id}
            </div>
        )}
    </div>
  );
}
