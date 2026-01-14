import React, { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Box, 
  Layers, 
  ShieldAlert, 
  GitMerge, 
  Activity, 
  Scale, 
  Workflow,
  Check,
  X,
  History,
  Plus,
  Network,
  Edit2,
  LayoutGrid,
  GitGraph,
  Plug,
  Database,
  ShieldCheck,
  ArrowRight,
  Radar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

import { DigitalModelView } from "./DigitalModelView";
import { ProcessOrchestrationView } from "./ProcessOrchestrationView";

// --- Mock Data ---

const INITIAL_MODEL_INFO = {
  name: "企业核心业务模型 2025",
  version: "v1.2.0-beta",
  status: "In Review",
};

const MOCK_VERSIONS = [
  { version: "v1.2.0-beta", date: "2024-12-30", author: "System Architect", description: "新增行为能力模块" },
  { version: "v1.1.0", date: "2024-12-15", author: "System Architect", description: "完成业务对象定义" },
  { version: "v1.0.0", date: "2024-11-20", author: "Admin", description: "初始化项目" },
];

const allModules = [
  {
    id: "business-objects",
    name: "业务实体 (Core Entities)",
    icon: Database,
    count: 12,
    status: "完成",
    mainText: "定义企业核心数据结构及其内在生命周期。",
    hoverText: "包含客户、订单、商品等核心业务对象的元数据定义、数据库映射及生命周期状态机。",
    category: "digital",
    metrics: [
        { label: "已定义对象", value: "12" },
        { label: "关联表总数", value: "34" }
    ]
  },
  {
    id: "behavior-capabilities",
    name: "标准能力 (Capability Plugins)",
    icon: Plug,
    count: 28,
    status: "部分完成",
    mainText: "可被流程编排调用的标准化业务执行单元（原子算子）。",
    hoverText: "将业务动作封装为标准化的输入输出接口，如“创建订单”、“冻结账户”，供流程引擎调用。",
    category: "digital",
    metrics: [
        { label: "API 覆盖率", value: "85%" },
        { label: "可用插件", value: "28" }
    ]
  },
  {
    id: "business-baseline",
    name: "全局守则 (Policy & Guardrails)",
    icon: ShieldCheck,
    count: 5,
    status: "未配置",
    mainText: "跨流程的全局约束、风险拦截与合规准则。",
    hoverText: "定义不可被违反的底线规则，如“单笔交易限额”、“GDPR 隐私合规”，自动拦截违规操作。",
    category: "digital",
    metrics: [
        { label: "生效规则", value: "5" },
        { label: "拦截等级", value: "High" }
    ]
  },
  // Process Tab Modules (Kept for compatibility with Tab switching logic)
  {
    id: "business-events",
    name: "业务事件 (Events)",
    icon: Layers,
    count: 8,
    status: "部分完成",
    mainText: "定义值得被系统或智能体感知的业务变化信号。",
    hoverText: "业务事件来源于状态变化、规则触发或关键字段变化，用于触发流程、通知或智能响应。",
    category: "process"
  },
  {
    id: "responsibility-risk",
    name: "责任与风险 (Responsibility)",
    icon: ShieldAlert,
    count: 4,
    status: "未配置",
    mainText: "明确业务结果的责任归属与风险升级机制。",
    hoverText: "当能力执行失败、规则被触发或出现异常时，系统通过责任模型明确由谁负责、如何升级处理。",
    category: "process"
  },
  {
    id: "process-orchestration",
    name: "流程编排 (Processes)",
    icon: Workflow,
    count: 2,
    status: "未配置",
    mainText: "定义跨角色的业务执行流与自动化路径。",
    hoverText: "编排能力与规则的执行顺序，定义 Agent 在业务流程中的活动边界与协作模式。",
    category: "process"
  },
];

const getCompletionFromStatus = (status: string) => {
  if (status === "完成") return 100;
  if (status === "部分完成") return 50;
  return 0;
};

const EnterpriseModelOverview = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // --- State ---
  const activeTab = (searchParams.get("tab") as "digital" | "process") || "digital";
  
  const setActiveTab = (tab: "digital" | "process") => {
     setSearchParams({ tab }, { replace: true });
   };

  const [modelInfo, setModelInfo] = useState(INITIAL_MODEL_INFO);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(INITIAL_MODEL_INFO.name);
  
  const [versions, setVersions] = useState(MOCK_VERSIONS);
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
  const [newVersionForm, setNewVersionForm] = useState({ version: "", description: "" });

  // --- Computed ---
  const currentModules = useMemo(() => {
    return allModules.filter(m => m.category === activeTab);
  }, [activeTab]);

  const completion = useMemo(() => {
    if (currentModules.length === 0) return 0;
    const total = currentModules.reduce((acc, curr) => acc + getCompletionFromStatus(curr.status), 0);
    return Math.round(total / currentModules.length);
  }, [currentModules]);

  // --- Handlers ---

  const handleStartEditName = () => {
    setTempName(modelInfo.name);
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      setModelInfo(prev => ({ ...prev, name: tempName }));
    }
    setIsEditingName(false);
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
  };

  const handleVersionChange = (version: string) => {
    const selectedVersion = versions.find(v => v.version === version);
    if (selectedVersion) {
      setModelInfo(prev => ({ 
        ...prev, 
        version: selectedVersion.version,
      }));
    }
  };

  const handleCreateVersion = () => {
    if (!newVersionForm.version) return;

    const newVersion = {
      version: newVersionForm.version,
      date: new Date().toISOString().split('T')[0],
      author: "Current User",
      description: newVersionForm.description || "No description"
    };

    setVersions([newVersion, ...versions]);
    setModelInfo(prev => ({ ...prev, version: newVersion.version }));
    setIsVersionDialogOpen(false);
    setNewVersionForm({ version: "", description: "" });
  };

  const handleNavigate = (moduleId: string) => {
    if (moduleId === "business-objects") {
      navigate("/enterprise/entities");
    } else if (moduleId === "behavior-capabilities") {
      navigate("/enterprise/capabilities");
    } else if (moduleId === "business-baseline") {
      navigate("/enterprise/rules");
    } else if (moduleId === "lifecycle") {
        // Lifecycle is now part of entities, but if standalone link is needed
      navigate("/enterprise/entities"); 
    } else if (moduleId === "business-events") {
      navigate("/enterprise/events");
    } else if (moduleId === "responsibility-risk") {
      navigate("/enterprise/responsibility");
    } else if (moduleId === "process-orchestration") {
      navigate("/enterprise/process");
    } else {
      console.log(`Navigate to module: ${moduleId}`);
    }
  };

  return (
    <div className="h-full w-full bg-[#F8F9FB] flex flex-col overflow-hidden">
      
      {/* 1. Unified Header Area */}
      <div className="bg-white/50 backdrop-blur-md border-b border-slate-200/60 px-8 py-6 sticky top-0 z-10">
        
        {/* Row 1: Tabs & Meta Actions */}
        <div className="flex justify-between items-center mb-8">
          {/* Tab Switcher - Capsule Style */}
          <div className="bg-slate-100/80 p-1 rounded-full flex gap-1 border border-slate-200/50">
            <button
              onClick={() => setActiveTab("digital")}
              className={`
                flex items-center gap-2 px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-300
                ${activeTab === "digital" 
                  ? "bg-white text-primary shadow-sm ring-1 ring-black/5" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}
              `}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              企业数字模型
            </button>
            <button
              onClick={() => setActiveTab("process")}
              className={`
                flex items-center gap-2 px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-300
                ${activeTab === "process" 
                  ? "bg-white text-primary shadow-sm ring-1 ring-black/5" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}
              `}
            >
              <GitGraph className="w-3.5 h-3.5" />
              企业业务流程编排
            </button>
          </div>

          {/* Right Actions: Version & Status */}
          <div className="flex items-center gap-3">
             <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-sm">
                <Select value={modelInfo.version} onValueChange={handleVersionChange}>
                  <SelectTrigger className="h-7 w-[130px] border-none text-xs font-mono bg-transparent focus:ring-0">
                    <History className="h-3 w-3 mr-2 text-slate-400" />
                    <SelectValue placeholder="Version" />
                  </SelectTrigger>
                  <SelectContent>
                    {versions.map(v => (
                      <SelectItem key={v.version} value={v.version} className="text-xs">
                        <span className="font-mono font-medium mr-2">{v.version}</span>
                        <span className="text-slate-400 scale-90">{v.date}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="w-px h-4 bg-slate-200 mx-1"></div>
                <Dialog open={isVersionDialogOpen} onOpenChange={setIsVersionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-slate-500 hover:text-primary">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>创建新版本</DialogTitle>
                      <DialogDescription>
                        创建一个新的模型版本快照。当前所有配置将被保存到新版本中。
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>版本号</Label>
                        <Input 
                          placeholder="e.g. v1.3.0" 
                          value={newVersionForm.version}
                          onChange={(e) => setNewVersionForm(prev => ({ ...prev, version: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>版本描述</Label>
                        <Textarea 
                          placeholder="描述此版本的关键变更..." 
                          value={newVersionForm.description}
                          onChange={(e) => setNewVersionForm(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsVersionDialogOpen(false)}>取消</Button>
                      <Button onClick={handleCreateVersion}>创建版本</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
             </div>

             <Badge className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200 border px-3 py-1 font-normal">
                {modelInfo.status}
             </Badge>
          </div>
        </div>

        {/* Row 2: Title & Progress Info */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="flex-1">
             <div className="flex items-center gap-3 mb-1">
               {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <Input 
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="h-10 w-80 text-2xl font-bold bg-white/50 backdrop-blur"
                      autoFocus
                    />
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={handleSaveName}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={handleCancelEditName}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-2 group">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                      {modelInfo.name}
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={activeTab}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.2 }}
                          className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 ml-2 font-semibold"
                        >
                           - {activeTab === 'digital' ? '数字底座' : '流程编排'}
                        </motion.span>
                      </AnimatePresence>
                    </h1>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-600 mb-1"
                      onClick={handleStartEditName}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
             </div>
             <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
               Last updated on {versions.find(v => v.version === modelInfo.version)?.date}
               {activeTab === 'digital' && (
                 <span className="ml-4 flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs border border-emerald-100">
                    <Activity className="w-3 h-3" />
                    底座运行稳定
                 </span>
               )}
             </p>
          </div>

          <div className="w-full md:w-80 pb-1">
            <div className="flex justify-between text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
               <AnimatePresence mode="wait">
                  <motion.span
                     key={activeTab}
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                  >
                    {activeTab === 'digital' ? '模型完成度' : '编排完成度'}
                  </motion.span>
               </AnimatePresence>
               <span className="text-primary font-bold">{completion}%</span>
            </div>
            <Progress value={completion} className="h-2 bg-slate-100" />
          </div>
        </div>
      </div>

      {/* 2. Content Area */}
      <div className="flex-1 overflow-hidden p-8 flex flex-col min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col min-h-0"
            >
              {activeTab === "digital" ? (
                // --- Customized Grid for Digital Model ---
                <ScrollArea className="flex-1 -mx-2 px-2">
                  <div className="grid grid-cols-3 gap-6 pb-4">
                    {currentModules.map(module => (
                         <Card key={module.id} className="hover:shadow-lg transition-all duration-300 border-gray-100 bg-white/80 backdrop-blur-sm hover:-translate-y-1 flex flex-col h-full text-left group cursor-pointer" onClick={() => handleNavigate(module.id)}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="p-2.5 bg-primary/5 rounded-xl border border-primary/10 group-hover:bg-primary/10 transition-colors">
                                        <module.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <Badge variant="outline" className={`${
                                        module.status === "完成" ? "bg-green-50 text-green-700 border-green-200" :
                                        module.status === "部分完成" ? "bg-blue-50 text-blue-700 border-blue-200" : "text-slate-400 border-slate-200"
                                    } font-normal`}>
                                        {module.status}
                                    </Badge>
                                </div>
                                <CardTitle className="text-lg mt-4 text-slate-900">{module.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <p className="text-sm text-slate-500 leading-relaxed min-h-[40px]">
                                        {module.mainText}
                                    </p>
                                    
                                    {/* Metrics Grid */}
                                    {module.metrics && (
                                        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
                                            {module.metrics.map((metric, idx) => (
                                                <div key={idx}>
                                                    <div className="text-xs text-slate-400 uppercase tracking-wide scale-90 origin-left">{metric.label}</div>
                                                    <div className="text-sm font-semibold text-slate-700">{metric.value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="mt-6 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                    进入配置 <ArrowRight className="ml-1 h-4 w-4" />
                                </div>
                            </CardContent>
                         </Card>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <ProcessOrchestrationView modules={currentModules} onNavigate={handleNavigate} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 3. Bottom Relationship Overview (Fixed & Enhanced) */}
        {activeTab === "digital" && (
          <div className="mt-auto pt-8">
          <Card className="hover:shadow-sm transition-shadow border-dashed border-2 border-slate-200 bg-slate-50/50">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-200 rounded-md">
                        <Network className="h-4 w-4 text-slate-600" />
                    </div>
                    <CardTitle className="text-base text-slate-700">模型关系闭环总览</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative flex items-center justify-between gap-4 px-8 py-4">
                    {/* Connecting Line */}
                    <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-slate-200 -z-10 -translate-y-1/2" />

                    {/* Node 1: Entity */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center gap-2 min-w-[180px] hover:border-blue-300 hover:shadow-md transition-all">
                        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                            <Database className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-slate-800 text-sm">实体提供数据</div>
                            <div className="text-xs text-slate-500 mt-1">Core Data Structure</div>
                        </div>
                    </div>

                    <ArrowRight className="h-5 w-5 text-slate-400 flex-shrink-0" />

                    {/* Node 2: Capability */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center gap-2 min-w-[180px] hover:border-purple-300 hover:shadow-md transition-all">
                        <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center border border-purple-100">
                            <Plug className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-slate-800 text-sm">能力提供动作</div>
                            <div className="text-xs text-slate-500 mt-1">Standard Actions</div>
                        </div>
                    </div>

                    <ArrowRight className="h-5 w-5 text-slate-400 flex-shrink-0" />

                    {/* Node 3: Rules */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center gap-2 min-w-[180px] hover:border-red-300 hover:shadow-md transition-all">
                        <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
                            <ShieldCheck className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-slate-800 text-sm">规则提供边界</div>
                            <div className="text-xs text-slate-500 mt-1">Guardrails & Policy</div>
                        </div>
                    </div>

                    <ArrowRight className="h-5 w-5 text-slate-400 flex-shrink-0" />

                    {/* Node 4: Process */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center gap-2 min-w-[180px] hover:border-orange-300 hover:shadow-md transition-all">
                        <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100">
                            <Workflow className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-slate-800 text-sm">流程进行调度</div>
                            <div className="text-xs text-slate-500 mt-1">Orchestration</div>
                        </div>
                    </div>

                </div>
              </CardContent>
            </Card>
          </div>
        )}
        </div>
      </div>
  );
};

export default EnterpriseModelOverview;
