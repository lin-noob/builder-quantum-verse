import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Edit,
  AlertTriangle,
  TrendingUp,
  Activity,
  Target,
  Bot,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { request } from "@/lib/request";
import {
  MarketingScenario,
  OverrideRule,
  DefaultAIConfig,
  updateMarketingScenario,
  updateRulePriorities,
  ActionType,
  ConditionCategory,
  ContentStrategy,
  TimingStrategy,
  TriggerConditions,
} from "../../../shared/aiMarketingScenarioData";
import useProjectStore from "@/stores/projectStore";
import { mockScenarios } from "@/admin/data/scenarioData";
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
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";

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
  id: string;
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
    return {} as DefaultAIConfig;
  }
};

// 解析用户画像条件
const parseConditions = (conditionsStr?: string): TriggerConditions => {
  try {
    if (!conditionsStr)
      return { eventConditions: [], sessionConditions: [], userConditions: [] };

    const conditions = JSON.parse(conditionsStr);
    return {
      eventConditions:
        conditions.event?.map((c: any, index: number) => ({
          id: `event_${index}`,
          category: "event" as ConditionCategory,
          field: c.field,
          operator: c.operator,
          value: c.value.toString(),
        })) || [],
      sessionConditions: [],
      userConditions:
        conditions.user?.map((c: any, index: number) => ({
          id: `user_${index}`,
          category: "user" as ConditionCategory,
          field: c.field,
          operator: c.operator,
          value: c.value.toString(),
        })) || [],
    };
  } catch {
    return { eventConditions: [], sessionConditions: [], userConditions: [] };
  }
};

