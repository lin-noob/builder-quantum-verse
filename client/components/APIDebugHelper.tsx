import React, { useState, useEffect } from "react";
import { request } from "@/lib/request";

/**
 * API调试助手组件 - 仅在开发环境显示
 * 帮助开发者快速诊断API连接问题
 */
export const APIDebugHelper: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<{
    backendStatus: "checking" | "ok" | "error";
    proxyStatus: "checking" | "ok" | "error";
    lastError?: string;
    suggestions: string[];
  }>({
    backendStatus: "checking",
    proxyStatus: "checking",
    suggestions: [],
  });

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    const checkAPIStatus = async () => {
      const suggestions: string[] = [];

      try {
        // 测试基本连通性
        console.log("🔍 API Debug: 开始检查后端连接...");

        // 测试简单的API调用
        await request.get(
          "/quote/api/v1/profile/list",
          { page: 1, limit: 1 },
          { timeout: 3000 },
        );

        setDebugInfo((prev) => ({
          ...prev,
          backendStatus: "ok",
          proxyStatus: "ok",
          suggestions: ["✅ API连接正常"],
        }));

        console.log("✅ API Debug: 后端连接正常");
      } catch (error) {
        console.error("❌ API Debug: 连接失败", error);

        // 分析错误类型并提供建议
        if (error instanceof Error) {
          if (error.message.includes("HTML页面")) {
            suggestions.push("🚨 收到HTML响应而不是JSON - API端点可能不存在");
            suggestions.push("💡 检查vite.config.ts中的代理配置");
            suggestions.push("💡 确认后端服务器运行在正确端口");
          } else if (
            error.message.includes("timeout") ||
            error.message.includes("超时")
          ) {
            suggestions.push("⏰ 请求超时 - 后端服务可能未运行");
            suggestions.push("💡 检查 192.168.1.128:8099 是否可访问");
          } else if (error.message.includes("Network")) {
            suggestions.push("🌐 网络错误 - 检查网络连接");
            suggestions.push("💡 确认防火墙设置");
          } else if (error.message.includes("aborted")) {
            suggestions.push("🔄 请求被中止 - 这通常是正常的");
          } else {
            suggestions.push(`❌ 未知错误: ${error.message}`);
            suggestions.push("💡 查看浏览器Network标签获取更多信息");
          }
        }

        setDebugInfo((prev) => ({
          ...prev,
          backendStatus: "error",
          proxyStatus: "error",
          lastError: error instanceof Error ? error.message : String(error),
          suggestions,
        }));
      }
    };

    // 延迟一点时间，避免在页面加载时立即执行
    const timer = setTimeout(checkAPIStatus, 1000);

    return () => clearTimeout(timer);
  }, []);

  // 只在开发环境显示
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ok":
        return "#22c55e"; // green
      case "error":
        return "#ef4444"; // red
      case "checking":
        return "#f59e0b"; // yellow
      default:
        return "#6b7280"; // gray
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ok":
        return "✅ 正常";
      case "error":
        return "❌ 错误";
      case "checking":
        return "🔍 检查中...";
      default:
        return "❓ 未知";
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "10px",
        left: "10px",
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "12px",
        fontSize: "12px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        maxWidth: "350px",
        zIndex: 9999,
        fontFamily: "monospace",
      }}
    >
      <div
        style={{ fontWeight: "bold", marginBottom: "8px", color: "#1f2937" }}
      >
        🔧 API 状态检查 (开发模式)
      </div>

      <div style={{ marginBottom: "6px" }}>
        <span style={{ color: getStatusColor(debugInfo.backendStatus) }}>
          后端连接: {getStatusText(debugInfo.backendStatus)}
        </span>
      </div>

      <div style={{ marginBottom: "8px" }}>
        <span style={{ color: getStatusColor(debugInfo.proxyStatus) }}>
          代理状态: {getStatusText(debugInfo.proxyStatus)}
        </span>
      </div>

      {debugInfo.lastError && (
        <div
          style={{
            marginBottom: "8px",
            padding: "4px",
            background: "#fef2f2",
            borderRadius: "4px",
            fontSize: "11px",
            color: "#991b1b",
          }}
        >
          <strong>错误:</strong> {debugInfo.lastError.substring(0, 100)}
          {debugInfo.lastError.length > 100 ? "..." : ""}
        </div>
      )}

      {debugInfo.suggestions.length > 0 && (
        <div style={{ marginTop: "8px" }}>
          <div
            style={{
              fontWeight: "bold",
              marginBottom: "4px",
              fontSize: "11px",
            }}
          >
            💡 建议:
          </div>
          {debugInfo.suggestions.map((suggestion, index) => (
            <div
              key={index}
              style={{
                marginBottom: "2px",
                fontSize: "10px",
                lineHeight: "1.3",
              }}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          marginTop: "8px",
          paddingTop: "6px",
          borderTop: "1px solid #e5e7eb",
          fontSize: "10px",
          color: "#6b7280",
        }}
      >
        查看控制台获取更多调试信息
      </div>
    </div>
  );
};

export default APIDebugHelper;
