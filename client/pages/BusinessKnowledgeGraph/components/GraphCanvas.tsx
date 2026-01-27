import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import { ReactFlow, Background, Controls, Node, Edge, NodeTypes, useNodesState, useEdgesState, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useGraphStore } from "../store/useGraphStore";
import { buildGraph, mockEvents } from "../services/graphBuilder";
import { MacroObjectNode } from './nodes/MacroObjectNode';
import { MacroGroupNode } from './nodes/MacroGroupNode';
import { MacroInstanceNode } from './nodes/MacroInstanceNode';
import { MeshInstanceNode } from './nodes/MeshInstanceNode';
import { FocusInstanceNode } from './nodes/FocusInstanceNode';
import { MeshZoneNode } from './nodes/MeshZoneNode';
import { MeshFlowEdge } from './edges/MeshFlowEdge';
import { applyMacroLayout, applyMeshLayout, applyFocusLayout } from '../services/layout';
import { InstanceDetailPanel } from './InstanceDetailPanel';
import { ArrowLeft } from "lucide-react";

import { GraphTheme } from '../theme/graphTheme';

// Define node types outside component to prevent re-creation
const nodeTypes: NodeTypes = {
  'macro-object': MacroObjectNode,
  'macro-group': MacroGroupNode,
  'macro-instance': MacroInstanceNode,
  'mesh-instance': MeshInstanceNode,
  'focus-instance': FocusInstanceNode,
  'mesh-zone': MeshZoneNode,
};

const edgeTypes = {
    'mesh-edge': MeshFlowEdge,
};

