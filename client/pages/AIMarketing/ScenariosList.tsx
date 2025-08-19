import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AlertTriangle,
  Settings,
  Users,
  ShoppingCart,
  Eye,
  LogIn,
  Bot,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  MarketingScenario,
  getMarketingScenarios,
  updateMarketingScenario,
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
    default:
      return <Settings className="h-5 w-5" />;
  }
};

const ScenariosList = () => {
  const [scenarios, setScenarios] = useState<MarketingScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [switchingScenario, setSwitchingScenario] = useState<string | null>(
    null,
  );
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    scenario: MarketingScenario | null;
    newState: boolean;
  }>({ show: false, scenario: null, newState: false });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      const data = await getMarketingScenarios();
      // 排序：启用的在前，暂停的在后，同类型内按更新时间倒序
      const sortedData = data.sort((a, b) => {
        // 首先按启用状态排序（启用的在前）
        if (a.isAIEnabled !== b.isAIEnabled) {
          return b.isAIEnabled ? 1 : -1;
        }
        // 同样状态内按更新时间倒序（假设有updatedAt字���，这里用场景ID模拟）
        return a.scenarioId > b.scenarioId ? -1 : 1;
      });
      setScenarios(sortedData);
    } catch (error) {
      toast({
        title: "加载失败",
        description: "无法加载营销场景列表，请刷新页面重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAIToggle = (scenario: MarketingScenario, newState: boolean) => {
    setConfirmDialog({
      show: true,
      scenario,
      newState,
    });
  };

  const confirmAIToggle = async () => {
    const { scenario, newState } = confirmDialog;
    if (!scenario) return;

    setSwitchingScenario(scenario.scenarioId);

    try {
      await updateMarketingScenario(scenario.scenarioId, {
        isAIEnabled: newState,
      });

      setScenarios((prev) => {
        const updated = prev.map((s) =>
          s.scenarioId === scenario.scenarioId
            ? { ...s, isAIEnabled: newState }
            : s,
        );
        // 重新排序：启用的在前，暂停的在��
        return updated.sort((a, b) => {
          if (a.isAIEnabled !== b.isAIEnabled) {
            return b.isAIEnabled ? 1 : -1;
          }
          return a.scenarioId > b.scenarioId ? -1 : 1;
        });
      });

      toast({
        title: newState ? "AI自动化已启动" : "AI自动化已暂停",
        description: `${scenario.scenarioName}场景的自动化营销已${newState ? "启动" : "暂停"}`,
      });
    } catch (error) {
      toast({
        title: "操作失败",
        description: "无法更新AI开关状态，请重试",
        variant: "destructive",
      });
    } finally {
      setSwitchingScenario(null);
      setConfirmDialog({ show: false, scenario: null, newState: false });
    }
  };

  const getEnabledRulesCount = (scenario: MarketingScenario) => {
    return scenario.overrideRules.filter((rule) => rule.isEnabled).length;
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {scenarios.map((scenario) => {
          const enabledRulesCount = getEnabledRulesCount(scenario);
          const isSwitching = switchingScenario === scenario.scenarioId;

          return (
            <Card
              key={scenario.scenarioId}
              className={`relative cursor-pointer hover:shadow-md transition-shadow ${!scenario.isAIEnabled ? "opacity-60 border-muted" : ""}`}
              onClick={() =>
                navigate(`/ai-marketing/scenarios/${scenario.scenarioId}`)
              }
            >
              <CardHeader className="pb-4">
                {/* 顶部：场景名称和开关 */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      {getScenarioIcon(scenario.scenarioId)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold">
                        {scenario.scenarioName}
                      </CardTitle>
                    </div>
                  </div>
                  <div
                    className="flex-shrink-0 ml-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Switch
                      checked={scenario.isAIEnabled}
                      onCheckedChange={(checked) =>
                        handleAIToggle(scenario, checked)
                      }
                      disabled={isSwitching}
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* AI策略配置 - 主要区域 */}
                <div className="bg-muted/30 rounded-lg p-4">
                  {/* 顶部标题栏 - 左右分布 */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">AI策略配置</span>
                    </div>
                    <Badge
                      variant={enabledRulesCount > 0 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      自定义 {enabledRulesCount}/{scenario.overrideRules.length}
                    </Badge>
                  </div>

                  {/* AI策略配置内容 */}
                  <div className="space-y-3">
                    {/* 业务价值说明 */}
                    <div className="text-xs text-muted-foreground border-l-2 border-primary/20 pl-2">
                      {scenario.businessValue}
                    </div>

                    {/* 策略摘要 */}
                    <div className="text-xs text-muted-foreground">
                      {scenario.defaultAIConfig.strategySummary}
                    </div>

                    {/* 核心策略 */}
                    <div className="flex gap-1 flex-wrap">
                      {scenario.defaultAIConfig.coreStrategies.map(
                        (strategy, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {strategy}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 确认对话框 */}
      <AlertDialog
        open={confirmDialog.show}
        onOpenChange={(open) =>
          !open &&
          setConfirmDialog({ show: false, scenario: null, newState: false })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.newState ? "启动" : "暂停"}AI自动化
            </AlertDialogTitle>
            <AlertDialogDescription>
              您确定要{confirmDialog.newState ? "启动" : "暂停"}「
              {confirmDialog.scenario?.scenarioName}」场景下的所有自动化营销吗？
              {confirmDialog.newState
                ? ""
                : " 这将同时暂停默认AI策略和所有自定义规则。"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAIToggle}>
              确认{confirmDialog.newState ? "启动" : "暂停"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ScenariosList;
