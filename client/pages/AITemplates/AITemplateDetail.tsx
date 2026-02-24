import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  ArrowLeft, 
  Save, 
  Info, 
  Plus, 
  Trash2, 
  Bot, 
  Layers, 
  Target, 
  FileJson, 
  AlertCircle,
  Settings
} from "lucide-react";
import { toast } from "sonner";
import { AITemplate, OutputField, MOCK_TEMPLATES } from './types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AITemplateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ show: boolean }>({ show: false });
  const [deleting, setDeleting] = useState(false);
  
  const [template, setTemplate] = useState<AITemplate>({
    id: 'new',
    name: '',
    description: '',
    targetObjectType: '',
    relatedObjects: [],
    analysisGoal: '',
    analysisTargetType: 'classification',
    outputStructure: [],
    referenceCount: 0,
    isActive: true,
    updatedAt: new Date().toISOString()
  });

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      if (id && id !== 'new') {
        const found = MOCK_TEMPLATES.find(t => t.id === id);
        if (found) {
          setTemplate(JSON.parse(JSON.stringify(found)));
        }
      }
      setLoading(false);
    }, 300);
  }, [id]);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      toast.success("模板保存成功");
      setSaving(false);
      navigate('/ai-templates');
    }, 800);
  };

  const handleDeleteTemplate = () => {
    setDeleteDialog({ show: true });
  };

  const confirmDeleteTemplate = () => {
    setDeleting(true);
    setTimeout(() => {
      toast.success("模板已删除");
      setDeleting(false);
      setDeleteDialog({ show: false });
      navigate('/ai-templates');
    }, 800);
  };

  const updateTemplate = (updates: Partial<AITemplate>) => {
    setTemplate(prev => ({ ...prev, ...updates }));
  };

  const addOutputField = () => {
    const newField: OutputField = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      description: '',
      type: 'string',
      required: true
    };
    updateTemplate({ outputStructure: [...template.outputStructure, newField] });
  };

  const removeOutputField = (idx: number) => {
    const newFields = [...template.outputStructure];
    newFields.splice(idx, 1);
    updateTemplate({ outputStructure: newFields });
  };

  const updateOutputField = (idx: number, updates: Partial<OutputField>) => {
    const newFields = [...template.outputStructure];
    newFields[idx] = { ...newFields[idx], ...updates };
    updateTemplate({ outputStructure: newFields });
  };

  const toggleRelatedObject = (obj: string) => {
    const current = [...template.relatedObjects];
    if (current.includes(obj)) {
      updateTemplate({ relatedObjects: current.filter(o => o !== obj) });
    } else {
      updateTemplate({ relatedObjects: [...current, obj] });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">加载模板中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {id === 'new' ? '新建 AI 分析模板' : template.name}
            {template.isActive && <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">启用中</Badge>}
          </h1>
          <p className="text-muted-foreground mt-1">
             {id === 'new' ? '定义 AI 如何理解和判断一类业务对象' : template.description || '暂无描述'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate("/ai-templates")}>
            返回列表
          </Button>
          {id !== 'new' && (
             <Button 
               variant="outline" 
               className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2"
               onClick={handleDeleteTemplate}
             >
               <Trash2 className="h-4 w-4" /> 删除模板
             </Button>
          )}
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? '保存中...' : '保存模板'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Main Config */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Module A: Basic Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  模板基本信息
                </CardTitle>
                <Switch 
                  checked={template.isActive}
                  onCheckedChange={(checked) => updateTemplate({ isActive: checked })}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>模板名称 <span className="text-red-500">*</span></Label>
                <Input 
                  placeholder="如「客户邮件语义理解」" 
                  value={template.name}
                  onChange={(e) => updateTemplate({ name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>模板说明</Label>
                <Textarea 
                  placeholder="说明 AI 在分析什么问题..." 
                  className="h-20"
                  value={template.description}
                  onChange={(e) => updateTemplate({ description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>适用对象类型 <span className="text-red-500">*</span></Label>
                <Select 
                  value={template.targetObjectType} 
                  onValueChange={(val) => updateTemplate({ targetObjectType: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择对象类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Customer">客户 (Customer)</SelectItem>
                    <SelectItem value="Order">订单 (Order)</SelectItem>
                    <SelectItem value="Conversation">会话 (邮件/Ticket)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Module B: Context Scope */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                AI 分析上下文范围
              </CardTitle>
              <CardDescription>
                定义 AI 在分析时可以“看到”的业务上下文范围。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-muted/30 rounded-lg border space-y-3">
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">主分析对象 (只读)</span>
                    <Badge variant="secondary" className="font-mono">
                      {template.targetObjectType || '未选择'}
                    </Badge>
                 </div>
                 <p className="text-xs text-muted-foreground">
                   自动来自「适用对象类型」，AI 将直接读取该对象的全部属性。
                 </p>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">可用关联对象 (Context)</Label>
                <div className="grid grid-cols-2 gap-4">
                  {['Order', 'Customer', 'Product', 'Ticket', 'LoginHistory'].filter(t => t !== template.targetObjectType).map((obj) => (
                    <div key={obj} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-muted/20 transition-colors">
                      <Checkbox 
                        id={`ctx-${obj}`} 
                        checked={template.relatedObjects.includes(obj)}
                        onCheckedChange={() => toggleRelatedObject(obj)}
                      />
                      <label
                        htmlFor={`ctx-${obj}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        关联 {obj}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                   <Info className="h-3 w-3" />
                   <span>AI 可访问关联对象的关键字段与事实关系，无需逐字段配置。</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Module C: Analysis Goal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                分析目标声明
              </CardTitle>
              <CardDescription>
                声明 AI 需要判断的问题，而不是提示词。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>分析目标描述 <span className="text-red-500">*</span></Label>
                <Textarea 
                  placeholder="例如：判断客户是否存在流失风险，或判断当前邮件是否需要人工介入..." 
                  className="min-h-[100px]"
                  value={template.analysisGoal}
                  onChange={(e) => updateTemplate({ analysisGoal: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <Label>分析目标类型</Label>
                <RadioGroup 
                  value={template.analysisTargetType} 
                  onValueChange={(val: any) => updateTemplate({ analysisTargetType: val })}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem value="risk" id="r-risk" />
                    <Label htmlFor="r-risk" className="font-normal">风险判断 (Risk Assessment)</Label>
                  </div>
                  <div className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem value="classification" id="r-class" />
                    <Label htmlFor="r-class" className="font-normal">分类识别 (Classification)</Label>
                  </div>
                  <div className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem value="summary" id="r-sum" />
                    <Label htmlFor="r-sum" className="font-normal">原因总结 (Summarization)</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Module D: Output Structure */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <FileJson className="h-5 w-5 text-primary" />
                  AI 输出结果结构定义
                </CardTitle>
                <Button variant="outline" size="sm" onClick={addOutputField} className="gap-1">
                  <Plus className="h-3 w-3" /> 添加输出项
                </Button>
              </div>
              <CardDescription>
                AI 的输出将被系统理解和使用，而不仅是展示给人。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {template.outputStructure.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/10">
                  <p className="text-sm text-muted-foreground mb-2">暂无输出定义</p>
                  <Button variant="link" onClick={addOutputField}>点击添加第一个输出项</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {template.outputStructure.map((field, idx) => (
                    <div key={field.id} className="p-4 border rounded-lg bg-card hover:border-primary/40 transition-colors relative group">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-2 top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                        onClick={() => removeOutputField(idx)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">字段名称 (Key)</Label>
                          <Input 
                            value={field.name} 
                            onChange={(e) => updateOutputField(idx, { name: e.target.value })}
                            placeholder="如 risk_level"
                            className="h-8 font-mono text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                           <Label className="text-xs text-muted-foreground">字段含义说明</Label>
                           <Input 
                              value={field.description}
                              onChange={(e) => updateOutputField(idx, { description: e.target.value })}
                              placeholder="用于提示 AI 理解该字段"
                              className="h-8 text-sm"
                           />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">输出类型</Label>
                          <Select 
                            value={field.type}
                            onValueChange={(val) => updateOutputField(idx, { type: val })}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="string">文本 (String)</SelectItem>
                              <SelectItem value="number">数字 (Number)</SelectItem>
                              <SelectItem value="boolean">布尔 (Boolean)</SelectItem>
                              <SelectItem value="enum">枚举 (Enum)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {field.type === 'enum' && (
                          <div className="space-y-1.5 md:col-span-2">
                            <Label className="text-xs text-muted-foreground">枚举值 (逗号分隔)</Label>
                            <Input 
                              value={field.enumValues?.join(', ')}
                              onChange={(e) => updateOutputField(idx, { enumValues: e.target.value.split(',').map(s => s.trim()) })}
                              placeholder="low, medium, high"
                              className="h-8 text-xs"
                            />
                          </div>
                        )}

                        <div className="flex items-center gap-2 md:col-span-3 pt-1">
                           <Switch 
                              id={`req-${field.id}`}
                              checked={field.required}
                              onCheckedChange={(c) => updateOutputField(idx, { required: c })}
                              className="scale-75 origin-left"
                           />
                           <Label htmlFor={`req-${field.id}`} className="text-xs font-normal cursor-pointer">
                             设为必填 (Required)
                           </Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-6">
          {/* Module E: Usage Guide */}
          <Card className="bg-slate-50 border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">模板使用说明</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <div className="font-medium text-slate-700 mb-1">本模板可被以下规则引用：</div>
                <div className="bg-white p-2 rounded border border-slate-200 text-xs text-slate-600">
                   • 客户邮件识别规则<br/>
                   • 订单异常监控规则
                </div>
              </div>
              
              <Separator />

              <div>
                 <div className="font-medium text-slate-700 mb-1">调用时机说明：</div>
                 <p className="text-slate-600 text-xs leading-relaxed">
                   当业务对象实例被识别并声明触发 AI 时，系统将加载此模板配置。
                 </p>
              </div>

              <div>
                 <div className="font-medium text-slate-700 mb-1">输出结果去向说明：</div>
                 <p className="text-slate-600 text-xs leading-relaxed">
                   AI 决策触发层（用于生成建议）、自动化流程分支判断条件。
                 </p>
              </div>
            </CardContent>
            <CardFooter className="bg-amber-50 border-t border-amber-100 p-3">
               <div className="flex gap-2 text-amber-800 text-xs">
                 <AlertCircle className="h-4 w-4 flex-shrink-0" />
                 <span>保存后，该模板可被多个识别规则复用。</span>
               </div>
            </CardFooter>
          </Card>

          <Card>
             <CardHeader className="pb-2">
               <CardTitle className="text-base font-semibold">预览 Output JSON</CardTitle>
             </CardHeader>
             <CardContent>
               <pre className="text-[10px] font-mono bg-slate-900 text-slate-300 p-2 rounded overflow-auto max-h-[300px]">
{JSON.stringify({
  [template.outputStructure[0]?.name || "key"]: template.outputStructure[0]?.type === 'enum' ? template.outputStructure[0]?.enumValues?.[0] : "value",
  "...": "..."
}, null, 2)}
               </pre>
             </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog
        open={deleteDialog.show}
        onOpenChange={(open) => !open && setDeleteDialog({ show: false })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除模板</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除模板 "{template.name}" 吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteTemplate}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting}
            >
              {deleting ? "删除中..." : "确认删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}