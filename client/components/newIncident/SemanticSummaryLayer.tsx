import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Target, 
  Package, 
  CreditCard, 
  History, 
  AlertTriangle, 
  HelpCircle,
  MessageSquare,
  Search,
  FileText,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

// Interfaces based on user requirement
interface CoreIntent {
  type: string;
  sub_type: string;
  urgency_signals: string[];
}

interface OrderEntity {
  id: string;
  mentioned_in: string;
  customer_claim: string;
}

interface ProductEntity {
  sku: string;
  description_in_text: string;
}

interface MonetaryEntity {
  amount: string;
  currency: string;
  context: string;
}

interface Entities {
  orders: OrderEntity[];
  products: ProductEntity[];
  monetary: MonetaryEntity[];
}

interface UnresolvedCommitment {
  promise: string;
  promised_by: string;
  due_date: string;
  status: string;
}

interface Context {
  conversation_stage: string;
  thread_position: string;
  references_history: boolean;
  unresolved_commitment: UnresolvedCommitment | null;
}

interface MissingCriticalData {
  field: string;
  impact: string;
}

interface UnverifiedClaim {
  claim: string;
  against_system_record: string | null;
  status: string;
}

interface AnaphoraToResolve {
  reference: string;
  likely_referent: string;
  confidence: string;
  basis: string;
}

interface GapsAndInconsistencies {
  missing_critical_data: MissingCriticalData[];
  unverified_claims: UnverifiedClaim[];
  anaphora_to_resolve: AnaphoraToResolve[];
}

interface SemanticSummaryData {
  natural_language_summary: string;
  structured_output: {
    core_intent: CoreIntent;
    entities: Entities;
    context: Context;
    gaps_and_inconsistencies: GapsAndInconsistencies;
  };
}

// Mock Data for Semantic Summary
const MOCK_SEMANTIC_DATA: SemanticSummaryData = {
  natural_language_summary: "客户发送邮件请求修改订单 ORD-20240127-001 的收货地址。邮件主题明确指出了“紧急：更改收货地址”，并在正文中提供了新地址“北京市朝阳区三里屯 SOHO A座 1202”。这是客户第一次针对此问题联系，未引用历史承诺。系统检测到客户在发送邮件前有异地登录行为，且新地址与注册地不符，存在潜在风险。",
  structured_output: {
    core_intent: {
      type: "request_change",
      sub_type: "address_change",
      urgency_signals: ["紧急", "更改地址"]
    },
    entities: {
      orders: [
        {
          id: "ORD-20240127-001",
          mentioned_in: "subject",
          customer_claim: "not_received"
        }
      ],
      products: [
        {
          sku: "iPhone 15 Pro Max",
          description_in_text: "涉及商品"
        }
      ],
      monetary: [
        {
          amount: "9999",
          currency: "CNY",
          context: "paid"
        }
      ]
    },
    context: {
      conversation_stage: "first_contact",
      thread_position: "1",
      references_history: false,
      unresolved_commitment: null
    },
    gaps_and_inconsistencies: {
      missing_critical_data: [],
      unverified_claims: [
        {
          claim: "新地址: 北京市朝阳区三里屯 SOHO A座 1202",
          against_system_record: "注册地: 上海",
          status: "inconsistent"
        }
      ],
      anaphora_to_resolve: []
    }
  }
};

interface SemanticSummaryLayerProps {
  onHighlight?: (factId: string | null) => void;
}

