import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, XCircle, AlertTriangle, ArrowRight, Activity, 
  BarChart3, RefreshCw, Copy, FilePlus, ChevronRight, ChevronDown 
} from 'lucide-react';
import { ExecutionRecord, ExecutionStatus } from './types';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// Mock Data Generator
const getMockExecution = (id: string, decisionId: string): ExecutionRecord => ({
  id,
  decisionId,
  status: 'COMPLETED',
  mode: 'AUTO_IMMEDIATE',
  startTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  endTime: new Date(Date.now() - 3500000).toISOString(),
  executor: 'System Bot',
  actionResults: [
    {
      actionId: 'act-1',
      name: '发送挽留邮件',
      target: '用户: U-88392',
      status: 'SUCCESS',
      message: '邮件已通过 SendGrid API 发送。MessageID: sg_882910',
      details: { provider: 'SendGrid', templateId: 'tpl_retention_v2', delivered: true }
    },
    {
      actionId: 'act-2',
      name: '发放优惠券',
      target: '优惠券系统',
      status: 'SUCCESS',
      message: '优惠券代码 VIP20 已发放至钱包。',
      details: { code: 'VIP20', expiry: '7天' }
    }
  ],
  metrics: {
    observationPeriod: 'SHORT', // Short term observation
    snapshots: [
      { name: '流失概率', before: 0.85, after: 0.65, unit: '%' },
      { name: '会话时长', before: 120, after: 340, unit: 's' },
      { name: '点击率 (CTR)', before: 0.02, after: 0.08, unit: '%' }
    ]
  },
  aiEvaluation: {
    isExpected: true,
    recommendation: 'CONTINUE',
    deviationReason: '用户初始响应强度高于模型基线预测。'
  },
  nextActions: {
    aiRecommended: '建议继续观察 24 小时，如无购买行为则追加推送通知。'
  }
});

const translateStatus = (status: string) => {
  const map: Record<string, string> = {
    'COMPLETED': '已完成',
    'RUNNING': '执行中',
    'FAILED': '失败',
    'PARTIAL_FAILED': '部分失败',
    'PENDING': '等待中',
    'SUCCESS': '成功'
  };
  return map[status] || status;
};

const translateMode = (mode: string) => {
  const map: Record<string, string> = {
    'AUTO_IMMEDIATE': '自动 (立即执行)',
    'MANUAL_APPROVAL': '人工审批',
    'SCHEDULED': '定时执行'
  };
  return map[mode] || mode;
};

const translateRecommendation = (rec: string) => {
   const map: Record<string, string> = {
    'CONTINUE': '继续执行',
    'STOP': '停止',
    'ROLLBACK': '回滚'
  };
  return map[rec] || rec;
}

