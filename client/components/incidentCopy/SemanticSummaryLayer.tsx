import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Brain,
  Mail,
  Activity,
  AlertTriangle,
  ArrowRight,
  Edit2,
  MapPin,
  Package,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertOctagon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data for Semantic Summary
const MOCK_SEMANTIC_DATA = {
  email: {
    subject: "紧急：更改收货地址",
    sender: "zhang.san@example.com",
    receiver: "support@shop.com",
    intent: "modify_order",
    intentLabel: "修改订单信息",
    entities: [
      { id: "e1", type: "order", label: "订单号", value: "ORD-20240127-001", verified: true },
      { id: "e2", type: "address", label: "新地址", value: "北京市朝阳区三里屯 SOHO A座 1202", verified: false },
      { id: "e3", type: "product", label: "涉及商品", value: "iPhone 15 Pro Max", verified: true },
    ],
  },
  behavior: {
    signals: [
      { id: "b1", time: "10:32:15", action: "异地登录", detail: "IP: 192.168.1.1 (上海)", risk: "high" },
      { id: "b2", time: "10:33:00", action: "查看订单", detail: "ORD-20240127-001", risk: "low" },
      { id: "b3", time: "10:35:12", action: "发送邮件", detail: "Subject: 更改地址", risk: "medium" },
    ],
  },
  risk: {
    level: "high",
    score: 85,
    factors: [
      { id: "r1", label: "异地登录后立即修改地址", type: "pattern" },
      { id: "r2", label: "高价值商品 (¥9,999)", type: "value" },
      { id: "r3", label: "收货地址与注册地不符", type: "location" },
    ],
  },
};

interface SemanticSummaryLayerProps {
  onHighlight?: (factId: string | null) => void;
}

export default function SemanticSummaryLayer({ onHighlight }: SemanticSummaryLayerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState(MOCK_SEMANTIC_DATA);

  // Helper to handle highlight
  const handleMouseEnter = (factId: string | null) => {
    if (onHighlight) {
      onHighlight(factId);
    }
  };

  // Helper to render risk badge
  const renderRiskBadge = (level: string) => {
    switch (level) {
      case "high":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">高风险</Badge>;
      case "medium":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200">中风险</Badge>;
      case "low":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">低风险</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  return (
    <Card className="w-full border-slate-200 shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-100 text-purple-700 rounded-md">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">
                Layer 2: Semantic Summary (语义摘要)
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">AI 对事实切片的结构化理解与风险研判</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-slate-500"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit2 className="w-3 h-3 mr-1" />
            {isEditing ? "完成编辑" : "修正理解"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Module 1: Email Understanding */}
          <div
            className="space-y-3 flex flex-col"
            onMouseEnter={() => handleMouseEnter("evt_001")}
            onMouseLeave={() => handleMouseEnter(null)}
          >
            <div className="flex items-center gap-2 mb-1">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">邮件理解</h3>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 space-y-3 flex-1">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">邮件意图</label>
                <div className="flex items-center justify-between">
                  {isEditing ? (
                    <Select defaultValue={data.email.intent}>
                      <SelectTrigger className="h-7 text-xs w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modify_order">修改订单信息</SelectItem>
                        <SelectItem value="complaint">投诉反馈</SelectItem>
                        <SelectItem value="inquiry">一般咨询</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="font-medium text-sm text-slate-800 flex items-center gap-2">
                      {data.email.intentLabel}
                      <Badge
                        variant="outline"
                        className="text-[10px] h-4 px-1 text-green-600 bg-green-50 border-green-200"
                      >
                        98% 置信度
                      </Badge>
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100/50">
                <label className="text-[10px] text-slate-400">提取实体</label>
                <div className="space-y-2">
                  {data.email.entities.map((entity) => (
                    <div
                      key={entity.id}
                      className="group flex items-start gap-2 text-xs p-1.5 hover:bg-white rounded border border-transparent hover:border-slate-100 transition-colors cursor-pointer"
                    >
                      <div className="mt-0.5 text-slate-400">
                        {entity.type === "order" && <Package className="w-3 h-3" />}
                        {entity.type === "address" && <MapPin className="w-3 h-3" />}
                        {entity.type === "product" && <CreditCard className="w-3 h-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-[10px]">{entity.label}</span>
                          {entity.verified ? (
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                          ) : (
                            <Badge variant="secondary" className="text-[9px] h-3.5 px-0.5">
                              待确认
                            </Badge>
                          )}
                        </div>
                        <div className="font-medium text-slate-800 truncate" title={entity.value}>
                          {entity.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Module 2: Behavior Signals */}
          <div className="space-y-3 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-3.5 h-3.5 text-slate-500" />
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">行为信号 (Time Series)</h3>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 overflow-hidden flex-1">
              <div className="relative pl-3 space-y-4 before:absolute before:left-[5px] before:top-1 before:bottom-1 before:w-[1px] before:bg-slate-200">
                {data.behavior.signals.map((signal, idx) => (
                  <div
                    key={signal.id}
                    className="relative text-xs cursor-pointer hover:bg-slate-100/50 -mx-1 px-1 rounded transition-colors"
                    onMouseEnter={() => handleMouseEnter(idx === 0 ? "evt_002" : idx === 1 ? "evt_003" : "evt_001")}
                    onMouseLeave={() => handleMouseEnter(null)}
                  >
                    {/* Timeline dot */}
                    <div
                      className={cn(
                        "absolute -left-[11px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm",
                        signal.risk === "high"
                          ? "bg-red-500"
                          : signal.risk === "medium"
                            ? "bg-orange-400"
                            : "bg-slate-300",
                      )}
                    />

                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-medium text-slate-800">{signal.action}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{signal.time}</span>
                    </div>
                    <p className="text-slate-500 leading-tight">{signal.detail}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/50 text-center">
                <Button variant="link" size="sm" className="text-[10px] h-6 text-slate-500">
                  查看完整时间轴 <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>

          {/* Module 3: Risk Prompts */}
          <div className="space-y-3 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">风险提示</h3>
            </div>

            <div className="bg-red-50/50 rounded-lg p-3 border border-red-100 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-red-600 font-medium">综合风险等级</span>
                {renderRiskBadge(data.risk.level)}
              </div>

              <div className="space-y-2 flex-1">
                {data.risk.factors.map((factor) => (
                  <div
                    key={factor.id}
                    className="flex items-start gap-2 bg-white p-2 rounded border border-red-100/50 shadow-sm"
                  >
                    <AlertOctagon className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                    <span className="text-xs text-slate-700">{factor.label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-2 border-t border-red-100">
                <Button size="sm" className="w-full h-7 text-xs bg-red-600 hover:bg-red-700 text-white shadow-sm">
                  标记为欺诈事件
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
