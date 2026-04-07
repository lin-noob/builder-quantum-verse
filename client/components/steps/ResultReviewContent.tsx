import {
  BulbOutlined,
  CheckCircleOutlined,
  DeploymentUnitOutlined,
  ExclamationCircleOutlined,
  FileSearchOutlined,
  InfoCircleOutlined,
  LineChartOutlined,
  LoadingOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  SyncOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Drawer,
  List,
  message,
  Progress,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";

import { useAppContext } from "@/hooks/AppContext";

import { PromptDrawer } from "./PromptDrawer";

const { Text, Title } = Typography;

export function ResultReviewContent() {
  const { outgoingEmails, viewData, step3Data, setStep3Data } = useAppContext();
  const selectedEmail = outgoingEmails[0];
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [promptVisible, setPromptVisible] = useState(false);
  const reasoningTrace = step3Data?.reasoning_trace;
  const prompt = viewData?.engine?.dataInferenceWord;

  const convertToTimestamp = (timeString?: string): number => {
    if (!timeString) return Date.now();
    try {
      const date = new Date(timeString);
      return isNaN(date.getTime()) ? Date.now() : date.getTime();
    } catch (error) {
      return Date.now();
    }
  };

  if (loading) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
          background: "#f5f7fa",
        }}
      >
        <Spin size="large" indicator={<LoadingOutlined style={{ fontSize: 48, marginBottom: 24 }} />} />
        <Title level={4}>AI 正在评估回复质量...</Title>
        <Text type="secondary">正在分析内容的专业度、相关性及行动力。</Text>
      </div>
    );
  }

  if (!step3Data) return null;

  const { score_summary, evaluation_metrics, improvement_suggestions } = step3Data;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#52c41a";
    if (score >= 60) return "#faad14";
    return "#ff4d4f";
  };

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
            结果回溯完成
          </Tag>
          <Text type="secondary">分析结果已生成</Text>
        </div>
        <Space size="middle" wrap style={{ flex: "1 1 auto", justifyContent: "flex-end" }}>
          {/* <Button onClick={fetchEmails} icon={<SyncOutlined />}>
            重新评分
          </Button> */}
          <Button icon={<BulbOutlined />} onClick={() => setDrawerVisible(true)} disabled={!reasoningTrace}>
            推理过程
          </Button>
          <Button icon={<FileSearchOutlined />} onClick={() => setPromptVisible(true)} disabled={!prompt}>
            提示词
          </Button>
        </Space>
      </Card>

      {/* Content */}
      <div
        style={{
          padding: "12px",
          background: "#f5f7fa",
          height: "100%",
          overflowY: "auto",
        }}
      >
        <Row gutter={[12, 12]}>
          <Col span={24}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Card
                title={
                  <Space>
                    <div className="w-6 h-6 rounded-md ai-gradient-bg flex items-center justify-center">
                      <LineChartOutlined className="text-white text-xs" />
                    </div>
                    <span className="font-bold">综合评估</span>
                  </Space>
                }
                bordered={false}
                className="rounded-2xl shadow-sm border border-slate-100"
              >
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <Progress
                    type="circle"
                    percent={score_summary.overall_score}
                    strokeColor={getScoreColor(score_summary.overall_score)}
                    format={(percent) => (
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: 24, fontWeight: "bold" }}>{percent}</span>
                        <span style={{ fontSize: 12, color: "#8c8c8c" }}>分</span>
                      </div>
                    )}
                    width={100}
                  />
                  <div style={{ marginTop: 16 }}>
                    <Tag
                      color="blue"
                      style={{
                        padding: "4px 12px",
                        borderRadius: 4,
                        whiteSpace: "normal",
                        textAlign: "left",
                        lineHeight: "1.5",
                      }}
                    >
                      <strong>{score_summary.grade}</strong> - {score_summary.verdict}
                    </Tag>
                  </div>
                </div>

                <Divider plain style={{ fontSize: 12, color: "#bfbfbf" }}>
                  维度得分
                </Divider>

                <div style={{ padding: "0 10px" }}>
                  {evaluation_metrics?.map((metric: any, index: number) => (
                    <div key={index} style={{ marginBottom: 16 }}>
                      <DimensionItem label={metric.dimension} score={metric.score} />
                      <Text
                        type="secondary"
                        style={{
                          fontSize: 12,
                          display: "block",
                          marginTop: 4,
                        }}
                      >
                        {metric.critique}
                      </Text>
                    </div>
                  ))}
                </div>
              </Card>
            </Space>
          </Col>

          <Col span={24}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Card
                title={
                  <Space>
                    <RocketOutlined style={{ color: "#1677ff" }} />
                    <span style={{ fontWeight: 600 }}>优化执行方案</span>
                  </Space>
                }
                bordered={false}
                style={{
                  borderRadius: 8,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                }}
              >
                <List
                  itemLayout="vertical"
                  dataSource={improvement_suggestions}
                  renderItem={(item: any) => (
                    <div
                      style={{
                        marginBottom: 24,
                        padding: 16,
                        background: "#fff",
                        borderRadius: 8,
                        border: "1px solid #f0f0f0",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                          marginBottom: 16,
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: "#fff1f0",
                            color: "#ff4d4f",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexShrink: 0,
                          }}
                        >
                          <ExclamationCircleOutlined style={{ fontSize: 16 }} />
                        </div>
                        <Text
                          strong
                          style={{
                            fontSize: 16,
                            lineHeight: "28px",
                            color: "#262626",
                          }}
                        >
                          {item.issue}
                        </Text>
                      </div>

                      <Space direction="vertical" size="small" style={{ width: "100%", paddingLeft: 32 }}>
                        <div
                          style={{
                            background: "#f6ffed",
                            padding: "8px 12px",
                            borderRadius: 6,
                            borderLeft: "4px solid #52c41a",
                          }}
                        >
                          <Space align="start" style={{ width: "100%" }}>
                            <CheckCircleOutlined style={{ color: "#52c41a", marginTop: 4 }} />
                            <div style={{ flex: 1 }}>
                              <Text
                                strong
                                style={{
                                  color: "#389e0d",
                                  display: "block",
                                  fontSize: 13,
                                }}
                              >
                                建议与修改
                              </Text>
                              <Text style={{ color: "#595959", fontSize: 13 }}>{item.correction}</Text>
                            </div>
                          </Space>
                        </div>

                        <div
                          style={{
                            background: "#e6f4ff",
                            padding: "4px 12px",
                            borderRadius: 6,
                            borderLeft: "4px solid #1677ff",
                            marginTop: 8,
                          }}
                        >
                          <Space align="center" style={{ width: "100%" }}>
                            <InfoCircleOutlined style={{ color: "#1677ff" }} />
                            <Text style={{ color: "#0958d9", fontSize: 13 }}>优先级: {item.priority}</Text>
                          </Space>
                        </div>
                      </Space>
                      {improvement_suggestions.indexOf(item) !== improvement_suggestions.length - 1 && (
                        <Divider style={{ margin: "24px 0 0 0" }} />
                      )}
                    </div>
                  )}
                />
              </Card>
            </Space>
          </Col>
        </Row>
      </div>

      <Drawer
        title={
          <Space>
            <BulbOutlined style={{ color: "#ff4d4f" }} />
            <span>评分推理过程分析</span>
          </Space>
        }
        placement="right"
        width={550}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        styles={{ body: { padding: "20px", background: "#fefcfc" } }}
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
                    label: "草拟信号 (Draft)",
                    key: "draft_signal",
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

            {/* Scoring Logic */}
            <section>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <SafetyCertificateOutlined style={{ color: "#52c41a" }} />
                <Title level={5} style={{ margin: 0 }}>
                  计分逻辑分析 (Scoring Logic)
                </Title>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Row gutter={12}>
                  <Col span={12}>
                    <Card
                      size="small"
                      title={
                        <Space>
                          <CheckCircleOutlined style={{ color: "#52c41a" }} />
                          <span style={{ fontSize: 13 }}>优点</span>
                        </Space>
                      }
                      style={{ height: "100%", borderRadius: "8px" }}
                    >
                      <List
                        size="small"
                        dataSource={reasoningTrace.scoring_logic?.strengths}
                        renderItem={(item: string) => (
                          <List.Item style={{ padding: "4px 0", border: "none" }}>
                            <Badge status="success" text={<Text style={{ fontSize: 12 }}>{item}</Text>} />
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card
                      size="small"
                      title={
                        <Space>
                          <WarningOutlined style={{ color: "#ff4d4f" }} />
                          <span style={{ fontSize: 13 }}>不足</span>
                        </Space>
                      }
                      style={{ height: "100%", borderRadius: "8px" }}
                    >
                      <List
                        size="small"
                        dataSource={reasoningTrace.scoring_logic?.weaknesses}
                        renderItem={(item: string) => (
                          <List.Item style={{ padding: "4px 0", border: "none" }}>
                            <Badge status="error" text={<Text style={{ fontSize: 12 }}>{item}</Text>} />
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>
                </Row>
                <Card
                  size="small"
                  styles={{ body: { padding: "12px", background: "#fffbfb" } }}
                  style={{ borderRadius: "8px", border: "1px dashed #ffccc7" }}
                >
                  <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                    计分推导路径:
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      lineHeight: "1.6",
                      color: "#595959",
                    }}
                  >
                    {reasoningTrace.scoring_logic?.deduction_path}
                  </Text>
                </Card>
              </div>
            </section>

            <Divider style={{ margin: "8px 0" }} />

            {/* Plan Derivation */}
            <section>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <DeploymentUnitOutlined style={{ color: "#722ed1" }} />
                <Title level={5} style={{ margin: 0 }}>
                  改进计划派生 (Plan Derivation)
                </Title>
              </div>
              <List
                dataSource={reasoningTrace.plan_derivation}
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
                    <div style={{ marginBottom: 12 }}>
                      <Tag color="purple" style={{ borderRadius: "4px" }}>
                        Issue ID: {item.issue_id}
                      </Tag>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <Text strong style={{ fontSize: "13px", color: "#595959" }}>
                        关联信号:
                      </Text>
                      <div style={{ marginTop: 4 }}>
                        <Space wrap size={[4, 4]}>
                          {item.derived_from?.map((f: string, i: number) => (
                            <Tag
                              key={i}
                              style={{
                                margin: 0,
                                fontSize: "11px",
                                background: "#f5f5f5",
                                border: "none",
                              }}
                            >
                              {f}
                            </Tag>
                          ))}
                        </Space>
                      </div>
                    </div>

                    <div
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        background: "#f9f0ff",
                        borderRadius: "6px",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: "13px",
                          lineHeight: "1.5",
                          color: "#595959",
                        }}
                      >
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
        title="评分逻辑提示词"
      />
    </>
  );
}

function DimensionItem({ label, score }: { label: string; score: number }) {
  const getColor = (s: number) => {
    if (s >= 80) return "#52c41a";
    if (s >= 60) return "#faad14";
    return "#ff4d4f";
  };

  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <Text style={{ fontSize: 12, whiteSpace: "nowrap" }}>{label}</Text>
        <Text strong style={{ fontSize: 12, color: getColor(score), flexShrink: 0 }}>
          {score}分
        </Text>
      </div>
      <Progress percent={score} strokeColor={getColor(score)} showInfo={false} size="small" style={{ margin: 0 }} />
    </div>
  );
}
