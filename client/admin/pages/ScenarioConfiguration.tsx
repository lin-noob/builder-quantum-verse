import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  ChevronDown, 
  ChevronRight,
  Brain,
  Zap,
  Users,
  Target,
  BarChart3,
  Clock,
  Mail,
  MessageSquare,
  Smartphone,
  CheckCircle2,
  XCircle,
  PlayCircle,
  PauseCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  MarketingScenario,
  ActionType,
  TimingStrategy,
  ContentStrategy,
  getMarketingScenarios,
  updateMarketingScenario
} from '../../../shared/aiMarketingScenarioData';

export default function ScenarioConfiguration() {
  const [scenarios, setScenarios] = useState<MarketingScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<MarketingScenario | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [expandedScenarios, setExpandedScenarios] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      const data = await getMarketingScenarios();
      setScenarios(data);
    } catch (error) {
      console.error('Failed to load scenarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionTypeIcon = (type: ActionType) => {
    switch (type) {
      case 'POPUP':
        return <MessageSquare className="h-4 w-4" />;
      case 'EMAIL':
        return <Mail className="h-4 w-4" />;
      case 'SMS':
        return <Smartphone className="h-4 w-4" />;
    }
  };

  const getActionTypeBadge = (type: ActionType) => {
    const config = {
      POPUP: { label: '网页弹窗', className: 'bg-blue-100 text-blue-800' },
      EMAIL: { label: '发送邮件', className: 'bg-green-100 text-green-800' },
      SMS: { label: '短信通知', className: 'bg-purple-100 text-purple-800' }
    };
    const { label, className } = config[type];
    return <Badge className={className}>{label}</Badge>;
  };

  const getTimingStrategyBadge = (strategy: TimingStrategy) => {
    const config = {
      IMMEDIATE: { label: '立即触发', className: 'bg-red-100 text-red-800' },
      SMART_DELAY: { label: '智能延迟', className: 'bg-yellow-100 text-yellow-800' }
    };
    const { label, className } = config[strategy];
    return <Badge className={className}>{label}</Badge>;
  };

  const getContentStrategyBadge = (strategy: ContentStrategy) => {
    const config = {
      FULLY_GENERATIVE: { label: '完全生成', className: 'bg-indigo-100 text-indigo-800' },
      STATIC: { label: '静态模板', className: 'bg-gray-100 text-gray-800' },
      AI_ASSISTED: { label: 'AI辅助', className: 'bg-teal-100 text-teal-800' }
    };
    const { label, className } = config[strategy];
    return <Badge className={className}>{label}</Badge>;
  };

  const toggleScenarioExpansion = (scenarioId: string) => {
    const newExpanded = new Set(expandedScenarios);
    if (newExpanded.has(scenarioId)) {
      newExpanded.delete(scenarioId);
    } else {
      newExpanded.add(scenarioId);
    }
    setExpandedScenarios(newExpanded);
  };

  const handleToggleScenario = async (scenario: MarketingScenario) => {
    try {
      const updated = await updateMarketingScenario(scenario.scenarioId, {
        isAIEnabled: !scenario.isAIEnabled,
        updatedAt: new Date().toISOString()
      });
      
      if (updated) {
        setScenarios(prev => prev.map(s => 
          s.scenarioId === scenario.scenarioId 
            ? { ...s, isAIEnabled: !s.isAIEnabled }
            : s
        ));
      }
    } catch (error) {
      console.error('Failed to toggle scenario:', error);
    }
  };

  const getScenarioStats = () => {
    const totalScenarios = scenarios.length;
    const enabledScenarios = scenarios.filter(s => s.isAIEnabled).length;
    const totalRules = scenarios.reduce((sum, s) => sum + s.overrideRules.length, 0);
    const activeRules = scenarios.reduce((sum, s) => 
      sum + s.overrideRules.filter(r => r.isEnabled).length, 0
    );

    return {
      totalScenarios,
      enabledScenarios,
      totalRules,
      activeRules
    };
  };

  const stats = getScenarioStats();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">场景配置管理</h1>
          <p className="text-sm text-gray-600 mt-1">
            管理AI营销场景的启用状态、默认配置和自定义规则
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            创建自定义场景
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            全局配置
          </Button>
        </div>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总场景数</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalScenarios}</div>
            <p className="text-xs text-muted-foreground">
              {stats.enabledScenarios} 个已启用
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">启用率</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((stats.enabledScenarios / stats.totalScenarios) * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.enabledScenarios}/{stats.totalScenarios} 场景已启用
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">自定义规则</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRules}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeRules} 个规则生效中
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均配置</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalScenarios > 0 ? (stats.totalRules / stats.totalScenarios).toFixed(1) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              每场景平均规则数
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 场景列表 */}
      <Card>
        <CardHeader>
          <CardTitle>营销场景配置</CardTitle>
          <CardDescription>
            管理各种用户行为触发的AI营销场景，配置默认策略和自定义规则
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {scenarios.map((scenario) => (
            <div key={scenario.scenarioId} className="border rounded-lg">
              {/* 场景主信息 */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleScenarioExpansion(scenario.scenarioId)}
                      className="p-1"
                    >
                      {expandedScenarios.has(scenario.scenarioId) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{scenario.scenarioName}</h3>
                        {scenario.isAIEnabled ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            已启用
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">
                            <XCircle className="h-3 w-3 mr-1" />
                            已禁用
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{scenario.businessValue}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          {scenario.defaultAIConfig.allowedActionTypes.map(type => (
                            <div key={type} className="flex items-center gap-1">
                              {getActionTypeIcon(type)}
                              {getActionTypeBadge(type)}
                            </div>
                          ))}
                        </div>
                        {getTimingStrategyBadge(scenario.defaultAIConfig.timingStrategy)}
                        {getContentStrategyBadge(scenario.defaultAIConfig.contentStrategy)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {scenario.overrideRules.length} 个自定义规则
                    </span>
                    <Switch
                      checked={scenario.isAIEnabled}
                      onCheckedChange={() => handleToggleScenario(scenario)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedScenario(scenario);
                        setIsConfigDialogOpen(true);
                      }}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      配置
                    </Button>
                  </div>
                </div>
              </div>

              {/* 展开的详细信息 */}
              {expandedScenarios.has(scenario.scenarioId) && (
                <div className="border-t bg-gray-50 p-4 space-y-4">
                  {/* 默认AI策略 */}
                  <div>
                    <h4 className="font-medium mb-3">默认AI策略</h4>
                    <div className="bg-white p-4 rounded-lg border space-y-3">
                      <p className="text-sm text-gray-700">{scenario.defaultAIConfig.description}</p>
                      <div>
                        <h5 className="text-sm font-medium mb-2">策略维度:</h5>
                        <div className="space-y-2">
                          {scenario.defaultAIConfig.dimensions.map((dimension, index) => (
                            <div key={index} className="text-sm">
                              <span className="font-medium">{dimension.dimension}:</span>
                              <span className="ml-2 text-gray-600">{dimension.strategy}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium mb-2">核心策略:</h5>
                        <div className="flex flex-wrap gap-1">
                          {scenario.defaultAIConfig.coreStrategies.map((strategy, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {strategy}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 自定义规则 */}
                  {scenario.overrideRules.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">自定义规则</h4>
                      <div className="space-y-2">
                        {scenario.overrideRules.map((rule) => (
                          <div key={rule.ruleId} className="bg-white p-3 rounded-lg border">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">{rule.ruleName}</span>
                                  <Badge variant="outline" className="text-xs">
                                    优先级 {rule.priority}
                                  </Badge>
                                  {rule.isEnabled ? (
                                    <Badge className="bg-green-100 text-green-800 text-xs">
                                      <PlayCircle className="h-3 w-3 mr-1" />
                                      启用
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-gray-100 text-gray-800 text-xs">
                                      <PauseCircle className="h-3 w-3 mr-1" />
                                      禁用
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {getActionTypeBadge(rule.responseAction.actionType)}
                                {getTimingStrategyBadge(rule.responseAction.timing)}
                                {getContentStrategyBadge(rule.responseAction.contentMode)}
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 可用字段 */}
                  <div>
                    <h4 className="font-medium mb-3">可用触发字段</h4>
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <h5 className="text-sm font-medium mb-2">事件字段</h5>
                          <div className="space-y-1">
                            {scenario.availableFields.event.map((field, index) => (
                              <div key={index} className="text-xs">
                                <code className="bg-gray-100 px-1 rounded">{field.field}</code>
                                <span className="ml-1 text-gray-600">({field.label})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium mb-2">会话字段</h5>
                          <div className="space-y-1">
                            {scenario.availableFields.session.map((field, index) => (
                              <div key={index} className="text-xs">
                                <code className="bg-gray-100 px-1 rounded">{field.field}</code>
                                <span className="ml-1 text-gray-600">({field.label})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium mb-2">用户字段</h5>
                          <div className="space-y-1">
                            {scenario.availableFields.user.map((field, index) => (
                              <div key={index} className="text-xs">
                                <code className="bg-gray-100 px-1 rounded">{field.field}</code>
                                <span className="ml-1 text-gray-600">({field.label})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 场景配置对话框 */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>配置营销场景: {selectedScenario?.scenarioName}</DialogTitle>
            <DialogDescription>
              修改AI策略配置和自定义规则
            </DialogDescription>
          </DialogHeader>
          
          {selectedScenario && (
            <div className="space-y-6 py-4">
              {/* 基本设置 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">基本设置</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>场景名称</Label>
                    <Input defaultValue={selectedScenario.scenarioName} />
                  </div>
                  <div className="space-y-2">
                    <Label>业务价值</Label>
                    <Input defaultValue={selectedScenario.businessValue} />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch defaultChecked={selectedScenario.isAIEnabled} />
                  <Label>启用AI自动营销</Label>
                </div>
              </div>

              {/* AI策略配置 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">AI策略配置</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>允许的动作类型</Label>
                    <Select defaultValue={selectedScenario.defaultAIConfig.allowedActionTypes[0]}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="POPUP">网页弹窗</SelectItem>
                        <SelectItem value="EMAIL">发送邮件</SelectItem>
                        <SelectItem value="SMS">短信通知</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>触发时机</Label>
                    <Select defaultValue={selectedScenario.defaultAIConfig.timingStrategy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IMMEDIATE">立即触发</SelectItem>
                        <SelectItem value="SMART_DELAY">智能延迟</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>内容策略</Label>
                  <Select defaultValue={selectedScenario.defaultAIConfig.contentStrategy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FULLY_GENERATIVE">完全AI生成</SelectItem>
                      <SelectItem value="STATIC">静态模板</SelectItem>
                      <SelectItem value="AI_ASSISTED">AI辅助生成</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>策略描述</Label>
                  <Textarea 
                    defaultValue={selectedScenario.defaultAIConfig.description}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsConfigDialogOpen(false);
                setSelectedScenario(null);
              }}
            >
              取消
            </Button>
            <Button onClick={() => {
              // 这里应该处理保存逻辑
              setIsConfigDialogOpen(false);
              setSelectedScenario(null);
            }}>
              保存配置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
