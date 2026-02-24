import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle2, Clock, Play, FileText, ArrowRight, ShieldAlert, Database, BrainCircuit, Activity } from 'lucide-react';
import { Decision, ExecutionMode } from './types';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

// Mock Data Generator
const getMockDecision = (id: string): Decision => ({
  id,
  name: `DEC-${id.substring(0, 6).toUpperCase()} - 高价值用户流失预警干预`,
  type: 'MARKETING',
  source: 'EVENT',
  status: 'PENDING',
  createdAt: new Date().toISOString(),
  version: 'v1.2.0',
  context: {
    events: ['用户降级意图', '竞品比价行为'],
    objects: ['用户: U-88392', '分群: VIP 黄金会员'],
    metrics: [
      { name: 'LTV (生命周期价值)', value: '¥4,500' },
      { name: '活跃度评分', value: '85 -> 42' }
    ],
    timeRange: '过去 7 天',
    dataIntegrity: 'COMPLETE',
  },
  recommendation: {
    conclusion: '检测到 VIP 用户因近期竞品比价行为导致流失风险极高。建议立即发送挽留权益。',
    actions: [
      {
        id: 'act-1',
        name: '发送挽留邮件',
        target: { type: '邮件渠道', scope: '用户: U-88392' },
        expectedEffect: { metric: '流失概率', value: '-15%' },
        riskLevel: 'LOW',
      },
      {
        id: 'act-2',
        name: '发放优惠券',
        target: { type: '优惠券系统', scope: '20% 折扣券' },
        expectedEffect: { metric: '转化率', value: '+10%' },
        riskLevel: 'MEDIUM',
      }
    ]
  },
  reasoning: {
    evidence: [
      { name: '活跃度骤降', value: '3天内下降 50%', description: '用户访问频率显著降低。' },
      { name: '竞品信号', value: '高', description: '访问竞品比价页面 3 次。' },
      { name: '消费历史', value: '高价值', description: '去年消费排名前 5%。' }
    ],
    causality: '活跃度下降与竞品比价页面访问高度相关，提示价格敏感型流失风险。'
  }
});

const translateSource = (source: string) => {
  const map: Record<string, string> = {
    'EVENT': '事件触发',
    'RULE': '规则触发',
    'MANUAL': '人工创建',
    'SCHEDULED': '定时任务'
  };
  return map[source] || source;
};

const translateType = (type: string) => {
  const map: Record<string, string> = {
    'MARKETING': '营销',
    'RISK_CONTROL': '风控',
    'OPERATION': '运营'
  };
  return map[type] || type;
};

const translateStatus = (status: string) => {
  const map: Record<string, string> = {
    'PENDING': '待处理',
    'EXECUTED': '已执行',
    'REJECTED': '已拒绝',
    'DRAFT': '草稿'
  };
  return map[status] || status;
};

const translateIntegrity = (integrity: string) => {
  const map: Record<string, string> = {
    'COMPLETE': '完整',
    'PARTIAL': '部分缺失',
    'MISSING': '缺失'
  };
  return map[integrity] || integrity;
};

const translateRisk = (risk: string) => {
  const map: Record<string, string> = {
    'LOW': '低',
    'MEDIUM': '中',
    'HIGH': '高'
  };
  return map[risk] || risk;
};

