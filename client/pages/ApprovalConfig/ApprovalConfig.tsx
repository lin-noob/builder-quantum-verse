import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Play, Pause, Copy, Settings, Eye, FileText, Users, Clock, CheckCircle, ChevronDown, AlertCircle } from 'lucide-react';
import { ApprovalWorkflow, DocumentType, ApprovalNodeType, ApprovalTemplate, DocumentStatus } from '@/types/approval';
import { WorkflowDiagram } from './WorkflowDiagram';

interface ApprovalConfigProps {}

const ApprovalConfig: React.FC<ApprovalConfigProps> = () => {
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([]);
  const [templates, setTemplates] = useState<ApprovalTemplate[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<ApprovalWorkflow | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterDocumentType, setFilterDocumentType] = useState<DocumentType | 'all'>('all');

  // 新建流程表单状态
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    documentType: DocumentType.EXPENSE_REIMBURSEMENT,
    isActive: true,
    nodes: [] as any[]
  });

  // 当前编辑的节点
  const [currentNode, setCurrentNode] = useState({
    name: '',
    description: '',
    type: ApprovalNodeType.SINGLE,
    approvers: [] as any[],
    conditions: [] as any[],
    timeLimit: 24,
    isRequired: true,
    triggerStatus: DocumentStatus.SUBMITTED,
    approveToStatus: DocumentStatus.APPROVED,
    rejectToStatus: DocumentStatus.REJECTED
  });

  // 可选的审批人员（模拟数据）
  const [availableUsers] = useState([
    { id: '1', name: '张三', role: '部门主管', department: '销售部', email: 'zhangsan@company.com' },
    { id: '2', name: '李四', role: '财务专员', department: '财务部', email: 'lisi@company.com' },
    { id: '3', name: '王五', role: '营销经理', department: '市场部', email: 'wangwu@company.com' },
    { id: '4', name: '赵六', role: '总监', department: '管理层', email: 'zhaoliu@company.com' },
    { id: '5', name: '钱七', role: 'HR主管', department: '人事部', email: 'qianqi@company.com' },
    { id: '6', name: '孙八', role: '技术总监', department: '技术部', email: 'sunba@company.com' },
    { id: '7', name: '周九', role: '产品经理', department: '产品部', email: 'zhoujiu@company.com' },
    { id: '8', name: '吴十', role: '运营主管', department: '运营部', email: 'wushi@company.com' },
    { id: '9', name: '郑一', role: '法务专员', department: '法务部', email: 'zhengyi@company.com' },
    { id: '10', name: '陈二', role: '采购经理', department: '采购部', email: 'chener@company.com' },
    { id: '11', name: '刘三', role: '质量主管', department: '质量部', email: 'liusan@company.com' },
    { id: '12', name: '黄四', role: '客服经理', department: '客服部', email: 'huangsi@company.com' }
  ]);

  // 模拟数据
  useEffect(() => {
    const mockWorkflows: ApprovalWorkflow[] = [
      {
        id: '1',
        name: '费用报销审批流程',
        description: '员工费用报销的标准审批流程',
        documentType: DocumentType.EXPENSE_REIMBURSEMENT,
        isActive: true,
        version: '1.0',
        nodes: [
          {
            id: 'node1',
            name: '部门主管审批',
            type: ApprovalNodeType.SINGLE,
            order: 1,
            approvers: [{ userId: '1', userName: '张主管', userRole: '部门主管' }],
            conditions: [],
            timeLimit: 24,
            isRequired: true
          },
          {
            id: 'node2',
            name: '财务审批',
            type: ApprovalNodeType.SINGLE,
            order: 2,
            approvers: [{ userId: '2', userName: '李财务', userRole: '财务专员' }],
            conditions: [{ type: 'amount', operator: '>', value: 1000, description: '金额大于1000元' }],
            timeLimit: 48,
            isRequired: true
          }
        ],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20'),
        createdBy: 'admin'
      },
      {
        id: '2',
        name: '营销活动审批流程',
        description: '营销活动策划和执行的审批流程',
        documentType: DocumentType.MARKETING_CAMPAIGN,
        isActive: true,
        version: '2.1',
        nodes: [
          {
            id: 'node1',
            name: '营销经理审批',
            type: ApprovalNodeType.SINGLE,
            order: 1,
            approvers: [{ userId: '3', userName: '王经理', userRole: '营销经理' }],
            conditions: [],
            timeLimit: 24,
            isRequired: true
          },
          {
            id: 'node2',
            name: '总监审批',
            type: ApprovalNodeType.MULTIPLE,
            order: 2,
            approvers: [
              { userId: '4', userName: '刘总监', userRole: '营销总监' },
              { userId: '5', userName: '陈总监', userRole: '运营总监' }
            ],
            conditions: [{ type: 'amount', operator: '>', value: 50000, description: '预算大于5万元' }],
            timeLimit: 72,
            isRequired: true
          }
        ],
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-25'),
        createdBy: 'admin'
      },
      {
        id: '3',
        name: '采购申请审批流程',
        description: '公司采购物品和服务的审批流程',
        documentType: DocumentType.PURCHASE_REQUEST,
        isActive: true,
        version: '1.2',
        nodes: [
          {
            id: 'node1',
            name: '部门主管审批',
            type: ApprovalNodeType.SINGLE,
            order: 1,
            approvers: [{ userId: '1', userName: '张主管', userRole: '部门主管' }],
            conditions: [],
            timeLimit: 24,
            isRequired: true
          },
          {
            id: 'node2',
            name: '采购经理审批',
            type: ApprovalNodeType.SINGLE,
            order: 2,
            approvers: [{ userId: '10', userName: '陈采购', userRole: '采购经理' }],
            conditions: [{ type: 'amount', operator: '>', value: 5000, description: '金额大于5000元' }],
            timeLimit: 48,
            isRequired: true
          },
          {
            id: 'node3',
            name: '财务审批',
            type: ApprovalNodeType.SINGLE,
            order: 3,
            approvers: [{ userId: '2', userName: '李财务', userRole: '财务专员' }],
            conditions: [{ type: 'amount', operator: '>', value: 10000, description: '金额大于1万元' }],
            timeLimit: 72,
            isRequired: true
          }
        ],
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-30'),
        createdBy: 'admin'
      },
      {
        id: '4',
        name: '请假申请审批流程',
        description: '员工请假申请的审批流程',
        documentType: DocumentType.LEAVE_REQUEST,
        isActive: true,
        version: '1.0',
        nodes: [
          {
            id: 'node1',
            name: '直属主管审批',
            type: ApprovalNodeType.SINGLE,
            order: 1,
            approvers: [{ userId: '1', userName: '张主管', userRole: '部门主管' }],
            conditions: [],
            timeLimit: 12,
            isRequired: true
          },
          {
            id: 'node2',
            name: 'HR审批',
            type: ApprovalNodeType.SINGLE,
            order: 2,
            approvers: [{ userId: '5', userName: '钱HR', userRole: 'HR主管' }],
            conditions: [{ type: 'duration', operator: '>', value: 3, description: '请假天数大于3天' }],
            timeLimit: 24,
            isRequired: true
          }
        ],
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-22'),
        createdBy: 'admin'
      },
      {
        id: '5',
        name: '合同审批流程',
        description: '商务合同签署的审批流程',
        documentType: DocumentType.CONTRACT_APPROVAL,
        isActive: false,
        version: '2.0',
        nodes: [
          {
            id: 'node1',
            name: '业务负责人审批',
            type: ApprovalNodeType.SINGLE,
            order: 1,
            approvers: [{ userId: '3', userName: '王经理', userRole: '营销经理' }],
            conditions: [],
            timeLimit: 24,
            isRequired: true
          },
          {
            id: 'node2',
            name: '法务审批',
            type: ApprovalNodeType.SINGLE,
            order: 2,
            approvers: [{ userId: '9', userName: '郑法务', userRole: '法务专员' }],
            conditions: [],
            timeLimit: 48,
            isRequired: true
          },
          {
            id: 'node3',
            name: '总监审批',
            type: ApprovalNodeType.MULTIPLE,
            order: 3,
            approvers: [
              { userId: '4', userName: '刘总监', userRole: '营销总监' },
              { userId: '6', userName: '孙技术总监', userRole: '技术总监' }
            ],
            conditions: [{ type: 'amount', operator: '>', value: 100000, description: '合同金额大于10万元' }],
            timeLimit: 72,
            isRequired: true
          }
        ],
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-28'),
        createdBy: 'admin'
      },
      {
        id: '6',
        name: '产品发布审批流程',
        description: '新产品发布前的审批流程',
        documentType: DocumentType.PRODUCT_LAUNCH,
        isActive: true,
        version: '1.1',
        nodes: [
          {
            id: 'node1',
            name: '产品经理审批',
            type: ApprovalNodeType.SINGLE,
            order: 1,
            approvers: [{ userId: '7', userName: '周产品', userRole: '产品经理' }],
            conditions: [],
            timeLimit: 24,
            isRequired: true
          },
          {
            id: 'node2',
            name: '技术审批',
            type: ApprovalNodeType.SINGLE,
            order: 2,
            approvers: [{ userId: '6', userName: '孙技术总监', userRole: '技术总监' }],
            conditions: [],
            timeLimit: 48,
            isRequired: true
          },
          {
            id: 'node3',
            name: '质量审批',
            type: ApprovalNodeType.SINGLE,
            order: 3,
            approvers: [{ userId: '11', userName: '刘质量', userRole: '质量主管' }],
            conditions: [],
            timeLimit: 24,
            isRequired: true
          },
          {
            id: 'node4',
            name: '运营审批',
            type: ApprovalNodeType.SINGLE,
            order: 4,
            approvers: [{ userId: '8', userName: '吴运营', userRole: '运营主管' }],
            conditions: [],
            timeLimit: 24,
            isRequired: true
          }
        ],
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-02-01'),
        createdBy: 'admin'
      }
    ];

    const mockTemplates: ApprovalTemplate[] = [
      {
        id: 'template1',
        name: '标准费用报销模板',
        description: '适用于一般费用报销的标准模板',
        documentType: DocumentType.EXPENSE_REIMBURSEMENT,
        workflow: mockWorkflows[0],
        isDefault: true,
        createdAt: new Date('2024-01-01'),
        createdBy: 'admin'
      },
      {
        id: 'template2',
        name: '营销活动审批模板',
        description: '适用于营销活动策划的审批模板',
        documentType: DocumentType.MARKETING_CAMPAIGN,
        workflow: mockWorkflows[1],
        isDefault: false,
        createdAt: new Date('2024-01-05'),
        createdBy: 'admin'
      },
      {
        id: 'template3',
        name: '采购申请模板',
        description: '适用于公司采购申请的标准模板',
        documentType: DocumentType.PURCHASE_REQUEST,
        workflow: mockWorkflows[2],
        isDefault: true,
        createdAt: new Date('2024-01-08'),
        createdBy: 'admin'
      },
      {
        id: 'template4',
        name: '请假申请模板',
        description: '适用于员工请假申请的模板',
        documentType: DocumentType.LEAVE_REQUEST,
        workflow: mockWorkflows[3],
        isDefault: true,
        createdAt: new Date('2024-01-10'),
        createdBy: 'admin'
      },
      {
        id: 'template5',
        name: '合同审批模板',
        description: '适用于商务合同审批的模板',
        documentType: DocumentType.CONTRACT_APPROVAL,
        workflow: mockWorkflows[4],
        isDefault: false,
        createdAt: new Date('2024-01-12'),
        createdBy: 'admin'
      }
    ];

    setWorkflows(mockWorkflows);
    setTemplates(mockTemplates);
  }, []);

  // 过滤工作流
  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && workflow.isActive) ||
                         (filterStatus === 'inactive' && !workflow.isActive);
    const matchesDocumentType = filterDocumentType === 'all' || workflow.documentType === filterDocumentType;
    
    return matchesSearch && matchesStatus && matchesDocumentType;
  });

  const handleCreateWorkflow = () => {
    setNewWorkflow({
      name: '',
      description: '',
      documentType: DocumentType.EXPENSE_REIMBURSEMENT,
      isActive: true,
      nodes: []
    });
    setIsCreateDialogOpen(true);
  };

  const handleEditWorkflow = (workflow: ApprovalWorkflow) => {
    if (!workflow) return;
    
    setSelectedWorkflow(workflow);
    setNewWorkflow({
      name: workflow.name || '',
      description: workflow.description || '',
      documentType: workflow.documentType || DocumentType.EXPENSE_REIMBURSEMENT,
      isActive: workflow.isActive !== undefined ? workflow.isActive : true,
      nodes: (workflow.nodes || []).map(node => ({
        id: node.id || '',
        name: node.name || '',
        description: node.description || '',
        type: node.type || ApprovalNodeType.SINGLE,
        order: node.order || 0,
        approvers: node.approvers || [],
        conditions: node.conditions || [],
        timeLimit: node.timeLimit || 24,
        isRequired: node.isRequired !== undefined ? node.isRequired : true
      }))
    });
    setIsEditDialogOpen(true);
  };

  const handleViewWorkflow = (workflow: ApprovalWorkflow) => {
    if (!workflow) return;
    setSelectedWorkflow(workflow);
    setIsDetailDialogOpen(true);
  };

  const handleDeleteWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.filter(w => w.id !== workflowId));
  };

  const handleToggleWorkflowStatus = (workflowId: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId ? { ...w, isActive: !w.isActive } : w
    ));
  };

  const handleCopyWorkflow = (workflow: ApprovalWorkflow) => {
    const newWorkflow: ApprovalWorkflow = {
      ...workflow,
      id: Date.now().toString(),
      name: `${workflow.name} (副本)`,
      version: '1.0',
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setWorkflows(prev => [...prev, newWorkflow]);
  };

  const handleSaveWorkflow = () => {
    if (!newWorkflow.name.trim()) {
      alert('请输入流程名称');
      return;
    }

    const workflow: ApprovalWorkflow = {
      id: selectedWorkflow?.id || Date.now().toString(),
      name: newWorkflow.name,
      description: newWorkflow.description,
      documentType: newWorkflow.documentType,
      isActive: newWorkflow.isActive,
      version: selectedWorkflow?.version || '1.0',
      nodes: newWorkflow.nodes.map((node, index) => ({
        id: node.id || `node_${Date.now()}_${index}`,
        name: node.name,
        description: node.description,
        type: node.type,
        order: index + 1,
        approvers: node.approvers.map((approver: any) => ({
          userId: approver.id,
          userName: approver.name,
          userRole: approver.role
        })),
        conditions: node.conditions || [],
        timeLimit: node.timeLimit,
        isRequired: node.isRequired
      })),
      createdAt: selectedWorkflow?.createdAt || new Date(),
      updatedAt: new Date(),
      createdBy: 'admin'
    };

    if (selectedWorkflow) {
      // 编辑模式
      setWorkflows(prev => prev.map(w => w.id === selectedWorkflow.id ? workflow : w));
    } else {
      // 新建模式
      setWorkflows(prev => [...prev, workflow]);
    }

    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedWorkflow(null);
  };

  const handleAddNode = () => {
    const newNode = {
      id: `node_${Date.now()}`,
      name: currentNode.name || `审批节点 ${newWorkflow.nodes.length + 1}`,
      description: currentNode.description,
      type: currentNode.type,
      approvers: [...currentNode.approvers],
      conditions: [...currentNode.conditions],
      timeLimit: currentNode.timeLimit,
      isRequired: currentNode.isRequired,
      triggerStatus: currentNode.triggerStatus,
      approveToStatus: currentNode.approveToStatus,
      rejectToStatus: currentNode.rejectToStatus
    };

    setNewWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));

    // 重置当前节点
    setCurrentNode({
      name: '',
      description: '',
      type: ApprovalNodeType.SINGLE,
      approvers: [],
      conditions: [],
      timeLimit: 24,
      isRequired: true,
      triggerStatus: DocumentStatus.DRAFT,
      approveToStatus: DocumentStatus.APPROVED,
      rejectToStatus: DocumentStatus.REJECTED
    });
  };

  const handleRemoveNode = (index: number) => {
    setNewWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.filter((_, i) => i !== index)
    }));
  };

  const handleAddApprover = (user: any) => {
    if (!currentNode.approvers.find(a => a.id === user.id)) {
      setCurrentNode(prev => ({
        ...prev,
        approvers: [...prev.approvers, user]
      }));
    }
  };

  const handleRemoveApprover = (userId: string) => {
    setCurrentNode(prev => ({
      ...prev,
      approvers: prev.approvers.filter(a => a.id !== userId)
    }));
  };

  const getDocumentTypeLabel = (type: DocumentType) => {
    const labels = {
      [DocumentType.EXPENSE_REIMBURSEMENT]: '费用报销',
      [DocumentType.MARKETING_CAMPAIGN]: '营销活动',
      [DocumentType.PURCHASE_REQUEST]: '采购申请',
      [DocumentType.LEAVE_REQUEST]: '请假申请',
      [DocumentType.BUDGET_APPROVAL]: '预算审批',
      [DocumentType.CONTRACT_APPROVAL]: '合同审批',
      [DocumentType.RECRUITMENT]: '招聘申请',
      [DocumentType.TRAINING_REQUEST]: '培训申请'
    };
    return labels[type] || type;
  };

  const getNodeTypeLabel = (type: ApprovalNodeType) => {
    const labels = {
      [ApprovalNodeType.SINGLE]: '单人审批',
      [ApprovalNodeType.MULTIPLE]: '多人审批',
      [ApprovalNodeType.SEQUENTIAL]: '顺序审批'
    };
    return labels[type] || type;
  };

  const getDocumentStatusLabel = (status: DocumentStatus) => {
    const labels = {
      [DocumentStatus.DRAFT]: '草稿',
      [DocumentStatus.SUBMITTED]: '已提交',
      [DocumentStatus.REVIEWING]: '审核中',
      [DocumentStatus.APPROVED]: '已通过',
      [DocumentStatus.REJECTED]: '已拒绝',
      [DocumentStatus.CANCELLED]: '已取消',
      [DocumentStatus.COMPLETED]: '已完成',
      [DocumentStatus.ARCHIVED]: '已归档'
    };
    return labels[status] || status;
  };

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
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="status-filter">状态</Label>
                  <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
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
                  <Select value={filterDocumentType} onValueChange={(value: any) => setFilterDocumentType(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部类型</SelectItem>
                      {Object.values(DocumentType).map(type => (
                        <SelectItem key={type} value={type}>
                          {getDocumentTypeLabel(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <div className="flex justify-start">
            <Button onClick={handleCreateWorkflow} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              新建流程
            </Button>
          </div>

          {/* 工作流列表 */}
          <div className="grid gap-4">
            {filteredWorkflows.map((workflow) => (
              <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{workflow.name}</CardTitle>
                        <Badge variant={workflow.isActive ? "default" : "secondary"}>
                          {workflow.isActive ? '启用' : '禁用'}
                        </Badge>
                        <Badge variant="outline">v{workflow.version}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{workflow.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {getDocumentTypeLabel(workflow.documentType)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {workflow.nodes.length} 个节点
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          更新于 {workflow.updatedAt.toLocaleDateString()}
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
                        onClick={() => handleToggleWorkflowStatus(workflow.id)}
                        title={workflow.isActive ? "禁用流程" : "启用流程"}
                      >
                        {workflow.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditWorkflow(workflow)}
                        title="编辑流程"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyWorkflow(workflow)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
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
                              确定要删除审批流程 "{workflow.name}" 吗？此操作不可撤销。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteWorkflow(workflow.id)}>
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
                    <div className="flex gap-2 flex-wrap">
                      {workflow.nodes.map((node, index) => (
                        <div key={node.id} className="flex items-center gap-2">
                          <Badge variant="outline" className="flex items-center gap-1">
                            <span>{index + 1}</span>
                            <span>{node.name}</span>
                            <span className="text-xs">({getNodeTypeLabel(node.type)})</span>
                          </Badge>
                          {index < workflow.nodes.length - 1 && (
                            <span className="text-muted-foreground">→</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredWorkflows.length === 0 && (
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
                    value={newWorkflow.name}
                    onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="请输入流程名称"
                  />
                </div>
                <div>
                  <Label htmlFor="document-type">单据类型 *</Label>
                  <Select 
                    value={newWorkflow.documentType} 
                    onValueChange={(value: DocumentType) => setNewWorkflow(prev => ({ ...prev, documentType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(DocumentType).map(type => (
                        <SelectItem key={type} value={type}>
                          {getDocumentTypeLabel(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="workflow-description">流程描述</Label>
                <Input
                  id="workflow-description"
                  value={newWorkflow.description}
                  onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="请输入流程描述"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="workflow-active"
                  checked={newWorkflow.isActive}
                  onChange={(e) => setNewWorkflow(prev => ({ ...prev, isActive: e.target.checked }))}
                />
                <Label htmlFor="workflow-active">启用此流程</Label>
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
                            <span className="font-medium">{node.name}</span>
                            <Badge variant="secondary">{getNodeTypeLabel(node.type)}</Badge>
                          </div>
                          {node.description && (
                            <p className="text-sm text-muted-foreground">{node.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>审批人：{node.approvers.length} 人</span>
                            <span>时限：{node.timeLimit} 小时</span>
                            {node.isRequired && <Badge variant="destructive" className="text-xs">必须</Badge>}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {node.approvers.map((approver: any) => (
                              <Badge key={approver.userId || approver.id} variant="outline" className="text-xs">
                                {approver.userName || approver.name} ({approver.userRole || approver.role})
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
                        value={currentNode.name}
                        onChange={(e) => setCurrentNode(prev => ({ ...prev, name: e.target.value }))}
                        placeholder={`审批节点 ${newWorkflow.nodes.length + 1}`}
                      />
                    </div>
                    <div>
                      <Label htmlFor="node-type">审批类型</Label>
                      <Select 
                        value={currentNode.type} 
                        onValueChange={(value: ApprovalNodeType) => setCurrentNode(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ApprovalNodeType.SINGLE}>单人审批</SelectItem>
                          <SelectItem value={ApprovalNodeType.MULTIPLE}>多人审批（全部同意）</SelectItem>
                          <SelectItem value={ApprovalNodeType.SEQUENTIAL}>顺序审批</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="node-description">节点描述</Label>
                    <Input
                      id="node-description"
                      value={currentNode.description}
                      onChange={(e) => setCurrentNode(prev => ({ ...prev, description: e.target.value }))}
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
                        onChange={(e) => setCurrentNode(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 24 }))}
                        min="1"
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <input
                        type="checkbox"
                        id="node-required"
                        checked={currentNode.isRequired}
                        onChange={(e) => setCurrentNode(prev => ({ ...prev, isRequired: e.target.checked }))}
                      />
                      <Label htmlFor="node-required">必须审批</Label>
                    </div>
                  </div>

                  {/* 状态流转配置 */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">状态流转配置</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="trigger-status">触发状态</Label>
                        <Select 
                          value={currentNode.triggerStatus} 
                          onValueChange={(value: DocumentStatus) => setCurrentNode(prev => ({ ...prev, triggerStatus: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(DocumentStatus).map(status => (
                              <SelectItem key={status} value={status}>
                                {getDocumentStatusLabel(status)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="approve-status">通过后状态</Label>
                        <Select 
                          value={currentNode.approveToStatus} 
                          onValueChange={(value: DocumentStatus) => setCurrentNode(prev => ({ ...prev, approveToStatus: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(DocumentStatus).map(status => (
                              <SelectItem key={status} value={status}>
                                {getDocumentStatusLabel(status)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="reject-status">拒绝后状态</Label>
                        <Select 
                          value={currentNode.rejectToStatus} 
                          onValueChange={(value: DocumentStatus) => setCurrentNode(prev => ({ ...prev, rejectToStatus: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(DocumentStatus).map(status => (
                              <SelectItem key={status} value={status}>
                                {getDocumentStatusLabel(status)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* 审批人员选择 */}
                  <div>
                    <Label>选择审批人员</Label>
                    <div className="mt-2 space-y-2">
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                        {availableUsers.map(user => (
                          <div key={user.id} className="flex items-center space-x-2 p-2 border rounded">
                            <input
                              type="checkbox"
                              checked={currentNode.approvers.some(a => a.id === user.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  handleAddApprover(user);
                                } else {
                                  handleRemoveApprover(user.id);
                                }
                              }}
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium">{user.name}</div>
                              <div className="text-xs text-muted-foreground">{user.role} - {user.department}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {currentNode.approvers.length > 0 && (
                        <div className="mt-2">
                          <Label className="text-sm">已选择的审批人员：</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {currentNode.approvers.map((approver: any) => (
                              <Badge key={approver.userId || approver.id} variant="secondary" className="text-xs">
                                {approver.userName || approver.name}
                                <button
                                  onClick={() => handleRemoveApprover(approver.id)}
                                  className="ml-1 hover:text-red-500"
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button 
                    onClick={handleAddNode}
                    disabled={!currentNode.name.trim() || currentNode.approvers.length === 0}
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
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                取消
              </Button>
              <Button 
                onClick={handleSaveWorkflow}
                disabled={!newWorkflow.name.trim() || newWorkflow.nodes.length === 0}
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
                    value={newWorkflow.name}
                    onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="请输入流程名称"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-document-type">单据类型 *</Label>
                  <Select 
                    value={newWorkflow.documentType} 
                    onValueChange={(value: DocumentType) => setNewWorkflow(prev => ({ ...prev, documentType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(DocumentType).map(type => (
                        <SelectItem key={type} value={type}>
                          {getDocumentTypeLabel(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-workflow-description">流程描述</Label>
                <Input
                  id="edit-workflow-description"
                  value={newWorkflow.description}
                  onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="请输入流程描述"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-workflow-active"
                  checked={newWorkflow.isActive}
                  onChange={(e) => setNewWorkflow(prev => ({ ...prev, isActive: e.target.checked }))}
                />
                <Label htmlFor="edit-workflow-active">启用此流程</Label>
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
                            <span className="font-medium">{node.name}</span>
                            <Badge variant="secondary">{getNodeTypeLabel(node.type)}</Badge>
                          </div>
                          {node.description && (
                            <p className="text-sm text-muted-foreground">{node.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>审批人：{node.approvers.length} 人</span>
                            <span>时限：{node.timeLimit} 小时</span>
                            {node.isRequired && <Badge variant="destructive" className="text-xs">必须</Badge>}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {node.approvers.map((approver: any) => (
                              <Badge key={approver.userId || approver.id} variant="outline" className="text-xs">
                                {approver.userName || approver.name} ({approver.userRole || approver.role})
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
                        value={currentNode.name}
                        onChange={(e) => setCurrentNode(prev => ({ ...prev, name: e.target.value }))}
                        placeholder={`审批节点 ${newWorkflow.nodes.length + 1}`}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-node-type">审批类型</Label>
                      <Select 
                        value={currentNode.type} 
                        onValueChange={(value: ApprovalNodeType) => setCurrentNode(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ApprovalNodeType.SINGLE}>单人审批</SelectItem>
                          <SelectItem value={ApprovalNodeType.MULTIPLE}>多人审批（全部同意）</SelectItem>
                          <SelectItem value={ApprovalNodeType.SEQUENTIAL}>顺序审批</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-node-description">节点描述</Label>
                    <Input
                      id="edit-node-description"
                      value={currentNode.description}
                      onChange={(e) => setCurrentNode(prev => ({ ...prev, description: e.target.value }))}
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
                        onChange={(e) => setCurrentNode(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 24 }))}
                        min="1"
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <input
                        type="checkbox"
                        id="edit-node-required"
                        checked={currentNode.isRequired}
                        onChange={(e) => setCurrentNode(prev => ({ ...prev, isRequired: e.target.checked }))}
                      />
                      <Label htmlFor="edit-node-required">必须审批</Label>
                    </div>
                  </div>

                  {/* 审批人员选择 */}
                  <div>
                    <Label>选择审批人员</Label>
                    <div className="mt-2 space-y-2">
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                        {availableUsers.map(user => (
                          <div key={user.id} className="flex items-center space-x-2 p-2 border rounded">
                            <input
                              type="checkbox"
                              checked={currentNode.approvers.some(a => a.id === user.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  handleAddApprover(user);
                                } else {
                                  handleRemoveApprover(user.id);
                                }
                              }}
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium">{user.name}</div>
                              <div className="text-xs text-muted-foreground">{user.role} - {user.department}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {currentNode.approvers.length > 0 && (
                        <div className="mt-2">
                          <Label className="text-sm">已选择的审批人员：</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {currentNode.approvers.map((approver: any) => (
                              <Badge key={approver.userId || approver.id} variant="secondary" className="text-xs">
                                {approver.userName || approver.name}
                                <button
                                  onClick={() => handleRemoveApprover(approver.id)}
                                  className="ml-1 hover:text-red-500"
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button 
                    onClick={handleAddNode}
                    disabled={!currentNode.name.trim() || currentNode.approvers.length === 0}
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
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                取消
              </Button>
              <Button 
                onClick={handleSaveWorkflow}
                disabled={!newWorkflow.name.trim() || newWorkflow.nodes.length === 0}
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
                  <Label className="text-sm font-medium text-muted-foreground">流程名称</Label>
                  <p className="text-sm">{selectedWorkflow?.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">单据类型</Label>
                  <p className="text-sm">{selectedWorkflow && getDocumentTypeLabel(selectedWorkflow.documentType)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">流程状态</Label>
                  <Badge variant={selectedWorkflow?.isActive ? "default" : "secondary"}>
                    {selectedWorkflow?.isActive ? "启用" : "禁用"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">节点数量</Label>
                  <p className="text-sm">{selectedWorkflow?.nodes.length} 个节点</p>
                </div>
              </div>
              {selectedWorkflow?.description && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">流程描述</Label>
                  <p className="text-sm">{selectedWorkflow.description}</p>
                </div>
              )}
            </div>

            {/* 审批流程展示 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">审批流程</h3>
              
              <Tabs defaultValue="diagram" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="diagram" className="flex items-center gap-2">
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
                    <WorkflowDiagram workflow={selectedWorkflow || newWorkflow} />
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
                                  <h4 className="font-semibold">{node.name}</h4>
                                  <Badge variant="secondary">{getNodeTypeLabel(node.type)}</Badge>
                                  {node.isRequired && <Badge variant="destructive" className="text-xs">必须</Badge>}
                                </div>
                                
                                {node.description && (
                                  <p className="text-sm text-muted-foreground">{node.description}</p>
                                )}
                                
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <Label className="text-xs font-medium text-muted-foreground">审批时限</Label>
                                    <p>{node.timeLimit} 小时</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs font-medium text-muted-foreground">审批人数</Label>
                                    <p>{node.approvers.length} 人</p>
                                  </div>
                                </div>
                                
                                {/* 审批人员列表 */}
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground">审批人员</Label>
                                  <div className="mt-1 grid grid-cols-2 gap-2">
                                    {node.approvers.map((approver: any) => (
                                      <div key={approver.userId || approver.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                                          {(approver.userName || approver.name || '?').charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium truncate">{approver.userName || approver.name}</p>
                                          <p className="text-xs text-muted-foreground truncate">
                                            {approver.userRole || approver.role} - {approver.userDepartment || approver.department}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                {/* 审批条件 */}
                                {node.conditions && node.conditions.length > 0 && (
                                  <div>
                                    <Label className="text-xs font-medium text-muted-foreground">审批条件</Label>
                                    <div className="mt-1 space-y-1">
                                      {node.conditions.map((condition: any, condIndex: number) => (
                                        <div key={`${node.id}-condition-${condIndex}`} className="text-xs p-2 bg-muted rounded">
                                          {condition.type === 'amount' && `金额 ${condition.operator} ${condition.value}`}
                                          {condition.type === 'department' && `部门: ${condition.value}`}
                                          {condition.type === 'role' && `角色: ${condition.value}`}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* 状态流转配置 */}
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground">状态流转配置</Label>
                                  <div className="mt-1 grid grid-cols-3 gap-2 text-xs">
                                    <div className="p-2 bg-muted rounded">
                                      <p className="font-medium">触发状态</p>
                                      <p className="text-muted-foreground">{getDocumentStatusLabel(node.triggerStatus || DocumentStatus.DRAFT)}</p>
                                    </div>
                                    <div className="p-2 bg-muted rounded">
                                      <p className="font-medium">通过后状态</p>
                                      <p className="text-muted-foreground">{getDocumentStatusLabel(node.approveToStatus || DocumentStatus.APPROVED)}</p>
                                    </div>
                                    <div className="p-2 bg-muted rounded">
                                      <p className="font-medium">拒绝后状态</p>
                                      <p className="text-muted-foreground">{getDocumentStatusLabel(node.rejectToStatus || DocumentStatus.REJECTED)}</p>
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
              <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                关闭
              </Button>
              <Button onClick={() => {
                setIsDetailDialogOpen(false);
                setIsEditDialogOpen(true);
              }}>
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