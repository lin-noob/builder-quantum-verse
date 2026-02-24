import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Bot, 
  ArrowRight, 
  History,
  FileDiff,
  ShieldCheck,
  LayoutList,
  RotateCcw,
  ArrowLeft,
  Star,
  ChevronDown,
  ChevronUp,
  Target,
  Database,
  BrainCircuit,
  Zap,
  ThumbsUp,
  MessageSquare
} from 'lucide-react';
import { DecisionTraceState, DecisionResult, ActionItem } from './types';
import { cn } from "@/lib/utils";

interface Step5Props {
  state: DecisionTraceState;
  onUpdate: (result: Partial<DecisionResult>) => void;
  onReset: () => void;
  onBack: () => void;
  onComplete: () => void;
}

export const Step5ResultRecording: React.FC<Step5Props> = ({ state, onUpdate, onReset, onBack, onComplete }) => {
  const { result, execution, intentAnalysis, dataPreparation, reasoning } = state;
  const [rating, setRating] = useState<number>(0);
  const [showFullLog, setShowFullLog] = useState(false);

  if (!result) return <div className="p-8 text-center text-slate-500 text-base">结果尚未生成</div>;

  // Metrics
  const aiActionsCount = execution.actions.filter(a => a.type === 'ai_executable').length;
  const humanActionsCount = execution.actions.filter(a => a.type === 'human_confirm').length;
  const totalActions = aiActionsCount + humanActionsCount;
  
  const sortedActions = [...execution.actions].sort((a, b) => {
    return new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime();
  });

  const handleResultSubmit = () => {
    onUpdate({ 
      recordedAt: new Date().toLocaleString(),
      status: 'archived',
      totalAiActions: aiActionsCount,
      totalHumanActions: humanActionsCount,
      rating: rating // Save rating
    });
    onComplete();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50">

      {/* 1. Sticky Top Bar */}
      <div className="flex items-center justify-between gap-4 p-3 bg-white border border-slate-200 rounded-lg sticky top-0 z-20 shadow-sm mb-4">
         <div className="flex items-center gap-3">
           <div className={cn("p-2 rounded-full border", result.recordedAt ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-blue-100 text-blue-600 border-blue-200")}>
             {result.recordedAt ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
           </div>
           <div className="flex flex-col leading-tight">
             <span className="text-base font-bold text-slate-900">{result.recordedAt ? '决策已归档' : '决策报告待确认'}</span>
             <div className="flex items-center gap-2 text-sm tracking-wider text-slate-500">
               <span>执行耗时: {result.startTime && result.endTime ? '1m 23s' : '计算中...'}</span>
               <span className="w-[1px] h-2 bg-slate-300"></span>
               <span>共 {totalActions} 个动作</span>
             </div>
           </div>
         </div>

         <div className="flex items-center gap-2">
           {!result.recordedAt && (
             <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-500 hover:text-slate-800">
               <ArrowLeft className="w-4 h-4 mr-1" /> 返回调整
             </Button>
           )}
           
           {!result.recordedAt && (
              <Button 
                size="sm"
                onClick={handleResultSubmit} 
                className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> 提交并归档
              </Button>
           )}
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        
        {/* 2. Dashboard Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main Status Card */}
          <Card className="md:col-span-2 border-slate-200 shadow-sm bg-gradient-to-br from-white to-slate-50/50">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn("w-16 h-16 rounded-full flex items-center justify-center border-4", 
                  result.solved ? "bg-green-50 border-green-100 text-green-600" : "bg-red-50 border-red-100 text-red-600"
                )}>
                  {result.solved ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                </div>
                <div>
                  <h2 className={cn("text-xl font-bold", result.solved ? "text-green-700" : "text-red-700")}>
                    {result.solved ? '执行成功' : '执行失败'}
                  </h2>
                  <p className="text-base text-slate-500 mt-1">
                    由 {result.operator || 'AI 系统'} 在 {result.recordedAt?.split(' ')[0] || '今天'} 完成
                  </p>
                </div>
              </div>
              
              {/* Rating Section (Interactive before submit, Static after) */}
              <div className="flex flex-col items-end gap-2">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">AI 表现评分</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star}
                      disabled={!!result.recordedAt}
                      onClick={() => setRating(star)}
                      className={cn(
                        "transition-all hover:scale-110 focus:outline-none",
                        (result.rating || rating) >= star ? "text-yellow-400 fill-yellow-400" : "text-slate-200"
                      )}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
                {rating > 0 && !result.recordedAt && (
                   <span className="text-sm text-slate-500 animate-in fade-in">感谢您的反馈!</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6 flex flex-col justify-center h-full gap-4">
               <div className="flex justify-between items-center">
                 <span className="text-base font-medium text-slate-600">AI 自动化率</span>
                 <span className="text-2xl font-bold text-slate-800">
                   {totalActions > 0 ? Math.round((aiActionsCount / totalActions) * 100) : 0}%
                 </span>
               </div>
               <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                 <div className="bg-blue-500 h-full" style={{ width: `${(aiActionsCount/totalActions)*100}%` }} />
                 <div className="bg-orange-500 h-full" style={{ width: `${(humanActionsCount/totalActions)*100}%` }} />
               </div>
               <div className="flex gap-4 text-sm text-slate-500 mt-1">
                 <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"/> AI 执行 ({aiActionsCount})</span>
                 <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500"/> 人工 ({humanActionsCount})</span>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* 3. Decision Trace Replay (Milestones) */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              <LayoutList className="w-4 h-4 text-blue-500" /> 决策关键路径回溯
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 md:gap-4 justify-between relative">
              {/* Connector Line (Desktop) */}
              <div className="hidden md:block absolute top-[15px] left-0 right-0 h-[2px] bg-slate-100 z-0 mx-10" />
              
              <MilestoneStep 
                icon={Target} 
                step="步骤 1" 
                title="意图识别" 
                desc={intentAnalysis.coreIntent} 
                meta={`${intentAnalysis.goals.filter(g => g.isEnabled).length} 目标`}
              />
              <MilestoneStep 
                icon={Database} 
                step="步骤 2" 
                title="数据准备" 
                desc={`选中 ${dataPreparation.candidates.filter(c => c.isSelected).length} 个对象`}
                meta="就绪"
              />
              <MilestoneStep 
                icon={BrainCircuit} 
                step="步骤 3" 
                title="逻辑推理" 
                desc={`${reasoning.results.flatMap(r => r.inferences).length} 条推理结论`}
                meta="通过"
              />
              <MilestoneStep 
                icon={Zap} 
                step="步骤 4" 
                title="动作执行" 
                desc={`${execution.actions.filter(a => a.status === 'completed').length} / ${totalActions} 完成`}
                meta={result.solved ? '成功' : '部分完成'}
                isLast
              />
            </div>
          </CardContent>
        </Card>

        {/* 4. Key Changes (Diff View) */}
        {result.changeLogs && result.changeLogs.length > 0 && (
          <Card className="border-slate-200 shadow-sm overflow-hidden">
             <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
               <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                 <FileDiff className="w-4 h-4 text-purple-500" /> 关键数据变更
               </CardTitle>
             </CardHeader>
             <div className="divide-y divide-slate-100">
               {result.changeLogs.map((log, idx) => (
                 <div key={idx} className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4">
                   <div className="md:col-span-3 flex flex-col justify-center">
                     <div className="flex items-center gap-2 mb-1">
                       <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200">{log.objectType}</Badge>
                       <span className="text-sm font-mono text-slate-400">ID: {log.objectId}</span>
                     </div>
                     <div className="text-sm text-slate-500 mt-1">
                       触发动作 #{log.triggerActionId.substring(0,6)}...
                     </div>
                   </div>
                   
                   <div className="md:col-span-9 grid grid-cols-2 gap-4 bg-slate-50/50 rounded-lg p-3 border border-slate-100 font-mono text-sm">
                     <div className="space-y-1">
                       <span className="text-red-500 font-bold uppercase text-sm tracking-wider">变更前</span>
                       <pre className="text-slate-600 whitespace-pre-wrap overflow-x-auto">
                         {JSON.stringify(log.before, null, 2)}
                       </pre>
                     </div>
                     <div className="space-y-1 pl-4 border-l border-slate-200">
                       <span className="text-green-600 font-bold uppercase text-sm tracking-wider">变更后</span>
                       <pre className="text-slate-800 whitespace-pre-wrap overflow-x-auto">
                         {JSON.stringify(log.after, null, 2)}
                       </pre>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          </Card>
        )}

        {/* 5. Detailed Timeline (Collapsible) */}
        <div className="pt-4 border-t border-slate-200">
          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            onClick={() => setShowFullLog(!showFullLog)}
          >
            {showFullLog ? '收起完整日志' : '展开完整执行日志'}
            {showFullLog ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          
          {showFullLog && (
            <div className="mt-6 relative pl-4 space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 animate-in slide-in-from-top-4 duration-300">
              {sortedActions.map((action) => (
                <div key={action.id} className="relative flex gap-4">
                  {/* Timeline Node */}
                  <div className={cn(
                    "absolute left-[-21px] top-1 w-3 h-3 rounded-full border-2 ring-4 ring-white z-10",
                    action.status === 'completed' || action.status === 'approved' ? "bg-green-500 border-green-500" :
                    action.status === 'rejected' || action.status === 'failed' ? "bg-red-500 border-red-500" : "bg-slate-300 border-slate-300"
                  )} />
                  
                  {/* Log Item */}
                  <div className="flex-1 bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                     <div className="flex items-start gap-3">
                        <div className={cn("p-2 rounded bg-slate-50 text-slate-500", 
                          action.type === 'human_confirm' && "bg-orange-50 text-orange-600"
                        )}>
                          {action.type === 'human_confirm' ? <User className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-base font-semibold text-slate-800 flex items-center gap-2">
                            {action.description}
                            {action.type === 'human_confirm' && (
                              <Badge variant="outline" className="text-sm tracking-wider h-5 px-1.5 text-orange-600 border-orange-200 bg-orange-50">人工</Badge>
                            )}
                          </div>
                          <div className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
                            <span>{action.timestamp?.split('T')[1]?.substring(0,8)}</span>
                            {action.result && <span className="text-slate-300">|</span>}
                            {action.result && <span>{action.result}</span>}
                          </div>
                        </div>
                     </div>
                     
                     {/* Human Note Highlight */}
                     {action.approvalNote && (
                       <div className="text-sm bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded border border-yellow-100 italic flex items-center gap-1.5">
                         <MessageSquare className="w-3 h-3" />
                         "{action.approvalNote}"
                       </div>
                     )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

// --- Sub Components ---

const MilestoneStep = ({ icon: Icon, step, title, desc, meta, isLast }: any) => (
  <div className="relative z-10 flex-1 flex flex-col items-center text-center group">
    <div className="w-8 h-8 rounded-full flex items-center justify-center mb-3 shadow-sm transition-all bg-white border-2 border-slate-100 text-slate-400 group-hover:border-blue-400 group-hover:text-blue-500">
      <Icon className="w-4 h-4" />
    </div>
    <div className="text-sm tracking-wider font-bold text-slate-400 uppercase mb-0.5">{step}</div>
    <div className="text-base font-bold text-slate-800 mb-1">{title}</div>
    <div className="text-sm text-slate-500 max-w-[120px] truncate" title={desc}>{desc}</div>
    <Badge variant="secondary" className="mt-2 text-sm tracking-wider h-6 bg-slate-50 text-slate-500">{meta}</Badge>
  </div>
);
