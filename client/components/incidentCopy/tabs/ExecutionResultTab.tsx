import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  CheckCircle2, 
  Clock, 
  FileText, 
  History, 
  LayoutList,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ActionItem } from "./DecisionExecutionTab";

// --- Types ---

interface TimelineEvent {
  id: string;
  time: string;
  user: string;
  type: string;
  description: string;
}

interface ExecutionResultTabProps {
  items: ActionItem[];
  isExecuted: boolean;
}

// --- Mock Data ---

const MOCK_TIMELINE: TimelineEvent[] = [
  {
    id: "tl_1",
    time: "2026-02-05 10:30",
    user: "AI System",
    type: "AI_SUGGESTION",
    description: "AI 生成了 2 条推荐策略和 3 项执行建议"
  },
  {
    id: "tl_2",
    time: "2026-02-05 10:45",
    user: "Administrator",
    type: "HUMAN_CONFIRM",
    description: "决策人确认采纳建议，并指派任务"
  },
  {
    id: "tl_3",
    time: "2026-02-05 10:45",
    user: "System",
    type: "TASK_CREATED",
    description: "系统自动创建了 3 个待办任务 (ID: T-101, T-102, T-103)"
  }
];

// --- Components ---

function ExecutionTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <History className="w-4 h-4 text-slate-500" />
          执行时间线
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative pl-4 border-l border-slate-200 space-y-6">
          {events.map((event) => (
            <div key={event.id} className="relative">
              <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-slate-200 border-2 border-white ring-1 ring-slate-100" />
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono">{event.time}</span>
                  <span>·</span>
                  <span className="font-medium text-slate-700">{event.user}</span>
                </div>
                <div className="text-sm text-slate-800">
                  <span className="font-semibold mr-2">[{event.type}]</span>
                  {event.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ActionItemStatusTable({ items }: { items: ActionItem[] }) {
  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <LayoutList className="w-4 h-4 text-slate-500" />
          执行事项完成情况
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-4 py-2">执行事项</th>
                <th className="px-4 py-2">负责人</th>
                <th className="px-4 py-2">状态</th>
                <th className="px-4 py-2">完成时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="bg-white hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{item.title}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-xs">
                      <User className="w-3 h-3 text-slate-400" />
                      {item.assignee}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="bg-yellow-50 text-yellow-600 border-yellow-100 font-normal">
                      执行中
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">-</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400 text-xs">
                    暂无执行事项
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function OutcomeForm({ disabled }: { disabled: boolean }) {
  return (
    <Card className="shadow-sm border-slate-200 bg-slate-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-800">
          <FileText className="w-4 h-4 text-slate-500" />
          最终结果记录 (Outcome)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500">最终是否解决问题</label>
            <Select disabled={disabled}>
              <SelectTrigger className="h-8 bg-white">
                <SelectValue placeholder="请选择" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solved">已解决</SelectItem>
                <SelectItem value="partial">部分解决</SelectItem>
                <SelectItem value="unsolved">未解决</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500">实际交付方案</label>
            <Select disabled={disabled}>
              <SelectTrigger className="h-8 bg-white">
                <SelectValue placeholder="请选择" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">方案 A (邮件通知)</SelectItem>
                <SelectItem value="B">方案 B (电话沟通)</SelectItem>
                <SelectItem value="other">其他</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500">是否产生损失</label>
            <Select disabled={disabled}>
              <SelectTrigger className="h-8 bg-white">
                <SelectValue placeholder="请选择" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">是</SelectItem>
                <SelectItem value="no">否</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500">是否需要复盘</label>
            <Select disabled={disabled}>
              <SelectTrigger className="h-8 bg-white">
                <SelectValue placeholder="请选择" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">是</SelectItem>
                <SelectItem value="no">否</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-500">补充说明</label>
          <Textarea 
            placeholder="请输入最终执行结果的补充说明..." 
            className="h-20 bg-white resize-none text-sm"
            disabled={disabled}
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button size="sm" disabled={disabled} className="bg-slate-800 text-white hover:bg-slate-700">
            保存记录
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ExecutionResultTab({ items, isExecuted }: ExecutionResultTabProps) {
  if (!isExecuted) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-slate-400 bg-slate-50/50 rounded-lg m-6 border border-dashed border-slate-200">
        <Clock className="w-10 h-10 mb-3 opacity-20" />
        <p className="text-sm font-medium">决策尚未执行</p>
        <p className="text-xs mt-1 opacity-70">请先在「决策执行」页面完成决策确认</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full pb-24 bg-white">
      <ExecutionTimeline events={MOCK_TIMELINE} />
      <ActionItemStatusTable items={items} />
      <OutcomeForm disabled={false} />
    </div>
  );
}
