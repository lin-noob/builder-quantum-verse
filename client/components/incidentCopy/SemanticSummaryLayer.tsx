import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  FileText,
  Target,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types for AI Output based on AI_Output_Structure_Mapping.md
interface CoreIntent {
  type: string;
  sub_type: string;
  urgency_signals: string[];
}

interface EntityOrder {
  id: string;
  mentioned_in: string;
  customer_claim: string;
}

interface EntityProduct {
  sku: string;
  description_in_text: string;
}

interface EntityMonetary {
  currency: string;
  amount: number | string;
  context: string;
}

interface Entities {
  orders: EntityOrder[];
  products: EntityProduct[];
  monetary: EntityMonetary[];
}

interface ContextInfo {
  conversation_stage: string;
  thread_position: string | number;
  references_history: boolean;
  unresolved_commitment: { promise: string } | null;
}

interface GapRecord {
  field: string;
  impact: string;
}

interface UnverifiedClaim {
  claim: string;
  against_system_record: string;
  status: string;
}

interface GapsAndInconsistencies {
  missing_critical_data: GapRecord[];
  unverified_claims: UnverifiedClaim[];
  anaphora_to_resolve: any[];
}

interface AISemanticData {
  natural_language_summary: string;
  core_intent: CoreIntent;
  entities: Entities;
  context: ContextInfo;
  gaps_and_inconsistencies: GapsAndInconsistencies;
}

// Mock Data for Fallback
const DEFAULT_FALLBACK_DATA: AISemanticData = {
  natural_language_summary: "系统尚未生成此次事件的语义摘要。AI 分析正在由于网络或数据延迟稍后呈现。",
  core_intent: { type: "unknown", sub_type: "unknown", urgency_signals: [] },
  entities: { orders: [], products: [], monetary: [] },
  context: {
    conversation_stage: "initial",
    thread_position: 1,
    references_history: false,
    unresolved_commitment: null,
  },
  gaps_and_inconsistencies: { missing_critical_data: [], unverified_claims: [], anaphora_to_resolve: [] },
};

interface SemanticSummaryLayerProps {
  semanticData?: AISemanticData;
  onHighlight?: (factId: string | null) => void;
}