export default function ExecutionResultPage() {
  const { decisionId, executionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [execution, setExecution] = useState<ExecutionRecord | null>(null);
  const [expandedAction, setExpandedAction] = useState<string | null>(null);

  useEffect(() => {
    if (executionId && decisionId) {
      setExecution(getMockExecution(executionId, decisionId));
    }
  }, [executionId, decisionId]);

  if (!execution) return <div className="p-8 flex justify-center">正在加载执行结果...</div>;

  const getStatusColor = (status: ExecutionStatus) => {
    switch (status) {
      case 'COMPLETED': return "bg-green-100 text-green-800 border-green-200";
      case 'RUNNING': return "bg-blue-100 text-blue-800 border-blue-200";
      case 'FAILED': return "bg-red-100 text-red-800 border-red-200";
      case 'PARTIAL_FAILED': return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="container mx-auto max-w-5xl py-8 space-y-6">
      {/* A. Execution Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
               <h1 className="text-2xl font-bold flex items-center gap-2">
                执行结果详情
                <Badge variant="outline" className={getStatusColor(execution.status)}>
                  {translateStatus(execution.status)}
                </Badge>
              </h1>
              <div className="flex gap-4 text-sm text-slate-500">
                <span>执行 ID: {execution.id}</span>
                <span>模式: {translateMode(execution.mode)}</span>
                <span>执行人: {execution.executor}</span>
              </div>
            </div>
            <div className="text-right text-sm text-slate-500">
              <div>开始时间: {new Date(execution.startTime).toLocaleString('zh-CN')}</div>
              {execution.endTime && <div>结束时间: {new Date(execution.endTime).toLocaleString('zh-CN')}</div>}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* B. Action Execution List */}
          <Card>
             <CardHeader>
               <CardTitle className="text-lg">执行动作明细</CardTitle>
             </CardHeader>
             <CardContent className="p-0">
               <div className="divide-y">
                 {execution.actionResults.map((action) => (
                   <Collapsible 
                    key={action.actionId} 
                    open={expandedAction === action.actionId}
                    onOpenChange={() => setExpandedAction(expandedAction === action.actionId ? null : action.actionId)}
                   >
                     <div className="p-4 hover:bg-slate-50 transition-colors">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            {action.status === 'SUCCESS' ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                            <div>
                              <div className="font-medium text-slate-900">{action.name}</div>
                              <div className="text-xs text-slate-500">{action.target}</div>
                            </div>
                         </div>
                         <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm">
                            {translateStatus(action.status)}
                            {expandedAction === action.actionId ? <ChevronDown className="w-4 h-4 ml-1"/> : <ChevronRight className="w-4 h-4 ml-1"/>}
                          </Button>
                        </CollapsibleTrigger>
                       </div>
                       <CollapsibleContent className="mt-3 pl-8">
                         <div className="p-3 bg-slate-900 text-slate-50 rounded-md text-xs font-mono overflow-x-auto">
                           <div className="mb-1 text-slate-400">// API 返回信息</div>
                           {JSON.stringify(action.details, null, 2)}
                           <div className="mt-2 text-green-400">消息: {action.message}</div>
                         </div>
                       </CollapsibleContent>
                     </div>
                   </Collapsible>
                 ))}
               </div>
             </CardContent>
          </Card>

          {/* C. Result Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>结果指标回流</span>
                <Badge variant="secondary" className="font-normal text-xs">
                  观察周期: {execution.metrics.observationPeriod === 'SHORT' ? '短期观察' : execution.metrics.observationPeriod}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>指标</TableHead>
                    <TableHead>执行前</TableHead>
                    <TableHead>执行后</TableHead>
                    <TableHead>变化幅度</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {execution.metrics.snapshots.map((m, idx) => {
                    const diff = m.after - m.before;
                    const percent = ((diff / m.before) * 100).toFixed(1);
                    const isPositive = diff > 0;
                    return (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{m.name}</TableCell>
                        <TableCell>{m.before}{m.unit}</TableCell>
                        <TableCell>{m.after}{m.unit}</TableCell>
                        <TableCell>
                          <span className={cn(
                            "flex items-center gap-1 font-bold",
                            // Heuristic: for churn, negative is good (green), for others positive is good
                            m.name.includes('流失') 
                              ? (diff < 0 ? "text-green-600" : "text-red-600")
                              : (diff > 0 ? "text-green-600" : "text-red-600")
                          )}>
                            {diff > 0 ? '+' : ''}{diff.toFixed(2)}{m.unit} ({diff > 0 ? '+' : ''}{percent}%)
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* D. AI Evaluation */}
          <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
            <CardHeader>
              <CardTitle className="text-indigo-900 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                AI 效果评估
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">符合预期:</span>
                {execution.aiEvaluation.isExpected ? (
                   <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">YES</Badge>
                ) : (
                   <Badge variant="destructive">NO</Badge>
                )}
              </div>
              
              <div className="p-3 bg-white/60 rounded-lg border border-indigo-100 text-sm text-slate-700">
                <span className="font-semibold block text-indigo-900 mb-1">分析结论:</span>
                {execution.aiEvaluation.deviationReason}
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-900">后续建议:</span>
                <div className="w-full p-2 bg-indigo-600 text-white text-center rounded-md font-bold">
                  {translateRecommendation(execution.aiEvaluation.recommendation)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* E. Next Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">后续动作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-slate-600 p-3 bg-slate-50 rounded border">
                <div className="text-xs text-slate-400 mb-1 uppercase">AI 推荐动作</div>
                {execution.nextActions.aiRecommended}
              </div>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate(`/decision/new`)}>
                <FilePlus className="w-4 h-4 mr-2" />
                创建新决策
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => toast({ title: "已复制到草稿" })}>
                <Copy className="w-4 h-4 mr-2" />
                复制为新执行方案
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
