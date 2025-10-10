import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Users,
  FileText,
  Calendar,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ApprovalInstance, ApprovalStatus, DocumentType } from '@/types/approval';

// 模拟数据
const mockInstances: ApprovalInstance[] = [
  {
    id: '1',
    title: '市场推广费用申请',
    workflowId: 'wf-001',
    workflowName: '费用报销流程',
    documentType: DocumentType.EXPENSE_REPORT,
    status: ApprovalStatus.PENDING,
    currentNodeId: 'node-2',
    currentNodeName: '部门经理审批',
    submitter: {
      id: 'user-001',
      name: '张三',
      email: 'zhangsan@company.com',
      department: '市场部',
      position: '市场专员',
      role: 'marketing_specialist',
      isActive: true
    },
    formData: {
      amount: 5000,
      purpose: '线上广告投放',
      category: '推广费用'
    },
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    estimatedCompletionTime: '2024-01-17T18:00:00Z',
    priority: 'normal'
  },
  {
    id: '2',
    title: '年假申请',
    workflowId: 'wf-002',
    workflowName: '请假审批流程',
    documentType: DocumentType.LEAVE_REQUEST,
    status: ApprovalStatus.APPROVED,
    submitter: {
      id: 'user-002',
      name: '李四',
      email: 'lisi@company.com',
      department: '技术部',
      position: '前端工程师',
      role: 'developer',
      isActive: true
    },
    formData: {
      startDate: '2024-01-20',
      endDate: '2024-01-25',
      days: 5,
      reason: '家庭事务'
    },
    createdAt: '2024-01-10T14:00:00Z',
    updatedAt: '2024-01-12T16:00:00Z',
    completedAt: '2024-01-12T16:00:00Z',
    actualProcessTime: 48,
    priority: 'normal'
  },
  {
    id: '3',
    title: '设备采购申请',
    workflowId: 'wf-003',
    workflowName: '采购审批流程',
    documentType: DocumentType.PURCHASE_ORDER,
    status: ApprovalStatus.REJECTED,
    submitter: {
      id: 'user-003',
      name: '王五',
      email: 'wangwu@company.com',
      department: 'IT部',
      position: 'IT专员',
      role: 'it_specialist',
      isActive: true
    },
    formData: {
      items: ['笔记本电脑', '显示器'],
      totalAmount: 15000,
      supplier: 'XX科技有限公司'
    },
    createdAt: '2024-01-08T11:00:00Z',
    updatedAt: '2024-01-10T09:00:00Z',
    completedAt: '2024-01-10T09:00:00Z',
    actualProcessTime: 46,
    priority: 'high'
  }
];

const ApprovalMonitor: React.FC = () => {
  const [instances, setInstances] = useState<ApprovalInstance[]>(mockInstances);
  const [filteredInstances, setFilteredInstances] = useState<ApprovalInstance[]>(mockInstances);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>('all');
  const [selectedInstance, setSelectedInstance] = useState<ApprovalInstance | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // 过滤逻辑
  useEffect(() => {
    let filtered = instances;

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(instance =>
        instance.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instance.submitter.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 状态过滤
    if (statusFilter !== 'all') {
      filtered = filtered.filter(instance => instance.status === statusFilter);
    }

    // 文档类型过滤
    if (documentTypeFilter !== 'all') {
      filtered = filtered.filter(instance => instance.documentType === documentTypeFilter);
    }

    setFilteredInstances(filtered);
  }, [instances, searchTerm, statusFilter, documentTypeFilter]);

  // 获取状态样式
  const getStatusBadge = (status: ApprovalStatus) => {
    const statusConfig = {
      [ApprovalStatus.PENDING]: { label: '待审批', variant: 'default' as const, icon: Clock },
      [ApprovalStatus.APPROVED]: { label: '已通过', variant: 'success' as const, icon: CheckCircle },
      [ApprovalStatus.REJECTED]: { label: '已拒绝', variant: 'destructive' as const, icon: XCircle },
      [ApprovalStatus.CANCELLED]: { label: '已取消', variant: 'secondary' as const, icon: XCircle },
      [ApprovalStatus.WITHDRAWN]: { label: '已撤回', variant: 'outline' as const, icon: AlertTriangle },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // 获取优先级样式
  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { label: '低', variant: 'outline' as const },
      normal: { label: '普通', variant: 'secondary' as const },
      high: { label: '高', variant: 'default' as const },
      urgent: { label: '紧急', variant: 'destructive' as const },
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.normal;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // 格式化时间
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  // 计算处理时长
  const getProcessTime = (instance: ApprovalInstance) => {
    if (instance.actualProcessTime) {
      return `${instance.actualProcessTime}小时`;
    }
    
    const now = new Date();
    const created = new Date(instance.createdAt);
    const hours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
    return `${hours}小时`;
  };

  // 刷新数据
  const handleRefresh = async () => {
    setLoading(true);
    // 模拟API调用
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // 查看详情
  const handleViewDetail = (instance: ApprovalInstance) => {
    setSelectedInstance(instance);
    setDetailDialogOpen(true);
  };

  // 统计数据
  const stats = {
    total: instances.length,
    pending: instances.filter(i => i.status === ApprovalStatus.PENDING).length,
    approved: instances.filter(i => i.status === ApprovalStatus.APPROVED).length,
    rejected: instances.filter(i => i.status === ApprovalStatus.REJECTED).length,
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">审批监控</h1>
          <p className="text-muted-foreground">实时监控审批流程状态和进度</p>
        </div>
        <Button onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总申请数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待审批</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已通过</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已拒绝</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* 过滤和搜索 */}
      <Card>
        <CardHeader>
          <CardTitle>审批实例列表</CardTitle>
          <CardDescription>查看和管理所有审批实例</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索标题或申请人..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending">待审批</SelectItem>
                <SelectItem value="approved">已通过</SelectItem>
                <SelectItem value="rejected">已拒绝</SelectItem>
                <SelectItem value="cancelled">已取消</SelectItem>
              </SelectContent>
            </Select>
            <Select value={documentTypeFilter} onValueChange={setDocumentTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="文档类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="expense_report">费用报销</SelectItem>
                <SelectItem value="leave_request">请假申请</SelectItem>
                <SelectItem value="purchase_order">采购申请</SelectItem>
                <SelectItem value="contract_approval">合同审批</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 审批实例表格 */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>标题</TableHead>
                  <TableHead>申请人</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>当前节点</TableHead>
                  <TableHead>优先级</TableHead>
                  <TableHead>处理时长</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInstances.map((instance) => (
                  <TableRow key={instance.id}>
                    <TableCell className="font-medium">{instance.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{instance.submitter.name}</div>
                          <div className="text-sm text-muted-foreground">{instance.submitter.department}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(instance.status)}</TableCell>
                    <TableCell>
                      {instance.currentNodeName || '-'}
                    </TableCell>
                    <TableCell>{getPriorityBadge(instance.priority)}</TableCell>
                    <TableCell>{getProcessTime(instance)}</TableCell>
                    <TableCell>{formatTime(instance.createdAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetail(instance)}>
                            <Eye className="mr-2 h-4 w-4" />
                            查看详情
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredInstances.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              没有找到匹配的审批实例
            </div>
          )}
        </CardContent>
      </Card>

      {/* 详情对话框 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>审批详情</DialogTitle>
            <DialogDescription>
              查看审批实例的详细信息
            </DialogDescription>
          </DialogHeader>
          {selectedInstance && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">标题</label>
                  <p className="text-sm text-muted-foreground">{selectedInstance.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">状态</label>
                  <div className="mt-1">{getStatusBadge(selectedInstance.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">申请人</label>
                  <p className="text-sm text-muted-foreground">{selectedInstance.submitter.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">部门</label>
                  <p className="text-sm text-muted-foreground">{selectedInstance.submitter.department}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">创建时间</label>
                  <p className="text-sm text-muted-foreground">{formatTime(selectedInstance.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">更新时间</label>
                  <p className="text-sm text-muted-foreground">{formatTime(selectedInstance.updatedAt)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">表单数据</label>
                <pre className="mt-1 p-3 bg-gray-50 rounded-md text-sm overflow-auto">
                  {JSON.stringify(selectedInstance.formData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApprovalMonitor;