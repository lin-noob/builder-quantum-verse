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
  CreditCard,
  CheckCircle,
  Search,
  MousePointer,
  FileText,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  MarketingScenario,
  updateMarketingScenario,
  DefaultAIConfig,
} from "../../../shared/aiMarketingScenarioData";

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
import { request } from "@/lib/request";

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
      return <Search className="h-5 w-5" />;
    case "exit_intent":
      return <MousePointer className="h-5 w-5" />;
    case "submit_form":
      return <FileText className="h-5 w-5" />;
    default:
      return <Settings className="h-5 w-5" />;
  }
};

const ScenariosList = () => {
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
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadScenarios();
  }, []);

  // 解析AI策略配置
const parseAIConfig = (configStr: string): DefaultAIConfig => {
  try {
    const config = JSON.parse(configStr);
    return config.defaultAIConfig || {};
  } catch {
    return {};
  }
};

const loadScenarios = async () => {
    try {
      const res = await request.post<ApiScenario[]>(
        '/quote/api/v1/scene/list',
        {
          page: 1,
          limit: 20
        }
      );

      // 确保数据存在且为数组
      const scenariosData = Array.isArray(res.data) ? res.data : [];

      if (scenariosData.length === 0) {
        console.log('No scenarios data received, using empty array');
        setScenarios([]);
        return;
      }

      // 排序：启用的在前，暂停的在后，同类型内按更新时间倒序
      const sortedData = scenariosData.sort((a, b) => {
        // 首先按启用状态排序（启用的在前）
        if (a.status !== b.status) {
          return b.status ? 1 : -1;
        }
        // 同样状态内按更新时间倒序
        return new Date(b.gmtModified).getTime() - new Date(a.gmtModified).getTime();
      });

      setScenarios(sortedData);
    } catch (error) {
      console.error('Failed to load scenarios:', error);

      // 如果API失败，提供fallback数据供开发测试使用
      if (process.env.NODE_ENV === 'development') {
        console.log('API失败，使用fallback数据');
        const fallbackScenarios = [
          {
            id: "add_to_cart",
            sceneName: "加入购物车",
            status: 1,
            aiStrategyConfig: JSON.stringify({
              defaultAIConfig: {
                description: "AI会根据用户画像、购物车商品等信息，自主生成最合适的挽留或激励文案",
                strategySummary: "在用户犹豫或准备离开时进行精准挽留，提升订单转化率。",
                coreStrategies: ["网页弹窗", "智能延迟", "个性化生成"]
              }
            }),
            gmtCreate: "2024-01-10T10:00:00Z",
            gmtModified: "2024-01-15T14:30:00Z",
            nullId: false
          },
          {
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
            nullId: false
          },
          {
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
            nullId: false
          },
          {
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
            nullId: false
          },
          {
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
            nullId: false
          }
        ];

        setScenarios(fallbackScenarios.sort((a, b) => {
          if (a.status !== b.status) {
            return b.status ? 1 : -1;
          }
          return new Date(b.gmtModified).getTime() - new Date(a.gmtModified).getTime();
        }));

        toast({
          title: "使用演示数据",
          description: "后端服务不可用，当前显示演示数据",
          variant: "default",
        });
      } else {
        toast({
          title: "加载失败",
          description: "无法加载营销场景列表，请刷新页面重试",
          variant: "destructive",
        });
        setScenarios([]);
      }
    } finally {
      setLoading(false);
    }
  };

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
      // TODO: 这里需要调用实际的API来更新状态
      // await updateMarketingScenario(scenario.id, {
      //   status: newState ? 1 : 0,
      // });

      const data = {
        id: scenario.id,
        status: newState ? 1 : 0,
      }

      await request.post('/quote/api/v1/scene', data);

      setScenarios((prev) => {
        const updated = prev.map((s) =>
          s.id === scenario.id
            ? { ...s, status: newState ? 1 : 0 }
            : s,
        );
        // 重新排序：启用的在前，暂停的在后
        return updated.sort((a, b) => {
          if (a.status !== b.status) {
            return b.status ? 1 : -1;
          }
          return new Date(b.gmtModified).getTime() - new Date(a.gmtModified).getTime();
        });
      });

      toast({
        title: newState ? "AI自动化已启动" : "AI自动化已暂停",
        description: `${scenario.sceneName}场景的自动化营销已${newState ? "启动" : "暂停"}`,
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
          const aiConfig = parseAIConfig(scenario.aiStrategyConfig);
          const isSwitching = switchingScenario === scenario.id;

          return (
            <Card
              key={scenario.id}
              className={`relative cursor-pointer hover:shadow-md transition-shadow ${!scenario.status ? "opacity-60 border-muted" : ""}`}
              onClick={() =>
                navigate(`/ai-marketing/scenarios/${scenario.id}`)
              }
            >
              <CardHeader className="pb-4">
                {/* 顶部：场景名称和开关 */}
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
                    className="flex-shrink-0 ml-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Switch
                      checked={scenario.status === 1}
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
                      variant="secondary"
                      className="text-xs"
                    >
                      AI策略
                    </Badge>
                  </div>

                  {/* AI策略配置内容 */}
                  <div className="space-y-3">
                    {/* 业务价值说明 */}
                    <div className="text-xs text-muted-foreground border-l-2 border-primary/20 pl-2">
                      {aiConfig.description || '暂无描述'}
                    </div>

                    {/* 策略摘要 */}
                    <div className="text-xs text-muted-foreground">
                      {aiConfig.strategySummary || '暂无策略摘要'}
                    </div>

                    {/* 核心策略 */}
                    <div className="flex gap-1 flex-wrap">
                      {aiConfig.coreStrategies?.map(
                        (strategy, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {strategy}
                          </Badge>
                        ),
                      ) || []}
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
              {confirmDialog.scenario?.sceneName}」场景下的��有自动化营销吗？
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
