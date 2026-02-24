import React from "react";
import { 
  ArrowRight, 
  Workflow, 
  Plus, 
  Zap, 
  ShieldAlert, 
  PlayCircle,
  Clock,
  MoreHorizontal,
  GitBranch,
  Activity,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Reuse the Module interface or import it if I had a types file
export interface Module {
  id: string;
  name: string;
  icon: React.ElementType;
  count: number;
  status: string;
  mainText: string;
  hoverText: string;
}

interface ProcessOrchestrationViewProps {
  modules: Module[];
  onNavigate: (id: string) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

// --- Mock Data for Process List ---
const MOCK_PROCESSES = [
  {
    id: "p1",
    name: "大额转账风控阻断流程",
    version: "v1.2.0",
    status: "Active",
    updatedAt: "10 mins ago",
    trigger: "支付事件 (Payment)",
    steps: 5,
    riskLevel: "High"
  },
  {
    id: "p2",
    name: "VIP 客户流失召回",
    version: "v2.0.1",
    status: "Draft",
    updatedAt: "2 hours ago",
    trigger: "状态变更 (Status Change)",
    steps: 3,
    riskLevel: "Low"
  },
  {
    id: "p3",
    name: "新用户注册欢迎旅程",
    version: "v1.0.0",
    status: "Active",
    updatedAt: "1 day ago",
    trigger: "注册事件 (Signup)",
    steps: 8,
    riskLevel: "Medium"
  },
  {
    id: "p4",
    name: "异常交易自动化审计",
    version: "v1.0.5",
    status: "Active",
    updatedAt: "3 hours ago",
    trigger: "审计事件 (Audit)",
    steps: 6,
    riskLevel: "High"
  },
  {
    id: "p5",
    name: "营销活动权益发放控制",
    version: "v3.1.0",
    status: "Active",
    updatedAt: "5 hours ago",
    trigger: "权益事件 (Benefit)",
    steps: 12,
    riskLevel: "Low"
  },
  {
    id: "p6",
    name: "用户注销冷静期自动处理",
    version: "v1.0.0",
    status: "Draft",
    updatedAt: "2 days ago",
    trigger: "销户事件 (Deletion)",
    steps: 4,
    riskLevel: "Medium"
  },
  {
    id: "p7",
    name: "供应链预警通知流",
    version: "v2.2.0",
    status: "Active",
    updatedAt: "1 week ago",
    trigger: "库存事件 (Stock)",
    steps: 7,
    riskLevel: "High"
  }
];

export const ProcessOrchestrationView: React.FC<ProcessOrchestrationViewProps> = ({ modules, onNavigate }) => {
  
  const handleCreateProcess = () => {
    onNavigate('process-orchestration'); // Direct to workbench
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="flex gap-8 flex-1 min-h-0"
    >
      {/* Left: Process List & Quick Actions (70%) */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Quick Actions Board */}
        <div className="grid grid-cols-3 gap-4">
            <motion.div variants={item}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed border-2 bg-slate-50/50 hover:bg-white hover:border-indigo-200 group" onClick={handleCreateProcess}>
                    <CardContent className="flex flex-col items-center justify-center py-6 text-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                            <Plus className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <div className="font-semibold text-slate-900">新建流程</div>
                            <div className="text-xs text-slate-500 mt-1">从空白画布开始编排</div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={item}>
                 <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed border-2 bg-slate-50/50 hover:bg-white hover:border-yellow-200 group" onClick={() => onNavigate('business-events')}>
                    <CardContent className="flex flex-col items-center justify-center py-6 text-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-yellow-50 group-hover:bg-yellow-100 flex items-center justify-center transition-colors">
                            <Zap className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                            <div className="font-semibold text-slate-900">管理触发器</div>
                            <div className="text-xs text-slate-500 mt-1">配置业务事件 (Events)</div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={item}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed border-2 bg-slate-50/50 hover:bg-white hover:border-red-200 group" onClick={() => onNavigate('responsibility-risk')}>
                    <CardContent className="flex flex-col items-center justify-center py-6 text-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                            <ShieldAlert className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <div className="font-semibold text-slate-900">风险监控</div>
                            <div className="text-xs text-slate-500 mt-1">查看拦截日志与责任人</div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>

        {/* Process List */}
        <motion.div variants={item} className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Workflow className="h-5 w-5 text-slate-600" />
                    近期活跃流程
                </h3>
                <Button variant="ghost" size="sm" className="text-xs text-slate-500">查看全部</Button>
            </div>
            
            <Card className="flex-1 flex flex-col border-slate-200 shadow-sm bg-white overflow-hidden">
                <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b bg-slate-50/80 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    <div className="col-span-4">Process Name</div>
                    <div className="col-span-2">Trigger</div>
                    <div className="col-span-2">Risk Level</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2 text-right">Last Updated</div>
                </div>
                <ScrollArea className="flex-1">
                    <div className="divide-y divide-slate-100">
                        {MOCK_PROCESSES.map(proc => (
                            <div key={proc.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => onNavigate('process-orchestration')}>
                                <div className="col-span-4">
                                    <div className="font-medium text-slate-900 flex items-center gap-2">
                                        {proc.name}
                                        <Badge variant="outline" className="font-normal text-[10px] h-4 px-1 text-slate-400 border-slate-200">{proc.version}</Badge>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                                        <GitBranch className="h-3 w-3" />
                                        {proc.steps} Nodes
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <Badge variant="secondary" className="font-normal bg-slate-100 text-slate-600 hover:bg-slate-200 border-0">
                                        <Zap className="h-3 w-3 mr-1 text-yellow-500" />
                                        {proc.trigger.split('(')[0]}
                                    </Badge>
                                </div>
                                <div className="col-span-2">
                                    <div className={`flex items-center gap-1.5 text-xs font-medium ${
                                        proc.riskLevel === 'High' ? 'text-red-600' : 
                                        proc.riskLevel === 'Medium' ? 'text-amber-600' : 'text-green-600'
                                    }`}>
                                        <ShieldAlert className="h-3.5 w-3.5" />
                                        {proc.riskLevel}
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <div className="flex items-center gap-1.5">
                                        <div className={`h-2 w-2 rounded-full ${proc.status === 'Active' ? 'bg-green-500' : 'bg-slate-300'}`} />
                                        <span className="text-sm text-slate-700">{proc.status}</span>
                                    </div>
                                </div>
                                <div className="col-span-2 text-right text-xs text-slate-400 font-mono">
                                    {proc.updatedAt}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </Card>
        </motion.div>
      </div>

      {/* Right: Insights & Stats (30%) */}
      <motion.div variants={item} className="w-80 flex flex-col gap-6 shrink-0">
         
         <Card className="bg-indigo-600 text-white border-0 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <Activity className="h-32 w-32" />
            </div>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <PlayCircle className="h-5 w-5 text-indigo-200" />
                    编排中心
                </CardTitle>
                <CardDescription className="text-indigo-200">
                    Process Orchestration
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 relative z-10">
                    <div>
                        <div className="text-3xl font-bold">12</div>
                        <div className="text-sm text-indigo-200">Active Workflows</div>
                    </div>
                    <Separator className="bg-indigo-500/50" />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-xl font-semibold">1.2k</div>
                            <div className="text-xs text-indigo-200">Daily Executions</div>
                        </div>
                        <div>
                            <div className="text-xl font-semibold text-yellow-300">0.5%</div>
                            <div className="text-xs text-indigo-200">Error Rate</div>
                        </div>
                    </div>
                    <Button 
                        className="w-full bg-white text-indigo-600 hover:bg-indigo-50 mt-2 font-semibold"
                        onClick={() => onNavigate('process-orchestration')}
                    >
                        进入编排画布 <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </CardContent>
         </Card>

         <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">系统通知</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex gap-3 items-start">
                        <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-slate-800">风控规则拦截异常</div>
                            <div className="text-xs text-slate-500 mt-0.5">流程 "大额转账" 触发了 3 次 R-001 规则拦截。</div>
                            <div className="text-[10px] text-slate-400 mt-1">10 mins ago</div>
                        </div>
                    </div>
                    <div className="flex gap-3 items-start">
                         <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                            <Activity className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-slate-800">新流程已上线</div>
                            <div className="text-xs text-slate-500 mt-0.5">"VIP 召回" 流程已由 Admin 发布到生产环境。</div>
                            <div className="text-[10px] text-slate-400 mt-1">2 hours ago</div>
                        </div>
                    </div>
                </div>
            </CardContent>
         </Card>

      </motion.div>
    </motion.div>
  );
};
