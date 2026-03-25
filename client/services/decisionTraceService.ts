import { request } from "@/lib/request";

/**
 * 获取决策追踪详情 (Raw AI Prompts and other engine data)
 * @param id 追踪记录ID
 */
export const getDecisionTraceView = async (id: string) => {
  return request.get(`/quote/api/v1/decision/trace/view/${id}`);
};

/**
 * 提交意图分析建议
 * @param id 追踪记录ID
 * @param semanticSummary 意图分析 JSON 字符串
 */
export const submitIntentAnalysis = async (id: string, semanticSummary: string) => {
  return request.post("/quote/api/v1/decision/trace/analysis", {
    id,
    semanticSummary,
  });
};

/**
 * 数据准备
 * @param id 追踪记录ID
 * @param semanticSummary 意图分析 JSON 字符串
 */
export const submitDataPreparation = async (id: string, semanticSummary: string) => {
  return request.post("/quote/api/v1/decision/trace/prepare", {
    id,
    word: semanticSummary,
  });
};

/**
 * 提交数据准备结果并获取推理建议
 * @param id 追踪记录ID
 * @param expertBriefing 数据准备详情 JSON 字符串
 */
export const submitDataInference = async (id: string, sortingEngine: string) => {
  return request.post("/quote/api/v1/decision/trace/inference", {
    id,
    sortingEngine,
  });
};
