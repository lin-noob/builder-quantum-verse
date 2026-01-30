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
  Info
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Types
type BriefStatus = "AUTO_GENERATED" | "HUMAN_EDITED" | "LOCKED_FOR_EXECUTION";

interface Constraint {
  id: string;
  label: string;
  checked: boolean;
}

interface SummaryData {
  status: BriefStatus;
  situation: string[];
  objectives: string[];
  constraints: Constraint[];
}

// Mock Data
const MOCK_SUMMARY_DATA: SummaryData = {
  status: "AUTO_GENERATED",
  situation: [
    "客户已进入实质性评估阶段",
    "对交期高度敏感",
    "存在履约风险关注"
  ],
  objectives: [
    "稳定客户对交期的预期",
    "提供可选择方案而非承诺"
  ],
  constraints: [
    { id: "c1", label: "不可承诺具体发货日期", checked: true },
    { id: "c2", label: "不可主动降价", checked: true }
  ]
};

interface SummaryBuilderLayerProps {
  externalLock?: boolean;
}

export default function SummaryBuilderLayer({ externalLock = false }: SummaryBuilderLayerProps) {
  const [data, setData] = useState<SummaryData>(MOCK_SUMMARY_DATA);
  const [editingSituationIndex, setEditingSituationIndex] = useState<number | null>(null);
  const [editingObjectiveIndex, setEditingObjectiveIndex] = useState<number | null>(null);
  const [tempEditText, setTempEditText] = useState("");
  
  // Constraint uncheck confirmation
  const [constraintToUncheck, setConstraintToUncheck] = useState<string | null>(null);
  const [uncheckReason, setUncheckReason] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

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

  // --- Handlers ---

  // Situation Handlers
  const handleEditSituation = (index: number) => {
    if (isLocked) return;
    setEditingSituationIndex(index);
    setTempEditText(data.situation[index]);
  };

  const saveSituation = (index: number) => {
    if (!tempEditText.trim()) return;
    const newSituation = [...data.situation];
    newSituation[index] = tempEditText.trim();
    setData({ ...data, situation: newSituation, status: "HUMAN_EDITED" });
    setEditingSituationIndex(null);
  };

  const deleteSituation = (index: number) => {
    if (isLocked) return;
    const newSituation = data.situation.filter((_, i) => i !== index);
    setData({ ...data, situation: newSituation, status: "HUMAN_EDITED" });
  };

  const addSituation = () => {
    if (isLocked) return;
    const newSituation = [...data.situation, "新局势判断..."];
    setData({ ...data, situation: newSituation, status: "HUMAN_EDITED" });
    setEditingSituationIndex(newSituation.length - 1);
    setTempEditText("新局势判断...");
  };

  // Objective Handlers
  const handleEditObjective = (index: number) => {
    if (isLocked) return;
    setEditingObjectiveIndex(index);
    setTempEditText(data.objectives[index]);
  };

  const saveObjective = (index: number) => {
    if (!tempEditText.trim()) return;
    const newObjectives = [...data.objectives];
    newObjectives[index] = tempEditText.trim();
    setData({ ...data, objectives: newObjectives, status: "HUMAN_EDITED" });
    setEditingObjectiveIndex(null);
  };

  const deleteObjective = (index: number) => {
    if (isLocked) return;
    if (data.objectives.length <= 1) {
      alert("至少保留一条目标");
      return;
    }
    const newObjectives = data.objectives.filter((_, i) => i !== index);
    setData({ ...data, objectives: newObjectives, status: "HUMAN_EDITED" });
  };

  const addObjective = () => {
    if (isLocked) return;
    if (data.objectives.length >= 3) return; // Max 3
    const newObjectives = [...data.objectives, "新行动目标..."];
    setData({ ...data, objectives: newObjectives, status: "HUMAN_EDITED" });
    setEditingObjectiveIndex(newObjectives.length - 1);
    setTempEditText("新行动目标...");
  };

  // Constraint Handlers
  const toggleConstraint = (id: string, checked: boolean) => {
    if (isLocked) return;
    
    if (!checked) {
      // Trying to uncheck -> require confirmation
      setConstraintToUncheck(id);
      setUncheckReason("");
      setIsConfirmOpen(true);
    } else {
      // Checking is fine
      const newConstraints = data.constraints.map(c => 
        c.id === id ? { ...c, checked: true } : c
      );
      setData({ ...data, constraints: newConstraints, status: "HUMAN_EDITED" });
    }
  };

  const confirmUncheck = () => {
    if (!constraintToUncheck) return;
    const newConstraints = data.constraints.map(c => 
      c.id === constraintToUncheck ? { ...c, checked: false } : c
    );
    // In a real app, we would save the reason to an audit log here
    console.log(`Constraint ${constraintToUncheck} unchecked. Reason: ${uncheckReason}`);
    
    setData({ ...data, constraints: newConstraints, status: "HUMAN_EDITED" });
    setIsConfirmOpen(false);
    setConstraintToUncheck(null);
  };

  return (
    <Card className="w-full border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 text-blue-700 rounded-md">
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
                 className="h-7 text-xs text-slate-500 hover:text-blue-600"
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
          
          {/* Section 1: Situation */}
          <div className="p-4">
             <div className="flex items-center justify-between mb-3">
               <div className="flex items-center gap-2">
                 <Info className="w-3.5 h-3.5 text-slate-400" />
                 <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">当前局势 (Situation)</h3>
               </div>
               {!isLocked && (
                 <Button variant="ghost" size="sm" className="h-6 text-[10px] text-slate-400 hover:text-slate-600" onClick={addSituation}>
                   <Plus className="w-3 h-3 mr-1" /> 添加
                 </Button>
               )}
             </div>
             
             <ul className="space-y-2">
               {data.situation.map((item, index) => (
                 <li key={index} className="group flex items-start gap-2 text-sm pl-2 relative">
                   <span className="absolute left-0 top-2 w-1 h-1 rounded-full bg-slate-300"></span>
                   
                   {editingSituationIndex === index ? (
                     <div className="flex-1 flex gap-2">
                       <Input 
                         value={tempEditText} 
                         onChange={(e) => setTempEditText(e.target.value)}
                         className="h-7 text-sm"
                         autoFocus
                         onKeyDown={(e) => e.key === 'Enter' && saveSituation(index)}
                       />
                       <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => saveSituation(index)}><Check className="w-3.5 h-3.5 text-green-600" /></Button>
                       <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingSituationIndex(null)}><X className="w-3.5 h-3.5 text-slate-400" /></Button>
                     </div>
                   ) : (
                     <div className="flex-1 flex items-start justify-between hover:bg-slate-50 rounded px-1 -ml-1 py-0.5 cursor-default">
                       <span className="text-slate-700">{item}</span>
                       {!isLocked && (
                         <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleEditSituation(index)}>
                             <Edit className="w-3 h-3 text-slate-400" />
                           </Button>
                           <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:text-red-500" onClick={() => deleteSituation(index)}>
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

          {/* Section 2: Objectives */}
          <div className="p-4 bg-blue-50/30">
             <div className="flex items-center justify-between mb-3">
               <div className="flex items-center gap-2">
                 <Target className="w-3.5 h-3.5 text-blue-500" />
                 <h3 className="text-xs font-bold uppercase text-blue-600 tracking-wider">行动目标 (Objective)</h3>
               </div>
               {!isLocked && data.objectives.length < 3 && (
                 <Button variant="ghost" size="sm" className="h-6 text-[10px] text-blue-400 hover:text-blue-600" onClick={addObjective}>
                   <Plus className="w-3 h-3 mr-1" /> 添加
                 </Button>
               )}
             </div>
             
             <div className="space-y-2">
               {data.objectives.map((item, index) => (
                 <div key={index} className="group flex items-center gap-3">
                   <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold shrink-0">
                     {index + 1}
                   </div>
                   
                   {editingObjectiveIndex === index ? (
                     <div className="flex-1 flex gap-2">
                       <Input 
                         value={tempEditText} 
                         onChange={(e) => setTempEditText(e.target.value)}
                         className="h-7 text-sm border-blue-200"
                         autoFocus
                         onKeyDown={(e) => e.key === 'Enter' && saveObjective(index)}
                       />
                       <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => saveObjective(index)}><Check className="w-3.5 h-3.5 text-green-600" /></Button>
                     </div>
                   ) : (
                     <div className="flex-1 flex items-center justify-between p-2 bg-white border border-blue-100 rounded shadow-sm group-hover:border-blue-300 transition-colors">
                       <span className="text-sm font-medium text-slate-800">{item}</span>
                       {!isLocked && (
                         <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                           <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleEditObjective(index)}>
                             <Edit className="w-3 h-3 text-slate-400" />
                           </Button>
                           <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:text-red-500" onClick={() => deleteObjective(index)}>
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

          {/* Section 3: Constraints */}
          <div className="p-4 bg-red-50/10">
             <div className="flex items-center gap-2 mb-3">
               <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
               <h3 className="text-xs font-bold uppercase text-red-600 tracking-wider">系统约束 (Constraints)</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               {data.constraints.map((constraint) => (
                 <div 
                   key={constraint.id} 
                   className={cn(
                     "flex items-center space-x-2 p-2 rounded border transition-colors",
                     constraint.checked 
                       ? "bg-white border-red-100" 
                       : "bg-slate-50 border-slate-200 opacity-60"
                   )}
                 >
                   <Checkbox 
                     id={constraint.id} 
                     checked={constraint.checked}
                     onCheckedChange={(checked) => toggleConstraint(constraint.id, checked as boolean)}
                     disabled={isLocked}
                     className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                   />
                   <label 
                     htmlFor={constraint.id} 
                     className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 cursor-pointer"
                   >
                     {constraint.label}
                   </label>
                 </div>
               ))}
             </div>
             <p className="text-[10px] text-slate-400 mt-2 flex items-center">
               <AlertTriangle className="w-3 h-3 mr-1" />
               这些约束将作为硬性规则注入后续的 AI 执行层
             </p>
          </div>
          
        </div>
      </CardContent>

      {/* Uncheck Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              移除系统约束确认
            </DialogTitle>
            <DialogDescription>
              您正在尝试移除一条安全约束。此操作将被记录在审计日志中，并可能增加 AI 执行的风险。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="reason" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                移除原因 (必填)
              </label>
              <Textarea
                id="reason"
                placeholder="请说明为什么要移除此约束..."
                value={uncheckReason}
                onChange={(e) => setUncheckReason(e.target.value)}
                className="h-20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>取消</Button>
            <Button 
              variant="destructive" 
              onClick={confirmUncheck}
              disabled={!uncheckReason.trim()}
            >
              确认移除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
