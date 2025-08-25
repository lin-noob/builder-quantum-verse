import React, { useEffect, useState } from 'react';
import { request } from '@/lib/request';

/**
 * 测试组件 - 用于验证 AbortError 修复
 * 这个组件会快速挂载和卸载来触发请求中止，验证是否还会出现 AbortError
 */
export const AbortErrorTestComponent: React.FC = () => {
  const [status, setStatus] = useState<string>('Ready');
  const [errorCount, setErrorCount] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    
    const testAbortHandling = async () => {
      if (!mounted) return;
      
      setStatus('Starting requests...');
      
      // 启动多个请求来测试中止处理
      const testRequests = Array.from({ length: 5 }, async (_, index) => {
        try {
          setStatus(`Request ${index + 1} starting...`);
          
          // 模拟一个会超时的请求
          const response = await request.get('/nonexistent-api-endpoint', {
            test: 'abort-handling'
          }, {
            timeout: 1000
          });
          
          if (mounted) {
            setStatus(`Request ${index + 1} completed`);
          }
        } catch (error) {
          if (mounted) {
            // 检查是否是我们期望的静默处理
            if (error instanceof Error && error.name === 'AbortError') {
              setErrorCount(prev => prev + 1);
              setStatus(`Request ${index + 1} aborted (this should be handled silently)`);
            } else {
              setStatus(`Request ${index + 1} failed: ${error}`);
            }
          }
        }
      });

      // 等待一小段时间然后取消挂载（模拟组件卸载）
      setTimeout(() => {
        mounted = false;
        setStatus('Component unmounted - requests should be cancelled silently');
      }, 500);

      await Promise.allSettled(testRequests);
    };

    testAbortHandling();

    return () => {
      mounted = false;
    };
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null; // 只在开发环境显示
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: '#f0f0f0', 
      padding: '10px', 
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999
    }}>
      <div><strong>AbortError Test</strong></div>
      <div>Status: {status}</div>
      <div>AbortErrors detected: {errorCount}</div>
      <div style={{ marginTop: '5px', fontSize: '10px', color: '#666' }}>
        如果修复成功，应该看不到控制台中的 AbortError
      </div>
    </div>
  );
};

export default AbortErrorTestComponent;
