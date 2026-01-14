import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Save, 
  RotateCcw, 
  Plus, 
  MoreHorizontal, 
  AlertTriangle, 
  Zap, 
  Box, 
  Activity,
  ArrowRight,
  Code,
  Layout as LayoutIcon,
  Database,
  Shield,
  GitBranch,
  Play,
  Pencil,
  Trash2,
  GripVertical
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription, 
  SheetFooter 
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Connection,
  Edge,
  ReactFlowProvider,
  Panel,
  Node
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// --- Types ---

interface Field {
  name: string;
  type: string;
  description: string;
  required?: boolean;
  defaultValue?: any;
  validation?: string; // e.g. "min:0, max:100"
}

interface Entity {
  id: string;
  name: string;
  description: string;
  fields: Field[];
  relationships?: { targetEntityId: string; type: 'hasOne' | 'hasMany' | 'belongsTo'; description: string }[];
  lifecycleStates?: string[]; // e.g. ["Created", "Paid", "Shipped", "Completed", "Cancelled"]
}

interface Rule {
  id: string;
  name: string;
  description: string;
  trigger: string; // e.g. "Order.Created"
  action: string;  // e.g. "BlockOrder"
  actionConfig?: Record<string, any>; // Configuration params for the action
  priority: number; // Execution order
  severity: 'critical' | 'warning' | 'info';
  condition: string; // Logic expression e.g., "Order.amount > 5000 && User.riskScore > 0.8"
  enabled: boolean;
}

interface Capability {
  id: string;
  name: string;
  description: string;
  type: 'system' | 'integration' | 'human' | 'ai'; // Type of capability
  inputs: { name: string; type: string; required: boolean }[];
  outputs: { name: string; type: string }[];
  apiEndpoint?: string;
  sideEffects?: string[]; // Description of side effects e.g. "Sends email", "Updates inventory"
}

 

interface Trigger {
  id: string;
  name: string;
  description: string;
  event: string; // e.g. "Ticket.Created"
  payloadSchema: Record<string, string>; // e.g. { "ticketId": "string" }
}

interface Workflow {
  id: string;
  name: string;
  trigger: string;
  triggerId?: string; // Link to Trigger definition
  description: string;
  nodes: Node[];
  edges: Edge[];
}

interface BusinessModel {
  name: string;
  status: 'Draft' | 'Active' | 'Archived';
  definitions: {
    entities: Entity[];
    rules: Rule[];
    workflows: Workflow[];
  };
  actions: Capability[];
  triggers: Trigger[];
}

// --- Mock Data (Global Assets Library) ---

