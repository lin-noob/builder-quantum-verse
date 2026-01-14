import React, { useState, useRef, useMemo, useEffect } from "react";
import { 
  GitMerge, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Settings,
  X,
  Zap,
  ShieldAlert,
  RotateCcw,
  Bell,
  Box,
  LayoutTemplate,
  Search,
  Database,
  ShoppingCart,
  FileText,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Download,
  History,
  MousePointer2,
  Move
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// --- Types ---

interface Position {
  x: number;
  y: number;
}

interface StateNode {
  id: string;
  name: string;
  description?: string;
  type: "Start" | "Normal" | "End";
  position: Position;
  instanceCount: number; // Mock statistic
}

interface Transition {
  id: string;
  sourceId: string;
  targetId: string;
  capabilityId?: string;
  needsApproval: boolean;
  allowRollback: boolean;
  triggersEvent: boolean;
  type: "Normal" | "Rollback";
}

// --- Mock Capabilities for selection
const MOCK_CAPABILITIES = [
  { id: "cap_001", name: "Submit Order", code: "CAP-001" },
  { id: "cap_002", name: "Approve Order", code: "CAP-002" },
  { id: "cap_003", name: "Reject Order", code: "CAP-003" },
  { id: "cap_004", name: "Pay Order", code: "CAP-004" },
  { id: "cap_005", name: "Ship Order", code: "CAP-005" },
  { id: "cap_006", name: "Complete Order", code: "CAP-006" },
  { id: "cap_007", name: "Cancel Order", code: "CAP-007" },
];

// --- Mock Entities for Sidebar ---
type EntityType = "Master" | "Transaction" | "Result";

interface Entity {
  id: string;
  name: string;
  code: string;
  type: EntityType;
  lifecycleCompletion: number;
}

const MOCK_ENTITIES: Entity[] = [
  { id: "e1", name: "客户", code: "Customer", type: "Master", lifecycleCompletion: 80 },
  { id: "e2", name: "订单", code: "Order", type: "Transaction", lifecycleCompletion: 45 },
  { id: "e3", name: "工单", code: "Ticket", type: "Result", lifecycleCompletion: 100 },
  { id: "e4", name: "退款申请", code: "Refund", type: "Transaction", lifecycleCompletion: 20 },
  { id: "e5", name: "商品", code: "Product", type: "Master", lifecycleCompletion: 0 },
];

const EntityTypeIcon = ({ type }: { type: EntityType }) => {
  switch (type) {
    case "Master": return <Database className="h-4 w-4 text-blue-500" />;
    case "Transaction": return <ShoppingCart className="h-4 w-4 text-green-500" />;
    case "Result": return <FileText className="h-4 w-4 text-orange-500" />;
  }
};

// --- Mock Initial Data ---
const INITIAL_NODES: StateNode[] = [
  { id: "node_1", name: "Draft", type: "Start", position: { x: 100, y: 250 }, instanceCount: 120 },
  { id: "node_2", name: "Pending Approval", type: "Normal", position: { x: 400, y: 250 }, instanceCount: 45 },
  { id: "node_3", name: "Active", type: "Normal", position: { x: 700, y: 150 }, instanceCount: 890 },
  { id: "node_4", name: "Rejected", type: "End", position: { x: 700, y: 350 }, instanceCount: 12 },
];

const INITIAL_EDGES: Transition[] = [
  { 
    id: "edge_1", 
    sourceId: "node_1", 
    targetId: "node_2", 
    capabilityId: "cap_001",
    needsApproval: false,
    allowRollback: true,
    triggersEvent: true,
    type: "Normal"
  },
];

// --- Geometry Helpers ---

const NODE_WIDTH = 180;
const NODE_HEIGHT = 60;

// Calculate control points for smooth Bezier curves
const getEdgePath = (source: Position, target: Position, type: "Normal" | "Rollback") => {
  const sx = source.x + NODE_WIDTH;
  const sy = source.y + NODE_HEIGHT / 2;
  const tx = target.x;
  const ty = target.y + NODE_HEIGHT / 2;
  
  const dist = Math.abs(tx - sx);
  
  // Different curve for rollback to distinguish visually
  if (type === "Rollback") {
      const c1x = sx;
      const c1y = sy + 100;
      const c2x = tx;
      const c2y = ty + 100;
      return `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${tx} ${ty}`;
  }

  const c1x = sx + dist * 0.5;
  const c1y = sy;
  const c2x = tx - dist * 0.5;
  const c2y = ty;

  return `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${tx} ${ty}`;
};

const getEdgeCenter = (source: Position, target: Position, type: "Normal" | "Rollback") => {
    // Simplified center calculation approximation for label placement
    if (type === "Rollback") {
         const sx = source.x + NODE_WIDTH;
         const sy = source.y + NODE_HEIGHT / 2;
         const tx = target.x;
         const ty = target.y + NODE_HEIGHT / 2;
         return { x: (sx + tx) / 2, y: (sy + ty) / 2 + 75 }; // Offset label for rollback
    }

  const sx = source.x + NODE_WIDTH;
  const sy = source.y + NODE_HEIGHT / 2;
  const tx = target.x;
  const ty = target.y + NODE_HEIGHT / 2;
  return { x: (sx + tx) / 2, y: (sy + ty) / 2 };
};

// --- Component ---

const LifecycleWorkbench = () => {
  // State
  const [nodes, setNodes] = useState<StateNode[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<Transition[]>(INITIAL_EDGES);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [isLinking, setIsLinking] = useState(false);
  const [linkingSourceId, setLinkingSourceId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<Position>({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  
  // Entity Selection State
  const [selectedEntityId, setSelectedEntityId] = useState<string>("e2"); // Default to Order
  const [searchQuery, setSearchQuery] = useState("");

  const selectedEntity = useMemo(() => 
    MOCK_ENTITIES.find(e => e.id === selectedEntityId), 
    [selectedEntityId]
  );

  const groupedEntities = useMemo(() => {
    const filtered = MOCK_ENTITIES.filter(e => 
      e.name.includes(searchQuery) || 
      e.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return {
      Master: filtered.filter(e => e.type === "Master"),
      Transaction: filtered.filter(e => e.type === "Transaction"),
      Result: filtered.filter(e => e.type === "Result"),
    };
  }, [searchQuery]);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Analysis / Validation
  const validationIssues = useMemo(() => {
    const issues: string[] = [];
    
    // Check for isolated nodes
    nodes.forEach(node => {
      const hasIncoming = edges.some(e => e.targetId === node.id);
      const hasOutgoing = edges.some(e => e.sourceId === node.id);
      
      if (node.type === "Start" && !hasOutgoing) {
        issues.push(`开始状态 "${node.name}" 必须有后续路径`);
      }
      if (node.type === "Normal" && (!hasIncoming || !hasOutgoing)) {
        issues.push(`中间状态 "${node.name}" 孤立 (需有出入路径)`);
      }
      if (node.type === "End" && !hasIncoming) {
        issues.push(`结束状态 "${node.name}" 不可达`);
      }
    });

    // Check for configured edges
    edges.forEach(edge => {
      const source = nodes.find(n => n.id === edge.sourceId);
      const target = nodes.find(n => n.id === edge.targetId);
      if (!edge.capabilityId) {
        issues.push(`从 "${source?.name}" 到 "${target?.name}" 的迁移未绑定能力`);
      }
    });

    return issues;
  }, [nodes, edges]);

  // Handlers
  const handleMouseDownNode = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    if (isLinking) {
      if (linkingSourceId && linkingSourceId !== id) {
        // Complete link
        const newEdge: Transition = {
          id: `edge_${Date.now()}`,
          sourceId: linkingSourceId,
          targetId: id,
          needsApproval: false,
          allowRollback: false,
          triggersEvent: false,
          type: "Normal"
        };
        setEdges([...edges, newEdge]);
        setIsLinking(false);
        setLinkingSourceId(null);
        setSelectedEdgeId(newEdge.id);
        setSelectedNodeId(null);
      } else if (!linkingSourceId) {
        setLinkingSourceId(id);
      }
      return;
    }

    setSelectedNodeId(id);
    setSelectedEdgeId(null);
    setDraggedNodeId(id);
    
    // Calculate offset
    const node = nodes.find(n => n.id === id);
    if (node && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / scale;
      const mouseY = (e.clientY - rect.top) / scale;
      setDragOffset({
        x: mouseX - node.position.x,
        y: mouseY - node.position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;
      setMousePos({ x, y });

      if (draggedNodeId) {
        setNodes(nodes.map(n => {
          if (n.id === draggedNodeId) {
            return {
              ...n,
              position: {
                x: x - dragOffset.x,
                y: y - dragOffset.y
              }
            };
          }
          return n;
        }));
      }
    }
  };

  const handleMouseUp = () => {
    setDraggedNodeId(null);
  };

  const handleCanvasClick = () => {
    if (isLinking) {
      setIsLinking(false);
      setLinkingSourceId(null);
    }
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  };

  const handleAddNode = () => {
    const newNode: StateNode = {
      id: `node_${Date.now()}`,
      name: "New State",
      type: "Normal",
      position: { x: 100, y: 100 },
      instanceCount: 0
    };
    setNodes([...nodes, newNode]);
    setSelectedNodeId(newNode.id);
  };

  const handleDeleteSelected = () => {
    if (selectedNodeId) {
      setNodes(nodes.filter(n => n.id !== selectedNodeId));
      setEdges(edges.filter(e => e.sourceId !== selectedNodeId && e.targetId !== selectedNodeId));
      setSelectedNodeId(null);
    }
    if (selectedEdgeId) {
      setEdges(edges.filter(e => e.id !== selectedEdgeId));
      setSelectedEdgeId(null);
    }
  };

  const handleClearAll = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  };

  const handleUpdateNode = (key: keyof StateNode, value: any) => {
    if (selectedNodeId) {
      setNodes(nodes.map(n => n.id === selectedNodeId ? { ...n, [key]: value } : n));
    }
  };

  const handleUpdateEdge = (key: keyof Transition, value: any) => {
    if (selectedEdgeId) {
      setEdges(edges.map(e => e.id === selectedEdgeId ? { ...e, [key]: value } : e));
    }
  };

  // Render Helpers
  const renderEdge = (edge: Transition) => {
    const source = nodes.find(n => n.id === edge.sourceId);
    const target = nodes.find(n => n.id === edge.targetId);
    if (!source || !target) return null;

    const path = getEdgePath(source.position, target.position, edge.type);
    const center = getEdgeCenter(source.position, target.position, edge.type);
    const isSelected = selectedEdgeId === edge.id;

    return (
      <g key={edge.id} onClick={(e) => { e.stopPropagation(); setSelectedEdgeId(edge.id); setSelectedNodeId(null); }}>
        <path 
          d={path} 
          fill="none" 
          stroke={isSelected ? "#2563eb" : edge.type === 'Rollback' ? "#ef4444" : "#94a3b8"} 
          strokeWidth={isSelected ? 3 : 2}
          strokeDasharray={edge.type === 'Rollback' ? "5,5" : "0"}
          markerEnd={edge.type === 'Rollback' ? "url(#arrowhead-red)" : "url(#arrowhead)"}
          className="cursor-pointer hover:stroke-blue-400 transition-colors"
        />
        {/* Clickable Area */}
        <path 
          d={path} 
          fill="none" 
          stroke="transparent" 
          strokeWidth={15}
          className="cursor-pointer"
        />
        {/* Label Badge */}
        <foreignObject x={center.x - 60} y={center.y - 12} width={120} height={24}>
          <div className={`flex justify-center items-center h-full`}>
            <span className={cn(
              "text-[10px] px-2 py-0.5 rounded-full border bg-white truncate max-w-full shadow-sm",
              isSelected ? "border-blue-500 text-blue-700" : "border-gray-200 text-gray-500",
              !edge.capabilityId && "border-red-200 bg-red-50 text-red-600",
              edge.type === 'Rollback' && !isSelected && "border-red-200 text-red-600"
            )}>
              {edge.capabilityId ? MOCK_CAPABILITIES.find(c => c.id === edge.capabilityId)?.name : "未绑定能力"}
            </span>
          </div>
        </foreignObject>
      </g>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* 1. Global Header */}
      <header className="h-14 border-b flex items-center px-6 justify-between shrink-0 bg-white z-20">
        <div className="flex items-center gap-2">
          <RotateCcw className="h-5 w-5 text-primary" />
          <h1 className="font-semibold text-lg">生命周期工作台</h1>
        </div>
        
        {/* Progress & Actions */}
        <div className="flex items-center gap-6 flex-1 justify-end">
            {selectedEntity && (
                 <div className="flex items-center gap-3 w-64">
                    <span className="text-xs text-gray-500">完整度</span>
                    <Progress value={selectedEntity.lifecycleCompletion} className="h-2" />
                    <span className="text-xs font-medium text-gray-700">{selectedEntity.lifecycleCompletion}%</span>
                 </div>
            )}
            <Separator orientation="vertical" className="h-6" />
            <Button variant="outline" size="sm" className="gap-2">
                <History className="h-4 w-4" />
                版本管理
            </Button>
            <Button size="sm" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                发布模型
            </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* 2. Left: Navigator (Narrower Sidebar) */}
        <aside className="w-64 border-r bg-gray-50/50 flex flex-col shrink-0">
            <div className="p-3 border-b">
                 <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-3 w-3 text-gray-400" />
                    <Input 
                      placeholder="搜索对象..." 
                      className="pl-8 h-8 text-xs" 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                 </div>
            </div>
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-4">
              {[
                { type: "Master", label: "主数据", list: groupedEntities.Master },
                { type: "Transaction", label: "交易", list: groupedEntities.Transaction },
                { type: "Result", label: "结果", list: groupedEntities.Result },
              ].map(group => (
                <div key={group.type}>
                  <h3 className="text-[10px] font-semibold text-gray-400 uppercase mb-2 px-2">
                    {group.label}
                  </h3>
                  <div className="space-y-0.5">
                    {group.list.map(entity => (
                      <button
                        key={entity.id}
                        onClick={() => setSelectedEntityId(entity.id)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-3 transition-colors",
                          selectedEntityId === entity.id 
                            ? "bg-white shadow-sm ring-1 ring-primary/20 text-primary font-medium" 
                            : "hover:bg-gray-100 text-gray-600"
                        )}
                      >
                        <EntityTypeIcon type={entity.type} />
                        <span className="flex-1 truncate">{entity.name}</span>
                        {selectedEntityId === entity.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* 3. Middle: Visual Canvas */}
        <main className="flex-1 flex flex-col bg-white relative min-w-0">
          {/* Canvas Toolbar */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
             <div className="bg-white rounded-lg shadow-md border p-1 flex flex-col gap-1">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setScale(s => Math.min(s + 0.1, 2))}>
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">放大</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setScale(s => Math.max(s - 0.1, 0.5))}>
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">缩小</TooltipContent>
                    </Tooltip>
                    <Separator className="my-1" />
                     <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setScale(1); /* Reset Pos Logic */ }}>
                                <Maximize className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">适应画布</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
             </div>
             
             <div className="bg-white rounded-lg shadow-md border p-1 flex flex-col gap-1">
                 <TooltipProvider>
                     <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant={isLinking ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setIsLinking(!isLinking)}>
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">连接工具</TooltipContent>
                     </Tooltip>
                     <Tooltip>
                        <TooltipTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleAddNode}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">添加节点</TooltipContent>
                     </Tooltip>
                 </TooltipProvider>
             </div>
          </div>

          {/* Canvas Area */}
          <div 
            ref={canvasRef}
            className="flex-1 bg-slate-50 relative overflow-hidden cursor-grab active:cursor-grabbing"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onClick={handleCanvasClick}
            style={{ 
               backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)", 
               backgroundSize: "24px 24px" 
            }}
          >
            <div style={{ transform: `scale(${scale})`, transformOrigin: "0 0", width: "100%", height: "100%" }}>
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                    </marker>
                    <marker id="arrowhead-red" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
                    </marker>
                </defs>
                {edges.map(renderEdge)}
                {isLinking && linkingSourceId && (
                    <path 
                    d={getEdgePath(
                        nodes.find(n => n.id === linkingSourceId)!.position, 
                        { x: mousePos.x - NODE_WIDTH/2, y: mousePos.y - NODE_HEIGHT/2 },
                        "Normal"
                    )}
                    fill="none" 
                    stroke="#cbd5e1" 
                    strokeWidth="2" 
                    strokeDasharray="5,5"
                    />
                )}
                </svg>

                {nodes.map(node => (
                <div
                    key={node.id}
                    className={cn(
                    "absolute rounded-xl border-2 shadow-sm p-0 flex flex-col select-none transition-all group bg-white",
                    "w-[180px]",
                    node.type === "Start" ? "border-green-200" : 
                    node.type === "End" ? "border-slate-300 bg-slate-50" : "border-blue-200",
                    selectedNodeId === node.id ? "ring-2 ring-primary ring-offset-2 border-transparent shadow-md" : "hover:border-blue-300 hover:shadow-md",
                    isLinking && linkingSourceId === node.id && "ring-2 ring-dashed ring-blue-400"
                    )}
                    style={{ 
                        left: node.position.x, 
                        top: node.position.y 
                    }}
                    onMouseDown={(e) => handleMouseDownNode(e, node.id)}
                >
                    <div className={cn(
                        "px-3 py-2 text-xs font-semibold rounded-t-[10px] flex justify-between items-center",
                        node.type === "Start" ? "bg-green-50 text-green-700" :
                        node.type === "End" ? "bg-slate-100 text-slate-600" : "bg-blue-50 text-blue-700"
                    )}>
                        <span>{node.type}</span>
                        {node.type === 'Start' && <Zap className="h-3 w-3" />}
                    </div>
                    <div className="p-3 text-center">
                        <div className="text-sm font-bold text-gray-800 truncate" title={node.name}>{node.name}</div>
                        <div className="text-[10px] text-gray-400 mt-1 flex justify-center gap-1">
                             <Box className="h-3 w-3" /> {node.instanceCount} 实例
                        </div>
                    </div>
                </div>
                ))}
            </div>
          </div>
          
          {/* Bottom Floating Validation Panel */}
           {validationIssues.length > 0 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 w-auto max-w-2xl">
                 <div className="bg-white/90 backdrop-blur border border-red-200 shadow-lg rounded-full px-4 py-2 flex items-center gap-4 animate-in slide-in-from-bottom-4">
                     <div className="flex items-center gap-2">
                        <div className="bg-red-100 p-1 rounded-full">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                        </div>
                        <span className="text-sm font-medium text-red-800">发现 {validationIssues.length} 个配置问题</span>
                     </div>
                     <Separator orientation="vertical" className="h-4" />
                     <div className="flex items-center gap-2">
                         <Button size="sm" variant="ghost" className="h-6 text-xs text-red-600 hover:text-red-700 hover:bg-red-50">
                             查看详情
                         </Button>
                         <Button size="sm" className="h-6 text-xs bg-red-600 hover:bg-red-700 border-none rounded-full px-3">
                             一键修复
                         </Button>
                     </div>
                 </div>
              </div>
           )}

        </main>

        {/* 4. Right: Properties Panel (Sticky Sidebar) */}
        <div className="w-[320px] border-l bg-white shadow-xl z-20 flex flex-col h-full">
            {selectedNodeId ? (
                // --- Node Configuration ---
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b bg-gray-50/50">
                        <div className="flex items-center gap-2 mb-1">
                           <LayoutTemplate className="h-4 w-4 text-primary" />
                           <span className="font-semibold text-sm">节点配置</span>
                        </div>
                        <p className="text-xs text-gray-500">配置状态属性与准入规则</p>
                    </div>
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-xs text-gray-500">基础信息</Label>
                                <div className="space-y-3">
                                    <div>
                                        <Label className="text-xs mb-1 block">状态名称</Label>
                                        <Input 
                                            value={nodes.find(n => n.id === selectedNodeId)?.name} 
                                            onChange={(e) => handleUpdateNode("name", e.target.value)}
                                            className="h-8"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs mb-1 block">状态类型</Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['Start', 'Normal', 'End'].map(type => (
                                                <div 
                                                    key={type}
                                                    onClick={() => handleUpdateNode("type", type)}
                                                    className={cn(
                                                        "cursor-pointer text-center py-2 rounded border text-xs transition-all",
                                                        nodes.find(n => n.id === selectedNodeId)?.type === type 
                                                            ? "bg-primary/5 border-primary text-primary font-medium" 
                                                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                                    )}
                                                >
                                                    {type}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-xs mb-1 block">描述</Label>
                                        <Input 
                                            value={nodes.find(n => n.id === selectedNodeId)?.description || ""} 
                                            onChange={(e) => handleUpdateNode("description", e.target.value)}
                                            className="h-8 text-xs"
                                            placeholder="状态描述..."
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <Separator />

                            <div className="space-y-3">
                                <Label className="text-xs text-gray-500">准入规则 (Entry Rules)</Label>
                                <div className="bg-gray-50 border border-dashed rounded-lg p-4 text-center">
                                    <p className="text-xs text-gray-400 mb-2">暂无规则</p>
                                    <Button variant="outline" size="sm" className="h-7 text-xs">
                                        <Plus className="h-3 w-3 mr-1" /> 添加规则
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                    <div className="p-4 border-t bg-gray-50/50 flex justify-between">
                         <Button variant="outline" size="sm" onClick={() => setSelectedNodeId(null)}>取消</Button>
                         <Button size="sm">保存配置</Button>
                    </div>
                </div>
            ) : selectedEdgeId ? (
                // --- Edge Configuration ---
                <div className="flex flex-col h-full">
                     <div className="p-4 border-b bg-gray-50/50">
                        <div className="flex items-center gap-2 mb-1">
                           <GitMerge className="h-4 w-4 text-primary" />
                           <span className="font-semibold text-sm">流转配置</span>
                        </div>
                        <p className="text-xs text-gray-500">定义状态迁移条件与触发动作</p>
                    </div>
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-6">
                            {/* Capability */}
                            <div className="space-y-3">
                                <Label className="text-xs text-gray-500 flex items-center gap-1">
                                    <Zap className="h-3 w-3" /> 触发能力
                                </Label>
                                <Select 
                                    value={edges.find(e => e.id === selectedEdgeId)?.capabilityId || ""} 
                                    onValueChange={(v) => handleUpdateEdge("capabilityId", v)}
                                >
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="选择能力..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MOCK_CAPABILITIES.map(cap => (
                                            <SelectItem key={cap.id} value={cap.id} className="text-xs">
                                                <span className="font-mono text-gray-400 mr-2">{cap.code}</span>
                                                {cap.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Separator />

                            {/* Conditions */}
                            <div className="space-y-3">
                                <Label className="text-xs text-gray-500">流转控制</Label>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-2 rounded border bg-white">
                                        <Label className="text-xs cursor-pointer">需要审批</Label>
                                        <Switch 
                                            checked={edges.find(e => e.id === selectedEdgeId)?.needsApproval}
                                            onCheckedChange={(c) => handleUpdateEdge("needsApproval", c)}
                                            className="scale-75"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-2 rounded border bg-white">
                                        <Label className="text-xs cursor-pointer">异常回滚路径</Label>
                                        <Switch 
                                            checked={edges.find(e => e.id === selectedEdgeId)?.type === 'Rollback'}
                                            onCheckedChange={(c) => handleUpdateEdge("type", c ? 'Rollback' : 'Normal')}
                                            className="scale-75"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-2 rounded border bg-white">
                                        <Label className="text-xs cursor-pointer">触发事件广播</Label>
                                        <Switch 
                                            checked={edges.find(e => e.id === selectedEdgeId)?.triggersEvent}
                                            onCheckedChange={(c) => handleUpdateEdge("triggersEvent", c)}
                                            className="scale-75"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                    <div className="p-4 border-t bg-gray-50/50 flex justify-between">
                         <Button variant="outline" size="sm" onClick={() => setSelectedEdgeId(null)}>取消</Button>
                         <Button size="sm">保存配置</Button>
                    </div>
                </div>
            ) : (
                // --- Empty State ---
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-400">
                    <MousePointer2 className="h-10 w-10 mb-4 opacity-20" />
                    <h3 className="text-sm font-medium text-gray-600">属性面板</h3>
                    <p className="text-xs mt-1">点击画布中的<br/>节点或连线以配置详情</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default LifecycleWorkbench;
