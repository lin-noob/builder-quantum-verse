import React, { useState, useEffect, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  MarkerType,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Handle,
  Position,
  MiniMap,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Layout, GitGraph, Box, Share2, Zap, ArrowRightCircle, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { KnowledgeNodeType } from "../../types/Knowledge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Request } from "@/lib/request";

// --- Visual Constants ---
const TYPE_COLORS = {
  Master: { bg: "bg-blue-50", border: "border-blue-500", text: "text-blue-900", badge: "bg-blue-100 text-blue-700" },
  Transaction: {
    bg: "bg-purple-50",
    border: "border-purple-500",
    text: "text-purple-900",
    badge: "bg-purple-100 text-purple-700",
  },
  Result: {
    bg: "bg-emerald-50",
    border: "border-emerald-500",
    text: "text-emerald-900",
    badge: "bg-emerald-100 text-emerald-700",
  },
};

// --- Custom Node Component ---
const CustomNode = ({
  data,
  selected,
}: {
  data: { label: string; type: KnowledgeNodeType; risk: boolean; stats: any };
  selected: boolean;
}) => {
  const colors = TYPE_COLORS[data.type] || TYPE_COLORS.Master;
  const isHighRisk = data.risk;

  return (
    <div
      className={`
      w-32 h-32 rounded-full border-2 flex flex-col items-center justify-center shadow-lg transition-all duration-300 relative
      ${colors.bg} ${colors.border}
      ${selected ? "ring-4 ring-offset-2 ring-blue-200 scale-110 z-10" : "hover:scale-105 hover:shadow-xl"}
      ${isHighRisk ? "ring-2 ring-red-500 ring-offset-1" : ""}
    `}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2 !h-2" />

      {isHighRisk && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1.5 shadow-sm z-20 animate-pulse border-2 border-white">
          <AlertTriangle className="w-4 h-4" />
        </div>
      )}

      <Box className={`w-8 h-8 mb-1 ${colors.text} opacity-80`} />

      <div className="text-center px-1 w-full overflow-hidden">
        <div className={`font-bold text-sm truncate w-full px-2 ${colors.text}`}>{data.label}</div>
        <div className={`text-[10px] uppercase font-mono mt-0.5 opacity-70 ${colors.text}`}>{data.type}</div>
      </div>
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

// --- Layout Logic ---
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = "TB") => {
  // Simple hierarchical layout without dagre
  // 1. Identify levels (BFS)
  const levels = new Map<string, number>();
  const incomingEdges = new Map<string, number>();

  // Initialize incoming edge counts
  nodes.forEach((node) => {
    levels.set(node.id, 0);
    incomingEdges.set(node.id, 0);
  });

  edges.forEach((edge) => {
    incomingEdges.set(edge.target, (incomingEdges.get(edge.target) || 0) + 1);
  });

  // Find root nodes (in-degree 0)
  const queue: string[] = [];
  nodes.forEach((node) => {
    if ((incomingEdges.get(node.id) || 0) === 0) {
      queue.push(node.id);
    }
  });

  // If no roots (cycle), pick the first one
  if (queue.length === 0 && nodes.length > 0) {
    queue.push(nodes[0].id);
  }

  // BFS to assign levels
  const visited = new Set<string>();

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);

    const currentLevel = levels.get(nodeId) || 0;

    // Find neighbors
    const neighbors = edges.filter((e) => e.source === nodeId).map((e) => e.target);

    neighbors.forEach((targetId) => {
      // Set level to max(current level, parent level + 1)
      const existingLevel = levels.get(targetId) || 0;
      levels.set(targetId, Math.max(existingLevel, currentLevel + 1));

      if (!visited.has(targetId)) {
        queue.push(targetId);
      }
    });
  }

  // Group by level
  const nodesByLevel = new Map<number, string[]>();
  let maxLevel = 0;

  levels.forEach((level, nodeId) => {
    if (!nodesByLevel.has(level)) {
      nodesByLevel.set(level, []);
    }
    nodesByLevel.get(level)!.push(nodeId);
    maxLevel = Math.max(maxLevel, level);
  });

  // Assign positions
  const NODE_WIDTH = 180;
  const NODE_HEIGHT = 180;
  const LEVEL_HEIGHT = 200;

  const layoutedNodes = nodes.map((node) => {
    const level = levels.get(node.id) || 0;
    const nodesInThisLevel = nodesByLevel.get(level) || [];
    const indexInLevel = nodesInThisLevel.indexOf(node.id);

    // Center alignment for each row
    const rowWidth = nodesInThisLevel.length * NODE_WIDTH;
    const xOffset = -(rowWidth / 2) + indexInLevel * NODE_WIDTH;

    return {
      ...node,
      position: {
        x: xOffset,
        y: level * LEVEL_HEIGHT,
      },
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
    };
  });

  return { nodes: layoutedNodes, edges };
};