const mockGlobalAssets = {
  triggers: [
    {
      id: "t1",
      name: "新工单创建 (Ticket.Created)",
      description: "当新的客诉或催收工单被创建时触发。",
      event: "Ticket.Created",
      payloadSchema: { "ticketId": "string", "type": "enum", "content": "string" }
    },
    {
      id: "t2",
      name: "工单状态更新 (Ticket.Updated)",
      description: "当工单的状态发生变更时触发（如客户回复、状态流转）。",
      event: "Ticket.Updated",
      payloadSchema: { "ticketId": "string", "field": "string", "oldValue": "any", "newValue": "any" }
    },
    {
      id: "t3",
      name: "每日催收扫描 (Dunning.ScheduledCheck)",
      description: "系统每日定时扫描所有逾期订单。",
      event: "Dunning.ScheduledCheck",
      payloadSchema: { "batchId": "string", "scanDate": "date" }
    },
    {
      id: "t4",
      name: "收到还款通知 (Payment.Received)",
      description: "支付网关确认收到客户还款时触发。",
      event: "Payment.Received",
      payloadSchema: { "orderId": "string", "amount": "decimal", "transactionId": "string" }
    }
  ],
  entities: [
    {
      id: "e1",
      name: "Ticket (客诉 / 催单工单)",
      description: "触发一切的核心实体，记录客诉或催单任务。",
      fields: [
        { name: "ticketId", type: "string", description: "工单唯一标识", required: true },
        { name: "type", type: "enum", description: "Complaint / Dunning", required: true },
        { name: "source", type: "enum", description: "Email / Chat / Call", required: false },
        { name: "content", type: "string", description: "原始投诉/催单内容", required: true },
        { name: "sentiment", type: "string", description: "情绪分析结果", required: false },
        { name: "priority", type: "enum", description: "优先级", required: false },
        { name: "status", type: "enum", description: "Open / InProgress / Closed", required: true, defaultValue: "Open" },
        { name: "createdAt", type: "datetime", description: "创建时间", required: true }
      ],
      relationships: [
        { targetEntityId: "e2", type: "belongsTo", description: "关联客户" },
        { targetEntityId: "e3", type: "belongsTo", description: "关联订单" }
      ],
      lifecycleStates: ["Open", "InProgress", "Closed"]
    },
    {
      id: "e2",
      name: "Customer (客户)",
      description: "客户全景视图。",
      fields: [
        { name: "customerId", type: "string", description: "客户 ID", required: true },
        { name: "email", type: "string", description: "用于匹配邮件", required: true },
        { name: "level", type: "enum", description: "VIP / Normal", required: false },
        { name: "riskLevel", type: "string", description: "风险等级", required: false },
        { name: "historicalComplaints", type: "int", description: "历史投诉次数", defaultValue: 0 }
      ],
      relationships: [
        { targetEntityId: "e1", type: "hasMany", description: "历史工单" }
      ]
    },
    {
      id: "e3",
      name: "Order (订单)",
      description: "涉及的交易订单。",
      fields: [
        { name: "orderId", type: "string", description: "订单号", required: true },
        { name: "status", type: "enum", description: "Paid / Shipped / Delivered", required: true },
        { name: "expectedDeliveryDate", type: "date", description: "预计交付", required: false },
        { name: "actualDeliveryDate", type: "date", description: "实际交付", required: false },
        { name: "amount", type: "decimal", description: "金额", required: true }
      ],
      relationships: []
    }
  ],
  rules: [
    {
      id: "r1",
      name: "自动退款检查 (AutoRefundCheck)",
      description: "对于信用良好的客户，小额争议直接自动退款以提升体验。",
      trigger: "Ticket.Created (Complaint)",
      action: "IssueRefund",
      actionConfig: { "maxAmount": 50, "reason": "Low value auto-refund" },
      priority: 1,
      severity: "info",
      condition: "Order.amount < 50 && Customer.creditScore > 700",
      enabled: true
    },
    {
      id: "r2",
      name: "高优客诉识别 (HighPriorityComplaint)",
      description: "检测到客户情绪极度不满时，立即提升工单优先级。",
      trigger: "Ticket.Updated (SentimentAnalysis)",
      action: "EscalateToHuman",
      actionConfig: { "urgency": "Immediate", "team": "Senior Support" },
      priority: 1,
      severity: "critical",
      condition: "Customer.sentimentScore < -0.5",
      enabled: true
    },
    {
      id: "r3",
      name: "逾期升级策略 (DunningEscalation)",
      description: "逾期超过30天，移交人工催收专家处理。",
      trigger: "Dunning.Check",
      action: "EscalateToHuman",
      actionConfig: { "urgency": "High", "team": "Legal Collection" },
      priority: 2,
      severity: "warning",
      condition: "Order.daysOverdue > 30",
      enabled: true
    },
    {
      id: "r4",
      name: "标准催收策略 (StandardDunning)",
      description: "逾期7-30天内，由AI进行标准流程催收。",
      trigger: "Dunning.Check",
      action: "MakeDunningCall",
      actionConfig: { "script": "Standard_Reminder_v2", "maxRetries": 3 },
      priority: 3,
      severity: "info",
      condition: "Order.daysOverdue > 7 && Order.daysOverdue <= 30",
      enabled: true
    },
    {
      id: "r5",
      name: "频繁投诉检测 (FrequentComplainer)",
      description: "识别过去30天内提交超过5次投诉的客户。",
      trigger: "Ticket.Created",
      action: "FlagAccount",
      actionConfig: { "flagType": "AbuseMonitor", "duration": "30d" },
      priority: 2,
      severity: "warning",
      condition: "Customer.complaintCountLast30Days > 5",
      enabled: true
    },
    {
      id: "r6",
      name: "VIP 极速通道 (VIPFastTrack)",
      description: "VIP客户投诉直接转人工高级客服。",
      trigger: "Ticket.Created",
      action: "EscalateToHuman",
      actionConfig: { "team": "VIP Support", "sla": "30m" },
      priority: 0,
      severity: "info",
      condition: "Customer.level == 'VIP'",
      enabled: true
    },
    {
      id: "r7",
      name: "高风险自动退款拦截 (RiskBlockRefund)",
      description: "高风险客户禁止自动退款，强制人工审核。",
      trigger: "Ticket.Created (RefundRequest)",
      action: "EscalateToHuman",
      actionConfig: { "reason": "High Risk Customer", "action": "Manual Review" },
      priority: 0,
      severity: "warning",
      condition: "Customer.riskLevel == 'High'",
      enabled: true
    },
    {
      id: "r8",
      name: "承诺还款暂停 (PTPPause)",
      description: "客户承诺还款后，暂停催收动作。",
      trigger: "Dunning.Check",
      action: "SkipAction",
      actionConfig: { "reason": "Promise to Pay active" },
      priority: 1,
      severity: "info",
      condition: "DunningRecord.lastOutcome == 'PromiseToPay' && Date.now() < DunningRecord.promiseDate",
      enabled: true
    },
    {
      id: "r9",
      name: "多次失联升级 (UnreachableEscalation)",
      description: "连续3次未接通，切换短信触达。",
      trigger: "Call.Completed",
      action: "SendSMS",
      actionConfig: { "template": "Urgent_Contact_Request" },
      priority: 2,
      severity: "warning",
      condition: "DunningRecord.consecutiveNoAnswer >= 3",
      enabled: true
    }
  ],
  actions: [
    {
      id: "c1",
      name: "CheckOrderStatus (查订单)",
      description: "查询订单的实时状态和物流信息。",
      type: "system",
      inputs: [{ name: "orderId", type: "string", required: true }],
      outputs: [{ name: "status", type: "string" }, { name: "logistics", type: "json" }],
      apiEndpoint: "GET /api/orders/{orderId}",
      sideEffects: []
    },
    {
      id: "c2",
      name: "IssueRefund (执行退款)",
      description: "调用支付网关执行退款操作。",
      type: "system",
      inputs: [{ name: "orderId", type: "string", required: true }, { name: "amount", type: "decimal", required: true }, { name: "reason", type: "string", required: true }],
      outputs: [{ name: "refundId", type: "string" }, { name: "newStatus", type: "string" }],
      apiEndpoint: "POST /api/payment/refund",
      sideEffects: ["Updates Order Status", "Sends Notification"]
    },
    {
      id: "c3",
      name: "SendApologyEmail (发道歉邮件)",
      description: "向客户发送包含个性化安抚内容的邮件。",
      type: "integration",
      inputs: [{ name: "customerId", type: "string", required: true }, { name: "content", type: "string", required: true }],
      outputs: [{ name: "emailId", type: "string" }],
      apiEndpoint: "POST /api/comm/email/send",
      sideEffects: ["Sends Email"]
    },
    {
      id: "c4",
      name: "SendSMS (发短信)",
      description: "发送标准格式的短信通知。",
      type: "integration",
      inputs: [{ name: "phoneNumber", type: "string", required: true }, { name: "content", type: "string", required: true }],
      outputs: [{ name: "messageId", type: "string" }],
      apiEndpoint: "POST /api/comm/sms/send",
      sideEffects: ["Sends SMS"]
    },
    {
      id: "c5",
      name: "MakeDunningCall (催款电话)",
      description: "发起 AI 语音通话进行催收。",
      type: "ai",
      inputs: [{ name: "customerId", type: "string", required: true }, { name: "scriptId", type: "string", required: true }],
      outputs: [{ name: "callId", type: "string" }, { name: "transcript", type: "string" }, { name: "outcome", type: "string" }],
      apiEndpoint: "POST /api/ai/voice/call",
      sideEffects: ["Initiates Call"]
    },
    {
      id: "c6",
      name: "EscalateToHuman (转人工)",
      description: "将任务分配给人工客服处理。",
      type: "human",
      inputs: [{ name: "ticketId", type: "string", required: true }, { name: "reason", type: "string", required: true }, { name: "team", type: "string", required: false }],
      outputs: [{ name: "assignmentId", type: "string" }],
      apiEndpoint: "POST /api/ticket/escalate",
      sideEffects: ["Creates Task"]
    }
  ]
};