// 将API规则数据转换为OverrideRule格式
const transformMarketingRuleToOverrideRule = (
  rule: MarketingSceneRule,
  index: number,
): OverrideRule => {
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
        aiPrompt: rule.instruction,
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    overrideRules:
      apiData.marketingSceneRules?.map((rule, index) =>
        transformMarketingRuleToOverrideRule(rule, index),
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

const ScenarioConfig = () => {
  const { t } = useTranslation();
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentProject } = useProjectStore();
  const lang = i18n.language || 'zh-CN';

  const [scenario, setScenario] = useState<MarketingScenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [ruleBuilderOpen, setRuleBuilderOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<OverrideRule | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    show: boolean;
    rule: OverrideRule | null;
  }>({ show: false, rule: null });
  const [aiStrategyModalOpen, setAiStrategyModalOpen] = useState(false);

  // 将 mock 数据转换为 API 数据格式
  const convertMockScenarioToApiFormat = (mockScenario: any): ApiScenarioDetail => {
    return {
      id: mockScenario.scenarioId,
      sceneName: mockScenario.scenarioName,
      status: mockScenario.isAIEnabled ? 1 : 0,
      aiStrategyConfig: JSON.stringify({
        defaultAIConfig: mockScenario.defaultAIConfig,
      }),
      gmtCreate: mockScenario.createdAt,
      gmtModified: mockScenario.updatedAt,
      nullId: false,
      marketingSceneRules: mockScenario.overrideRules?.map((rule: any, index: number) => ({
        id: rule.ruleId,
        sceneId: mockScenario.scenarioId,
        ruleName: rule.ruleName,
        triggerCondition: "",
        marketingMethod: rule.responseAction.actionType,
        marketingTiming: rule.responseAction.timing,
        contentMode: rule.responseAction.contentMode,
        popupTitle: rule.responseAction.actionConfig.title || "",
        popupContent: rule.responseAction.actionConfig.body || "",
        buttonText: rule.responseAction.actionConfig.buttonText || "",
        status: rule.isEnabled ? 1 : 0,
        instruction: rule.responseAction.actionConfig.aiPrompt || "",
        conditions: JSON.stringify({
          event: rule.triggerConditions?.eventConditions?.map((c: any) => ({
            field: c.field,
            operator: c.operator,
            value: c.value,
          })) || [],
          user: rule.triggerConditions?.userConditions?.map((c: any) => ({
            field: c.field,
            operator: c.operator,
            value: c.value,
          })) || [],
        }),
      })) || [],
    };
  };

  const loadScenario = useCallback(async () => {
    if (!scenarioId) return;

    try {
      setLoading(true);

      if (!currentProject || !currentProject.id) {
        const mockScenario = mockScenarios.find(s => s.scenarioId === scenarioId);
        if (mockScenario) {
          const apiData = convertMockScenarioToApiFormat(mockScenario);
          const data = transformApiDataToMarketingScenario(apiData);
          data.availableFields = {
            event: [],
            session: [{ field: "device_type", label: "设备类型", type: "string" }],
            user: [
              { field: "tag", label: "用户标签", type: "string" },
              { field: "user_segment", label: "用户分层", type: "string" },
              { field: "last_purchase_days", label: "距上次购买天数", type: "number" },
              { field: "total_spend", label: "累计消费", type: "number" },
            ],
          };
          setScenario(data);
        } else {
          toast({
            title: t('scenarios.config.toasts.loadFailed'),
            description: t('scenarios.config.toasts.loadFailedDesc'),
            variant: "destructive",
          });
        }
        return;
      }

      const response = await request.get(
        `/quote/api/v1/scene/view/${scenarioId}`,
      );
      const data = transformApiDataToMarketingScenario(response.data.data);
      data.availableFields = {
        event: [],
        session: [{ field: "device_type", label: "设备类型", type: "string" }],
        user: [
          { field: "tag", label: "用户标签", type: "string" },
          { field: "user_segment", label: "用户分层", type: "string" },
          { field: "last_purchase_days", label: "距上次购买天数", type: "number" },
          { field: "total_spend", label: "累计消费", type: "number" },
        ],
      };
      setScenario(data);
    } catch (error) {
      const mockScenario = mockScenarios.find(s => s.scenarioId === scenarioId);
      if (mockScenario) {
        const apiData = convertMockScenarioToApiFormat(mockScenario);
        const data = transformApiDataToMarketingScenario(apiData);
        data.availableFields = {
          event: [],
          session: [{ field: "device_type", label: "设备类型", type: "string" }],
          user: [
            { field: "tag", label: "用户标签", type: "string" },
            { field: "user_segment", label: "用户分层", type: "string" },
            { field: "last_purchase_days", label: "距上次购买天数", type: "number" },
            { field: "total_spend", label: "累计消费", type: "number" },
          ],
        };
        setScenario(data);
      } else {
        toast({
          title: t('scenarios.config.toasts.loadFailed'),
          description: t('scenarios.config.toasts.loadFailedDesc'),
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [scenarioId, currentProject, toast, t]);

  useEffect(() => {
    if (scenarioId) {
      loadScenario();
    }
  }, [scenarioId, loadScenario]);

  const handleAIToggle = async (newState: boolean) => {
    if (!scenario) return;

    try {
      if (!currentProject || !currentProject.id) {
        setScenario((prev) => (prev ? { ...prev, isAIEnabled: newState } : null));

        toast({
          title: t(newState ? 'scenarios.config.toasts.aiStarted' : 'scenarios.config.toasts.aiPaused'),
          description: t('scenarios.config.toasts.aiDesc', {
            sceneName: scenario.scenarioName,
            action: t(newState ? 'scenarios.list.toast.actionStart' : 'scenarios.list.toast.actionPause'),
          }),
        });
        return;
      }

      await updateMarketingScenario(scenario.scenarioId, {
        isAIEnabled: newState,
      });
      setScenario((prev) => (prev ? { ...prev, isAIEnabled: newState } : null));

      toast({
        title: t(newState ? 'scenarios.config.toasts.aiStarted' : 'scenarios.config.toasts.aiPaused'),
        description: t('scenarios.config.toasts.aiDesc', {
          sceneName: scenario.scenarioName,
          action: t(newState ? 'scenarios.list.toast.actionStart' : 'scenarios.list.toast.actionPause'),
        }),
      });
    } catch (error) {
      toast({
        title: t('scenarios.list.toast.failed'),
        description: t('scenarios.list.toast.failedDesc'),
        variant: "destructive",
      });
    }
  };

  const handleAIConfigSave = async (updatedConfig: DefaultAIConfig) => {
    if (!scenario) return;

    try {
      if (!currentProject || !currentProject.id) {
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
          title: t('scenarios.config.toasts.configSaved'),
          description: t('scenarios.config.toasts.configSavedDesc'),
        });
        return;
      }

      const apiData: ApiScenarioDetail = {
        id: scenarioId!,
        sceneName: scenario.scenarioName,
        status: scenario.isAIEnabled ? 1 : 0,
        aiStrategyConfig: JSON.stringify({ defaultAIConfig: updatedConfig }),
        nullId: false,
      } as any;

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
        title: t('scenarios.config.toasts.configSaved'),
        description: t('scenarios.config.toasts.configSavedDesc'),
      });
    } catch (error) {
      toast({
        title: t('scenarios.config.toasts.saveFailed'),
        description: t('scenarios.config.toasts.saveFailedDesc'),
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleRuleToggle = async (rule: OverrideRule, newState: boolean) => {
    if (!scenario) return;

    try {
      if (!currentProject || !currentProject.id) {
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
          title: t(newState ? 'scenarios.config.toasts.ruleEnabled' : 'scenarios.config.toasts.ruleDisabled'),
          description: t('scenarios.config.toasts.ruleStatusDesc', {
            ruleName: rule.ruleName,
            action: t(newState ? 'scenarios.config.toasts.actionEnabled' : 'scenarios.config.toasts.actionDisabled'),
          }),
        });
        return;
      }

      const apiData = {
        id: rule.ruleId,
        sceneId: scenario.scenarioId,
        status: newState ? 1 : 0,
        ruleName: rule.ruleName,
        triggerCondition: "",
        marketingMethod: rule.responseAction.actionType,
        marketingTiming: rule.responseAction.timing,
        contentMode: rule.responseAction.contentMode,
        popupTitle: rule.responseAction.actionConfig.title || "",
        popupContent: rule.responseAction.actionConfig.body || "",
        buttonText: rule.responseAction.actionConfig.buttonText || "",
        instruction: rule.responseAction.actionConfig.aiPrompt || "",
        conditions: JSON.stringify({
          event: rule.triggerConditions.eventConditions.map((c) => ({
            field: c.field,
            operator: c.operator,
            value: c.value,
          })),
          user: rule.triggerConditions.userConditions.map((c) => ({
            field: c.field,
            operator: c.operator,
            value: c.value,
          })),
        }),
      };

      await request.post("/quote/api/v1/scene/rule", apiData);

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
        title: t(newState ? 'scenarios.config.toasts.ruleEnabled' : 'scenarios.config.toasts.ruleDisabled'),
        description: t('scenarios.config.toasts.ruleStatusDesc', {
          ruleName: rule.ruleName,
          action: t(newState ? 'scenarios.config.toasts.actionEnabled' : 'scenarios.config.toasts.actionDisabled'),
        }),
      });
    } catch (error) {
      toast({
        title: t('scenarios.list.toast.failed'),
        description: t('scenarios.list.toast.failedDesc'),
        variant: "destructive",
      });
    }
  };

  const handleDeleteRule = async () => {
    if (!scenario || !deleteDialog.rule) return;
    try {
      if (!currentProject || !currentProject.id) {
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
          title: t('scenarios.config.toasts.deleteSuccess'),
          description: t('scenarios.config.toasts.ruleDeletedDesc', { ruleName: deleteDialog.rule.ruleName }),
        });

        setDeleteDialog({ show: false, rule: null });
        return;
      }

      await request.delete(
        `/quote/api/v1/scene/rule/${deleteDialog.rule.ruleId}`,
      );

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
        title: t('scenarios.config.toasts.deleteSuccess'),
        description: t('scenarios.config.toasts.ruleDeletedDesc', { ruleName: deleteDialog.rule.ruleName }),
      });

      setDeleteDialog({ show: false, rule: null });
    } catch (error) {
      toast({
        title: t('scenarios.config.toasts.deleteFailed'),
        description: t('scenarios.config.toasts.deleteFailedDesc'),
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !scenario) return;

    const items = Array.from(scenario.overrideRules);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setScenario((prev) => (prev ? { ...prev, overrideRules: items } : null));

    try {
      if (!currentProject || !currentProject.id) {
        toast({
          title: t('scenarios.config.toasts.priorityUpdated'),
          description: t('scenarios.config.toasts.priorityUpdatedDesc'),
        });
        return;
      }

      const priorities = items.map((rule, index) => ({
        ruleId: rule.ruleId,
        priority: index + 1,
      }));

      await updateRulePriorities(scenario.scenarioId, priorities as any);

      toast({
        title: t('scenarios.config.toasts.priorityUpdated'),
        description: t('scenarios.config.toasts.priorityUpdatedDesc'),
      });
    } catch (error) {
      loadScenario();
      toast({
        title: t('scenarios.config.toasts.priorityUpdateFailed'),
        description: t('scenarios.config.toasts.priorityUpdateFailedDesc'),
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">{t('scenarios.config.loading')}</p>
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
            <h3 className="text-lg font-medium">{t('scenarios.config.notFoundTitle')}</h3>
            <p className="text-muted-foreground">{t('scenarios.config.notFoundDesc')}</p>
          </div>
          <Button onClick={() => navigate("/ai-marketing/scenarios")}>
            {t('scenarios.config.backToList')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{scenario.scenarioName}</h1>
        <p className="text-muted-foreground mt-1">{scenario.defaultAIConfig?.strategySummary || scenario.defaultAIConfig?.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  {t('scenarios.config.aiConfigTitle')}
                </CardTitle>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAiStrategyModalOpen(true)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {t('scenarios.config.editConfig')}
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
                                  {t('scenarios.config.insight')}
                                </dt>
                                <dd className="text-sm text-foreground leading-relaxed">
                                  {dimension.reasoning}
                                </dd>
                              </div>

                              <div>
                                <dt className="text-sm font-medium text-muted-foreground mb-2">
                                  {t('scenarios.config.tracking')}
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

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{t('scenarios.config.baseInfo')}</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    {t('scenarios.config.scenarioId')}
                  </dt>
                  <dd className="mt-1 text-sm font-mono text-xs bg-muted px-2 py-1 rounded">
                    {scenario.scenarioName}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    {t('scenarios.config.aiStatus')}
                  </dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <Badge variant={scenario.isAIEnabled ? "default" : "secondary"}>
                      {scenario.isAIEnabled ? t('scenarios.config.enabled') : t('scenarios.config.disabled')}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    {t('scenarios.config.createdAt')}
                  </dt>
                  <dd className="mt-1 text-sm">
                    {new Date(scenario.createdAt).toLocaleString(lang, {
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    {t('scenarios.config.lastUpdated')}
                  </dt>
                  <dd className="mt-1 text-sm">
                    {new Date(scenario.updatedAt).toLocaleString(lang, {
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {t('scenarios.config.aiHowItWorks')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <Target className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground">{t('scenarios.config.insight')}</div>
                    <div>{t('scenarios.config.insightDesc')}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Activity className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground">{t('scenarios.config.ruleFirst')}</div>
                    <div>{t('scenarios.config.ruleFirstDesc')}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-4 w-4 text-purple-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground">{t('scenarios.config.tracking')}</div>
                    <div>{t('scenarios.config.trackingDesc')}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
          setTimeout(() => {
            loadScenario();
          }, 200);
        }}
      />

      <AIStrategyEditorModal
        open={aiStrategyModalOpen}
        onClose={() => setAiStrategyModalOpen(false)}
        defaultAIConfig={scenario.defaultAIConfig}
        onSave={handleAIConfigSave}
      />

      <AlertDialog
        open={deleteDialog.show}
        onOpenChange={(open) => !open && setDeleteDialog({ show: false, rule: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('scenarios.config.deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('scenarios.config.deleteDialog.desc', { ruleName: deleteDialog.rule?.ruleName })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('scenarios.config.deleteDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRule}>
              {t('scenarios.config.deleteDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ScenarioConfig;
