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
import { request } from "@/lib/request";
import {
  MarketingScenario,
  OverrideRule,
  DefaultAIConfig,
  updateMarketingScenario,
  updateOverrideRule,
  deleteOverrideRule,
  updateRulePriorities,
  ActionType,
  ConditionCategory,
  ContentStrategy,
  TimingStrategy,
  TriggerConditions,
} from "../../../shared/aiMarketingScenarioData";

// API响应的场景详情接口
interface ApiScenarioDetail {
  id: string;
  sceneName: string;
  status: number;
  aiStrategyConfig: string;
  gmtCreate: string;
  gmtModified: string;
  decisionBasis?: string | null;
  marketingContent?: string | null;
  marketingMethod?: string | null;
  marketingTiming?: string | null;
  nullId: boolean;
  strategyExample?: string | null;
  tenantId?: string | null;
  marketingSceneRules?: MarketingSceneRule[];
}

interface MarketingSceneRule {
  id:string;
  sceneId: string;
  ruleName: string;
  triggerCondition?: string;
  marketingMethod: string;
  marketingTiming: string;
  contentMode: string;
  popupTitle: string;
  popupContent: string;
  buttonText?: string;
  status: number;
  instruction?: string;
  conditions?: string;
}

// 解析AI策略配置
const parseAIConfig = (configStr: string): DefaultAIConfig => {
  try {
    const config = JSON.parse(configStr);
    return config.defaultAIConfig || {};
  } catch {
    return {};
  }
};

// 解析用户画像条件
const parseConditions = (conditionsStr?: string): TriggerConditions => {
  try {
    if (!conditionsStr) return { eventConditions: [], sessionConditions: [], userConditions: [] };
    
    const conditions = JSON.parse(conditionsStr);
    return {
      eventConditions: conditions.event?.map((c: any, index: number) => ({
        id: `event_${index}`,
        category: 'event' as ConditionCategory,
        field: c.field,
        operator: c.operator,
        value: c.value.toString()
      })) || [],
      sessionConditions: [],
      userConditions: conditions.user?.map((c: any, index: number) => ({
        id: `user_${index}`,
        category: 'user' as ConditionCategory,
        field: c.field,
        operator: c.operator,
        value: c.value.toString()
      })) || []
    };
  } catch {
    return { eventConditions: [], sessionConditions: [], userConditions: [] };
  }
};

// 将API规则数据转换为OverrideRule格式
const transformMarketingRuleToOverrideRule = (rule: MarketingSceneRule, index: number): OverrideRule => {
  return {
    ruleId: rule.id,
    ruleName: rule.ruleName,
    priority: index + 1,
    isEnabled: rule.status === 1,
    triggerConditions: parseConditions(rule.conditions),
    responseAction: {
      actionType: rule.marketingMethod as ActionType,
      timing: rule.marketingTiming as TimingStrategy,
      contentMode: rule.contentMode as ContentStrategy,
      actionConfig: {
        title: rule.popupTitle,
        body: rule.popupContent,
        buttonText: rule.buttonText,
        aiPrompt: rule.instruction
      }
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// 将API数据转换为MarketingScenario格式
const transformApiDataToMarketingScenario = (
  apiData: ApiScenarioDetail,
): MarketingScenario => {
  const aiConfig = parseAIConfig(apiData.aiStrategyConfig);

  return {
    scenarioId: apiData.id,
    scenarioName: apiData.sceneName,
    isAIEnabled: apiData.status === 1,
    defaultAIConfig: aiConfig,
    overrideRules: apiData.marketingSceneRules?.map((rule, index) => 
      transformMarketingRuleToOverrideRule(rule, index)
    ) || [],
    businessValue: aiConfig.description || "",
    createdAt: apiData.gmtCreate,
    updatedAt: apiData.gmtModified,
    availableFields: {
      event: [],
      session: [],
      user: [],
    },
  };
};
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
import AIStrategyEditorModal from "@/components/AIStrategyEditorModal";

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
  const [aiStrategyModalOpen, setAiStrategyModalOpen] = useState(false);

  const loadScenario = async () => {
    if (!scenarioId) return;

    try {
      setLoading(true);
      const response = await request.get(
        `/quote/api/v1/scene/view/${scenarioId}`,
      );
      const data = transformApiDataToMarketingScenario(response.data);

      data.availableFields = {
        event: [],
        session: [{ field: "device_type", label: "设备类型", type: "string" }],
        user: [
          { field: "tag", label: "用户标签", type: "string" },
          { field: "user_segment", label: "用户分层", type: "string" },
          {
            field: "last_purchase_days",
            label: "距上次购买天数",
            type: "number",
          },
          { field: "total_spend", label: "累计消费", type: "number" },
        ],
      };
      setScenario(data);
    } catch (error) {
      console.error("Failed to load scenario:", error);

      // 如果API失败，提供fallback数据供开发测试使用
      if (process.env.NODE_ENV === 'development' && scenarioId) {
        console.log('场景详情API失败，使用fallback数据');

        const fallbackScenarios: Record<string, any> = {
          "add_to_cart": {
            id: "add_to_cart",
            sceneName: "加入购物车",
            status: 1,
            aiStrategyConfig: JSON.stringify({
              defaultAIConfig: {
                allowedActionTypes: ["POPUP"],
                timingStrategy: "SMART_DELAY",
                contentStrategy: "FULLY_GENERATIVE",
                description: "AI会根据用户画像、购物车商品等信息，自主生成最合适的挽留或激励文案",
                strategySummary: "在用户犹豫或准备离开时进行精准挽留，提升订单转化率。",
                coreStrategies: ["网页弹窗", "智能延迟", "个性化生成"]
              }
            }),
            gmtCreate: "2024-01-10T10:00:00Z",
            gmtModified: "2024-01-15T14:30:00Z",
            nullId: false,
            marketingSceneRules: []
          },
          "view_product": {
            id: "view_product",
            sceneName: "商品浏览",
            status: 0,
            aiStrategyConfig: JSON.stringify({
              defaultAIConfig: {
                description: "根据用户浏览行为和商品信息，推荐相关产品或优惠",
                strategySummary: "通过智能推荐提升用户购买转化。",
                coreStrategies: ["个性化推荐", "智能营销", "精准投放"]
              }
            }),
            gmtCreate: "2024-01-08T09:00:00Z",
            gmtModified: "2024-01-12T16:20:00Z",
            nullId: false,
            marketingSceneRules: []
          },
          "user_signup": {
            id: "user_signup",
            sceneName: "用户注册",
            status: 1,
            aiStrategyConfig: JSON.stringify({
              defaultAIConfig: {
                description: "为新注册用户提供个性化欢迎内容和新手引导",
                strategySummary: "提升新用户的首次购买转化率。",
                coreStrategies: ["欢迎引导", "新手优惠", "个性化推荐"]
              }
            }),
            gmtCreate: "2024-01-05T08:30:00Z",
            gmtModified: "2024-01-20T11:45:00Z",
            nullId: false,
            marketingSceneRules: []
          },
          "purchase": {
            id: "purchase",
            sceneName: "购买完成",
            status: 1,
            aiStrategyConfig: JSON.stringify({
              defaultAIConfig: {
                description: "购买后的交叉销售和复购引导策略",
                strategySummary: "通过购买后营销提升客户生命周期价值。",
                coreStrategies: ["交叉销售", "复购引导", "会员推荐"]
              }
            }),
            gmtCreate: "2024-01-03T07:15:00Z",
            gmtModified: "2024-01-18T13:30:00Z",
            nullId: false,
            marketingSceneRules: []
          },
          "exit_intent": {
            id: "exit_intent",
            sceneName: "退出意图",
            status: 1,
            aiStrategyConfig: JSON.stringify({
              defaultAIConfig: {
                description: "检测用户退出意图，进行最后挽留尝试",
                strategySummary: "在用户即将离开时进行智能挽留。",
                coreStrategies: ["退出检测", "紧急挽留", "优惠券发放"]
              }
            }),
            gmtCreate: "2024-01-02T06:00:00Z",
            gmtModified: "2024-01-19T10:15:00Z",
            nullId: false,
            marketingSceneRules: []
          }
        };

        const fallbackData = fallbackScenarios[scenarioId];
        if (fallbackData) {
          const data = transformApiDataToMarketingScenario(fallbackData);
          data.availableFields = {
            event: [],
            session: [{ field: "device_type", label: "设备类型", type: "string" }],
            user: [
              { field: "tag", label: "用户标签", type: "string" },
              { field: "user_segment", label: "用户分层", type: "string" },
              {
                field: "last_purchase_days",
                label: "距上次购买天数",
                type: "number",
              },
              { field: "total_spend", label: "累计消费", type: "number" },
            ],
          };
          setScenario(data);

          toast({
            title: "使用演示数据",
            description: "后端服务不可用，当前显示演示数据",
            variant: "default",
          });
        } else {
          toast({
            title: "加载失败",
            description: "无法加载场景配置",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "加载失败",
          description: "无法加载场景配置",
          variant: "destructive",
        });
      }
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

  const handleAIConfigSave = async (updatedConfig: DefaultAIConfig) => {
    if (!scenario) return;

    try {
      // 构造与API返回结构相同的数据
      const apiData: ApiScenarioDetail = {
        id: scenarioId,
        sceneName: scenario.scenarioName,
        status: scenario.isAIEnabled ? 1 : 0,
        aiStrategyConfig: JSON.stringify({ defaultAIConfig: updatedConfig }),
        nullId: false,
      };

      await request.post("/quote/api/v1/scene", apiData);

      setScenario((prev) =>
        prev
          ? {
              ...prev,
              defaultAIConfig: updatedConfig,
              updatedAt: new Date().toISOString(),
            }
          : null,
      );

      toast({
        title: "配置已保存",
        description: "AI策略配置更新成功",
      });
    } catch (error) {
      toast({
        title: "保存失败",
        description: "无法保存AI策略配置，请重试",
        variant: "destructive",
      });
      throw error; // Re-throw to let the editor handle the error
    }
  };

  const handleRuleToggle = async (rule: OverrideRule, newState: boolean) => {
    if (!scenario) return;

    try {
      // 构建API请求数据
      const apiData = {
        id: rule.ruleId,
        sceneId: scenario.scenarioId,
        status: newState ? 1 : 0, // 1表示启用，0表示禁用
        // 其他字段保持不变
        ruleName: rule.ruleName,
        triggerCondition: '',
        marketingMethod: rule.responseAction.actionType,
        marketingTiming: rule.responseAction.timing,
        contentMode: rule.responseAction.contentMode,
        popupTitle: rule.responseAction.actionConfig.title || '',
        popupContent: rule.responseAction.actionConfig.body || '',
        buttonText: rule.responseAction.actionConfig.buttonText || '',
        instruction: rule.responseAction.actionConfig.aiPrompt || '',
        conditions: JSON.stringify({
          event: rule.triggerConditions.eventConditions.map(c => ({
            field: c.field,
            operator: c.operator,
            value: c.value
          })),
          user: rule.triggerConditions.userConditions.map(c => ({
            field: c.field,
            operator: c.operator,
            value: c.value
          }))
        })
      };

      // 调用编辑接口
      await request.post('/quote/api/v1/scene/rule', apiData);

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
      console.error('Toggle rule error:', error);
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
      // 使用新的删除接口
      await request.delete(`/quote/api/v1/scene/rule/${deleteDialog.rule.ruleId}`);

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
      console.error('Delete rule error:', error);
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
        title: "优先级已更新",
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
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAiStrategyModalOpen(true)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    编辑配置
                  </Button>
                  <Switch
                    checked={scenario.isAIEnabled}
                    onCheckedChange={handleAIToggle}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* 决策维度详情 - 只读展示 */}
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
              <CardTitle className="text-lg font-semibold">基础信���</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    场景ID
                  </dt>
                  <dd className="mt-1 text-sm font-mono text-xs bg-muted px-2 py-1 rounded">
                    {scenario.scenarioName}
                  </dd>
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

      {/* 规则构建器模态���� */}
      <RuleBuilderModal
        open={ruleBuilderOpen}
        onClose={() => {
          setRuleBuilderOpen(false);
          setEditingRule(null);
        }}
        scenario={scenario}
        rule={editingRule}
        onSave={() => {
          // 先关闭弹窗，再清理状态
          setRuleBuilderOpen(false);
          setEditingRule(null);
          // 增加延迟确保弹��完全关闭后再刷新数据
          setTimeout(() => {
            loadScenario();
          }, 200);
        }}
      />

      {/* AI策略编辑弹窗 */}
      <AIStrategyEditorModal
        open={aiStrategyModalOpen}
        onClose={() => setAiStrategyModalOpen(false)}
        defaultAIConfig={scenario.defaultAIConfig}
        onSave={handleAIConfigSave}
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
