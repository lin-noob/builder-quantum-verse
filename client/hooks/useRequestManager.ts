import { useEffect, useRef } from 'react';
import { request } from '../lib/request';

/**
 * 请求管理Hook - 自动处理组件卸载时的请求清理
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
    requestIdsRef.current.forEach(requestId => {
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
    // 页面加载时的处理
    const handleBeforeUnload = () => {
      request.abortAllRequests();
    };

    // 注册页面卸载事件
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // 页面卸载时清理所有请求
      request.abortAllRequests();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
};
