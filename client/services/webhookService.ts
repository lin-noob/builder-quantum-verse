// Webhook事件触发服务
import { WebhookConfig, WebhookLog } from '../types/webhook';

interface WebhookPayload {
  event: string;
  data: any;
  timestamp: string;
  webhookId?: string;
}

interface WebhookResponse {
  success: boolean;
  status?: number;
  data?: any;
  error?: string;
  duration: number;
}

class WebhookService {
  private static instance: WebhookService;
  private webhooks: Map<string, WebhookConfig> = new Map();
  private logs: WebhookLog[] = [];
  private maxLogs = 1000;

  private constructor() {}

  static getInstance(): WebhookService {
    if (!WebhookService.instance) {
      WebhookService.instance = new WebhookService();
    }
    return WebhookService.instance;
  }

  // 注册Webhook配置
  registerWebhook(config: WebhookConfig): void {
    this.webhooks.set(config.id, config);
  }

  // 取消注册Webhook
  unregisterWebhook(webhookId: string): void {
    this.webhooks.delete(webhookId);
  }

  // 获取所有Webhook配置
  getWebhooks(): WebhookConfig[] {
    return Array.from(this.webhooks.values());
  }

  // 获取特定Webhook
  getWebhook(webhookId: string): WebhookConfig | undefined {
    return this.webhooks.get(webhookId);
  }

  // 触发事件
  async triggerEvent(event: string, data: any): Promise<void> {
    const webhooks = Array.from(this.webhooks.values()).filter(
      webhook => webhook.enabled && webhook.events.includes(event)
    );

    // 并行触发所有匹配的Webhook
    const promises = webhooks.map(webhook => 
      this.triggerWebhook(webhook, event, data)
    );

    await Promise.allSettled(promises);
  }

  // 触发单个Webhook
  private async triggerWebhook(
    webhook: WebhookConfig, 
    event: string, 
    data: any
  ): Promise<WebhookResponse> {
    const startTime = Date.now();
    const logId = this.generateLogId();
    
    const payload: WebhookPayload = {
      event,
      data,
      timestamp: new Date().toISOString(),
      webhookId: webhook.id
    };

    const requestLog = {
      id: logId,
      webhookId: webhook.id,
      event,
      status: 'pending' as const,
      request: {
        url: webhook.endpointUrl,
        headers: webhook.headers,
        body: payload,
        timestamp: new Date().toISOString()
      },
      retryCount: 0,
      duration: 0
    };

    this.addLog(requestLog);

    try {
      const response = await this.sendWebhookRequest(webhook, payload);
      const duration = Date.now() - startTime;
      
      const updatedLog = {
        ...requestLog,
        status: response.success ? 'success' as const : 'failed' as const,
        response: response.success ? {
          status: response.status!,
          headers: {},
          body: response.data,
          timestamp: new Date().toISOString()
        } : undefined,
        error: response.error,
        duration
      };

      this.updateLog(logId, updatedLog);
      
      // 更新Webhook统计信息
      this.updateWebhookStats(webhook.id, response.success);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // 尝试重试
      const retryResult = await this.handleRetry(webhook, payload, requestLog, errorMessage);
      
      return retryResult;
    }
  }

  // 发送Webhook请求
  private async sendWebhookRequest(
    webhook: WebhookConfig, 
    payload: WebhookPayload
  ): Promise<WebhookResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

    try {
      const response = await fetch(webhook.endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'CDP-Webhook/1.0',
          ...webhook.headers
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      let responseData;
      try {
        responseData = await response.json();
      } catch {
        responseData = await response.text();
      }

      return {
        success: response.ok,
        status: response.status,
        data: responseData,
        duration: 0
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout',
            duration: 0
          };
        }
        return {
          success: false,
          error: error.message,
          duration: 0
        };
      }
      
      return {
        success: false,
        error: 'Network error',
        duration: 0
      };
    }
  }

  // 处理重试
  private async handleRetry(
    webhook: WebhookConfig,
    payload: WebhookPayload,
    originalLog: WebhookLog,
    error: string
  ): Promise<WebhookResponse> {
    const maxRetries = webhook.retryConfig?.maxRetries || 0;
    let retryCount = 0;
    let lastError = error;

    while (retryCount < maxRetries) {
      retryCount++;
      
      // 更新日志重试次数
      this.updateLog(originalLog.id, {
        ...originalLog,
        retryCount,
        error: lastError
      });

      // 延迟重试
      const retryDelay = webhook.retryConfig?.retryDelay || 5000;
      await new Promise(resolve => setTimeout(resolve, retryDelay));

      try {
        const response = await this.sendWebhookRequest(webhook, payload);
        if (response.success) {
          const duration = Date.now() - new Date(originalLog.request.timestamp).getTime();
          
          this.updateLog(originalLog.id, {
            ...originalLog,
            status: 'success',
            response: response.success ? {
              status: response.status!,
              headers: {},
              body: response.data,
              timestamp: new Date().toISOString()
            } : undefined,
            duration
          });

          this.updateWebhookStats(webhook.id, true);
          return response;
        }
        
        lastError = response.error || 'Unknown error';
      } catch (retryError) {
        lastError = retryError instanceof Error ? retryError.message : 'Unknown error';
      }
    }

    // 所有重试都失败
    const finalDuration = Date.now() - new Date(originalLog.request.timestamp).getTime();
    
    this.updateLog(originalLog.id, {
      ...originalLog,
      status: 'failed',
      error: lastError,
      duration: finalDuration
    });

    this.updateWebhookStats(webhook.id, false);

    return {
      success: false,
      error: lastError,
      duration: finalDuration
    };
  }

  // 更新Webhook统计信息
  private updateWebhookStats(webhookId: string, success: boolean): void {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) return;

    webhook.triggerCount++;
    const currentSuccessRate = webhook.successRate;
    const newSuccessRate = success ? 
      ((currentSuccessRate * (webhook.triggerCount - 1)) + 100) / webhook.triggerCount :
      (currentSuccessRate * (webhook.triggerCount - 1)) / webhook.triggerCount;
    
    webhook.successRate = Math.round(newSuccessRate * 10) / 10;
    webhook.lastTriggered = new Date().toISOString();
  }

  // 添加日志
  private addLog(log: WebhookLog): void {
    this.logs.unshift(log);
    
    // 限制日志数量
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
  }

  // 更新日志
  private updateLog(logId: string, updatedLog: WebhookLog): void {
    const index = this.logs.findIndex(log => log.id === logId);
    if (index !== -1) {
      this.logs[index] = updatedLog;
    }
  }

  // 获取日志
  getLogs(webhookId?: string): WebhookLog[] {
    if (webhookId) {
      return this.logs.filter(log => log.webhookId === webhookId);
    }
    return [...this.logs];
  }

  // 清除日志
  clearLogs(webhookId?: string): void {
    if (webhookId) {
      this.logs = this.logs.filter(log => log.webhookId !== webhookId);
    } else {
      this.logs = [];
    }
  }

  // 生成日志ID
  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 验证Webhook签名
  verifyWebhookSignature(
    payload: string, 
    signature: string, 
    secret: string
  ): boolean {
    // 这里应该实现HMAC签名验证
    // 简化实现，实际项目中应该使用crypto模块
    return true; // 暂时返回true，实际实现需要加密验证
  }

  // 生成Webhook签名
  generateWebhookSignature(payload: string, secret: string): string {
    // 这里应该实现HMAC签名生成
    // 简化实现，实际项目中应该使用crypto模块
    return `sha256=${Math.random().toString(36)}`;
  }
}

export const webhookService = WebhookService.getInstance();
export default WebhookService;