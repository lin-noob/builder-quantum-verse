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
  Target,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  MarketingScenario,
  OverrideRule,
  getMarketingScenario,
  updateMarketingScenario,
  updateOverrideRule,
  deleteOverrideRule,
  updateRulePriorities,
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
  DropResult,
} from "@hello-pangea/dnd";
import RuleBuilderModal from "@/components/RuleBuilderModal";
import CustomRulesWithConflictManager from "@/components/CustomRulesWithConflictManager";

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

  const loadScenario = async () => {
    if (!scenarioId) return;

    try {
      setLoading(true);
      const data = await getMarketingScenario(scenarioId);
      setScenario(data);
    } catch (error) {
      console.error("Failed to load scenario:", error);
      toast({
        title: "加载失败",
        description: "无法加载场景配置",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scenarioId) {
      loadScenario();
    }
  }, [scenarioId]);

  const handleAIToggle = async (newState: boolean) => {
    if (!scenario) return;

    try {
      await updateMarketingScenario(scenario.scenarioId, {
        isAIEnabled: newState,
      });
      setScenario((prev) => (prev ? { ...prev, isAIEnabled: newState } : null));

      toast({
        title: newState ? "AI自动化已启用" : "AI自动化已暂停",
        description: `${scenario.scenarioName}场景的自动化营销已${newState ? "启动" : "暂停"}`,
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
      await updateOverrideRule(scenario.scenarioId, rule.ruleId, {
        isEnabled: newState,
      });

      setScenario((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          overrideRules: prev.overrideRules.map((r) =>
            r.ruleId === rule.ruleId ? { ...r, isEnabled: newState } : r,
          ),
        };
      });

      toast({
        title: newState ? "规则已启用" : "规则已停用",
        description: `自定义规则「${rule.ruleName}」已${newState ? "启用" : "停用"}`,
      });
    } catch (error) {
      toast({
        title: "操作失败",
        description: "规则状态更新失败",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRule = async () => {
    if (!scenario || !deleteDialog.rule) return;

    try {
      await deleteOverrideRule(scenario.scenarioId, deleteDialog.rule.ruleId);

      setScenario((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          overrideRules: prev.overrideRules.filter(
            (r) => r.ruleId !== deleteDialog.rule?.ruleId,
          ),
        };
      });

      toast({
        title: "规则已删除",
        description: `自定义规则「${deleteDialog.rule.ruleName}」已删除`,
      });

      setDeleteDialog({ show: false, rule: null });
    } catch (error) {
      toast({
        title: "删除失败",
        description: "规则删除失败",
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !scenario) return;

    const items = Array.from(scenario.overrideRules);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately for better UX
    setScenario((prev) => (prev ? { ...prev, overrideRules: items } : null));

    try {
      const priorities = items.map((rule, index) => ({
        ruleId: rule.ruleId,
        priority: index + 1,
      }));

      await updateRulePriorities(scenario.scenarioId, priorities);

      toast({
        title: "���先级已更新",
        description: "规则优先级调整成功",
      });
    } catch (error) {
      // Revert on error
      loadScenario();
      toast({
        title: "更新失败",
        description: "规则优先级更新失败",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">加载场景配置中...</p>
        </div>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-medium">场景不存在</h3>
            <p className="text-muted-foreground">指定的营销场景未找到</p>
          </div>
          <Button onClick={() => navigate("/ai-marketing/scenarios")}>
            返回场景列表
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 场景标题 */}
      <div>
        <h1 className="text-2xl font-bold">{scenario.scenarioName}</h1>
        <p className="text-muted-foreground mt-1">{scenario.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧主要内容 */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI策略配置 */}
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
                {/* 决策维度详情 */}
                <div>
                  <Tabs defaultValue="0" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      {scenario.defaultAIConfig.dimensions.map(
                        (dimension, index) => (
                          <TabsTrigger
                            key={index}
                            value={index.toString()}
                            className="text-xs"
                          >
                            {dimension.dimension}
                          </TabsTrigger>
                        ),
                      )}
                    </TabsList>

                    {scenario.defaultAIConfig.dimensions.map(
                      (dimension, index) => (
                        <TabsContent
                          key={index}
                          value={index.toString()}
                          className="mt-4"
                        >
                          <div className="border rounded-lg p-4 bg-muted/20">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium text-foreground">
                                {dimension.dimension}
                              </h4>
                              <Badge variant="outline" className="text-xs">
                                {dimension.strategy}
                              </Badge>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <dt className="text-sm font-medium text-muted-foreground mb-2">
                                  决策依据
                                </dt>
                                <dd className="text-sm text-foreground leading-relaxed">
                                  {dimension.reasoning}
                                </dd>
                              </div>

                              <div>
                                <dt className="text-sm font-medium text-muted-foreground mb-2">
                                  策略示例
                                </dt>
                                <dd className="space-y-2">
                                  {dimension.examples.map(
                                    (example, exampleIndex) => (
                                      <div
                                        key={exampleIndex}
                                        className="text-sm text-foreground bg-background/60 p-3 rounded border-l-3 border-primary/40"
                                      >
                                        {example}
                                      </div>
                                    ),
                                  )}
                                </dd>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      ),
                    )}
                  </Tabs>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 自定义规则与冲突管理 */}
          <CustomRulesWithConflictManager
            scenario={scenario}
            onAddRule={() => setRuleBuilderOpen(true)}
            onEditRule={(rule) => {
              setEditingRule(rule);
              setRuleBuilderOpen(true);
            }}
            onDeleteRule={(rule) => setDeleteDialog({ show: true, rule })}
            onToggleRule={handleRuleToggle}
            onDragEnd={handleDragEnd}
          />
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
                  <dt className="text-sm font-medium text-muted-foreground">
                    场景ID
                  </dt>
                  <dd className="mt-1 text-sm font-mono text-xs bg-muted px-2 py-1 rounded">
                    {scenario.scenarioId}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    场景名称
                  </dt>
                  <dd className="mt-1 text-sm">{scenario.scenarioName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    AI自动化状态
                  </dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <Badge
                      variant={scenario.isAIEnabled ? "default" : "secondary"}
                    >
                      {scenario.isAIEnabled ? "已启用" : "已停用"}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    业务价值
                  </dt>
                  <dd className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {scenario.businessValue}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    内容策略
                  </dt>
                  <dd className="mt-1 text-sm">
                    {scenario.defaultAIConfig.contentStrategy ===
                    "FULLY_GENERATIVE"
                      ? "完全生成"
                      : scenario.defaultAIConfig.contentStrategy ===
                          "AI_ASSISTED"
                        ? "AI辅助"
                        : "静态内容"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    时机策略
                  </dt>
                  <dd className="mt-1 text-sm">
                    {scenario.defaultAIConfig.timingStrategy === "IMMEDIATE"
                      ? "立即触发"
                      : "智能延迟"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    支持动作
                  </dt>
                  <dd className="mt-1 flex gap-1">
                    {scenario.defaultAIConfig.allowedActionTypes.map(
                      (action) => (
                        <Badge
                          key={action}
                          variant="outline"
                          className="text-xs"
                        >
                          {action === "POPUP"
                            ? "弹窗"
                            : action === "EMAIL"
                              ? "邮件"
                              : "短信"}
                        </Badge>
                      ),
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    自定义规则
                  </dt>
                  <dd className="mt-1 text-sm">
                    {scenario.overrideRules.length} 条规则
                    <span className="text-muted-foreground">
                      （
                      {scenario.overrideRules.filter((r) => r.isEnabled).length}{" "}
                      条启用）
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    可用字段
                  </dt>
                  <dd className="mt-1 text-sm">
                    事件({scenario.availableFields.event.length}) • 会话(
                    {scenario.availableFields.session.length}) • 用户(
                    {scenario.availableFields.user.length})
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    创建时间
                  </dt>
                  <dd className="mt-1 text-sm">
                    {new Date(scenario.createdAt).toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    最后更新
                  </dt>
                  <dd className="mt-1 text-sm">
                    {new Date(scenario.updatedAt).toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* AI工作原理 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                AI工作原理
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <Target className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground">智能分析</div>
                    <div>AI分析用户行为和偏好，识别最佳营销时机。</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Activity className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground">规则优先</div>
                    <div>系统优先匹配您设定的自定义规则。</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-4 w-4 text-purple-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground">效果追踪</div>
                    <div>记录所有动作效果，供您分析优化。</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
          // 延迟重新加载避免状态冲突
          setTimeout(() => {
            loadScenario();
          }, 100);
        }}
      />

      {/* 删除确认对话框 */}
      <AlertDialog
        open={deleteDialog.show}
        onOpenChange={(open) =>
          !open && setDeleteDialog({ show: false, rule: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除自定义规则</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除规则「{deleteDialog.rule?.ruleName}
              」吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRule}>
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ScenarioConfig;
