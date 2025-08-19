import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Lightbulb, 
  BookOpen,
  ArrowRight,
  Target,
  Clock,
  Users
} from 'lucide-react';

interface ConflictExample {
  title: string;
  description: string;
  type: 'good' | 'bad' | 'warning';
  rules: Array<{
    name: string;
    condition: string;
    action: string;
  }>;
  issue?: string;
  solution?: string;
}

const RuleConflictGuide = () => {
  const conflictExamples: ConflictExample[] = [
    {
      title: "✅ 良好实践：条件分层",
      description: "通过不同层级的条件避免重叠",
      type: 'good',
      rules: [
        {
          name: "新用户欢迎",
          condition: "注册时间 < 24小时",
          action: "显示欢迎弹窗"
        },
        {
          name: "活跃用户奖励", 
          condition: "注册时间 > 7天 AND 活跃度 > 80%",
          action: "显示积分奖励"
        }
      ]
    },
    {
      title: "❌ 冲突案例：条件重叠",
      description: "两个规则的触发条件存在重叠",
      type: 'bad',
      rules: [
        {
          name: "购买提醒A",
          condition: "浏览时间 > 3分钟",
          action: "显示优惠券弹窗"
        },
        {
          name: "购买提醒B",
          condition: "浏览时间 > 2分钟 AND 查看商品 > 1个",
          action: "显示限时折扣"
        }
      ],
      issue: "当用户浏览时间超过3分钟且查看了商品时，两个弹窗可能同时触发",
      solution: "调整条件或合并规则，或设置互斥优先级"
    },
    {
      title: "⚠️ 注意事项：优先级问题",
      description: "相同优先级可能导致执行顺序不确定",
      type: 'warning',
      rules: [
        {
          name: "VIP专享",
          condition: "用户等级 = VIP",
          action: "显示专属活动"
        },
        {
          name: "生日特惠",
          condition: "今天是生日",
          action: "显示生日礼品"
        }
      ],
      issue: "VIP用户在生日当天可能触发两个规则，优先级设置不当会影响用户体验",
      solution: "明确设置优先级，或创建复合条件规则"
    }
  ];

  const bestPractices = [
    {
      icon: <Target className="h-5 w-5 text-blue-500" />,
      title: "明确规则目标",
      description: "每个规则都应该有明确的营销目标和用户群体定位",
      tips: [
        "为规则设置清晰的命名规范",
        "在规则描述中说明预期效果",
        "定期审查规则是否达到预期目标"
      ]
    },
    {
      icon: <Clock className="h-5 w-5 text-green-500" />,
      title: "合理设置优先级",
      description: "建立清晰的优先级体系，确保重要规则优先执行",
      tips: [
        "关键业务规则设置高优先级",
        "避免相同优先级的规则",
        "定期调整优先级顺序"
      ]
    },
    {
      icon: <Users className="h-5 w-5 text-purple-500" />,
      title: "用户体验优先",
      description: "避免在短时间内向用户展示多个营销内容",
      tips: [
        "设置规则触发间隔",
        "限制同类型营销内容的频次",
        "考虑用户的整体体验路径"
      ]
    }
  ];

  const getExampleIcon = (type: ConflictExample['type']) => {
    switch (type) {
      case 'good':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'bad':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getExampleBadge = (type: ConflictExample['type']) => {
    switch (type) {
      case 'good':
        return <Badge variant="default" className="bg-green-100 text-green-800">推荐</Badge>;
      case 'bad':
        return <Badge variant="destructive">避免</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">注意</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          规则冲突预防指南
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="examples" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="examples">实例演示</TabsTrigger>
            <TabsTrigger value="practices">最佳实践</TabsTrigger>
            <TabsTrigger value="checklist">检查清单</TabsTrigger>
          </TabsList>

          <TabsContent value="examples" className="space-y-4">
            {conflictExamples.map((example, index) => (
              <Card key={index} className="border-l-4 border-l-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getExampleIcon(example.type)}
                      <h4 className="font-medium">{example.title}</h4>
                    </div>
                    {getExampleBadge(example.type)}
                  </div>
                  <p className="text-sm text-muted-foreground">{example.description}</p>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {/* 规则展示 */}
                  <div className="space-y-2">
                    {example.rules.map((rule, ruleIndex) => (
                      <div key={ruleIndex} className="border rounded-lg p-3 bg-gray-50">
                        <div className="font-medium text-sm">{rule.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          <span className="font-medium">条件：</span>{rule.condition}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">动作：</span>{rule.action}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 问题和解决方案 */}
                  {example.issue && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <AlertDescription className="text-sm">
                        <strong>问题：</strong>{example.issue}
                      </AlertDescription>
                    </Alert>
                  )}

                  {example.solution && (
                    <Alert className="border-blue-200 bg-blue-50">
                      <Lightbulb className="h-4 w-4 text-blue-500" />
                      <AlertDescription className="text-sm">
                        <strong>解决方案：</strong>{example.solution}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="practices" className="space-y-4">
            {bestPractices.map((practice, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    {practice.icon}
                    <div>
                      <h4 className="font-medium">{practice.title}</h4>
                      <p className="text-sm text-muted-foreground">{practice.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {practice.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start gap-2 text-sm">
                        <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="checklist" className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                创建新规则前，请检查以下项目以避免潜在冲突：
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              {[
                "规则名称是否清晰描述了其功能",
                "触发条件是否与现有规则重叠",
                "优先级设置是否合理",
                "响应动作是否会与其他规则冲突",
                "是否考虑了用户体验的连贯性",
                "规则是否有明确的停用条件",
                "是否设置了合适的触发频率限制",
                "规则的预期效果是否与业务目标一致"
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <Lightbulb className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-sm">
                <strong>提示：</strong>建议在每次创建或修改规则后使用系统的自动冲突检测功能进行验证。
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RuleConflictGuide;
