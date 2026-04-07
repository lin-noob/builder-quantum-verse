import {
  BulbOutlined,
  CheckCircleOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  NodeIndexOutlined,
  SendOutlined,
  SyncOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { Button, Card, Divider, Drawer, List, Space, Spin, Tag, Typography } from "antd";
import React, { useState } from "react";
import { useAppContext } from "@/hooks/AppContext";
import { PromptDrawer } from "./PromptDrawer";

const { Title, Text, Paragraph } = Typography;

export function ExecuteActionContent() {
  const { setStep, currentStep, step2Data, step2Loading, fetchStep2Data, viewData } = useAppContext();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [promptVisible, setPromptVisible] = useState(false);
  const reasoningTrace = step2Data?.reasoning_trace;
  const prompt = viewData?.engine?.expertBriefingWord;

  const handleRetry = () => {
    fetchStep2Data();
  };

  // Loading 状态
  if (step2Loading) {
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flex: 1,
              flexWrap: "wrap",
            }}
          >
            <Tag
              icon={<LoadingOutlined spin />}
              color="processing"
              bordered={false}
              style={{
                color: "#1677ff",
                background: "#e6f4ff",
                borderColor: "#91caff",
                borderWidth: 1,
                borderStyle: "solid",
              }}
            >
              AI 正在生成回复策略
            </Tag>
            <Text type="secondary">请稍候...</Text>
          </div>
        </Card>

        {/* Loading Content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
          }}
        >
          <Spin size="large" indicator={<LoadingOutlined style={{ fontSize: 48, marginBottom: 24 }} />} />
          <Title level={4} style={{ marginTop: 24 }}>
            AI 正在分析邮件上下文并生成回复策略...
          </Title>
          <Text type="secondary">正在提取关键信息、匹配历史模版、生成专业回复建议</Text>
        </div>
      </>
    );
  }

  // 无数据状态
  if (!step2Data) {
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flex: 1,
              flexWrap: "wrap",
            }}
          >
            <Tag
              color="default"
              bordered={false}
              style={{
                color: "#8c8c8c",
                background: "#fafafa",
                borderColor: "#d9d9d9",
                borderWidth: 1,
                borderStyle: "solid",
              }}
            >
              等待执行
            </Tag>
            <Text type="secondary">请先在第一步点击「确认并继续」</Text>
          </div>
        </Card>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
            color: "#bfbfbf",
          }}
        >
          <SendOutlined style={{ fontSize: 48, marginBottom: 16 }} />
          <Text type="secondary" style={{ fontSize: 14 }}>
            暂无数据，请先完成第一步分析
          </Text>
        </div>
      </>
    );
  }

  // 有数据 — 渲染三个卡片
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flex: 1,
            flexWrap: "wrap",
          }}
        >
          <Tag
            icon={<CheckCircleOutlined />}
            color="success"
            bordered={false}
            style={{
              color: "#389e0d",
              background: "#f6ffed",
              borderColor: "#b7eb8f",
              borderWidth: 1,
              borderStyle: "solid",
            }}
          >
            回复策略已生成
          </Tag>
          <Text type="secondary">AI 已完成分析，请审阅以下建议</Text>
        </div>
        <Space size="middle" wrap style={{ flex: "1 1 auto", justifyContent: "flex-end" }}>
          <Button icon={<BulbOutlined />} onClick={() => setDrawerVisible(true)} disabled={!reasoningTrace}>
            推理过程
          </Button>
          <Button icon={<FileSearchOutlined />} onClick={() => setPromptVisible(true)} disabled={!prompt}>
            提示词
          </Button>
        </Space>
      </Card>

      {/* Content — 三个卡片 */}
      <div style={{ padding: "0 20px 20px", flex: 1, overflowY: "auto" }}>
        {/* 1. 回复策略卡片 */}
        <Card
          title={
            <Space>
              <ThunderboltOutlined style={{ color: "#1677ff" }} />
              <span>回复策略</span>
            </Space>
          }
          bordered={false}
          style={{ borderRadius: 8, marginBottom: 16 }}
        >
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              建议语气
            </Text>
            <div style={{ marginTop: 4 }}>
              <Tag color="blue">{step2Data.response_strategy.tone}</Tag>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              核心要点
            </Text>
            <div
              style={{
                marginTop: 8,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {step2Data.response_strategy.key_points.map((point, index) => (
                <div key={index} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "#e6f4ff",
                      color: "#1677ff",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: 11,
                      fontWeight: "bold",
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    {index + 1}
                  </div>
                  <Text style={{ fontSize: 13 }}>{point}</Text>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              策略逻辑
            </Text>
            <Paragraph
              style={{
                fontSize: 13,
                marginTop: 4,
                marginBottom: 0,
                background: "#fafafa",
                padding: "8px 12px",
                borderRadius: 6,
              }}
            >
              {step2Data.response_strategy.strategy_logic}
            </Paragraph>
          </div>
        </Card>

        {/* 2. 邮件草稿卡片 */}
        <Card
          title={
            <Space>
              <FileTextOutlined style={{ color: "#1677ff" }} />
              <span>邮件草稿</span>
            </Space>
          }
          bordered={false}
          style={{ borderRadius: 8, marginBottom: 16 }}
        >
          <div style={{ marginBottom: 12 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              邮件标题
            </Text>
            <div
              style={{
                marginTop: 4,
                background: "#f5f5f5",
                padding: "6px 12px",
                borderRadius: 4,
              }}
            >
              <Text strong style={{ fontSize: 13 }}>
                {step2Data.suggested_draft.subject}
              </Text>
            </div>
          </div>

          <div
            style={{
              background: "#fafafa",
              borderRadius: 8,
              padding: 16,
              border: "1px solid #f0f0f0",
            }}
          >
            <Text strong style={{ fontSize: 13 }}>
              {step2Data.suggested_draft.salutation}
            </Text>
            <Paragraph
              style={{
                fontSize: 13,
                marginTop: 12,
                marginBottom: 12,
                whiteSpace: "pre-line",
                lineHeight: 1.8,
              }}
            >
              {step2Data.suggested_draft.body_content}
            </Paragraph>
            <Paragraph
              style={{
                fontSize: 13,
                marginBottom: 0,
                whiteSpace: "pre-line",
                color: "#595959",
              }}
            >
              {step2Data.suggested_draft.closing}
            </Paragraph>
          </div>
        </Card>

        {/* 3. 专业提示卡片 */}
        <Card
          title={
            <Space>
              <BulbOutlined style={{ color: "#faad14" }} />
              <span>专业提示</span>
            </Space>
          }
          bordered={false}
          style={{ borderRadius: 8 }}
        >
          {step2Data.professional_tips}
        </Card>
      </div>
      <Drawer
        title={
          <Space>
            <BulbOutlined style={{ color: "#faad14" }} />
            <span>策略推理过程分析</span>
          </Space>
        }
        placement="right"
        width={550}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        styles={{ body: { padding: "20px", background: "#fffdf9" } }}
      >
        {reasoningTrace ? (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {/* Input Analysis */}
            <section>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <InfoCircleOutlined style={{ color: "#1890ff" }} />
                <Title level={5} style={{ margin: 0 }}>
                  输入信号分析 (Input Analysis)
                </Title>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  {
                    label: "画像信号 (Profile)",
                    key: "profile_signal",
                    color: "#1890ff",
                  },
                  {
                    label: "意图信号 (Intent)",
                    key: "intent_signal",
                    color: "#722ed1",
                  },
                  {
                    label: "历史信号 (History)",
                    key: "history_signal",
                    color: "#13c2c2",
                  },
                  {
                    label: "最新信号 (Latest)",
                    key: "latest_signal",
                    color: "#eb2f96",
                  },
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
                    <Text
                      strong
                      style={{
                        fontSize: "12px",
                        color: item.color,
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
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

            {/* Strategy Derivation */}
            <section>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <NodeIndexOutlined style={{ color: "#faad14" }} />
                <Title level={5} style={{ margin: 0 }}>
                  策略推导逻辑 (Strategy Derivation)
                </Title>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Card
                  size="small"
                  styles={{ body: { padding: "16px" } }}
                  style={{
                    borderRadius: "12px",
                    border: "none",
                    background: "linear-gradient(135deg, #fff 0%, #fffef6 100%)",
                    boxShadow: "0 4px 12px rgba(250, 173, 20, 0.08)",
                  }}
                >
                  <div style={{ marginBottom: 16 }}>
                    <Text
                      strong
                      style={{
                        display: "block",
                        marginBottom: 8,
                        color: "#262626",
                      }}
                    >
                      语气方案选择 (Approach Selection):
                    </Text>
                    <div
                      style={{
                        padding: "10px 12px",
                        background: "rgba(255,255,255,0.6)",
                        borderRadius: "8px",
                        border: "1px dashed #ffe58f",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: "13px",
                          lineHeight: "1.6",
                          color: "#434343",
                        }}
                      >
                        {reasoningTrace.strategy_derivation?.approach_selection}
                      </Text>
                    </div>
                  </div>
                  <div>
                    <Text
                      strong
                      style={{
                        display: "block",
                        marginBottom: 8,
                        color: "#262626",
                      }}
                    >
                      内容构建逻辑 (Draft Logic):
                    </Text>
                    <div
                      style={{
                        padding: "10px 12px",
                        background: "rgba(255,255,255,0.6)",
                        borderRadius: "8px",
                        border: "1px dashed #ffe58f",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: "13px",
                          lineHeight: "1.6",
                          color: "#434343",
                        }}
                      >
                        {reasoningTrace.strategy_derivation?.draft_logic}
                      </Text>
                    </div>
                  </div>
                </Card>
              </div>
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
        title="执行策略提示词"
      />
    </>
  );
}
