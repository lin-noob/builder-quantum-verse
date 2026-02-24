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
import { Plus, Edit, Trash2, Search, FileText, Clock, Users, Copy, Download, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ApprovalTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: TemplateField[];
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  createdBy: string;
}

interface TemplateField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'file';
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: string;
  order: number;
}

const TemplateManagement: React.FC = () => {
  const [templates, setTemplates] = useState<ApprovalTemplate[]>([
    {
      id: '1',
      name: '采购申请表模板',
      description: '标准采购申请表单模板，包含物品信息、预算、供应商等字段',
      category: '采购管理',
      fields: [
        {
          id: '1-1',
          name: 'itemName',
          label: '采购物品名称',
          type: 'text',
          required: true,
          placeholder: '请输入采购物品名称',
          order: 1,
        },
        {
          id: '1-2',
          name: 'quantity',
          label: '采购数量',
          type: 'number',
          required: true,
          placeholder: '请输入采购数量',
          order: 2,
        },
        {
          id: '1-3',
          name: 'budget',
          label: '预算金额',
          type: 'number',
          required: true,
          placeholder: '请输入预算金额',
          order: 3,
        },
        {
          id: '1-4',
          name: 'supplier',
          label: '供应商',
          type: 'select',
          required: true,
          options: ['供应商A', '供应商B', '供应商C'],
          order: 4,
        },
        {
          id: '1-5',
          name: 'reason',
          label: '采购理由',
          type: 'textarea',
          required: true,
          placeholder: '请详细说明采购理由',
          order: 5,
        },
      ],
      isActive: true,
      isDefault: true,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20',
      usageCount: 45,
      createdBy: '张三',
    },
    {
      id: '2',
      name: '请假申请表模板',
      description: '员工请假申请表单模板，包含请假类型、时间、原因等字段',
      category: '人事管理',
      fields: [
        {
          id: '2-1',
          name: 'leaveType',
          label: '请假类型',
          type: 'select',
          required: true,
          options: ['年假', '病假', '事假', '婚假', '产假'],
          order: 1,
        },
        {
          id: '2-2',
          name: 'startDate',
          label: '开始日期',
          type: 'date',
          required: true,
          order: 2,
        },
        {
          id: '2-3',
          name: 'endDate',
          label: '结束日期',
          type: 'date',
          required: true,
          order: 3,
        },
        {
          id: '2-4',
          name: 'reason',
          label: '请假原因',
          type: 'textarea',
          required: true,
          placeholder: '请详细说明请假原因',
          order: 4,
        },
        {
          id: '2-5',
          name: 'attachment',
          label: '相关证明',
          type: 'file',
          required: false,
          order: 5,
        },
      ],
      isActive: true,
      isDefault: false,
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18',
      usageCount: 32,
      createdBy: '李四',
    },
    {
      id: '3',
      name: '报销申请表模板',
      description: '费用报销申请表单模板，包含费用类型、金额、发票等字段',
      category: '财务管理',
      fields: [
        {
          id: '3-1',
          name: 'expenseType',
          label: '费用类型',
          type: 'select',
          required: true,
          options: ['差旅费', '办公用品', '培训费', '招待费', '其他'],
          order: 1,
        },
        {
          id: '3-2',
          name: 'amount',
          label: '报销金额',
          type: 'number',
          required: true,
          placeholder: '请输入报销金额',
          order: 2,
        },
        {
          id: '3-3',
          name: 'description',
          label: '费用说明',
          type: 'textarea',
          required: true,
          placeholder: '请详细说明费用用途',
          order: 3,
        },
        {
          id: '3-4',
          name: 'invoice',
          label: '发票附件',
          type: 'file',
          required: true,
          order: 4,
        },
      ],
      isActive: false,
      isDefault: false,
      createdAt: '2024-01-08',
      updatedAt: '2024-01-15',
      usageCount: 28,
      createdBy: '王五',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ApprovalTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<ApprovalTemplate>>({
    name: '',
    description: '',
    category: '',
    fields: [],
    isActive: true,
    isDefault: false,
  });

  const categories = ['采购管理', '人事管理', '财务管理', '项目管理', '合同管理'];
  const fieldTypes = [
    { value: 'text', label: '单行文本' },
    { value: 'textarea', label: '多行文本' },
    { value: 'number', label: '数字' },
    { value: 'date', label: '日期' },
    { value: 'select', label: '下拉选择' },
    { value: 'file', label: '文件上传' },
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' ||
      (selectedStatus === 'active' && template.isActive) ||
      (selectedStatus === 'inactive' && !template.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.category) {
      toast({
        title: "错误",
        description: "请填写模板名称和分类",
        variant: "destructive",
      });
      return;
    }

    const template: ApprovalTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name!,
      description: newTemplate.description || '',
      category: newTemplate.category!,
      fields: newTemplate.fields || [],
      isActive: newTemplate.isActive || true,
      isDefault: newTemplate.isDefault || false,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      usageCount: 0,
      createdBy: '当前用户',
    };

    setTemplates([...templates, template]);
    setNewTemplate({
      name: '',
      description: '',
      category: '',
      fields: [],
      isActive: true,
      isDefault: false,
    });
    setIsDialogOpen(false);
    
    toast({
      title: "成功",
      description: "模板创建成功",
    });
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplate) return;

    setTemplates(templates.map(template => 
      template.id === editingTemplate.id ? {
        ...editingTemplate,
        updatedAt: new Date().toISOString().split('T')[0]
      } : template
    ));
    setEditingTemplate(null);
    setIsDialogOpen(false);
    
    toast({
      title: "成功",
      description: "模板更新成功",
    });
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(template => template.id !== id));
    toast({
      title: "成功",
      description: "模板删除成功",
    });
  };

  const handleToggleStatus = (id: string) => {
    setTemplates(templates.map(template => 
      template.id === id ? { 
        ...template, 
        isActive: !template.isActive,
        updatedAt: new Date().toISOString().split('T')[0]
      } : template
    ));
  };

  const handleCopyTemplate = (template: ApprovalTemplate) => {
    const copiedTemplate: ApprovalTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (副本)`,
      isDefault: false,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      usageCount: 0,
      createdBy: '当前用户',
    };

    setTemplates([...templates, copiedTemplate]);
    toast({
      title: "成功",
      description: "模板复制成功",
    });
  };

  const handleSetDefault = (id: string) => {
    setTemplates(templates.map(template => ({
      ...template,
      isDefault: template.id === id,
    })));
    toast({
      title: "成功",
      description: "默认模板设置成功",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">模板管理</h1>
          <p className="text-muted-foreground">管理审批表单模板和字段配置</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            导入模板
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingTemplate(null);
                setNewTemplate({
                  name: '',
                  description: '',
                  category: '',
                  fields: [],
                  isActive: true,
                  isDefault: false,
                });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                新建模板
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? '编辑模板' : '新建模板'}
                </DialogTitle>
                <DialogDescription>
                  配置审批表单模板的基本信息和字段
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">基本信息</TabsTrigger>
                  <TabsTrigger value="fields">字段配置</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="template-name">模板名称</Label>
                        <Input
                          id="template-name"
                          value={editingTemplate?.name || newTemplate.name}
                          onChange={(e) => {
                            if (editingTemplate) {
                              setEditingTemplate({ ...editingTemplate, name: e.target.value });
                            } else {
                              setNewTemplate({ ...newTemplate, name: e.target.value });
                            }
                          }}
                          placeholder="输入模板名称"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="template-category">分类</Label>
                        <Select
                          value={editingTemplate?.category || newTemplate.category}
                          onValueChange={(value) => {
                            if (editingTemplate) {
                              setEditingTemplate({ ...editingTemplate, category: value });
                            } else {
                              setNewTemplate({ ...newTemplate, category: value });
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
                      <Label htmlFor="template-description">模板描述</Label>
                      <Textarea
                        id="template-description"
                        value={editingTemplate?.description || newTemplate.description}
                        onChange={(e) => {
                          if (editingTemplate) {
                            setEditingTemplate({ ...editingTemplate, description: e.target.value });
                          } else {
                            setNewTemplate({ ...newTemplate, description: e.target.value });
                          }
                        }}
                        placeholder="输入模板描述"
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="template-active"
                          checked={editingTemplate?.isActive || newTemplate.isActive}
                          onCheckedChange={(checked) => {
                            if (editingTemplate) {
                              setEditingTemplate({ ...editingTemplate, isActive: checked });
                            } else {
                              setNewTemplate({ ...newTemplate, isActive: checked });
                            }
                          }}
                        />
                        <Label htmlFor="template-active">启用模板</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="template-default"
                          checked={editingTemplate?.isDefault || newTemplate.isDefault}
                          onCheckedChange={(checked) => {
                            if (editingTemplate) {
                              setEditingTemplate({ ...editingTemplate, isDefault: checked });
                            } else {
                              setNewTemplate({ ...newTemplate, isDefault: checked });
                            }
                          }}
                        />
                        <Label htmlFor="template-default">设为默认</Label>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="fields" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">字段配置</h3>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      添加字段
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(editingTemplate?.fields || newTemplate.fields || []).map((field, index) => (
                      <div key={field.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">{field.label}</h4>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <div>类型: {fieldTypes.find(t => t.value === field.type)?.label}</div>
                          <div>必填: {field.required ? '是' : '否'}</div>
                          <div>排序: {field.order}</div>
                        </div>
                      </div>
                    ))}
                    {(editingTemplate?.fields || newTemplate.fields || []).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        暂无字段，点击"添加字段"开始配置
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}>
                  {editingTemplate ? '更新' : '创建'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
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
                placeholder="搜索模板名称或描述..."
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
                <SelectItem value="all">全部分类</SelectItem>
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
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">启用</SelectItem>
                <SelectItem value="inactive">禁用</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 模板列表 */}
      <Card>
        <CardHeader>
          <CardTitle>模板列表</CardTitle>
          <CardDescription>
            共找到 {filteredTemplates.length} 个模板
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>模板名称</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>字段数</TableHead>
                <TableHead>使用次数</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建者</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {template.name}
                          {template.isDefault && (
                            <Badge variant="default" className="text-xs">默认</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {template.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{template.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {template.fields.length} 个
                    </div>
                  </TableCell>
                  <TableCell>{template.usageCount}</TableCell>
                  <TableCell>
                    <Badge variant={template.isActive ? "default" : "secondary"}>
                      {template.isActive ? '启用' : '禁用'}
                    </Badge>
                  </TableCell>
                  <TableCell>{template.createdBy}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {template.updatedAt}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingTemplate(template);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyTemplate(template)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(template.id)}
                      >
                        {template.isActive ? '禁用' : '启用'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
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

export default TemplateManagement;