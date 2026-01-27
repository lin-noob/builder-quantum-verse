import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Share2,
  Database,
  Zap,
  BookOpen,
  Box,
  Clock,
  Activity,
  History,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import InstanceGraph from "@/components/Knowledge/InstanceGraph";

// Mock data for Instance Detail (Runtime)
interface InstanceData {
  id: string;
  typeId: string;
  typeName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  relatedObjectsCount: number;
  recentEventsCount: number;
  staticProperties: Record<string, string | number>;
  runtimeMetrics: Record<string, string | number>;
  stateHistory: { timestamp: string; from: string; to: string; event: string }[];
  events: { id: string; name: string; timestamp: string; type: string }[];
}

const mockInstanceData: InstanceData = {
  id: "ORD-20240321-001",
  typeId: "ORDER",
  typeName: "订单 (Order)",
  status: "已支付",
  createdAt: "2024-03-21 10:30:00",
  updatedAt: "2024-03-21 10:35:12",
  relatedObjectsCount: 5,
  recentEventsCount: 3,
  staticProperties: {
    "订单号": "ORD-20240321-001",
    "客户 ID": "CUST-8821",
    "区域": "北美",
  },
  runtimeMetrics: {
    "总金额": "¥1,250.00",
    "应用折扣": "10%",
    "风险评分": "低 (12)",
  },
  stateHistory: [
    { timestamp: "2024-03-21 10:30:00", from: "-", to: "已创建", event: "订单创建" },
    { timestamp: "2024-03-21 10:32:00", from: "已创建", to: "待支付", event: "结账" },
    { timestamp: "2024-03-21 10:35:12", from: "待支付", to: "已支付", event: "支付成功" },
  ],
  events: [
    { id: "EVT-001", name: "订单创建", timestamp: "2024-03-21 10:30:00", type: "生命周期" },
    { id: "EVT-002", name: "支付已处理", timestamp: "2024-03-21 10:35:12", type: "交易" },
    { id: "EVT-003", name: "邮件已发送", timestamp: "2024-03-21 10:35:15", type: "通知" },
  ],
};

const InstanceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic");
  const [data, setData] = useState<InstanceData | null>(null);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setData({ ...mockInstanceData, id: id || "UNKNOWN" });
    }, 500);
  }, [id]);

  if (!data)
    return (
      <div className="p-10 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
      </div>
    );

  const navItems = [
    { id: "basic", label: "运行快照", icon: Activity },
    { id: "properties", label: "运行属性", icon: Database },
    { id: "relations", label: "实例图谱", icon: Share2 },
    { id: "actions", label: "运行动作", icon: Zap },
    { id: "rules", label: "规则与推理", icon: BookOpen },
  ];

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b flex items-center px-6 justify-between shrink-0 bg-white z-20 shadow-sm sticky top-0 border-purple-100">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50">
              <Box className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-slate-900">{data.id}</h1>
                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200">
                  {data.status}
                </Badge>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                所属类型 <span className="font-semibold text-slate-700">{data.typeName}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 overflow-y-auto flex flex-col z-10 py-6">
          <div className="px-4 flex-1">
            <div className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${activeTab === item.id ? "bg-purple-50 text-purple-700" : "text-slate-600 hover:bg-slate-50"}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 ${activeTab === item.id ? "text-purple-600" : "text-slate-400"}`} />
                    {item.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-hidden flex flex-col bg-white">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full">
            <div className="h-14 border-b bg-white flex items-center px-8 sticky top-0 shrink-0">
              <h2 className="text-lg font-semibold text-slate-800">
                {activeTab === "basic" && "基础信息 (运行快照)"}
                {activeTab === "properties" && "属性视图 (运行属性)"}
                {activeTab === "relations" && "关系画布 (实例图谱)"}
                {activeTab === "actions" && "动作面板 (执行动作)"}
                {activeTab === "rules" && "规则与推理 (运行规则)"}
              </h2>
            </div>

            <div className="flex-1 p-8 overflow-hidden flex flex-col">
              <div className="max-w-[1200px] w-full h-full flex flex-col">
                
                {/* 1. Runtime Snapshot */}
                {activeTab === "basic" && (
                  <TabsContent value="basic" className="mt-0 h-full flex flex-col overflow-y-auto" forceMount>
                    <div className="grid grid-cols-12 gap-8">
                      <div className="col-span-8 space-y-6">
                        <section className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                          <h3 className="font-bold text-slate-900 mb-4">核心信息</h3>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                              <Label className="text-slate-500 text-xs uppercase">实例 ID</Label>
                              <div className="font-mono text-sm">{data.id}</div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-slate-500 text-xs uppercase">当前状态</Label>
                              <div><Badge className="bg-green-100 text-green-700 border-green-200">{data.status}</Badge></div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-slate-500 text-xs uppercase">创建时间</Label>
                              <div className="text-sm">{data.createdAt}</div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-slate-500 text-xs uppercase">最后更新</Label>
                              <div className="text-sm">{data.updatedAt}</div>
                            </div>
                          </div>
                        </section>

                         <section className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                           <h3 className="font-bold text-slate-900 mb-4">近期事件</h3>
                           <div className="space-y-4">
                             {data.events.map(event => (
                               <div key={event.id} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                                 <div className="flex items-center gap-3">
                                   <div className="p-1.5 bg-blue-50 rounded text-blue-600"><Clock className="w-4 h-4"/></div>
                                   <div>
                                     <div className="text-sm font-medium text-slate-900">{event.name}</div>
                                     <div className="text-xs text-slate-500">{event.timestamp}</div>
                                   </div>
                                 </div>
                                 <Badge variant="outline" className="text-xs">{event.type}</Badge>
                               </div>
                             ))}
                           </div>
                         </section>
                      </div>

                      <div className="col-span-4 space-y-6">
                        <div className="bg-slate-50 rounded-lg p-5 border border-slate-100">
                          <h4 className="text-sm font-bold text-slate-800 mb-4">运行指标</h4>
                          <div className="space-y-4">
                             <div className="bg-white p-3 rounded border border-slate-200 shadow-sm flex justify-between items-center">
                               <span className="text-sm text-slate-600">关联对象</span>
                               <span className="font-bold text-slate-900">{data.relatedObjectsCount}</span>
                             </div>
                             <div className="bg-white p-3 rounded border border-slate-200 shadow-sm flex justify-between items-center">
                               <span className="text-sm text-slate-600">近期事件</span>
                               <span className="font-bold text-slate-900">{data.recentEventsCount}</span>
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                )}

                {/* 2. Runtime Properties */}
                {activeTab === "properties" && (
                  <TabsContent value="properties" className="mt-0 h-full flex flex-col overflow-y-auto" forceMount>
                     <div className="grid grid-cols-2 gap-6">
                       {/* Static Properties */}
                       <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                         <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                           <Database className="w-4 h-4 text-slate-500"/> 静态属性
                         </h3>
                         <div className="space-y-3">
                           {Object.entries(data.staticProperties).map(([key, value]) => (
                             <div key={key} className="flex justify-between py-2 border-b border-slate-50 last:border-0">
                               <span className="text-sm text-slate-500">{key}</span>
                               <span className="text-sm font-medium text-slate-900">{value}</span>
                             </div>
                           ))}
                         </div>
                       </div>

                       {/* Runtime Metrics */}
                       <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                         <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                           <Activity className="w-4 h-4 text-slate-500"/> 运行指标
                         </h3>
                         <div className="space-y-3">
                           {Object.entries(data.runtimeMetrics).map(([key, value]) => (
                             <div key={key} className="flex justify-between py-2 border-b border-slate-50 last:border-0">
                               <span className="text-sm text-slate-500">{key}</span>
                               <span className="text-sm font-medium text-slate-900">{value}</span>
                             </div>
                           ))}
                         </div>
                       </div>
                       
                       {/* State History */}
                       <div className="col-span-2 bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                           <History className="w-4 h-4 text-slate-500"/> 状态流转记录
                         </h3>
                         <div className="relative border-l-2 border-slate-100 ml-3 space-y-6 py-2">
                           {data.stateHistory.map((history, idx) => (
                             <div key={idx} className="relative pl-6">
                               <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-purple-400"></div>
                               <div className="flex items-center gap-2 mb-1">
                                 <span className="text-sm font-bold text-slate-900">{history.to}</span>
                                 <span className="text-xs text-slate-400">触发事件: {history.event}</span>
                               </div>
                               <div className="text-xs text-slate-500">{history.timestamp}</div>
                             </div>
                           ))}
                         </div>
                       </div>
                     </div>
                  </TabsContent>
                )}

                {/* 3. Instance Graph */}
                {activeTab === "relations" && (
                  <TabsContent value="relations" className="mt-0 h-full flex flex-col" forceMount>
                     <div className="h-full w-full">
                        <InstanceGraph instanceId={data.id} />
                     </div>
                  </TabsContent>
                )}

                {/* 4. Runtime Actions */}
                {activeTab === "actions" && (
                  <TabsContent value="actions" className="mt-0 h-full flex flex-col" forceMount>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Mock Action */}
                        <div className="p-5 border rounded-xl bg-white border-slate-200 hover:border-purple-200 transition-all shadow-sm">
                          <div className="flex justify-between items-start mb-3">
                             <h4 className="font-bold text-slate-900">发货</h4>
                             <Badge>流转</Badge>
                          </div>
                          <div className="text-sm text-slate-600 mb-4">
                            状态流转: 从 <span className="font-mono bg-slate-100 px-1 rounded">PAID</span> 到 <span className="font-mono bg-slate-100 px-1 rounded">SHIPPED</span>。
                          </div>
                          <div className="bg-slate-50 p-3 rounded text-xs space-y-2 mb-4">
                            <div className="flex justify-between">
                              <span className="text-slate-500">触发事件:</span>
                              <span className="font-medium">LOGISTICS_PICKUP</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">前置条件:</span>
                              <span className="font-medium">已分配追踪号</span>
                            </div>
                          </div>
                          <Button className="w-full bg-purple-600 hover:bg-purple-700">执行动作</Button>
                        </div>
                     </div>
                  </TabsContent>
                )}

                {/* 5. Runtime Rules */}
                {activeTab === "rules" && (
                  <TabsContent value="rules" className="mt-0 h-full flex flex-col" forceMount>
                    <div className="space-y-6">
                      {/* Hard Rules */}
                      <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                        <h4 className="font-bold text-red-800 flex items-center gap-2 mb-2">
                          <AlertCircle className="w-4 h-4"/> 硬性规则 (阻断)
                        </h4>
                        <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
                          <li>无有效地址无法发货。</li>
                          <li>总金额必须为正数。</li>
                        </ul>
                      </div>

                      {/* State Rules */}
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <h4 className="font-bold text-blue-800 flex items-center gap-2 mb-2">
                          <Activity className="w-4 h-4"/> 状态规则
                        </h4>
                        <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
                          <li>退款动作仅在“已支付”状态可见。</li>
                          <li>发货后隐藏“取消”动作。</li>
                        </ul>
                      </div>
                      
                      {/* Inference */}
                      <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                         <h4 className="font-bold text-purple-800 flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4"/> AI 推理建议
                        </h4>
                         <p className="text-sm text-purple-700 mb-2">
                           基于当前状态和历史记录，系统建议：
                         </p>
                         <div className="bg-white p-3 rounded border border-purple-100 text-sm text-slate-700 shadow-sm">
                           退货概率为 <b>低 (5%)</b>。建议使用标准发货速度。
                         </div>
                      </div>
                    </div>
                  </TabsContent>
                )}
              </div>
            </div>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default InstanceDetailPage;
