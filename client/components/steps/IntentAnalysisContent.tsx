import { SyncOutlined } from "@ant-design/icons";
import { Button, Card, Divider, List, Space, Typography } from "antd";
import React from "react";

import { useAppContext } from "@/hooks/AppContext";

import { type Target } from "@/types";
import { IntentAnalysisStep } from "./IntentAnalysisStep";

const { Title, Text } = Typography;

export function IntentAnalysisContent() {
  const { localTargets, setStep, setTriggerAnalysis, currentStep, fetchStep2Data } = useAppContext();

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
            padding: "12px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          },
        }}
        style={{ margin: "0 12px 16px" }}
      >
        <IntentAnalysisStep />
        {/* <Space size="middle" wrap style={{ flex: "1 1 auto", justifyContent: "flex-end" }}>
          <Button icon={<SyncOutlined />} onClick={handleRetry}>
            重新执行
          </Button>
          <Button type="primary" onClick={handleConfirmAndContinue} disabled={currentStep === 2}>
            确认并继续
          </Button>
        </Space> */}
      </Card>

      {/* Content */}
      <div style={{ padding: "0 12px 20px", flex: 1, overflowY: "auto" }}>
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
    </>
  );
}