export default function DecisionExecutionPage() {
  const { decisionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [decision, setDecision] = useState<Decision | null>(null);
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('MANUAL');
  const [scheduledTime, setScheduledTime] = useState<string>('');

  useEffect(() => {
    // Simulate API fetch
    if (decisionId) {
      setDecision(getMockDecision(decisionId));
    }
  }, [decisionId]);

  if (!decision) return <div className="p-8 flex justify-center">正在加载决策上下文...</div>;

  const handleExecute = () => {
    if (executionMode === 'AUTO_DELAYED' && !scheduledTime) {
      toast({
        title: "验证错误",
        description: "请选择延迟执行的时间。",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "决策已确认",
      description: "正在启动执行序列...",
    });

    // Simulate execution start and navigate to result
    setTimeout(() => {
      navigate(`/decision/${decisionId}/execution/exec-${Date.now()}/result`);
    }, 1000);
  };

  return (
    <div className="container mx-auto max-w-5xl py-8 space-y-6">
      {/* A. Decision Summary */}
      <Card className="bg-slate-50 border-l-4 border-l-primary">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{translateType(decision.type)}</Badge>
                <Badge className={cn(
                  "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
                  decision.status === 'EXECUTED' && "bg-green-100 text-green-800"
                )}>
                  {translateStatus(decision.status)}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">{decision.name}</h1>
              <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(decision.createdAt).toLocaleString('zh-CN')}</span>
                <span className="flex items-center gap-1"><Activity className="w-4 h-4" /> 来源: {translateSource(decision.source)}</span>
                <span>版本: {decision.version}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* C. AI Recommendation */}
          <Card className="border-primary/20 shadow-md">
            <CardHeader className="bg-primary/5 pb-4">
              <CardTitle className="flex items-center gap-2 text-primary">
                <BrainCircuit className="w-5 h-5" />
                AI 决策建议
              </CardTitle>
              <CardDescription className="text-slate-700 font-medium text-base">
                {decision.recommendation.conclusion}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {decision.recommendation.actions.map((action, idx) => (
                <div key={action.id} className="flex items-start gap-4 p-4 border rounded-lg bg-white hover:shadow-sm transition-shadow">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-slate-900">{action.name}</h3>
                      <Badge variant={action.riskLevel === 'HIGH' ? 'destructive' : action.riskLevel === 'MEDIUM' ? 'secondary' : 'outline'}>
                        风险: {translateRisk(action.riskLevel)}
                      </Badge>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div className="text-slate-600">
                        <span className="font-medium text-slate-500 block text-xs uppercase">作用对象</span>
                        {action.target.type} - {action.target.scope}
                      </div>
                      <div className="text-slate-600">
                        <span className="font-medium text-slate-500 block text-xs uppercase">预期效果</span>
                        {action.expectedEffect.metric}: <span className="text-green-600 font-bold">{action.expectedEffect.value}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* D. Reasoning / Evidence */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-500" />
                决策依据与证据
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {decision.reasoning.evidence.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-md border">
                      <div className="text-xs text-slate-500 uppercase font-medium">{item.name}</div>
                      <div className="text-lg font-bold text-slate-800 my-1">{item.value}</div>
                      <div className="text-xs text-slate-400">{item.description}</div>
                    </div>
                  ))}
                </div>
                {decision.reasoning.causality && (
                  <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-md border border-blue-100 flex gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {decision.reasoning.causality}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
           {/* B. Decision Context */}
           <Accordion type="single" collapsible defaultValue="context" className="w-full">
            <AccordionItem value="context" className="border rounded-lg bg-white px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-slate-500" />
                  <span>决策背景数据</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase">数据完整性</div>
                  <Badge variant="outline" className={cn(
                    "text-xs",
                    decision.context.dataIntegrity === 'COMPLETE' ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200"
                  )}>
                    {translateIntegrity(decision.context.dataIntegrity)}
                  </Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase">输入事件</div>
                  <ul className="text-sm list-disc list-inside text-slate-600">
                    {decision.context.events.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase">对象实例</div>
                  <ul className="text-sm list-disc list-inside text-slate-600">
                    {decision.context.objects.map((o, i) => <li key={i}>{o}</li>)}
                  </ul>
                </div>
                <Separator />
                <div className="space-y-2">
                   <div className="text-xs font-semibold text-slate-500 uppercase">核心指标</div>
                   <div className="grid grid-cols-2 gap-2">
                      {decision.context.metrics.map((m, i) => (
                        <div key={i} className="text-sm border p-2 rounded">
                          <div className="text-xs text-slate-400">{m.name}</div>
                          <div className="font-mono">{m.value}</div>
                        </div>
                      ))}
                   </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* E. Execution Mode */}
          <Card className="border-2 border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">执行方式选择</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={executionMode} onValueChange={(v) => setExecutionMode(v as ExecutionMode)}>
                <div className="flex items-start space-x-2 p-2 rounded hover:bg-slate-50">
                  <RadioGroupItem value="MANUAL" id="manual" className="mt-1" />
                  <Label htmlFor="manual" className="cursor-pointer">
                    <div className="font-medium">人工确认后执行</div>
                    <div className="text-xs text-slate-500">每一步都需要人工确认</div>
                  </Label>
                </div>
                <div className="flex items-start space-x-2 p-2 rounded hover:bg-slate-50">
                  <RadioGroupItem value="AUTO_IMMEDIATE" id="auto_now" className="mt-1" />
                  <Label htmlFor="auto_now" className="cursor-pointer">
                    <div className="font-medium">自动执行 (立即)</div>
                    <div className="text-xs text-slate-500">立即执行所有动作</div>
                  </Label>
                </div>
                <div className="flex items-start space-x-2 p-2 rounded hover:bg-slate-50">
                  <RadioGroupItem value="AUTO_DELAYED" id="auto_delay" className="mt-1" />
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="auto_delay" className="cursor-pointer">
                      <div className="font-medium">自动执行 (延迟)</div>
                    </Label>
                    {executionMode === 'AUTO_DELAYED' && (
                      <Input 
                        type="datetime-local" 
                        value={scheduledTime} 
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="h-8 text-xs"
                      />
                    )}
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 pt-2">
              <Button className="w-full" size="lg" onClick={handleExecute}>
                <Play className="w-4 h-4 mr-2" />
                确认并执行
              </Button>
              <div className="flex w-full gap-2">
                <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>取消</Button>
                <Button variant="secondary" className="flex-1">保存为草稿</Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
