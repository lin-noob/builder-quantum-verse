import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Search,
  Plus,
  ArrowRight,
  Database,
  ShoppingCart,
  FileText,
  AlertTriangle,
  ShieldCheck,
  Zap,
  GitMerge,
  CheckCircle2,
  Info,
  ChevronRight,
  BrainCircuit,
  Scale,
  Edit,
  Trash2,
  Table as TableIcon,
  Key,
  Lock,
  ArrowLeftRight,
  Network,
  Settings2,
  Code,
  GitCommit,
  ArrowDown,
  Layout,
  Workflow,
  PlayCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { request } from "@/lib/request";
import {
  Entity,
  EntityType,
  EntityAttribute,
  EntityRelationship,
  DBMapping,
  LifecycleState,
} from "@/components/BusinessEntity/types";
import LifecycleView from "@/components/BusinessEntity/LifecycleView";

// --- Mock Data ---

const MOCK_ENTITIES: Entity[] = [
  {
    id: "e1",
    name: "客户",
    code: "Customer",
    type: "Master",
    description: "企业的核心服务对象，包含个人客户与企业客户的基础身份信息与偏好设置。",
    attributes: [
      {
        id: "a1",
        name: "customer_id",
        type: "VARCHAR(64)",
        isPrimaryKey: true,
        isRequired: true,
        isSensitive: false,
        description: "客户唯一标识",
      },
      {
        id: "a2",
        name: "name",
        type: "VARCHAR(100)",
        isPrimaryKey: false,
        isRequired: true,
        isSensitive: true,
        description: "客户姓名/名称",
      },
      {
        id: "a3",
        name: "phone",
        type: "VARCHAR(20)",
        isPrimaryKey: false,
        isRequired: false,
        isSensitive: true,
        description: "联系电话",
      },
      {
        id: "a4",
        name: "level",
        type: "INT",
        isPrimaryKey: false,
        isRequired: true,
        isSensitive: false,
        description: "客户等级",
      },
    ],
    dbMapping: { tableName: "t_crm_customer", dataSource: "CRM_DB_Master" },
    isSettlement: false,
    isRiskControl: true,
    isCompliance: true,
    allowAI: true,
    relationships: [
      {
        id: "r1",
        targetObject: "订单",
        relationship: "1:N",
        foreignKey: "customer_id",
        description: "客户发起订单",
      },
      {
        id: "r2",
        targetObject: "工单",
        relationship: "1:N",
        foreignKey: "customer_id",
        description: "客户提交工单",
      },
    ],
    usedByCapabilities: ["客户画像更新", "营销触达"],
    constrainedByRules: ["隐私保护法规", "数据留存规范"],
    lifecycleRisk: false,
    lifecycle: [
      {
        id: 1,
        mainId: 1,
        stateName: "潜在",
        systemCode: "POTENTIAL",
        stateType: 0,
        description: "潜在客户",
        gmtCreate: "2026-01-15T08:14:57.424Z",
        gmtModified: "2026-01-15T08:14:57.424Z",
        entryRules: [],
        allowedActions: ["完善资料", "首次下单"],
        transitions: [{ id: "t1", targetStateId: 2, triggerEvent: "完成首单支付" }],
      },
      {
        id: 2,
        mainId: 1,
        stateName: "活跃",
        systemCode: "ACTIVE",
        stateType: 1,
        description: "活跃客户",
        gmtCreate: "2026-01-15T08:14:57.424Z",
        gmtModified: "2026-01-15T08:14:57.424Z",
        entryRules: ["已完成实名认证"],
        allowedActions: ["下单", "评价", "售后申请"],
        transitions: [
          { id: "t2", targetStateId: 3, triggerEvent: "连续180天无交易" },
          { id: "t3", targetStateId: 4, triggerEvent: "违规封号" },
        ],
      },
      {
        id: 3,
        mainId: 1,
        stateName: "流失",
        systemCode: "CHURNED",
        stateType: 1,
        description: "流失客户",
        gmtCreate: "2026-01-15T08:14:57.424Z",
        gmtModified: "2026-01-15T08:14:57.424Z",
        entryRules: [],
        allowedActions: ["召回营销"],
        transitions: [{ id: "t4", targetStateId: 2, triggerEvent: "重新下单" }],
      },
      {
        id: 4,
        mainId: 1,
        stateName: "冻结",
        systemCode: "FROZEN",
        stateType: 2,
        description: "冻结客户",
        gmtCreate: "2026-01-15T08:14:57.424Z",
        gmtModified: "2026-01-15T08:14:57.424Z",
        entryRules: ["风控系统触发红线"],
        allowedActions: ["申诉"],
        transitions: [],
      },
    ],
  },
  {
    id: "e2",
    name: "订单",
    code: "Order",
    type: "Transaction",
    description: "记录客户购买商品或服务的交易契约，承载收入确认与履约责任。",
    attributes: [
      {
        id: "a1",
        name: "order_id",
        type: "VARCHAR(64)",
        isPrimaryKey: true,
        isRequired: true,
        isSensitive: false,
        description: "订单号",
      },
      {
        id: "a2",
        name: "customer_id",
        type: "VARCHAR(64)",
        isPrimaryKey: false,
        isRequired: true,
        isSensitive: false,
        description: "客户ID (FK)",
      },
      {
        id: "a3",
        name: "amount",
        type: "DECIMAL(18,2)",
        isPrimaryKey: false,
        isRequired: true,
        isSensitive: false,
        description: "订单金额",
      },
      {
        id: "a4",
        name: "status",
        type: "VARCHAR(20)",
        isPrimaryKey: false,
        isRequired: true,
        isSensitive: false,
        description: "订单状态",
      },
    ],
    dbMapping: { tableName: "t_oms_order_main", dataSource: "OMS_DB_Core" },
    isSettlement: true,
    isRiskControl: true,
    isCompliance: true,
    allowAI: false,
    relationships: [
      {
        id: "r1",
        targetObject: "客户",
        relationship: "N:1",
        foreignKey: "customer_id",
        description: "订单归属于客户",
      },
    ],
    usedByCapabilities: ["订单创建", "支付处理", "发货流程"],
    constrainedByRules: ["SLA履约时效", "金额风控阈值"],
    lifecycleRisk: false,
    lifecycle: [],
  },
  {
    id: "e3",
    name: "工单",
    code: "Ticket",
    type: "Result",
    description: "客户服务过程中产生的诉求记录，用于追踪问题解决进度与服务质量。",
    attributes: [
      {
        id: "a1",
        name: "ticket_id",
        type: "VARCHAR(64)",
        isPrimaryKey: true,
        isRequired: true,
        isSensitive: false,
        description: "工单号",
      },
      {
        id: "a2",
        name: "title",
        type: "VARCHAR(255)",
        isPrimaryKey: false,
        isRequired: true,
        isSensitive: false,
        description: "工单标题",
      },
    ],
    dbMapping: { tableName: "t_cs_ticket", dataSource: "CS_DB" },
    isSettlement: false,
    isRiskControl: false,
    isCompliance: false,
    allowAI: true,
    relationships: [
      {
        id: "r1",
        targetObject: "客户",
        relationship: "N:1",
        foreignKey: "customer_id",
        description: "工单归属于客户",
      },
      {
        id: "r2",
        targetObject: "订单",
        relationship: "1:1",
        foreignKey: "order_id",
        description: "工单关联订单",
      },
    ],
    usedByCapabilities: ["工单自动分类", "客服分配"],
    constrainedByRules: ["首响时间要求"],
    lifecycleRisk: true,
    lifecycle: [
      {
        id: 1,
        mainId: 3,
        stateName: "新建",
        systemCode: "NEW",
        stateType: 0,
        description: "新建工单",
        gmtCreate: "2026-01-15T08:14:57.424Z",
        gmtModified: "2026-01-15T08:14:57.424Z",
        entryRules: [],
        allowedActions: ["分配客服", "自动回复"],
        transitions: [{ id: "t1", targetStateId: 2, triggerEvent: "客服接单" }],
      },
      {
        id: 2,
        mainId: 3,
        stateName: "处理中",
        systemCode: "PROCESSING",
        stateType: 1,
        description: "处理中工单",
        gmtCreate: "2026-01-15T08:14:57.424Z",
        gmtModified: "2026-01-15T08:14:57.424Z",
        entryRules: ["客服已签到"],
        allowedActions: ["添加备注", "转交工单", "申请挂起"],
        transitions: [
          { id: "t2", targetStateId: 3, triggerEvent: "等待客户回复" },
          { id: "t3", targetStateId: 4, triggerEvent: "问题解决" },
        ],
      },
      {
        id: 3,
        mainId: 3,
        stateName: "挂起",
        systemCode: "PENDING",
        stateType: 1,
        description: "挂起工单",
        gmtCreate: "2026-01-15T08:14:57.424Z",
        gmtModified: "2026-01-15T08:14:57.424Z",
        entryRules: [],
        allowedActions: ["恢复处理"],
        transitions: [{ id: "t4", targetStateId: 2, triggerEvent: "客户已回复" }],
      },
      {
        id: 4,
        mainId: 3,
        stateName: "已解决",
        systemCode: "RESOLVED",
        stateType: 2,
        description: "已解决工单",
        gmtCreate: "2026-01-15T08:14:57.424Z",
        gmtModified: "2026-01-15T08:14:57.424Z",
        entryRules: [],
        allowedActions: ["发送满意度调查"],
        transitions: [{ id: "t5", targetStateId: 5, triggerEvent: "客户确认/超时自动关闭" }],
      },
      {
        id: 5,
        mainId: 3,
        stateName: "关闭",
        systemCode: "CLOSED",
        stateType: 2,
        description: "已关闭工单",
        gmtCreate: "2026-01-15T08:14:57.424Z",
        gmtModified: "2026-01-15T08:14:57.424Z",
        entryRules: [],
        allowedActions: [],
        transitions: [],
      },
    ],
  },
];

// --- Components ---

const EntityTypeIcon = ({ type }: { type: EntityType }) => {
  switch (type) {
    case "Master":
      return <Database className="h-4 w-4 text-blue-500" />;
    case "Transaction":
      return <ShoppingCart className="h-4 w-4 text-green-500" />;
    case "Result":
      return <FileText className="h-4 w-4 text-orange-500" />;
  }
};

const AttributeEditor = ({
  attributes,
  onChange,
}: {
  attributes: EntityAttribute[];
  onChange: (attrs: EntityAttribute[]) => void;
}) => {
  const addAttribute = () => {
    const newAttr: EntityAttribute = {
      id: `attr_${Date.now()}`,
      name: "",
      type: "VARCHAR",
      isPrimaryKey: false,
      isRequired: false,
      isSensitive: false,
      description: "",
    };
    onChange([...attributes, newAttr]);
  };

  const updateAttribute = (index: number, field: keyof EntityAttribute, value: any) => {
    const newAttrs = [...attributes];
    (newAttrs[index] as any)[field] = value;
    onChange(newAttrs);
  };

  const removeAttribute = (index: number) => {
    const newAttrs = attributes.filter((_, i) => i !== index);
    onChange(newAttrs);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>属性矩阵 (Attributes)</Label>
        <Button size="sm" variant="outline" onClick={addAttribute}>
          <Plus className="h-3 w-3 mr-1" /> 添加字段
        </Button>
      </div>
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[150px]">字段名</TableHead>
              <TableHead className="w-[120px]">类型</TableHead>
              <TableHead className="w-[60px] text-center">PK</TableHead>
              <TableHead className="w-[60px] text-center">必填</TableHead>
              <TableHead className="w-[60px] text-center">脱敏</TableHead>
              <TableHead>描述</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attributes.map((attr, index) => (
              <TableRow key={attr.id}>
                <TableCell>
                  <Input
                    value={attr.name}
                    onChange={(e) => updateAttribute(index, "name", e.target.value)}
                    placeholder="field_name"
                    className="h-8"
                  />
                </TableCell>
                <TableCell>
                  <Select value={attr.type} onValueChange={(val) => updateAttribute(index, "type", val)}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VARCHAR">VARCHAR</SelectItem>
                      <SelectItem value="INT">INT</SelectItem>
                      <SelectItem value="DECIMAL">DECIMAL</SelectItem>
                      <SelectItem value="DATE">DATE</SelectItem>
                      <SelectItem value="BOOLEAN">BOOLEAN</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-center">
                  <Checkbox
                    checked={attr.isPrimaryKey}
                    onCheckedChange={(c) => updateAttribute(index, "isPrimaryKey", !!c)}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Checkbox
                    checked={attr.isRequired}
                    onCheckedChange={(c) => updateAttribute(index, "isRequired", !!c)}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Checkbox
                    checked={attr.isSensitive}
                    onCheckedChange={(c) => updateAttribute(index, "isSensitive", !!c)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={attr.description || ""}
                    onChange={(e) => updateAttribute(index, "description", e.target.value)}
                    placeholder="描述..."
                    className="h-8"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-400 hover:text-red-600"
                    onClick={() => removeAttribute(index)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {attributes.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                  点击上方按钮添加属性
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

// --- Wizard Components ---

const WizardStep1 = ({ data, updateData }: { data: Partial<Entity>; updateData: (d: Partial<Entity>) => void }) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Step 1: 基础定义与映射</h3>
      <p className="text-sm text-gray-500">定义对象身份，并建立与物理数据源的映射关系。</p>
    </div>

    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <Label>对象类型</Label>
          <div className="space-y-2">
            {[
              { id: "Master", name: "主数据", icon: Database },
              { id: "Transaction", name: "交易对象", icon: ShoppingCart },
              { id: "Result", name: "结果对象", icon: FileText },
            ].map((type) => (
              <div
                key={type.id}
                onClick={() => updateData({ type: type.id as EntityType })}
                className={`cursor-pointer rounded-lg border p-3 flex items-center gap-3 transition-all ${
                  data.type === type.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <type.icon className={`h-4 w-4 ${data.type === type.id ? "text-primary" : "text-gray-500"}`} />
                <span className={`font-medium text-sm ${data.type === type.id ? "text-primary" : "text-gray-900"}`}>
                  {type.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">对象名称</Label>
            <Input
              id="name"
              placeholder="例如：客户"
              value={data.name || ""}
              onChange={(e) => updateData({ name: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="code">系统标识 (Code)</Label>
            <Input
              id="code"
              placeholder="例如：Customer"
              className="font-mono"
              value={data.code || ""}
              onChange={(e) => updateData({ code: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-4">
          <Label className="flex items-center gap-2">
            <Database className="h-4 w-4 text-gray-500" />
            物理数据源映射
          </Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              updateData({
                dbMapping: { tableName: "t_new_table", dataSource: "DEFAULT_DS" },
                attributes: [
                  { id: "a1", name: "id", type: "BIGINT", isPrimaryKey: true, isRequired: true, isSensitive: false },
                  {
                    id: "a2",
                    name: "created_at",
                    type: "DATETIME",
                    isPrimaryKey: false,
                    isRequired: true,
                    isSensitive: false,
                  },
                ],
              })
            }
          >
            <Settings2 className="h-3 w-3 mr-1" />
            自动导入表结构
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="grid gap-2">
            <Label className="text-xs">DataSource</Label>
            <Select
              value={data.dbMapping?.dataSource || ""}
              onValueChange={(val) =>
                updateData({ dbMapping: { tableName: data.dbMapping?.tableName || "", dataSource: val } })
              }
            >
              <SelectTrigger className="h-8 bg-white">
                <SelectValue placeholder="选择数据源" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CRM_DB_Master">CRM_DB_Master</SelectItem>
                <SelectItem value="OMS_DB_Core">OMS_DB_Core</SelectItem>
                <SelectItem value="DEFAULT_DS">DEFAULT_DS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label className="text-xs">Physical Table Name</Label>
            <Input
              className="h-8 bg-white font-mono text-xs"
              placeholder="t_table_name"
              value={data.dbMapping?.tableName || ""}
              onChange={(e) =>
                updateData({ dbMapping: { dataSource: data.dbMapping?.dataSource || "", tableName: e.target.value } })
              }
            />
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">业务描述</Label>
        <Textarea
          id="description"
          placeholder="请详细描述这个对象在业务中解决什么问题..."
          className="h-20"
          value={data.description || ""}
          onChange={(e) => updateData({ description: e.target.value })}
        />
      </div>
    </div>
  </div>
);

const WizardStep2 = ({
  data,
  updateData,
  entities,
}: {
  data: Partial<Entity>;
  updateData: (d: Partial<Entity>) => void;
  entities: Entity[];
}) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Step 2: 属性与关联配置</h3>
      <p className="text-sm text-gray-500">配置字段级属性，并定义对象间的实体关系图 (ERD)。</p>
    </div>

    <AttributeEditor attributes={data.attributes || []} onChange={(attrs) => updateData({ attributes: attrs })} />

    <Separator className="my-4" />

    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>关联关系 (Relationships)</Label>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const newRels = [
              ...(data.relationships || []),
              {
                id: `r_${Date.now()}`,
                targetObject: "",
                relationship: "1:N" as const,
                description: "",
              },
            ];
            updateData({ relationships: newRels });
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          添加关系
        </Button>
      </div>

      {data.relationships?.map((rel, index) => (
        <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border">
          <Badge variant="outline" className="bg-white">
            此对象
          </Badge>

          <Select
            value={rel.relationship}
            onValueChange={(val) => {
              const newRels = [...data.relationships!];
              newRels[index].relationship = val as any;
              updateData({ relationships: newRels });
            }}
          >
            <SelectTrigger className="w-24 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1:1">1:1</SelectItem>
              <SelectItem value="1:N">1:N</SelectItem>
              <SelectItem value="N:1">N:1</SelectItem>
              <SelectItem value="N:N">N:N</SelectItem>
            </SelectContent>
          </Select>

          <ArrowRight className="h-4 w-4 text-gray-400" />

          <Select
            value={rel.targetObject}
            onValueChange={(val) => {
              const newRels = [...data.relationships!];
              newRels[index].targetObject = val;
              updateData({ relationships: newRels });
            }}
          >
            <SelectTrigger className="w-48 h-8">
              <SelectValue placeholder="选择目标对象" />
            </SelectTrigger>
            <SelectContent>
              {entities.map((e) => (
                <SelectItem key={e.id} value={e.name}>
                  {e.name} ({e.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="外键字段 (Optional)"
            className="w-32 h-8 font-mono text-xs"
            value={rel.foreignKey || ""}
            onChange={(e) => {
              const newRels = [...data.relationships!];
              newRels[index].foreignKey = e.target.value;
              updateData({ relationships: newRels });
            }}
          />

          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-gray-400 hover:text-red-500 ml-auto h-8 w-8"
            onClick={() => {
              const newRels = data.relationships!.filter((_, i) => i !== index);
              updateData({ relationships: newRels });
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ))}
      {(!data.relationships || data.relationships.length === 0) && (
        <div className="text-center py-4 text-gray-400 text-sm border border-dashed rounded-lg">暂无关联关系</div>
      )}
    </div>
  </div>
);

// --- Lifecycle Components ---

// --- Main Page Component ---

const BusinessEntityWorkbench = () => {
  const [searchParams] = useSearchParams();
  const mainId = searchParams.get("mainId");

  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // --- Effects ---
  const fetchList = useCallback(async () => {
    try {
      const response = await request.get("/quote/api/v1/digital-model/list", {
        mainId: mainId || "1",
        objectName: searchQuery,
      });
      if (response.data && typeof response.data.data === "object" && response.data.data !== null) {
        const typeReverseMap: Record<number, EntityType> = {
          0: "Master",
          1: "Transaction",
          2: "Result",
        };

        const mappedEntities: Entity[] = [];
        Object.entries(response.data.data).forEach(([typeKey, items]: [string, any]) => {
          if (Array.isArray(items)) {
            items.forEach((item: any) => {
              const newEntity: Entity = {
                id: String(item.id),
                name: item.objectName || "未命名",
                code: item.objectCode || "UNKNOWN",
                type: (typeReverseMap[Number(typeKey)] as any) || "Master",
                description: item.description || "",
                dbMapping: {
                  tableName: item.tableName || "",
                  dataSource: item.dataSource || "",
                },
                attributes: [],
                relationships: [],
                isSettlement: false,
                isRiskControl: false,
                isCompliance: false,
                allowAI: false,
                usedByCapabilities: [],
                constrainedByRules: [],
                lifecycleRisk: false,
                lifecycle: [],
              };
              mappedEntities.push(newEntity);
            });
          }
        });

        setEntities(mappedEntities);
      }
    } catch (error) {
      console.error("Failed to fetch digital model list:", error);
    }
  }, [mainId, searchQuery]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // Auto-select first entity if none selected
  useEffect(() => {
    if (entities.length > 0 && !selectedEntityId) {
      setSelectedEntityId(entities[0].id);
    }
  }, [entities, selectedEntityId]);

  const fetchDetail = useCallback(
    async (targetId: string) => {
      try {
        const response = await request.get(`/quote/api/v1/digital-model/view/${targetId}`);
        if (response.data && response.data.data) {
          const item = response.data.data;
          const typeReverseMap: Record<number, string> = {
            0: "Master",
            1: "Transaction",
            2: "Result",
          };

          const detailedEntity: Entity = {
            id: String(item.id),
            name: item.objectName || "未命名",
            code: item.objectCode || "UNKNOWN",
            type: (typeReverseMap[item.type] as any) || "Master",
            description: item.description || "",
            dbMapping: {
              tableName: item.tableName || "",
              dataSource: item.dataSource || "",
            },
            attributes: (item.fields || []).map((f: any) => ({
              id: `attr_${f.id || Date.now()}_${Math.random()}`,
              name: f.fieldName,
              type: f.fieldType,
              isPrimaryKey: !!f.pk,
              isRequired: !!f.required,
              isSensitive: !!f.desensitization,
              description: f.description || "",
            })),
            relationships: (item.relations || []).map((r: any) => ({
              id: `rel_${r.id || Date.now()}_${Math.random()}`,
              targetObject: r.targetObject || "",
              relationship: r.relationship || "1:N",
              foreignKey: r.foreignKey || "",
              description: "",
            })),
            isSettlement: false,
            isRiskControl: false,
            isCompliance: false,
            allowAI: false,
            usedByCapabilities: [],
            constrainedByRules: [],
            lifecycleRisk: (item.lifecycles || []).length === 0,
            lifecycle: (item.lifecycles || []).map((ls: any) => ({
              id: ls.id,
              mainId: ls.mainId,
              stateName: ls.stateName,
              systemCode: ls.systemCode,
              stateType: ls.stateType,
              description: ls.description || "",
              gmtCreate: ls.gmtCreate,
              gmtModified: ls.gmtModified,
              entryRules: ls.entryRules || [],
              allowedActions: ls.allowedActions || [],
              transitions: (ls.transitions || []).map((t: any) => ({
                id: t.id,
                targetStateId: t.targetStateId,
                triggerEvent: t.triggerEvent,
                description: t.description,
              })),
            })),
          };

          setEntities((prev) => {
            const exists = prev.some((e) => e.id === detailedEntity.id);
            if (exists) {
              return prev.map((e) => (e.id === detailedEntity.id ? detailedEntity : e));
            } else {
              // If we were using a temp ID, replace it
              return prev.map((e) => (e.id === targetId ? detailedEntity : e));
            }
          });
          if (selectedEntityId === targetId && targetId !== detailedEntity.id) {
            setSelectedEntityId(detailedEntity.id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch digital model detail:", error);
      }
    },
    [selectedEntityId],
  );

  useEffect(() => {
    if (selectedEntityId && !selectedEntityId.startsWith("e_")) {
      fetchDetail(selectedEntityId);
    }
  }, [selectedEntityId, fetchDetail]);

  // Wizard State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Entity>>({});

  const selectedEntity = useMemo(() => entities.find((e) => e.id === selectedEntityId), [entities, selectedEntityId]);

  const updateSelectedEntity = (newEntity: Entity) => {
    setEntities(entities.map((e) => (e.id === newEntity.id ? newEntity : e)));
  };

  const groupedEntities = useMemo(() => {
    const filtered = entities.filter(
      (e) => e.name.includes(searchQuery) || e.code.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    return {
      Master: filtered.filter((e) => e.type === "Master"),
      Transaction: filtered.filter((e) => e.type === "Transaction"),
      Result: filtered.filter((e) => e.type === "Result"),
    };
  }, [entities, searchQuery]);

  const handleCreateStart = () => {
    setFormData({
      isSettlement: false,
      isRiskControl: false,
      isCompliance: false,
      allowAI: false,
      relationships: [],
      attributes: [],
      dbMapping: { tableName: "", dataSource: "" },
    });
    setWizardStep(1);
    setIsEditing(false);
    setIsWizardOpen(true);
    setSelectedEntityId(null);
  };

  const handleEditStart = () => {
    if (!selectedEntity) return;
    setFormData({ ...selectedEntity });
    setWizardStep(1);
    setIsEditing(true);
    setIsWizardOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedEntity) return;
    try {
      await request.delete("/quote/api/v1/digital-model", { data: { id: selectedEntity.id } });
      await fetchList();
      setSelectedEntityId(null);
    } catch (error) {
      console.error("Failed to delete digital model:", error);
    }
  };

  const handleCreateFinish = async () => {
    const typeMap: Record<string, number> = {
      Master: 0,
      Transaction: 1,
      Result: 2,
    };

    const currentMainId = parseInt(mainId || "1");
    const currentDataSource = formData.dbMapping?.dataSource || "";

    const payload = {
      id: isEditing && selectedEntityId && !selectedEntityId.startsWith("e_") ? selectedEntityId : undefined,
      dataSource: currentDataSource,
      description: formData.description || "",
      fields: (formData.attributes || []).map((attr) => ({
        desensitization: !!attr.isSensitive,
        fieldName: attr.name,
        fieldType: attr.type,
        pk: !!attr.isPrimaryKey,
        required: !!attr.isRequired,
        description: attr.description || "",
        mainId: currentMainId,
        dataSource: currentDataSource,
      })),
      mainId: currentMainId,
      objectCode: formData.code || "",
      objectName: formData.name || "",
      relations: (formData.relationships || []).map((rel) => ({
        desensitization: false,
        foreignKey: rel.foreignKey || "",
        relationship: rel.relationship || "1:N",
        targetObject: rel.targetObject || "",
        pk: false,
        required: false,
        mainId: currentMainId,
        dataSource: currentDataSource,
      })),
      tableName: formData.dbMapping?.tableName || "",
      type: typeMap[formData.type || "Master"] || 0,
    };

    try {
      const response = isEditing
        ? await request.put("/quote/api/v1/digital-model", payload)
        : await request.post("/quote/api/v1/digital-model", payload);

      const backendId = response.data?.data?.id;
      await fetchList();
      if (!isEditing && backendId) {
        setSelectedEntityId(String(backendId));
      }

      setIsWizardOpen(false);
      setIsEditing(false);
    } catch (error) {
      console.error(`Failed to ${isEditing ? "update" : "save"} digital model:`, error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b flex items-center px-6 justify-between shrink-0 bg-white z-20">
        <div className="flex items-center gap-2">
          <Box className="h-5 w-5 text-primary" />
          <h1 className="font-semibold text-lg">业务对象工作台</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索业务对象..."
              className="pl-8 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={handleCreateStart} disabled={isWizardOpen}>
            <Plus className="h-4 w-4 mr-2" />
            新建对象
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Entity List */}
        <aside className="w-64 border-r bg-gray-50/50 flex flex-col shrink-0">
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-6 px-1">
              {[
                { type: "Master", label: "主数据对象", list: groupedEntities.Master },
                { type: "Transaction", label: "交易对象", list: groupedEntities.Transaction },
                { type: "Result", label: "结果对象", list: groupedEntities.Result },
              ].map((group) => (
                <div key={group.type}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3 px-2 flex items-center justify-between">
                    {group.label}
                    <Badge variant="secondary" className="text-[10px] h-4 px-1 min-w-[1.5rem] justify-center">
                      {group.list.length}
                    </Badge>
                  </h3>
                  <div className="space-y-1">
                    {group.list.map((entity) => (
                      <button
                        key={entity.id}
                        onClick={() => {
                          setSelectedEntityId(entity.id);
                          setIsWizardOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-md text-sm flex items-center gap-3 transition-colors ${
                          selectedEntityId === entity.id && !isWizardOpen
                            ? "bg-white shadow-sm ring-1 ring-primary/20 text-primary font-medium"
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        <EntityTypeIcon type={entity.type} />
                        <div className="flex-1 truncate">
                          <div className="truncate">{entity.name}</div>
                          <div className="text-xs text-gray-400 font-mono">{entity.code}</div>
                        </div>
                        {entity.lifecycleRisk && <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />}
                      </button>
                    ))}
                    {group.list.length === 0 && <div className="px-3 py-2 text-xs text-gray-400 italic">暂无对象</div>}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Main Area */}
        <main className="flex-1 overflow-hidden bg-white relative">
          {isWizardOpen ? (
            // --- Wizard Mode ---
            <div className="h-full overflow-y-auto">
              <div className="max-w-4xl mx-auto py-12 px-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-2">{isEditing ? "编辑业务对象" : "新建业务对象"}</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className={wizardStep >= 1 ? "text-primary font-medium" : ""}>1. 基础定义</span>
                    <ChevronRight className="h-4 w-4" />
                    <span className={wizardStep >= 2 ? "text-primary font-medium" : ""}>2. 属性与关联</span>
                  </div>
                  <Progress value={wizardStep * 50} className="h-1 mt-4" />
                </div>
                <div className="min-h-[500px]">
                  {wizardStep === 1 && (
                    <WizardStep1 data={formData} updateData={(d) => setFormData({ ...formData, ...d })} />
                  )}
                  {wizardStep === 2 && (
                    <WizardStep2
                      data={formData}
                      updateData={(d) => setFormData({ ...formData, ...d })}
                      entities={entities}
                    />
                  )}
                </div>

                <div className="flex justify-between mt-12 pt-6 border-t bg-white sticky bottom-0">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (wizardStep > 1) setWizardStep(wizardStep - 1);
                      else setIsWizardOpen(false);
                    }}
                  >
                    {wizardStep === 1 ? "取消" : "上一步"}
                  </Button>
                  <Button
                    onClick={() => {
                      if (wizardStep < 2) setWizardStep(wizardStep + 1);
                      else handleCreateFinish();
                    }}
                  >
                    {wizardStep === 2 ? "完成保存" : "下一步"}
                    {wizardStep < 2 && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          ) : selectedEntity ? (
            // --- Detail View with Tabs ---
            <div className="h-full flex flex-col">
              {/* Entity Header */}
              <div className="p-6 border-b flex items-start justify-between bg-white shrink-0">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                    {selectedEntity.type === "Master" ? (
                      <Database className="h-8 w-8 text-primary" />
                    ) : selectedEntity.type === "Transaction" ? (
                      <ShoppingCart className="h-8 w-8 text-green-600" />
                    ) : (
                      <FileText className="h-8 w-8 text-orange-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-bold text-gray-900">{selectedEntity.name}</h1>
                      <Badge variant="outline" className="font-mono bg-gray-50">
                        {selectedEntity.code}
                      </Badge>
                    </div>
                    <p className="text-gray-500 mt-1 max-w-2xl text-sm">{selectedEntity.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleEditStart}>
                    <Edit className="h-4 w-4 mr-2" /> 编辑
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-500 hover:bg-red-50 hover:text-red-600 border-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确认删除？</AlertDialogTitle>
                        <AlertDialogDescription>操作不可恢复。</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600">
                          删除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <Tabs defaultValue="model" className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 border-b bg-white">
                  <TabsList className="h-12 bg-transparent p-0 gap-6">
                    <TabsTrigger
                      value="model"
                      className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-0 text-sm font-medium"
                    >
                      <Layout className="h-4 w-4 mr-2" />
                      数据模型定义
                    </TabsTrigger>
                    <TabsTrigger
                      value="lifecycle"
                      className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-0 text-sm font-medium"
                    >
                      <Workflow className="h-4 w-4 mr-2" />
                      生命周期管理
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="model" className="flex-1 overflow-hidden m-0 p-0">
                  <div className="h-full flex">
                    {/* 1. Left: Meta Info (20%) */}
                    <div className="w-[280px] border-r p-6 bg-gray-50/30 overflow-y-auto">
                      <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Info className="h-4 w-4" /> 基础信息
                      </h3>
                      <div className="space-y-6">
                        <div>
                          <Label className="text-xs text-gray-500">对象类型</Label>
                          <div className="mt-1 text-sm font-medium">
                            {selectedEntity.type === "Master"
                              ? "主数据"
                              : selectedEntity.type === "Transaction"
                                ? "交易对象"
                                : "结果对象"}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">业务标签</Label>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {selectedEntity.isSettlement && (
                              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100">
                                结算
                              </Badge>
                            )}
                            {selectedEntity.isRiskControl && (
                              <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-100">
                                风控
                              </Badge>
                            )}
                            {selectedEntity.isCompliance && (
                              <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-100">
                                合规
                              </Badge>
                            )}
                            {selectedEntity.allowAI && (
                              <Badge variant="secondary" className="bg-sky-50 text-sky-700 border-sky-100">
                                AI
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Separator />
                        <div>
                          <Label className="text-xs text-gray-500">健康度检查</Label>
                          <div
                            className={`mt-2 p-3 rounded-lg border flex items-start gap-2 ${selectedEntity.lifecycleRisk ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"}`}
                          >
                            {selectedEntity.lifecycleRisk ? (
                              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                            ) : (
                              <ShieldCheck className="h-4 w-4 text-green-500 mt-0.5" />
                            )}
                            <div>
                              <div
                                className={`text-sm font-medium ${selectedEntity.lifecycleRisk ? "text-red-800" : "text-green-800"}`}
                              >
                                {selectedEntity.lifecycleRisk ? "风险提示" : "状态良好"}
                              </div>
                              {selectedEntity.lifecycleRisk && (
                                <p className="text-xs text-red-600 mt-1">缺少生命周期定义</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. Middle: Attributes & DB Mapping (50%) */}
                    <div className="flex-1 border-r flex flex-col min-w-0">
                      {/* DB Mapping Card */}
                      <div className="p-6 border-b bg-slate-50/50">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Database className="h-4 w-4" /> 数据库映射
                        </h3>
                        <div className="flex items-center gap-4 text-sm font-mono bg-white border rounded-md p-3 shadow-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">DataSource:</span>
                            <span className="text-blue-600 font-semibold">
                              {selectedEntity.dbMapping?.dataSource || "N/A"}
                            </span>
                          </div>
                          <ArrowRight className="h-3 w-3 text-gray-300" />
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">Table:</span>
                            <span className="text-purple-600 font-semibold">
                              {selectedEntity.dbMapping?.tableName || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Attributes Table */}
                      <div className="flex-1 overflow-y-auto p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <TableIcon className="h-4 w-4" /> 属性列表
                          </h3>
                          <Badge variant="outline">{selectedEntity.attributes.length} Fields</Badge>
                        </div>
                        <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader className="bg-gray-50">
                              <TableRow>
                                <TableHead className="w-[10px]"></TableHead>
                                <TableHead>Field Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-center">Attr</TableHead>
                                <TableHead>Description</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedEntity.attributes.map((attr) => (
                                <TableRow key={attr.id} className="text-xs">
                                  <TableCell className="text-center py-2">
                                    {attr.isPrimaryKey && <Key className="h-3 w-3 text-yellow-500" />}
                                  </TableCell>
                                  <TableCell className="font-mono font-medium py-2">{attr.name}</TableCell>
                                  <TableCell className="text-gray-500 py-2">{attr.type}</TableCell>
                                  <TableCell className="text-center py-2">
                                    <div className="flex justify-center gap-1">
                                      {attr.isRequired && (
                                        <span className="text-[10px] bg-red-100 text-red-700 px-1 rounded">Req</span>
                                      )}
                                      {attr.isSensitive && <Lock className="h-3 w-3 text-gray-400" />}
                                    </div>
                                  </TableCell>
                                  <TableCell
                                    className="text-gray-500 py-2 max-w-[150px] truncate"
                                    title={attr.description}
                                  >
                                    {attr.description}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>

                    {/* 3. Right: Relationship Graph (30%) */}
                    <div className="w-[320px] bg-white flex flex-col min-w-0">
                      <div className="p-4 border-b">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          <Network className="h-4 w-4" /> 关联拓扑
                        </h3>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 bg-slate-50/30">
                        {/* Central Node */}
                        <div className="flex justify-center mb-8">
                          <div className="bg-primary/10 text-primary border-primary border px-4 py-2 rounded-lg shadow-sm font-bold flex items-center gap-2">
                            <Box className="h-4 w-4" />
                            {selectedEntity.name}
                          </div>
                        </div>

                        {/* Relationships */}
                        <div className="space-y-4 relative">
                          {/* Vertical Line */}
                          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 -z-10 transform -translate-x-1/2"></div>

                          {selectedEntity.relationships.map((rel, idx) => (
                            <div
                              key={idx}
                              className="relative bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline" className="text-[10px] h-5 bg-slate-50">
                                  {rel.relationship}
                                </Badge>
                                <div className="text-[10px] text-gray-400 font-mono">FK: {rel.foreignKey || "N/A"}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <ArrowLeftRight className="h-3 w-3 text-gray-400" />
                                <span className="font-medium text-sm text-gray-700">{rel.targetObject}</span>
                              </div>
                              <div className="mt-1 text-xs text-gray-400">{rel.description}</div>
                            </div>
                          ))}

                          {selectedEntity.relationships.length === 0 && (
                            <div className="text-center text-xs text-gray-400 py-4 bg-white/50 rounded border border-dashed">
                              无关联对象
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bottom Tabs: System Inference */}
                      <div className="h-1/3 border-t bg-white flex flex-col">
                        <Tabs defaultValue="capabilities" className="flex-1 flex flex-col">
                          <div className="px-4 pt-2 border-b">
                            <TabsList className="h-8 bg-transparent p-0">
                              <TabsTrigger
                                value="capabilities"
                                className="text-xs h-8 px-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
                              >
                                能力引用
                              </TabsTrigger>
                              <TabsTrigger
                                value="rules"
                                className="text-xs h-8 px-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
                              >
                                规则约束
                              </TabsTrigger>
                              <TabsTrigger
                                value="sql"
                                className="text-xs h-8 px-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
                              >
                                SQL 预览
                              </TabsTrigger>
                            </TabsList>
                          </div>
                          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
                            <TabsContent value="capabilities" className="mt-0 space-y-2">
                              {selectedEntity.usedByCapabilities.map((cap, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                                  <Zap className="h-3 w-3 text-yellow-500" /> {cap}
                                </div>
                              ))}
                            </TabsContent>
                            <TabsContent value="rules" className="mt-0 space-y-2">
                              {selectedEntity.constrainedByRules.map((rule, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                                  <Scale className="h-3 w-3 text-blue-500" /> {rule}
                                </div>
                              ))}
                            </TabsContent>
                            <TabsContent value="sql" className="mt-0">
                              <pre className="text-[10px] font-mono bg-slate-800 text-green-400 p-2 rounded overflow-x-auto">
                                {`CREATE TABLE ${selectedEntity.dbMapping?.tableName || "unknown"} (\n  ${selectedEntity.attributes.map((a) => `${a.name} ${a.type}${a.isPrimaryKey ? " PRIMARY KEY" : ""}`).join(",\n  ")}\n);`}
                              </pre>
                            </TabsContent>
                          </div>
                        </Tabs>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="lifecycle" className="flex-1 overflow-hidden m-0 p-0">
                  <LifecycleView
                    entity={selectedEntity}
                    updateEntity={updateSelectedEntity}
                    refreshDetail={fetchDetail}
                  />
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 flex-col gap-4">
              <Box className="h-16 w-16 opacity-20" />
              <p>请选择左侧对象查看详情，或点击新建</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BusinessEntityWorkbench;