export default function SemanticSummaryLayer({ semanticData, onHighlight }: SemanticSummaryLayerProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Parse semanticData
  const parsedData = useMemo(() => {
    if (!semanticData) return DEFAULT_FALLBACK_DATA;
    try {
      return semanticData;
    } catch (e) {
      console.error("Failed to parse semantic summary JSON:", e);
      return DEFAULT_FALLBACK_DATA;
    }
  }, [semanticData]);

  const { natural_language_summary, core_intent, entities, context, gaps_and_inconsistencies } = parsedData;

  // Helper to handle highlight
  const handleMouseEnter = (factId: string | null) => {
    if (onHighlight) {
      onHighlight(factId);
    }
  };

  return (
    <Card className="w-full border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-100 text-purple-700 rounded-md">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">
                Layer 2: Semantic Summary (语义摘要)
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">AI 对事实切片的结构化理解与建议</p>
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

      <CardContent className="p-4 space-y-6">
        {/* Section 1: Natural Language Summary */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-700">自然语言摘要</h3>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm text-slate-600 leading-relaxed shadow-inner">
            {natural_language_summary}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Section 2.1: Core Intent */}
          <div className="space-y-3 bg-white border border-slate-100 rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1 bg-blue-50 text-blue-600 rounded">
                <Target className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">核心意图 (Core Intent)</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">类型 (Type)</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                  {core_intent.type}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">子类型 (Sub-type)</span>
                <span className="font-medium text-slate-800">{core_intent.sub_type}</span>
              </div>
              <div className="pt-2 flex flex-wrap gap-1">
                {core_intent.urgency_signals.map((signal, i) => (
                  <Badge key={i} className="bg-red-50 text-red-600 border-red-100 text-[10px] h-5">
                    {signal}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2.2: Context */}
          <div className="space-y-3 bg-white border border-slate-100 rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1 bg-slate-50 text-slate-600 rounded">
                <History className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">上下文 (Context)</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">对话阶段</span>
                <span className="font-medium text-slate-800">{context.conversation_stage}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">邮件位置</span>
                <span className="font-medium text-slate-800">第 {context.thread_position} 封</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">参考历史</span>
                {context.references_history ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Badge variant="secondary" className="text-[10px] h-4">
                    否
                  </Badge>
                )}
              </div>
              {context.unresolved_commitment && (
                <div className="mt-2 bg-orange-50 p-2 rounded border border-orange-100">
                  <div className="text-[10px] font-bold text-orange-700 mb-1">未解决承诺</div>
                  <div className="text-[10px] text-orange-600 italic">"{context.unresolved_commitment.promise}"</div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2.3: Entities */}
          <div className="col-span-1 md:col-span-2 space-y-3 bg-white border border-slate-100 rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1 bg-amber-50 text-amber-600 rounded">
                <Package className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">实体识别 (Entities)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Orders */}
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase">订单 (Orders)</label>
                <div className="space-y-2">
                  {entities.orders.length > 0 ? (
                    entities.orders.map((o, i) => (
                      <div key={i} className="p-2 border rounded bg-slate-50/50">
                        <div className="text-xs font-bold text-slate-800">{o.id}</div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          来源: {o.mentioned_in} · {o.customer_claim}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-[10px] text-slate-300 italic">未发现相关订单</div>
                  )}
                </div>
              </div>
              {/* Products */}
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase">商品 (Products)</label>
                <div className="space-y-2">
                  {entities.products.length > 0 ? (
                    entities.products.map((p, i) => (
                      <div key={i} className="p-2 border rounded bg-slate-50/50">
                        <div className="text-xs font-bold text-slate-800">{p.sku}</div>
                        <div className="text-[10px] text-slate-500 mt-1">{p.description_in_text}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-[10px] text-slate-300 italic">未发现商品信息</div>
                  )}
                </div>
              </div>
              {/* Monetary */}
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase">金额 (Monetary)</label>
                <div className="space-y-2">
                  {entities.monetary.length > 0 ? (
                    entities.monetary.map((m, i) => (
                      <div key={i} className="p-2 border rounded bg-slate-50/50">
                        <div className="text-xs font-bold text-slate-800">
                          {m.currency} {m.amount}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">{m.context}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-[10px] text-slate-300 italic">未发现金额引用</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2.4: Gaps & Inconsistencies */}
          <div className="col-span-1 md:col-span-2 space-y-3 bg-red-50/30 border border-red-100 rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1 bg-red-100 text-red-600 rounded">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold uppercase text-red-800 tracking-wider">
                缺口与矛盾 (Gaps & Inconsistencies)
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] text-red-800/60 font-bold uppercase tracking-tighter">缺失关键信息</label>
                <div className="space-y-2">
                  {gaps_and_inconsistencies.missing_critical_data.length > 0 ? (
                    gaps_and_inconsistencies.missing_critical_data.map((gap, i) => (
                      <div key={i} className="bg-white p-2 rounded border border-red-100 shadow-sm">
                        <div className="text-xs font-bold text-red-600">{gap.field}</div>
                        <div className="text-[10px] text-slate-600 mt-1">{gap.impact}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-[10px] text-slate-400 italic">无缺失信息</div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-red-800/60 font-bold uppercase tracking-tighter">未验证陈述</label>
                <div className="space-y-2">
                  {gaps_and_inconsistencies.unverified_claims.length > 0 ? (
                    gaps_and_inconsistencies.unverified_claims.map((claim, i) => (
                      <div
                        key={i}
                        className="bg-white p-2 rounded border border-red-100 shadow-sm relative overflow-hidden"
                      >
                        <div className="text-xs font-bold text-amber-700">{claim.claim}</div>
                        <div className="text-[10px] text-slate-600 mt-1">vs 系统: {claim.against_system_record}</div>
                        <Badge className="absolute top-2 right-2 text-[8px] h-3 px-1 bg-red-50 text-red-600 border-red-100">
                          {claim.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-[10px] text-slate-400 italic">无未验证陈述</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
