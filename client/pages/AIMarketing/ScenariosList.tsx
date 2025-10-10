import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Users,
  ShoppingCart,
  Eye,
  LogIn,
  Bot,
  CreditCard,
  CheckCircle,
  Search as SearchIcon,
  MousePointer,
  FileText,
  Plus,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DefaultAIConfig } from "../../../shared/aiMarketingScenarioData";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { request } from "@/lib/request";
import { useTranslation } from "react-i18next";

// API响应的场景数据接口
interface ApiScenario {
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
}

const getScenarioIcon = (scenarioId: string) => {
  switch (scenarioId) {
    case "add_to_cart":
      return <ShoppingCart className="h-5 w-5" />;
    case "view_product":
      return <Eye className="h-5 w-5" />;
    case "user_signup":
      return <Users className="h-5 w-5" />;
    case "user_login":
      return <LogIn className="h-5 w-5" />;
    case "start_checkout":
      return <CreditCard className="h-5 w-5" />;
    case "purchase":
      return <CheckCircle className="h-5 w-5" />;
    case "search":
      return <SearchIcon className="h-5 w-5" />;
    case "exit_intent":
      return <MousePointer className="h-5 w-5" />;
    case "submit_form":
      return <FileText className="h-5 w-5" />;
    default:
      return <Settings className="h-5 w-5" />;
  }
};

