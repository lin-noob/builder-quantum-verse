import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft, 
  Plus, 
  Settings, 
  Edit, 
  Trash2, 
  GripVertical,
  Bot,
  Shield,
  AlertTriangle,
  Info
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  MarketingScenario,
  OverrideRule,
  getMarketingScenario,
  updateMarketingScenario,
  updateOverrideRule,
  deleteOverrideRule,
  updateRulePriorities
} from "@/../../shared/aiMarketingScenarioData";
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

// 规则构建器模态框组件（稍后实现）
const RuleBuilderModal = ({ 
  open, 
  onClose, 
  scenario, 
  rule = null,
  onSave 
}: {
  open: boolean;
  onClose: () => void;
  scenario: MarketingScenario | null;
  rule?: OverrideRule | null;
  onSave: () => void;
}) => {
  // 占位实现，稍后完善
  return null;
};

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
        title: newState ? "AI自动化已启动" : "AI自动化已暂停",
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
        description: "无法更新规则状态，请重试",
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
        description: `自定义规则「${rule.ruleName}」已���除`,
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

    // 更新本地状态
    setScenario(prev => prev ? { ...prev, overrideRules: newRules } : null);

    try {
      const ruleIds = newRules.map(rule => rule.ruleId);
      await updateRulePriorities(scenario.scenarioId, ruleIds);
      
      toast({
        title: "优先级已更新",
        description: "规则执行优先级已调整",
      });
    } catch (error) {
      // 回滚状态
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="h-6 bg-muted rounded w-48 mb-2"></div>
            <div className="h-4 bg-muted rounded w-32"></div>
          </div>
        </div>
        
        <div className="grid gap-6">
          <Card className="animate-pulse">
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

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/ai-marketing/scenarios")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">策略配置：{scenario.scenarioName}</h1>
          <p className="text-muted-foreground">{scenario.businessValue}</p>
        </div>
      </div>

      {/* AI总开关 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>AI总开关</CardTitle>
            </div>
            <Switch
              checked={scenario.isAIEnabled}
              onCheckedChange={handleAIToggle}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {scenario.isAIEnabled 
                ? "AI自动化已启动，系统将根据下方配置执行营销策略"
                : "AI自动化已暂停，所有自动化营销（包括默认AI和自定义规则）都将停止执行"
              }
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* 默认AI策略 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle>默认AI策略（兜底策略）</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            当用户的行为未满足下方任何一条自定义规则时，系统将执行此默认策略
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">允许的营销方式</label>
              <div className="flex gap-1 flex-wrap mt-1">
                {scenario.defaultAIConfig.allowedActionTypes.map((type) => (
                  <Badge key={type} variant="secondary">
                    {formatActionType(type)}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">营销时机策略</label>
              <div className="mt-1">
                <Badge variant="outline">
                  {formatTiming(scenario.defaultAIConfig.timingStrategy)}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">内容策略</label>
              <div className="mt-1">
                <Badge variant="outline">
                  {formatContentMode(scenario.defaultAIConfig.contentStrategy)}
                </Badge>
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">策略描述</label>
            <p className="text-sm mt-1">{scenario.defaultAIConfig.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* 自定义覆盖规则 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>自定义覆盖规则</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                优先级高于默认AI策略的精确规则，支持拖拽调整执行顺序
              </p>
            </div>
            <Button onClick={() => setRuleBuilderOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              添加自定义规则
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {scenario.overrideRules.length === 0 ? (
            <div className="text-center py-12">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">暂无自定义规则</h3>
              <p className="text-muted-foreground mb-4">
                创建自定义规则来对特定用户群体进行精准营销
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
                                    <span className="text-muted-foreground">响应动作：</span>
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
                                    ` 会话属性(${rule.triggerConditions.sessionConditions.length})`
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
          loadScenario(); // 重新加载数据
        }}
      />

      {/* 删除确认对话框 */}
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