const getCircularLayoutElements = (nodes: Node[], edges: Edge[]) => {
  const centerX = 400;
  const centerY = 300;
  const radius = 300;

  const layoutedNodes = nodes.map((node, index) => {
    const angle = (index / nodes.length) * 2 * Math.PI;
    return {
      ...node,
      position: {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

const GraphGlobalView: React.FC = () => {
  const navigate = useNavigate();

  const [rfNodes, setNodes, onNodesChange] = useNodesState([]);
  const [rfEdges, setEdges, onEdgesChange] = useEdgesState([]);

  const [layoutMode, setLayoutMode] = useState<"hierarchical" | "circular">("hierarchical");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [apiData, setApiData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch digital list view data
  useEffect(() => {
    const fetchDigitalListView = async () => {
      const request = new Request();
      try {
        setLoading(true);
        const response = await request.request("/quote/api/v1/digital/list/view", { method: "GET" });
        if (response.status === 200 && response.data.data) {
          setApiData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch digital list view:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDigitalListView();
  }, []);

  // Initialize Graph Data
  useEffect(() => {
    if (loading || apiData.length === 0) return;

    // Map API data to nodes
    const initialNodes: Node[] = apiData.map((item) => ({
      id: item.id,
      type: "custom",
      position: { x: 0, y: 0 }, // Will be set by layout
      data: {
        label: item.objectName,
        type: getNodeType(item.modelType),
        risk: false, // Can be determined based on actions if needed
        stats: {
          relationCount: item.relationCount || 0,
          actionCount: item.actionCount || 0,
        },
      },
    }));

    // Build edges from relations
    const initialEdges: Edge[] = [];
    apiData.forEach((source) => {
      if (source.relations && Array.isArray(source.relations)) {
        source.relations.forEach((rel: any, idx: number) => {
          // Ensure target exists - using targetType field from API
          const targetExists = apiData.find((n) => n.id === rel.targetType);
          if (targetExists) {
            initialEdges.push({
              id: `e-${source.id}-${rel.targetType}-${idx}`,
              source: source.id,
              target: rel.targetType,
              label: rel.relationName,
              type: "smoothstep",
              animated: false,
              style: { stroke: "#94a3b8", strokeWidth: 1.5 },
              labelStyle: { fill: "#475569", fontWeight: 600, fontSize: 10 },
              markerEnd: { type: MarkerType.ArrowClosed, color: "#94a3b8" },
            });
          } else {
          }
        });
      }
    });

    let layouted;
    if (layoutMode === "hierarchical") {
      layouted = getLayoutedElements(initialNodes, initialEdges);
    } else {
      layouted = getCircularLayoutElements(initialNodes, initialEdges);
    }

    setNodes(layouted.nodes);
    setEdges(layouted.edges);
  }, [apiData, loading, layoutMode]);

  // Helper function to map modelType to KnowledgeNodeType
  const getNodeType = (modelType: number): KnowledgeNodeType => {
    switch (modelType) {
      case 1:
        return "Master";
      case 2:
        return "Transaction";
      case 3:
        return "Result";
      default:
        return "Master";
    }
  };

  // Get node data by ID from API data
  const getNodeById = (id: string) => {
    const node = apiData.find((n) => n.id === id);
    if (!node) return null;

    return {
      id: node.id,
      name: node.objectName,
      type: getNodeType(node.modelType),
      description: node.description || "",
      properties: node.attributes || [],
      relations: node.relations || [],
      actions: node.actions || [],
      attributeCount: node.attributeCount,
      relationCount: node.relationCount,
      actionCount: node.actionCount,
    };
  };

  // Search Filter Effect (Highlighting)
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        const matches = searchQuery === "" || node.data.label.toLowerCase().includes(searchQuery.toLowerCase());
        return {
          ...node,
          style: { opacity: matches ? 1 : 0.2 },
        };
      }),
    );

    setEdges((eds) =>
      eds.map((edge) => {
        const sourceNode = rfNodes.find((n) => n.id === edge.source);
        const targetNode = rfNodes.find((n) => n.id === edge.target);
        const visible = sourceNode?.style?.opacity !== 0.2 && targetNode?.style?.opacity !== 0.2;
        return {
          ...edge,
          style: { ...edge.style, opacity: visible ? 1 : 0.1 },
        };
      }),
    );
  }, [searchQuery]);

  // Event Handlers
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const selectedNodeData = selectedNodeId ? getNodeById(selectedNodeId) : null;

  if (loading)
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-50 text-slate-400">
        正在构建企业知识图谱...
      </div>
    );

  return (
    <div className="h-full w-full bg-slate-50 relative flex overflow-hidden">
      {/* Main Canvas Area */}
      <div className="flex-1 relative h-full">
        {/* Top Toolbar */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-3 bg-white/90 backdrop-blur-sm p-2 rounded-lg border border-slate-200 shadow-sm">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="搜索对象..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-sm bg-slate-50 border-slate-200 rounded-md w-48 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>
          <div className="h-6 w-px bg-slate-200 mx-1"></div>
          <div className="flex bg-slate-100 p-1 rounded-md">
            <button
              onClick={() => setLayoutMode("hierarchical")}
              className={`p-1.5 rounded text-xs font-medium transition-all ${layoutMode === "hierarchical" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              title="层级布局"
            >
              <GitGraph className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayoutMode("circular")}
              className={`p-1.5 rounded text-xs font-medium transition-all ${layoutMode === "circular" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              title="环形布局"
            >
              <Layout className="w-4 h-4" />
            </button>
          </div>
        </div>

        <ReactFlowProvider>
          <ReactFlow
            nodes={rfNodes}
            edges={rfEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-slate-50"
            minZoom={0.1}
            maxZoom={1.5}
            nodesConnectable={false} // Read-only
            nodesDraggable={false} // Simplify interaction
            elementsSelectable={true}
          >
            <Background color="#cbd5e1" gap={24} size={1} />
            <Controls
              className="bg-white border-slate-200 shadow-sm rounded-lg overflow-hidden m-4"
              showInteractive={false}
            />
            <MiniMap
              className="bg-white border border-slate-200 rounded-lg shadow-sm m-4"
              nodeColor={(n) => {
                if (n.data.type === "Master") return "#bfdbfe";
                if (n.data.type === "Transaction") return "#d8b4fe";
                return "#a7f3d0";
              }}
            />
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      {/* Right Snapshot Panel */}
      <AnimatePresence>
        {selectedNodeData && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-80 h-full bg-white border-l border-slate-200 shadow-xl z-20 flex flex-col"
          >
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-lg ${TYPE_COLORS[selectedNodeData.type].bg}`}>
                  <Box className={`w-6 h-6 ${TYPE_COLORS[selectedNodeData.type].text}`} />
                </div>
                <button onClick={() => setSelectedNodeId(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h2 className="text-xl font-bold text-slate-900 mb-1">{selectedNodeData.name}</h2>
              <Badge variant="outline" className={`${TYPE_COLORS[selectedNodeData.type].badge} border-0 px-2`}>
                {selectedNodeData.type}
              </Badge>

              {selectedNodeData.description && (
                <p className="mt-4 text-sm text-slate-500 leading-relaxed line-clamp-3">
                  {selectedNodeData.description}
                </p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">结构概览</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Box className="w-4 h-4 text-slate-400" /> 核心属性
                  </div>
                  <span className="font-bold text-slate-900">
                    {selectedNodeData.attributeCount || selectedNodeData.properties.length}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Share2 className="w-4 h-4 text-slate-400" /> 定义关系
                  </div>
                  <span className="font-bold text-slate-900">
                    {selectedNodeData.relationCount || selectedNodeData.relations.length}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Zap className="w-4 h-4 text-slate-400" /> 绑定动作
                  </div>
                  <span className="font-bold text-slate-900">
                    {selectedNodeData.actionCount || selectedNodeData.actions.length}
                  </span>
                </div>
              </div>

              {selectedNodeData.actions.some((a) => a.riskLevel === "High") && (
                <div className="mt-6 p-3 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-red-700">高风险对象</h4>
                    <p className="text-xs text-red-600 mt-1">此对象包含高风险业务动作，请注意合规管控。</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm gap-2"
                onClick={() => navigate(`/Knowledge/explorer/${selectedNodeData.id}`)}
              >
                进入对象详情 <ArrowRightCircle className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GraphGlobalView;
