import React, { useState } from "react";
import { 
  FileText, 
  Target, 
  ShieldAlert, 
  Edit, 
  Trash2, 
  Plus, 
  Lock, 
  Unlock, 
  Check, 
  X,
  AlertTriangle,
  Info,
  Compass,
  Zap,
  List,
  Thermometer,
  Activity
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Types
type BriefStatus = "AUTO_GENERATED" | "HUMAN_EDITED" | "LOCKED_FOR_EXECUTION";
type BusinessStage = "咨询" | "对比" | "决策中" | "售后" | "不明确";
type ReplyPriority = "low" | "medium" | "high";
type ConfidenceLevel = "low" | "medium" | "high";

interface SummaryData {
  status: BriefStatus;
  customer_intent: string;
  business_stage: BusinessStage;
  reply_recommended: boolean;
  reply_priority: ReplyPriority;
  suggested_tone: string;
  key_points_to_address: string[];
  suggested_reply_outline: string[];
  risks_or_notes: string[];
  confidence_level: ConfidenceLevel;
}

// Mock Data
const MOCK_SUMMARY_DATA: SummaryData = {
  status: "AUTO_GENERATED",
  customer_intent: "询问订单发货状态及具体预计送达时间",
  business_stage: "售后",
  reply_recommended: true,
  reply_priority: "high",
  suggested_tone: "共情安抚，专业客观",
  key_points_to_address: [
    "确认收到客户对于发货延迟的询问",
    "解释当前物流受阻的具体原因（如天气/仓库积压）",
    "提供最新的预计发货时间窗口",
    "主动提出补偿方案（如优惠券）以挽回满意度"
  ],
  suggested_reply_outline: [
    "开场：致歉并确认订单信息",
    "解释：说明导致延迟的具体不可抗力因素",
    "方案：给出新的预计时间，并承诺持续跟进",
    "结尾：提供下次购买的9折优惠码作为补偿"
  ],
  risks_or_notes: [
    "切勿承诺确切的'到达日期'，仅提供'发货窗口'，避免二次违约风险",
    "注意客户之前的愤怒情绪，避免使用过于机械的模板回复"
  ],
  confidence_level: "high"
};

interface SummaryBuilderLayerProps {
  externalLock?: boolean;
}

export default function SummaryBuilderLayer({ externalLock = false }: SummaryBuilderLayerProps) {
  const [data, setData] = useState<SummaryData>(MOCK_SUMMARY_DATA);
  
  // Editing states
  const [editingKeyPointIndex, setEditingKeyPointIndex] = useState<number | null>(null);
  const [editingOutlineIndex, setEditingOutlineIndex] = useState<number | null>(null);
  const [editingRiskIndex, setEditingRiskIndex] = useState<number | null>(null);
  const [tempEditText, setTempEditText] = useState("");

  // Status helpers
  const isLocked = data.status === "LOCKED_FOR_EXECUTION" || externalLock;
  
  const getStatusBadge = (status: BriefStatus) => {
    switch (status) {
      case "AUTO_GENERATED":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">AI 生成</Badge>;
      case "HUMAN_EDITED":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">人工修订</Badge>;
      case "LOCKED_FOR_EXECUTION":
        return <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200">已锁定</Badge>;
    }
  };

  const getPriorityBadge = (priority: ReplyPriority) => {
    switch (priority) {
      case "high":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">高优先级</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">中优先级</Badge>;
      case "low":
        return <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">低优先级</Badge>;
    }
  };

  const getConfidenceBadge = (level: ConfidenceLevel) => {
    switch (level) {
      case "high":
        return <span className="text-xs text-green-600 font-medium flex items-center"><Activity className="w-3 h-3 mr-1" /> 置信度高</span>;
      case "medium":
        return <span className="text-xs text-yellow-600 font-medium flex items-center"><Activity className="w-3 h-3 mr-1" /> 置信度中</span>;
      case "low":
        return <span className="text-xs text-red-600 font-medium flex items-center"><Activity className="w-3 h-3 mr-1" /> 置信度低</span>;
    }
  };

  // --- Handlers ---

  // Generic List Handlers
  const handleEditList = (
    index: number, 
    list: string[], 
    setEditingIndex: (i: number | null) => void
  ) => {
    if (isLocked) return;
    setEditingIndex(index);
    setTempEditText(list[index]);
  };

  const saveList = (
    index: number, 
    field: keyof Pick<SummaryData, 'key_points_to_address' | 'suggested_reply_outline' | 'risks_or_notes'>,
    setEditingIndex: (i: number | null) => void
  ) => {
    if (!tempEditText.trim()) return;
    const newList = [...data[field]];
    newList[index] = tempEditText.trim();
    setData({ ...data, [field]: newList, status: "HUMAN_EDITED" });
    setEditingIndex(null);
  };

  const deleteFromList = (
    index: number, 
    field: keyof Pick<SummaryData, 'key_points_to_address' | 'suggested_reply_outline' | 'risks_or_notes'>
  ) => {
    if (isLocked) return;
    const newList = data[field].filter((_, i) => i !== index);
    setData({ ...data, [field]: newList, status: "HUMAN_EDITED" });
  };

  const addToList = (
    field: keyof Pick<SummaryData, 'key_points_to_address' | 'suggested_reply_outline' | 'risks_or_notes'>,
    placeholder: string,
    setEditingIndex: (i: number | null) => void
  ) => {
    if (isLocked) return;
    const list = data[field];
    const newList = [...list, placeholder];
    setData({ ...data, [field]: newList, status: "HUMAN_EDITED" });
    setEditingIndex(newList.length - 1);
    setTempEditText(placeholder);
  };

  return (
    <Card className="w-full border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-md">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Layer 3: Summary Builder (专家简报)</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">人类决策层 · 此时此地的行动纲领</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(data.status)}
            {isLocked ? (
               <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400" disabled>
                 <Lock className="w-3.5 h-3.5" />
               </Button>
            ) : (
               <Button 
                 variant="ghost" 
                 size="sm" 
                 className="h-7 text-xs text-slate-500 hover:text-indigo-600"
                 onClick={() => setData({ ...data, status: "LOCKED_FOR_EXECUTION" })}
               >
                 <Unlock className="w-3.5 h-3.5 mr-1" />
                 锁定执行
               </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          
          {/* Block 1: Overview (Intent & Context) */}
          <div className="p-4 bg-white">
             <div className="flex items-start justify-between mb-3">
               <div className="flex items-center gap-2">
                 <Compass className="w-3.5 h-3.5 text-slate-400" />
                 <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">意图与阶段 (Intent & Context)</h3>
               </div>
               {getConfidenceBadge(data.confidence_level)}
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="md:col-span-2 space-y-1">
                 <span className="text-[10px] text-slate-400 uppercase tracking-wide">客户意图</span>
                 <p className="text-sm font-medium text-slate-800 leading-relaxed">{data.customer_intent}</p>
               </div>
               <div className="space-y-1">
                 <span className="text-[10px] text-slate-400 uppercase tracking-wide">业务阶段</span>
                 <div>
                   <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200">
                     {data.business_stage}
                   </Badge>
                 </div>
               </div>
             </div>
          </div>

          {/* Block 2: Strategy (Tone & Priority) */}
          <div className="p-4 bg-indigo-50/20">
             <div className="flex items-center gap-2 mb-3">
               <Zap className="w-3.5 h-3.5 text-indigo-500" />
               <h3 className="text-xs font-bold uppercase text-indigo-600 tracking-wider">回复策略 (Strategy)</h3>
             </div>
             
             <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 pr-4 border-r border-indigo-100">
                  <span className="text-xs text-slate-500">建议回复:</span>
                  <Badge variant={data.reply_recommended ? "default" : "secondary"} className={cn(data.reply_recommended ? "bg-indigo-600" : "bg-slate-200 text-slate-500")}>
                    {data.reply_recommended ? "推荐回复" : "不推荐回复"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 pr-4 border-r border-indigo-100">
                  <span className="text-xs text-slate-500">优先级:</span>
                  {getPriorityBadge(data.reply_priority)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">建议基调:</span>
                  <span className="text-sm font-medium text-slate-700 flex items-center">
                    <Thermometer className="w-3 h-3 mr-1 text-slate-400" />
                    {data.suggested_tone}
                  </span>
                </div>
             </div>
          </div>

          {/* Block 3: Key Points */}
          <div className="p-4">
             <div className="flex items-center justify-between mb-3">
               <div className="flex items-center gap-2">
                 <Target className="w-3.5 h-3.5 text-blue-500" />
                 <h3 className="text-xs font-bold uppercase text-blue-600 tracking-wider">关键要点 (Key Points)</h3>
               </div>
               {!isLocked && (
                 <Button variant="ghost" size="sm" className="h-6 text-[10px] text-blue-400 hover:text-blue-600" onClick={() => addToList('key_points_to_address', "新关键点...", setEditingKeyPointIndex)}>
                   <Plus className="w-3 h-3 mr-1" /> 添加
                 </Button>
               )}
             </div>
             
             <ul className="space-y-2">
               {data.key_points_to_address.map((item, index) => (
                 <li key={index} className="group flex items-start gap-2 text-sm pl-2 relative">
                   <span className="absolute left-0 top-2 w-1 h-1 rounded-full bg-blue-300"></span>
                   
                   {editingKeyPointIndex === index ? (
                     <div className="flex-1 flex gap-2">
                       <Input 
                         value={tempEditText} 
                         onChange={(e) => setTempEditText(e.target.value)}
                         className="h-7 text-sm"
                         autoFocus
                         onKeyDown={(e) => e.key === 'Enter' && saveList(index, 'key_points_to_address', setEditingKeyPointIndex)}
                       />
                       <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => saveList(index, 'key_points_to_address', setEditingKeyPointIndex)}><Check className="w-3.5 h-3.5 text-green-600" /></Button>
                       <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingKeyPointIndex(null)}><X className="w-3.5 h-3.5 text-slate-400" /></Button>
                     </div>
                   ) : (
                     <div className="flex-1 flex items-start justify-between hover:bg-slate-50 rounded px-1 -ml-1 py-0.5 cursor-default">
                       <span className="text-slate-700">{item}</span>
                       {!isLocked && (
                         <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleEditList(index, data.key_points_to_address, setEditingKeyPointIndex)}>
                             <Edit className="w-3 h-3 text-slate-400" />
                           </Button>
                           <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:text-red-500" onClick={() => deleteFromList(index, 'key_points_to_address')}>
                             <Trash2 className="w-3 h-3" />
                           </Button>
                         </div>
                       )}
                     </div>
                   )}
                 </li>
               ))}
             </ul>
          </div>

          {/* Block 4: Reply Outline */}
          <div className="p-4 bg-slate-50/50">
             <div className="flex items-center justify-between mb-3">
               <div className="flex items-center gap-2">
                 <List className="w-3.5 h-3.5 text-slate-500" />
                 <h3 className="text-xs font-bold uppercase text-slate-600 tracking-wider">回复大纲 (Outline)</h3>
               </div>
               {!isLocked && (
                 <Button variant="ghost" size="sm" className="h-6 text-[10px] text-slate-400 hover:text-slate-600" onClick={() => addToList('suggested_reply_outline', "新大纲步骤...", setEditingOutlineIndex)}>
                   <Plus className="w-3 h-3 mr-1" /> 添加
                 </Button>
               )}
             </div>
             
             <div className="space-y-2">
               {data.suggested_reply_outline.map((item, index) => (
                 <div key={index} className="group flex items-center gap-3">
                   <div className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold shrink-0">
                     {index + 1}
                   </div>
                   
                   {editingOutlineIndex === index ? (
                     <div className="flex-1 flex gap-2">
                       <Input 
                         value={tempEditText} 
                         onChange={(e) => setTempEditText(e.target.value)}
                         className="h-7 text-sm"
                         autoFocus
                         onKeyDown={(e) => e.key === 'Enter' && saveList(index, 'suggested_reply_outline', setEditingOutlineIndex)}
                       />
                       <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => saveList(index, 'suggested_reply_outline', setEditingOutlineIndex)}><Check className="w-3.5 h-3.5 text-green-600" /></Button>
                       <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingOutlineIndex(null)}><X className="w-3.5 h-3.5 text-slate-400" /></Button>
                     </div>
                   ) : (
                     <div className="flex-1 flex items-center justify-between p-2 bg-white border border-slate-100 rounded shadow-sm group-hover:border-slate-300 transition-colors">
                       <span className="text-sm font-medium text-slate-800">{item}</span>
                       {!isLocked && (
                         <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                           <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleEditList(index, data.suggested_reply_outline, setEditingOutlineIndex)}>
                             <Edit className="w-3 h-3 text-slate-400" />
                           </Button>
                           <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:text-red-500" onClick={() => deleteFromList(index, 'suggested_reply_outline')}>
                             <Trash2 className="w-3 h-3" />
                           </Button>
                         </div>
                       )}
                     </div>
                   )}
                 </div>
               ))}
             </div>
          </div>

          {/* Block 5: Risks & Notes */}
          {data.risks_or_notes.length > 0 && (
            <div className="p-4 bg-red-50/10 border-t border-red-50">
               <div className="flex items-center justify-between mb-3">
                 <div className="flex items-center gap-2">
                   <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                   <h3 className="text-xs font-bold uppercase text-red-600 tracking-wider">风险提示 (Risks & Notes)</h3>
                 </div>
                 {!isLocked && (
                   <Button variant="ghost" size="sm" className="h-6 text-[10px] text-red-400 hover:text-red-600" onClick={() => addToList('risks_or_notes', "新风险提示...", setEditingRiskIndex)}>
                     <Plus className="w-3 h-3 mr-1" /> 添加
                   </Button>
                 )}
               </div>
               
               <div className="space-y-2">
                 {data.risks_or_notes.map((item, index) => (
                   <div 
                     key={index} 
                     className="group flex items-start gap-2 p-2 rounded bg-red-50/50 border border-red-100 text-red-800 text-xs relative"
                   >
                     <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                     
                     {editingRiskIndex === index ? (
                       <div className="flex-1 flex gap-2">
                         <Input 
                           value={tempEditText} 
                           onChange={(e) => setTempEditText(e.target.value)}
                           className="h-7 text-xs bg-white"
                           autoFocus
                           onKeyDown={(e) => e.key === 'Enter' && saveList(index, 'risks_or_notes', setEditingRiskIndex)}
                         />
                         <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => saveList(index, 'risks_or_notes', setEditingRiskIndex)}><Check className="w-3.5 h-3.5 text-green-600" /></Button>
                         <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingRiskIndex(null)}><X className="w-3.5 h-3.5 text-slate-400" /></Button>
                       </div>
                     ) : (
                       <div className="flex-1 flex items-start justify-between">
                         <span>{item}</span>
                         {!isLocked && (
                           <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-red-100" onClick={() => handleEditList(index, data.risks_or_notes, setEditingRiskIndex)}>
                               <Edit className="w-3 h-3 text-red-400" />
                             </Button>
                             <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-red-100 hover:text-red-600" onClick={() => deleteFromList(index, 'risks_or_notes')}>
                               <Trash2 className="w-3 h-3" />
                             </Button>
                           </div>
                         )}
                       </div>
                     )}
                   </div>
                 ))}
               </div>
            </div>
          )}
          
        </div>
      </CardContent>
    </Card>
  );
}
