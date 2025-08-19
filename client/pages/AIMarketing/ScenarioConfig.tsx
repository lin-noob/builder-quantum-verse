import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Bot,
  AlertTriangle,
  TrendingUp,
  Activity,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  MarketingScenario,
  OverrideRule,
  getMarketingScenario,
  updateMarketingScenario,
  updateOverrideRule,
  deleteOverrideRule,
  updateRulePriorities
} from "../../../shared/aiMarketingScenarioData";
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
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from "@hello-pangea/dnd";
import RuleBuilderModal from "@/components/RuleBuilderModal";
import RuleConflictManager from "@/components/RuleConflictManager";

const ScenarioConfig = () => {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [scenario, setScenario] = useState<MarketingScenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [ruleBuilderOpen, setRuleBuilderOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<OverrideRule | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    show: boolean;
    rule: OverrideRule | null;
  }>({ show: false, rule: null });

  useEffect(() => {
    if (scenarioId) {
      loadScenario();
    }
  }, [scenarioId]);

  const loadScenario = async () => {
    if (!scenarioId) return;
    
    try {
      const data = await getMarketingScenario(scenarioId);
      if (data) {
        setScenario(data);
      } else {
        toast({
          title: "场景不存在",
          description: "找不到指定的营销场景",
          variant: "destructive",
        });
        navigate("/ai-marketing/scenarios");
      }
    } catch (error) {
      toast({
        title: "加载失败",
        description: "无法加载场景配置，请重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAIToggle = async (newState: boolean) => {
    if (!scenario) return;

    try {
      await updateMarketingScenario(scenario.scenarioId, { isAIEnabled: newState });
      setScenario(prev => prev ? { ...prev, isAIEnabled: newState } : null);
      
      toast({
        title: newState ? "AI自动化已启��" : "AI自动化已暂停",
        description: `${scenario.scenarioName}场景的自动化营销已${newState ? '启动' : '暂停'}`,
      });
    } catch (error) {
      toast({
        title: "操作失败",
        description: "无法更新AI开关状态，请重试",
        variant: "destructive",
      });
    }
  };

  const handleRuleToggle = async (rule: OverrideRule, newState: boolean) => {
    if (!scenario) return;

    try {
      await updateOverrideRule(scenario.scenarioId, rule.ruleId, { isEnabled: newState });
      setScenario(prev => {
        if (!prev) return null;
        return {
          ...prev,
          overrideRules: prev.overrideRules.map(r => 
            r.ruleId === rule.ruleId ? { ...r, isEnabled: newState } : r
          )
        };
      });

      toast({
        title: newState ? "规则已启用" : "规则已停用",
        description: `自定义规则「${rule.ruleName}」已${newState ? '启用' : '停用'}`,
      });
    } catch (error) {
      toast({
        title: "操作失败",
        description: "无法更新规则状态，请���试",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRule = async () => {
    const { rule } = deleteDialog;
    if (!rule || !scenario) return;

    try {
      await deleteOverrideRule(scenario.scenarioId, rule.ruleId);
      setScenario(prev => {
        if (!prev) return null;
        return {
          ...prev,
          overrideRules: prev.overrideRules.filter(r => r.ruleId !== rule.ruleId)
        };
      });

      toast({
        title: "规则已删除",
        description: `自定义规则「${rule.ruleName}」已删除`,
      });
    } catch (error) {
      toast({
        title: "删除失败",
        description: "无法删除规则，请重试",
        variant: "destructive",
      });
    } finally {
      setDeleteDialog({ show: false, rule: null });
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !scenario) return;

    const newRules = Array.from(scenario.overrideRules);
    const [reorderedRule] = newRules.splice(result.source.index, 1);
    newRules.splice(result.destination.index, 0, reorderedRule);

    setScenario(prev => prev ? { ...prev, overrideRules: newRules } : null);

    try {
      const ruleIds = newRules.map(rule => rule.ruleId);
      await updateRulePriorities(scenario.scenarioId, ruleIds);
      
      toast({
        title: "优先级已更新",
        description: "规则执行优先级已调整",
      });
    } catch (error) {
      setScenario(prev => prev ? { ...prev, overrideRules: scenario.overrideRules } : null);
      toast({
        title: "更新失败",
        description: "无法调整规则优先级，请重试",
        variant: "destructive",
      });
    }
  };

  const formatActionType = (actionType: string) => {
    switch (actionType) {
      case 'POPUP': return '网页弹窗';
      case 'EMAIL': return '邮件';
      case 'SMS': return '短信';
      default: return actionType;
    }
  };

  const formatTiming = (timing: string) => {
    switch (timing) {
      case 'IMMEDIATE': return '立即触发';
      case 'SMART_DELAY': return '智能延迟';
      case 'DELAYED': return '延迟触发';
      default: return timing;
    }
  };

  const formatContentMode = (mode: string) => {
    switch (mode) {
      case 'STATIC': return '静态内容';
      case 'AI_ASSISTED': return 'AI辅助';
      case 'FULLY_GENERATIVE': return '完全生成';
      default: return mode;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-5 bg-muted rounded w-32"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-6">
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">场景不存在</h3>
          <p className="text-muted-foreground mb-4">找不到指定的营销场景</p>
          <Button onClick={() => navigate("/ai-marketing/scenarios")}>
            返回场景列表
          </Button>
        </div>
      </div>
    );
  }

  const enabledRulesCount = scenario.overrideRules.filter(rule => rule.isEnabled).length;
  const totalRulesCount = scenario.overrideRules.length;

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-foreground">{scenario.scenarioName}</h1>
        <p className="text-sm text-muted-foreground mt-1">场景配置和规则管理</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧主要信息 */}
        <div className="lg:col-span-2 space-y-6">

          {/* AI工作原�� */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  AI策略配置
                </CardTitle>
                <Switch
                  checked={scenario.isAIEnabled}
                  onCheckedChange={handleAIToggle}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* 决策维度���情 */}
                <div>
                  <Tabs defaultValue="0" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      {scenario.defaultAIConfig.dimensions.map((dimension, index) => (
                        <TabsTrigger
                          key={index}
                          value={index.toString()}
                          className="text-xs"
                        >
                          {dimension.dimension}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {scenario.defaultAIConfig.dimensions.map((dimension, index) => (
                      <TabsContent key={index} value={index.toString()} className="mt-4">
                        <div className="border rounded-lg p-4 bg-muted/20">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-foreground">{dimension.dimension}</h4>
                            <Badge variant="outline" className="text-xs">
                              {dimension.strategy}
                            </Badge>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <dt className="text-sm font-medium text-muted-foreground mb-2">决策依据</dt>
                              <dd className="text-sm text-foreground leading-relaxed">
                                {dimension.reasoning}
                              </dd>
                            </div>

                            <div>
                              <dt className="text-sm font-medium text-muted-foreground mb-2">策略示例</dt>
                              <dd className="space-y-2">
                                {dimension.examples.map((example, exampleIndex) => (
                                  <div
                                    key={exampleIndex}
                                    className="text-sm text-foreground bg-background/60 p-3 rounded border-l-3 border-primary/40"
                                  >
                                    {example}
                                  </div>
                                ))}
                              </dd>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 自定义覆盖规则 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">自定义规则</CardTitle>
                <Button onClick={() => setRuleBuilderOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加规则
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {scenario.overrideRules.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">暂无自定义规则</h3>
                  <p className="text-muted-foreground mb-4">
                    创建自定义���则来对特定用户群体进行精准营销
                  </p>
                  <Button onClick={() => setRuleBuilderOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    创建第一条规则
                  </Button>
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="rules">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                        {scenario.overrideRules.map((rule, index) => (
                          <Draggable key={rule.ruleId} draggableId={rule.ruleId} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`p-4 border rounded-lg bg-card ${
                                  snapshot.isDragging ? 'shadow-lg' : ''
                                } ${!rule.isEnabled ? 'opacity-60' : ''}`}
                              >
                                <div className="flex items-center gap-3">
                                  <div 
                                    {...provided.dragHandleProps}
                                    className="text-muted-foreground cursor-grab active:cursor-grabbing"
                                  >
                                    <GripVertical className="h-4 w-4" />
                                  </div>
                                  
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">
                                          优先级 {rule.priority}
                                        </Badge>
                                        <h4 className="font-medium">{rule.ruleName}</h4>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Switch
                                          checked={rule.isEnabled}
                                          onCheckedChange={(checked) => handleRuleToggle(rule, checked)}
                                          size="sm"
                                        />
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setEditingRule(rule);
                                            setRuleBuilderOpen(true);
                                          }}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setDeleteDialog({ show: true, rule })}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                    
                                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="text-muted-foreground">响���动作：</span>
                                        <span className="ml-1">
                                          {formatActionType(rule.responseAction.actionType)} • {formatTiming(rule.responseAction.timing)}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">内容模式：</span>
                                        <span className="ml-1">
                                          {formatContentMode(rule.responseAction.contentMode)}
                                        </span>
                                      </div>
                                    </div>
                                    
                                    <div className="text-xs text-muted-foreground">
                                      触发条件：
                                      {rule.triggerConditions.eventConditions.length > 0 && 
                                        ` 事件属性(${rule.triggerConditions.eventConditions.length})`
                                      }
                                      {rule.triggerConditions.sessionConditions.length > 0 && 
                                        ` 会话属���(${rule.triggerConditions.sessionConditions.length})`
                                      }
                                      {rule.triggerConditions.userConditions.length > 0 && 
                                        ` 用户画像(${rule.triggerConditions.userConditions.length})`
                                      }
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </CardContent>
          </Card>

          {/* 规则冲突管理器 */}
          {scenario.overrideRules.length > 0 && (
            <RuleConflictManager
              scenario={scenario}
              onRuleEdit={(rule) => {
                setEditingRule(rule);
                setRuleBuilderOpen(true);
              }}
            />
          )}
        </div>

        {/* 右侧信息 */}
        <div className="space-y-6">
          {/* 基础信息卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">基础信息</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">场景状态</dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <span className="text-sm">
                      {scenario.isAIEnabled ? '已启用' : '已��停'}
                    </span>
                    {scenario.isAIEnabled && (
                      <div className="flex items-center gap-1 text-success">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                        <span className="text-xs">运行中</span>
                      </div>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">场景ID</dt>
                  <dd className="mt-1 text-sm text-muted-foreground font-mono">{scenario.scenarioId}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">创建时间</dt>
                  <dd className="mt-1 text-sm">{formatDate(scenario.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">更新时间</dt>
                  <dd className="mt-1 text-sm">{formatDate(scenario.updatedAt)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* AI工作原理 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">AI工作原���</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700 mt-0.5">
                    1
                  </div>
                  <div>
                    <div className="font-medium text-foreground">规则优先</div>
                    <div>系统优先匹配您设定的自定义规则。</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-700 mt-0.5">
                    2
                  </div>
                  <div>
                    <div className="font-medium text-foreground">AI决策</div>
                    <div>若无规则命中，则由默认AI自主决策。</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-700 mt-0.5">
                    3
                  </div>
                  <div>
                    <div className="font-medium text-foreground">个性化执行</div>
                    <div>根据匹配结果，执行最合适的响应动作。</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-700 mt-0.5">
                    4
                  </div>
                  <div>
                    <div className="font-medium text-foreground">效果追踪</div>
                    <div>记录所有动作效果，供您分析优化。</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 规则冲突预防指南 */}
          <RuleConflictGuide />
        </div>
      </div>

      {/* 规则构建器模态框 */}
      <RuleBuilderModal
        open={ruleBuilderOpen}
        onClose={() => {
          setRuleBuilderOpen(false);
          setEditingRule(null);
        }}
        scenario={scenario}
        rule={editingRule}
        onSave={() => {
          setRuleBuilderOpen(false);
          setEditingRule(null);
          loadScenario();
        }}
      />

      {/* 删除确认对话��� */}
      <AlertDialog open={deleteDialog.show} onOpenChange={(open) => 
        !open && setDeleteDialog({ show: false, rule: null })
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除自定义规则</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除规则「{deleteDialog.rule?.ruleName}」吗？
              此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRule}>
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ScenarioConfig;
