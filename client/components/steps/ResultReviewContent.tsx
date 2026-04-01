import { useAppContext } from "@/hooks/AppContext";
import { request } from "@/lib/request";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  LineChartOutlined,
  LoadingOutlined,
  RocketOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Divider, List, message, Progress, Row, Space, Spin, Tag, Typography } from "antd";
import React, { useEffect, useState } from "react";

const { Text, Title } = Typography;

export function ResultReviewContent() {
  const { outgoingEmails, viewData, step3Data, setStep3Data } = useAppContext();
  const selectedEmail = outgoingEmails[0];
  const [loading, setLoading] = useState(false);

  const convertToTimestamp = (timeString?: string): number => {
    if (!timeString) return Date.now();
    try {
      const date = new Date(timeString);
      return isNaN(date.getTime()) ? Date.now() : date.getTime();
    } catch (error) {
      return Date.now();
    }
  };

  // API 调用函数
  const callAnalysisAPI = async () => {
    if (!selectedEmail) return;

    setLoading(true);
    try {
      const requestData = {
        content: selectedEmail.content,
        htmlBody: selectedEmail.content,
        receivedTime: convertToTimestamp(selectedEmail.postedOn),
        id: viewData.id,
      };

      const response = await request.post("/quote/api/v1/instance/review", requestData);

      if (response?.data?.data) {
        let result = null;
        try {
          result = JSON.parse(response.data.data.dataInference.replace(/\\(?=[^\\"/bfnrtu])/g, "\\n"));
        } catch (e) {
          console.error("Parse JSON failed:", e);
        }

        // 只有当返回的数据包含评分信息时才更新（否则可能和 incoming 的返回结构冲突）
        if (result) {
          setStep3Data(result);
        } else {
          // 如果后端还没适配 outgoing 结构，至少给个提示
          console.warn("API returned unexpected structure for outgoing analysis:", result);
        }
      }

      message.success("评分完成");
    } catch (error) {
      console.error("Outgoing analysis API failed:", error);
      message.error("评分失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  // 当选择的邮件改变时自动调用 API
  useEffect(() => {
    if (selectedEmail) {
      callAnalysisAPI();
    }
  }, [selectedEmail]);

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
      {/* <Card
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
      </Card> */}

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
          {/* Full width columns for sidepanel compatibility */}
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

          {/* Right Column: Optimization Plan */}
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