function GraphCanvasContent() {
  const graphState = useGraphStore((state) => state);
  const { mode, setExpandedTypes, setMode, lastMode, setFocusedInstanceId, focusedInstanceId, setZoomLevel, setHoveredInstanceId, hoveredInstanceId, setSelectedInstanceId } = graphState;
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [focusEffectIndex, setFocusEffectIndex] = useState(0);

  // Interaction Handlers
  const onMoveEnd = useCallback((event: any, viewport: any) => {
    setZoomLevel(viewport.zoom);
  }, [setZoomLevel]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
      // In Focus Mode, single click selects the node for the detail panel
      if (mode === 'focus') {
          setSelectedInstanceId(node.id);
      }
  }, [mode, setSelectedInstanceId]);

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (node.type === 'mesh-instance' || node.type === 'macro-instance' || node.type === 'focus-instance') {
        setFocusedInstanceId(node.id);
        setMode('focus');
    }
  }, [setFocusedInstanceId, setMode]);

  const onNodeMouseEnter = useCallback((event: React.MouseEvent, node: Node) => {
      setHoveredInstanceId(node.id);
  }, [setHoveredInstanceId]);

  const onNodeMouseLeave = useCallback(() => {
      setHoveredInstanceId(undefined);
  }, [setHoveredInstanceId]);

  useEffect(() => {
    // 1. Build Graph Data (Pure Data)
    // console.log(`[GraphCanvas] Rebuilding graph for mode: ${mode}`);
    let data;
    try {
        data = buildGraph(graphState);
    } catch (e) {
        console.error("Graph build failed:", e);
        return;
    }

    const init = async () => {
        // 2. Map to React Flow Nodes
        const rfNodes: Node[] = data.nodes.map(n => {
            let type = 'macro-instance'; // default
            if (mode === 'macro') {
                if (n.kind === 'ObjectType') type = 'macro-object';
                else if (n.kind === 'TypeGroup') type = 'macro-group';
                else type = 'macro-instance';
            } else if (mode === 'mesh') {
                if (n.kind === 'Zone') {
                    type = 'mesh-zone';
                    // Zone 节点必须在最底层
                    return {
                        id: n.id,
                        type: 'mesh-zone',
                        position: { x: n.x || 0, y: n.y || 0 },
                        data: n,
                        draggable: false,
                        zIndex: -10, // 确保永远在最下层
                    };
                }
                type = 'mesh-instance';
            } else if (mode === 'focus') {
                type = n.id === graphState.focusedInstanceId ? 'focus-instance' : 'mesh-instance';
            }

            return {
                id: n.id,
                type: type,
                position: { x: n.x || 0, y: n.y || 0 }, 
                data: n,
                parentId: (mode === 'macro' && n.kind === 'Instance') ? n.parentId : undefined,
                extent: (mode === 'macro' && n.kind === 'Instance') ? 'parent' : undefined,
                draggable: mode === 'mesh' || mode === 'focus' || (mode === 'macro' && (n.kind === 'ObjectType' || n.kind === 'TypeGroup')), 
                zIndex: n.kind === 'TypeGroup' ? -1 : 1, 
            };
        });

        const rfEdges: Edge[] = data.edges.map(e => ({
           id: e.id,
           source: e.source,
           target: e.target,
           type: (mode === 'mesh' || mode === 'focus') ? 'mesh-edge' : 'default',
           animated: mode === 'macro', 
           hidden: false, // Always visible, styling handled by component
           label: e.label,
           labelStyle: { fill: '#64748b', fontWeight: 500, fontSize: 12 },
           labelBgStyle: { fill: '#f8fafc', opacity: 0.8 },
           style: mode === 'macro' ? { 
               stroke: GraphTheme.colors.edge.default, 
               strokeWidth: 1
           } : mode === 'focus' ? {
               stroke: GraphTheme.colors.edge.default,
               strokeWidth: 2,
               opacity: 0.6
           } : undefined,
           markerEnd: { 
               type: 'arrowclosed', 
               color: GraphTheme.colors.edge.default,
               width: 20,
               height: 20
           },
           data: { ...e, ...e.data, curve: mode === 'focus' ? 'bezier' : undefined },
        }));

        // 3. Apply Layout
        let layoutedNodes = rfNodes;
        if (mode === 'macro') {
            layoutedNodes = applyMacroLayout(rfNodes, rfEdges);
        } else if (mode === 'mesh') {
            layoutedNodes = await applyMeshLayout(rfNodes, rfEdges);
        } else if (mode === 'focus') {
            layoutedNodes = await applyFocusLayout(rfNodes, rfEdges, graphState.focusedInstanceId);
        }
        
        const enhancedNodes = mode === 'focus' && graphState.focusedInstanceId
            ? layoutedNodes.map(n => {
                if (n.id !== graphState.focusedInstanceId) return n;
                return {
                    ...n,
                    data: {
                        ...n.data,
                        focusEffect: focusEffectIndex
                    }
                };
            })
            : layoutedNodes;

        setNodes(enhancedNodes);
        setEdges(rfEdges);
    };

    init();

  }, [
    graphState.mode, 
    graphState.expandedTypes, 
    graphState.focusedInstanceId, 
    graphState.filters, 
    graphState.timeCursor,
    focusEffectIndex,
    setNodes, setEdges
  ]); 
  
  const lastClickTimeRef = useRef<number>(0);

  const onPaneClick = useCallback((event: React.MouseEvent) => {
      const now = Date.now();
      if (now - lastClickTimeRef.current < 300) {
          if (mode === 'macro') {
              setExpandedTypes([]);
          }
      }
      lastClickTimeRef.current = now;
  }, [mode, setExpandedTypes]);

  const exitFocus = useCallback(() => {
      setFocusedInstanceId(undefined);
      setMode(lastMode && lastMode !== 'focus' ? lastMode : 'mesh');
  }, [lastMode, setMode, setFocusedInstanceId]);

  useEffect(() => {
      if (mode !== 'focus') return;
      const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === 'Escape') {
              exitFocus();
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, exitFocus]);

  useEffect(() => {
      if (mode !== 'focus') return;
      setFocusEffectIndex(0);
  }, [mode, focusedInstanceId]);

  const focusNode = useMemo(() => {
      if (!focusedInstanceId) return undefined;
      return nodes.find(n => n.id === focusedInstanceId);
  }, [nodes, focusedInstanceId]);

  const focusSchema = (focusNode?.data as any)?.schema || [];

  const focusTimeline = useMemo(() => {
      if (!focusedInstanceId) return [];
      return mockEvents
          .filter(e => e.instanceId === focusedInstanceId)
          .sort((a, b) => a.timestamp - b.timestamp);
  }, [focusedInstanceId]);

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onPaneClick={onPaneClick}
        onMoveEnd={onMoveEnd}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <Background color={GraphTheme.colors.canvas.grid} gap={40} size={1} />
        <Controls />
      </ReactFlow>

      {mode === 'focus' && (
        <>
            <button
              className="absolute top-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-md bg-white/80 backdrop-blur text-slate-700 shadow-sm border border-slate-200 hover:bg-white"
              onClick={exitFocus}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">退出聚焦</span>
            </button>
            <InstanceDetailPanel />
        </>
      )}
    </div>
  );
}

export function GraphCanvas() {
    return (
        <ReactFlowProvider>
            <GraphCanvasContent />
        </ReactFlowProvider>
    );
}
