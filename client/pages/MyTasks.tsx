import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CheckCircle, XCircle, Eye, Clock, AlertTriangle, Package, Search, Filter, 
  User, Users, DollarSign, FileText, Download, PieChart, ListTodo, Trello, Kanban, 
  ArrowUpRight, ArrowDownRight, Star, StarHalf, Bookmark, BookmarkCheck, 
  Layers, Timer, Briefcase, Paperclip, MessageSquare, Trash2, Edit, MoreHorizontal,
  ChevronRight, ChevronDown, Zap, Brain, Target, Sparkles, GripVertical, Move
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// 增强的任务接口
interface EnhancedTask {
  id: string;
  title: string;
  description: string;
  type: 'procurement' | 'review' | 'approval' | 'analysis' | 'finance' | 'hr';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'rejected' | 'in_review' | 'draft' | 'completed' | 'in_progress';
  amount?: number;
  vendor?: string;
  dueDate: string;
  submittedBy: string;
  submittedDate: string;
  department: string;
  tags: string[];
  assignee?: string;
  progress?: number;
  attachments?: number;
  comments?: number;
  category?: 'personal' | 'team' | 'project';
  starred?: boolean;
  column?: 'todo' | 'in_progress' | 'review' | 'done';
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
    assignee: '张经理',
    progress: 30,
    attachments: 2,
    comments: 3,
    category: 'team',
    column: 'todo'
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
    assignee: '财务总监',
    progress: 60,
    attachments: 5,
    comments: 8,
    category: 'project',
    starred: true,
    column: 'in_progress'
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
    assignee: '人事经理',
    progress: 10,
    comments: 1,
    category: 'personal',
    column: 'todo'
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
    assignee: '市场总监',
    progress: 75,
    attachments: 3,
    comments: 12,
    category: 'project',
    starred: true,
    column: 'review'
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
    assignee: '财务专员',
    progress: 100,
    attachments: 4,
    comments: 2,
    category: 'personal',
    column: 'done'
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
    assignee: 'HR总监',
    progress: 15,
    attachments: 6,
    comments: 0,
    category: 'team',
    column: 'todo'
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
    tags: ['合同', '维护', '续签'],
    progress: 100,
    attachments: 2,
    comments: 5,
    category: 'team',
    column: 'done'
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
    assignee: '培训经理',
    progress: 25,
    attachments: 1,
    comments: 3,
    category: 'project',
    column: 'todo'
  },
  {
    id: '9',
    title: '产品发布会策划',
    description: '新产品发布会策划方案，包括场地、嘉宾邀请和媒体宣传',
    type: 'approval',
    priority: 'high',
    status: 'in_progress',
    dueDate: '2024-02-05',
    submittedBy: '市场部',
    submittedDate: '2024-01-10',
    department: '市场部',
    tags: ['发布会', '策划', '新产品'],
    assignee: '市场总监',
    progress: 45,
    attachments: 7,
    comments: 15,
    category: 'project',
    starred: true,
    column: 'in_progress'
  },
  {
    id: '10',
    title: '季度销售报表分析',
    description: '分析Q4季度销售数据，提供业绩评估和下季度预测',
    type: 'analysis',
    priority: 'medium',
    status: 'completed',
    dueDate: '2024-01-08',
    submittedBy: '销售部',
    submittedDate: '2024-01-02',
    department: '销售部',
    tags: ['销售', '报表', '分析'],
    assignee: '数据分析师',
    progress: 100,
    attachments: 4,
    comments: 7,
    category: 'team',
    column: 'done'
  },
  {
    id: '11',
    title: '客户满意度调查',
    description: '进行季度客户满意度调查，收集反馈并分析改进点',
    type: 'review',
    priority: 'medium',
    status: 'in_progress',
    dueDate: '2024-01-28',
    submittedBy: '客服部',
    submittedDate: '2024-01-12',
    department: '客服部',
    tags: ['客户', '调查', '满意度'],
    assignee: '客服经理',
    progress: 50,
    attachments: 2,
    comments: 4,
    category: 'team',
    column: 'in_progress'
  },
  {
    id: '12',
    title: '网站安全审计',
    description: '对公司网站进行安全漏洞扫描和安全审计',
    type: 'review',
    priority: 'urgent',
    status: 'pending',
    dueDate: '2024-01-18',
    submittedBy: 'IT部',
    submittedDate: '2024-01-11',
    department: 'IT部',
    tags: ['安全', '审计', '网站'],
    assignee: '安全工程师',
    progress: 0,
    attachments: 1,
    comments: 2,
    category: 'team',
    column: 'todo'
  }
];

export default function MyTasks() {
  const [tasks, setTasks] = useState<EnhancedTask[]>(mockTasks);
  const [selectedTask, setSelectedTask] = useState<EnhancedTask | null>(null);
  const [activeView, setActiveView] = useState<'list' | 'board'>('board');
  const [activeTab, setActiveTab] = useState('all');
  const [progress, setProgress] = useState(0);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  
  // 拖拽引用
  const dragTaskRef = useRef<HTMLDivElement>(null);
  const dragColumnRef = useRef<HTMLDivElement>(null);
  
  // 筛选条件状态
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    priority: 'all',
    department: 'all',
    assignee: 'all',
    search: '',
    dateRange: 'all',
    category: 'all',
    column: 'all'
  });
  
  // 模拟进度条动画
  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);
  
  // 处理任务拖拽开始
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    setDraggedTask(taskId);
    if (e.currentTarget) {
      e.currentTarget.classList.add('opacity-50');
    }
    // 设置拖拽效果
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', taskId);
    }
  };
  
  // 处理任务拖拽结束
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setDraggedTask(null);
    setDragOverColumn(null);
    if (e.currentTarget) {
      e.currentTarget.classList.remove('opacity-50');
    }
  };
  
  // 处理拖拽进入列
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, column: string) => {
    e.preventDefault();
    setDragOverColumn(column);
  };
  
  // 处理拖拽离开
  const handleDragLeave = () => {
    setDragOverColumn(null);
  };
  
  // 处理拖拽放置
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetColumn: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    
    if (taskId && draggedTask) {
      // 更新任务的列
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, column: targetColumn as 'todo' | 'in_progress' | 'review' | 'done' } 
          : task
      ));
      
      // 根据列更新任务状态
      const newStatus = 
        targetColumn === 'todo' ? 'pending' :
        targetColumn === 'in_progress' ? 'in_progress' :
        targetColumn === 'review' ? 'in_review' :
        targetColumn === 'done' ? 'completed' : 'pending';
      
      handleEdit(taskId, { status: newStatus });
    }
    
    setDraggedTask(null);
    setDragOverColumn(null);
  };

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
    
    // 分类筛选
    if (filters.category !== 'all' && task.category !== filters.category) return false;
    
    // 看板列筛选
    if (filters.column !== 'all' && task.column !== filters.column) return false;
    
    // 搜索筛选
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const searchFields = [
        task.title,
        task.description,
        task.submittedBy,
        task.department,
        ...(task.tags || [])
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
    
    // 标签页筛选
    if (activeTab !== 'all') {
      switch (activeTab) {
        case 'starred':
          if (!task.starred) return false;
          break;
        case 'personal':
          if (task.category !== 'personal') return false;
          break;
        case 'team':
          if (task.category !== 'team') return false;
          break;
        case 'project':
          if (task.category !== 'project') return false;
          break;
        case 'urgent':
          if (task.priority !== 'urgent') return false;
          break;
        case 'completed':
          if (task.status !== 'completed' && task.column !== 'done') return false;
          break;
      }
    }
    
    return true;
  });
  
  // 按列分组任务（用于看板视图）
  const tasksByColumn = {
    todo: filteredTasks.filter(task => task.column === 'todo'),
    in_progress: filteredTasks.filter(task => task.column === 'in_progress'),
    review: filteredTasks.filter(task => task.column === 'review'),
    done: filteredTasks.filter(task => task.column === 'done')
  };
  
  // 按优先级分组任务
  const tasksByPriority = {
    urgent: filteredTasks.filter(task => task.priority === 'urgent'),
    high: filteredTasks.filter(task => task.priority === 'high'),
    medium: filteredTasks.filter(task => task.priority === 'medium'),
    low: filteredTasks.filter(task => task.priority === 'low')
  };
  
  // 按类别分组任务
  const tasksByCategory = {
    personal: filteredTasks.filter(task => task.category === 'personal'),
    team: filteredTasks.filter(task => task.category === 'team'),
    project: filteredTasks.filter(task => task.category === 'project')
  };

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
        {/* 页面主标题与副标题已移除；视图切换器将放置在任务概览下方 */}
        
        {/* 统计信息和进度 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  任务概览
                </div>
                <Badge variant="outline" className="text-sm">
                  {filteredTasks.length} 项任务
                </Badge>
              </CardTitle>
              <CardDescription>
                当前任务完成进度
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">总体进度</span>
                    <Badge variant="secondary" className="ml-2">
                      {progress}%
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {filteredTasks.filter(t => t.status === 'completed' || t.column === 'done').length} / {filteredTasks.length} 已完成
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">待处理</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {tasksByColumn.todo.length}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                      <ListTodo className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">进行中</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {tasksByColumn.in_progress.length}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">审核中</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {tasksByColumn.review.length}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center">
                      <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">已完成</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {tasksByColumn.done.length}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChart className="w-5 h-5 text-blue-600" />
                任务分布
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm">个人任务</span>
                    </div>
                    <span className="text-sm font-medium">{tasksByCategory.personal.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="text-sm">团队任务</span>
                    </div>
                    <span className="text-sm font-medium">{tasksByCategory.team.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <span className="text-sm">项目任务</span>
                    </div>
                    <span className="text-sm font-medium">{tasksByCategory.project.length}</span>
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">紧急任务</span>
                    <span className="text-sm text-red-600 font-medium">
                      {tasksByPriority.urgent.length}
                    </span>
                  </div>
                  <Progress value={(tasksByPriority.urgent.length / filteredTasks.length) * 100} className="h-1 bg-red-100" indicatorClassName="bg-red-600" />
                </div>
                
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">高优先级</span>
                    <span className="text-sm text-orange-600 font-medium">
                      {tasksByPriority.high.length}
                    </span>
                  </div>
                  <Progress value={(tasksByPriority.high.length / filteredTasks.length) * 100} className="h-1 bg-orange-100" indicatorClassName="bg-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 视图切换：放在任务概览的下方 */}
        <div className="flex items-center justify-end">
          <div className="flex items-center space-x-2">
            <Button 
              variant={activeView === 'list' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveView('list')}
              className="flex items-center gap-1"
            >
              <ListTodo className="w-4 h-4" />
              列表
            </Button>
            <Button 
              variant={activeView === 'board' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveView('board')}
              className="flex items-center gap-1"
            >
              <Kanban className="w-4 h-4" />
              看板
            </Button>
          </div>
        </div>

        {/* 标签页和操作按钮 */}
        <div className="flex items-center justify-between">
          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-2">
              <TabsList>
                <TabsTrigger value="all" className="flex items-center gap-1">
                  <Layers className="w-4 h-4" />
                  全部
                </TabsTrigger>
                <TabsTrigger value="starred" className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  星标
                </TabsTrigger>
                <TabsTrigger value="personal" className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  个人
                </TabsTrigger>
                <TabsTrigger value="team" className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  团队
                </TabsTrigger>
                <TabsTrigger value="project" className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  项目
                </TabsTrigger>
                <TabsTrigger value="urgent" className="flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  紧急
                </TabsTrigger>
                <TabsTrigger value="completed" className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  已完成
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Filter className="w-4 h-4" />
                  筛选
                </Button>
              </div>
            </div>
            
            <TabsContent value="all" className="mt-0">
              {/* 筛选器会在这里显示 */}
            </TabsContent>
          </Tabs>
        </div>
        
        {/* 筛选面板 - 可折叠 */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-600" />
                高级筛选
              </div>
              <Button variant="ghost" size="sm">
                <ChevronDown className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* 搜索框 */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="搜索任务..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* 状态筛选 */}
              <div>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="pending">待处理</SelectItem>
                    <SelectItem value="in_progress">进行中</SelectItem>
                    <SelectItem value="in_review">审核中</SelectItem>
                    <SelectItem value="completed">已完成</SelectItem>
                    <SelectItem value="approved">已批准</SelectItem>
                    <SelectItem value="rejected">已驳回</SelectItem>
                    <SelectItem value="draft">草稿</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 类型筛选 */}
              <div>
                <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="类型" />
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

              {/* 优先级筛选 */}
              <div>
                <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="优先级" />
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

              {/* 清除筛选按钮 */}
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setFilters({
                    status: 'all',
                    type: 'all',
                    priority: 'all',
                    department: 'all',
                    assignee: 'all',
                    search: '',
                    dateRange: 'all',
                    category: 'all',
                    column: 'all'
                  })}
                >
                  清除筛选
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 列表视图 */}
        {activeView === 'list' && (
          <Card>
            <CardHeader>
              <CardTitle>任务列表</CardTitle>
              <CardDescription>按筛选条件展示所有任务</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>标题</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>优先级</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>截止日期</TableHead>
                    <TableHead>部门</TableHead>
                    <TableHead>负责人</TableHead>
                    <TableHead>进度</TableHead>
                    <TableHead>附件/评论</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-slate-500">
                        暂无符合条件的任务
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800">
                              {getTaskIcon(task.type)}
                            </span>
                            <span>{task.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getTaskTypeName(task.type)}</TableCell>
                        <TableCell>
                          {task.priority === 'urgent' && (
                            <Badge className="bg-red-500 text-white">紧急</Badge>
                          )}
                          {task.priority === 'high' && (
                            <Badge className="bg-orange-500 text-white">高</Badge>
                          )}
                          {task.priority === 'medium' && (
                            <Badge className="bg-yellow-500 text-white">中</Badge>
                          )}
                          {task.priority === 'low' && (
                            <Badge className="bg-green-500 text-white">低</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {task.status === 'pending' && (
                            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">待处理</Badge>
                          )}
                          {task.status === 'in_review' && (
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">审核中</Badge>
                          )}
                          {task.status === 'approved' && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">已批准</Badge>
                          )}
                          {task.status === 'rejected' && (
                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">已驳回</Badge>
                          )}
                          {task.status === 'in_progress' && (
                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">进行中</Badge>
                          )}
                          {task.status === 'completed' && (
                            <Badge className="bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200">已完成</Badge>
                          )}
                        </TableCell>
                        <TableCell>{task.dueDate}</TableCell>
                        <TableCell>{task.department}</TableCell>
                        <TableCell>{task.assignee || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-xs">{task.progress ?? 0}%</span>
                            <Progress value={task.progress ?? 0} className="h-2 w-24" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3 text-slate-600">
                            <span className="flex items-center text-xs">
                              <Paperclip className="w-3 h-3 mr-1" />
                              {task.attachments ?? 0}
                            </span>
                            <span className="flex items-center text-xs">
                              <MessageSquare className="w-3 h-3 mr-1" />
                              {task.comments ?? 0}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedTask(task)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              详情
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApprove(task.id)}
                              className="flex items-center gap-1"
                            >
                              <CheckCircle className="h-4 w-4" />
                              审批通过
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(task.id)}
                              className="flex items-center gap-1"
                            >
                              <XCircle className="h-4 w-4" />
                              审批拒绝
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* 看板视图 */}
        {activeView === 'board' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* 待处理列 */}
            <div 
              className={`bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm ${dragOverColumn === 'todo' ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20' : ''}`}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={(e) => handleDragEnter(e, 'todo')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'todo')}
            >
              <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">待处理</h3>
                  <Badge variant="outline" className="ml-1">{tasksByColumn.todo.length}</Badge>
                </div>
                
              </div>
              <div className="p-3 space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto">
                {tasksByColumn.todo.map((task) => (
                  <Card 
                    key={task.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-slate-400 cursor-grab" />
                          <Badge className={getPriorityColor(task.priority)} variant="secondary">
                            {getPriorityName(task.priority)}
                          </Badge>
                        </div>
                        {task.starred && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                      </div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">{task.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                        {task.description}
                      </p>
                      
                      {task.progress !== undefined && (
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-500 dark:text-slate-400">进度</span>
                            <span className="text-xs font-medium">{task.progress}%</span>
                          </div>
                          <Progress value={task.progress} className="h-1" />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {task.assignee ? task.assignee.charAt(0) : '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {task.dueDate}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {task.attachments && task.attachments > 0 && (
                            <span className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                              <Paperclip className="h-3 w-3 mr-1" />
                              {task.attachments}
                            </span>
                          )}
                          {task.comments && task.comments > 0 && (
                            <span className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {task.comments}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {tasksByColumn.todo.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      没有待处理任务
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* 进行中列 */}
            <div 
              className={`bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm ${dragOverColumn === 'in_progress' ? 'border-amber-500 dark:border-amber-400 ring-2 ring-amber-500/20' : ''}`}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={(e) => handleDragEnter(e, 'in_progress')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'in_progress')}
            >
              <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">进行中</h3>
                  <Badge variant="outline" className="ml-1">{tasksByColumn.in_progress.length}</Badge>
                </div>
                
              </div>
              <div className="p-3 space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto">
                {tasksByColumn.in_progress.map((task) => (
                  <Card 
                    key={task.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-slate-400 cursor-grab" />
                          <Badge className={getPriorityColor(task.priority)} variant="secondary">
                            {getPriorityName(task.priority)}
                          </Badge>
                        </div>
                        {task.starred && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                      </div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">{task.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                        {task.description}
                      </p>
                      
                      {task.progress !== undefined && (
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-500 dark:text-slate-400">进度</span>
                            <span className="text-xs font-medium">{task.progress}%</span>
                          </div>
                          <Progress value={task.progress} className="h-1" />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {task.assignee ? task.assignee.charAt(0) : '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {task.dueDate}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {task.attachments && task.attachments > 0 && (
                            <span className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                              <Paperclip className="h-3 w-3 mr-1" />
                              {task.attachments}
                            </span>
                          )}
                          {task.comments && task.comments > 0 && (
                            <span className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {task.comments}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {tasksByColumn.in_progress.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      没有进行中任务
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* 审核中列 */}
            <div 
              className={`bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm ${dragOverColumn === 'review' ? 'border-purple-500 dark:border-purple-400 ring-2 ring-purple-500/20' : ''}`}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={(e) => handleDragEnter(e, 'review')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'review')}
            >
              <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">审核中</h3>
                  <Badge variant="outline" className="ml-1">{tasksByColumn.review.length}</Badge>
                </div>
                
              </div>
              <div className="p-3 space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto">
                {tasksByColumn.review.map((task) => (
                  <Card 
                    key={task.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-slate-400 cursor-grab" />
                          <Badge className={getPriorityColor(task.priority)} variant="secondary">
                            {getPriorityName(task.priority)}
                          </Badge>
                        </div>
                        {task.starred && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                      </div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">{task.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                        {task.description}
                      </p>
                      
                      {task.progress !== undefined && (
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-500 dark:text-slate-400">进度</span>
                            <span className="text-xs font-medium">{task.progress}%</span>
                          </div>
                          <Progress value={task.progress} className="h-1" />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {task.assignee ? task.assignee.charAt(0) : '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {task.dueDate}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {task.attachments && task.attachments > 0 && (
                            <span className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                              <Paperclip className="h-3 w-3 mr-1" />
                              {task.attachments}
                            </span>
                          )}
                          {task.comments && task.comments > 0 && (
                            <span className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {task.comments}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {tasksByColumn.review.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      没有审核中任务
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* 已完成列 */}
            <div 
              className={`bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm ${dragOverColumn === 'done' ? 'border-green-500 dark:border-green-400 ring-2 ring-green-500/20' : ''}`}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={(e) => handleDragEnter(e, 'done')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'done')}
            >
              <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">已完成</h3>
                  <Badge variant="outline" className="ml-1">{tasksByColumn.done.length}</Badge>
                </div>
                
              </div>
              <div className="p-3 space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto">
                {tasksByColumn.done.map((task) => (
                  <Card 
                    key={task.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow opacity-80"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-slate-400 cursor-grab" />
                          <Badge className={getPriorityColor(task.priority)} variant="secondary">
                            {getPriorityName(task.priority)}
                          </Badge>
                        </div>
                        {task.starred && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                      </div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">{task.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                        {task.description}
                      </p>
                      
                      {task.progress !== undefined && (
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-500 dark:text-slate-400">进度</span>
                            <span className="text-xs font-medium">{task.progress}%</span>
                          </div>
                          <Progress value={task.progress} className="h-1" />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {task.assignee ? task.assignee.charAt(0) : '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {task.dueDate}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {task.attachments && task.attachments > 0 && (
                            <span className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                              <Paperclip className="h-3 w-3 mr-1" />
                              {task.attachments}
                            </span>
                          )}
                          {task.comments && task.comments > 0 && (
                            <span className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {task.comments}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {tasksByColumn.done.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      没有已完成任务
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* 任务详情对话框 */}
        <Dialog>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900">
                  <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                项目预算审核
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">描述</h3>
                  <p className="text-slate-900 dark:text-slate-100">
                    审核Q1季度项目预算分配方案，确保资源合理配置。需要审核各部门提交的预算申请，评估合理性，并提出调整建议。
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">进度</h3>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">当前进度</span>
                    <span className="text-sm font-medium">60%</span>
                  </div>
                  <Progress value={60} className="h-2 mb-4" />
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox id="task1" checked />
                      <label htmlFor="task1" className="text-sm line-through text-slate-500">收集各部门预算申请</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="task2" checked />
                      <label htmlFor="task2" className="text-sm line-through text-slate-500">初步审核预算合理性</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="task3" />
                      <label htmlFor="task3" className="text-sm">与部门负责人沟通调整方案</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="task4" />
                      <label htmlFor="task4" className="text-sm">提交最终预算方案</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="task5" />
                      <label htmlFor="task5" className="text-sm">获取管理层批准</label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">附件</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">Q1预算申请汇总.xlsx</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-2 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">预算审核标准.pdf</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">评论</h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>WJ</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">王经理</span>
                          <span className="text-xs text-slate-500">2024-01-05 14:30</span>
                        </div>
                        <p className="text-sm mt-1">市场部预算申请中的广告费用偏高，需要进一步核实。</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>CZ</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">财务总监</span>
                          <span className="text-xs text-slate-500">2024-01-06 09:15</span>
                        </div>
                        <p className="text-sm mt-1">请按照去年Q4的实际支出情况进行对比分析，重点关注增长较大的项目。</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>WJ</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">王经理</span>
                          <span className="text-xs text-slate-500">2024-01-06 11:42</span>
                        </div>
                        <p className="text-sm mt-1">已与市场部沟通，他们将在下周一前提交修订后的预算申请。</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Textarea placeholder="添加评论..." className="min-h-[80px]" />
                    <div className="flex justify-end mt-2">
                      <Button size="sm">发送评论</Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">任务信息</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-slate-500 block">状态</span>
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 mt-1">
                        审核中
                      </Badge>
                    </div>
                    
                    <div>
                      <span className="text-xs text-slate-500 block">优先级</span>
                      <Badge className="bg-red-500 text-white dark:bg-red-600 mt-1">
                        紧急
                      </Badge>
                    </div>
                    
                    <div>
                      <span className="text-xs text-slate-500 block">截止日期</span>
                      <span className="text-sm font-medium">2024-01-12</span>
                    </div>
                    
                    <div>
                      <span className="text-xs text-slate-500 block">创建日期</span>
                      <span className="text-sm">2024-01-05</span>
                    </div>
                    
                    <div>
                      <span className="text-xs text-slate-500 block">金额</span>
                      <span className="text-sm font-medium">¥500,000</span>
                    </div>
                    
                    <div>
                      <span className="text-xs text-slate-500 block">部门</span>
                      <span className="text-sm">财务部</span>
                    </div>
                    
                    <div>
                      <span className="text-xs text-slate-500 block">标签</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">预算</Badge>
                        <Badge variant="outline" className="text-xs">审核</Badge>
                        <Badge variant="outline" className="text-xs">Q1</Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">负责人</h3>
                  <div className="flex items-center gap-2 p-2 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>CZ</AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="text-sm font-medium block">财务总监</span>
                      <span className="text-xs text-slate-500">财务部</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">操作</h3>
                  <div className="space-y-2">
                    <Button className="w-full justify-start" variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      编辑任务
                    </Button>
                    <Button className="w-full justify-start" variant="outline" size="sm">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      批准任务
                    </Button>
                    <Button className="w-full justify-start" variant="outline" size="sm">
                      <XCircle className="w-4 h-4 mr-2" />
                      驳回任务
                    </Button>
                    <Button className="w-full justify-start" variant="outline" size="sm">
                      <User className="w-4 h-4 mr-2" />
                      分配任务
                    </Button>
                    <Button className="w-full justify-start text-red-600 hover:text-red-700" variant="outline" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      删除任务
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
          <DialogFooter>
            <Button variant="outline">关闭</Button>
            <Button>保存更改</Button>
          </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* 动态任务详情对话框（基于 selectedTask 打开） */}
        <Dialog open={!!selectedTask} onOpenChange={(open) => { if (!open) setSelectedTask(null); }}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800">
                  {selectedTask ? getTaskIcon(selectedTask.type) : null}
                </div>
                {selectedTask?.title ?? '任务详情'}
              </DialogTitle>
            </DialogHeader>
            {selectedTask && (
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">描述</h3>
                    <p className="text-slate-900 dark:text-slate-100">{selectedTask.description}</p>
                  </div>
                  {typeof selectedTask.progress === 'number' && (
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">进度</h3>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">当前进度</span>
                        <span className="text-sm font-medium">{selectedTask.progress}%</span>
                      </div>
                      <Progress value={selectedTask.progress} className="h-2 mb-4" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">评论</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">暂无评论示例。</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">任务信息</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs text-slate-500 block">状态</span>
                        <Badge className={getStatusColor(selectedTask.status)}>{getStatusName(selectedTask.status)}</Badge>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 block">优先级</span>
                        <Badge className={getPriorityColor(selectedTask.priority)} variant="secondary">{getPriorityName(selectedTask.priority)}</Badge>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 block">截止日期</span>
                        <span className="text-sm font-medium">{selectedTask.dueDate}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 block">创建人</span>
                        <span className="text-sm">{selectedTask.submittedBy}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 block">部门</span>
                        <span className="text-sm">{selectedTask.department}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">操作</h3>
                    <div className="space-y-2">
                      <Button className="w-full justify-start" variant="outline" size="sm" onClick={() => handleApprove(selectedTask.id)}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        批准任务
                      </Button>
                      <Button className="w-full justify-start" variant="outline" size="sm" onClick={() => handleReject(selectedTask.id)}>
                        <XCircle className="w-4 h-4 mr-2" />
                        驳回任务
                      </Button>
                      <Button className="w-full justify-start" variant="outline" size="sm" onClick={() => setSelectedTask(null)}>
                        关闭详情
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedTask(null)}>关闭</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