const initialModel: BusinessModel = {
  name: "智能客诉与催单处理模型",
  status: "Draft",
  definitions: {
    // Initial model uses a subset of global assets
    entities: [mockGlobalAssets.entities[0], mockGlobalAssets.entities[1], mockGlobalAssets.entities[2]], 
    rules: [mockGlobalAssets.rules[0], mockGlobalAssets.rules[1], mockGlobalAssets.rules[2], mockGlobalAssets.rules[3]],
    workflows: [
      {
        id: "wf1",
        name: "Standard Complaint Resolution (标准客诉处理)",
        trigger: "New Complaint Ticket Created",
        triggerId: "t1",
        description: "处理客户投诉的标准流程，包含自动退款判断与人工升级。",
        nodes: [
          { id: "n1", type: "default", position: { x: 50, y: 150 }, data: { label: "1. 收到投诉工单 (Trigger)" } },
          { id: "n2", type: "default", position: { x: 250, y: 150 }, data: { label: "2. 情感分析 (System)" } },
          { id: "n3", type: "default", position: { x: 450, y: 50 }, data: { label: "3a. 高优客诉升级 (Rule: HighPriority)" } },
          { id: "n4", type: "default", position: { x: 450, y: 250 }, data: { label: "3b. 一般投诉处理 (Action)" } },
          { id: "n5", type: "default", position: { x: 650, y: 50 }, data: { label: "4a. 转人工处理 (Action)" } },
          { id: "n6", type: "default", position: { x: 650, y: 250 }, data: { label: "4b. 自动退款检查 (Rule: AutoRefund)" } },
          { id: "n7", type: "default", position: { x: 850, y: 150 }, data: { label: "5a. 执行退款 (Action)" } },
          { id: "n8", type: "default", position: { x: 850, y: 350 }, data: { label: "5b. 发送安抚邮件 (Action)" } },
          { id: "n9", type: "default", position: { x: 1050, y: 250 }, data: { label: "6. 结单 (System)" } }
        ],
        edges: [
          { id: "e1-2", source: "n1", target: "n2" },
          { id: "e2-3", source: "n2", target: "n3", label: "Negative Sentiment" },
          { id: "e2-4", source: "n2", target: "n4", label: "Normal" },
          { id: "e3-5", source: "n3", target: "n5" },
          { id: "e4-6", source: "n4", target: "n6" },
          { id: "e6-7", source: "n6", target: "n7", label: "Approved" },
          { id: "e6-8", source: "n6", target: "n8", label: "Manual Review Needed" },
          { id: "e7-9", source: "n7", target: "n9" },
          { id: "e8-9", source: "n8", target: "n9" }
        ]
      },
      {
        id: "wf2",
        name: "Overdue Payment Dunning (逾期催收流程)",
        trigger: "Daily Dunning Check Job",
        triggerId: "t3",
        description: "针对不同逾期时长的自动化催收策略。",
        nodes: [
          { id: "d1", type: "default", position: { x: 50, y: 150 }, data: { label: "1. 每日逾期扫描 (Trigger)" } },
          { id: "d2", type: "default", position: { x: 250, y: 150 }, data: { label: "2. 逾期时长判断 (Rule)" } },
          { id: "d3", type: "default", position: { x: 450, y: 50 }, data: { label: "3a. >30天: 转人工 (Rule: Escalation)" } },
          { id: "d4", type: "default", position: { x: 450, y: 250 }, data: { label: "3b. 7-30天: 标准催收 (Rule: Standard)" } },
          { id: "d5", type: "default", position: { x: 650, y: 50 }, data: { label: "4a. 分配催收专员 (Action)" } },
          { id: "d6", type: "default", position: { x: 650, y: 250 }, data: { label: "4b. 语音外呼 (Action)" } },
          { id: "d7", type: "default", position: { x: 850, y: 250 }, data: { label: "5. 更新催收记录 (System)" } }
        ],
        edges: [
          { id: "ed1-2", source: "d1", target: "d2" },
          { id: "ed2-3", source: "d2", target: "d3", label: "> 30 Days" },
          { id: "ed2-4", source: "d2", target: "d4", label: "7-30 Days" },
          { id: "ed3-5", source: "d3", target: "d5" },
          { id: "ed4-6", source: "d4", target: "d6" },
          { id: "ed6-7", source: "d6", target: "d7" }
        ]
      }
    ]
  },
  actions: [mockGlobalAssets.actions[0], mockGlobalAssets.actions[1], mockGlobalAssets.actions[2], mockGlobalAssets.actions[3], mockGlobalAssets.actions[4], mockGlobalAssets.actions[5]],
  triggers: mockGlobalAssets.triggers
};

// --- Sub Components ---

