import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  Settings,
  Target,
  MessageSquare,
  BarChart3,
  TrendingUp,
  Users,
  MousePointer,
  Power,
  PowerOff,
  Archive
} from 'lucide-react';
import {
  sampleStrategies,
  STATUS_DISPLAY_NAMES,
  EVENT_DISPLAY_NAMES,
  FIELD_DISPLAY_NAMES,
  OPERATOR_DISPLAY_NAMES,
  generateTriggerRuleSummary,
  calculateConversionRate,
  calculateInteractionRate
} from '@shared/aiMarketingStrategyData';
import { useToast } from '@/hooks/use-toast';

export default function AIMarketingStrategyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // 查找策略数据
  const strategy = sampleStrategies.find(s => s.strategyId === id);

  if (!strategy) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">策略不存在</h1>
        <Button onClick={() => navigate('/ai-marketing-strategies')}>
          返回策略列表
        </Button>
      </div>
    );
  }

  // 状态控制
  const handleStatusChange = (action: string) => {
    let message = '';
    switch (action) {
      case 'activate':
        message = `策略"${strategy.strategyName}"已启用，开始监控用户行为`;
        break;
      case 'deactivate':
        message = `策略"${strategy.strategyName}"已停用`;
        break;
      case 'archive':
        message = `策略"${strategy.strategyName}"已归档`;
        break;
    }
    
    toast({
      title: "操作成功",
      description: message
    });
  };

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

  // 获取状态颜色类
  const getStatusBadgeClass = (status: string) => {
    const colorMap = {
      'DRAFT': 'bg-gray-100 text-gray-800',
      'ACTIVE': 'bg-green-100 text-green-800', 
      'ARCHIVED': 'bg-orange-100 text-orange-800'
    };
    return colorMap[status as keyof typeof colorMap] || 'bg-gray-100 text-gray-800';
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
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/ai-marketing-strategies')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          {/* 状态控制按钮 */}
          {strategy.status === 'DRAFT' && (
            <Button
              onClick={() => handleStatusChange('activate')}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <Power className="h-4 w-4" />
              启用策略
            </Button>
          )}
          
          {strategy.status === 'ACTIVE' && (
            <Button
              variant="outline"
              onClick={() => handleStatusChange('deactivate')}
              className="text-orange-600 border-orange-300 hover:bg-orange-50 flex items-center gap-2"
            >
              <PowerOff className="h-4 w-4" />
              停用策略
            </Button>
          )}
          
          {strategy.status === 'ARCHIVED' && (
            <Button
              onClick={() => handleStatusChange('activate')}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <Power className="h-4 w-4" />
              重新启用
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={() => navigate(`/ai-marketing-strategies/edit/${strategy.strategyId}`)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            编辑
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧主要信息 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 基础信息卡片 */}
          <Card className="bg-white rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5 text-blue-600" />
                基础信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-600">策略名称</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-medium">{strategy.strategyName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">策略状态</dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <Badge className={getStatusBadgeClass(strategy.status)}>
                      {STATUS_DISPLAY_NAMES[strategy.status]}
                    </Badge>
                    {strategy.status === 'ACTIVE' && (
                      <div className="flex items-center gap-1 text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs">运行中</span>
                      </div>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">策略ID</dt>
                  <dd className="mt-1 text-sm text-gray-600 font-mono">{strategy.strategyId}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">创建时间</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(strategy.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">更新时间</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(strategy.updatedAt)}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-sm font-medium text-gray-600">业务用途</dt>
                  <dd className="mt-1 text-sm text-gray-900">{strategy.actionPurpose}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* 触发规则详情 */}
          <Card className="bg-white rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-purple-600" />
                触发规则详情
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-600 mb-2">规则摘要</dt>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900 font-medium">
                      {generateTriggerRuleSummary(strategy.triggerRule)}
                    </p>
                  </div>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-600 mb-2">触发事件</dt>
                  <dd className="text-sm text-gray-900">
                    {EVENT_DISPLAY_NAMES[strategy.triggerRule.config.eventName]}
                  </dd>
                </div>

                {strategy.triggerRule.config.conditions.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-600 mb-2">过滤条件</dt>
                    <div className="space-y-2">
                      {strategy.triggerRule.config.conditions.map((condition, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          <span className="font-medium">
                            {FIELD_DISPLAY_NAMES[condition.field]}
                          </span>
                          <span className="text-gray-500">
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
          <Card className="bg-white rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-green-600" />
                基础弹窗配置
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-600">弹窗标题</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-medium">
                      {strategy.baseActionParameters.title}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">按钮文字</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {strategy.baseActionParameters.buttonText}
                    </dd>
                  </div>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">弹窗正文</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {strategy.baseActionParameters.bodyText}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">跳转链接</dt>
                  <dd className="mt-1 text-sm text-gray-600 font-mono">
                    {strategy.baseActionParameters.buttonUrl}
                  </dd>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧效果统计 */}
        <div className="space-y-6">
          {/* 核心指标卡片 */}
          <Card className="bg-white rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                核心指标
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-600">执行次数</div>
                      <div className="text-xs text-gray-500">策略触发总次数</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {formatNumber(strategy.totalExecutions)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <MousePointer className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-600">互动次数</div>
                      <div className="text-xs text-gray-500">用户点击互动数</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {formatNumber(strategy.totalInteractions)}
                    </div>
                    <div className="text-xs text-green-600">
                      {calculateInteractionRate(strategy.totalExecutions, strategy.totalInteractions)}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-600">转化数</div>
                      <div className="text-xs text-gray-500">最终完成转化数</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {formatNumber(strategy.totalConversions)}
                    </div>
                    <div className="text-xs text-purple-600">
                      {calculateConversionRate(strategy.totalExecutions, strategy.totalConversions)}%
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 策略状态说明 */}
          <Card className="bg-white rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">策略状态说明</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                {strategy.status === 'DRAFT' && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-900 mb-1">草稿状态</div>
                    <div className="text-gray-600">
                      策略尚未启用，不会监控用户行为。您可以继续编辑配置或启用策略。
                    </div>
                  </div>
                )}
                
                {strategy.status === 'ACTIVE' && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="font-medium text-green-900 mb-1">生效中</div>
                    <div className="text-green-700">
                      策略正在7×24小时监控用户行为，一旦触发规则命中，AI将立即进行个性化决策。
                    </div>
                  </div>
                )}
                
                {strategy.status === 'ARCHIVED' && (
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="font-medium text-orange-900 mb-1">已归档</div>
                    <div className="text-orange-700">
                      策略已停用，不再监控用户行为。历史数据保持可见，可随时重新启用。
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI工作原理说明 */}
          <Card className="bg-white rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">AI工作原理</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 mt-0.5">
                    1
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">规则监控</div>
                    <div>实时监控用户行为，检测是否命中触发规则</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-600 mt-0.5">
                    2
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">画像分析</div>
                    <div>分析用户完整画像和历史行为数据</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-600 mt-0.5">
                    3
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">智能决策</div>
                    <div>基于业务用途自主选择最佳策略</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-600 mt-0.5">
                    4
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">个性化执行</div>
                    <div>生成个性化弹窗内容并执行</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
