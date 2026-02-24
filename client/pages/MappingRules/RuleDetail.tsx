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
  Plus, 
  Trash2, 
  ArrowRight, 
  Save, 
  Play, 
  AlertCircle, 
  Mail,
  Webhook,
  Activity,
  Bot,
  Target,
  FileJson,
  Hash,
  Settings,
  GitGraph
} from "lucide-react";
import { MappingRule, MOCK_RULES, RuleCondition, BusinessAnchor, InstanceDeclaration, RelationDeclaration } from './types';
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
          eventType: '',
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
      navigate('/mapping-rules');
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
      navigate('/mapping-rules');
    }, 800);
  };

  const updateRule = (updates: Partial<MappingRule>) => {
    setRule(prev => prev ? { ...prev, ...updates } : null);
  };

  // --- Module Helpers (保持原有逻辑) ---
  const addCondition = () => {
    const newCondition: RuleCondition = {
      id: Math.random().toString(36).substr(2, 9),
      field: '',
      operator: 'equals',
      value: ''
    };
    updateRule({ conditions: [...rule.conditions, newCondition] });
  };

  const removeCondition = (idx: number) => {
    const newConditions = [...rule.conditions];
    newConditions.splice(idx, 1);
    updateRule({ conditions: newConditions });
  };

  const addAnchor = () => {
    const newAnchor: BusinessAnchor = {
      id: Math.random().toString(36).substr(2, 9),
      objectType: '',
      fieldSource: ''
    };
    updateRule({ anchors: [...rule.anchors, newAnchor] });
  };

  const removeAnchor = (idx: number) => {
    const newAnchors = [...rule.anchors];
    newAnchors.splice(idx, 1);
    updateRule({ anchors: newAnchors });
  };

  const addInstance = () => {
    const newInstance: InstanceDeclaration = {
      id: Math.random().toString(36).substr(2, 9),
      objectType: '',
      anchorRefId: ''
    };
    updateRule({ instances: [...rule.instances, newInstance] });
  };

  const removeInstance = (idx: number) => {
    const newInstances = [...rule.instances];
    newInstances.splice(idx, 1);
    updateRule({ instances: newInstances });
  };

  const addRelation = () => {
    const newRelation: RelationDeclaration = {
      id: Math.random().toString(36).substr(2, 9),
      sourceInstanceId: '',
      targetInstanceId: '',
      relationType: ''
    };
    updateRule({ relations: [...rule.relations, newRelation] });
  };

  const removeRelation = (idx: number) => {
    const newRelations = [...rule.relations];
    newRelations.splice(idx, 1);
    updateRule({ relations: newRelations });
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
          <Button variant="outline" onClick={() => navigate("/mapping-rules")}>
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
          
          {/* Module A: 基本信息 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  基础配置
                </CardTitle>
                <div className="flex items-center gap-3">
                  {id !== 'new' && (
                    <Button variant="outline" size="sm" className="gap-2">
                      <Play className="h-4 w-4" /> 测试规则
                    </Button>
                  )}
                  <Switch 
                    checked={rule.isActive}
                    onCheckedChange={(checked) => updateRule({ isActive: checked })}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>规则名称 <span className="text-red-500">*</span></Label>
                  <Input 
                    value={rule.name} 
                    onChange={(e) => updateRule({ name: e.target.value })} 
                    placeholder="请输入规则名称"
                  />
                </div>
                <div className="space-y-2">
                  <Label>事件来源</Label>
                  <Select 
                    value={rule.eventSource} 
                    onValueChange={(val: any) => updateRule({ eventSource: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">
                        <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> Email</div>
                      </SelectItem>
                      <SelectItem value="webhook">
                        <div className="flex items-center gap-2"><Webhook className="h-4 w-4" /> Webhook</div>
                      </SelectItem>
                      <SelectItem value="tracking">
                        <div className="flex items-center gap-2"><Activity className="h-4 w-4" /> Tracking</div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
            </CardContent>
          </Card>

          {/* Module B: 识别条件 */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  识别条件
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={addCondition} className="text-primary hover:text-primary/90">
                  <Plus className="h-4 w-4 mr-1" /> 添加条件
                </Button>
              </div>
              <CardDescription>
                当标准化事件满足以下条件时，触发此规则。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {rule.conditions.length === 0 ? (
                <div className="bg-muted/30 border border-dashed rounded-lg p-6 text-center text-muted-foreground text-sm">
                  未配置条件，默认匹配所有来自该源的事件。
                </div>
              ) : (
                <div className="space-y-3">
                  {rule.conditions.map((cond, idx) => (
                    <div key={cond.id} className="flex items-center gap-2 p-3 bg-muted/20 border rounded-lg group hover:border-primary/30 transition-colors">
                      <div className="grid grid-cols-12 gap-3 flex-1">
                        <div className="col-span-4">
                          <Input 
                            placeholder="字段 (如 subject)" 
                            value={cond.field}
                            className="bg-background h-9"
                            onChange={(e) => {
                              const newC = [...rule.conditions];
                              newC[idx].field = e.target.value;
                              updateRule({ conditions: newC });
                            }}
                          />
                        </div>
                        <div className="col-span-3">
                          <Select 
                            value={cond.operator}
                            onValueChange={(val: any) => {
                              const newC = [...rule.conditions];
                              newC[idx].operator = val;
                              updateRule({ conditions: newC });
                            }}
                          >
                            <SelectTrigger className="h-9 bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="equals">等于</SelectItem>
                              <SelectItem value="contains">包含</SelectItem>
                              <SelectItem value="regex">正则匹配</SelectItem>
                              <SelectItem value="exists">存在</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-5">
                          {cond.operator !== 'exists' && (
                            <Input 
                              placeholder="值" 
                              value={cond.value}
                              className="bg-background h-9"
                              onChange={(e) => {
                                const newC = [...rule.conditions];
                                newC[idx].value = e.target.value;
                                updateRule({ conditions: newC });
                              }}
                            />
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" 
                        onClick={() => removeCondition(idx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex items-center gap-3 pt-2">
                <span className="text-sm font-medium">条件组合逻辑:</span>
                <div className="flex items-center border rounded-md p-1 bg-muted/20">
                  <Button 
                    variant={rule.conditionLogic === 'AND' ? 'secondary' : 'ghost'} 
                    size="sm" 
                    className="h-7 text-xs px-3"
                    onClick={() => updateRule({ conditionLogic: 'AND' })}
                  >
                    且 (AND)
                  </Button>
                  <Button 
                    variant={rule.conditionLogic === 'OR' ? 'secondary' : 'ghost'} 
                    size="sm" 
                    className="h-7 text-xs px-3"
                    onClick={() => updateRule({ conditionLogic: 'OR' })}
                  >
                    或 (OR)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Module C: 锚点 */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Hash className="h-5 w-5 text-primary" />
                  业务锚点提取
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={addAnchor} className="text-primary hover:text-primary/90">
                  <Plus className="h-4 w-4 mr-1" /> 添加锚点
                </Button>
              </div>
              <CardDescription>
                从原始数据中提取关键身份标识 (ID)，用于后续对象关联。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {rule.anchors.length === 0 && (
                <div className="bg-muted/30 border border-dashed rounded-lg p-6 text-center text-muted-foreground text-sm">
                  请添加锚点以提取业务对象ID。
                </div>
              )}
              {rule.anchors.map((anchor, idx) => (
                <div key={anchor.id} className="p-4 bg-muted/20 border rounded-lg relative group hover:border-primary/30 transition-colors">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-2 top-2 text-muted-foreground hover:text-destructive h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" 
                      onClick={() => removeAnchor(idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-4 mr-8">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">所属对象类型</Label>
                        <Input 
                          placeholder="例如：Order"
                          value={anchor.objectType}
                          className="bg-background h-9"
                          onChange={(e) => {
                            const newA = [...rule.anchors];
                            newA[idx].objectType = e.target.value;
                            updateRule({ anchors: newA });
                          }}
                        />
                      </div>
                      <div className="space-y-1.5">
                         <Label className="text-xs text-muted-foreground">来源字段 (JSON Path)</Label>
                         <Input 
                          placeholder="例如：body.order_id"
                          value={anchor.fieldSource}
                          className="bg-background h-9 font-mono text-xs"
                          onChange={(e) => {
                            const newA = [...rule.anchors];
                            newA[idx].fieldSource = e.target.value;
                            updateRule({ anchors: newA });
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <div className="flex items-center gap-3">
                         <span className="text-xs text-muted-foreground whitespace-nowrap">正则提取 (可选):</span>
                         <Input 
                            placeholder="例如：Order #(\d+)"
                            value={anchor.extractionRegex || ''}
                            onChange={(e) => {
                              const newA = [...rule.anchors];
                              newA[idx].extractionRegex = e.target.value;
                              updateRule({ anchors: newA });
                            }}
                            className="bg-background h-8 font-mono text-xs flex-1"
                          />
                          {anchor.extractionRegex && <Badge variant="outline" className="text-[10px] h-6">Group 1</Badge>}
                      </div>
                    </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Module D & E: 实例与关系 (合并在一个卡片中，分两部分) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <GitGraph className="h-5 w-5 text-primary" />
                结构化输出声明
              </CardTitle>
              <CardDescription>
                定义基于锚点生成的对象实例及其关系图谱。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* 实例部分 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    对象实例
                  </h4>
                  <Button variant="ghost" size="sm" onClick={addInstance} disabled={rule.anchors.length === 0} className="h-7 text-xs">
                    <Plus className="h-3 w-3 mr-1" /> 添加实例
                  </Button>
                </div>
                
                {rule.instances.length === 0 ? (
                   <div className="text-sm text-muted-foreground pl-4 border-l-2 border-muted">暂无实例声明</div>
                ) : (
                  <div className="space-y-2">
                    {rule.instances.map((inst, idx) => (
                      <div key={inst.id} className="flex items-center gap-2 p-2 bg-muted/20 border rounded-md group">
                        <div className="grid grid-cols-2 gap-2 flex-1">
                            <Input 
                              placeholder="实例类型 (如 Order)"
                              value={inst.objectType}
                              className="h-8 bg-background text-sm"
                              onChange={(e) => {
                                const newI = [...rule.instances];
                                newI[idx].objectType = e.target.value;
                                updateRule({ instances: newI });
                              }}
                            />
                            <Select 
                              value={inst.anchorRefId}
                              onValueChange={(val) => {
                                const newI = [...rule.instances];
                                newI[idx].anchorRefId = val;
                                updateRule({ instances: newI });
                              }}
                            >
                              <SelectTrigger className="h-8 bg-background text-sm">
                                <SelectValue placeholder="绑定锚点" />
                              </SelectTrigger>
                              <SelectContent>
                                {rule.anchors.map(a => (
                                  <SelectItem key={a.id} value={a.id}>
                                    {a.objectType} ({a.fieldSource})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100" onClick={() => removeInstance(idx)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* 关系部分 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                    实例关系
                  </h4>
                  <Button variant="ghost" size="sm" onClick={addRelation} disabled={rule.instances.length < 2} className="h-7 text-xs">
                    <Plus className="h-3 w-3 mr-1" /> 添加关系
                  </Button>
                </div>
                
                {rule.relations.length === 0 ? (
                   <div className="text-sm text-muted-foreground pl-4 border-l-2 border-muted">暂无关系声明</div>
                ) : (
                  <div className="space-y-2">
                    {rule.relations.map((rel, idx) => (
                      <div key={rel.id} className="flex items-center gap-2 p-2 bg-muted/20 border rounded-md group">
                        <div className="flex items-center gap-2 flex-1">
                            <Select 
                              value={rel.sourceInstanceId}
                              onValueChange={(val) => {
                                const newR = [...rule.relations];
                                newR[idx].sourceInstanceId = val;
                                updateRule({ relations: newR });
                              }}
                            >
                              <SelectTrigger className="h-8 bg-background text-sm flex-1">
                                <SelectValue placeholder="源" />
                              </SelectTrigger>
                              <SelectContent>
                                {rule.instances.map(i => <SelectItem key={i.id} value={i.id}>{i.objectType}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            
                            <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            
                            <Input 
                              placeholder="关系类型" 
                              className="h-8 bg-background text-sm w-32 text-center"
                              value={rel.relationType}
                              onChange={(e) => {
                                 const newR = [...rule.relations];
                                 newR[idx].relationType = e.target.value;
                                 updateRule({ relations: newR });
                              }}
                            />
      
                            <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
      
                            <Select 
                              value={rel.targetInstanceId}
                              onValueChange={(val) => {
                                const newR = [...rule.relations];
                                newR[idx].targetInstanceId = val;
                                updateRule({ relations: newR });
                              }}
                            >
                              <SelectTrigger className="h-8 bg-background text-sm flex-1">
                                <SelectValue placeholder="目标" />
                              </SelectTrigger>
                              <SelectContent>
                                {rule.instances.map(i => <SelectItem key={i.id} value={i.id}>{i.objectType}</SelectItem>)}
                              </SelectContent>
                            </Select>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100" onClick={() => removeRelation(idx)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

           {/* Module F: AI Trigger */}
          <Card className={rule.triggerAI ? "border-purple-200 bg-purple-50/10" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Bot className="h-5 w-5 text-purple-600" />
                  AI 分析触发配置
                </CardTitle>
                <div className="flex items-center gap-3">
                  <Label htmlFor="ai-trigger-switch" className="text-sm font-medium text-slate-600">是否触发 AI 分析</Label>
                  <Switch 
                    id="ai-trigger-switch"
                    checked={rule.triggerAI}
                    onCheckedChange={(checked) => updateRule({ triggerAI: checked })}
                  />
                </div>
              </div>
            </CardHeader>
            {rule.triggerAI && (
              <CardContent className="space-y-6 pt-0">
                <Separator className="bg-purple-100" />
                
                <div className="space-y-3">
                  <Label className="text-sm font-medium">使用的 AI 分析模板</Label>
                  <Select 
                    value={rule.aiTemplate || 'customer_email_semantic'}
                    onValueChange={(val) => updateRule({ aiTemplate: val })}
                  >
                    <SelectTrigger className="w-full md:w-1/2 bg-white border-purple-100">
                      <SelectValue placeholder="选择模板" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer_email_semantic">客户邮件语义理解</SelectItem>
                      <SelectItem value="customer_behavior_anomaly">客户行为异常分析</SelectItem>
                      <SelectItem value="order_risk_assessment">订单风险评估</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 flex gap-3 shadow-sm">
                   <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-amber-600" />
                   <div>
                     <p className="font-bold text-amber-900 mb-1">重要提示</p>
                     <p className="leading-relaxed">
                       你在这里选择的不是模型，也不是流程，
                       <br />
                       而是：这一类事件将被 AI 以哪种<span className="font-bold mx-1">‘分析视角’</span>进行理解和判断。
                     </p>
                   </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* 右侧辅助信息区 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">基本属性</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">规则 ID</dt>
                  <dd className="mt-1 text-xs font-mono bg-muted px-2 py-1 rounded inline-block text-foreground">
                    {rule.id === 'new' ? 'Auto-Generated' : rule.id}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">业务事件代码</dt>
                  <dd className="mt-1">
                    <Input 
                      value={rule.eventType} 
                      onChange={(e) => updateRule({ eventType: e.target.value })} 
                      placeholder="e.g. ORDER_CREATED"
                      className="font-mono text-sm h-8"
                    />
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">最近修改</dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {new Date().toLocaleDateString()}
                  </dd>
                </div>
                 <div>
                  <dt className="text-sm font-medium text-muted-foreground">最近命中</dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {rule.lastMatchedAt || '尚未触发'}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">工作原理</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 bg-blue-100 text-blue-600 rounded">
                    <Target className="h-3 w-3" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">1. 识别 (Identify)</div>
                    <div>根据预设条件过滤原始事件流，锁定业务相关的信号。</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 bg-orange-100 text-orange-600 rounded">
                    <Hash className="h-3 w-3" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">2. 锚定 (Anchor)</div>
                    <div>从数据载荷中提取关键 ID，作为业务对象的身份标识。</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 bg-purple-100 text-purple-600 rounded">
                    <GitGraph className="h-3 w-3" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">3. 结构化 (Structure)</div>
                    <div>基于锚点生成标准化的对象实例图谱，供下游消费。</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-950 text-slate-50 border-slate-900">
             <CardHeader className="pb-3">
               <CardTitle className="text-base text-slate-50 flex items-center gap-2">
                 <FileJson className="h-4 w-4" />
                 输出预览
               </CardTitle>
               <CardDescription className="text-slate-400 text-xs">
                 模拟输出结构
               </CardDescription>
             </CardHeader>
             <CardContent>
                <pre className="text-xs overflow-auto max-h-[300px] p-2 bg-slate-900 rounded font-mono text-slate-300 leading-relaxed">
                  {JSON.stringify({
                    eventType: rule.eventType || "UNKNOWN",
                    source: rule.eventSource,
                    instances: rule.instances.map(i => {
                      const anchor = rule.anchors.find(a => a.id === i.anchorRefId);
                      return {
                        type: i.objectType,
                        id: anchor ? `{{${anchor.fieldSource}}}` : "null"
                      };
                    }),
                    relations: rule.relations.map(r => {
                       const src = rule.instances.find(i => i.id === r.sourceInstanceId)?.objectType || "?";
                       const tgt = rule.instances.find(i => i.id === r.targetInstanceId)?.objectType || "?";
                       return `${src} -> ${r.relationType} -> ${tgt}`;
                    }),
                    meta: {
                      ai_trigger: rule.triggerAI
                    }
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
            <AlertDialogTitle>删除规则</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除规则 "{rule.name}" 吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteRule}
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
