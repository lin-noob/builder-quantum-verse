import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Search, Settings, Users, Clock, ArrowRight, CheckCircle, Copy, MoveUp, MoveDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ApprovalProcess {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: ApprovalStep[];
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  avgProcessTime: string;
  createdBy: string;
}

interface ApprovalStep {
  id: string;
  name: string;
  description: string;
  approvers: string[];
  approverType: 'specific' | 'role' | 'department';
  timeLimit: number;
  isRequired: boolean;
  isParallel: boolean;
  order: number;
  conditions?: string[];
}

const ApprovalConfig: React.FC = () => {
  const [processes, setProcesses] = useState<ApprovalProcess[]>([
    {
      id: '1',
      name: '采购申请审批流程',
      description: '物资采购申请的标准审批流程',
      category: '采购管理',
      steps: [
        {
          id: '1-1',
          name: '部门经理审批',
          description: '部门经理对采购申请进行初审',
          approvers: ['张经理', '李经理'],
          approverType: 'role',
          timeLimit: 24,
          isRequired: true,
          isParallel: false,
          order: 1,
          conditions: ['金额 < 10000'],
        },
        {
          id: '1-2',
          name: '财务审批',
          description: '财务部门对预算和资金进行审核',
          approvers: ['财务部'],
          approverType: 'department',
          timeLimit: 48,
          isRequired: true,
          isParallel: false,
          order: 2,
          conditions: ['金额 >= 5000'],
        },
        {
          id: '1-3',
          name: '总经理审批',
          description: '总经理最终审批',
          approvers: ['总经理'],
          approverType: 'specific',
          timeLimit: 72,
          isRequired: true,
          isParallel: false,
          order: 3,
          conditions: ['金额 >= 50000'],
        },
      ],
      isActive: true,
      isDefault: true,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20',
      usageCount: 45,
      avgProcessTime: '2.5天',
      createdBy: '张三',
    },
    {
      id: '2',
      name: '请假申请审批流程',
      description: '员工请假申请的审批流程',
      category: '人事管理',
      steps: [
        {
          id: '2-1',
          name: '直属主管审批',
          description: '直属主管审批请假申请',
          approvers: ['直属主管'],
          approverType: 'role',
          timeLimit: 24,
          isRequired: true,
          isParallel: false,
          order: 1,
        },
        {
          id: '2-2',
          name: 'HR审批',
          description: 'HR部门审批（超过3天需要）',
          approvers: ['HR部门'],
          approverType: 'department',
          timeLimit: 48,
          isRequired: false,
          isParallel: false,
          order: 2,
          conditions: ['请假天数 > 3'],
        },
      ],
      isActive: true,
      isDefault: false,
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18',
      usageCount: 32,
      avgProcessTime: '1.2天',
      createdBy: '李四',
    },
    {
      id: '3',
      name: '报销申请审批流程',
      description: '费用报销申请的审批流程',
      category: '财务管理',
      steps: [
        {
          id: '3-1',
          name: '部门审批',
          description: '部门经理审批报销申请',
          approvers: ['部门经理'],
          approverType: 'role',
          timeLimit: 24,
          isRequired: true,
          isParallel: false,
          order: 1,
        },
        {
          id: '3-2',
          name: '财务审批',
          description: '财务部门最终审批',
          approvers: ['财务经理'],
          approverType: 'specific',
          timeLimit: 72,
          isRequired: true,
          isParallel: false,
          order: 2,
        },
      ],
      isActive: false,
      isDefault: false,
      createdAt: '2024-01-08',
      updatedAt: '2024-01-15',
      usageCount: 28,
      avgProcessTime: '1.8天',
      createdBy: '王五',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<ApprovalProcess | null>(null);
  const [newProcess, setNewProcess] = useState<Partial<ApprovalProcess>>({
    name: '',
    description: '',
    category: '',
    steps: [],
    isActive: true,
    isDefault: false,
  });

  const categories = ['采购管理', '人事管理', '财务管理', '项目管理', '合同管理'];
  const approverTypes = [
    { value: 'specific', label: '指定人员' },
    { value: 'role', label: '角色' },
    { value: 'department', label: '部门' },
  ];

  const filteredProcesses = processes.filter(process => {
    const matchesSearch = process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         process.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || process.category === selectedCategory;
    const matchesStatus = !selectedStatus || 
                         (selectedStatus === 'active' && process.isActive) ||
                         (selectedStatus === 'inactive' && !process.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateProcess = () => {
    if (!newProcess.name || !newProcess.category) {
      toast({
        title: "错误",
        description: "请填写流程名称和分类",
        variant: "destructive",
      });
      return;
    }

    const process: ApprovalProcess = {
      id: Date.now().toString(),
      name: newProcess.name!,
      description: newProcess.description || '',
      category: newProcess.category!,
      steps: newProcess.steps || [],
      isActive: newProcess.isActive || true,
      isDefault: newProcess.isDefault || false,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      usageCount: 0,
      avgProcessTime: '0天',
      createdBy: '当前用户',
    };

    setProcesses([...processes, process]);
    setNewProcess({
      name: '',
      description: '',
      category: '',
      steps: [],
      isActive: true,
      isDefault: false,
    });
    setIsDialogOpen(false);
    
    toast({
      title: "成功",
      description: "审批流程创建成功",
    });
  };

  const handleUpdateProcess = () => {
    if (!editingProcess) return;

    setProcesses(processes.map(process => 
      process.id === editingProcess.id ? {
        ...editingProcess,
        updatedAt: new Date().toISOString().split('T')[0]
      } : process
    ));
    setEditingProcess(null);
    setIsDialogOpen(false);
    
    toast({
      title: "成功",
      description: "审批流程更新成功",
    });
  };

  const handleDeleteProcess = (id: string) => {
    setProcesses(processes.filter(process => process.id !== id));
    toast({
      title: "成功",
      description: "审批流程删除成功",
    });
  };

  const handleToggleStatus = (id: string) => {
    setProcesses(processes.map(process => 
      process.id === id ? { 
        ...process, 
        isActive: !process.isActive,
        updatedAt: new Date().toISOString().split('T')[0]
      } : process
    ));
  };

  const handleCopyProcess = (process: ApprovalProcess) => {
    const copiedProcess: ApprovalProcess = {
      ...process,
      id: Date.now().toString(),
      name: `${process.name} (副本)`,
      isDefault: false,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      usageCount: 0,
      createdBy: '当前用户',
    };

    setProcesses([...processes, copiedProcess]);
    toast({
      title: "成功",
      description: "审批流程复制成功",
    });
  };

  const handleSetDefault = (id: string) => {
    setProcesses(processes.map(process => ({
      ...process,
      isDefault: process.id === id,
    })));
    toast({
      title: "成功",
      description: "默认流程设置成功",
    });
  };

  const addStep = () => {
    const currentSteps = editingProcess?.steps || newProcess.steps || [];
    const newStep: ApprovalStep = {
      id: Date.now().toString(),
      name: '新步骤',
      description: '',
      approvers: [],
      approverType: 'specific',
      timeLimit: 24,
      isRequired: true,
      isParallel: false,
      order: currentSteps.length + 1,
    };

    if (editingProcess) {
      setEditingProcess({
        ...editingProcess,
        steps: [...currentSteps, newStep]
      });
    } else {
      setNewProcess({
        ...newProcess,
        steps: [...currentSteps, newStep]
      });
    }
  };

  const removeStep = (stepId: string) => {
    if (editingProcess) {
      setEditingProcess({
        ...editingProcess,
        steps: editingProcess.steps.filter(step => step.id !== stepId)
      });
    } else {
      setNewProcess({
        ...newProcess,
        steps: (newProcess.steps || []).filter(step => step.id !== stepId)
      });
    }
  };

  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    const currentSteps = editingProcess?.steps || newProcess.steps || [];
    const stepIndex = currentSteps.findIndex(step => step.id === stepId);
    
    if (
      (direction === 'up' && stepIndex === 0) ||
      (direction === 'down' && stepIndex === currentSteps.length - 1)
    ) {
      return;
    }

    const newSteps = [...currentSteps];
    const targetIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1;
    
    [newSteps[stepIndex], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[stepIndex]];
    
    // 更新order
    newSteps.forEach((step, index) => {
      step.order = index + 1;
    });

    if (editingProcess) {
      setEditingProcess({
        ...editingProcess,
        steps: newSteps
      });
    } else {
      setNewProcess({
        ...newProcess,
        steps: newSteps
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">审批配置</h1>
          <p className="text-muted-foreground">配置和管理审批流程</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Copy className="h-4 w-4 mr-2" />
            导入流程
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingProcess(null);
                setNewProcess({
                  name: '',
                  description: '',
                  category: '',
                  steps: [],
                  isActive: true,
                  isDefault: false,
                });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                新建流程
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProcess ? '编辑流程' : '新建流程'}
                </DialogTitle>
                <DialogDescription>
                  配置审批流程的基本信息和步骤
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">基本信息</TabsTrigger>
                  <TabsTrigger value="steps">流程步骤</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="process-name">流程名称</Label>
                        <Input
                          id="process-name"
                          value={editingProcess?.name || newProcess.name}
                          onChange={(e) => {
                            if (editingProcess) {
                              setEditingProcess({ ...editingProcess, name: e.target.value });
                            } else {
                              setNewProcess({ ...newProcess, name: e.target.value });
                            }
                          }}
                          placeholder="输入流程名称"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="process-category">分类</Label>
                        <Select
                          value={editingProcess?.category || newProcess.category}
                          onValueChange={(value) => {
                            if (editingProcess) {
                              setEditingProcess({ ...editingProcess, category: value });
                            } else {
                              setNewProcess({ ...newProcess, category: value });
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择分类" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="process-description">流程描述</Label>
                      <Textarea
                        id="process-description"
                        value={editingProcess?.description || newProcess.description}
                        onChange={(e) => {
                          if (editingProcess) {
                            setEditingProcess({ ...editingProcess, description: e.target.value });
                          } else {
                            setNewProcess({ ...newProcess, description: e.target.value });
                          }
                        }}
                        placeholder="输入流程描述"
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="process-active"
                          checked={editingProcess?.isActive || newProcess.isActive}
                          onCheckedChange={(checked) => {
                            if (editingProcess) {
                              setEditingProcess({ ...editingProcess, isActive: checked });
                            } else {
                              setNewProcess({ ...newProcess, isActive: checked });
                            }
                          }}
                        />
                        <Label htmlFor="process-active">启用流程</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="process-default"
                          checked={editingProcess?.isDefault || newProcess.isDefault}
                          onCheckedChange={(checked) => {
                            if (editingProcess) {
                              setEditingProcess({ ...editingProcess, isDefault: checked });
                            } else {
                              setNewProcess({ ...newProcess, isDefault: checked });
                            }
                          }}
                        />
                        <Label htmlFor="process-default">设为默认</Label>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="steps" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">流程步骤</h3>
                    <Button size="sm" onClick={addStep}>
                      <Plus className="h-4 w-4 mr-2" />
                      添加步骤
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(editingProcess?.steps || newProcess.steps || []).map((step, index) => (
                      <div key={step.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{step.order}</Badge>
                            <h4 className="font-medium">{step.name}</h4>
                            {step.isRequired && (
                              <Badge variant="destructive" className="text-xs">必需</Badge>
                            )}
                            {step.isParallel && (
                              <Badge variant="secondary" className="text-xs">并行</Badge>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => moveStep(step.id, 'up')}
                              disabled={index === 0}
                            >
                              <MoveUp className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => moveStep(step.id, 'down')}
                              disabled={index === (editingProcess?.steps || newProcess.steps || []).length - 1}
                            >
                              <MoveDown className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => removeStep(step.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div>审批人: {step.approvers.join(', ') || '未设置'}</div>
                          <div>时限: {step.timeLimit}小时</div>
                          <div>类型: {approverTypes.find(t => t.value === step.approverType)?.label}</div>
                          <div>条件: {step.conditions?.join(', ') || '无'}</div>
                        </div>
                      </div>
                    ))}
                    {(editingProcess?.steps || newProcess.steps || []).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        暂无步骤，点击"添加步骤"开始配置
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={editingProcess ? handleUpdateProcess : handleCreateProcess}>
                  {editingProcess ? '更新' : '创建'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">总流程数</p>
                <p className="text-2xl font-bold">{processes.length}</p>
              </div>
              <Settings className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">启用流程</p>
                <p className="text-2xl font-bold text-green-600">
                  {processes.filter(p => p.isActive).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">总使用次数</p>
                <p className="text-2xl font-bold text-purple-600">
                  {processes.reduce((sum, p) => sum + p.usageCount, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">平均处理时间</p>
                <p className="text-2xl font-bold text-orange-600">1.8天</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            搜索和筛选
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="搜索流程名称或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部分类</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部状态</SelectItem>
                <SelectItem value="active">启用</SelectItem>
                <SelectItem value="inactive">禁用</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 流程列表 */}
      <Card>
        <CardHeader>
          <CardTitle>流程列表</CardTitle>
          <CardDescription>
            共找到 {filteredProcesses.length} 个流程
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>流程名称</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>步骤数</TableHead>
                <TableHead>使用次数</TableHead>
                <TableHead>平均时长</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建者</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProcesses.map((process) => (
                <TableRow key={process.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {process.name}
                          {process.isDefault && (
                            <Badge variant="default" className="text-xs">默认</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {process.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{process.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <ArrowRight className="h-4 w-4" />
                      {process.steps.length} 步
                    </div>
                  </TableCell>
                  <TableCell>{process.usageCount}</TableCell>
                  <TableCell>{process.avgProcessTime}</TableCell>
                  <TableCell>
                    <Badge variant={process.isActive ? "default" : "secondary"}>
                      {process.isActive ? '启用' : '禁用'}
                    </Badge>
                  </TableCell>
                  <TableCell>{process.createdBy}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {process.updatedAt}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingProcess(process);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyProcess(process)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(process.id)}
                      >
                        {process.isActive ? '禁用' : '启用'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProcess(process.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApprovalConfig;