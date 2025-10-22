import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Copy,
  Settings,
  Eye,
  FileText,
  Users,
  Clock,
  CheckCircle,
  ChevronDown,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  ApprovalNodeType,
  ApprovalWorkflow,
  DocumentStatus,
  DocumentType,
} from "@/types/approval";
import { WorkflowDiagram } from "./WorkflowDiagram";
import { approvalService } from "@/services/approvalService";
import { useAuthStore } from "@/stores/authStore";
import { request } from "@/lib/request";
import ApproverSelector, {
  ApproverOption,
} from "./components/ApproverSelector";
import { toast } from "@/components/ui/use-toast";

const APPROVAL_NODE_TYPE_VALUES: ApprovalNodeType[] = [
  ApprovalNodeType.SINGLE,
  ApprovalNodeType.MULTIPLE,
  ApprovalNodeType.ANY_ONE,
  ApprovalNodeType.SEQUENTIAL,
];

const APPROVAL_NODE_TYPE_LABELS: Record<ApprovalNodeType, string> = {
  [ApprovalNodeType.SINGLE]: "单人审批",
  [ApprovalNodeType.MULTIPLE]: "多人审批（全部同意）",
  [ApprovalNodeType.ANY_ONE]: "多人审批（任意一人即可）",
  [ApprovalNodeType.SEQUENTIAL]: "顺序审批",
};

const APPROVAL_NODE_TYPE_OPTIONS = APPROVAL_NODE_TYPE_VALUES.map((value) => ({
  value,
  label: APPROVAL_NODE_TYPE_LABELS[value],
}));

const normalizeNodeType = (type?: string | null): ApprovalNodeType =>
  APPROVAL_NODE_TYPE_VALUES.includes(type as ApprovalNodeType)
    ? (type as ApprovalNodeType)
    : ApprovalNodeType.SINGLE;

const mapToApproverOption = (input: any): ApproverOption | null => {
  if (!input) {
    return null;
  }

  const rawId = input.userId ?? input.id;
  if (rawId === undefined || rawId === null) {
    return null;
  }

  const userId = Number(rawId);
  if (!Number.isFinite(userId)) {
    return null;
  }

  const userName = input.userName ?? input.name ?? input.account;
  if (!userName) {
    return null;
  }

  return {
    userId,
    userName,
    roleName: input.roleName ?? input.role ?? input.role_name ?? undefined,
    deptName: input.deptName ?? input.department ?? input.dept ?? undefined,
  };
};

interface ApprovalConfigProps {}