const ScenariosList = () => {
  const { t } = useTranslation();
  const [scenarios, setScenarios] = useState<ApiScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [switchingScenario, setSwitchingScenario] = useState<string | null>(
    null,
  );
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    scenario: ApiScenario | null;
    newState: boolean;
  }>({ show: false, scenario: null, newState: false });
  const [deleteDialog, setDeleteDialog] = useState<{
    show: boolean;
    scenario: ApiScenario | null;
  }>({ show: false, scenario: null });
  const [deletingScenario, setDeletingScenario] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentProject } = useProjectStore();

  // 解析AI策略配置
  const parseAIConfig = (configStr: string): DefaultAIConfig => {
    try {
      const config = JSON.parse(configStr);
      return config.defaultAIConfig || {};
    } catch {
      return {} as DefaultAIConfig;
    }
  };

  // 将 mock 数据转换为 API 数据格式
  const convertMockScenarioToApiFormat = (mockScenario: any): ApiScenario => {
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
    };
  };

  const loadScenarios = useCallback(async () => {
    try {
      // 在开发环境中或者没有currentProject时使用mock数据
      const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
      
      if (!currentProject || !currentProject.id || isDevelopment) {
        const mockApiScenarios = mockScenarios.map(convertMockScenarioToApiFormat);
        const sortedMockData = mockApiScenarios.sort((a, b) => {
          if (a.status !== b.status) {
            return b.status ? 1 : -1;
          }
          return (
            new Date(b.gmtModified).getTime() -
            new Date(a.gmtModified).getTime()
          );
        });
        setScenarios(sortedMockData);
        return;
      }

      const res = await request.post<ApiScenario[]>(
        "/quote/api/v1/scene/list",
        {
          page: 1,
          limit: 20,
        },
      );

      const scenariosData = Array.isArray(res.data.data) ? res.data.data : [];

      if (scenariosData.length === 0) {
        setScenarios([]);
        return;
      }

      const sortedData = scenariosData.sort((a, b) => {
        if (a.status !== b.status) {
          return b.status ? 1 : -1;
        }
        return (
          new Date(b.gmtModified).getTime() - new Date(a.gmtModified).getTime()
        );
      });

      setScenarios(sortedData);
    } catch (error) {
      const mockApiScenarios = mockScenarios.map(convertMockScenarioToApiFormat);
      setScenarios(
        mockApiScenarios.sort((a, b) => {
          if (a.status !== b.status) {
            return b.status ? 1 : -1;
          }
          return (
            new Date(b.gmtModified).getTime() -
            new Date(a.gmtModified).getTime()
          );
        }),
      );
    } finally {
      setLoading(false);
    }
  }, [currentProject]);

  useEffect(() => {
    loadScenarios();
  }, [loadScenarios]);

  const handleAIToggle = (scenario: ApiScenario, newState: boolean) => {
    setConfirmDialog({
      show: true,
      scenario,
      newState,
    });
  };

  const confirmAIToggle = async () => {
    const { scenario, newState } = confirmDialog;
    if (!scenario) return;

    setSwitchingScenario(scenario.id);

    try {
      const data = {
        id: scenario.id,
        status: newState ? 1 : 0,
      };

      await request.post("/quote/api/v1/scene", data);

      setScenarios((prev) => {
        const updated = prev.map((s) =>
          s.id === scenario.id ? { ...s, status: newState ? 1 : 0 } : s,
        );
        return updated.sort((a, b) => {
          if (a.status !== b.status) {
            return b.status ? 1 : -1;
          }
          return (
            new Date(b.gmtModified).getTime() -
            new Date(a.gmtModified).getTime()
          );
        });
      });

      toast({
        title: t(
          newState
            ? "scenarios.list.toast.started"
            : "scenarios.list.toast.paused",
        ),
        description: t("scenarios.list.toast.desc", {
          sceneName: scenario.sceneName,
          action: t(
            newState
              ? "scenarios.list.toast.actionStart"
              : "scenarios.list.toast.actionPause",
          ),
        }),
      });
    } catch (error) {
      toast({
        title: t("scenarios.list.toast.failed"),
        description: t("scenarios.list.toast.failedDesc"),
        variant: "destructive",
      });
    } finally {
      setSwitchingScenario(null);
      setConfirmDialog({ show: false, scenario: null, newState: false });
    }
  };

  const handleDeleteScenario = (scenario: ApiScenario) => {
    setDeleteDialog({
      show: true,
      scenario,
    });
  };

  const confirmDeleteScenario = async () => {
    const { scenario } = deleteDialog;
    if (!scenario) return;

    setDeletingScenario(scenario.id);

    try {
      // 如果是开发环境或没有项目ID，直接从本地状态删除
      if (import.meta.env.DEV || window.location.hostname === 'localhost' || !currentProject || !currentProject.id) {
        setScenarios((prev) => prev.filter((s) => s.id !== scenario.id));
        
        toast({
          title: "删除成功",
          description: `场景 "${scenario.sceneName}" 已成功删除`,
        });
      } else {
        // 生产环境调用API删除
        await request.delete(`/quote/api/v1/scene/${scenario.id}`);

        setScenarios((prev) => prev.filter((s) => s.id !== scenario.id));

        toast({
          title: "删除成功",
          description: `场景 "${scenario.sceneName}" 已成功删除`,
        });
      }
    } catch (error) {
      toast({
        title: "删除失败",
        description: "删除场景时发生错误，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setDeletingScenario(null);
      setDeleteDialog({ show: false, scenario: null });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题和新增按钮 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI营销场景</h1>
          <p className="text-muted-foreground">
            管理和配置AI营销场景，智能化您的营销策略
          </p>
        </div>
        <Button 
          onClick={() => navigate('/ai-marketing/scenarios/create')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          新增场景
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {scenarios.map((scenario) => {
          const aiConfig = parseAIConfig(scenario.aiStrategyConfig);
          const isSwitching = switchingScenario === scenario.id;

          return (
            <Card
              key={scenario.id}
              className={`relative cursor-pointer hover:shadow-md transition-shadow ${!scenario.status ? "opacity-60 border-muted" : ""}`}
              onClick={() => navigate(`/ai-marketing/scenarios/${scenario.id}`)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      {getScenarioIcon(scenario.id)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold">
                        {scenario.sceneName}
                      </CardTitle>
                    </div>
                  </div>
                  <div
                    className="flex-shrink-0 ml-4 flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Switch
                      checked={scenario.status === 1}
                      onCheckedChange={(checked) =>
                        handleAIToggle(scenario, checked)
                      }
                      disabled={isSwitching}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteScenario(scenario);
                          }}
                          className="text-red-600 focus:text-red-600"
                          disabled={deletingScenario === scenario.id}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除场景
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{t('scenarios.list.aiConfig')}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {t('scenarios.list.aiStrategy')}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs text-muted-foreground border-l-2 border-primary/20 pl-2">
                      {aiConfig.description || t('scenarios.list.noDescription')}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {aiConfig.strategySummary || t('scenarios.list.noStrategySummary')}
                    </div>

                    <div className="flex gap-1 flex-wrap">
                      {aiConfig.coreStrategies?.map((strategy, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {strategy}
                        </Badge>
                      )) || []}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AlertDialog
        open={confirmDialog.show}
        onOpenChange={(open) =>
          !open && setConfirmDialog({ show: false, scenario: null, newState: false })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.newState
                ? t('scenarios.list.confirm.titleStart')
                : t('scenarios.list.confirm.titlePause')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.newState
                ? t('scenarios.list.confirm.descStart', { sceneName: confirmDialog.scenario?.sceneName })
                : t('scenarios.list.confirm.descPause', { sceneName: confirmDialog.scenario?.sceneName })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('scenarios.list.confirm.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAIToggle}>
              {confirmDialog.newState
                ? t('scenarios.list.confirm.confirmStart')
                : t('scenarios.list.confirm.confirmPause')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 删除确认对话框 */}
      <AlertDialog
        open={deleteDialog.show}
        onOpenChange={(open) =>
          !open && setDeleteDialog({ show: false, scenario: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除场景</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除场景 "{deleteDialog.scenario?.sceneName}" 吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteScenario}
              className="bg-red-600 hover:bg-red-700"
              disabled={deletingScenario !== null}
            >
              {deletingScenario === deleteDialog.scenario?.id ? "删除中..." : "确认删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ScenariosList;
