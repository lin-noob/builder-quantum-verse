import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlertCircle, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Mail, 
  MoreHorizontal, 
  Plus, 
  Trash2, 
  User,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// --- Types ---

export interface ActionItem {
  id: string;
  isSelected: boolean;
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  method: 'EMAIL' | 'INTERNAL_CONFIRM' | 'SYSTEM_OP';
  source: 'AI' | 'HUMAN';
  relatedStrategyId?: string;
}

interface DecisionExecutionTabProps {
  event: any; // Using any for now, ideally match the DecisionEvent type
  onExecute: (items: ActionItem[]) => void;
  isExecuted: boolean;
}

// --- Mock Data ---

const MOCK_AI_ACTIONS: ActionItem[] = [
  {
    id: "act_001",
    isSelected: true,
    title: "发送延期致歉邮件",
    description: "向客户说明物流延误原因，并提供预计送达时间。",
    assignee: "张三",
    dueDate: format(new Date(), "yyyy-MM-dd"),
    method: "EMAIL",
    source: "AI",
    relatedStrategyId: "STRAT_LOGISTICS_DELAY"
  },
  {
    id: "act_002",
    isSelected: true,
    title: "联系物流供应商核实",
    description: "获取准确的物流单号和当前位置。",
    assignee: "李四",
    dueDate: format(new Date(), "yyyy-MM-dd"),
    method: "INTERNAL_CONFIRM",
    source: "AI",
    relatedStrategyId: "STRAT_DATA_ENRICH"
  },
  {
    id: "act_003",
    isSelected: true,
    title: "更新 CRM 订单状态",
    description: "将订单状态标记为'物流异常监控中'。",
    assignee: "系统",
    dueDate: format(new Date(), "yyyy-MM-dd"),
    method: "SYSTEM_OP",
    source: "AI",
    relatedStrategyId: "STRAT_SYSTEM_SYNC"
  }
];

// --- Components ---