const ApprovalConfig: React.FC<ApprovalConfigProps> = () => {
  const { user } = useAuthStore();
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] =
    useState<ApprovalWorkflow | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [filterBillType, setFilterBillType] = useState<number | "all">("all");

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // 加载状态
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  // 新建流程表单状态
  const [newWorkflow, setNewWorkflow] = useState({
    processName: "",
    description: "",
    billType: 0,
    companyId: user?.companyid || "",
    status: 1,
    triggerStatus: DocumentStatus.DRAFT,
    approvedStatus: DocumentStatus.APPROVED,
    rejectedStatus: DocumentStatus.REJECTED,
    nodes: [] as any[],
  });

  // 当前编辑的节点
  const [currentNode, setCurrentNode] = useState({
    nodeName: "",
    description: "",
    nodeType: ApprovalNodeType.SINGLE,
    approverType: 0,
    approvers: [] as ApproverOption[],
    timeLimit: 24,
    required: true,
  });

  // 加载审批流程列表
  const loadWorkflows = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await approvalService.getWorkflows({
        currentPage,
        pageSize,
        search: searchTerm,
        billType: filterBillType === "all" ? undefined : filterBillType,
        status:
          filterStatus === "all"
            ? undefined
            : filterStatus === "active"
              ? 1
              : 0,
      });

      if (response.success) {
        setWorkflows(response.data.items);
        setTotal(response.data.total);
      } else {
        setError(response.message || "加载数据失败");
      }
    } catch (err) {
      console.error("加载审批流程列表失败:", err);
      setError(err instanceof Error ? err.message : "加载数据失败");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, filterStatus, filterBillType]);

  // 加载可选的审批人员
  const fetchApproverPage = useCallback(
    async ({
      page,
      limit,
      keyword,
    }: {
      page: number;
      limit: number;
      keyword?: string;
    }) => {
      const response = await request.post("/admin/api/v1/users/list", {
        page,
        limit,
        searchKeywords: keyword?.trim() ? keyword.trim() : undefined,
      });

      const data = response?.data?.data;
      const records: any[] = Array.isArray(data?.records) ? data.records : [];
      const total =
        typeof data?.total === "number" ? data.total : records.length;

      const users = records
        .map(mapToApproverOption)
        .filter((user): user is ApproverOption => user !== null);

      return {
        users,
        total,
      };
    },
    [],
  );

  // 初次加载和筛选条件变化时重新加载
  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  const handleSearchTermChange = (value: string) => {
    setCurrentPage(1);
    setSearchTerm(value);
  };

  const handleStatusFilterChange = (value: "all" | "active" | "inactive") => {
    setCurrentPage(1);
    setFilterStatus(value);
  };

  const handleBillTypeFilterChange = (value: string) => {
    setCurrentPage(1);
    setFilterBillType(value === "all" ? "all" : Number(value));
  };

  const handleCreateWorkflow = () => {
    setNewWorkflow({
      processName: "",
      description: "",
      billType: 0,
      companyId: user?.companyid || "",
      status: 1,
      triggerStatus: DocumentStatus.DRAFT,
      approvedStatus: DocumentStatus.APPROVED,
      rejectedStatus: DocumentStatus.REJECTED,
      nodes: [],
    });
    setIsCreateDialogOpen(true);
    setSelectedWorkflow(null);
  };

  const handleEditWorkflow = (workflow: ApprovalWorkflow) => {
    if (!workflow) return;

    setSelectedWorkflow(workflow);
    setNewWorkflow({
      processName: workflow.processName || "",
      description: workflow.description || "",
      billType: workflow.billType || 0,
      companyId: workflow.companyId || user?.companyid || "",
      status: workflow.status !== undefined ? workflow.status : 1,
      nodes: (workflow.nodes || []).map((node) => ({
        id: node.id || 0,
        nodeName: node.nodeName || "",
        description: node.description || "",
        nodeType: normalizeNodeType(node.nodeType),
        sortOrder: node.sortOrder || 0,
        approverType: node.approverType || 0,
        approvers: (node.approvers || [])
          .map(mapToApproverOption)
          .filter((approver): approver is ApproverOption => approver !== null),
        timeLimit: node.timeLimit || 24,
        required: node.required !== undefined ? node.required : true,
      })),
      triggerStatus: workflow.triggerStatus,
      approvedStatus: workflow.approvedStatus,
      rejectedStatus: workflow.rejectedStatus,
    });
    setIsEditDialogOpen(true);
  };

  const handleViewWorkflow = (workflow: ApprovalWorkflow) => {
    if (!workflow) return;
    setSelectedWorkflow(workflow);
    setIsDetailDialogOpen(true);
  };

  const handleDeleteWorkflow = (workflowId: string) => {
    // setWorkflows(prev => prev.filter(w => w.id !== workflowId));
    approvalService.deleteWorkflow(workflowId).then((data) => {
      if (data.success) {
        loadWorkflows();
        toast({
          title: "删除成功",
        });
      }
    });
  };

  const handleToggleWorkflowStatus = async (workflow: ApprovalWorkflow) => {
    if (!workflow || statusUpdatingId === workflow.id) {
      return;
    }

    const nextStatus = workflow.status === 1 ? 0 : 1;

    try {
      setStatusUpdatingId(workflow.id);
      setError(null);

      const response = await approvalService.toggleWorkflowStatus(
        workflow.id,
        nextStatus,
      );

      if (response.success) {
        setWorkflows((prev) =>
          prev.map((w) =>
            w.id === workflow.id ? { ...w, status: nextStatus } : w,
          ),
        );
      } else {
        setError(response.message || "更新审批流程状态失败");
      }
    } catch (err) {
      console.error("更新审批流程状态失败:", err);
      setError(err instanceof Error ? err.message : "更新审批流程状态失败");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleCopyWorkflow = (workflow: ApprovalWorkflow) => {
    const newWorkflow: ApprovalWorkflow = {
      ...workflow,
      id: "",
      processName: `${workflow.processName} (副本)`,
      status: 0,
    };
    setWorkflows((prev) => [...prev, newWorkflow]);
  };

  const handleSaveWorkflow = async () => {
    if (!newWorkflow.processName.trim()) {
      setError("请输入流程名称");
      return;
    }

    if (newWorkflow.nodes.length === 0) {
      setError("请至少添加一个审批节点");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const workflowData: any = {
        processName: newWorkflow.processName,
        description: newWorkflow.description,
        billType: newWorkflow.billType,
        companyId: newWorkflow.companyId,
        status: newWorkflow.status,
        nodes: newWorkflow.nodes.map((node: any, index) => ({
          nodeName: node.nodeName,
          description: node.description,
          nodeType: node.nodeType,
          sortOrder: index + 1,
          approverType: node.approverType,
          approvers: node.approvers.map((approver: ApproverOption) => ({
            userId: approver.userId,
            userName: approver.userName,
            roleName: approver.roleName,
          })),
          timeLimit: node.timeLimit,
          required: node.required,
        })),
        triggerStatus: newWorkflow.triggerStatus,
        approvedStatus: newWorkflow.approvedStatus,
        rejectedStatus: newWorkflow.rejectedStatus,
      };

      let response;
      if (selectedWorkflow) {
        // 编辑模式 - 包含 id
        response = await approvalService.updateWorkflow(
          selectedWorkflow.id,
          workflowData,
        );
      } else {
        // 新建模式
        response = await approvalService.createWorkflow(workflowData);
      }
      if (response.success) {
        // 关闭对话框
        setIsCreateDialogOpen(false);
        setIsEditDialogOpen(false);
        setSelectedWorkflow(null);

        if (selectedWorkflow) {
          await loadWorkflows();
        } else if (currentPage !== 1) {
          setCurrentPage(1);
        } else {
          await loadWorkflows();
        }
      } else {
        setError(response.message || "保存失败");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNode = () => {
    const newNode = {
      id: Date.now(),
      nodeName:
        currentNode.nodeName || `审批节点 ${newWorkflow.nodes.length + 1}`,
      description: currentNode.description,
      nodeType: currentNode.nodeType,
      sortOrder: newWorkflow.nodes.length + 1,
      approverType: currentNode.approverType,
      approvers: [...currentNode.approvers],
      timeLimit: currentNode.timeLimit,
      required: currentNode.required,
    };

    setNewWorkflow((prev) => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
    }));

    // 重置��前节点
    setCurrentNode({
      nodeName: "",
      description: "",
      nodeType: ApprovalNodeType.SINGLE,
      approverType: 0,
      approvers: [] as ApproverOption[],
      timeLimit: 24,
      required: true,
    });
  };

  const handleRemoveNode = (index: number) => {
    setNewWorkflow((prev) => ({
      ...prev,
      nodes: prev.nodes.filter((_, i) => i !== index),
    }));
  };

  const handleApproversChange = (approvers: ApproverOption[]) => {
    setCurrentNode((prev) => {
      if (prev.nodeType === ApprovalNodeType.SINGLE) {
        const lastSelected =
          approvers.length > 0 ? approvers[approvers.length - 1] : null;
        return {
          ...prev,
          approvers: lastSelected ? [lastSelected] : [],
        };
      }
      return {
        ...prev,
        approvers,
      };
    });
  };

  const handleNodeTypeChange = (value: ApprovalNodeType) => {
    setCurrentNode((prev) => {
      const shouldClear =
        value === ApprovalNodeType.SINGLE && prev.approvers.length > 1;
      const nextApprovers =
        value === ApprovalNodeType.SINGLE
          ? shouldClear
            ? []
            : prev.approvers.slice(0, 1)
          : prev.approvers;
      return {
        ...prev,
        nodeType: value,
        approvers: nextApprovers,
      };
    });
  };

  const getNodeTypeLabel = (type: string) => {
    const label = APPROVAL_NODE_TYPE_LABELS[type as ApprovalNodeType];
    return label ?? type;
  };

  const getBillTypeLabel = (billType: number) => {
    const labels: Record<number, string> = {
      0: "费用报销",
      1: "营销活动",
      2: "采购申请",
      3: "请假申请",
      4: "合同审批",
      5: "产品发布",
    };
    return labels[billType] || `类型${billType}`;
  };

  const getDocumentTypeLabel = (type: DocumentType) => {
    const labels: Record<DocumentType, string> = {
      [DocumentType.EXPENSE_REIMBURSEMENT]: "费用报销",
      [DocumentType.BUDGET_APPLICATION]: "预算申请",
      [DocumentType.PAYMENT_REQUEST]: "付款申请",
      [DocumentType.INVOICE_APPROVAL]: "发票审批",
      [DocumentType.LEAVE_REQUEST]: "请假申请",
      [DocumentType.RECRUITMENT]: "招聘申请",
      [DocumentType.PROMOTION]: "晋升申请",
      [DocumentType.SALARY_ADJUSTMENT]: "资调整",
      [DocumentType.PURCHASE_REQUEST]: "采购申请",
      [DocumentType.CONTRACT_APPROVAL]: "合同审批",
      [DocumentType.VENDOR_APPROVAL]: "供应商审批",
      [DocumentType.MARKETING_CAMPAIGN]: "营销活动",
      [DocumentType.PROMOTION_ACTIVITY]: "促销活动",
      [DocumentType.CONTENT_APPROVAL]: "内容审批",
      [DocumentType.SYSTEM_CONFIG]: "系统配置",
      [DocumentType.USER_PERMISSION]: "用户权限",
      [DocumentType.DATA_EXPORT]: "数据导出",
    };
    return labels[type] || type;
  };

  const getDocumentStatusLabel = (status: DocumentStatus) => {
    const labels: Record<DocumentStatus, string> = {
      [DocumentStatus.DRAFT]: "草稿",
      [DocumentStatus.SUBMITTED]: "已提交",
      [DocumentStatus.REVIEWING]: "审核中",
      [DocumentStatus.APPROVED]: "已通过",
      [DocumentStatus.REJECTED]: "已拒绝",
      [DocumentStatus.CANCELLED]: "已取消",
      [DocumentStatus.COMPLETED]: "已完成",
      [DocumentStatus.ARCHIVED]: "已归档",
    };
    return labels[status] || `状态${status}`;
  };

  // 获取所有状态枚举���（仅数字值，���免双向映射问题）
  const documentStatusList = [
    DocumentStatus.DRAFT,
    DocumentStatus.SUBMITTED,
    DocumentStatus.REVIEWING,
    DocumentStatus.APPROVED,
    DocumentStatus.REJECTED,
    DocumentStatus.CANCELLED,
    DocumentStatus.COMPLETED,
    DocumentStatus.ARCHIVED,
  ];

  return (
    <div className="p-6 space-y-6">
      {/* 搜索和过滤 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">搜索流程</Label>
              <Input
                id="search"
                placeholder="输入流程名称或描述..."
                value={searchTerm}
                onChange={(e) => handleSearchTermChange(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="status-filter">状态</Label>
              <Select
                value={filterStatus}
                onValueChange={(value) =>
                  handleStatusFilterChange(
                    value as "all" | "active" | "inactive",
                  )
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="active">启用</SelectItem>
                  <SelectItem value="inactive">禁用</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type-filter">单据类型</Label>
              <Select
                value={String(filterBillType)}
                onValueChange={(value) => handleBillTypeFilterChange(value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="0">费用报销</SelectItem>
                  <SelectItem value="1">营销活动</SelectItem>
                  <SelectItem value="2">采购申请</SelectItem>
                  <SelectItem value="3">请假申请</SelectItem>
                  <SelectItem value="4">合同审批</SelectItem>
                  <SelectItem value="5">产品发布</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex justify-start">
        <Button
          onClick={handleCreateWorkflow}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          新建流程
        </Button>
      </div>

      {/* 错误提示 */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 加载状态 */}
      {loading && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">加载中...</p>
          </CardContent>
        </Card>
      )}

      {/* 分页信息 */}
      {!loading && !error && workflows.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">共 {total} 条记录</div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              第 {currentPage} / {Math.ceil(total / pageSize)} 页
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= Math.ceil(total / pageSize) || loading}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      )}

      {/* 工作流列表 */}
      {!loading && !error && (
        <div className="grid gap-4">
          {workflows.map((workflow) => (
            <Card
              key={workflow.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">
                        {workflow.processName}
                      </CardTitle>
                      <Badge
                        variant={
                          workflow.status === 1 ? "default" : "secondary"
                        }
                      >
                        {workflow.status === 1 ? "启用" : "禁用"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {workflow.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {getBillTypeLabel(workflow.billType)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {workflow.nodes.length} 个节点
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewWorkflow(workflow)}
                      title="查看详情"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleWorkflowStatus(workflow)}
                      title={workflow.status === 1 ? "禁用流程" : "启用流程"}
                      disabled={statusUpdatingId === workflow.id}
                    >
                      {statusUpdatingId === workflow.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : workflow.status === 1 ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditWorkflow(workflow)}
                      title="编辑流程"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {/* <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyWorkflow(workflow)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button> */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认删除</AlertDialogTitle>
                          <AlertDialogDescription>
                            确定要删除审批流程 "{workflow.processName}"
                            吗？此操作不可撤销
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteWorkflow(workflow.id)}
                          >
                            确认删除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm font-medium">审批节点：</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {workflow.nodes.map((node, index) => (
                      <React.Fragment key={node.id}>
                        <Badge variant="outline" className="text-sm">
                          {index + 1} {node.nodeName} (
                          {getNodeTypeLabel(node.nodeType)})
                        </Badge>
                        {index < workflow.nodes.length - 1 && (
                          <span className="text-muted-foreground">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* 空状态 */}
          {workflows.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>暂无符合条件的审批流程</p>
                <Button onClick={handleCreateWorkflow} className="mt-4">
                  创建第一个审批流程
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 创建流程对话框 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>创建新的审批流程</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">基本信息</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="workflow-name">流程名称 *</Label>
                  <Input
                    id="workflow-name"
                    value={newWorkflow.processName}
                    onChange={(e) =>
                      setNewWorkflow((prev) => ({
                        ...prev,
                        processName: e.target.value,
                      }))
                    }
                    placeholder="请输入流程名称"
                  />
                </div>
                <div>
                  <Label htmlFor="document-type">单据类型 *</Label>
                  <Select
                    value={String(newWorkflow.billType)}
                    onValueChange={(value: string) =>
                      setNewWorkflow((prev) => ({
                        ...prev,
                        billType: Number(value),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">费用报销</SelectItem>
                      <SelectItem value="1">营销活动</SelectItem>
                      <SelectItem value="2">采购申请</SelectItem>
                      <SelectItem value="3">请假申请</SelectItem>
                      <SelectItem value="4">合同审批</SelectItem>
                      <SelectItem value="5">产品发布</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="workflow-description">流程描述</Label>
                <Input
                  id="workflow-description"
                  value={newWorkflow.description}
                  onChange={(e) =>
                    setNewWorkflow((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="请输入流程描述"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="workflow-active"
                  checked={newWorkflow.status === 1}
                  onChange={(e) =>
                    setNewWorkflow((prev) => ({
                      ...prev,
                      status: e.target.checked ? 1 : 0,
                    }))
                  }
                />
                <Label htmlFor="workflow-active">启用此流程</Label>
              </div>

              {/* 流程状态流转配置 */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="text-sm font-semibold">流程状态配置</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="workflow-trigger-status">触发状态</Label>
                    <Select
                      value={String(newWorkflow.triggerStatus)}
                      onValueChange={(value) =>
                        setNewWorkflow((prev) => ({
                          ...prev,
                          triggerStatus: Number(value) as DocumentStatus,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {documentStatusList.map((status) => (
                          <SelectItem key={status} value={String(status)}>
                            {getDocumentStatusLabel(status)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="workflow-approved-status">通过后状态</Label>
                    <Select
                      value={String(newWorkflow.approvedStatus)}
                      onValueChange={(value) =>
                        setNewWorkflow((prev) => ({
                          ...prev,
                          approvedStatus: Number(value) as DocumentStatus,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {documentStatusList.map((status) => (
                          <SelectItem key={status} value={String(status)}>
                            {getDocumentStatusLabel(status)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="workflow-rejected-status">拒绝后状态</Label>
                    <Select
                      value={String(newWorkflow.rejectedStatus)}
                      onValueChange={(value) =>
                        setNewWorkflow((prev) => ({
                          ...prev,
                          rejectedStatus: Number(value) as DocumentStatus,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {documentStatusList.map((status) => (
                          <SelectItem key={status} value={String(status)}>
                            {getDocumentStatusLabel(status)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* 审批节点配置 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">审批节点配置</h3>

              {/* 已添加的节点列表 */}
              {newWorkflow.nodes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">已配置节点：</h4>
                  {newWorkflow.nodes.map((node, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">节点 {index + 1}</Badge>
                            <span className="font-medium">{node.nodeName}</span>
                            <Badge variant="secondary">
                              {getNodeTypeLabel(node.nodeType)}
                            </Badge>
                          </div>
                          {node.description && (
                            <p className="text-sm text-muted-foreground">
                              {node.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>审批人：{node.approvers.length} 人</span>
                            <span>时限：{node.timeLimit} 小时</span>
                            {node.required && (
                              <Badge variant="destructive" className="text-xs">
                                必须
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {node.approvers.map((approver: any) => (
                              <Badge
                                key={approver.userId}
                                variant="outline"
                                className="text-xs"
                              >
                                {approver.userName} ({approver.roleName})
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveNode(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* 添加新节点 */}
              <Card className="p-4">
                <h4 className="font-medium mb-4">添加新节点</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="node-name">节点名称</Label>
                      <Input
                        id="node-name"
                        value={currentNode.nodeName}
                        onChange={(e) =>
                          setCurrentNode((prev) => ({
                            ...prev,
                            nodeName: e.target.value,
                          }))
                        }
                        placeholder={`审批节点 ${newWorkflow.nodes.length + 1}`}
                      />
                    </div>
                    <div>
                      <Label htmlFor="node-type">审批类型</Label>
                      <Select
                        value={currentNode.nodeType}
                        onValueChange={(value) =>
                          handleNodeTypeChange(value as ApprovalNodeType)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {APPROVAL_NODE_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="node-description">节点描述</Label>
                    <Input
                      id="node-description"
                      value={currentNode.description}
                      onChange={(e) =>
                        setCurrentNode((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="请输入节点描述"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="time-limit">审批时限（小时）</Label>
                      <Input
                        id="time-limit"
                        type="number"
                        value={currentNode.timeLimit}
                        onChange={(e) =>
                          setCurrentNode((prev) => ({
                            ...prev,
                            timeLimit: parseInt(e.target.value) || 24,
                          }))
                        }
                        min="1"
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <input
                        type="checkbox"
                        id="node-required"
                        checked={currentNode.required}
                        onChange={(e) =>
                          setCurrentNode((prev) => ({
                            ...prev,
                            required: e.target.checked,
                          }))
                        }
                      />
                      <Label htmlFor="node-required">必须审批</Label>
                    </div>
                  </div>

                  {/* 审批人员选择 */}
                  <div>
                    <Label>选择审批人员</Label>
                    <div className="mt-2">
                      <ApproverSelector
                        value={currentNode.approvers}
                        onChange={handleApproversChange}
                        fetchOptions={fetchApproverPage}
                        selectionMode={
                          currentNode.nodeType === ApprovalNodeType.SINGLE
                            ? "single"
                            : "multiple"
                        }
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleAddNode}
                    disabled={
                      !currentNode.nodeName.trim() ||
                      currentNode.approvers.length === 0
                    }
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    添加节点
                  </Button>
                </div>
              </Card>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                取消
              </Button>
              <Button
                onClick={handleSaveWorkflow}
                disabled={
                  !newWorkflow.processName.trim() ||
                  newWorkflow.nodes.length === 0
                }
              >
                创建流程
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 编辑流程对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑审批流程</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">基本信息</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-workflow-name">流程名称 *</Label>
                  <Input
                    id="edit-workflow-name"
                    value={newWorkflow.processName}
                    onChange={(e) =>
                      setNewWorkflow((prev) => ({
                        ...prev,
                        processName: e.target.value,
                      }))
                    }
                    placeholder="请输入流程名称"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-document-type">单据类型 *</Label>
                  <Select
                    value={String(newWorkflow.billType)}
                    onValueChange={(value: string) =>
                      setNewWorkflow((prev) => ({
                        ...prev,
                        billType: Number(value),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">费用报销</SelectItem>
                      <SelectItem value="1">营销活动</SelectItem>
                      <SelectItem value="2">采购申请</SelectItem>
                      <SelectItem value="3">请假申请</SelectItem>
                      <SelectItem value="4">合同审批</SelectItem>
                      <SelectItem value="5">产品发布</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-workflow-description">流程描述</Label>
                <Input
                  id="edit-workflow-description"
                  value={newWorkflow.description}
                  onChange={(e) =>
                    setNewWorkflow((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="请输入流程描述"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-workflow-active"
                  checked={newWorkflow.status === 1}
                  onChange={(e) =>
                    setNewWorkflow((prev) => ({
                      ...prev,
                      status: e.target.checked ? 1 : 0,
                    }))
                  }
                />
                <Label htmlFor="edit-workflow-active">启用此流程</Label>
              </div>
            </div>

            {/* 流程状态流转配置 */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-semibold">流程状态配置</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="workflow-trigger-status">触发状态</Label>
                  <Select
                    value={String(newWorkflow.triggerStatus)}
                    onValueChange={(value) =>
                      setNewWorkflow((prev) => ({
                        ...prev,
                        triggerStatus: Number(value) as DocumentStatus,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {documentStatusList.map((status) => (
                        <SelectItem key={status} value={String(status)}>
                          {getDocumentStatusLabel(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="workflow-approved-status">通过后状态</Label>
                  <Select
                    value={String(newWorkflow.approvedStatus)}
                    onValueChange={(value) =>
                      setNewWorkflow((prev) => ({
                        ...prev,
                        approvedStatus: Number(value) as DocumentStatus,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {documentStatusList.map((status) => (
                        <SelectItem key={status} value={String(status)}>
                          {getDocumentStatusLabel(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="workflow-rejected-status">拒绝后状态</Label>
                  <Select
                    value={String(newWorkflow.rejectedStatus)}
                    onValueChange={(value) =>
                      setNewWorkflow((prev) => ({
                        ...prev,
                        rejectedStatus: Number(value) as DocumentStatus,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {documentStatusList.map((status) => (
                        <SelectItem key={status} value={String(status)}>
                          {getDocumentStatusLabel(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* ���批节点配置 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">审批节点配置</h3>

              {/* 已添加的节点列表 */}
              {newWorkflow.nodes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">已配置节点：</h4>
                  {newWorkflow.nodes.map((node, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">节点 {index + 1}</Badge>
                            <span className="font-medium">{node.nodeName}</span>
                            <Badge variant="secondary">
                              {getNodeTypeLabel(node.nodeType)}
                            </Badge>
                          </div>
                          {node.description && (
                            <p className="text-sm text-muted-foreground">
                              {node.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>审批人：{node.approvers.length} 人</span>
                            <span>时限：{node.timeLimit} 小时</span>
                            {node.required && (
                              <Badge variant="destructive" className="text-xs">
                                必须
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {node.approvers.map((approver: any) => (
                              <Badge
                                key={approver.userId}
                                variant="outline"
                                className="text-xs"
                              >
                                {approver.userName} ({approver.roleName})
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveNode(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* 添加新节点 */}
              <Card className="p-4">
                <h4 className="font-medium mb-4">添加新节点</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-node-name">节点名称</Label>
                      <Input
                        id="edit-node-name"
                        value={currentNode.nodeName}
                        onChange={(e) =>
                          setCurrentNode((prev) => ({
                            ...prev,
                            nodeName: e.target.value,
                          }))
                        }
                        placeholder={`审批节点 ${newWorkflow.nodes.length + 1}`}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-node-type">审批类型</Label>
                      <Select
                        value={currentNode.nodeType}
                        onValueChange={(value) =>
                          handleNodeTypeChange(value as ApprovalNodeType)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {APPROVAL_NODE_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="edit-node-description">节点描述</Label>
                    <Input
                      id="edit-node-description"
                      value={currentNode.description}
                      onChange={(e) =>
                        setCurrentNode((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="请输入节点描述"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-time-limit">审批时限（小时）</Label>
                      <Input
                        id="edit-time-limit"
                        type="number"
                        value={currentNode.timeLimit}
                        onChange={(e) =>
                          setCurrentNode((prev) => ({
                            ...prev,
                            timeLimit: parseInt(e.target.value) || 24,
                          }))
                        }
                        min="1"
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <input
                        type="checkbox"
                        id="edit-node-required"
                        checked={currentNode.isRequired}
                        onChange={(e) =>
                          setCurrentNode((prev) => ({
                            ...prev,
                            isRequired: e.target.checked,
                          }))
                        }
                      />
                      <Label htmlFor="edit-node-required">必须审批</Label>
                    </div>
                  </div>

                  {/* 审批人员选择 */}
                  <div>
                    <Label>选择审批人员</Label>
                    <div className="mt-2">
                      <ApproverSelector
                        value={currentNode.approvers}
                        onChange={handleApproversChange}
                        fetchOptions={fetchApproverPage}
                        selectionMode={
                          currentNode.nodeType === ApprovalNodeType.SINGLE
                            ? "single"
                            : "multiple"
                        }
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleAddNode}
                    disabled={
                      !currentNode.nodeName.trim() ||
                      currentNode.approvers.length === 0
                    }
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    添加节点
                  </Button>
                </div>
              </Card>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                取消
              </Button>
              <Button
                onClick={handleSaveWorkflow}
                disabled={
                  !newWorkflow.processName.trim() ||
                  newWorkflow.nodes.length === 0
                }
              >
                保存修改
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 详情查看对话框 */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>审批流程详情</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">基本信息</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    流程名称
                  </Label>
                  <p className="text-sm">{selectedWorkflow?.processName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    单据类型
                  </Label>
                  <p className="text-sm">
                    {selectedWorkflow &&
                      getBillTypeLabel(selectedWorkflow.billType)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    流程状态
                  </Label>
                  <Badge
                    variant={
                      selectedWorkflow?.status === 1 ? "default" : "secondary"
                    }
                  >
                    {selectedWorkflow?.status === 1 ? "启用" : "禁用"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    节点数量
                  </Label>
                  <p className="text-sm">
                    {selectedWorkflow?.nodes.length} 个节点
                  </p>
                </div>
              </div>
              {selectedWorkflow?.description && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    流程描述
                  </Label>
                  <p className="text-sm">{selectedWorkflow.description}</p>
                </div>
              )}
            </div>

            {/* 审批流程展示 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">审批流程</h3>

              <Tabs defaultValue="diagram" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="diagram"
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    流程图
                  </TabsTrigger>
                  <TabsTrigger value="list" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    详细列表
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="diagram" className="mt-6">
                  <div className="border rounded-lg p-4 bg-muted/20">
                    <WorkflowDiagram
                      workflow={selectedWorkflow || newWorkflow}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="list" className="mt-6">
                  {selectedWorkflow?.nodes.length > 0 ? (
                    <div className="space-y-4">
                      {selectedWorkflow.nodes.map((node, index) => (
                        <div key={index} className="relative">
                          {/* 连接线 */}
                          {index > 0 && (
                            <div className="absolute left-6 -top-4 w-0.5 h-4 bg-border"></div>
                          )}

                          <Card className="p-4">
                            <div className="flex items-start gap-4">
                              {/* 节点序号 */}
                              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                                {index + 1}
                              </div>

                              {/* 节点信息 */}
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">
                                    {node.nodeName}
                                  </h4>
                                  <Badge variant="secondary">
                                    {getNodeTypeLabel(node.nodeType)}
                                  </Badge>
                                  {node.required && (
                                    <Badge
                                      variant="destructive"
                                      className="text-xs"
                                    >
                                      必须
                                    </Badge>
                                  )}
                                </div>

                                {node.description && (
                                  <p className="text-sm text-muted-foreground">
                                    {node.description}
                                  </p>
                                )}

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <Label className="text-xs font-medium text-muted-foreground">
                                      审批时限
                                    </Label>
                                    <p>{node.timeLimit} 小时</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs font-medium text-muted-foreground">
                                      审批人数
                                    </Label>
                                    <p>{node.approvers.length} 人</p>
                                  </div>
                                </div>

                                {/* 审批人员列表 */}
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground">
                                    审批人员
                                  </Label>
                                  <div className="mt-1 grid grid-cols-2 gap-2">
                                    {node.approvers.map((approver: any) => (
                                      <div
                                        key={approver.userId}
                                        className="flex items-center gap-2 p-2 bg-muted rounded"
                                      >
                                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                                          {(approver.userName || "?").charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium truncate">
                                            {approver.userName}
                                          </p>
                                          <p className="text-xs text-muted-foreground truncate">
                                            {approver.roleName}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* 审批条件 */}
                                {node.conditions &&
                                  node.conditions.length > 0 && (
                                    <div>
                                      <Label className="text-xs font-medium text-muted-foreground">
                                        审批条件
                                      </Label>
                                      <div className="mt-1 space-y-1">
                                        {node.conditions.map(
                                          (
                                            condition: any,
                                            condIndex: number,
                                          ) => (
                                            <div
                                              key={`${node.id}-condition-${condIndex}`}
                                              className="text-xs p-2 bg-muted rounded"
                                            >
                                              {condition.type === "amount" &&
                                                `金额 ${condition.operator} ${condition.value}`}
                                              {condition.type ===
                                                "department" &&
                                                `部门: ${condition.value}`}
                                              {condition.type === "role" &&
                                                `角色: ${condition.value}`}
                                            </div>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  )}

                                {/* 状态流转配置 */}
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground">
                                    状态流转配置
                                  </Label>
                                  <div className="mt-1 grid grid-cols-3 gap-2 text-xs">
                                    <div className="p-2 bg-muted rounded">
                                      <p className="font-medium">触发状态</p>
                                      <p className="text-muted-foreground">
                                        {getDocumentStatusLabel(
                                          selectedWorkflow.triggerStatus ||
                                            DocumentStatus.DRAFT,
                                        )}
                                      </p>
                                    </div>
                                    <div className="p-2 bg-muted rounded">
                                      <p className="font-medium">通过后状态</p>
                                      <p className="text-muted-foreground">
                                        {getDocumentStatusLabel(
                                          selectedWorkflow.approvedStatus ||
                                            DocumentStatus.APPROVED,
                                        )}
                                      </p>
                                    </div>
                                    <div className="p-2 bg-muted rounded">
                                      <p className="font-medium">拒绝后状态</p>
                                      <p className="text-muted-foreground">
                                        {getDocumentStatusLabel(
                                          selectedWorkflow.rejectedStatus ||
                                            DocumentStatus.REJECTED,
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>

                          {/* 下一步箭头 */}
                          {index < selectedWorkflow.nodes.length - 1 && (
                            <div className="flex justify-center mt-2">
                              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* 流程结束 */}
                      <div className="flex justify-center">
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full border border-green-200">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">流程完成</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>暂无配置的审批节点</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsDetailDialogOpen(false)}
              >
                关闭
              </Button>
              <Button
                onClick={() => {
                  handleEditWorkflow(selectedWorkflow);
                }}
              >
                编辑流程
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApprovalConfig;
