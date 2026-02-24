import React, { useState, useMemo, useCallback, useEffect } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { 
  Search, 
  Filter, 
  Clock, 
  Calendar, 
  Settings2, 
  ChevronRight, 
  ExternalLink,
  Mail,
  Globe,
  ShoppingBag,
  User,
  Package,
  ArrowRight,
  Network
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";

// --- Types ---

interface GraphSliceItem {
  id: string;
  type: "CUSTOMER_EMAIL_RECEIVED" | "CUSTOMER_WEB_ACTIVITY" | "ORDER_CREATED" | "PRODUCT_VIEW";
  time: string;
  customer: string;
  related_product?: string;
  description: string;
  source_url: string;
  nodeIds: string[]; // Related graph nodes to highlight
}

// --- Mock Data ---

const MOCK_SLICE_ITEMS: GraphSliceItem[] = [
  {
    id: "evt_001",
    type: "CUSTOMER_EMAIL_RECEIVED",
    time: "2026-01-27 10:32",
    customer: "A 公司",
    related_product: "Product A",
    description: "客户发送了新邮件询问交期",
    source_url: "https://mail.company.com/inbox/evt_001",
    nodeIds: ["node_customer", "node_email_1", "node_product_a"]
  },
  {
    id: "evt_002",
    type: "CUSTOMER_WEB_ACTIVITY",
    time: "2026-01-26 15:45",
    customer: "A 公司",
    related_product: "Product A",
    description: "客户访问了价格页并下载规格文档",
    source_url: "https://web.company.com/session/evt_002",
    nodeIds: ["node_customer", "node_web_1", "node_product_a"]
  },
  {
    id: "evt_003",
    type: "PRODUCT_VIEW",
    time: "2026-01-26 15:30",
    customer: "A 公司",
    related_product: "Product B",
    description: "查看了替代产品 Product B",
    source_url: "https://web.company.com/session/evt_003",
    nodeIds: ["node_customer", "node_web_2", "node_product_b"]
  }
];

const INITIAL_NODES: Node[] = [
  { id: 'node_customer', position: { x: 250, y: 150 }, data: { label: 'A 公司', type: 'customer' }, type: 'default', style: { background: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd', width: 100 } },
  { id: 'node_product_a', position: { x: 450, y: 50 }, data: { label: 'Product A', type: 'product' }, type: 'default', style: { background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' } },
  { id: 'node_product_b', position: { x: 450, y: 250 }, data: { label: 'Product B', type: 'product' }, type: 'default', style: { background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' } },
  { id: 'node_email_1', position: { x: 50, y: 50 }, data: { label: 'Email Inquiry', type: 'email' }, type: 'default', style: { background: '#f3e8ff', color: '#6b21a8', border: '1px solid #d8b4fe' } },
  { id: 'node_web_1', position: { x: 50, y: 150 }, data: { label: 'Web Visit (Price)', type: 'web' }, type: 'default', style: { background: '#ecfdf5', color: '#065f46', border: '1px solid #6ee7b7' } },
  { id: 'node_web_2', position: { x: 50, y: 250 }, data: { label: 'Web Visit (Prod B)', type: 'web' }, type: 'default', style: { background: '#ecfdf5', color: '#065f46', border: '1px solid #6ee7b7' } },
];

const INITIAL_EDGES: Edge[] = [
  { id: 'e1', source: 'node_email_1', target: 'node_customer', animated: true },
  { id: 'e2', source: 'node_web_1', target: 'node_customer', animated: true },
  { id: 'e3', source: 'node_web_2', target: 'node_customer', animated: true },
  { id: 'e4', source: 'node_customer', target: 'node_product_a', label: 'Inquiry' },
  { id: 'e5', source: 'node_web_1', target: 'node_product_a', label: 'View' },
  { id: 'e6', source: 'node_web_2', target: 'node_product_b', label: 'View' },
];

// --- Components ---

function SliceGraphView({ 
  highlightedNodeIds 
}: { 
  highlightedNodeIds: string[] 
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);

  // Update node styles based on highlighting
  useEffect(() => {
    setNodes(nds => nds.map(node => {
      const isHighlighted = highlightedNodeIds.length === 0 || highlightedNodeIds.includes(node.id);
      return {
        ...node,
        style: {
          ...node.style,
          opacity: isHighlighted ? 1 : 0.2,
          borderWidth: isHighlighted && highlightedNodeIds.length > 0 ? '2px' : '1px',
          fontWeight: isHighlighted && highlightedNodeIds.length > 0 ? 'bold' : 'normal',
        }
      };
    }));
    
    setEdges(eds => eds.map(edge => {
       const isConnectedToHighlighted = highlightedNodeIds.length === 0 || 
         (highlightedNodeIds.includes(edge.source) && highlightedNodeIds.includes(edge.target));
       return {
         ...edge,
         style: {
           ...edge.style,
           stroke: isConnectedToHighlighted ? '#64748b' : '#e2e8f0',
           opacity: isConnectedToHighlighted ? 1 : 0.2
         }
       };
    }));
  }, [highlightedNodeIds, setNodes, setEdges]);

  return (
    <div className="w-full h-full bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-right"
      >
        <Background color="#cbd5e1" gap={16} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}

interface GraphSliceLayerProps {
  externalHighlightId?: string | null;
}

export default function GraphSliceLayer({ externalHighlightId }: GraphSliceLayerProps) {
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  // Sync external highlight to internal state
  useEffect(() => {
    if (externalHighlightId) {
      setActiveItemId(externalHighlightId);
    }
  }, [externalHighlightId]);

  const [timeRange, setTimeRange] = useState("7d");
  const [items, setItems] = useState(MOCK_SLICE_ITEMS);
  const [isEditingRules, setIsEditingRules] = useState(false);
  const [behaviorFilters, setBehaviorFilters] = useState<string[]>(["CUSTOMER_EMAIL_RECEIVED", "CUSTOMER_WEB_ACTIVITY", "PRODUCT_VIEW"]);
  const [objectFilter, setObjectFilter] = useState<string>("全部对象");

  // Get nodes to highlight based on active item or show all
  const highlightedNodeIds = useMemo(() => {
    if (!activeItemId) return [];
    const item = items.find(i => i.id === activeItemId);
    return item ? item.nodeIds : [];
  }, [activeItemId, items]);

  const handleApplyRules = () => {
    console.log("Refreshing graph slice with rules:", { timeRange, behaviorFilters, objectFilter });
    setIsEditingRules(false);
  };

  const toggleBehaviorFilter = (type: string) => {
    setBehaviorFilters(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const timeRangeLabel = timeRange === "7d" ? "7 天" : timeRange === "14d" ? "14 天" : "30 天";

  return (
    <Card className="w-full border-slate-200 shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-md">
               <Network className="w-4 h-4" />
             </div>
             <div>
               <CardTitle className="text-base font-semibold text-slate-900">Layer 1: Graph Slice (事实切片)</CardTitle>
               <p className="text-xs text-slate-500 mt-0.5">展示 AI 决策所依据的上下文事实范围</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <Badge variant="outline" className="text-xs font-normal text-slate-500 gap-1">
               <Clock className="w-3 h-3" />
               范围: 最近 {timeRange}
             </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row h-[500px]">
          {/* Left: Graph Visualization */}
          <div className="flex-1 relative border-b lg:border-b-0 lg:border-r border-slate-200">
            <ReactFlowProvider>
              <SliceGraphView highlightedNodeIds={highlightedNodeIds} />
            </ReactFlowProvider>
            
            {/* Legend Overlay */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-lg border border-slate-200 shadow-sm text-[10px] space-y-1 z-10">
               <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-100 border border-blue-400"></div> Customer</div>
               <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-100 border border-amber-400"></div> Product</div>
               <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-100 border border-purple-400"></div> Email</div>
               <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-100 border border-emerald-400"></div> Web Activity</div>
            </div>
          </div>

          {/* Right: List & Rules */}
          <div className="w-full lg:w-[400px] flex flex-col bg-white">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Settings2 className="w-3 h-3" /> 裁剪规则
                </h4>
                <Button
                  variant="ghost"
                  size="xs"
                  className="h-6 text-[11px] text-slate-500"
                  onClick={() => setIsEditingRules(true)}
                  disabled={isEditingRules}
                >
                  修改裁剪规则
                </Button>
              </div>

              {!isEditingRules && (
                <div className="mt-2 space-y-1 text-[11px] text-slate-500">
                  <div>时间窗口：最近 {timeRangeLabel}</div>
                  <div>
                    行为类型：
                    {behaviorFilters.length === 0 ? "未选中" : behaviorFilters.length === 3 ? "全部类型" : behaviorFilters.length === 1 ? "单一类型" : "多种类型"}
                  </div>
                  <div>对象过滤：{objectFilter}</div>
                </div>
              )}

              {isEditingRules && (
                <div className="mt-3 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 mb-1 block">时间范围</label>
                      <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="h-7 text-xs bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7d">最近 7 天</SelectItem>
                          <SelectItem value="14d">最近 14 天</SelectItem>
                          <SelectItem value="30d">最近 30 天</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 mb-1 block">对象过滤</label>
                      <Select value={objectFilter} onValueChange={setObjectFilter}>
                        <SelectTrigger className="h-7 text-xs bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="全部对象">全部对象</SelectItem>
                          <SelectItem value="仅当前客户">仅当前客户</SelectItem>
                          <SelectItem value="同一产品线">同一产品线</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-500 mb-1">行为类型</div>
                    <div className="flex flex-wrap gap-3 text-[11px] text-slate-600">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <Checkbox
                          checked={behaviorFilters.includes("CUSTOMER_EMAIL_RECEIVED")}
                          onCheckedChange={() => toggleBehaviorFilter("CUSTOMER_EMAIL_RECEIVED")}
                        />
                        邮件
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <Checkbox
                          checked={behaviorFilters.includes("CUSTOMER_WEB_ACTIVITY")}
                          onCheckedChange={() => toggleBehaviorFilter("CUSTOMER_WEB_ACTIVITY")}
                        />
                        Web 行为
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <Checkbox
                          checked={behaviorFilters.includes("PRODUCT_VIEW")}
                          onCheckedChange={() => toggleBehaviorFilter("PRODUCT_VIEW")}
                        />
                        产品查看
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-slate-500"
                      onClick={() => setIsEditingRules(false)}
                    >
                      取消
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 text-xs"
                      onClick={handleApplyRules}
                    >
                      刷新
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Fact List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-50/30">
               <div className="px-2 py-1 text-xs text-slate-400 font-medium">包含事实 ({items.length})</div>
               {items.map(item => (
                 <div 
                   key={item.id}
                   className={cn(
                     "p-3 rounded-lg border transition-all cursor-pointer relative group",
                     activeItemId === item.id 
                       ? "bg-blue-50 border-blue-200 shadow-sm" 
                       : "bg-white border-slate-200 hover:border-blue-200 hover:bg-slate-50"
                   )}
                   onMouseEnter={() => setActiveItemId(item.id)}
                   onMouseLeave={() => setActiveItemId(null)}
                   onClick={() => window.open(item.source_url, '_blank')}
                 >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-1.5">
                        {item.type === 'CUSTOMER_EMAIL_RECEIVED' && <Mail className="w-3 h-3 text-purple-500" />}
                        {item.type === 'CUSTOMER_WEB_ACTIVITY' && <Globe className="w-3 h-3 text-emerald-500" />}
                        {item.type === 'PRODUCT_VIEW' && <ShoppingBag className="w-3 h-3 text-amber-500" />}
                        <span className="text-xs font-semibold text-slate-700">
                          {item.type === 'CUSTOMER_EMAIL_RECEIVED' ? '收到邮件' : 
                           item.type === 'CUSTOMER_WEB_ACTIVITY' ? '网站访问' : 
                           item.type === 'PRODUCT_VIEW' ? '查看产品' : item.type}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {format(new Date(item.time), 'HH:mm')}
                      </span>
                    </div>
                    
                    <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-1 text-[10px] text-slate-500">
                         {item.related_product && (
                           <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                             {item.related_product}
                           </span>
                         )}
                       </div>
                       
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         className="h-5 text-[10px] text-slate-400 hover:text-blue-600 px-1 opacity-0 group-hover:opacity-100 transition-opacity"
                         onClick={(e) => {
                           e.stopPropagation();
                           window.open(item.source_url, '_blank');
                         }}
                       >
                         查看 <ExternalLink className="w-2.5 h-2.5 ml-1" />
                       </Button>
                    </div>

                    {/* Active Indicator */}
                    {activeItemId === item.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg" />
                    )}
                 </div>
               ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
