import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit, Trash2, Copy, Download, Upload, Eye, Settings, Save, X, FileText, Users, Clock, Star, StarOff, Search, Filter } from 'lucide-react';
import { ApprovalTemplate, DocumentType, ApprovalNode } from '@/types/approval';

interface ProcessTemplateManagementProps {
  templates: ApprovalTemplate[];
  onTemplatesChange: (templates: ApprovalTemplate[]) => void;
}

interface TemplateFormData {
  name: string;
  description: string;
  documentType: DocumentType;
  category: string;
  isDefault: boolean;
  isActive: boolean;
  nodes: ApprovalNode[];
  formFields: FormField[];
  businessRules: string[];
  tags: string[];
}

interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'file';
  required: boolean;
  options?: string[];
  validation?: string;
  placeholder?: string;
}

const ProcessTemplateManagement: React.FC<ProcessTemplateManagementProps> = ({ templates, onTemplatesChange }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ApprovalTemplate | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'updated' | 'usage'>('updated');

  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    description: '',
    documentType: DocumentType.EXPENSE_REIMBURSEMENT,
    category: '',
    isDefault: false,
    isActive: true,
    nodes: [],
    formFields: [],
    businessRules: [],
    tags: []
  });

  const [fieldFormData, setFieldFormData] = useState({
    name: '',
    label: '',
    type: 'text' as FormField['type'],
    required: false,
    options: '',
    validation: '',
    placeholder: ''
  });

  const [importData, setImportData] = useState('');

  // 模拟模板数据
  const mockTemplates: ApprovalTemplate[] = [
    {
      id: '1',
      name: '费用报销审批模板',
      description: '标准的费用报销审批流程，适用于日常费用报销',
      documentType: DocumentType.EXPENSE_REIMBURSEMENT,
      category: '财务管理',
      isDefault: true,
      isActive: true,
      nodes: [
        {
          id: 'node1',
          name: '部门主管审批',
          description: '部门主管审核费用合理性',
          type: 'single' as any,
          order: 1,
          approvers: [
            { userId: '1', userName: '张主管', userRole: '部门主管', userDepartment: '销售部' }
          ],
          conditions: [
            { type: 'amount' as any, operator: '>', value: '1000', description: '金额大于1000元' }
          ],
          timeLimit: 24,
          isRequired: true
        },
        {
          id: 'node2',
          name: '财务审批',
          description: '财务部门审核费用真实性',
          type: 'single' as any,
          order: 2,
          approvers: [
            { userId: '2', userName: '李财务', userRole: '财务专员', userDepartment: '财务部' }
          ],
          conditions: [],
          timeLimit: 48,
          isRequired: true
        }
      ],
      formFields: [
        { id: 'amount', name: 'amount', label: '报销金额', type: 'number', required: true },
        { id: 'reason', name: 'reason', label: '报销事由', type: 'textarea', required: true },
        { id: 'receipt', name: 'receipt', label: '发票附件', type: 'file', required: true }
      ],
      businessRules: ['金额超过5000元需要总监审批', '跨部门费用需要相关部门确认'],
      tags: ['财务', '报销', '常用'],
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20',
      createdBy: 'admin',
      usageCount: 156
    },
    {
      id: '2',
      name: '营销活动审批模板',
      description: '营销活动策划和预算审批流程',
      documentType: DocumentType.MARKETING_CAMPAIGN,
      category: '营销管理',
      isDefault: false,
      isActive: true,
      nodes: [
        {
          id: 'node1',
          name: '营销经理审批',
          description: '营销经理审核活动方案',
          type: 'single' as any,
          order: 1,
          approvers: [
            { userId: '3', userName: '王经理', userRole: '营销经理', userDepartment: '市场部' }
          ],
          conditions: [],
          timeLimit: 48,
          isRequired: true
        },
        {
          id: 'node2',
          name: '总监审批',
          description: '营销总监最终审批',
          type: 'single' as any,
          order: 2,
          approvers: [
            { userId: '4', userName: '刘总监', userRole: '营销总监', userDepartment: '市场部' }
          ],
          conditions: [
            { type: 'amount' as any, operator: '>', value: '50000', description: '预算超过5万元' }
          ],
          timeLimit: 72,
          isRequired: true
        }
      ],
      formFields: [
        { id: 'campaign_name', name: 'campaign_name', label: '活动名称', type: 'text', required: true },
        { id: 'budget', name: 'budget', label: '预算金额', type: 'number', required: true },
        { id: 'description', name: 'description', label: '活动描述', type: 'textarea', required: true },
        { id: 'target_audience', name: 'target_audience', label: '目标受众', type: 'text', required: true }
      ],
      businessRules: ['预算超过10万需要CEO审批', '涉及品牌形象的活动需要品牌部确认'],
      tags: ['营销', '活动', '预算'],
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18',
      createdBy: 'marketing_admin',
      usageCount: 89
    },
    {
      id: '3',
      name: '采购申请审批模板',
      description: '物资采购申请审批流程',
      documentType: DocumentType.PURCHASE_REQUEST,
      category: '采购管理',
      isDefault: false,
      isActive: false,
      nodes: [
        {
          id: 'node1',
          name: '部门审批',
          description: '部门主管审核采购需求',
          type: 'single' as any,
          order: 1,
          approvers: [
            { userId: '1', userName: '张主管', userRole: '部门主管', userDepartment: '销售部' }
          ],
          conditions: [],
          timeLimit: 24,
          isRequired: true
        }
      ],
      formFields: [
        { id: 'item_name', name: 'item_name', label: '采购物品', type: 'text', required: true },
        { id: 'quantity', name: 'quantity', label: '采购数量', type: 'number', required: true },
        { id: 'estimated_cost', name: 'estimated_cost', label: '预估费用', type: 'number', required: true }
      ],
      businessRules: ['超过1万元需要采购部门审批'],
      tags: ['采购', '物资'],
      createdAt: '2024-01-05',
      updatedAt: '2024-01-05',
      createdBy: 'admin',
      usageCount: 23
    }
  ];

  const categories = ['财务管理', '营销管理', '采购管理', '人事管理', '项目管理'];

  useEffect(() => {
    if (templates.length === 0) {
      onTemplatesChange(mockTemplates);
    }
  }, [templates, onTemplatesChange]);

  const resetFormData = () => {
    setFormData({
      name: '',
      description: '',
      documentType: DocumentType.EXPENSE_REIMBURSEMENT,
      category: '',
      isDefault: false,
      isActive: true,
      nodes: [],
      formFields: [],
      businessRules: [],
      tags: []
    });
  };

  const getDocumentTypeLabel = (type: DocumentType) => {
    const labels = {
      [DocumentType.EXPENSE_REIMBURSEMENT]: '费用报销',
      [DocumentType.LEAVE_REQUEST]: '请假申请',
      [DocumentType.PURCHASE_REQUEST]: '采购申请',
      [DocumentType.MARKETING_CAMPAIGN]: '营销活动',
      [DocumentType.PROJECT_APPROVAL]: '项目审批',
      [DocumentType.CONTRACT_APPROVAL]: '合同审批',
      [DocumentType.BUDGET_APPROVAL]: '预算审批',
      [DocumentType.RECRUITMENT]: '招聘申请'
    };
    return labels[type] || type;
  };

  const filteredAndSortedTemplates = templates
    .filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && template.isActive) ||
                           (filterStatus === 'inactive' && !template.isActive);
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'usage':
          return (b.usageCount || 0) - (a.usageCount || 0);
        default:
          return 0;
      }
    });

  const handleCreateTemplate = () => {
    resetFormData();
    setIsCreateDialogOpen(true);
  };

  const handleEditTemplate = (template: ApprovalTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      documentType: template.documentType,
      category: template.category,
      isDefault: template.isDefault,
      isActive: template.isActive,
      nodes: template.nodes,
      formFields: template.formFields || [],
      businessRules: template.businessRules || [],
      tags: template.tags || []
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveTemplate = () => {
    const templateData: ApprovalTemplate = {
      id: selectedTemplate?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      documentType: formData.documentType,
      category: formData.category,
      isDefault: formData.isDefault,
      isActive: formData.isActive,
      nodes: formData.nodes,
      formFields: formData.formFields,
      businessRules: formData.businessRules,
      tags: formData.tags,
      createdAt: selectedTemplate?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      createdBy: selectedTemplate?.createdBy || 'current_user',
      usageCount: selectedTemplate?.usageCount || 0
    };

    if (selectedTemplate) {
      // 编辑现有模板
      const updatedTemplates = templates.map(template =>
        template.id === selectedTemplate.id ? templateData : template
      );
      onTemplatesChange(updatedTemplates);
      setIsEditDialogOpen(false);
    } else {
      // 创建新模板
      onTemplatesChange([...templates, templateData]);
      setIsCreateDialogOpen(false);
    }
    setSelectedTemplate(null);
  };

  const handleDeleteTemplate = (templateId: string) => {
    const updatedTemplates = templates.filter(template => template.id !== templateId);
    onTemplatesChange(updatedTemplates);
  };

  const handleCloneTemplate = (template: ApprovalTemplate) => {
    const clonedTemplate: ApprovalTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (副本)`,
      isDefault: false,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      usageCount: 0
    };
    onTemplatesChange([...templates, clonedTemplate]);
  };

  const handleToggleDefault = (templateId: string) => {
    const updatedTemplates = templates.map(template => ({
      ...template,
      isDefault: template.id === templateId ? !template.isDefault : (template.isDefault && template.id !== templateId ? false : template.isDefault)
    }));
    onTemplatesChange(updatedTemplates);
  };

  const handleToggleActive = (templateId: string) => {
    const updatedTemplates = templates.map(template =>
      template.id === templateId ? { ...template, isActive: !template.isActive } : template
    );
    onTemplatesChange(updatedTemplates);
  };

  const handlePreviewTemplate = (template: ApprovalTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewDialogOpen(true);
  };

  const handleExportTemplate = (template: ApprovalTemplate) => {
    const exportData = {
      ...template,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name}_template.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportTemplate = () => {
    try {
      const templateData = JSON.parse(importData);
      const importedTemplate: ApprovalTemplate = {
        ...templateData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        usageCount: 0
      };
      onTemplatesChange([...templates, importedTemplate]);
      setImportData('');
      setIsImportDialogOpen(false);
    } catch (error) {
      alert('导入失败：JSON格式错误');
    }
  };

  const handleAddFormField = () => {
    const newField: FormField = {
      id: Date.now().toString(),
      name: fieldFormData.name,
      label: fieldFormData.label,
      type: fieldFormData.type,
      required: fieldFormData.required,
      options: fieldFormData.options ? fieldFormData.options.split(',').map(o => o.trim()) : undefined,
      validation: fieldFormData.validation || undefined,
      placeholder: fieldFormData.placeholder || undefined
    };

    setFormData(prev => ({
      ...prev,
      formFields: [...prev.formFields, newField]
    }));

    setFieldFormData({
      name: '',
      label: '',
      type: 'text',
      required: false,
      options: '',
      validation: '',
      placeholder: ''
    });
  };

  const handleRemoveFormField = (fieldId: string) => {
    setFormData(prev => ({
      ...prev,
      formFields: prev.formFields.filter(field => field.id !== fieldId)
    }));
  };

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">流程模板管理</h2>
          <p className="text-muted-foreground">管理审批流程模板，提高配置效率</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            导入模板
          </Button>
          <Button onClick={handleCreateTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            创建模板
          </Button>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索模板名称、描述或标签..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部分类</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={(value: 'all' | 'active' | 'inactive') => setFilterStatus(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="active">启用</SelectItem>
            <SelectItem value="inactive">禁用</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(value: 'name' | 'created' | 'updated' | 'usage') => setSortBy(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">最近更新</SelectItem>
            <SelectItem value="created">创建时间</SelectItem>
            <SelectItem value="name">名称</SelectItem>
            <SelectItem value="usage">使用次数</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 模板列表 */}
      <div className="grid gap-4">
        {filteredAndSortedTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    {template.isDefault && (
                      <Badge variant="default" className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        默认
                      </Badge>
                    )}
                    <Badge variant={template.isActive ? "default" : "secondary"}>
                      {template.isActive ? "启用" : "禁用"}
                    </Badge>
                    <Badge variant="outline">{getDocumentTypeLabel(template.documentType)}</Badge>
                    <Badge variant="secondary">{template.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {template.nodes.length} 个节点
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {template.formFields?.length || 0} 个字段
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      更新于 {template.updatedAt}
                    </div>
                    <span>使用 {template.usageCount || 0} 次</span>
                  </div>
                  {template.tags && template.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {template.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePreviewTemplate(template)}
                    title="预览模板"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCloneTemplate(template)}
                    title="克隆模板"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExportTemplate(template)}
                    title="导出模板"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleDefault(template.id)}
                    title={template.isDefault ? "取消默认" : "设为默认"}
                  >
                    {template.isDefault ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(template.id)}
                    title={template.isActive ? "禁用模板" : "启用模板"}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditTemplate(template)}
                  >
                    <Edit className="h-4 w-4" />
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
                          确定要删除模板 "{template.name}" 吗？此操作不可撤销。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteTemplate(template.id)}>
                          确认删除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}

        {filteredAndSortedTemplates.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无匹配的模板</p>
              {searchTerm || filterCategory !== 'all' || filterStatus !== 'all' ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCategory('all');
                    setFilterStatus('all');
                  }}
                  className="mt-4"
                >
                  清除筛选
                </Button>
              ) : (
                <Button onClick={handleCreateTemplate} className="mt-4">
                  创建第一个模板
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* 创建模板对话框 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>创建流程模板</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList>
              <TabsTrigger value="basic">基本信息</TabsTrigger>
              <TabsTrigger value="form">表单字段</TabsTrigger>
              <TabsTrigger value="rules">业务规则</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template-name">模板名称</Label>
                  <Input
                    id="template-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="输入模板名称"
                  />
                </div>
                <div>
                  <Label htmlFor="document-type">文档类型</Label>
                  <Select value={formData.documentType} onValueChange={(value: DocumentType) => setFormData(prev => ({ ...prev, documentType: value }))}>
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
                <Label htmlFor="template-description">模板描述</Label>
                <Textarea
                  id="template-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="输入模板描述"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">分类</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tags">标签</Label>
                  <Input
                    id="tags"
                    value={formData.tags.join(', ')}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) }))}
                    placeholder="输入标签，用逗号分隔"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-default"
                    checked={formData.isDefault}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDefault: checked }))}
                  />
                  <Label htmlFor="is-default">设为默认模板</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-active"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="is-active">启用模板</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="form" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">表单字段配置</h3>
              </div>
              
              {/* 添加字段表单 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">添加新字段</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="field-name">字段名称</Label>
                      <Input
                        id="field-name"
                        value={fieldFormData.name}
                        onChange={(e) => setFieldFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="字段名称（英文）"
                      />
                    </div>
                    <div>
                      <Label htmlFor="field-label">字段标签</Label>
                      <Input
                        id="field-label"
                        value={fieldFormData.label}
                        onChange={(e) => setFieldFormData(prev => ({ ...prev, label: e.target.value }))}
                        placeholder="字段标签（中文）"
                      />
                    </div>
                    <div>
                      <Label htmlFor="field-type">字段类型</Label>
                      <Select value={fieldFormData.type} onValueChange={(value: FormField['type']) => setFieldFormData(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">文本</SelectItem>
                          <SelectItem value="number">数字</SelectItem>
                          <SelectItem value="date">日期</SelectItem>
                          <SelectItem value="select">下拉选择</SelectItem>
                          <SelectItem value="textarea">多行文本</SelectItem>
                          <SelectItem value="file">文件上传</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="field-placeholder">占位符</Label>
                      <Input
                        id="field-placeholder"
                        value={fieldFormData.placeholder}
                        onChange={(e) => setFieldFormData(prev => ({ ...prev, placeholder: e.target.value }))}
                        placeholder="输入占位符文本"
                      />
                    </div>
                    <div>
                      <Label htmlFor="field-validation">验证规则</Label>
                      <Input
                        id="field-validation"
                        value={fieldFormData.validation}
                        onChange={(e) => setFieldFormData(prev => ({ ...prev, validation: e.target.value }))}
                        placeholder="正则表达式或验证规则"
                      />
                    </div>
                  </div>

                  {fieldFormData.type === 'select' && (
                    <div>
                      <Label htmlFor="field-options">选项</Label>
                      <Input
                        id="field-options"
                        value={fieldFormData.options}
                        onChange={(e) => setFieldFormData(prev => ({ ...prev, options: e.target.value }))}
                        placeholder="选项值，用逗号分隔"
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="field-required"
                      checked={fieldFormData.required}
                      onCheckedChange={(checked) => setFieldFormData(prev => ({ ...prev, required: checked }))}
                    />
                    <Label htmlFor="field-required">必填字段</Label>
                  </div>

                  <Button onClick={handleAddFormField} disabled={!fieldFormData.name || !fieldFormData.label} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    添加字段
                  </Button>
                </CardContent>
              </Card>

              {/* 已添加的字段列表 */}
              <div className="space-y-2">
                <h4 className="font-medium">已添加的字段：</h4>
                {formData.formFields.map((field) => (
                  <Card key={field.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{field.label}</span>
                            <Badge variant="outline">{field.type}</Badge>
                            {field.required && <Badge variant="destructive" className="text-xs">必填</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">字段名: {field.name}</p>
                          {field.placeholder && (
                            <p className="text-sm text-muted-foreground">占位符: {field.placeholder}</p>
                          )}
                          {field.options && (
                            <p className="text-sm text-muted-foreground">选项: {field.options.join(', ')}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFormField(field.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {formData.formFields.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>暂无表单字段</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="rules" className="space-y-4">
              <div>
                <Label htmlFor="business-rules">业务规则</Label>
                <Textarea
                  id="business-rules"
                  value={formData.businessRules.join('\n')}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessRules: e.target.value.split('\n').filter(rule => rule.trim()) }))}
                  placeholder="每行输入一条业务规则"
                  rows={6}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveTemplate} disabled={!formData.name || !formData.category}>
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑模板对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑流程模板 - {selectedTemplate?.name}</DialogTitle>
          </DialogHeader>
          
          {/* 内容与创建对话框相同，这里省略重复代码 */}
          <div className="text-center py-8 text-muted-foreground">
            <p>编辑表单内容与创建表单相同</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveTemplate} disabled={!formData.name || !formData.category}>
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 预览模板对话框 */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              模板预览 - {selectedTemplate?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-6">
              {/* 基本信息 */}
              <Card>
                <CardHeader>
                  <CardTitle>基本信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium">模板名称：</span>
                      <span className="text-sm">{selectedTemplate.name}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">文档类型：</span>
                      <span className="text-sm">{getDocumentTypeLabel(selectedTemplate.documentType)}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">分类：</span>
                      <span className="text-sm">{selectedTemplate.category}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">使用次数：</span>
                      <span className="text-sm">{selectedTemplate.usageCount || 0}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">描述：</span>
                    <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                  </div>
                  {selectedTemplate.tags && selectedTemplate.tags.length > 0 && (
                    <div>
                      <span className="text-sm font-medium">标签：</span>
                      <div className="flex gap-1 mt-1">
                        {selectedTemplate.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 审批节点 */}
              <Card>
                <CardHeader>
                  <CardTitle>审批节点</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedTemplate.nodes.map((node, index) => (
                      <div key={node.id} className="border rounded p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">节点 {index + 1}</Badge>
                          <span className="font-medium">{node.name}</span>
                        </div>
                        {node.description && (
                          <p className="text-sm text-muted-foreground mb-2">{node.description}</p>
                        )}
                        <div className="text-sm">
                          <span className="font-medium">审批人：</span>
                          {node.approvers.map(approver => approver.userName).join(', ')}
                        </div>
                        {node.timeLimit && (
                          <div className="text-sm">
                            <span className="font-medium">时限：</span>
                            {node.timeLimit >= 24 ? `${node.timeLimit / 24}天` : `${node.timeLimit}小时`}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 表单字段 */}
              {selectedTemplate.formFields && selectedTemplate.formFields.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>表单字段</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {selectedTemplate.formFields.map((field) => (
                        <div key={field.id} className="border rounded p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{field.label}</span>
                            <Badge variant="outline" className="text-xs">{field.type}</Badge>
                            {field.required && <Badge variant="destructive" className="text-xs">必填</Badge>}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            字段名: {field.name}
                          </div>
                          {field.placeholder && (
                            <div className="text-sm text-muted-foreground">
                              占位符: {field.placeholder}
                            </div>
                          )}
                          {field.options && (
                            <div className="text-sm text-muted-foreground">
                              选项: {field.options.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 业务规则 */}
              {selectedTemplate.businessRules && selectedTemplate.businessRules.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>业务规则</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {selectedTemplate.businessRules.map((rule, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-muted-foreground">•</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 导入模板对话框 */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              导入模板
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="import-data">模板数据（JSON格式）</Label>
              <Textarea
                id="import-data"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="粘贴模板的JSON数据..."
                rows={12}
                className="font-mono text-sm"
              />
            </div>
            
            <div className="bg-muted p-4 rounded">
              <h4 className="font-medium mb-2">导入说明</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• 请确保JSON格式正确</li>
                <li>• 导入的模板将自动分配新的ID</li>
                <li>• 使用次数将重置为0</li>
                <li>• 创建时间将更新为当前时间</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleImportTemplate} disabled={!importData.trim()}>
              导入
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProcessTemplateManagement;