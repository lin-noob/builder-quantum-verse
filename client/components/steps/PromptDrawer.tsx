import { CopyOutlined, FileTextOutlined } from "@ant-design/icons"
import { Button, Drawer, message, Space, Typography } from "antd"
import React from "react"

const { Text, Paragraph } = Typography

interface PromptDrawerProps {
  visible: boolean
  onClose: () => void
  prompt?: string
  title?: string
}

export function PromptDrawer({
  visible,
  onClose,
  prompt,
  title = "AI 提示词详情"
}: PromptDrawerProps) {
  const handleCopy = () => {
    if (prompt) {
      navigator.clipboard.writeText(prompt)
      message.success("提示词已复制到剪贴板")
    }
  }

  return (
    <Drawer
      title={
        <Space>
          <FileTextOutlined style={{ color: "#1677ff" }} />
          <span>{title}</span>
        </Space>
      }
      placement="right"
      width={600}
      onClose={onClose}
      open={visible}
      extra={
        <Button 
          icon={<CopyOutlined />} 
          onClick={handleCopy}
          disabled={!prompt}>
          复制提示词
        </Button>
      }>
      {prompt ? (
        <div 
          style={{ 
            background: "#f5f5f5", 
            padding: "16px", 
            borderRadius: "8px",
            border: "1px solid #d9d9d9",
            fontFamily: "monospace",
            fontSize: "13px",
            lineHeight: "1.6",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all"
          }}>
          {prompt}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#bfbfbf" }}>
           <FileTextOutlined style={{ fontSize: 40, marginBottom: 16 }} />
           <Text type="secondary" style={{ display: "block" }}>暂无提示词数据</Text>
        </div>
      )}
    </Drawer>
  )
}
