
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Save, 
  Trash2, 
  Settings, 
  Bot, 
  Info,
  Hash,
  Box,
  ArrowRight
} from "lucide-react";
import { MappingRule, MOCK_RULES } from './types';
import { toast } from "sonner";
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

export default function RuleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rule, setRule] = useState<MappingRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ show: boolean }>({ show: false });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Simulate loading
    setLoading(true);
    setTimeout(() => {
      if (id === 'new') {
        setRule({
          id: 'new',
          name: '',
          description: '',
          eventSource: 'email',
          eventType: 'NEW_EVENT_TYPE',
          isActive: true,
          conditionLogic: 'AND',
          conditions: [],
          anchors: [],
          instances: [],
          relations: [],
          triggerAI: false,
          aiTemplate: 'customer_email_semantic'
        });
      } else {
        const found = MOCK_RULES.find(r => r.id === id);
        if (found) {
          setRule(JSON.parse(JSON.stringify(found))); 
        }
      }
      setLoading(false);
    }, 300);
  }, [id]);

  if (loading || !rule) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">加载配置中...</p>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      toast.success("规则保存成功");
      setSaving(false);
      navigate('/mapping-rules-2');
    }, 800);
  };

  const handleDeleteRule = () => {
    setDeleteDialog({ show: true });
  };

  const confirmDeleteRule = () => {
    setDeleting(true);
    setTimeout(() => {
      toast.success("规则已删除");
      setDeleting(false);
      setDeleteDialog({ show: false });
      navigate('/mapping-rules-2');
    }, 800);
  };

  const updateRule = (updates: Partial<MappingRule>) => {
    setRule(prev => prev ? { ...prev, ...updates } : null);
  };

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {id === 'new' ? '创建新规则' : rule.name}
            {rule.isActive && <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">启用中</Badge>}
          </h1>
          <p className="text-muted-foreground mt-1">
             {id === 'new' ? '配置新的事件识别与映射逻辑' : rule.description || '暂无描述'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate("/mapping-rules-2")}>
            返回列表
          </Button>
          {id !== 'new' && (
             <Button 
               variant="outline" 
               className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2"
               onClick={handleDeleteRule}
             >
               <Trash2 className="h-4 w-4" /> 删除规则
             </Button>
          )}
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? '保存中...' : '保存配置'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧主要配置区 */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Module A: 规则基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                规则基本信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>规则名称 <span className="text-red-500">*</span></Label>
                <Input 
                  value={rule.name} 
                  onChange={(e) => updateRule({ name: e.target.value })} 
                  placeholder="请输入规则名称"
                />
              </div>
              <div className="space-y-2">
                <Label>规则描述</Label>
                <Textarea 
                  value={rule.description} 
                  onChange={(e) => updateRule({ description: e.target.value })} 
                  placeholder="简要描述该规则的业务用途..."
                  className="h-20"
                />
              </div>
              <div className="space-y-2">
                <Label>事件类型 (系统自动识别)</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono text-sm px-3 py-1">
                    {rule.eventType}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    系统根据事件源特征自动匹配，无需手动配置
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Module B: AI 分析触发 */}
          <Card className="border-blue-200 bg-blue-50/20">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-blue-700">
                <Bot className="h-5 w-5" />
                AI 分析触发
              </CardTitle>
              <CardDescription>
                配置是否启用 AI 以及使用何种模板进行分析
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div className="space-y-0.5">
                  <Label className="text-base">启用 AI 分析</Label>
                  <p className="text-sm text-muted-foreground">
                    开启后，系统将调用大模型对事件内容进行深度理解
                  </p>
                </div>
                <Switch 
                  checked={rule.triggerAI}
                  onCheckedChange={(checked) => updateRule({ triggerAI: checked })}
                />
              </div>

              {rule.triggerAI && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                  <Label>选择 AI 分析模板</Label>
                  <Select 
                    value={rule.aiTemplate} 
                    onValueChange={(val) => updateRule({ aiTemplate: val })}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="请选择模板" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer_email_semantic">客户邮件语义理解</SelectItem>
                      <SelectItem value="order_risk_assessment">订单风险评估</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-start gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-md">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>您选择的模板用于本事件类型的自动理解和决策，这不是流程或模型配置。</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Module C - Object Instance Declaration (Read-only) */}
        <div className="space-y-6">
          <Card className="bg-muted/10">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Box className="h-5 w-5 text-muted-foreground" />
                对象实例声明
              </CardTitle>
              <CardDescription>
                本事件将创建的对象类型实例 (系统生成)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md border border-dashed mb-4">
                <p>对象实例和锚点字段由系统生成，仅供参考。</p>
              </div>

              {/* Instances List */}
              <div className="space-y-4">
                {rule.instances.length > 0 ? (
                  rule.instances.map((instance, idx) => {
                    const anchor = rule.anchors.find(a => a.id === instance.anchorRefId);
                    return (
                      <div key={instance.id} className="bg-white border rounded-lg p-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                            {instance.objectType} 实例
                          </Badge>
                        </div>
                        
                        {anchor && (
                          <div className="text-sm space-y-1">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Hash className="h-3 w-3" />
                              <span className="text-xs">锚点字段:</span>
                            </div>
                            <div className="font-mono text-xs bg-muted/50 p-1.5 rounded text-foreground break-all">
                              {anchor.fieldSource}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    暂无实例声明
                  </div>
                )}
              </div>
              
              {rule.relations.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                     <h4 className="text-sm font-medium text-muted-foreground">自动建立关系</h4>
                     {rule.relations.map(rel => {
                       const source = rule.instances.find(i => i.id === rel.sourceInstanceId);
                       const target = rule.instances.find(i => i.id === rel.targetInstanceId);
                       if (!source || !target) return null;
                       return (
                         <div key={rel.id} className="text-xs flex items-center gap-2 bg-white border p-2 rounded">
                            <span className="font-semibold">{source.objectType}</span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <Badge variant="secondary" className="text-[10px] h-5">{rel.relationType}</Badge>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span className="font-semibold">{target.objectType}</span>
                         </div>
                       )
                     })}
                  </div>
                </>
              )}

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
            <AlertDialogTitle>删除规则</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除此规则吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteRule}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? '删除中...' : '确认删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