function DecisionSummary({ event, actionCount }: { event: any, actionCount: number }) {
  return (
    <Card className="mb-6 bg-slate-50 border-slate-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>事件类型:</span>
              <span className="font-medium text-slate-800">{event.type_label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">AI 风险判断:</span>
              <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 text-xs">
                {event.ai_initial_judgement}
              </Badge>
            </div>
          </div>
          <div className="flex gap-4 text-right">
             <div>
               <div className="text-2xl font-bold text-slate-800">2</div>
               <div className="text-xs text-slate-500">AI 推荐策略</div>
             </div>
             <div>
               <div className="text-2xl font-bold text-blue-600">{actionCount}</div>
               <div className="text-xs text-slate-500">执行事项</div>
             </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionItemRow({ 
  item, 
  onUpdate, 
  onDelete 
}: { 
  item: ActionItem, 
  onUpdate: (updates: Partial<ActionItem>) => void,
  onDelete: () => void 
}) {
  return (
    <div className={cn(
      "group flex items-start gap-3 p-4 border rounded-lg bg-white transition-all hover:shadow-sm",
      item.isSelected ? "border-slate-200" : "border-slate-100 opacity-60 bg-slate-50"
    )}>
      <Checkbox 
        checked={item.isSelected} 
        onCheckedChange={(checked) => onUpdate({ isSelected: checked as boolean })}
        className="mt-1"
      />
      
      <div className="flex-1 space-y-3">
        {/* Header Line */}
        <div className="flex items-center justify-between">
          <Input 
            value={item.title} 
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="h-7 text-sm font-medium border-transparent hover:border-slate-200 px-1 -ml-1 w-[300px]"
          />
          <div className="flex items-center gap-2">
            {item.source === "AI" ? (
               <Badge variant="secondary" className="h-5 text-[10px] gap-1 bg-purple-50 text-purple-600 hover:bg-purple-100">
                 <Zap className="w-3 h-3" /> AI 建议
               </Badge>
            ) : (
               <Badge variant="secondary" className="h-5 text-[10px] gap-1 bg-blue-50 text-blue-600 hover:bg-blue-100">
                 <User className="w-3 h-3" /> 人工新增
               </Badge>
            )}
            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={onDelete}>
              <Trash2 className="w-3 h-3 text-slate-400 hover:text-red-500" />
            </Button>
          </div>
        </div>

        {/* Description */}
        <Textarea 
          value={item.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          className="min-h-[40px] text-xs text-slate-600 bg-slate-50 border-transparent hover:border-slate-200 resize-none py-2"
        />

        {/* Controls Line */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 w-[180px]">
             <span className="text-slate-400">负责人</span>
             <Select value={item.assignee} onValueChange={(val) => onUpdate({ assignee: val })}>
               <SelectTrigger className="h-7 text-xs border-slate-200 bg-white">
                 <SelectValue />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="张三">张三 (销售)</SelectItem>
                 <SelectItem value="李四">李四 (物流)</SelectItem>
                 <SelectItem value="系统">System Bot</SelectItem>
               </SelectContent>
             </Select>
          </div>

          <div className="flex items-center gap-2 w-[160px]">
             <span className="text-slate-400">截止</span>
             <Input 
               type="date" 
               value={item.dueDate}
               onChange={(e) => onUpdate({ dueDate: e.target.value })}
               className="h-7 text-xs border-slate-200"
             />
          </div>

          <div className="flex items-center gap-2 ml-auto">
             <span className="text-slate-400">方式</span>
             <Badge variant="outline" className="text-[10px] font-normal text-slate-500">
               {item.method}
             </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DecisionExecutionTab({ event, onExecute, isExecuted }: DecisionExecutionTabProps) {
  const [items, setItems] = useState<ActionItem[]>(MOCK_AI_ACTIONS);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleUpdateItem = (id: string, updates: Partial<ActionItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const handleDeleteItem = (id: string) => {
    if (confirm("确定要删除这条执行事项吗？")) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleAddItem = () => {
    const newItem: ActionItem = {
      id: `act_new_${Date.now()}`,
      isSelected: true,
      title: "新执行事项",
      description: "请输入具体执行内容...",
      assignee: "张三",
      dueDate: format(new Date(), "yyyy-MM-dd"),
      method: "INTERNAL_CONFIRM",
      source: "HUMAN"
    };
    setItems(prev => [...prev, newItem]);
  };

  const activeItems = items.filter(i => i.isSelected);

  return (
    <div className="flex flex-col h-full relative bg-white">
      <div className="flex-1 overflow-y-auto p-6 pb-24">
        <DecisionSummary event={event} actionCount={items.length} />

        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              待确认执行事项 ({activeItems.length}/{items.length})
            </h3>
            <Button variant="outline" size="sm" onClick={handleAddItem} className="h-7 text-xs gap-1">
              <Plus className="w-3 h-3" />
              人工补充
            </Button>
          </div>

          <div className="space-y-3">
            {items.map(item => (
              <ActionItemRow 
                key={item.id} 
                item={item} 
                onUpdate={(updates) => handleUpdateItem(item.id, updates)}
                onDelete={() => handleDeleteItem(item.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="text-sm text-slate-500">
            已选 <span className="font-bold text-slate-800">{activeItems.length}</span> 项待办
          </div>
          <div className="flex gap-3">
            <Button variant="outline">驳回 AI 建议</Button>
            <Button variant="secondary">部分采纳</Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-md shadow-blue-100"
              onClick={() => setShowConfirmDialog(true)}
              disabled={isExecuted || activeItems.length === 0}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isExecuted ? "已执行" : "采纳并生成待办"}
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认生成待办任务</DialogTitle>
            <DialogDescription>
              系统将根据您的选择创建以下任务，并通知相关负责人。
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block mb-1">待办数量</span>
                <span className="text-xl font-bold text-slate-800">{activeItems.length}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block mb-1">决策人</span>
                <span className="font-medium text-slate-800">Administrator</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">涉及负责人</span>
              <div className="flex gap-2">
                {Array.from(new Set(activeItems.map(i => i.assignee))).map(name => (
                  <Badge key={name} variant="secondary">{name}</Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>取消</Button>
            <Button onClick={() => {
              onExecute(activeItems);
              setShowConfirmDialog(false);
            }}>确认执行</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