const WorkflowEditor = ({ 
  workflow, 
  onSave, 
  definitions,
  triggers
}: { 
  workflow: Workflow, 
  onSave: (nodes: Node[], edges: Edge[], triggerId?: string) => void,
  definitions: { entities: Entity[], rules: Rule[], actions: Capability[] },
  triggers: Trigger[]
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(workflow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(workflow.edges);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [triggerDialogOpen, setTriggerDialogOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Update local state when workflow changes
  useEffect(() => {
    setNodes(workflow.nodes);
    setEdges(workflow.edges);
  }, [workflow.id]);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  const onDragStart = (event: React.DragEvent, nodeType: string, item: any) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, item }));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      
      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const dataStr = event.dataTransfer.getData('application/reactflow');
      
      if (!dataStr || !reactFlowBounds) return;

      const { type, item } = JSON.parse(dataStr);
      
      // Calculate position relative to the canvas
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const isAction = type === 'Action';
      const newNode: Node = {
        id: `${type}-${item.id}-${Math.random().toString(36).substr(2, 5)}`,
        type: 'default',
        position,
        data: { 
          label: `${item.name} (${type})`,
          nodeType: type,
          action: isAction ? item.name : undefined,
          executor: undefined
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onNodeClick = useCallback((_e: any, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);


  // Save changes to parent
  useEffect(() => {
    onSave(nodes, edges, workflow.triggerId);
  }, [nodes, edges, onSave, workflow.triggerId]);

  const handleTriggerSelect = (triggerId: string) => {
    onSave(nodes, edges, triggerId);
    setTriggerDialogOpen(false);
  };

  const currentTrigger = triggers.find(t => t.id === workflow.triggerId) || triggers.find(t => t.name === workflow.trigger); // Fallback for mock strings

  return (
    <div className="flex flex-col h-full min-h-0 border rounded-lg overflow-hidden bg-slate-50">
      
      {/* Trigger Header Configuration */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-4 shadow-sm z-10">
         <span className="text-xs font-semibold text-gray-500 uppercase">Trigger:</span>
         <div 
           className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-md cursor-pointer hover:bg-blue-100 transition-colors group"
           onClick={() => setTriggerDialogOpen(true)}
         >
           <Play className="w-4 h-4 text-blue-600" />
           <span className="text-sm font-medium text-blue-900">
             {currentTrigger ? currentTrigger.name : (workflow.trigger || "选择触发器...")}
           </span>
           <Pencil className="w-3 h-3 text-blue-400 opacity-0 group-hover:opacity-100" />
         </div>
         {currentTrigger && (
           <span className="text-xs text-gray-400 font-mono hidden sm:inline-block">
             Payload: {Object.keys(currentTrigger.payloadSchema).join(', ')}
           </span>
         )}
      </div>

      <div className="flex flex-1 overflow-hidden h-full min-h-0">
      {/* Sidebar Palette */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full min-h-0 shrink-0">
        <div className="p-4 border-b border-gray-100 shrink-0">
          <h3 className="text-sm font-semibold text-gray-700">组件库</h3>
        </div>
        <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-6">
          {/* Entities */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase flex items-center gap-1">
              <Database className="w-3 h-3" /> 实体
            </h4>
            <div className="space-y-2">
              {definitions.entities.map(item => (
                <div 
                  key={item.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, 'Entity', item)}
                  className="p-2 bg-white border border-gray-200 rounded text-xs cursor-move hover:border-blue-400 hover:shadow-sm flex items-center gap-2"
                >
                  <GripVertical className="w-3 h-3 text-gray-300" />
                  {item.name}
                </div>
              ))}
            </div>
          </div>

          {/* Rules */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase flex items-center gap-1">
              <Shield className="w-3 h-3" /> 规则
            </h4>
            <div className="space-y-2">
              {definitions.rules.map(item => (
                <div 
                  key={item.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, 'Rule', item)}
                  className="p-2 bg-orange-50 border border-orange-100 rounded text-xs cursor-move hover:border-orange-400 hover:shadow-sm flex items-center gap-2"
                >
                  <GripVertical className="w-3 h-3 text-orange-300" />
                  {item.name}
                </div>
              ))}
            </div>
          </div>

           {/* Actions */}
           <div>
            <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase flex items-center gap-1">
              <Zap className="w-3 h-3" /> 动作
            </h4>
            <div className="space-y-2">
              {definitions.actions.map(item => (
                <div 
                  key={item.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, 'Action', item)}
                  className="p-2 bg-indigo-50 border border-indigo-100 rounded text-xs cursor-move hover:border-indigo-400 hover:shadow-sm flex items-center gap-2"
                >
                  <GripVertical className="w-3 h-3 text-indigo-300" />
                  {item.name}
                </div>
              ))}
            </div>
          </div>

          {/* Agents removed: Agent 作为执行者，不再是节点类型 */}
        </div>
      </ScrollArea>
      </div>

      {/* Canvas */}
      <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
          <Panel position="top-right" className="bg-white p-2 rounded shadow text-xs text-gray-700 space-y-2 w-[260px]">
            {!selectedNodeId && <div>从左侧拖拽组件到画布以添加节点</div>}
            {selectedNodeId && (() => {
              const node = nodes.find(n => n.id === selectedNodeId);
              if (!node) return <div>未选择节点</div>;
              const nodeType = (node.data as any)?.nodeType;
              if (nodeType !== 'Action') return <div>节点类型：{String(nodeType || 'System')}</div>;
              const actionName = (node.data as any)?.action;
              return (
                <div className="space-y-2">
                  <div className="font-semibold">动作：{String(actionName)}</div>
                </div>
              );
            })()}
          </Panel>
        </ReactFlow>
      </div>
      </div>

      {/* Trigger Selection Dialog */}
      <Dialog open={triggerDialogOpen} onOpenChange={setTriggerDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>配置流程触发器</DialogTitle>
            <DialogDescription>
              选择启动此业务流程的事件。这将决定流程执行时的初始上下文数据。
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4">
            {triggers.map(trigger => (
              <div 
                key={trigger.id}
                className={`
                  p-4 border rounded-lg cursor-pointer transition-all flex items-start gap-4
                  ${workflow.triggerId === trigger.id 
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}
                `}
                onClick={() => handleTriggerSelect(trigger.id)}
              >
                <div className="mt-1 p-2 bg-blue-100 rounded-full text-blue-600">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-semibold text-slate-900">{trigger.name}</h4>
                    <Badge variant="outline" className="font-mono text-[10px] text-gray-500">{trigger.event}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{trigger.description}</p>
                  <div className="bg-slate-900 rounded p-2 text-[10px] font-mono text-green-400 overflow-x-auto">
                    {JSON.stringify(trigger.payloadSchema, null, 2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// --- Main Component ---

const BusinessModelEditor: React.FC = () => {
  const { toast } = useToast();
  const [model, setModel] = useState<BusinessModel>(initialModel);
  
  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingType, setEditingType] = useState<'entity' | 'rule' | 'action' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Delete Confirmation State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{type: string, id: string} | null>(null);

  const confirmDelete = (type: string, id: string) => {
    setItemToDelete({ type, id });
    setDeleteDialogOpen(true);
  };

  const executeDelete = () => {
    if (itemToDelete) {
      handleDeleteItem(itemToDelete.type, itemToDelete.id);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);

  const handleSaveModel = () => {
    // Simulate API call
    setTimeout(() => {
       toast({
         title: "保存成功",
         description: "业务模型已成功保存至服务器。",
       });
       setModel(prev => ({ ...prev, status: 'Active' })); // Example state change
    }, 500);
  };

  const handleCreateWorkflow = () => {
     const newWorkflow: Workflow = {
       id: `wf-${Date.now()}`,
       name: "New Workflow",
       trigger: "Manual Trigger",
       description: "New empty workflow",
       nodes: [],
       edges: []
     };
     
     setModel(prev => ({
       ...prev,
       definitions: {
         ...prev.definitions,
         workflows: [...prev.definitions.workflows, newWorkflow]
       }
     }));
     setSelectedWorkflowId(newWorkflow.id);
     
     toast({
       title: "创建成功",
       description: "已创建一个新的空白流程。",
     });
  };

  // Effect to select first workflow by default
  useEffect(() => {
    if (model.definitions.workflows.length > 0 && !selectedWorkflowId) {
      setSelectedWorkflowId(model.definitions.workflows[0].id);
    }
  }, [model.definitions.workflows]);

  const openEditDialog = (type: 'entity' | 'rule' | 'action', item?: any) => {
    setEditingType(type);
    if (item) {
      setEditingItem(JSON.parse(JSON.stringify(item)));
      setIsEditing(true);
    } else {
      setEditingItem(getEmptyItem(type));
      setIsEditing(false);
    }
    setIsDialogOpen(true);
  };

  const getEmptyItem = (type: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    switch (type) {
      case 'entity': return { id, name: '', description: '', fields: [], relationships: [] };
      case 'rule': return { id, name: '', description: '', trigger: '', action: '', severity: 'low', condition: '' };
      case 'action': return { id, name: '', description: '', inputs: [], outputs: [], apiEndpoint: '' };
      default: return {};
    }
  };

  const handleSaveItem = () => {
    if (!editingType || !editingItem) return;

    const newModel = { ...model };
    
    switch (editingType) {
      case 'entity': updateList(newModel.definitions.entities, editingItem); break;
      case 'rule': updateList(newModel.definitions.rules, editingItem); break;
      case 'action': updateList(newModel.actions, editingItem); break;
    }

    setModel(newModel);
    setIsDialogOpen(false);
  };

  const updateList = (list: any[], item: any) => {
    const index = list.findIndex(i => i.id === item.id);
    if (index >= 0) {
      list[index] = item;
    } else {
      list.push(item);
    }
  };

  const handleDeleteItem = (type: string, id: string) => {
     const newModel = { ...model };
     switch (type) {
      case 'entity': newModel.definitions.entities = newModel.definitions.entities.filter(i => i.id !== id); break;
      case 'rule': newModel.definitions.rules = newModel.definitions.rules.filter(i => i.id !== id); break;
      case 'action': newModel.actions = newModel.actions.filter(i => i.id !== id); break;
     }
     setModel(newModel);
  };

  const handleWorkflowUpdate = useCallback((nodes: Node[], edges: Edge[], triggerId?: string) => {
    if (!selectedWorkflowId) return;
    
    setModel(prev => {
      const newWorkflows = prev.definitions.workflows.map(wf => {
        if (wf.id === selectedWorkflowId) {
          return { ...wf, nodes, edges, triggerId };
        }
        return wf;
      });
      return {
        ...prev,
        definitions: {
          ...prev.definitions,
          workflows: newWorkflows
        }
      };
    });
  }, [selectedWorkflowId]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Draft': return '草稿';
      case 'Active': return '已发布';
      case 'Archived': return '归档';
      default: return status;
    }
  };

  const toSliceJson = (m: BusinessModel) => {
    const modelId = m.name.replace(/\s+/g, "_");
    const entities = (m.definitions.entities || []).map(e => ({
      ref: e.name,
      usage: "read"
    }));
    const actions = (m.actions || []).map(a => ({
      ref: a.name,
      context: "Default"
    }));
    const rules = (m.definitions.rules || []).map(r => ({
      ref: r.name
    }));
    const processes = (m.definitions.workflows || []).map(wf => {
      const triggerObj = (m.triggers || []).find(t => t.id === wf.triggerId);
      const firstStep = triggerObj ? { event: triggerObj.event } : { event: wf.trigger };
      const actionSteps = (wf.nodes || [])
        .filter(n => (n.data as any)?.nodeType === 'Action')
        .map(n => ({ action: (n.data as any)?.action }));
      return {
        name: wf.name,
        steps: [firstStep, ...actionSteps]
      };
    });
    return {
      model_id: modelId,
      entities,
      actions,
      rules,
      processes
    };
  };

  const getAvailableAssets = () => {
    if (!editingType) return [];
    
    let allAssets: any[] = [];
    let currentAssets: any[] = [];

    switch (editingType) {
      case 'entity': 
        allAssets = mockGlobalAssets.entities;
        currentAssets = model.definitions.entities;
        break;
      case 'rule':
        allAssets = mockGlobalAssets.rules;
        currentAssets = model.definitions.rules;
        break;
      case 'action':
        allAssets = mockGlobalAssets.actions;
        currentAssets = model.actions;
        break;
    }

    return allAssets.filter(asset => !currentAssets.find(ca => ca.id === asset.id));
  };

  const handleAddFromLibrary = (item: any) => {
     if (!editingType) return;
     const newModel = { ...model };
     
     // Clone to avoid reference issues if we modify it later (though in this mock we might want reference)
     // But since we have local editing, let's clone.
     // In a real app, this would be a reference ID.
     const itemToAdd = JSON.parse(JSON.stringify(item));

     switch (editingType) {
      case 'entity': updateList(newModel.definitions.entities, itemToAdd); break;
      case 'rule': updateList(newModel.definitions.rules, itemToAdd); break;
      case 'action': updateList(newModel.actions, itemToAdd); break;
     }

     setModel(newModel);
     setIsDialogOpen(false);
  };

  const renderEditForm = () => (
    <div className="grid gap-6 py-6">
      {/* Common Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">名称</Label>
          <Input 
            id="name" 
            value={editingItem.name} 
            onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
            placeholder="例如：订单 (Order)"
          />
        </div>
        
        {(editingType === 'rule' || editingType === 'action') && (
          <div className="space-y-2">
            <Label>{editingType === 'rule' ? '严重程度' : '类型'}</Label>
             {editingType === 'rule' ? (
                <Select 
                  value={editingItem.severity} 
                  onValueChange={(v) => setEditingItem({...editingItem, severity: v})}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">严重</SelectItem>
                    <SelectItem value="warning">警告</SelectItem>
                    <SelectItem value="info">提示</SelectItem>
                  </SelectContent>
                </Select>
             ) : (
                <Select 
                  value={editingItem.type} 
                  onValueChange={(v) => setEditingItem({...editingItem, type: v})}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">系统 (System)</SelectItem>
                    <SelectItem value="integration">集成 (Integration)</SelectItem>
                    <SelectItem value="human">人工 (Human)</SelectItem>
                    <SelectItem value="ai">AI 能力 (AI)</SelectItem>
                  </SelectContent>
                </Select>
             )}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="desc">描述</Label>
        <Textarea 
          id="desc" 
          value={editingItem.description || ''} 
          onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
          className="min-h-[80px]"
          placeholder="描述其用途和上下文..."
        />
      </div>

      {/* --- Entity Specific Fields --- */}
      {editingType === 'entity' && (
        <>
          <Separator />
          <div className="space-y-4">
             <h3 className="font-medium flex items-center gap-2"><Database className="w-4 h-4" /> 数据结构</h3>
             
             {/* Lifecycle States */}
             <div className="space-y-2">
                <Label>生命周期状态 (有序)</Label>
                <Input 
                  value={editingItem.lifecycleStates?.join(', ') || ''}
                  onChange={(e) => setEditingItem({...editingItem, lifecycleStates: e.target.value.split(',').map((s: string) => s.trim())})}
                  placeholder="例如：Created, Paid, Shipped, Completed"
                />
                <p className="text-[10px] text-gray-500">定义此实体的有效状态流转。</p>
             </div>

             {/* Fields Table Editor */}
             <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>字段列表</Label>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 text-xs gap-1"
                      onClick={() => {
                        const newFields = [...(editingItem.fields || [])];
                        newFields.push({ name: "new_field", type: "string", description: "", required: false });
                        setEditingItem({...editingItem, fields: newFields});
                      }}
                    >
                      <Plus className="w-3 h-3" /> 添加字段
                    </Button>
                  </div>
                  <div className="rounded-md border border-slate-200 overflow-hidden bg-white">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                          <TableHead className="w-[140px] text-xs h-9">字段名</TableHead>
                          <TableHead className="w-[110px] text-xs h-9">类型</TableHead>
                          <TableHead className="w-[60px] text-xs h-9 text-center">必填</TableHead>
                          <TableHead className="text-xs h-9">业务说明</TableHead>
                          <TableHead className="w-[40px] h-9"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(editingItem.fields || []).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-xs text-gray-400 py-4">
                              暂无字段定义
                            </TableCell>
                          </TableRow>
                        )}
                        {(editingItem.fields || []).map((field: any, index: number) => (
                          <TableRow key={index} className="hover:bg-slate-50/50">
                            <TableCell className="p-2">
                              <Input 
                                className="h-7 text-xs px-2" 
                                value={field.name} 
                                onChange={(e) => {
                                  const newFields = [...editingItem.fields];
                                  newFields[index].name = e.target.value;
                                  setEditingItem({...editingItem, fields: newFields});
                                }} 
                                placeholder="字段名"
                              />
                            </TableCell>
                            <TableCell className="p-2">
                                <Select 
                                  value={field.type} 
                                  onValueChange={(v) => {
                                    const newFields = [...editingItem.fields];
                                    newFields[index].type = v;
                                    setEditingItem({...editingItem, fields: newFields});
                                  }}
                                >
                                  <SelectTrigger className="h-7 text-xs w-full px-2"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="string">String</SelectItem>
                                    <SelectItem value="int">Int</SelectItem>
                                    <SelectItem value="decimal">Decimal</SelectItem>
                                    <SelectItem value="float">Float</SelectItem>
                                    <SelectItem value="boolean">Boolean</SelectItem>
                                    <SelectItem value="date">Date</SelectItem>
                                    <SelectItem value="datetime">DateTime</SelectItem>
                                    <SelectItem value="enum">Enum</SelectItem>
                                    <SelectItem value="json">JSON</SelectItem>
                                  </SelectContent>
                                </Select>
                            </TableCell>
                            <TableCell className="p-2 text-center">
                                <input 
                                  type="checkbox" 
                                  checked={field.required} 
                                  onChange={(e) => {
                                    const newFields = [...editingItem.fields];
                                    newFields[index].required = e.target.checked;
                                    setEditingItem({...editingItem, fields: newFields});
                                  }}
                                  className="rounded border-gray-300 w-3.5 h-3.5 accent-blue-600"
                                />
                            </TableCell>
                            <TableCell className="p-2">
                              <Input 
                                className="h-7 text-xs px-2" 
                                value={field.description || ''} 
                                onChange={(e) => {
                                  const newFields = [...editingItem.fields];
                                  newFields[index].description = e.target.value;
                                  setEditingItem({...editingItem, fields: newFields});
                                }} 
                                placeholder="描述..."
                              />
                            </TableCell>
                            <TableCell className="p-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-gray-400 hover:text-red-500"
                                onClick={() => {
                                  const newFields = editingItem.fields.filter((_: any, i: number) => i !== index);
                                  setEditingItem({...editingItem, fields: newFields});
                                }}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>关联关系 (JSON)</Label>
                  <div className="rounded-md border border-slate-200 overflow-hidden">
                    <Textarea 
                      className="font-mono text-xs h-32 border-0 bg-slate-50"
                      value={JSON.stringify(editingItem.relationships || [], null, 2)}
                      onChange={(e) => {
                        try { setEditingItem({...editingItem, relationships: JSON.parse(e.target.value)}); } catch {}
                      }}
                    />
                  </div>
                </div>
             </div>
          </div>
        </>
      )}

      {/* --- Rule Specific Fields --- */}
      {editingType === 'rule' && (
        <>
          <Separator />
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2"><Shield className="w-4 h-4" /> 逻辑配置</h3>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label>触发事件</Label>
                <Input 
                  value={editingItem.trigger} 
                  onChange={(e) => setEditingItem({...editingItem, trigger: e.target.value})}
                  placeholder="例如：Order.Created"
                />
              </div>
              <div className="space-y-2">
                <Label>执行动作</Label>
                <Input 
                  value={editingItem.action} 
                  onChange={(e) => setEditingItem({...editingItem, action: e.target.value})}
                  placeholder="例如：BlockOrder"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex justify-between">
                条件表达式
                <span className="text-xs font-normal text-gray-500">支持类 JS 语法</span>
              </Label>
              <div className="relative">
                <Textarea 
                  value={editingItem.condition} 
                  onChange={(e) => setEditingItem({...editingItem, condition: e.target.value})}
                  className="font-mono text-sm min-h-[80px] bg-slate-50"
                  placeholder="例如：Order.amount > 5000 && User.riskScore > 0.8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>动作配置 (JSON Config)</Label>
              <div className="rounded-md border border-slate-200 overflow-hidden">
                <Textarea 
                  className="font-mono text-xs h-24 border-0 bg-slate-50"
                  value={JSON.stringify(editingItem.actionConfig || {}, null, 2)}
                  onChange={(e) => {
                    try { setEditingItem({...editingItem, actionConfig: JSON.parse(e.target.value)}); } catch {}
                  }}
                  placeholder="{}"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                  <Label>优先级:</Label>
                  <Input 
                    type="number" 
                    className="w-20" 
                    value={editingItem.priority || 1}
                    onChange={(e) => setEditingItem({...editingItem, priority: parseInt(e.target.value)})}
                  />
               </div>
               <div className="flex items-center gap-2">
                  <Label>启用状态:</Label>
                  <Select 
                    value={editingItem.enabled ? "true" : "false"}
                    onValueChange={(v) => setEditingItem({...editingItem, enabled: v === "true"})}
                  >
                     <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                     <SelectContent>
                       <SelectItem value="true">启用</SelectItem>
                       <SelectItem value="false">禁用</SelectItem>
                     </SelectContent>
                  </Select>
               </div>
            </div>
          </div>
        </>
      )}


      {/* --- Action Specific Fields --- */}
      {editingType === 'action' && (
        <>
          <Separator />
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2"><Zap className="w-4 h-4" /> 技术定义</h3>
            
            <div className="space-y-2">
               <Label>API 端点</Label>
               <div className="flex gap-2">
                  <Select defaultValue="POST">
                     <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                     <SelectContent>
                       <SelectItem value="GET">GET</SelectItem>
                       <SelectItem value="POST">POST</SelectItem>
                       <SelectItem value="PUT">PUT</SelectItem>
                       <SelectItem value="DELETE">DELETE</SelectItem>
                     </SelectContent>
                  </Select>
                  <Input 
                    value={editingItem.apiEndpoint || ''} 
                    onChange={(e) => setEditingItem({...editingItem, apiEndpoint: e.target.value})}
                    placeholder="/api/v1/resource"
                    className="font-mono"
                  />
               </div>
            </div>

            <div className="space-y-2">
               <Label>副作用 (Side Effects, 逗号分隔)</Label>
               <Input 
                  value={editingItem.sideEffects?.join(', ') || ''} 
                  onChange={(e) => setEditingItem({
                     ...editingItem, 
                     sideEffects: e.target.value.split(',').map((s: string) => s.trim()) 
                  })}
                  placeholder="例如：发送邮件, 更新数据库"
               />
            </div>

            <div className="space-y-2">
              <Label>输入/输出 Schema (JSON)</Label>
              <div className="rounded-md border border-slate-200 overflow-hidden">
                <Textarea 
                  className="font-mono text-xs h-40 border-0 bg-slate-50"
                  value={JSON.stringify({ inputs: editingItem.inputs, outputs: editingItem.outputs }, null, 2)}
                  onChange={(e) => {
                    try {
                      const val = JSON.parse(e.target.value);
                      setEditingItem({...editingItem, inputs: val.inputs || [], outputs: val.outputs || []});
                    } catch {}
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );

  const [activeTab, setActiveTab] = useState<'construction' | 'process' | 'json'>('construction');

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden font-sans text-slate-900">
      
      {/* Module Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm z-10 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-blue-600 rounded-lg shadow-lg">
            <Box className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              {model.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-block w-2 h-2 rounded-full ${model.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
              <span className="text-xs text-gray-500 font-medium">{getStatusLabel(model.status)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button size="sm" variant="outline" className="gap-2" onClick={() => { window.location.href = "/enterprise/registry"; }}>
            <Database className="w-4 h-4" />
            企业层总览
          </Button>
          <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={handleSaveModel}>
            <Save className="w-4 h-4" />
            保存模型
          </Button>
        </div>
      </header>

      {/* Main Content Area with Custom Tabs */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Custom Tabs Header */}
        <div className="px-6 py-4 bg-white border-b border-gray-200 shrink-0">
           <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
              <button
                onClick={() => setActiveTab('construction')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  activeTab === 'construction' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                业务构建
              </button>
              <button
                onClick={() => setActiveTab('process')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  activeTab === 'process' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                流程编排
              </button>
              <button
                onClick={() => setActiveTab('json')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  activeTab === 'json' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                模型 JSON
              </button>
           </div>
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-hidden relative">
          
          {/* Tab 1: Business Construction */}
          {activeTab === 'construction' && (
            <div className="absolute inset-0 p-6 overflow-hidden flex flex-col">
               <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
                  {/* Left Column: Entities + Actions */}
                  <div className="flex flex-col gap-6 h-full overflow-hidden">
                    {/* Top Left: Entities */}
                    <div className="flex flex-col gap-4 flex-1 overflow-hidden min-h-0">
                      <div className="flex items-center justify-between shrink-0">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                          <Database className="w-5 h-5 text-blue-500" /> 实体
                        </h2>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog('entity')}><Plus className="w-4 h-4" /></Button>
                      </div>
                      <Card className="flex-1 overflow-hidden flex flex-col border-slate-200 shadow-sm min-h-0">
                        <ScrollArea className="flex-1 h-full">
                          <div className="p-4 space-y-3">
                            {model.definitions.entities.map(entity => (
                              <div 
                                key={entity.id}
                                className="group p-3 rounded-lg border border-gray-100 bg-white hover:border-blue-300 hover:shadow-md transition-all cursor-pointer relative"
                                onClick={() => openEditDialog('entity', entity)}
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <span className="font-semibold text-slate-800">{entity.name}</span>
                                  <Badge variant="secondary" className="text-[10px] px-1 py-0 h-5">实体</Badge>
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-2">{entity.description}</p>
                                <div 
                                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
                                  onClick={(e) => { e.stopPropagation(); confirmDelete('entity', entity.id); }}
                                >
                                  <Trash2 className="w-3 h-3 text-red-400" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </Card>
                    </div>

                    {/* Bottom Left: Capabilities / Actions */}
                    <div className="flex flex-col gap-4 flex-1 overflow-hidden min-h-0">
                      <div className="flex items-center justify-between shrink-0">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                          <LayoutIcon className="w-5 h-5 text-indigo-500" /> 能力 / 动作
                        </h2>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog('action')}><Plus className="w-4 h-4" /></Button>
                      </div>
                      <Card className="flex-1 overflow-hidden flex flex-col border-slate-200 shadow-sm min-h-0">
                        <ScrollArea className="flex-1 h-full">
                          <div className="p-4 grid grid-cols-2 gap-4">
                            {model.actions.map(action => (
                              <Card 
                                key={action.id} 
                                className="border-dashed hover:border-solid transition-all hover:border-indigo-300 cursor-pointer group relative"
                                onClick={() => openEditDialog('action', action)}
                              >
                                <div 
                                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
                                  onClick={(e) => { e.stopPropagation(); confirmDelete('action', action.id); }}
                                >
                                  <Trash2 className="w-3 h-3 text-red-400" />
                                </div>
                                <CardHeader className="p-4 pb-2">
                                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-indigo-500" />
                                    {action.name}
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-2">
                                  <div className="text-xs text-gray-500">{action.description}</div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </ScrollArea>
                      </Card>
                    </div>
                  </div>

                  {/* Right Column: Rules */}
                  <div className="flex flex-col gap-6 h-full overflow-hidden">
                    {/* Top Right: Rules */}
                    <div className="flex flex-col gap-4 flex-1 overflow-hidden min-h-0">
                      <div className="flex items-center justify-between shrink-0">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                          <Shield className="w-5 h-5 text-orange-500" /> 规则
                        </h2>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog('rule')}><Plus className="w-4 h-4" /></Button>
                      </div>
                      <Card className="flex-1 overflow-hidden flex flex-col bg-slate-50/50 border-slate-200 shadow-sm min-h-0">
                        <ScrollArea className="flex-1 h-full">
                          <div className="p-4 space-y-4">
                            {model.definitions.rules.map(rule => (
                              <Card 
                                key={rule.id} 
                                className="border-l-4 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group relative" 
                                style={{ borderLeftColor: rule.severity === 'high' ? '#ef4444' : rule.severity === 'medium' ? '#eab308' : '#22c55e' }}
                                onClick={() => openEditDialog('rule', rule)}
                              >
                                <div 
                                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 p-1 hover:bg-red-50 rounded"
                                  onClick={(e) => { e.stopPropagation(); confirmDelete('rule', rule.id); }}
                                >
                                  <Trash2 className="w-3 h-3 text-red-400" />
                                </div>
                                <CardHeader className="p-4 pb-2">
                                  <div className="flex justify-between items-start">
                                    <CardTitle className="text-sm font-bold text-slate-800">{rule.name}</CardTitle>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${getSeverityColor(rule.severity)}`}>
                                      {rule.severity}
                                    </span>
                                  </div>
                                  <CardDescription className="text-xs mt-1">{rule.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 pt-2">
                                  <div className="flex items-center gap-3 text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                                    <span className="font-medium">触发条件:</span> {rule.trigger}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </ScrollArea>
                      </Card>
                    </div>

                    
                  </div>
               </div>
            </div>
          )}

          {/* Tab 2: Process */}
          {activeTab === 'process' && (
            <div className="absolute inset-0 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-6 py-2 bg-gray-50 border-b shrink-0">
                 <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {model.definitions.workflows.map(wf => (
                      <button
                        key={wf.id}
                        onClick={() => setSelectedWorkflowId(wf.id)}
                        className={`
                          px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-all whitespace-nowrap
                          ${selectedWorkflowId === wf.id 
                            ? 'border-blue-500 text-blue-600 bg-white' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'}
                        `}
                      >
                        {wf.name}
                      </button>
                    ))}
                    <Button variant="ghost" size="sm" className="h-9 w-9 rounded-full ml-2" onClick={handleCreateWorkflow}><Plus className="w-4 h-4" /></Button>
                 </div>
                 {selectedWorkflowId && (
                   <div className="text-xs text-gray-500 flex items-center gap-2">
                     <Badge variant="outline">触发器: {model.definitions.workflows.find(w => w.id === selectedWorkflowId)?.trigger}</Badge>
                   </div>
                 )}
              </div>
              
              <div className="flex-1 bg-slate-50 relative overflow-hidden min-h-0">
                 {selectedWorkflowId && (
                   <ReactFlowProvider>
                     <WorkflowEditor 
                        workflow={model.definitions.workflows.find(w => w.id === selectedWorkflowId)!}
                        onSave={handleWorkflowUpdate}
                        definitions={{
                          entities: model.definitions.entities,
                          rules: model.definitions.rules,
                          actions: model.actions
                        }}
                        triggers={model.triggers || []}
                     />
                   </ReactFlowProvider>
                 )}
              </div>
            </div>
          )}

          {/* Tab 3: JSON */}
          {activeTab === 'json' && (
            <div className="absolute inset-0 p-6 flex flex-col overflow-hidden">
              <div className="bg-slate-900 rounded-lg shadow-inner overflow-hidden flex-1 flex flex-col min-h-0">
                 <div className="bg-slate-800 px-4 py-2 flex justify-between items-center shrink-0">
                    <span className="text-xs text-slate-400 font-mono">model_slice.json</span>
                    <Badge variant="outline" className="text-xs text-slate-400 border-slate-600">只读</Badge>
                  </div>
                  <ScrollArea className="flex-1 w-full h-full">
                    <pre className="p-4 text-xs font-mono text-green-400 leading-relaxed">
                      {JSON.stringify(toSliceJson(model), null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Sheet (Shared for Business Construction items) */}
      <Sheet open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <SheetContent side="right" className="w-[600px] sm:max-w-[800px] flex flex-col h-full p-0 gap-0">
          <div className="flex-1 overflow-y-auto p-6">
            <SheetHeader className="mb-6">
              <SheetTitle className="capitalize flex items-center gap-2">
                {editingItem?.id ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editingItem?.id ? '编辑' : '添加'} {
                  editingType === 'entity' ? '实体' :
                  editingType === 'rule' ? '规则' :
                  editingType === 'action' ? '动作' : ''
                }
              </SheetTitle>
              <SheetDescription>
                 配置此 {
                  editingType === 'entity' ? '实体' :
                  editingType === 'rule' ? '规则' :
                  editingType === 'action' ? '动作' : ''
                } 的详细属性和行为。
              </SheetDescription>
            </SheetHeader>
            
            {editingItem && (
              <>
                 {isEditing ? (
                   renderEditForm()
                 ) : (
                   <Tabs defaultValue="library" className="w-full mt-4">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="library">从资产库选择</TabsTrigger>
                        <TabsTrigger value="create">新建</TabsTrigger>
                      </TabsList>
                      <TabsContent value="library" className="mt-4">
                         <ScrollArea className="h-[500px] pr-4">
                           <div className="space-y-3">
                             {getAvailableAssets().length === 0 ? (
                               <div className="text-center text-gray-500 py-8 text-sm">
                                 没有可用的资产。
                               </div>
                             ) : (
                               getAvailableAssets().map(asset => (
                                 <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg bg-white hover:shadow-sm">
                                    <div>
                                      <div className="font-medium text-sm">{asset.name}</div>
                                      <div className="text-xs text-gray-500 line-clamp-1">{asset.description}</div>
                                    </div>
                                    <Button size="sm" variant="secondary" onClick={() => handleAddFromLibrary(asset)}>
                                      添加
                                    </Button>
                                 </div>
                               ))
                             )}
                           </div>
                         </ScrollArea>
                      </TabsContent>
                      <TabsContent value="create">
                         {renderEditForm()}
                      </TabsContent>
                   </Tabs>
                 )}
              </>
            )}
          </div>

          <SheetFooter className="flex justify-end gap-2 p-4 border-t border-gray-100 bg-white">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>取消</Button>
            <Button onClick={handleSaveItem}>保存更改</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销。这将从当前业务模型中移除该
              {itemToDelete?.type === 'entity' ? '实体' :
               itemToDelete?.type === 'rule' ? '规则' :
               itemToDelete?.type === 'agent' ? '智能体' :
               itemToDelete?.type === 'action' ? '动作' : '项目'}
              。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete} className="bg-red-600 hover:bg-red-700">删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Version Switching Dialog - Removed */}
    </div>
  );
};

export default BusinessModelEditor;
