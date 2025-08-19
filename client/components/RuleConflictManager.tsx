import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Info, AlertCircle, RefreshCw, Settings } from 'lucide-react';
import { OverrideRule, MarketingScenario } from '../../shared/aiMarketingScenarioData';
import { RuleConflictDetector, RuleConflict, ConflictDetectionResult } from '../services/ruleConflictDetection';
import { cn } from '@/lib/utils';

interface RuleConflictManagerProps {
  scenario: MarketingScenario;
  onRuleEdit?: (rule: OverrideRule) => void;
}

interface RuleConflictAnalysis {
  rule: OverrideRule;
  conflicts: RuleConflict[];
  riskScore: number;
}

const RuleConflictManager = ({ scenario, onRuleEdit }: RuleConflictManagerProps) => {
  const [conflictAnalyses, setConflictAnalyses] = useState<RuleConflictAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

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
      analyzeAllRules();
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

  // 按冲突类型分组
  const getConflictsByType = () => {
    const typeGroups: Record<string, RuleConflict[]> = {};
    
    conflictAnalyses.forEach(analysis => {
      analysis.conflicts.forEach(conflict => {
        if (!typeGroups[conflict.type]) {
          typeGroups[conflict.type] = [];
        }
        typeGroups[conflict.type].push(conflict);
      });
    });

    return typeGroups;
  };

  const conflictsByType = getConflictsByType();

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRiskBadgeVariant = (score: number) => {
    if (score > 60) return 'destructive';
    if (score > 30) return 'secondary';
    return 'default';
  };

  if (scenario.overrideRules.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            规则冲突管理
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">当前场景暂无自定义规则</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            规则冲突管理
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant={getRiskBadgeVariant(overallRisk.score)} 
              className="text-xs"
            >
              总体风险: {overallRisk.score}/100
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={analyzeAllRules}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              {loading ? '分析中...' : '重新分析'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">总览</TabsTrigger>
            <TabsTrigger value="rules">规则详情</TabsTrigger>
            <TabsTrigger value="suggestions">建议</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* 总体状态 */}
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

            {/* 冲突类型分布 */}
            {Object.keys(conflictsByType).length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">冲突类型分布</h4>
                <div className="space-y-2">
                  {Object.entries(conflictsByType).map(([type, conflicts]) => (
                    <div key={type} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm capitalize">{type}</span>
                      <Badge variant="outline">{conflicts.length}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="rules" className="space-y-3">
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
                    {onRuleEdit && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onRuleEdit(analysis.rule)}
                      >
                        编辑
                      </Button>
                    )}
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
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-3">
            {conflictAnalyses.some(a => a.conflicts.length > 0) ? (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">优化建议</h4>
                
                {/* 通用建议 */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>规则管理最佳实践：</strong>
                    <ul className="mt-2 space-y-1 text-xs">
                      <li>• 定期审查和整理规则，删除不必要的重复规则</li>
                      <li>• 建立清晰的规则优先级体系，确保重要规则优先执行</li>
                      <li>• 监控规则执行性能，及时优化复杂规则</li>
                      <li>• 为规则命名采用统一的命名规范，便于管理</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                {/* 具体建议 */}
                {conflictAnalyses
                  .filter(a => a.conflicts.length > 0)
                  .map(analysis => (
                    <div key={analysis.rule.ruleId}>
                      <h5 className="text-sm font-medium mb-1">
                        规则 "{analysis.rule.ruleName}" 的建议：
                      </h5>
                      <div className="space-y-1">
                        {analysis.conflicts
                          .filter(c => c.suggestion)
                          .map((conflict, index) => (
                            <p key={index} className="text-xs text-muted-foreground pl-4">
                              • {conflict.suggestion}
                            </p>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  恭喜！当前规则配置未检测到明显冲突。建议定期检查以确保系统持续稳定运行。
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RuleConflictManager;
