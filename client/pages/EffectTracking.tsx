import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  Filter,
  TrendingUp,
  DollarSign,
  Target,
  Bot,
  Settings,
  Eye,
  Calendar,
  ArrowRight,
  Clock,
  Zap,
  Award,
  RefreshCw,
  BarChart3,
  RotateCcw
} from 'lucide-react';
import {
  ConversionEvent,
  TouchPoint,
  mockConversionEvents,
  MARKETING_SCENARIOS,
  CONVERSION_TYPES,
  getScenarioName,
  getConversionTypeName,
  getConversionTypeIcon,
  getDecisionSourceDisplay,
  formatTimestamp,
  formatCurrency,
  calculateStats
} from '@shared/effectTrackingData';
import AdvancedDateRangePicker from '@/components/AdvancedDateRangePicker';

export default function EffectTracking() {
  // 数据状态
  const [conversionEvents, setConversionEvents] = useState<ConversionEvent[]>(mockConversionEvents);
  
  // 筛选状态
  const [searchText, setSearchText] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<string>('all');
  const [selectedDecisionSource, setSelectedDecisionSource] = useState<string>('all');
  const [selectedConversionType, setSelectedConversionType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{start: Date | null; end: Date | null}>({start: null, end: null});
  
  // 对话框状态
  const [attributionDialog, setAttributionDialog] = useState<{
    isOpen: boolean;
    conversion: ConversionEvent | null;
  }>({ isOpen: false, conversion: null });

  // 筛选逻辑
  const filteredConversions = useMemo(() => {
    return conversionEvents.filter(conversion => {
      // 搜索文本过滤
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const matchesSearch = 
          conversion.userId.toLowerCase().includes(searchLower) ||
          conversion.primaryAttribution.toLowerCase().includes(searchLower) ||
          conversion.touchpoints.some(tp => tp.sourceName.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }
      
      // 营销场景过滤
      if (selectedScenario !== 'all') {
        const hasScenario = conversion.touchpoints.some(tp => tp.scenarioId === selectedScenario);
        if (!hasScenario) return false;
      }
      
      // 决策来源过滤
      if (selectedDecisionSource !== 'all') {
        const hasSource = conversion.touchpoints.some(tp => tp.decisionSource === selectedDecisionSource);
        if (!hasSource) return false;
      }
      
      // 转化类型过滤
      if (selectedConversionType !== 'all' && conversion.conversionType !== selectedConversionType) {
        return false;
      }
      
      // 时间范围过滤
      if (dateRange.start || dateRange.end) {
        const conversionDate = conversion.conversionTime;
        if (dateRange.start && conversionDate < dateRange.start) return false;
        if (dateRange.end && conversionDate > dateRange.end) return false;
      }
      
      return true;
    });
  }, [conversionEvents, searchText, selectedScenario, selectedDecisionSource, selectedConversionType, dateRange]);

  // 统计数据
  const stats = useMemo(() => {
    return calculateStats(filteredConversions);
  }, [filteredConversions]);

  // 清空筛选
  const clearFilters = () => {
    setSearchText('');
    setSelectedScenario('all');
    setSelectedDecisionSource('all');
    setSelectedConversionType('all');
    setDateRange({start: null, end: null});
  };

  // 查看归因分析
  const handleViewAttribution = (conversion: ConversionEvent) => {
    setAttributionDialog({ isOpen: true, conversion });
  };

  // 获取主要归因来源的显示信息
  const getPrimaryAttributionDisplay = (conversion: ConversionEvent) => {
    // 找到权重最高的触点
    const primaryTouchpoint = conversion.touchpoints.reduce((max, tp) => 
      tp.attributionWeight > max.attributionWeight ? tp : max
    );
    
    const sourceDisplay = getDecisionSourceDisplay(primaryTouchpoint.decisionSource);
    return {
      ...sourceDisplay,
      sourceName: primaryTouchpoint.sourceName,
      weight: primaryTouchpoint.attributionWeight
    };
  };

  // 渲染转化事件
  const renderConversionEvent = (conversion: ConversionEvent) => {
    const primaryDisplay = getPrimaryAttributionDisplay(conversion);
    const conversionTypeIcon = getConversionTypeIcon(conversion.conversionType);
    const conversionTypeName = getConversionTypeName(conversion.conversionType);

    return (
      <div
        key={conversion.conversionId}
        className="p-4 border rounded-lg bg-white hover:border-gray-300 transition-all duration-200"
      >
        {/* 头部信息 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{conversionTypeIcon}</span>
              <Badge variant="outline" className="text-xs bg-gray-50">
                {conversionTypeName}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              {formatTimestamp(conversion.conversionTime)}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(conversion.conversionValue)}
            </div>
            <div className="text-xs text-gray-500">
              {conversion.touchpoints.length} 个触点
            </div>
          </div>
        </div>

        {/* 用户和主要归因 */}
        <div className="mb-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">用户:</span>
              <span className="font-medium text-gray-900">{conversion.userId}</span>
            </div>
          </div>
          
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-gray-600">主要归因来源:</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`text-xs border ${primaryDisplay.bgColor} ${primaryDisplay.color}`}
              >
                <span className="mr-1">{primaryDisplay.icon}</span>
                {primaryDisplay.text}
              </Badge>
              <span className="text-sm font-medium text-gray-900">
                {primaryDisplay.sourceName}
              </span>
              <span className="text-sm text-gray-500">
                ({primaryDisplay.weight}% 权重)
              </span>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            转化路径: {conversion.touchpoints.map(tp => getScenarioName(tp.scenarioId)).join(' → ')}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewAttribution(conversion)}
            className="flex items-center gap-1 text-xs"
          >
            <Eye className="h-3 w-3" />
            查看归因分析
          </Button>
        </div>
      </div>
    );
  };

  // 渲染触点时间轴
  const renderTouchpointTimeline = (touchpoints: TouchPoint[]) => {
    // 按时间排序
    const sortedTouchpoints = [...touchpoints].sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );

    return (
      <div className="space-y-4">
        {sortedTouchpoints.map((touchpoint, index) => {
          const sourceDisplay = getDecisionSourceDisplay(touchpoint.decisionSource);
          
          return (
            <div key={touchpoint.logId} className="flex items-start gap-3">
              {/* 时间轴标记 */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                  {index + 1}
                </div>
                {index < sortedTouchpoints.length - 1 && (
                  <div className="w-px h-6 bg-gray-300 mt-1"></div>
                )}
              </div>
              
              {/* 触点内容 */}
              <div className="flex-1 pb-2">
                {/* 头部信息 */}
                <div className="flex items-center gap-2 mb-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs border ${sourceDisplay.bgColor} ${sourceDisplay.color}`}
                  >
                    <span className="mr-1">{sourceDisplay.icon}</span>
                    {sourceDisplay.text}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {getScenarioName(touchpoint.scenarioId)}
                  </Badge>
                  <span className="text-xs text-orange-600 font-medium">
                    权重: {touchpoint.attributionWeight}%
                  </span>
                </div>
                
                {/* 来源名称 */}
                <div className="mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {touchpoint.sourceName}
                  </span>
                </div>
                
                {/* 执行动作 */}
                <div className="mb-2">
                  <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                    {touchpoint.actionTaken}
                  </div>
                </div>
                
                {/* 时间戳 */}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {touchpoint.timestamp.toLocaleString('zh-CN')}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* 核心KPI展示 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 总转化价值 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">总转化价值</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
                <p className="text-xs text-gray-500">{stats.totalConversions} 次转化</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 默认AI贡献价值 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bot className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">默认AI贡献价值</p>
                <p className="text-2xl font-bold text-blue-700">{formatCurrency(stats.aiContribution)}</p>
                <p className="text-xs text-gray-500">
                  {stats.totalValue > 0 ? ((stats.aiContribution / stats.totalValue) * 100).toFixed(1) : 0}% 占比
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 自定义规则贡献价值 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Settings className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">自定义规则贡献价值</p>
                <p className="text-2xl font-bold text-purple-700">{formatCurrency(stats.customRuleContribution)}</p>
                <p className="text-xs text-gray-500">
                  {stats.totalValue > 0 ? ((stats.customRuleContribution / stats.totalValue) * 100).toFixed(1) : 0}% 占比
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 平均转化价值 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">平均转化价值</p>
                <p className="text-2xl font-bold text-orange-700">{formatCurrency(stats.avgValue)}</p>
                <p className="text-xs text-gray-500">每次转化</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选控制区 */}
      <Card className="p-6 bg-white shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          {/* 搜索框 */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="搜索用户ID或规则名称..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 营销场景筛选 */}
          <div className="lg:w-1/5">
            <Select value={selectedScenario} onValueChange={setSelectedScenario}>
              <SelectTrigger>
                <SelectValue placeholder="营销场景" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部场景</SelectItem>
                {MARKETING_SCENARIOS.map(scenario => (
                  <SelectItem key={scenario.id} value={scenario.id}>
                    {scenario.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 决策来源筛选 */}
          <div className="lg:w-1/5">
            <Select value={selectedDecisionSource} onValueChange={setSelectedDecisionSource}>
              <SelectTrigger>
                <SelectValue placeholder="决策来源" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部来源</SelectItem>
                <SelectItem value="DEFAULT_AI">默认AI策略</SelectItem>
                <SelectItem value="CUSTOM_RULE">自定义规则</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 转化类型筛选 */}
          <div className="lg:w-1/5">
            <Select value={selectedConversionType} onValueChange={setSelectedConversionType}>
              <SelectTrigger>
                <SelectValue placeholder="转化类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                {CONVERSION_TYPES.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.icon} {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 时间范围选择器 */}
          <div className="lg:w-1/4">
            <AdvancedDateRangePicker
              value={dateRange}
              onChange={setDateRange}
            />
          </div>

          {/* 清空筛选按钮 */}
          <div className="flex items-end">
            <Button
              variant="outline"
              size="default"
              onClick={clearFilters}
              className="flex items-center gap-2 h-10"
            >
              <RotateCcw className="h-4 w-4" />
              重置
            </Button>
          </div>
        </div>
      </Card>

      {/* 转化记录列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            转化记录列表
            <Badge variant="secondary" className="ml-2">
              {filteredConversions.length} 条记录
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredConversions.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无匹配的转化记录</p>
              <p className="text-sm text-gray-400 mt-2">尝试调整筛选条件或等待新的转化数据</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredConversions.map(renderConversionEvent)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 归因分析详情对话框 */}
      <Dialog open={attributionDialog.isOpen} onOpenChange={(open) => {
        setAttributionDialog({ isOpen: open, conversion: null });
      }}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              归因分析详情
            </DialogTitle>
            <DialogDescription>
              查看完整的转化路径和归因权重分析
            </DialogDescription>
          </DialogHeader>
          
          {attributionDialog.conversion && (
            <div className="space-y-6">
              {/* 转化信息概览 */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-gray-600">目标用户</Label>
                  <p className="text-sm font-semibold">{attributionDialog.conversion.userId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">转化时间</Label>
                  <p className="text-sm">{attributionDialog.conversion.conversionTime.toLocaleString('zh-CN')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">转化类型</Label>
                  <div className="flex items-center gap-1">
                    <span>{getConversionTypeIcon(attributionDialog.conversion.conversionType)}</span>
                    <span className="text-sm">{getConversionTypeName(attributionDialog.conversion.conversionType)}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">转化价值</Label>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(attributionDialog.conversion.conversionValue)}
                  </p>
                </div>
              </div>

              {/* 主要归因来源 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">主要归因来源</h4>
                <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-900 font-medium">
                    {attributionDialog.conversion.primaryAttribution}
                  </p>
                </div>
              </div>

              {/* 用户转化路径时间轴 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">用户转化路径</h4>
                {renderTouchpointTimeline(attributionDialog.conversion.touchpoints)}
              </div>

              {/* 转化完成标记 */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">转化完成</span>
                </div>
                <div className="text-sm text-green-700">
                  <p>
                    {attributionDialog.conversion.conversionTime.toLocaleString('zh-CN')} - {' '}
                    <span className="font-semibold">
                      {formatCurrency(attributionDialog.conversion.conversionValue)}
                    </span>
                  </p>
                  <p className="mt-1">
                    转化类型: {getConversionTypeIcon(attributionDialog.conversion.conversionType)} {' '}
                    {getConversionTypeName(attributionDialog.conversion.conversionType)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
