import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CheckCircle, XCircle, Eye, Clock, AlertTriangle, Package, Search, Filter, 
  User, Users, DollarSign, FileText, Download, PieChart, ListTodo, 
  ArrowUpRight, ArrowDownRight, Star, StarHalf, Bookmark, BookmarkCheck, 
  Layers, Timer, Briefcase, Paperclip, MessageSquare, Trash2, Edit, MoreHorizontal,
  ChevronRight, ChevronDown, Zap, Brain, Target, Sparkles, GripVertical, Move
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// 增强的任务接口
interface TaskTodo {
  id: string;
  title: string;
  done: boolean;
  // 右侧待办清单的要素字段（可选）
  dueDate?: string;            // 截止日期
  estimatedTime?: string;      // 预计耗时
  category?: string;           // 分类
  tags?: string[];             // 标签
  status?: 'pending' | 'in_progress' | 'completed' | 'delayed'; // 状态
  belongsTo?: string;          // 所属任务/项目要素
}

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
  todos?: TaskTodo[];
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
    column: 'todo',
    todos: [
      { id: 't1-1', title: '确认采购清单', done: true, dueDate: '2024-01-11', estimatedTime: '20min', category: '采购', tags: ['清单'], status: 'completed', belongsTo: '项目A · 采购' },
      { id: 't1-2', title: '比价并选择供应商', done: false, dueDate: '2024-01-12', estimatedTime: '45min', category: '采购', tags: ['比价','供应商'], status: 'in_progress', belongsTo: '项目A · 采购' },
      { id: 't1-3', title: '提交审批流程', done: false, dueDate: '2024-01-13', estimatedTime: '15min', category: '审批', tags: ['流程'], status: 'pending', belongsTo: '项目A · 审批' }
    ]
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
    column: 'in_progress',
    todos: [
      { id: 't2-1', title: '收集部门预算', done: true, dueDate: '2024-01-10', estimatedTime: '1h', category: '预算', tags: ['部门'], status: 'completed', belongsTo: 'Q1预算 · 收集' },
      { id: 't2-2', title: '审核核心项目资金', done: false, dueDate: '2024-01-11', estimatedTime: '1.5h', category: '审核', tags: ['项目','资金'], status: 'in_progress', belongsTo: 'Q1预算 · 审核' },
      { id: 't2-3', title: '形成审核意见', done: false, dueDate: '2024-01-12', estimatedTime: '40min', category: '输出', tags: ['意见'], status: 'pending', belongsTo: 'Q1预算 · 输出' }
    ]
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
    column: 'in_progress',
    todos: [
      { id: 't9-1', title: '确定发布场地', done: true },
      { id: 't9-2', title: '邀请嘉宾与媒体', done: false },
      { id: 't9-3', title: '准备物料与流程', done: false }
    ]
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
// 仅保留列表视图，不再需要视图切换状态
  const [activeTab, setActiveTab] = useState('all');
  const [progress, setProgress] = useState(0);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoDueDate, setNewTodoDueDate] = useState('');
  const [newTodoEstimatedTime, setNewTodoEstimatedTime] = useState('');
  const [taskTodosDraft, setTaskTodosDraft] = useState<TaskTodo[]>([]);

  const addDraftTodoRow = () => {
    setTaskTodosDraft(prev => [...prev, { id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`, title: '', done: false }]);
  };

  const updateDraftTodo = (id: string, field: keyof TaskTodo, value: any) => {
    setTaskTodosDraft(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const removeDraftTodo = (id: string) => {
    setTaskTodosDraft(prev => prev.filter(t => t.id !== id));
  };
  
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
  
  // 新建/编辑任务对话框状态
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [taskForm, setTaskForm] = useState<Partial<EnhancedTask>>({
    title: '',
    description: '',
    type: 'procurement',
    priority: 'medium',
    status: 'pending',
    dueDate: new Date().toISOString().slice(0, 10),
    department: '行政部',
    submittedBy: '当前用户',
    submittedDate: new Date().toISOString().slice(0, 10),
    tags: [],
  });
  
  const openCreateTask = () => {
    setIsEditingTask(false);
    setTaskForm({
      title: '',
      description: '',
      type: 'procurement',
      priority: 'medium',
      status: 'pending',
      dueDate: new Date().toISOString().slice(0, 10),
      department: '行政部',
      submittedBy: '当前用户',
      submittedDate: new Date().toISOString().slice(0, 10),
      tags: [],
    });
    setTaskTodosDraft([{ id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`, title: '', done: false }]);
    setIsTaskModalOpen(true);
  };
  
  const openEditTask = () => {
    if (!selectedTask) return;
    setIsEditingTask(true);
    setTaskForm({ ...selectedTask });
    setTaskTodosDraft(selectedTask.todos ? selectedTask.todos.map(t => ({ ...t })) : []);
    setIsTaskModalOpen(true);
  };
  
  const saveTask = () => {
    const cleanedTodos = (taskTodosDraft || []).filter(t => t.title && t.title.trim());
    if (isEditingTask && selectedTask) {
      const updated: EnhancedTask = {
        ...selectedTask,
        ...taskForm,
        tags: taskForm.tags || [],
        todos: cleanedTodos,
        progress: computeProgressFromTodos(cleanedTodos, selectedTask.progress)
      } as EnhancedTask;
      setTasks(prev => prev.map(t => t.id === selectedTask.id ? updated : t));
      setSelectedTask(updated);
    } else {
      const newId = String(Math.max(0, ...tasks.map(t => parseInt(t.id))) + 1);
      const newTask: EnhancedTask = {
        id: newId,
        title: taskForm.title || '未命名任务',
        description: taskForm.description || '',
        type: (taskForm.type as any) || 'procurement',
        priority: (taskForm.priority as any) || 'medium',
        status: (taskForm.status as any) || 'pending',
        dueDate: taskForm.dueDate || new Date().toISOString().slice(0, 10),
        submittedBy: taskForm.submittedBy || '当前用户',
        submittedDate: taskForm.submittedDate || new Date().toISOString().slice(0, 10),
        department: taskForm.department || '行政部',
        tags: taskForm.tags || [],
        todos: cleanedTodos,
        progress: computeProgressFromTodos(cleanedTodos, 0),
        category: 'team',
        column: 'todo',
      };
      setTasks(prev => [newTask, ...prev]);
      setSelectedTask(newTask);
    }
    setIsTaskModalOpen(false);
    setTaskTodosDraft([]);
  };
  
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

  // 计算基于待办的任务进度
  const computeProgressFromTodos = (todos: TaskTodo[], fallback?: number) => {
    if (!todos || todos.length === 0) return fallback ?? 0;
    const doneCount = todos.filter(t => t.done).length;
    return Math.round((doneCount / todos.length) * 100);
  };

  // 添加待办
  const addTodo = (taskId: string, title: string, dueDate?: string, estimatedTime?: string) => {
    const todo: TaskTodo = { id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`, title, done: false, dueDate, estimatedTime };
    setTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task;
      const todos = [...(task.todos || []), todo];
      return { ...task, todos, progress: computeProgressFromTodos(todos, task.progress) };
    }));
    setSelectedTask(prev => {
      if (!prev || prev.id !== taskId) return prev;
      const todos = [...(prev.todos || []), todo];
      return { ...prev, todos, progress: computeProgressFromTodos(todos, prev.progress) };
    });
  };

  // 勾选/取消待办
  const toggleTodo = (taskId: string, todoId: string, done?: boolean) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task;
      const todos = (task.todos || []).map(t => t.id === todoId ? { ...t, done: done ?? !t.done } : t);
      return { ...task, todos, progress: computeProgressFromTodos(todos, task.progress) };
    }));
    setSelectedTask(prev => {
      if (!prev || prev.id !== taskId) return prev;
      const todos = (prev.todos || []).map(t => t.id === todoId ? { ...t, done: done ?? !t.done } : t);
      return { ...prev, todos, progress: computeProgressFromTodos(todos, prev.progress) };
    });
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

  // 默认选中列表中的第一个任务；当筛选变化导致当前选中不在列表中时，重置为首项
  useEffect(() => {
    if (filteredTasks.length === 0) {
      if (selectedTask) setSelectedTask(null);
      return;
    }
    const exists = selectedTask && filteredTasks.some(t => t.id === (selectedTask as EnhancedTask).id);
    if (!exists) {
      setSelectedTask(filteredTasks[0]);
    }
  }, [filteredTasks]);
  
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
    <div className="h-full overflow-auto bg-white dark:bg-slate-900">
      <div className="w-full p-0 space-y-0">
        {/* 页面主标题与副标题已移除；视图切换器将放置在任务概览下方 */}
        
        {/* 统计信息和进度 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="col-span-1 md:col-span-4">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mx-4 md:mx-6 my-4 md:my-6 p-4 md:p-5">
            <div className="pb-2">
              <div className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  任务概览
                </div>
                <Badge variant="outline" className="text-sm">
                  {filteredTasks.length} 项任务
                </Badge>
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                当前任务完成进度
              </div>
            </div>
            <div className="pt-3">
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
            </div>
            </div>
          </div>
          
        </div>
        
        {/* 视图固定为列表视图，移除切换按钮 */}

        
        
        

        {/* 主从布局容器（左4/右8） */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-y border-slate-200 dark:border-slate-800 py-4 my-4 md:py-6 md:my-6 mx-4 md:mx-6">
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 space-y-4">
        {/* 列表视图（固定保留） */}
          <div>
            <div>
              {/** 列表头部文案已移除 */}
              <div className="flex flex-col md:flex-row gap-3 items-end">
                <div className="w-full md:w-40">
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
                <div className="w-full md:w-40">
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
                <div className="w-full md:w-40">
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
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setFilters(prev => ({ ...prev, search: '', status: 'all', type: 'all', priority: 'all' }))}>重置</Button>
                </div>
              </div>
            </div>
            {/* 新建任务按钮：筛选条件下方另起一行 */}
            <div className="mt-2 -mx-4">
              <Button variant="default" size="sm" onClick={openCreateTask}>新建任务</Button>
            </div>
            <div className="py-3">
              {/* 事件风格的任务列表 */}
              <div className="flex-1 overflow-y-auto">
                {filteredTasks.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-slate-500 dark:text-slate-400">
                    <div className="text-center">
                      <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">没有找到匹配的任务</p>
                    </div>
                  </div>
                ) : (
                  filteredTasks.map((task) => {
                    const isSelected = selectedTask?.id === task.id;
                    const priorityClass =
                      task.priority === 'urgent'
                        ? 'border-l-eip-alert bg-eip-alert/5'
                        : task.priority === 'high'
                        ? 'border-l-eip-warning bg-eip-warning/5'
                        : task.priority === 'medium'
                        ? 'border-l-slate-300 bg-slate-50'
                        : 'border-l-slate-200 bg-slate-50';

                    return (
                      <div
                        key={task.id}
                        className={`border-l-4 p-4 cursor-pointer transition-all duration-200 border-b border-slate-200 ${priorityClass} ${isSelected ? 'bg-eip-accent/10 shadow-md' : 'hover:bg-slate-100/50'}`}
                        onClick={() => setSelectedTask(task)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800">
                              {getTaskIcon(task.type)}
                            </span>
                            <h3 className="font-semibold text-slate-900 text-sm truncate">
                              {task.title}
                            </h3>
                          </div>
                          <Badge className={getStatusColor(task.status)}>
                            {getStatusName(task.status)}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <div>截止 {task.dueDate}</div>
                          <div className="flex items-center gap-2">
                            <Badge className={getPriorityColor(task.priority)} variant="secondary">
                              {getPriorityName(task.priority)}
                            </Badge>
                            {task.tags && task.tags.length > 0 && (
                              <span className="hidden sm:inline">标签：{task.tags.slice(0,2).join('、')}{task.tags.length > 2 ? ` +${task.tags.length-2}` : ''}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {/* 状态条 */}
              <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                  <span>显示 {filteredTasks.length} 个任务</span>
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-eip-alert rounded-full mr-1"></div>
                      紧急: {filteredTasks.filter(t => t.priority === 'urgent').length}
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-eip-warning rounded-full mr-1"></div>
                      进行中: {filteredTasks.filter(t => t.status === 'in_progress').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* 任务新建/编辑抽屉 */}
        <Drawer open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen} direction="right">
          <DrawerContent side="right" className="w-[860px]">
            <DrawerHeader>
              <DrawerTitle>{isEditingTask ? '编辑任务' : '新建任务'}</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 space-y-4">
              <div>
                <Input placeholder="任务标题" value={taskForm.title || ''} onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))} />
              </div>
              <div>
                <Textarea placeholder="任务描述" value={taskForm.description || ''} onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Select value={taskForm.type as any} onValueChange={(v) => setTaskForm(prev => ({ ...prev, type: v as any }))}>
                  <SelectTrigger><SelectValue placeholder="类型" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="procurement">采购</SelectItem>
                    <SelectItem value="review">审核</SelectItem>
                    <SelectItem value="approval">审批</SelectItem>
                    <SelectItem value="analysis">分析</SelectItem>
                    <SelectItem value="finance">财务</SelectItem>
                    <SelectItem value="hr">人事</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={taskForm.priority as any} onValueChange={(v) => setTaskForm(prev => ({ ...prev, priority: v as any }))}>
                  <SelectTrigger><SelectValue placeholder="优先级" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">紧急</SelectItem>
                    <SelectItem value="high">高</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="low">低</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={taskForm.status as any} onValueChange={(v) => setTaskForm(prev => ({ ...prev, status: v as any }))}>
                  <SelectTrigger><SelectValue placeholder="状态" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">待处理</SelectItem>
                    <SelectItem value="in_progress">进行中</SelectItem>
                    <SelectItem value="in_review">审核中</SelectItem>
                    <SelectItem value="approved">已批准</SelectItem>
                    <SelectItem value="rejected">已驳回</SelectItem>
                    <SelectItem value="completed">已完成</SelectItem>
                    <SelectItem value="draft">草稿</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="date" value={taskForm.dueDate || ''} onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))} />
                <Input placeholder="部门" value={taskForm.department || ''} onChange={(e) => setTaskForm(prev => ({ ...prev, department: e.target.value }))} />
                <Input placeholder="负责人" value={taskForm.assignee || ''} onChange={(e) => setTaskForm(prev => ({ ...prev, assignee: e.target.value }))} />
                <Input placeholder="标签（逗号分隔）" value={(taskForm.tags || []).join(',')} onChange={(e) => setTaskForm(prev => ({ ...prev, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">初始待办</h3>
                <div className="space-y-2">
                  {taskTodosDraft.length === 0 && (
                    <div className="text-xs text-slate-500">暂无待办，点击下方按钮添加</div>
                  )}
                  {taskTodosDraft.map(todo => (
                    <div key={todo.id} className="flex gap-2 items-center">
                      <Input
                        placeholder="待办标题"
                        value={todo.title}
                        onChange={(e) => updateDraftTodo(todo.id, 'title', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="date"
                        value={todo.dueDate || ''}
                        onChange={(e) => updateDraftTodo(todo.id, 'dueDate', e.target.value)}
                        className="w-40"
                      />
                      <Input
                        placeholder="预计耗时"
                        value={todo.estimatedTime || ''}
                        onChange={(e) => updateDraftTodo(todo.id, 'estimatedTime', e.target.value)}
                        className="w-28"
                      />
                      <Button variant="outline" size="sm" onClick={() => removeDraftTodo(todo.id)}>删除</Button>
                    </div>
                  ))}
                  <Button variant="secondary" size="sm" onClick={addDraftTodoRow}>添加一项</Button>
                </div>
              </div>
            </div>
            <DrawerFooter>
              <Button variant="outline" onClick={() => setIsTaskModalOpen(false)}>取消</Button>
              <Button onClick={saveTask}>保存</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* 看板视图 */}
        {false && (
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
                  <div 
                    key={task.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className="p-3">
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
                    </div>
                  </div>
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
                  <div 
                    key={task.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className="p-3">
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
                    </div>
                  </div>
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
                  <div 
                    key={task.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className="p-3">
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
                    </div>
                  </div>
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
                  <div 
                    key={task.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow opacity-80"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className="p-3">
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
                    </div>
                  </div>
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
        {false && (<Dialog>
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
        </Dialog>)}
          </div>
          {/* 右侧详情与待办面板 */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 space-y-6">
            <div className="sticky top-4">
              <div className="border-b border-slate-200 dark:border-slate-700 pb-3 mb-3">
                <div className="flex items-center gap-2 text-xl font-bold">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800">
                    {selectedTask ? getTaskIcon(selectedTask.type) : null}
                  </div>
                  {selectedTask ? selectedTask.title : '任务详情'}
                </div>
                {!selectedTask && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">选择左侧任务以查看详情</p>
                )}
                {selectedTask && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge className={getStatusColor(selectedTask.status)}>{getStatusName(selectedTask.status)}</Badge>
                    <Badge className={getPriorityColor(selectedTask.priority)} variant="secondary">{getPriorityName(selectedTask.priority)}</Badge>
                    <span className="text-xs text-slate-500 dark:text-slate-400">截止 {selectedTask.dueDate}</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                {selectedTask ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">描述</h3>
                      <p className="text-slate-900 dark:text-slate-100 text-sm leading-6">{selectedTask.description}</p>
                    </div>
                    {typeof selectedTask.progress === 'number' && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-500 dark:text-slate-400">进度</span>
                          <span className="text-xs font-medium">{selectedTask.progress}%</span>
                        </div>
                        <Progress value={selectedTask.progress} className="h-2" />
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">基本信息</h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={getStatusColor(selectedTask.status)}>{getStatusName(selectedTask.status)}</Badge>
                        <Badge className={getPriorityColor(selectedTask.priority)} variant="secondary">{getPriorityName(selectedTask.priority)}</Badge>
                        <span className="text-xs text-slate-500 dark:text-slate-400">截止 {selectedTask.dueDate}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">创建人 {selectedTask.submittedBy}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
                        <ListTodo className="h-4 w-4 text-slate-400" />
                        待办清单
                      </h3>
                      {selectedTask.todos && selectedTask.todos.length > 0 ? (
                        <div className="space-y-2">
                          {selectedTask.todos.map((todo) => (
                            <div
                              key={todo.id}
                              className={`rounded-md border p-3 ${todo.done ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}
                            >
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  checked={todo.done}
                                  onCheckedChange={(checked) => toggleTodo(selectedTask.id, todo.id, !!checked)}
                                  className="mt-0.5"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className={`text-sm font-medium ${todo.done ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>{todo.title}</span>
                                    {todo.status && (
                                      <Badge className={`${todo.status === 'completed' ? 'bg-green-100 text-green-800' : todo.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : todo.status === 'delayed' ? 'bg-red-100 text-red-800' : 'bg-slate-200 text-slate-800'}`}>{todo.status === 'completed' ? '已完成' : todo.status === 'in_progress' ? '进行中' : todo.status === 'delayed' ? '延期' : '未开始'}</Badge>
                                    )}
                                  </div>
                                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {todo.dueDate || '—'}</span>
                                    <span className="flex items-center gap-1"><Timer className="h-3 w-3" /> {todo.estimatedTime || '—'}</span>
                                    {todo.belongsTo && (
                                      <span className="flex items-center gap-1"><Layers className="h-3 w-3" /> {todo.belongsTo}</span>
                                    )}
                                    {todo.tags && todo.tags.length > 0 && (
                                      <span className="flex items-center gap-1">
                                        {todo.tags.slice(0, 3).map((tag) => (
                                          <Badge key={tag} variant="outline" className="text-[10px] px-1 py-0">{tag}</Badge>
                                        ))}
                                        {todo.tags.length > 3 && (
                                          <span className="text-[10px]">+{todo.tags.length - 3}</span>
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500">暂无待办，添加一些小步骤帮助推进任务</p>
                      )}

                      <div className="mt-2 flex gap-2">
                        <Input
                          placeholder="添加待办..."
                          value={newTodoTitle}
                          onChange={(e) => setNewTodoTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && selectedTask && newTodoTitle.trim()) {
                              addTodo(selectedTask.id, newTodoTitle.trim(), newTodoDueDate || undefined, newTodoEstimatedTime || undefined);
                              setNewTodoTitle('');
                              setNewTodoDueDate('');
                              setNewTodoEstimatedTime('');
                            }
                          }}
                        />
                        <Input
                          type="date"
                          placeholder="截止"
                          value={newTodoDueDate}
                          onChange={(e) => setNewTodoDueDate(e.target.value)}
                          className="w-36"
                        />
                        <Input
                          placeholder="预计耗时"
                          value={newTodoEstimatedTime}
                          onChange={(e) => setNewTodoEstimatedTime(e.target.value)}
                          className="w-28"
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            if (selectedTask && newTodoTitle.trim()) {
                              addTodo(selectedTask.id, newTodoTitle.trim(), newTodoDueDate || undefined, newTodoEstimatedTime || undefined);
                              setNewTodoTitle('');
                              setNewTodoDueDate('');
                              setNewTodoEstimatedTime('');
                            }
                          }}
                        >
                          添加
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">暂无选择</div>
                )}
              </div>
              {selectedTask && (
                <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-3 -mx-3 -mb-3 flex gap-2">
                  <Button className="flex items-center gap-1" size="sm" onClick={openEditTask}>
                    <Edit className="h-4 w-4" />
                    编辑任务
                  </Button>
                  <Button className="flex items-center gap-1" variant="outline" size="sm" onClick={() => handleApprove(selectedTask.id)}>
                    <CheckCircle className="h-4 w-4" />
                    审批通过
                  </Button>
                  <Button className="flex items-center gap-1" variant="outline" size="sm" onClick={() => handleReject(selectedTask.id)}>
                    <XCircle className="h-4 w-4" />
                    审批拒绝
                  </Button>
                  {/** 已移除关闭详情按钮 */}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* 旧的 selectedTask 弹窗详情已移除，改为右侧详情面板展示 */}
      </div>
    </div>
  );
}
