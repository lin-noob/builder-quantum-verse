import { LoadingOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { Card, Input, message, Spin, Tag, Typography } from "antd";
import React, { useEffect, useState } from "react";

import { useAppContext } from "@/hooks/AppContext";

const { Text, Title } = Typography;

interface IntentAnalysisStepProps {}

export function IntentAnalysisStep({}: IntentAnalysisStepProps) {
  const {
    incomingEmails,
    triggerAnalysis,
    stepStates,
    updateStepState,
    setLocalTargets,
    isCheckingStatus,
    hasExistingData,
    setTriggerAnalysis,
  } = useAppContext();
  const { loading = false, confidence = "high", analysisResult } = stepStates.step0 || {};

  const [internalLoading, setInternalLoading] = useState(false);

  // 将时间字符串转换为时间戳
  const convertToTimestamp = (timeString: string): number => {
    try {
      // 尝试解析时间字符串
      const date = new Date(timeString);
      if (isNaN(date.getTime())) {
        // 如果解析失败，返回当前时间戳
        return Date.now();
      }
      return date.getTime();
    } catch (error) {
      console.error("Time conversion error:", error);
      return Date.now();
    }
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case "high":
        return "#52c41a";
      case "medium":
        return "#faad14";
      case "low":
        return "#ff4d4f";
      default:
        return "#52c41a";
    }
  };

  const getConfidenceText = (level: string) => {
    switch (level) {
      case "high":
        return "高";
      case "medium":
        return "中";
      case "low":
        return "低";
      default:
        return "高";
    }
  };

  // 显示加载状态（外部 loading 或内部 loading）
  if (loading || internalLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flex: "1 1 100%",
          minWidth: 0,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
          }}
        >
          <Text type="secondary" style={{ fontSize: 12 }}>
            核心意图
          </Text>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              whiteSpace: "nowrap",
            }}
          >
            <Tag color="processing" bordered={false} style={{ marginRight: 4 }}>
              <Spin size="small" indicator={<LoadingOutlined />} />
              <span style={{ marginLeft: 4 }}>AI 分析中</span>
            </Tag>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flex: "1 1 auto",
            minWidth: 120,
          }}
        >
          <Input value="正在分析邮件内容..." style={{ width: "100%" }} readOnly suffix={<LoadingOutlined />} />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        flex: "1 1 100%",
        minWidth: 0,
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        <Text type="secondary" style={{ fontSize: 12 }}>
          核心意图
        </Text>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            whiteSpace: "nowrap",
          }}
        >
          <Tag color="blue" bordered={false} style={{ marginRight: 4 }}>
            AI 已分析
          </Tag>
          <Text style={{ fontSize: 12, marginRight: 4 }}>AI 信心:</Text>
          <Text style={{ fontSize: 12, color: getConfidenceColor(confidence) }}>{getConfidenceText(confidence)}</Text>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          flex: "1 1 auto",
          minWidth: 120,
        }}
      >
        <Input.TextArea
          value={analysisResult || incomingEmails?.[incomingEmails.length - 1]?.content?.slice(0, 30) || ""}
          style={{ width: "100%", minHeight: "32px" }}
          autoSize={{ minRows: 1, maxRows: 3 }}
          readOnly
        />
        <QuestionCircleOutlined
          style={{
            color: "#bfbfbf",
            flexShrink: 0,
            marginLeft: 8,
            marginTop: 8,
          }}
        />
      </div>
    </div>
  );
}

// 整个区域的 Loading 组件（保持不变）
export function IntentAnalysisLoadingCard() {
  return (
    <Card
      style={{
        margin: "0 20px 20px",
        borderRadius: 8,
        textAlign: "center",
        minHeight: 300,
      }}
      bodyStyle={{
        padding: "60px 40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* 大的加载动画 */}
      <Spin
        size="large"
        indicator={
          <LoadingOutlined
            style={{
              fontSize: 48,
              color: "#1677ff",
              marginBottom: 24,
            }}
          />
        }
      />

      {/* 主标题 */}
      <Title
        level={4}
        style={{
          margin: "0 0 12px 0",
          color: "#262626",
          fontWeight: 500,
        }}
      >
        AI 正在分析意图...
      </Title>

      {/* 副标题 */}
      <Text
        type="secondary"
        style={{
          fontSize: 14,
          lineHeight: 1.6,
          maxWidth: 400,
          textAlign: "center",
        }}
      >
        正在深入分析邮件内容，识别核心诉求并拆解执行目标。
      </Text>
    </Card>
  );
}
