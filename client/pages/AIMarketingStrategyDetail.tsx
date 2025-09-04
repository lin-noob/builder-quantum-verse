import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  sampleStrategies,
  STATUS_DISPLAY_NAMES,
  EXECUTION_MODE_DISPLAY_NAMES,
  EVENT_DISPLAY_NAMES,
  FIELD_DISPLAY_NAMES,
  OPERATOR_DISPLAY_NAMES,
  generateTriggerRuleSummary,
  calculateConversionRate,
  calculateInteractionRate
} from '@shared/aiMarketingStrategyData';

export default function AIMarketingStrategyDetail() {
  const { id } = useParams();

  // 查找策略数据
  const strategy = sampleStrategies.find(s => s.strategyId === id);

  if (!strategy) {
    return (
      <div className="p-6 text-center bg-background min-h-full">
        <h1 className="text-2xl font-bold text-foreground mb-4">策略不存在</h1>
      </div>
    );
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  // 格式化数字
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    } else {
      return num.toString();
    }
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-full">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧主要信息 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 基础信息卡片 */}
          <Card className="bg-background border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">
                基础信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">策略名称</dt>
                  <dd className="mt-1 text-sm text-foreground font-medium">{strategy.strategyName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">执行模式</dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {EXECUTION_MODE_DISPLAY_NAMES[strategy.executionMode]}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">策略状态</dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <span className="text-sm text-foreground">
                      {STATUS_DISPLAY_NAMES[strategy.status]}
                    </span>
                    {strategy.status === 'ACTIVE' && (
                      <div className="flex items-center gap-1 text-success">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                        <span className="text-xs">运行中</span>
                      </div>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">策略ID</dt>
                  <dd className="mt-1 text-sm text-muted-foreground font-mono">{strategy.strategyId}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">创建时间</dt>
                  <dd className="mt-1 text-sm text-foreground">{formatDate(strategy.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">更新时间</dt>
                  <dd className="mt-1 text-sm text-foreground">{formatDate(strategy.updatedAt)}</dd>
                </div>
                {strategy.executionMode === 'SEMI_AUTO' && (
                <div className="col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">业务用途</dt>
                  <dd className="mt-1 text-sm text-foreground">{strategy.actionPurpose}</dd>
                </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* 触发规则详情 */}
          <Card className="bg-background border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">
                触发规则详情
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground mb-2">规则摘要</dt>
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-sm text-foreground font-medium">
                      {generateTriggerRuleSummary(strategy.triggerRule)}
                    </p>
                  </div>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground mb-2">触发事件</dt>
                  <dd className="text-sm text-foreground">
                    {EVENT_DISPLAY_NAMES[strategy.triggerRule.config.eventName]}
                  </dd>
                </div>

                {strategy.triggerRule.config.conditions.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground mb-2">过滤条件</dt>
                    <div className="space-y-2">
                      {strategy.triggerRule.config.conditions.map((condition, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-foreground bg-muted p-2 rounded">
                          <span className="font-medium">
                            {FIELD_DISPLAY_NAMES[condition.field]}
                          </span>
                          <span className="text-muted-foreground">
                            {OPERATOR_DISPLAY_NAMES[condition.operator]}
                          </span>
                          <span className="font-medium">
                            {condition.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 基础弹窗配置 */}
          <Card className="bg-background border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">
                {strategy.executionMode === 'SEMI_AUTO' ? '基础弹窗配置' : '弹窗内容配置'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">弹窗标题</dt>
                    <dd className="mt-1 text-sm text-foreground font-medium">
                      {strategy.actionParameters.title}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">按钮文字</dt>
                    <dd className="mt-1 text-sm text-foreground">
                      {strategy.actionParameters.buttonText}
                    </dd>
                  </div>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">弹窗正文</dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {strategy.actionParameters.bodyText}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">跳转链接</dt>
                  <dd className="mt-1 text-sm text-muted-foreground font-mono">
                    {strategy.actionParameters.buttonUrl}
                  </dd>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧效果统计 */}
        <div className="space-y-6">
          {/* 核心指标卡片 */}
          <Card className="bg-background border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">
                核心指标
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">执行次数</div>
                    <div className="text-xs text-muted-foreground">策略触发总次数</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-foreground">
                      {formatNumber(strategy.totalExecutions)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">互动次数</div>
                    <div className="text-xs text-muted-foreground">用户点击互动数</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-foreground">
                      {formatNumber(strategy.totalInteractions)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">转化数</div>
                    <div className="text-xs text-muted-foreground">最终完成转化数</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-foreground">
                      {formatNumber(strategy.totalConversions)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI工作原理说明 - 只在半自动模式下显示 */}
          {strategy.executionMode === 'SEMI_AUTO' && (
          <Card className="bg-background border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">AI工作原理</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700 mt-0.5">
                    1
                  </div>
                  <div>
                    <div className="font-medium text-foreground">规则监控</div>
                    <div>实时监控用户行为，检测是否命中触发规则</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-700 mt-0.5">
                    2
                  </div>
                  <div>
                    <div className="font-medium text-foreground">画像分析</div>
                    <div>分析用户完整画像和历史行为数据</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-700 mt-0.5">
                    3
                  </div>
                  <div>
                    <div className="font-medium text-foreground">智能决策</div>
                    <div>基于业务用途自主选择最佳策略</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-700 mt-0.5">
                    4
                  </div>
                  <div>
                    <div className="font-medium text-foreground">个性化执行</div>
                    <div>生成个性化弹窗内容并执行</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          )}
        </div>
      </div>
    </div>
  );
}
