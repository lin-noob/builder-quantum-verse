/**
 * 错误处理和调试工具
 */

// 错误类型枚举
export enum ErrorType {
  NETWORK = "NETWORK",
  TIMEOUT = "TIMEOUT",
  ABORT = "ABORT",
  VALIDATION = "VALIDATION",
  BUSINESS = "BUSINESS",
  UNKNOWN = "UNKNOWN",
}

// 错误信息接口
export interface ErrorInfo {
  type: ErrorType;
  message: string;
  originalError: Error;
  context?: Record<string, any>;
  timestamp: number;
  url?: string;
  method?: string;
}

// 错误分类器
export class ErrorClassifier {
  static classify(error: Error, context?: Record<string, any>): ErrorInfo {
    const timestamp = Date.now();
    const errorInfo: ErrorInfo = {
      type: ErrorType.UNKNOWN,
      message: error.message,
      originalError: error,
      context,
      timestamp,
    };

    // AbortError 分类
    if (error.name === "AbortError" || error.message.includes("aborted")) {
      errorInfo.type = ErrorType.ABORT;

      // 进一步分析 abort 原因
      if (error.message.includes("timeout") || context?.isTimeout) {
        errorInfo.type = ErrorType.TIMEOUT;
        errorInfo.message = "请求超时";
      } else if (error.message.includes("signal is aborted without reason")) {
        errorInfo.message = "请求被意外中止（可能由于页面导航或组件卸载）";
      } else {
        errorInfo.message = "请求被中止";
      }
    }
    // 网络错误
    else if (
      error.message.includes("fetch") ||
      error.message.includes("network")
    ) {
      errorInfo.type = ErrorType.NETWORK;
      errorInfo.message = "网络连接错误";
    }
    // 业务错误
    else if (error.name === "RequestError") {
      errorInfo.type = ErrorType.BUSINESS;
    }

    return errorInfo;
  }
}

// 错误处理器
export class ErrorHandler {
  private static errorLog: ErrorInfo[] = [];
  private static maxLogSize = 50;

  // 记录错误
  static logError(errorInfo: ErrorInfo) {
    this.errorLog.unshift(errorInfo);

    // 保持日志大小
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // 在开发环境中输出详细信息
    if (process.env.NODE_ENV === "development") {
      this.debugError(errorInfo);
    }
  }

  // 调试错误输出
  private static debugError(errorInfo: ErrorInfo) {
    const { type, message, originalError, context, url, method } = errorInfo;

    console.group(`🚨 Request Error [${type}]`);
    console.log(`📝 Message: ${message}`);
    if (url) console.log(`🌐 URL: ${method} ${url}`);
    if (context) console.log(`📋 Context:`, context);
    console.log(`⚠️ Original Error:`, originalError);
    console.log(`⏰ Timestamp: ${new Date(errorInfo.timestamp).toISOString()}`);
    console.groupEnd();
  }

  // 获取错误日志
  static getErrorLog(): ErrorInfo[] {
    return [...this.errorLog];
  }

  // 清理错误日志
  static clearErrorLog() {
    this.errorLog = [];
  }

  // 获取错误统计
  static getErrorStats() {
    const stats = {
      total: this.errorLog.length,
      byType: {} as Record<ErrorType, number>,
      recent: this.errorLog.slice(0, 5),
    };

    this.errorLog.forEach((error) => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
    });

    return stats;
  }

  // 处理并分类错误
  static handleError(error: Error, context?: Record<string, any>): ErrorInfo {
    const errorInfo = ErrorClassifier.classify(error, context);
    this.logError(errorInfo);
    return errorInfo;
  }
}

// 全局错误处理器
export const setupGlobalErrorHandler = () => {
  // 捕获未处理的 Promise 拒绝
  window.addEventListener("unhandledrejection", (event) => {
    if (event.reason instanceof Error) {
      const error = event.reason;

      // 特殊处理 AbortError - 完全静默，防止控制台输出
      if (error.name === 'AbortError' || error.message.includes('aborted')) {
        event.preventDefault(); // 阻止默认的控制台错误输出

        // 在开发环境中仅输出调试信息
        if (process.env.NODE_ENV === 'development') {
          console.debug('Suppressed AbortError (likely due to navigation/hot-reload):', error.message);
        }
        return;
      }

      const errorInfo = ErrorHandler.handleError(error, {
        source: "unhandledrejection",
      });

      // 对于其他类型的 ABORT 错误也进行阻止
      if (errorInfo.type === ErrorType.ABORT) {
        event.preventDefault();
      }
    }
  });

  // 捕获全局错误
  window.addEventListener("error", (event) => {
    if (event.error instanceof Error) {
      ErrorHandler.handleError(event.error, {
        source: "window.error",
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    }
  });

  // 在开发环境中提供调试工具
  if (process.env.NODE_ENV === "development") {
    (window as any).errorHandler = {
      getLog: () => ErrorHandler.getErrorLog(),
      getStats: () => ErrorHandler.getErrorStats(),
      clear: () => ErrorHandler.clearErrorLog(),
    };

    console.log(
      "🔧 Error Handler initialized. Use window.errorHandler for debugging.",
    );
  }
};
