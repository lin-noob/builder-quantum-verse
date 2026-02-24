import React, { useState, useCallback, useRef, useMemo } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  Node,
  Edge,
  Connection,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {
  Box,
  Zap,
  Play,
  Settings,
  Layers,
  Database,
  BrainCircuit,
  GitBranch,
  MousePointer2,
  Trash2,
  Save,
  PlayCircle,
  X,
  Plus,
  ChevronRight,
  ChevronDown,
  Terminal,
  Activity,
  Code2,
  MessageSquare,
  Workflow,
  Braces,
  Type,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

// --- Types ---

type NodeType = "trigger" | "action" | "condition" | "variable" | "ai";

interface NodeData {
  label: string;
  description?: string;
  config?: any;
  [key: string]: any;
}

// --- Custom Nodes ---

const BaseNode = ({ data, selected, icon: Icon, colorClass, typeLabel }: any) => {
  return (
    <div
      className={`
      relative min-w-[240px] rounded-xl border-2 bg-white shadow-sm transition-all
      ${selected ? "border-primary ring-2 ring-primary/20" : "border-slate-200 hover:border-slate-300"}
    `}
    >
      {/* Header */}
      <div
        className={`
        flex items-center gap-3 p-3 border-b border-slate-100 rounded-t-lg
        ${colorClass} bg-opacity-10
      `}
      >
        <div className={`p-1.5 rounded-md ${colorClass} text-white`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-900 truncate">{data.label}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{typeLabel}</div>
        </div>
        {data.status === "running" && <Activity className="w-3 h-3 text-blue-500 animate-pulse" />}
        {data.status === "completed" && <div className="w-2 h-2 rounded-full bg-green-500" />}
        {data.status === "error" && <div className="w-2 h-2 rounded-full bg-red-500" />}
      </div>

      {/* Content */}
      <div className="p-3 text-xs text-slate-500">
        {data.description || "未配置详细参数"}
        {data.config?.mapping && Object.keys(data.config.mapping).length > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-1">
            {Object.entries(data.config.mapping).map(([k, v]: any) => (
              <div key={k} className="flex items-center gap-1 font-mono text-[10px]">
                <span className="text-slate-400">{k}:</span>
                <span className="bg-slate-100 px-1 rounded text-primary truncate max-w-[120px]">{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-slate-300 hover:!bg-primary transition-colors"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-slate-300 hover:!bg-primary transition-colors"
      />
    </div>
  );
};

const TriggerNode = (props: any) => (
  <BaseNode {...props} icon={Zap} colorClass="bg-yellow-500" typeLabel="Event Trigger" />
);
const ActionNode = (props: any) => <BaseNode {...props} icon={Play} colorClass="bg-blue-600" typeLabel="Capability" />;
const ConditionNode = (props: any) => (
  <BaseNode {...props} icon={GitBranch} colorClass="bg-purple-600" typeLabel="Logic Router" />
);
const VariableNode = (props: any) => (
  <BaseNode {...props} icon={Database} colorClass="bg-green-600" typeLabel="Entity Data" />
);
const AINode = (props: any) => (
  <BaseNode {...props} icon={BrainCircuit} colorClass="bg-indigo-600" typeLabel="LLM Decision" />
);

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  variable: VariableNode,
  ai: AINode,
};

// --- Mock Data ---

const MOCK_EVENTS = [
  { id: "evt_order_created", name: "订单创建 (Order Created)" },
  { id: "evt_payment_success", name: "支付成功 (Payment Success)" },
  { id: "evt_risk_alert", name: "风控预警 (Risk Alert)" },
];

const MOCK_CAPABILITIES = [
  { id: "cap_freeze_account", name: "冻结账户", inputs: ["accountId", "reason"] },
  { id: "cap_send_email", name: "发送邮件", inputs: ["email", "subject", "content"] },
  { id: "cap_create_ticket", name: "创建工单", inputs: ["userId", "issueType"] },
  { id: "cap_update_tag", name: "更新标签", inputs: ["userId", "tag"] },
];

const MOCK_VARS = [
  { id: "var_user_level", name: "用户等级 (User.Level)" },
  { id: "var_order_amount", name: "订单金额 (Order.Amount)" },
  { id: "var_risk_score", name: "风控评分 (Risk.Score)" },
];

// --- Custom Components ---

const VariableInjector = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    if (val.endsWith("{{")) {
      setShowPicker(true);
    } else {
      // Simple logic: hide if deleted or space
      // For better UX we might want to keep it open if cursor is inside {{}}
    }
  };

  const insertVariable = (varName: string) => {
    // Replace the last {{ with {{varName}}
    const newVal = value.endsWith("{{") ? value + varName + "}}" : value.replace(/\{\{$/, `{{${varName}}}`);
    onChange(newVal);
    setShowPicker(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        className="h-7 text-xs pr-8 font-mono text-blue-600 bg-white"
        placeholder={placeholder || "{{ variable }}"}
        value={value}
        onChange={handleInputChange}
        onBlur={() => setTimeout(() => setShowPicker(false), 200)}
      />
      <div
        className="absolute right-1 top-1 text-slate-300 cursor-pointer hover:text-primary"
        onClick={() => setShowPicker(!showPicker)}
      >
        <Braces className="h-4 w-4" />
      </div>

      {showPicker && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100 max-h-48 overflow-y-auto">
          <div className="px-2 py-1.5 text-[10px] font-semibold text-slate-400 bg-slate-50 border-b">
            AVAILABLE VARIABLES
          </div>
          {MOCK_VARS.map((v) => (
            <div
              key={v.id}
              className="px-3 py-2 text-xs hover:bg-indigo-50 cursor-pointer flex items-center justify-between group"
              onClick={() => insertVariable(v.id)}
            >
              <span className="font-mono text-indigo-700">{v.id}</span>
              <div className="flex items-center gap-1">
                <Type className="h-3 w-3 text-slate-300 group-hover:text-indigo-400" />
                <span className="text-[10px] text-slate-400 group-hover:text-indigo-500">{v.name}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Main Component ---

const ProcessOrchestrationWorkbench = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

  // Debug State
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Drag & Drop
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `node_${Date.now()}`,
        type,
        position,
        data: {
          label:
            type === "trigger"
              ? "新建触发器"
              : type === "action"
                ? "新建动作"
                : type === "condition"
                  ? "逻辑判断"
                  : type === "ai"
                    ? "AI 决策"
                    : "变量操作",
          description: "拖拽生成的节点",
        },
      };

      setNodes((nds) => nds.concat(newNode));
      setSelectedNode(newNode);
    },
    [reactFlowInstance],
  );

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "smoothstep",
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          eds,
        ),
      ),
    [],
  );

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  const onEdgeClick = useCallback((_: any, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  const updateNodeData = (key: string, value: any) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          const newData = { ...node.data, [key]: value };
          if (key === "config") {
            // Update label based on selection if needed
            if (value.selectedEvent)
              newData.label = MOCK_EVENTS.find((e) => e.id === value.selectedEvent)?.name || newData.label;
            if (value.selectedCapability)
              newData.label = MOCK_CAPABILITIES.find((c) => c.id === value.selectedCapability)?.name || newData.label;
          }
          node.data = newData;
          setSelectedNode({ ...node, data: newData }); // Update local state
        }
        return node;
      }),
    );
  };

  const runDebug = () => {
    setIsRunning(true);
    setIsDebugOpen(true);
    setLogs(["[System] Starting workflow execution...", "[System] Initializing context..."]);

    // Simulate execution
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step > 5) {
        clearInterval(interval);
        setIsRunning(false);
        setLogs((prev) => [...prev, "[System] Execution completed successfully."]);
        return;
      }

      // Mock highlighting nodes
      setNodes((nds) =>
        nds.map((n, idx) => {
          if (idx === step - 1) return { ...n, data: { ...n.data, status: "completed" } };
          if (idx === step) return { ...n, data: { ...n.data, status: "running" } };
          return n;
        }),
      );

      setLogs((prev) => [
        ...prev,
        `[Step ${step}] Executing node... NodeID: node_${Date.now()}_${step}`,
        `> Output: {"status": "success", "timestamp": ${Date.now()}}`,
      ]);
    }, 1000);
  };

  return (
    <div className="flex h-full w-full bg-slate-50 overflow-hidden flex-col">
      {/* Header */}
      <header className="h-14 bg-white border-b flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Workflow className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="font-semibold text-slate-900">大额转账风控阻断流程</h1>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 font-normal">
                v1.2.0
              </Badge>
              <span>Last edited just now</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setNodes([])}>
            <Trash2 className="h-4 w-4 mr-2" /> 清空
          </Button>
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" /> 保存
          </Button>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={runDebug} disabled={isRunning}>
            {isRunning ? <Activity className="h-4 w-4 mr-2 animate-spin" /> : <PlayCircle className="h-4 w-4 mr-2" />}
            {isRunning ? "运行中..." : "运行 / 调试"}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Component Library */}
        <aside className="w-64 bg-white border-r flex flex-col shrink-0 z-10 shadow-sm">
          <div className="p-4 border-b">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Layers className="h-4 w-4" /> 组件库
            </h3>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase mb-3 px-1">Trigger</div>
                <div
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white shadow-sm cursor-grab active:cursor-grabbing hover:border-yellow-400 hover:bg-yellow-50 transition-colors"
                  onDragStart={(event) => event.dataTransfer.setData("application/reactflow", "trigger")}
                  draggable
                >
                  <div className="p-1.5 bg-yellow-500 rounded text-white">
                    <Zap className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">业务事件触发</span>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase mb-3 px-1">Logic & Control</div>
                <div className="space-y-2">
                  <div
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white shadow-sm cursor-grab active:cursor-grabbing hover:border-purple-400 hover:bg-purple-50 transition-colors"
                    onDragStart={(event) => event.dataTransfer.setData("application/reactflow", "condition")}
                    draggable
                  >
                    <div className="p-1.5 bg-purple-600 rounded text-white">
                      <GitBranch className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">条件分支 (Router)</span>
                  </div>
                  <div
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white shadow-sm cursor-grab active:cursor-grabbing hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                    onDragStart={(event) => event.dataTransfer.setData("application/reactflow", "ai")}
                    draggable
                  >
                    <div className="p-1.5 bg-indigo-600 rounded text-white">
                      <BrainCircuit className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">AI 智能决策</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase mb-3 px-1">Action & Data</div>
                <div className="space-y-2">
                  <div
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white shadow-sm cursor-grab active:cursor-grabbing hover:border-green-400 hover:bg-green-50 transition-colors"
                    onDragStart={(event) => event.dataTransfer.setData("application/reactflow", "variable")}
                    draggable
                  >
                    <div className="p-1.5 bg-green-600 rounded text-white">
                      <Database className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">读写变量</span>
                  </div>
                  <div
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white shadow-sm cursor-grab active:cursor-grabbing hover:border-blue-400 hover:bg-blue-50 transition-colors"
                    onDragStart={(event) => event.dataTransfer.setData("application/reactflow", "action")}
                    draggable
                  >
                    <div className="p-1.5 bg-blue-600 rounded text-white">
                      <Play className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">执行行为能力</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </aside>

        {/* Center: Canvas */}
        <div className="flex-1 relative bg-slate-50" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background color="#aaa" gap={16} />
            <Panel position="top-right" className="bg-white/90 p-2 rounded shadow-sm border text-xs text-slate-500">
              {nodes.length} Nodes, {edges.length} Edges
            </Panel>

            {/* Edge Data Tooltip */}
            {selectedEdge && (
              <Panel position="top-center" className="mt-12">
                <div className="bg-white/95 backdrop-blur shadow-lg border border-indigo-100 rounded-lg p-3 animate-in slide-in-from-top-2">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs font-semibold text-slate-700">Data Stream</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => setSelectedEdge(null)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase">Payload Schema</div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-100 font-mono text-[10px] text-slate-600 w-48">
                      {`{
  "traceId": "uuid",
  "timestamp": "long",
  "data": { ... }
}`}
                    </div>
                  </div>
                </div>
              </Panel>
            )}
          </ReactFlow>

          {/* Bottom Debug Panel */}
          {isDebugOpen && (
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-white border-t shadow-lg z-20 flex flex-col animate-in slide-in-from-bottom-10">
              <div className="h-10 border-b px-4 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Console / Debug Logs</span>
                </div>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setIsDebugOpen(false)}>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              <ScrollArea className="flex-1 p-4 font-mono text-xs">
                {logs.map((log, i) => (
                  <div key={i} className="mb-1 text-slate-600 border-b border-slate-50 pb-1 last:border-0">
                    <span className="text-slate-400 mr-2">{new Date().toLocaleTimeString()}</span>
                    {log}
                  </div>
                ))}
                {logs.length === 0 && <div className="text-slate-400 italic">Ready to run...</div>}
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Right: Configuration Panel */}
        <aside className="w-80 bg-white border-l flex flex-col shrink-0 z-10 shadow-sm">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Settings className="h-4 w-4" /> 属性配置
            </h3>
            {!selectedNode && <div className="text-xs text-slate-400">未选中节点</div>}
          </div>

          {selectedNode ? (
            <ScrollArea className="flex-1 p-5">
              <div className="space-y-6">
                {/* Common Props */}
                <div className="space-y-3">
                  <Label>节点名称</Label>
                  <Input
                    value={selectedNode.data.label as string}
                    onChange={(e) => updateNodeData("label", e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <Label>描述备注</Label>
                  <Textarea
                    className="h-20 text-xs"
                    value={selectedNode.data.description as string}
                    onChange={(e) => updateNodeData("description", e.target.value)}
                  />
                </div>

                <Separator />

                {/* Type Specific Props */}
                {selectedNode.type === "trigger" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-500 uppercase">选择触发事件</Label>
                      <Select
                        onValueChange={(val) =>
                          updateNodeData("config", { ...selectedNode.data.config, selectedEvent: val })
                        }
                        value={selectedNode.data.config?.selectedEvent}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择业务事件..." />
                        </SelectTrigger>
                        <SelectContent>
                          {MOCK_EVENTS.map((evt) => (
                            <SelectItem key={evt.id} value={evt.id}>
                              {evt.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {selectedNode.data.config?.selectedEvent && (
                      <div className="bg-slate-50 p-3 rounded border border-slate-100 text-xs text-slate-500">
                        Event ID:{" "}
                        <span className="font-mono text-slate-700">{selectedNode.data.config.selectedEvent}</span>
                        <br />
                        Payload: <span className="font-mono text-slate-700">{`{ orderId, amount, userId ... }`}</span>
                      </div>
                    )}
                  </div>
                )}

                {selectedNode.type === "action" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-500 uppercase">选择行为能力</Label>
                      <Select
                        onValueChange={(val) =>
                          updateNodeData("config", {
                            ...selectedNode.data.config,
                            selectedCapability: val,
                            mapping: {},
                          })
                        }
                        value={selectedNode.data.config?.selectedCapability}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择能力插件..." />
                        </SelectTrigger>
                        <SelectContent>
                          {MOCK_CAPABILITIES.map((cap) => (
                            <SelectItem key={cap.id} value={cap.id}>
                              {cap.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Variable Mapping */}
                    {selectedNode.data.config?.selectedCapability && (
                      <div className="space-y-3">
                        <Label className="text-xs font-semibold text-slate-500 uppercase flex items-center justify-between">
                          输入参数映射
                          <Badge variant="outline" className="text-[10px] font-normal">
                            Variable Mapping
                          </Badge>
                        </Label>
                        <div className="space-y-2 bg-slate-50 p-3 rounded border border-slate-100">
                          {MOCK_CAPABILITIES.find(
                            (c) => c.id === selectedNode.data.config.selectedCapability,
                          )?.inputs.map((input) => (
                            <div key={input} className="grid gap-1">
                              <span className="text-xs font-mono text-slate-600">{input}</span>
                              <VariableInjector
                                placeholder="{{ variable }}"
                                value={selectedNode.data.config?.mapping?.[input] || ""}
                                onChange={(val) => {
                                  const newMapping = { ...selectedNode.data.config?.mapping, [input]: val };
                                  updateNodeData("config", { ...selectedNode.data.config, mapping: newMapping });
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedNode.type === "condition" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-500 uppercase">分支逻辑 (IF)</Label>
                      <div className="flex items-center gap-2">
                        <Input placeholder="{{ variable }}" className="h-8 text-xs font-mono" />
                        <Select defaultValue="==">
                          <SelectTrigger className="w-[80px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="==">==</SelectItem>
                            <SelectItem value=">">&gt;</SelectItem>
                            <SelectItem value="<">&lt;</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input placeholder="Value" className="h-8 text-xs" />
                      </div>
                    </div>
                  </div>
                )}

                {selectedNode.type === "ai" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-500 uppercase">System Prompt</Label>
                      <Textarea
                        className="h-32 text-xs font-mono bg-slate-50"
                        placeholder="You are an AI assistant..."
                        defaultValue="Analyze the risk level of this transaction based on user history."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-500 uppercase">Model</Label>
                      <Select defaultValue="gpt-4">
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-4">GPT-4</SelectItem>
                          <SelectItem value="claude-3">Claude 3.5 Sonnet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <MousePointer2 className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-sm">在画布中点击节点或连线以配置参数</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ReactFlowProvider>
      <ProcessOrchestrationWorkbench />
    </ReactFlowProvider>
  );
}
