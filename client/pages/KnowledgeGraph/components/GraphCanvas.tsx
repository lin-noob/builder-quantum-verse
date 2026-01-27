import React, { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, { 
  Node, 
  Edge, 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState,
  ConnectionMode,
  MarkerType,
  MiniMap
} from 'reactflow';
import 'reactflow/dist/style.css';
import { GraphData, GraphViewMode } from '../KnowledgeGraphPage';
import { Handle, Position } from 'reactflow';
import { MOCK_MACRO_DATA, getMacroTypeNodeStyle } from './MacroTypeNode';
import TypeGroupNode from './TypeGroupNode';

const nodeTypes = {
  'type-node': ({ data }: any) => {
      // Simple circle node for macro view (unexpanded)
      return (
          <div style={{ 
              width: data.style?.r * 2 || 80, 
              height: data.style?.r * 2 || 80, 
              borderRadius: '50%', 
              backgroundColor: data.style?.fill || '#EFF6FF',
              border: `${data.style?.lineWidth || 2}px solid ${data.style?.stroke || '#3B82F6'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              fontSize: '12px',
              color: '#1E293B',
              cursor: 'pointer'
          }}>
              {data.label}
              <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
              <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
          </div>
      );
  },
  'type-group-node': TypeGroupNode,
  'instance-node': ({ data }: any) => {
      return (
          <div style={{ 
              width: data.style?.r * 2 || 40, 
              height: data.style?.r * 2 || 40, 
              borderRadius: '50%', 
              backgroundColor: data.style?.fill || '#fff',
              border: `${data.style?.lineWidth || 1}px solid ${data.style?.stroke || '#999'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px'
          }}>
              {data.label}
              <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
              <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
          </div>
      );
  }
};

interface GraphCanvasProps {
  data: GraphData;
  viewMode: GraphViewMode;
  onNodeClick: (nodeId: string, nodeType: string) => void;
  onCanvasDoubleClick?: () => void;
  selectedNodeId: string | null;
}

// Helper to calculate layout positions
const getLayoutedElements = (nodes: any[], edges: any[], viewMode: GraphViewMode, selectedNodeId: string | null) => {
  // Center coordinates
  const centerX = 400;
  const centerY = 300;

  // Separate nodes by type
  const typeNodes = nodes.filter(n => n.data?.nodeType === 'type-node');
  const instanceNodes = nodes.filter(n => n.data?.nodeType === 'instance-node' || n.data?.nodeType === 'cluster-node');
  
  // Identify Active Type Nodes (those that have instances)
  const activeTypeIds = new Set<string>();
  instanceNodes.forEach(node => {
      // Find edge connecting this instance to a type node?
      // Or infer from objectType property if available
      if (node.data?.objectType) {
          activeTypeIds.add(node.data.objectType);
      }
  });

  const layoutedNodes = nodes.map((node) => {
    let position = { x: 0, y: 0 };
    const index = nodes.indexOf(node);
    const count = nodes.length;

    if (viewMode === 'macro') {
        // Macro View: Circular Layout for Type Nodes
        // If there are instance nodes (shouldn't be in pure Macro, but if so), hide them or place far away
        if (node.data?.nodeType === 'type-node' || node.type === 'type-node') {
             const typeIndex = typeNodes.indexOf(node);
             const typeCount = typeNodes.length;
             const radius = 250;
             const angle = (typeIndex / typeCount) * 2 * Math.PI;
             position = {
                 x: centerX + Math.cos(angle) * radius - 40, // Center adjustment
                 y: centerY + Math.sin(angle) * radius - 40
             };
        } else {
            // Should not happen in pure macro, but fallback
            position = { x: centerX, y: centerY };
        }

    } else if (viewMode === 'index') {
        // Index View: Adaptive Layout
        const activeList = Array.from(activeTypeIds);
        // Ensure selectedNodeId is in activeList if not already
        if (selectedNodeId && !activeList.includes(selectedNodeId)) activeList.push(selectedNodeId);
        
        // Check if we have expanded groups
        const hasGroups = nodes.some(n => n.type === 'type-group-node');
        const GROUP_SIZE = 600;

        if (node.type === 'type-group-node') {
             const activeIndex = activeList.indexOf(node.id);
             const activeCount = activeList.length;
             const dynamicSpacing = GROUP_SIZE + 100;
             
             const startX = centerX - ((activeCount - 1) * dynamicSpacing) / 2;
             
             position = {
                 x: startX + activeIndex * dynamicSpacing - GROUP_SIZE / 2,
                 y: centerY - GROUP_SIZE / 2
             };
        } else if (node.data?.parentId) {
             // Child Node inside Group
             const siblings = nodes.filter(n => n.data?.parentId === node.data.parentId);
             const siblingIndex = siblings.indexOf(node);
             
             // Spiral Layout relative to Group Center
             const scale = 45; 
             const r = scale * Math.sqrt(siblingIndex + 2); 
             const theta = siblingIndex * 2.4; 
             
             // Center of group is GROUP_SIZE/2
             position = {
                 x: (GROUP_SIZE / 2) + r * Math.cos(theta) - 20, // Offset by half node size (approx)
                 y: (GROUP_SIZE / 2) + r * Math.sin(theta) - 20
             };
        } else if (node.data?.nodeType === 'type-node' || node.type === 'type-node') {
            if (activeTypeIds.has(node.id) || node.id === selectedNodeId) {
                // Active Type Node (but not a group? Should not happen if logic is correct, but fallback)
                const activeIndex = activeList.indexOf(node.id);
                const activeCount = activeList.length;
                const dynamicSpacing = 500;
                
                const startX = centerX - ((activeCount - 1) * dynamicSpacing) / 2;
                
                position = {
                    x: startX + activeIndex * dynamicSpacing,
                    y: centerY
                };
            } else {
                // Inactive Type Node -> Periphery
                const typeIndex = typeNodes.indexOf(node);
                const radius = 1200; // Farther orbit
                const angle = (typeIndex / typeNodes.length) * 2 * Math.PI;
                position = {
                    x: centerX + Math.cos(angle) * radius,
                    y: centerY + Math.sin(angle) * radius
                };
            }
        } else {
            // Standalone Instance Node (Fallback)
             position = { x: centerX, y: centerY };
        }

    } else {
        // Focus View: Ego Graph
        // Center the selected node
        if (node.id === selectedNodeId) {
            position = { x: centerX, y: centerY };
        } else {
            // Neighbors in circle
            // Improve: Force directed or layers
            const radius = 300;
            const angle = (index / count) * 2 * Math.PI;
            position = {
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius
            };
        }
    }

    return {
      ...node,
      position,
    };
  });

  return { nodes: layoutedNodes, edges };
};

export const GraphCanvas: React.FC<GraphCanvasProps> = ({ data, viewMode, onNodeClick, onCanvasDoubleClick, selectedNodeId }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const lastClickRef = React.useRef<number>(0);

  // Transform Data to ReactFlow format
  useEffect(() => {
    if (!data) return;

    const rfNodes: Node[] = data.nodes.map(n => ({
        id: n.id,
        type: n.type || 'default', // Use provided type or default
        data: { 
            label: n.label || n.id,
            ...n.data,
            originalStyle: n.style // Pass style to be used in custom node or effect
        },
        parentId: n.data?.parentId, // Map parentId if present
        extent: n.data?.extent, // Map extent if present
        style: {
            // Map G6 styles to CSS if not custom node
            // For custom nodes, style might be handled inside the component or passed via data
            // But we can apply basic positioning styles here
            ...n.style
        },
        position: { x: 0, y: 0 } // Will be calculated
    }));

    const rfEdges: Edge[] = data.edges.map(e => ({
        id: e.id || `${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        type: 'default',
        style: {
            stroke: e.style?.stroke || '#b1b1b7',
            strokeWidth: e.style?.lineWidth || 1,
        },
        markerEnd: {
            type: MarkerType.ArrowClosed,
            color: e.style?.stroke || '#b1b1b7',
        },
    }));

    const layouted = getLayoutedElements(rfNodes, rfEdges, viewMode, selectedNodeId);
    setNodes(layouted.nodes);
    setEdges(layouted.edges);

  }, [data, viewMode, selectedNodeId, setNodes, setEdges]);

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
      const businessType = node.data?.nodeType || 'unknown';
      onNodeClick(node.id, businessType);
  }, [onNodeClick]);

  const handlePaneClick = useCallback(() => {
      // Simple double click detection
      const now = Date.now();
      if (lastClickRef.current && (now - lastClickRef.current < 300)) {
          if (onCanvasDoubleClick) {
              onCanvasDoubleClick();
          }
          lastClickRef.current = 0;
      } else {
          lastClickRef.current = now;
      }
  }, [onCanvasDoubleClick]);

  return (
    <div className="w-full h-full bg-slate-50">
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
            fitView
            attributionPosition="bottom-right"
        >
            <Background color="#ccc" gap={16} />
            <Controls />
            <MiniMap />
        </ReactFlow>
    </div>
  );
};
