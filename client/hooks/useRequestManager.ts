import React, { useEffect, useRef } from "react";
import { request } from "../lib/request";

/**
 * ���求管理Hook - 自动处理组件卸载时的请求清理
 */
export const useRequestManager = () => {
  const requestIdsRef = useRef<Set<string>>(new Set());

  // 添加请求ID到跟踪列表
  const trackRequest = (requestId: string) => {
    requestIdsRef.current.add(requestId);
  };

  // 从跟踪列表移除请求ID
  const untrackRequest = (requestId: string) => {
    requestIdsRef.current.delete(requestId);
  };

  // 取消指定请求
  const cancelRequest = (requestId: string) => {
    request.abortRequest(requestId);
    untrackRequest(requestId);
  };

  // 取消所有跟踪的请求
  const cancelAllRequests = () => {
    requestIdsRef.current.forEach((requestId) => {
      request.abortRequest(requestId);
    });
    requestIdsRef.current.clear();
  };

  // 组件卸载时自动清理所有请求
  useEffect(() => {
    return () => {
      cancelAllRequests();
    };
  }, []);

  return {
    trackRequest,
    untrackRequest,
    cancelRequest,
    cancelAllRequests,
  };
};

/**
 * 页面级别的请求管理Hook - 在页面切换时清理请求
 */
export const usePageRequestManager = () => {
  useEffect(() => {
    // 添加全局错误处理器来捕获未处理的AbortError
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (process.env.NODE_ENV === 'development' &&
          event.reason &&
          typeof event.reason === 'object' &&
          (event.reason.name === 'AbortError' ||
           event.reason.name === 'DOMException' ||
           (event.reason.message && (
             event.reason.message.includes('aborted') ||
             event.reason.message.includes('signal is aborted')
           )))) {
        // 静默处理开发环境中的AbortError
        event.preventDefault();
        console.debug('Unhandled AbortError/DOMException suppressed (development)');
      }
    };

    // 添加全局错误事件处理器
    const handleGlobalError = (event: ErrorEvent) => {
      if (process.env.NODE_ENV === 'development' &&
          event.error &&
          (event.error.name === 'AbortError' ||
           event.error.name === 'DOMException' ||
           (event.error.message && (
             event.error.message.includes('aborted') ||
             event.error.message.includes('signal is aborted')
           )))) {
        // 静默处理开发环境中的AbortError
        event.preventDefault();
        console.debug('Global AbortError/DOMException suppressed (development)');
      }
    };

    // 页面加载时的处理
    const handleBeforeUnload = () => {
      // 在开发环境中使用异步方式来避免同步错误
      if (process.env.NODE_ENV === 'development') {
        setTimeout(() => {
          try {
            request.abortAllRequests();
          } catch (e) {
            // 完全静默
          }
        }, 0);
      } else {
        try {
          request.abortAllRequests();
        } catch (error) {
          console.warn('Error aborting requests during page unload:', error);
        }
      }
    };

    // 注册事件监听器
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleGlobalError);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // 页面卸载时清理所有请求
      if (process.env.NODE_ENV === 'development') {
        // 异步清理避免阻塞页面卸载
        setTimeout(() => {
          try {
            request.abortAllRequests();
          } catch (e) {
            // 完全静默
          }
        }, 0);
      } else {
        try {
          request.abortAllRequests();
        } catch (error) {
          console.warn('Error aborting requests during cleanup:', error);
        }
      }

      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
};
