import { LeftOutlined, MailOutlined } from "@ant-design/icons";
import { Divider, Steps, Tag, Typography } from "antd";
import React, { useEffect, useState } from "react";

import { ExecuteActionContent } from "./steps/ExecuteActionContent";
import { IntentAnalysisContent } from "./steps/IntentAnalysisContent";
import { IntentAnalysisLoadingCard } from "./steps/IntentAnalysisStep";
import { ResultReviewContent } from "./steps/ResultReviewContent";
import { useAppContext } from "@/hooks/AppContext";
import { Target } from "@/types";

const { Title, Text } = Typography;

interface AnalysisWizardViewProps {}

export function AnalysisWizardView({}: AnalysisWizardViewProps) {
  const {
    currentStep,
    setStep,
    viewData,
    setViewData,
    setLocalTargets,
    stepStates,
    updateStepState,
    selectedEmail,
    setStep2Data,
    setStep3Data,
    setIsCheckingStatus,
    setHasExistingData,
  } = useAppContext();

  // 统一处理意图分析结果的逻辑
  const processIntentAnalysisResult = (result: any) => {
    if (!result) return;

    // 核心意图数据
    const coreIntent = result?.core_intent;
    const analysisResult = coreIntent?.summary || result?.analysis || result?.message || "意图分析完成";

    // 信心指数转换
    let confidence: "high" | "medium" | "low" = "high";
    if (typeof coreIntent?.confidence === "number") {
      if (coreIntent.confidence > 0.8) confidence = "high";
      else if (coreIntent.confidence > 0.5) confidence = "medium";
      else confidence = "low";
    } else if (result?.confidence) {
      confidence = result.confidence;
    }

    updateStepState("step0", {
      loading: false,
      analysisResult,
      confidence,
    });

    // 目标拆解清单映射
    if (result?.goals && Array.isArray(result.goals)) {
      const mappedTargets: Target[] = result.goals.map((g: any, index: number) => ({
        id: index + 1,
        title: g.goal_description || "",
        aiSuggestion: g.recommendation?.strategy || "",
        nextDirection: g.recommendation?.suggested_next_step || "",
        inference: "",
      }));
      setLocalTargets(mappedTargets);
    }
  };

  const parseSerializedData = (value: unknown) => {
    if (!value) {
      return null;
    }

    if (typeof value !== "string") {
      return value;
    }

    try {
      return JSON.parse(value.replace(/\\(?=[^\\"/bfnrtu])/g, "\\n"));
    } catch {
      try {
        return JSON.parse(value);
      } catch (error) {
        console.error("Failed to parse serialized wizard data:", error);
        return null;
      }
    }
  };

  const hydrateAnalysisData = (data: any) => {
    if (!data) {
      setStep2Data(null);
      setStep3Data(null);
      setHasExistingData(false);
      return;
    }

    if (data.semanticSummary) {
      const summaryData = parseSerializedData(data.semanticSummary);
      if (summaryData) {
        processIntentAnalysisResult(summaryData);
      }
    }

    if (data.expertBriefing) {
      const briefingData = parseSerializedData(data.expertBriefing);
      setStep2Data(briefingData);
    } else {
      setStep2Data(null);
    }

    if (data.dataInference) {
      const reviewData = parseSerializedData(data.dataInference);
      setStep3Data(reviewData);
    } else {
      setStep3Data(null);
    }

    setViewData(data);
    setHasExistingData(true);
  };

  // 检查是否存在已有析 (New Feature)
  const checkExistingAnalysis = async () => {
    if (!selectedEmail) {
      return;
    }

    setIsCheckingStatus(true);
    setHasExistingData(false);

    try {
      if (viewData) {
        hydrateAnalysisData(viewData);
      } else {
        setHasExistingData(false);
      }
    } catch (error) {
      console.error("Failed to check existing analysis in Wizard:", error);
      setHasExistingData(false);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // 当选择的邮件改变时，重置本地目标并检查已有分析
  useEffect(() => {
    if (selectedEmail) {
      if (currentStep === 0) {
        checkExistingAnalysis();
      } else {
        // 提取回件不用调用checkExistingAnalysis函数
        setIsCheckingStatus(false);
        setHasExistingData(false);
      }
    }
  }, [currentStep, selectedEmail, viewData]);

  // 第一步：意图分析
  const startIntentAnalysis = async () => {
    updateStepState("step0", { loading: true, analysisResult: "" });
  };

  // 处理第一步分析完成
  const handleIntentAnalysisComplete = (result: any) => {
    console.log("Intent analysis completed:", result);
    processIntentAnalysisResult(result);
  };

  // 处理第一步分析错误
  const handleIntentAnalysisError = (error: string) => {
    console.error("Intent analysis error:", error);

    updateStepState("step0", {
      loading: false,
      analysisResult: "分析失败",
      confidence: "low",
    });
  };

  const renderHeader = () => (
    <div
      style={{
        padding: "12px 16px",
        background: "#fff",
        borderBottom: "1px solid #f0f0f0",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 4,
          background: "#e6f7ff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginRight: 10,
        }}
      >
        <MailOutlined style={{ color: "#1677ff", fontSize: 16 }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Title level={5} style={{ margin: 0, fontSize: 14 }}>
            邮件分析
          </Title>
          {selectedEmail?.ticketId && (
            <Tag color="blue" style={{ margin: 0, fontSize: 10 }}>
              {selectedEmail.ticketId}
            </Tag>
          )}
        </div>
        <Text type="secondary" style={{ fontSize: 11, display: "block", marginTop: 2 }}>
          {selectedEmail?.author} · {selectedEmail?.content?.slice(0, 50)}...
        </Text>
      </div>
    </div>
  );

  const renderSteps = () => (
    <div
      style={{
        padding: "16px 20px",
        background: "#fafafa",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <Steps
        size="small"
        current={currentStep}
        onChange={setStep}
        items={[{ title: "意图" }, { title: "执行" }, { title: "回溯" }]}
      />
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: "#f5f7fa",
      }}
    >
      {/* {renderHeader()} */}
      {renderSteps()}
      <Divider style={{ margin: 0 }} />
      <div
        style={{
          paddingTop: 16,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* 根据步骤渲染不同内容，并保留状态 */}
        <div style={{ display: currentStep === 0 ? "contents" : "none" }}>
          {stepStates.step0.loading ? <IntentAnalysisLoadingCard /> : <IntentAnalysisContent />}
        </div>
        <div style={{ display: currentStep === 1 ? "contents" : "none" }}>
          <ExecuteActionContent />
        </div>
        <div style={{ display: currentStep === 2 ? "contents" : "none" }}>
          <ResultReviewContent />
        </div>
      </div>
    </div>
  );
}