export default function SemanticSummaryLayer({ onHighlight }: SemanticSummaryLayerProps) {
  const [data] = useState<SemanticSummaryData>(MOCK_SEMANTIC_DATA);

  // Helper to handle highlight
  const handleMouseEnter = (factId: string | null) => {
    if (onHighlight) {
      onHighlight(factId);
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
              <CardTitle className="text-base font-semibold text-slate-900">Layer 2: Semantic Summary (语义摘要)</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">AI 对事实切片的结构化理解与风险研判</p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        
        {/* Natural Language Summary */}
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-semibold text-slate-800">自然语言摘要</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            {data.natural_language_summary}
          </p>
        </div>

        {/* Structured Output Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Core Intent */}
          <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm hover:border-purple-200 transition-colors">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <Target className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">核心意图 (Core Intent)</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">类型 (Type)</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{data.structured_output.core_intent.type}</Badge>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">子类型 (Sub-type)</span>
                <span className="font-medium text-slate-700">{data.structured_output.core_intent.sub_type}</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-500">紧急信号 (Urgency)</span>
                <div className="flex flex-wrap gap-1">
                  {data.structured_output.core_intent.urgency_signals.map((signal, idx) => (
                    <Badge key={idx} variant="secondary" className="text-[10px] h-5 bg-red-50 text-red-600 border-red-100">{signal}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Context */}
          <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm hover:border-purple-200 transition-colors">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <History className="w-4 h-4 text-orange-500" />
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">上下文 (Context)</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">对话阶段</span>
                <span className="font-medium text-slate-700">{data.structured_output.context.conversation_stage}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">邮件位置</span>
                <span className="font-medium text-slate-700">第 {data.structured_output.context.thread_position} 封</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">引用历史</span>
                {data.structured_output.context.references_history ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Badge variant="secondary" className="text-[10px]">否</Badge>
                )}
              </div>
              {data.structured_output.context.unresolved_commitment && (
                <div className="mt-2 p-2 bg-orange-50 rounded border border-orange-100 text-xs">
                  <div className="font-medium text-orange-800 mb-1">未解决承诺</div>
                  <div className="text-orange-600">{data.structured_output.context.unresolved_commitment.promise}</div>
                </div>
              )}
            </div>
          </div>

          {/* Entities */}
          <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm hover:border-purple-200 transition-colors md:col-span-2">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <Package className="w-4 h-4 text-purple-500" />
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">实体识别 (Entities)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Orders */}
              <div className="space-y-2">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">订单</div>
                {data.structured_output.entities.orders.map((order, idx) => (
                  <div key={idx} className="p-2 bg-slate-50 rounded border border-slate-100 text-xs">
                    <div className="font-medium text-slate-700 mb-1">{order.id}</div>
                    <div className="flex justify-between text-slate-500 text-[10px]">
                      <span>来源: {order.mentioned_in}</span>
                      <span>{order.customer_claim}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Products */}
              <div className="space-y-2">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">商品</div>
                {data.structured_output.entities.products.map((product, idx) => (
                  <div key={idx} className="p-2 bg-slate-50 rounded border border-slate-100 text-xs">
                    <div className="font-medium text-slate-700 mb-1">{product.sku}</div>
                    <div className="text-slate-500 text-[10px]">{product.description_in_text}</div>
                  </div>
                ))}
              </div>
              {/* Monetary */}
              <div className="space-y-2">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">金额</div>
                {data.structured_output.entities.monetary.map((money, idx) => (
                  <div key={idx} className="p-2 bg-slate-50 rounded border border-slate-100 text-xs">
                    <div className="font-medium text-slate-700 mb-1">{money.currency} {money.amount}</div>
                    <div className="text-slate-500 text-[10px]">{money.context}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Gaps & Inconsistencies */}
          <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm hover:border-purple-200 transition-colors md:col-span-2">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">缺口与矛盾 (Gaps & Inconsistencies)</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Missing Data */}
              <div className="space-y-2">
                 <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 uppercase">
                    <Search className="w-3 h-3" /> 缺失关键信息
                 </div>
                 {data.structured_output.gaps_and_inconsistencies.missing_critical_data.length > 0 ? (
                    data.structured_output.gaps_and_inconsistencies.missing_critical_data.map((gap, idx) => (
                      <div key={idx} className="p-2 bg-red-50 rounded border border-red-100 text-xs">
                        <div className="font-medium text-red-700">{gap.field}</div>
                        <div className="text-red-500 text-[10px]">{gap.impact}</div>
                      </div>
                    ))
                 ) : (
                    <div className="p-2 text-xs text-slate-400 italic">无缺失信息</div>
                 )}
              </div>

              {/* Unverified Claims */}
              <div className="space-y-2">
                 <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 uppercase">
                    <AlertCircle className="w-3 h-3" /> 未验证陈述
                 </div>
                 {data.structured_output.gaps_and_inconsistencies.unverified_claims.length > 0 ? (
                    data.structured_output.gaps_and_inconsistencies.unverified_claims.map((claim, idx) => (
                      <div key={idx} className="p-2 bg-yellow-50 rounded border border-yellow-100 text-xs">
                        <div className="font-medium text-yellow-800 mb-1">"{claim.claim}"</div>
                        <div className="flex items-center gap-2 text-[10px]">
                           <span className="text-yellow-600">vs 系统: {claim.against_system_record}</span>
                           <Badge variant="outline" className="h-4 px-1 bg-white border-yellow-200 text-yellow-700">{claim.status}</Badge>
                        </div>
                      </div>
                    ))
                 ) : (
                    <div className="p-2 text-xs text-slate-400 italic">无未验证陈述</div>
                 )}
              </div>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
