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
import { Plus, Edit, Trash2, FileText, Settings, Save, X, DragHandleDots2Icon } from 'lucide-react';
import { DocumentType } from '@/types/approval';

interface DocumentTypeConfig {
  id: string;
  type: DocumentType;
  name: string;
  description: string;
  isActive: boolean;
  formFields: FormField[];
  businessRules: BusinessRule[];
  createdAt: Date;
  updatedAt: Date;
}

interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'file' | 'checkbox';
  isRequired: boolean;
  isVisible: boolean;
  order: number;
  options?: string[]; // for select type
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

interface BusinessRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  action: string;
  isActive: boolean;
}

interface DocumentTypeManagementProps {}

const DocumentTypeManagement: React.FC<DocumentTypeManagementProps> = () => {
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeConfig[]>([]);
  const [selectedType, setSelectedType] = useState<DocumentTypeConfig | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 表单状态
  const [formData, setFormData] = useState({
    type: '' as DocumentType,
    name: '',
    description: '',
    isActive: true
  });

  const [fieldFormData, setFieldFormData] = useState({
    name: '',
    label: '',
    type: 'text' as FormField['type'],
    isRequired: false,
    isVisible: true,
    options: [] as string[]
  });

  // 模拟数据
  useEffect(() => {
    const mockDocumentTypes: DocumentTypeConfig[] = [
      {
        id: '1',
        type: DocumentType.EXPENSE_REIMBURSEMENT,
        name: '费用报销',
        description: '员工日常费用报销申请',
        isActive: true,
        formFields: [
          {
            id: 'field1',
            name: 'amount',
            label: '报销金额',
            type: 'number',
            isRequired: true,
            isVisible: true,
            order: 1,
            validation: { min: 0, max: 50000, message: '金额必须在0-50000之间' }
          },
          {
            id: 'field2',
            name: 'category',
            label: '费用类别',
            type: 'select',
            isRequired: true,
            isVisible: true,
            order: 2,
            options: ['交通费', '餐费', '住宿费', '办公用品', '其他']
          },
          {
            id: 'field3',
            name: 'description',
            label: '费用说明',
            type: 'textarea',
            isRequired: true,
            isVisible: true,
            order: 3
          },
          {
            id: 'field4',
            name: 'receipt',
            label: '发票附件',
            type: 'file',
            isRequired: true,
            isVisible: true,
            order: 4
          }
        ],
        businessRules: [
          {
            id: 'rule1',
            name: '大额费用规则',
            description: '超过5000元的费用需要额外审批',
            condition: 'amount > 5000',
            action: 'require_additional_approval',
            isActive: true
          }
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        type: DocumentType.MARKETING_CAMPAIGN,
        name: '营销活动',
        description: '营销活动策划和执行申请',
        isActive: true,
        formFields: [
          {
            id: 'field1',
            name: 'campaignName',
            label: '活动名称',
            type: 'text',
            isRequired: true,
            isVisible: true,
            order: 1
          },
          {
            id: 'field2',
            name: 'budget',
            label: '预算金额',
            type: 'number',
            isRequired: true,
            isVisible: true,
            order: 2,
            validation: { min: 0, message: '预算金额不能为负数' }
          },
          {
            id: 'field3',
            name: 'startDate',
            label: '开始日期',
            type: 'date',
            isRequired: true,
            isVisible: true,
            order: 3
          },
          {
            id: 'field4',
            name: 'endDate',
            label: '结束日期',
            type: 'date',
            isRequired: true,
            isVisible: true,
            order: 4
          }
        ],
        businessRules: [],
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-20')
      }
    ];

    setDocumentTypes(mockDocumentTypes);
  }, []);

  const filteredDocumentTypes = documentTypes.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const getFieldTypeLabel = (type: FormField['type']) => {
    const labels = {
      text: '文本',
      number: '数字',
      date: '日期',
      select: '下拉选择',
      textarea: '多行文本',
      file: '文件上传',
      checkbox: '复选框'
    };
    return labels[type] || type;
  };

  const handleCreateDocumentType = () => {
    setFormData({
      type: '' as DocumentType,
      name: '',
      description: '',
      isActive: true
    });
    setIsCreateDialogOpen(true);
  };

  const handleEditDocumentType = (docType: DocumentTypeConfig) => {
    setSelectedType(docType);
    setFormData({
      type: docType.type,
      name: docType.name,
      description: docType.description,
      isActive: docType.isActive
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveDocumentType = () => {
    if (selectedType) {
      // 编辑现有类型
      setDocumentTypes(prev => prev.map(type =>
        type.id === selectedType.id
          ? { ...type, ...formData, updatedAt: new Date() }
          : type
      ));
      setIsEditDialogOpen(false);
    } else {
      // 创建新类型
      const newType: DocumentTypeConfig = {
        id: Date.now().toString(),
        ...formData,
        formFields: [],
        businessRules: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setDocumentTypes(prev => [...prev, newType]);
      setIsCreateDialogOpen(false);
    }
    setSelectedType(null);
  };

  const handleDeleteDocumentType = (typeId: string) => {
    setDocumentTypes(prev => prev.filter(type => type.id !== typeId));
  };

  const handleAddField = () => {
    setEditingField(null);
    setFieldFormData({
      name: '',
      label: '',
      type: 'text',
      isRequired: false,
      isVisible: true,
      options: []
    });
    setIsFieldDialogOpen(true);
  };

  const handleEditField = (field: FormField) => {
    setEditingField(field);
    setFieldFormData({
      name: field.name,
      label: field.label,
      type: field.type,
      isRequired: field.isRequired,
      isVisible: field.isVisible,
      options: field.options || []
    });
    setIsFieldDialogOpen(true);
  };

  const handleSaveField = () => {
    if (!selectedType) return;

    const newField: FormField = {
      id: editingField?.id || Date.now().toString(),
      ...fieldFormData,
      order: editingField?.order || selectedType.formFields.length + 1
    };

    setDocumentTypes(prev => prev.map(type =>
      type.id === selectedType.id
        ? {
            ...type,
            formFields: editingField
              ? type.formFields.map(f => f.id === editingField.id ? newField : f)
              : [...type.formFields, newField],
            updatedAt: new Date()
          }
        : type
    ));

    setSelectedType(prev => prev ? {
      ...prev,
      formFields: editingField
        ? prev.formFields.map(f => f.id === editingField.id ? newField : f)
        : [...prev.formFields, newField]
    } : null);

    setIsFieldDialogOpen(false);
  };

  const handleDeleteField = (fieldId: string) => {
    if (!selectedType) return;

    setDocumentTypes(prev => prev.map(type =>
      type.id === selectedType.id
        ? {
            ...type,
            formFields: type.formFields.filter(f => f.id !== fieldId),
            updatedAt: new Date()
          }
        : type
    ));

    setSelectedType(prev => prev ? {
      ...prev,
      formFields: prev.formFields.filter(f => f.id !== fieldId)
    } : null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">单据类型管理</h1>
          <p className="text-muted-foreground mt-1">配置不同类型单据的表单字段和业务规则</p>
        </div>
        <Button onClick={handleCreateDocumentType} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          新建单据类型
        </Button>
      </div>

      {/* 搜索 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">搜索单据类型</Label>
              <Input
                id="search"
                placeholder="输入单据类型名称或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 单据类型列表 */}
      <div className="grid gap-4">
        {filteredDocumentTypes.map((docType) => (
          <Card key={docType.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{docType.name}</CardTitle>
                    <Badge variant={docType.isActive ? "default" : "secondary"}>
                      {docType.isActive ? '启用' : '禁用'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{docType.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {getDocumentTypeLabel(docType.type)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Settings className="h-4 w-4" />
                      {docType.formFields.length} 个字段
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditDocumentType(docType)}
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
                          确定要删除单据类型 "{docType.name}" 吗？此操作不可撤销。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteDocumentType(docType.id)}>
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
                <div className="text-sm font-medium">表单字段：</div>
                <div className="flex gap-2 flex-wrap">
                  {docType.formFields.map((field) => (
                    <Badge key={field.id} variant="outline" className="flex items-center gap-1">
                      <span>{field.label}</span>
                      <span className="text-xs">({getFieldTypeLabel(field.type)})</span>
                      {field.isRequired && <span className="text-red-500">*</span>}
                    </Badge>
                  ))}
                  {docType.formFields.length === 0 && (
                    <span className="text-sm text-muted-foreground">暂无字段配置</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocumentTypes.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>暂无符合条件的单据类型</p>
            <Button onClick={handleCreateDocumentType} className="mt-4">
              创建第一个单据类型
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 创建单据类型对话框 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>创建单据类型</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="type">单据类型</Label>
              <Select value={formData.type} onValueChange={(value: DocumentType) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="选择单据类型" />
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
            <div>
              <Label htmlFor="name">名称</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="输入单据类型名称"
              />
            </div>
            <div>
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="输入单据类型描述"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">启用</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveDocumentType} disabled={!formData.type || !formData.name}>
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑单据类型对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑单据类型 - {selectedType?.name}</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList>
              <TabsTrigger value="basic">基本信息</TabsTrigger>
              <TabsTrigger value="fields">表单字段</TabsTrigger>
              <TabsTrigger value="rules">业务规则</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div>
                <Label htmlFor="edit-name">名称</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">描述</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="edit-isActive">启用</Label>
              </div>
            </TabsContent>

            <TabsContent value="fields" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">表单字段配置</h3>
                <Button onClick={handleAddField} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  添加字段
                </Button>
              </div>
              
              <div className="space-y-2">
                {selectedType?.formFields.map((field) => (
                  <Card key={field.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{field.label}</span>
                            <Badge variant="outline">{getFieldTypeLabel(field.type)}</Badge>
                            {field.isRequired && <Badge variant="destructive" className="text-xs">必填</Badge>}
                            {!field.isVisible && <Badge variant="secondary" className="text-xs">隐藏</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">字段名: {field.name}</p>
                          {field.options && field.options.length > 0 && (
                            <p className="text-sm text-muted-foreground">
                              选项: {field.options.join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditField(field)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteField(field.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {(!selectedType?.formFields || selectedType.formFields.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>暂无字段配置</p>
                    <Button onClick={handleAddField} className="mt-4">
                      添加第一个字段
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="rules" className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>业务规则配置功能正在开发中...</p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveDocumentType}>
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 字段配置对话框 */}
      <Dialog open={isFieldDialogOpen} onOpenChange={setIsFieldDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingField ? '编辑字段' : '添加字段'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="field-name">字段名</Label>
              <Input
                id="field-name"
                value={fieldFormData.name}
                onChange={(e) => setFieldFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="输入字段名（英文）"
              />
            </div>
            <div>
              <Label htmlFor="field-label">字段标签</Label>
              <Input
                id="field-label"
                value={fieldFormData.label}
                onChange={(e) => setFieldFormData(prev => ({ ...prev, label: e.target.value }))}
                placeholder="输入字段显示名称"
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
                  <SelectItem value="checkbox">复选框</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {fieldFormData.type === 'select' && (
              <div>
                <Label htmlFor="field-options">选项（每行一个）</Label>
                <Textarea
                  id="field-options"
                  value={fieldFormData.options.join('\n')}
                  onChange={(e) => setFieldFormData(prev => ({ 
                    ...prev, 
                    options: e.target.value.split('\n').filter(opt => opt.trim()) 
                  }))}
                  placeholder="选项1&#10;选项2&#10;选项3"
                />
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Switch
                id="field-required"
                checked={fieldFormData.isRequired}
                onCheckedChange={(checked) => setFieldFormData(prev => ({ ...prev, isRequired: checked }))}
              />
              <Label htmlFor="field-required">必填</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="field-visible"
                checked={fieldFormData.isVisible}
                onCheckedChange={(checked) => setFieldFormData(prev => ({ ...prev, isVisible: checked }))}
              />
              <Label htmlFor="field-visible">可见</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFieldDialogOpen(false)}>
              取消
            </Button>
            <Button 
              onClick={handleSaveField} 
              disabled={!fieldFormData.name || !fieldFormData.label}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentTypeManagement;