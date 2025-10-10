import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Eye, Clock, AlertTriangle, Package, Search, Filter, Calendar, User, DollarSign, FileText } from 'lucide-react';

// 增强的任务接口
interface EnhancedTask {
  id: string;
  title: string;
  description: string;
  type: 'procurement' | 'review' | 'approval' | 'analysis' | 'finance' | 'hr';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'rejected' | 'in_review' | 'draft';
  amount?: number;
  vendor?: string;
  dueDate: string;
  submittedBy: string;
  submittedDate: string;
  department: string;
  tags: string[];
  assignee?: string;
}

// 增强的模拟任务数据
const mockTasks: EnhancedTask[] = [
  {
    id: '1',
    title: '办公用品采购申请',
    description: '申请购买打印机、纸张、文具等办公用品，用于支持日常办公需求',
    type: 'procurement',
    priority: 'medium',
    status: 'pending',
    amount: 5000,
    vendor: '办公用品供应商',
    dueDate: '2024-01-15',
    submittedBy: '李小明',
    submittedDate: '2024-01-08',
    department: '行政部',
    tags: ['采购', '办公用品', '日常'],
    assignee: '张经理'
  },
  {
    id: '2',
    title: '项目预算审核',
    description: '审核Q1季度项目预算分配方案，确保资源合理配置',
    type: 'review',
    priority: 'urgent',
    status: 'in_review',
    amount: 500000,
    dueDate: '2024-01-12',
    submittedBy: '王经理',
    submittedDate: '2024-01-05',
    department: '财务部',
    tags: ['预算', '审核', 'Q1'],
    assignee: '财务总监'
  },
  {
    id: '3',
    title: '员工请假申请',
    description: '张三申请年假5天，计划春节期间休假',
    type: 'approval',
    priority: 'low',
    status: 'pending',
    dueDate: '2024-01-20',
    submittedBy: '张三',
    submittedDate: '2024-01-07',
    department: '技术部',
    tags: ['请假', '年假'],
    assignee: '人事经理'
  },
  {
    id: '4',
    title: '市场分析报告审批',
    description: 'Q4市场分析报告需要最终审批，包含竞争对手分析和市场趋势',
    type: 'analysis',
    priority: 'high',
    status: 'pending',
    dueDate: '2024-01-10',
    submittedBy: '市场部',
    submittedDate: '2024-01-03',
    department: '市场部',
    tags: ['报告', '分析', 'Q4'],
    assignee: '市场总监'
  },
  {
    id: '5',
    title: '差旅费报销申请',
    description: '出差北京参加会议的差旅费用报销',
    type: 'finance',
    priority: 'medium',
    status: 'approved',
    amount: 3200,
    dueDate: '2024-01-18',
    submittedBy: '刘小华',
    submittedDate: '2024-01-06',
    department: '销售部',
    tags: ['报销', '差旅'],
    assignee: '财务专员'
  },
  {
    id: '6',
    title: '新员工入职审批',
    description: '技术部新员工入职流程审批，包含背景调查和合同签署',
    type: 'hr',
    priority: 'high',
    status: 'draft',
    dueDate: '2024-01-25',
    submittedBy: '人事部',
    submittedDate: '2024-01-09',
    department: '人事部',
    tags: ['入职', '审批', '新员工'],
    assignee: 'HR总监'
  },
  {
    id: '7',
    title: '设备维护合同续签',
    description: '办公设备维护合同即将到期，需要审批续签事宜',
    type: 'procurement',
    priority: 'medium',
    status: 'rejected',
    amount: 15000,
    vendor: '设备维护公司',
    dueDate: '2024-01-22',
    submittedBy: '运维部',
    submittedDate: '2024-01-04',
    department: '运维部',
    tags: ['合同', '维护', '续签']
  },
  {
    id: '8',
    title: '培训计划审核',
    description: '2024年员工培训计划审核，包含技能提升和管理培训',
    type: 'review',
    priority: 'low',
    status: 'pending',
    dueDate: '2024-01-30',
    submittedBy: '培训部',
    submittedDate: '2024-01-08',
    department: '人事部',
    tags: ['培训', '计划', '2024'],
    assignee: '培训经理'
  }
];

export default function MyTasks() {
  const [tasks, setTasks] = useState<EnhancedTask[]>(mockTasks);
  const [selectedTask, setSelectedTask] = useState<EnhancedTask | null>(null);
  
  // 筛选条件状态
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    priority: 'all',
    department: 'all',
    assignee: 'all',
    search: '',
    dateRange: 'all'
  });

  // 处理任务审批
  const handleApprove = (taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, status: 'approved' } : task
    ));
  };

  // 处理任务驳回
  const handleReject = (taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, status: 'rejected' } : task
    ));
  };

  // 处理任务转发
  const handleForward = (taskId: string, newAssignee: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, assignee: newAssignee } : task
    ));
  };

  // 处理任务编辑
  const handleEdit = (taskId: string, updates: Partial<EnhancedTask>) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  // 处理任务删除
  const handleDelete = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  // 获取唯一的部门列表
  const departments = Array.from(new Set(tasks.map(task => task.department)));
  
  // 获取唯一的负责人列表
  const assignees = Array.from(new Set(tasks.map(task => task.assignee).filter(Boolean)));

  // 过滤任务
  const filteredTasks = tasks.filter(task => {
    // 状态筛选
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    
    // 类型筛选
    if (filters.type !== 'all' && task.type !== filters.type) return false;
    
    // 优先级筛选
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    
    // 部门筛选
    if (filters.department !== 'all' && task.department !== filters.department) return false;
    
    // 负责人筛选
    if (filters.assignee !== 'all' && task.assignee !== filters.assignee) return false;
    
    // 搜索筛选
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const searchFields = [
        task.title,
        task.description,
        task.submittedBy,
        task.department,
        ...task.tags
      ].join(' ').toLowerCase();
      
      if (!searchFields.includes(searchLower)) return false;
    }
    
    // 日期范围筛选
    if (filters.dateRange !== 'all') {
      const today = new Date();
      const taskDate = new Date(task.dueDate);
      const diffDays = Math.ceil((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (filters.dateRange) {
        case 'overdue':
          if (diffDays >= 0) return false;
          break;
        case 'today':
          if (diffDays !== 0) return false;
          break;
        case 'week':
          if (diffDays < 0 || diffDays > 7) return false;
          break;
        case 'month':
          if (diffDays < 0 || diffDays > 30) return false;
          break;
      }
    }
    
    return true;
  });

  // 获取任务类型图标
  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'procurement': return <Package className="w-4 h-4" />;
      case 'review': return <Eye className="w-4 h-4" />;
      case 'approval': return <CheckCircle className="w-4 h-4" />;
      case 'analysis': return <AlertTriangle className="w-4 h-4" />;
      case 'finance': return <DollarSign className="w-4 h-4" />;
      case 'hr': return <User className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // 获取任务类型名称
  const getTaskTypeName = (type: string) => {
    switch (type) {
      case 'procurement': return '采购';
      case 'review': return '审核';
      case 'approval': return '审批';
      case 'analysis': return '分析';
      case 'finance': return '财务';
      case 'hr': return '人事';
      default: return '其他';
    }
  };

  // 获取优先级颜色
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white dark:bg-red-600';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
    }
  };

  // 获取优先级名称
  const getPriorityName = (priority: string) => {
    switch (priority) {
      case 'urgent': return '紧急';
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return '未知';
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      case 'pending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'in_review': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
    }
  };

  // 获取状态名称
  const getStatusName = (status: string) => {
    switch (status) {
      case 'approved': return '已批准';
      case 'rejected': return '已驳回';
      case 'pending': return '待处理';
      case 'in_review': return '审核中';
      case 'draft': return '草稿';
      default: return '未知';
    }
  };

  return (
    <div className="h-full overflow-auto bg-slate-50 dark:bg-slate-900">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* 统计信息栏 */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {filteredTasks.length}
              </span>
              <p className="text-sm text-slate-600 dark:text-slate-400">总任务</p>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-blue-600">
                {filteredTasks.filter(t => t.status === 'pending').length}
              </span>
              <p className="text-sm text-slate-600 dark:text-slate-400">待处理</p>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-red-600">
                {filteredTasks.filter(t => t.priority === 'urgent').length}
              </span>
              <p className="text-sm text-slate-600 dark:text-slate-400">紧急</p>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-green-600">
                {filteredTasks.filter(t => t.status === 'approved').length}
              </span>
              <p className="text-sm text-slate-600 dark:text-slate-400">已完成</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              任务管理中心
            </span>
          </div>
        </div>

        {/* 增强的任务过滤器 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              高级筛选
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* 搜索框 */}
              <div className="lg:col-span-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  搜索任务
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="搜索标题、描述、提交人..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* 状态筛选 */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  状态
                </label>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="pending">待处理</SelectItem>
                    <SelectItem value="in_review">审核中</SelectItem>
                    <SelectItem value="approved">已批准</SelectItem>
                    <SelectItem value="rejected">已驳回</SelectItem>
                    <SelectItem value="draft">草稿</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 类型筛选 */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  类型
                </label>
                <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类型</SelectItem>
                    <SelectItem value="procurement">采购</SelectItem>
                    <SelectItem value="review">审核</SelectItem>
                    <SelectItem value="approval">审批</SelectItem>
                    <SelectItem value="analysis">分析</SelectItem>
                    <SelectItem value="finance">财务</SelectItem>
                    <SelectItem value="hr">人事</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 优先级筛选 */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  优先级
                </label>
                <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部优先级</SelectItem>
                    <SelectItem value="urgent">紧急</SelectItem>
                    <SelectItem value="high">高</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="low">低</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 部门筛选 */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  部门
                </label>
                <Select value={filters.department} onValueChange={(value) => setFilters(prev => ({ ...prev, department: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部部门</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 负责人筛选 */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  负责人
                </label>
                <Select value={filters.assignee} onValueChange={(value) => setFilters(prev => ({ ...prev, assignee: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部负责人</SelectItem>
                    {assignees.map(assignee => (
                      <SelectItem key={assignee} value={assignee!}>{assignee}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 日期范围筛选 */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  截止时间
                </label>
                <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部时间</SelectItem>
                    <SelectItem value="overdue">已逾期</SelectItem>
                    <SelectItem value="today">今天</SelectItem>
                    <SelectItem value="week">本周内</SelectItem>
                    <SelectItem value="month">本月内</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 清除筛选按钮 */}
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({
                  status: 'all',
                  type: 'all',
                  priority: 'all',
                  department: 'all',
                  assignee: 'all',
                  search: '',
                  dateRange: 'all'
                })}
              >
                清除筛选
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 任务列表 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                任务列表
              </div>
              <Badge variant="outline" className="text-sm">
                {filteredTasks.length} 项任务
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-start space-x-4 flex-1">
                    {/* 任务图标和基本信息 */}
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700">
                        {getTaskIcon(task.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                            {task.title}
                          </h3>
                          <Badge className={getPriorityColor(task.priority)} variant="secondary">
                            {getPriorityName(task.priority)}
                          </Badge>
                          <Badge className={getStatusColor(task.status)} variant="secondary">
                            {getStatusName(task.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                          {task.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {task.submittedBy}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            截止: {task.dueDate}
                          </span>
                          <span>{task.department}</span>
                          {task.amount && (
                            <span className="flex items-center">
                              <DollarSign className="w-3 h-3 mr-1" />
                              ¥{task.amount.toLocaleString()}
                            </span>
                          )}
                          {task.assignee && (
                            <span className="flex items-center">
                              负责人: {task.assignee}
                            </span>
                          )}
                        </div>
                        {/* 标签 */}
                        {task.tags.length > 0 && (
                          <div className="flex items-center space-x-1 mt-2">
                            {task.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center space-x-2 ml-4">
                    {/* 查看详情 */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTask(task)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          详情
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center space-x-2">
                            {getTaskIcon(selectedTask?.type || '')}
                            <span>{selectedTask?.title}</span>
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          {/* 基本信息 */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">类型</label>
                              <p className="text-slate-900 dark:text-slate-100">{getTaskTypeName(selectedTask?.type || '')}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">优先级</label>
                              <Badge className={getPriorityColor(selectedTask?.priority || '')} variant="secondary">
                                {getPriorityName(selectedTask?.priority || '')}
                              </Badge>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">状态</label>
                              <Badge className={getStatusColor(selectedTask?.status || '')} variant="secondary">
                                {getStatusName(selectedTask?.status || '')}
                              </Badge>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">部门</label>
                              <p className="text-slate-900 dark:text-slate-100">{selectedTask?.department}</p>
                            </div>
                          </div>

                          {/* 描述 */}
                          <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">详细描述</label>
                            <p className="text-slate-900 dark:text-slate-100 mt-1">{selectedTask?.description}</p>
                          </div>

                          {/* 时间信息 */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">提交时间</label>
                              <p className="text-slate-900 dark:text-slate-100">{selectedTask?.submittedDate}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">截止时间</label>
                              <p className="text-slate-900 dark:text-slate-100">{selectedTask?.dueDate}</p>
                            </div>
                          </div>

                          {/* 人员信息 */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">提交人</label>
                              <p className="text-slate-900 dark:text-slate-100">{selectedTask?.submittedBy}</p>
                            </div>
                            {selectedTask?.assignee && (
                              <div>
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">负责人</label>
                                <p className="text-slate-900 dark:text-slate-100">{selectedTask.assignee}</p>
                              </div>
                            )}
                          </div>

                          {/* 财务信息 */}
                          {(selectedTask?.amount || selectedTask?.vendor) && (
                            <div className="grid grid-cols-2 gap-4">
                              {selectedTask?.amount && (
                                <div>
                                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">金额</label>
                                  <p className="text-slate-900 dark:text-slate-100 font-medium">¥{selectedTask.amount.toLocaleString()}</p>
                                </div>
                              )}
                              {selectedTask?.vendor && (
                                <div>
                                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">供应商</label>
                                  <p className="text-slate-900 dark:text-slate-100">{selectedTask.vendor}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* 标签 */}
                          {selectedTask?.tags && selectedTask.tags.length > 0 && (
                            <div>
                              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">标签</label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {selectedTask.tags.map((tag, index) => (
                                  <Badge key={index} variant="outline">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 操作按钮 */}
                          <div className="flex space-x-2 pt-4 border-t">
                            {selectedTask?.status === 'pending' && (
                              <>
                                <Button
                                  onClick={() => {
                                    handleApprove(selectedTask.id);
                                    setSelectedTask(null);
                                  }}
                                  className="flex-1"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  批准
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => {
                                    handleReject(selectedTask.id);
                                    setSelectedTask(null);
                                  }}
                                  className="flex-1"
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  驳回
                                </Button>
                              </>
                            )}
                            {selectedTask?.status === 'draft' && (
                              <Button
                                onClick={() => {
                                  handleEdit(selectedTask.id, { status: 'pending' });
                                  setSelectedTask(null);
                                }}
                                className="flex-1"
                              >
                                <Send className="w-4 h-4 mr-1" />
                                提交审核
                              </Button>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* 快速操作按钮 */}
                    {task.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(task.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReject(task.id)}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}


                  </div>
                </div>
              ))}
            </div>
            {filteredTasks.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400 text-lg">没有找到匹配的任务</p>
                <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
                  尝试调整筛选条件或清除所有筛选
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
