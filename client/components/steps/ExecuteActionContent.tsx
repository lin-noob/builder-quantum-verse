import { useAppContext } from "@/hooks/AppContext";
import {
  BulbOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  LoadingOutlined,
  SendOutlined,
  SyncOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { Button, Card, Divider, List, Space, Spin, Tag, Typography } from "antd";
import React from "react";

const { Title, Text, Paragraph } = Typography;

export function ExecuteActionContent() {
  const { setStep, currentStep, step2Data, step2Loading, fetchStep2Data } = useAppContext();

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
            回复策略已生成
          </Tag>
          <Text type="secondary">AI 已完成分析，请审阅以下建议</Text>
        </div>
        <Space size="middle" wrap style={{ flex: "1 1 auto", justifyContent: "flex-end" }}>
          <Button icon={<SyncOutlined />} onClick={handleRetry}>
            重新执行
          </Button>
          <Button type="primary" onClick={() => setStep(currentStep + 1)} disabled={currentStep === 2}>
            确认并继续
          </Button>
        </Space>
      </Card> */}

      {/* Content — 三个卡片 */}
      <div style={{ padding: "0 12px 20px", flex: 1, overflowY: "auto" }}>
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
          <List
            dataSource={step2Data.professional_tips}
            renderItem={(tip, index) => (
              <List.Item
                style={{
                  padding: "10px 0",
                  borderBottom: index < step2Data.professional_tips.length - 1 ? "1px solid #f0f0f0" : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "#fff7e6",
                      color: "#faad14",
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
                  <Text style={{ fontSize: 13 }}>{tip}</Text>
                </div>
              </List.Item>
            )}
          />
        </Card>
      </div>
    </>
  );
}
