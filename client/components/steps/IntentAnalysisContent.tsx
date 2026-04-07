import {
  BulbOutlined,
  CheckCircleOutlined,
  ExperimentOutlined,
  FileSearchOutlined,
  InfoCircleOutlined,
  NodeIndexOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { Button, Card, Divider, Drawer, List, Space, Tag, Typography } from "antd";
import React, { useState } from "react";

import { useAppContext } from "@/hooks/AppContext";

import { type Target } from "../../types";
import { IntentAnalysisStep } from "./IntentAnalysisStep";
import { PromptDrawer } from "./PromptDrawer";

const { Title, Text } = Typography;

export function IntentAnalysisContent() {
  const { localTargets, setStep, setTriggerAnalysis, currentStep, fetchStep2Data, stepStates, viewData } =
    useAppContext();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [promptVisible, setPromptVisible] = useState(false);
  const reasoningTrace = stepStates.step0?.reasoningTrace;
  const prompt = viewData?.engine?.semanticSummaryWord;

  const handleRetry = () => {
    setTriggerAnalysis((prev) => prev + 1);
  };

  const handleConfirmAndContinue = () => {
    fetchStep2Data();
    setStep(currentStep + 1);
  };

  const renderStep1Content = (item: Target) => (
    <div style={{ marginLeft: 36, marginTop: 8 }}>
      <div style={{ marginBottom: 4 }}>
        <Text strong style={{ color: "#1677ff" }}>
          AI 建议：
        </Text>
        <Text type="secondary">{item.aiSuggestion}</Text>
      </div>
      <div>
        <Text type="secondary" style={{ fontSize: 12 }}>
          下一步方向：{item.nextDirection}
        </Text>
      </div>
    </div>
  );

  return (
    <>
      {/* Action Bar */}
      <Card
        styles={{
          body: {
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          },
        }}
        style={{ margin: "0 20px 16px" }}
      >
        <IntentAnalysisStep />
        <Space size="middle" wrap style={{ flex: "1 1 auto", justifyContent: "flex-end" }}>
          <Button icon={<BulbOutlined />} onClick={() => setDrawerVisible(true)} disabled={!reasoningTrace}>
            推理过程
          </Button>
          <Button icon={<FileSearchOutlined />} onClick={() => setPromptVisible(true)} disabled={!prompt}>
            提示词
          </Button>
        </Space>
      </Card>

      {/* Content */}
      <div style={{ padding: "0 20px 20px", flex: 1, overflowY: "auto" }}>
        <Title level={5} style={{ marginBottom: 16 }}>
          目标拆解清单
        </Title>
        <div style={{ background: "#fff", borderRadius: 8, padding: "16px 0" }}>
          <div
            style={{
              display: "flex",
              padding: "0 24px 12px",
              borderBottom: "1px solid #f0f0f0",
              color: "#bfbfbf",
              fontSize: 12,
            }}
          >
            <div style={{ width: 36 }}>#</div>
            <div style={{ flex: 1 }}>目标描述</div>
            <div style={{ width: 120, textAlign: "right" }}>状态操作</div>
          </div>

          <List
            itemLayout="horizontal"
            dataSource={localTargets}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: "16px 24px",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <div style={{ display: "flex", width: "100%" }}>
                  <div style={{ width: 36, paddingTop: 4 }}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "#f0f5ff",
                        color: "#1677ff",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontWeight: "bold",
                      }}
                    >
                      {item.id}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        border: "1px solid #e8e8e8",
                        borderRadius: 6,
                        padding: "8px 12px",
                        display: "inline-block",
                        maxWidth: "100%",
                      }}
                    >
                      <Text strong style={{ fontSize: 14 }}>
                        {item.title}
                      </Text>
                    </div>
                    {renderStep1Content(item)}
                  </div>
                </div>
              </List.Item>
            )}
            locale={{ emptyText: "当前步骤暂无数据展示" }}
          />
        </div>
      </div>
      <Drawer
        title={
          <Space>
            <BulbOutlined style={{ color: "#1677ff" }} />
            <span>AI 推理过程分析</span>
          </Space>
        }
        placement="right"
        width={550}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        styles={{ body: { padding: "20px", background: "#fcfdfe" } }}
      >
        {reasoningTrace ? (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {/* Input Analysis */}
            <section>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <InfoCircleOutlined style={{ color: "#1890ff" }} />
                <Title level={5} style={{ margin: 0 }}>
                  输入信号分析 (Input Analysis)
                </Title>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "身份信号", key: "sender_signal", color: "#1890ff" },
                  { label: "时效信号", key: "time_signal", color: "#722ed1" },
                  { label: "标题信号", key: "subject_signal", color: "#13c2c2" },
                  { label: "正文信号", key: "body_signal", color: "#eb2f96" },
                ].map((item) => (
                  <div
                    key={item.key}
                    style={{
                      background: "#fff",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      border: "1px solid #f0f0f0",
                      borderLeft: `4px solid ${item.color}`,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                    }}
                  >
                    <Text strong style={{ fontSize: "12px", color: item.color, display: "block", marginBottom: 4 }}>
                      {item.label}:
                    </Text>
                    <Text type="secondary" style={{ fontSize: "13px", lineHeight: "1.6" }}>
                      {reasoningTrace.input_analysis?.[item.key as keyof typeof reasoningTrace.input_analysis] || "-"}
                    </Text>
                  </div>
                ))}
              </div>
            </section>

            <Divider style={{ margin: "8px 0" }} />

            {/* Intent Derivation */}
            <section>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <ExperimentOutlined style={{ color: "#faad14" }} />
                <Title level={5} style={{ margin: 0 }}>
                  意图推导核心 (Intent Derivation)
                </Title>
              </div>

              <Card
                size="small"
                styles={{ body: { padding: "16px" } }}
                style={{
                  borderRadius: "12px",
                  border: "none",
                  background: "linear-gradient(135deg, #fff 0%, #f6faff 100%)",
                  boxShadow: "0 4px 12px rgba(22, 119, 255, 0.08)",
                }}
              >
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ display: "block", marginBottom: 8, color: "#262626" }}>
                    关键线索 (Key Clues):
                  </Text>
                  <Space wrap size={[8, 8]}>
                    {reasoningTrace.intent_derivation?.key_clues?.map((clue: string, idx: number) => (
                      <Tag key={idx} color="blue" bordered={false} style={{ borderRadius: "4px", padding: "2px 8px" }}>
                        {clue}
                      </Tag>
                    ))}
                  </Space>
                </div>
                <div>
                  <Text strong style={{ display: "block", marginBottom: 8, color: "#262626" }}>
                    推导逻辑 (Reasoning Logic):
                  </Text>
                  <div
                    style={{
                      padding: "12px",
                      background: "rgba(255,255,255,0.6)",
                      borderRadius: "8px",
                      border: "1px dashed #d6e4ff",
                    }}
                  >
                    <Text style={{ fontSize: "14px", lineHeight: "1.6", color: "#434343" }}>
                      {reasoningTrace.intent_derivation?.reasoning_logic}
                    </Text>
                  </div>
                </div>
              </Card>
            </section>

            <Divider style={{ margin: "8px 0" }} />

            {/* Goal Derivation */}
            <section>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <NodeIndexOutlined style={{ color: "#52c41a" }} />
                <Title level={5} style={{ margin: 0 }}>
                  目标拆解逻辑 (Goal Derivation)
                </Title>
              </div>
              <List
                dataSource={reasoningTrace.goal_derivation}
                renderItem={(item: any) => (
                  <List.Item
                    style={{
                      flexDirection: "column",
                      alignItems: "flex-start",
                      padding: "16px",
                      background: "#fff",
                      borderRadius: "12px",
                      border: "1px solid #f0f0f0",
                      marginBottom: "12px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: 12 }}>
                      <Tag color="#f6ffed" style={{ color: "#52c41a", borderColor: "#b7eb8f", borderRadius: "4px" }}>
                        Goal ID: {item.goal_id}
                      </Tag>
                      <Space size={4}>
                        <CheckCircleOutlined style={{ color: "#52c41a", fontSize: "12px" }} />
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          由 AI 派生
                        </Text>
                      </Space>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <Text strong style={{ fontSize: "13px", color: "#595959" }}>
                        关联线索:
                      </Text>
                      <div style={{ marginTop: 4 }}>
                        <Space wrap size={[4, 4]}>
                          {item.derived_from?.map((f: string, i: number) => (
                            <Tag key={i} style={{ margin: 0, fontSize: "11px", background: "#f5f5f5", border: "none" }}>
                              {f}
                            </Tag>
                          ))}
                        </Space>
                      </div>
                    </div>

                    <div style={{ width: "100%", padding: "10px 12px", background: "#fafafa", borderRadius: "6px" }}>
                      <Text style={{ fontSize: "13px", lineHeight: "1.5", color: "#595959" }}>
                        {item.derivation_logic}
                      </Text>
                    </div>
                  </List.Item>
                )}
              />
            </section>
          </Space>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <SyncOutlined spin style={{ fontSize: 24, color: "#bfbfbf", marginBottom: 16 }} />
            <Text type="secondary" style={{ display: "block" }}>
              正在准备推理数据...
            </Text>
          </div>
        )}
      </Drawer>
      <PromptDrawer
        visible={promptVisible}
        onClose={() => setPromptVisible(false)}
        prompt={prompt}
        title="意图分析提示词"
      />
    </>
  );
}
