import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical, 
  Bot, 
  AlertTriangle, 
  AlertCircle, 
  Info,
  RefreshCw,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from "@hello-pangea/dnd";
import { OverrideRule, MarketingScenario } from '../../shared/aiMarketingScenarioData';
import { RuleConflictDetector, RuleConflict } from '../services/ruleConflictDetection';
import { cn } from '@/lib/utils';

interface CustomRulesWithConflictManagerProps {
  scenario: MarketingScenario;
  onAddRule: () => void;
  onEditRule: (rule: OverrideRule) => void;
  onDeleteRule: (rule: OverrideRule) => void;
  onToggleRule: (rule: OverrideRule, enabled: boolean) => void;
  onDragEnd: (result: DropResult) => void;
}

interface RuleConflictAnalysis {
  rule: OverrideRule;
  conflicts: RuleConflict[];
  riskScore: number;
}

const CustomRulesWithConflictManager = ({
  scenario,
  onAddRule,
  onEditRule,
  onDeleteRule,
  onToggleRule,
  onDragEnd
}: CustomRulesWithConflictManagerProps) => {
  const [conflictAnalyses, setConflictAnalyses] = useState<RuleConflictAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('rules');
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());

  // 分析所有规则的冲突情况
  const analyzeAllRules = () => {
    setLoading(true);
    const detector = new RuleConflictDetector();
    const enabledRules = scenario.overrideRules.filter(rule => rule.isEnabled);
    const analyses: RuleConflictAnalysis[] = [];

    for (const rule of enabledRules) {
      const otherRules = enabledRules.filter(r => r.ruleId !== rule.ruleId);
      const result = detector.detectConflicts(rule, otherRules);
      
      analyses.push({
        rule,
        conflicts: result.conflicts,
        riskScore: result.riskScore
      });
    }

    setConflictAnalyses(analyses);
    setLoading(false);
  };

  useEffect(() => {
    if (scenario.overrideRules.length > 0) {
      // 添加延迟避免频繁调用
      const timeoutId = setTimeout(() => {
        analyzeAllRules();
      }, 200);
      return () => clearTimeout(timeoutId);
    } else {
      setConflictAnalyses([]);
    }
  }, [scenario.overrideRules]);

  // 获取总体风险评估
  const getOverallRisk = () => {
    if (conflictAnalyses.length === 0) return { level: 'low', score: 0, count: 0 };
    
    const totalScore = conflictAnalyses.reduce((sum, analysis) => sum + analysis.riskScore, 0);
    const avgScore = totalScore / conflictAnalyses.length;
    const conflictCount = conflictAnalyses.reduce((sum, analysis) => sum + analysis.conflicts.length, 0);

    let level: 'low' | 'medium' | 'high' = 'low';
    if (avgScore > 60) level = 'high';
    else if (avgScore > 30) level = 'medium';

    return { level, score: Math.round(avgScore), count: conflictCount };
  };

  const overallRisk = getOverallRisk();

  const getRiskBadgeVariant = (score: number) => {
    if (score > 60) return 'destructive';
    if (score > 30) return 'secondary';
    return 'default';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
      case 'info':
        return <Info className="h-3 w-3 text-blue-500" />;
      default:
        return <Info className="h-3 w-3 text-gray-500" />;
    }
  };

  const toggleRuleExpansion = (ruleId: string) => {
    const newExpanded = new Set(expandedRules);
    if (newExpanded.has(ruleId)) {
      newExpanded.delete(ruleId);
    } else {
      newExpanded.add(ruleId);
    }
    setExpandedRules(newExpanded);
  };

  const getRuleAnalysis = (ruleId: string) => {
    return conflictAnalyses.find(analysis => analysis.rule.ruleId === ruleId);
  };

  const formatActionType = (actionType: string) => {
    const labels: Record<string, string> = {
      'POPUP': '网页弹窗',
      'EMAIL': '邮件',
      'SMS': '短信'
    };
    return labels[actionType] || actionType;
  };

  const formatConditions = (rule: OverrideRule) => {
    const allConditions = [
      ...rule.triggerConditions.eventConditions,
      ...rule.triggerConditions.sessionConditions,
      ...rule.triggerConditions.userConditions
    ];
    
    if (allConditions.length === 0) return '无条件';
    if (allConditions.length === 1) return `${allConditions[0].field} ${allConditions[0].operator} ${allConditions[0].value}`;
    return `${allConditions.length}个条件`;
  };

  if (scenario.overrideRules.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">自定义规则</CardTitle>
            <Button onClick={onAddRule}>
              <Plus className="h-4 w-4 mr-2" />
              添加规则
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">暂无自定义规则</h3>
            <p className="text-muted-foreground mb-4">
              创建自定义规则来对特定用户群体进行精准营销
            </p>
            <Button onClick={onAddRule}>
              <Plus className="h-4 w-4 mr-2" />
              创建第一条规则
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">自定义规则</CardTitle>
          <div className="flex items-center gap-2">
            {overallRisk.count > 0 && (
              <Badge variant={getRiskBadgeVariant(overallRisk.score)} className="text-xs">
                {overallRisk.count}个冲突
              </Badge>
            )}
            <Button onClick={onAddRule}>
              <Plus className="h-4 w-4 mr-2" />
              添加规则
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rules" className="relative">
              规则列表
              {overallRisk.count > 0 && (
                <Badge variant="destructive" className="ml-2 h-4 w-4 p-0 text-xs">
                  {overallRisk.count}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="analysis">冲突分析</TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-3">
            {/* 总体状态栏 */}
            {overallRisk.count > 0 && (
              <Alert className={cn(
                "text-xs",
                overallRisk.level === 'high' && "border-red-200 bg-red-50",
                overallRisk.level === 'medium' && "border-yellow-200 bg-yellow-50",
                overallRisk.level === 'low' && "border-blue-200 bg-blue-50"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {overallRisk.level === 'high' && <AlertCircle className="h-4 w-4 text-red-500" />}
                    {overallRisk.level === 'medium' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                    {overallRisk.level === 'low' && <Info className="h-4 w-4 text-blue-500" />}
                    <AlertDescription className="text-xs">
                      检测到 {overallRisk.count} 个冲突，总体风险评分: {overallRisk.score}/100
                    </AlertDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={analyzeAllRules}
                    disabled={loading}
                    className="text-xs h-6"
                  >
                    <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
                  </Button>
                </div>
              </Alert>
            )}

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="rules">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {scenario.overrideRules.map((rule, index) => {
                      const analysis = getRuleAnalysis(rule.ruleId);
                      const isExpanded = expandedRules.has(rule.ruleId);
                      
                      return (
                        <Draggable key={rule.ruleId} draggableId={rule.ruleId} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={cn(
                                "bg-white border rounded-lg p-4 transition-shadow",
                                snapshot.isDragging && "shadow-lg",
                                analysis && analysis.conflicts.length > 0 && "border-l-4 border-l-red-300"
                              )}
                            >
                              {/* 规则基本信息 */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                  <div {...provided.dragHandleProps}>
                                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                                  </div>
                                  
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-medium">{rule.ruleName}</h4>
                                      <Badge variant="outline" className="text-xs">
                                        优先级 {rule.priority}
                                      </Badge>
                                      {analysis && analysis.conflicts.length > 0 && (
                                        <Badge variant={getRiskBadgeVariant(analysis.riskScore)} className="text-xs">
                                          {analysis.conflicts.length}个冲突
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {formatConditions(rule)} → {formatActionType(rule.responseAction.actionType)}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={rule.isEnabled}
                                    onCheckedChange={(checked) => onToggleRule(rule, checked)}
                                  />
                                  {analysis && analysis.conflicts.length > 0 && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleRuleExpansion(rule.ruleId)}
                                      className="text-xs h-6"
                                    >
                                      {isExpanded ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onEditRule(rule)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onDeleteRule(rule)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              {/* 冲突详情展开区域 */}
                              {analysis && analysis.conflicts.length > 0 && isExpanded && (
                                <div className="mt-3 pt-3 border-t space-y-2">
                                  {analysis.conflicts.map((conflict, index) => (
                                    <Alert key={index} className={cn(
                                      "text-xs",
                                      conflict.severity === 'error' && "border-red-200 bg-red-50",
                                      conflict.severity === 'warning' && "border-yellow-200 bg-yellow-50",
                                      conflict.severity === 'info' && "border-blue-200 bg-blue-50"
                                    )}>
                                      <div className="flex items-start gap-2">
                                        {getSeverityIcon(conflict.severity)}
                                        <div className="flex-1">
                                          <AlertDescription className="text-xs">
                                            {conflict.description}
                                          </AlertDescription>
                                          {conflict.suggestion && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                              建议: {conflict.suggestion}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </Alert>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            {/* 总体统计 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold">{scenario.overrideRules.filter(r => r.isEnabled).length}</div>
                <div className="text-sm text-muted-foreground">启用规则</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{overallRisk.count}</div>
                <div className="text-sm text-muted-foreground">检测到冲突</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className={cn(
                  "text-2xl font-bold",
                  overallRisk.level === 'high' && "text-red-600",
                  overallRisk.level === 'medium' && "text-yellow-600",
                  overallRisk.level === 'low' && "text-green-600"
                )}>
                  {overallRisk.level === 'high' ? '高' : overallRisk.level === 'medium' ? '中' : '低'}
                </div>
                <div className="text-sm text-muted-foreground">风险等级</div>
              </div>
            </div>

            {/* 规则详细分析 */}
            {conflictAnalyses.length > 0 ? (
              <div className="space-y-3">
                {conflictAnalyses.map((analysis) => (
                  <Card key={analysis.rule.ruleId} className="border-l-4 border-l-gray-200">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium">{analysis.rule.ruleName}</h4>
                          <Badge variant={getRiskBadgeVariant(analysis.riskScore)} className="text-xs">
                            风险: {analysis.riskScore}/100
                          </Badge>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onEditRule(analysis.rule)}
                        >
                          编辑
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {analysis.conflicts.length === 0 ? (
                        <p className="text-xs text-green-600">无冲突检测</p>
                      ) : (
                        <div className="space-y-2">
                          {analysis.conflicts.map((conflict, index) => (
                            <Alert key={index} className={cn(
                              "text-xs",
                              conflict.severity === 'error' && "border-red-200 bg-red-50",
                              conflict.severity === 'warning' && "border-yellow-200 bg-yellow-50",
                              conflict.severity === 'info' && "border-blue-200 bg-blue-50"
                            )}>
                              <div className="flex items-start gap-2">
                                {getSeverityIcon(conflict.severity)}
                                <AlertDescription className="text-xs">
                                  {conflict.description}
                                </AlertDescription>
                              </div>
                            </Alert>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  当前规则配置未检测到明显冲突。
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CustomRulesWithConflictManager;
