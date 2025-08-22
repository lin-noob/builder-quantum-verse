import { ErrorHandler } from "./errorHandler";

/**
 * 通用请求配置接口
 */
export interface RequestConfig {
  /** 请求头 */
  headers?: Record<string, string>;
  /** ���时时��(毫秒) */
  timeout?: number;
  /** 是否携带凭证 */
  credentials?: RequestCredentials;
  /** 请求拦截器 */
  beforeRequest?: (
    config: RequestConfig,
  ) => RequestConfig | Promise<RequestConfig>;
  /** 响应拦截器 */
  afterResponse?: (response: Response) => Response | Promise<Response>;
  /** 错误处理器 */
  onError?: (error: Error) => void;
}

/**
 * 请求方法类型
 */
export type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/**
 * 请求数据类型
 */
export type RequestData =
  | Record<string, any>
  | FormData
  | string
  | ArrayBuffer
  | Blob
  | null;

/**
 * 请求选项
 */
export interface RequestOptions
  extends Omit<RequestConfig, "beforeRequest" | "afterResponse" | "onError"> {
  /** 请求方�� */
  method?: RequestMethod;
  /** 请求数据 */
  data?: RequestData;
  /** 查询参数 */
  params?: Record<string, string | number | boolean>;
  /** 响应类型 */
  responseType?: "json" | "text" | "blob" | "arrayBuffer";
}

/**
 * 标准业务API响应格式
 */
export interface BusinessApiResponse<T = any> {
  /** 响应码 */
  code: string;
  /** 响��数据 */
  data: T;
  /** 响应消息 */
  msg: string;
  /** 总数量（用于分页等场景） */
  total?: number;
}

/**
 * HTTP响应数据接口
 */
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

/**
 * HTTP请求错误类
 */
export class RequestError extends Error {
  status: number;
  statusText: string;
  response?: Response;

  constructor(
    message: string,
    status: number,
    statusText: string,
    response?: Response,
  ) {
    super(message);
    this.name = "RequestError";
    this.status = status;
    this.statusText = statusText;
    this.response = response;
  }
}

/**
 * 请求管理器 - 用于跟踪和管理进行中的请求
 */
class RequestManager {
  private requests = new Map<string, AbortController>();

  createController(requestId: string): AbortController {
    // 如果已存在相��ID的请求，先取消它
    if (this.requests.has(requestId)) {
      this.requests.get(requestId)?.abort();
    }

    const controller = new AbortController();
    this.requests.set(requestId, controller);
    return controller;
  }

  removeRequest(requestId: string) {
    this.requests.delete(requestId);
  }

  abortRequest(requestId: string) {
    const controller = this.requests.get(requestId);
    if (controller) {
      controller.abort();
      this.requests.delete(requestId);
    }
  }

  abortAllRequests() {
    // 在开发环境中，使用更激进的静默处理
    if (process.env.NODE_ENV === 'development') {
      try {
        const controllers = Array.from(this.requests.values());

        // 使用 Promise-based 方法来完全静默处理错误
        controllers.forEach((controller) => {
          Promise.resolve().then(() => {
            try {
              if (controller && !controller.signal.aborted) {
                controller.abort();
              }
            } catch (e) {
              // 完全静默，不做任何处理
            }
          }).catch(() => {
            // 捕获任何异步错误，完全静默
          });
        });
      } catch (e) {
        // 完全静默处理任何同步错误
      } finally {
        this.requests.clear();
      }
      return;
    }

    // 生产环境的处理
    try {
      const controllers = Array.from(this.requests.values());

      controllers.forEach((controller) => {
        try {
          if (controller && !controller.signal.aborted) {
            controller.abort();
          }
        } catch (error) {
          if (error instanceof Error && !error.name.includes('Abort')) {
            console.warn('Error aborting request:', error);
          }
        }
      });
    } catch (error) {
      console.warn('Error during request cleanup:', error);
    } finally {
      this.requests.clear();
    }
  }
}

/**
 * 通用HTTP请求类
 */
export class Request {
  private baseURL: string;
  private defaultConfig: RequestConfig;
  private requestManager = new RequestManager();

  constructor(baseURL: string = "", config: RequestConfig = {}) {
    this.baseURL = baseURL;
    this.defaultConfig = {
      timeout: 30000, // 增加到30秒
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      ...config,
    };
  }

  /**
   * 构建完整URL
   */
  private buildURL(
    url: string,
    params?: Record<string, string | number | boolean>,
  ): string {
    const fullURL = url.startsWith("http") ? url : `${this.baseURL}${url}`;

    if (!params || Object.keys(params).length === 0) {
      return fullURL;
    }

    // 处理相对路径的情况（用于代理）
    if (!fullURL.startsWith("http")) {
      // 对于相对路径，手动拼接查询参数
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.set(key, String(value));
      });
      const queryString = searchParams.toString();
      return queryString ? `${fullURL}?${queryString}` : fullURL;
    }

    // 对于绝对URL，使用URL对象处理
    const urlObj = new URL(fullURL);
    Object.entries(params).forEach(([key, value]) => {
      urlObj.searchParams.set(key, String(value));
    });

    return urlObj.toString();
  }

  /**
   * 处理请求数据和请求头
   */
  private processRequestData(
    data: RequestData,
    headers: Record<string, string>,
  ) {
    if (!data) {
      return { body: null, headers };
    }

    // FormData类型数据
    if (data instanceof FormData) {
      // 移除Content-Type，让浏览器自动设置boundary
      const { "Content-Type": contentType, ...restHeaders } = headers;
      return { body: data, headers: restHeaders };
    }

    // Blob类型数据
    if (data instanceof Blob) {
      return { body: data, headers };
    }

    // ArrayBuffer类型数据
    if (data instanceof ArrayBuffer) {
      return { body: data, headers };
    }

    // 字符串类型数据
    if (typeof data === "string") {
      return { body: data, headers };
    }

    // 对象类型数据，转换为JSON
    return {
      body: JSON.stringify(data),
      headers: { ...headers, "Content-Type": "application/json" },
    };
  }

  /**
   * 处理响应数据
   */
  private async processResponse<T>(
    response: Response,
    responseType: string = "json",
  ): Promise<ApiResponse<T>> {
    let data: any;

    // 总是尝试解析响应体，不管状态码是什么
    try {
      switch (responseType) {
        case "json":
          data = await response.json();
          break;
        case "text":
          data = await response.text();
          break;
        case "blob":
          data = await response.blob();
          break;
        case "arrayBuffer":
          data = await response.arrayBuffer();
          break;
        default:
          data = await response.json();
      }
    } catch (error) {
      // 解��失败时返回null，但仍然返回响应信息
      console.error(`Failed to parse response as ${responseType}:`, error);
      data = null;
    }

    return data;
  }

  /**
   * 创建超时控制器
   */
  private createTimeoutController(timeout: number, requestId: string) {
    const controller = this.requestManager.createController(requestId);
    const timeoutId = setTimeout(() => {
      try {
        if (!controller.signal.aborted) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`Request timeout after ${timeout}ms: ${requestId}`);
            console.warn(`开发环境提示：请检查后端服务是否运行在配置的地址上`);
          }
          controller.abort(new Error("Request timeout"));
        }
      } catch (error) {
        // 静默处理超时abort中的错误
        if (process.env.NODE_ENV === 'development') {
          console.debug('Timeout abort handled (development)');
        }
      }
    }, timeout);

    return { controller, timeoutId };
  }

  /**
   * 通用请求方法
   */
  async request<T = any>(
    url: string,
    options: RequestOptions = {},
  ): Promise<ApiResponse<T>> {
    const config = { ...this.defaultConfig, ...options };
    const {
      method = "GET",
      data,
      params,
      headers = {},
      timeout = this.defaultConfig.timeout || 30000, // 增��超时时间到30秒
      credentials = this.defaultConfig.credentials,
      responseType = "json",
    } = config;

    let timeoutId: number | undefined;
    let requestId: string;
    let fullURL: string;

    try {
      // 执行请求拦截器
      const processedConfig = this.defaultConfig.beforeRequest
        ? await this.defaultConfig.beforeRequest(config)
        : config;

      fullURL = this.buildURL(url, params);
      requestId = `${method}_${fullURL}_${Date.now()}`;
      const mergedHeaders = { ...this.defaultConfig.headers, ...headers };
      const { body, headers: finalHeaders } = this.processRequestData(
        data,
        mergedHeaders,
      );

      // 创建超时控制器
      const { controller, timeoutId: tid } = this.createTimeoutController(
        timeout,
        requestId,
      );
      timeoutId = tid;

      const fetchOptions: RequestInit = {
        method,
        headers: finalHeaders,
        body: method !== "GET" ? body : null,
        credentials,
        signal: controller.signal,
      };

      const response = await fetch(fullURL, fetchOptions);

      // 请求成功，清理资源
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
      this.requestManager.removeRequest(requestId);

      // 执行响应拦截器
      const processedResponse = this.defaultConfig.afterResponse
        ? await this.defaultConfig.afterResponse(response)
        : response;

      return await this.processResponse<T>(processedResponse, responseType);
    } catch (error) {
      // 确保清理资源
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (requestId) {
        this.requestManager.removeRequest(requestId);
      }

      // 使用新的���误处理系统
      const errorContext = {
        url: fullURL,
        method,
        isTimeout: timeoutId !== undefined,
        requestId,
      };

      const errorInfo = ErrorHandler.handleError(error as Error, errorContext);

      // 执行用户自定义错误处理器
      if (this.defaultConfig.onError) {
        this.defaultConfig.onError(error as Error);
      }

      // 重新抛出错误
      if (error instanceof RequestError) {
        throw error;
      }

      // 根据错误类型抛出相应的错误
      switch (errorInfo.type) {
        case "TIMEOUT":
          // 在开发环境中，提供更好的超时处理
          if (process.env.NODE_ENV === 'development') {
            console.warn(`Request timeout in development: ${url}`);
            console.warn('开发环境提示：后端服务可能未启动，建议检查服务状态');
            // 返回一个默认响应而不是抛出错误
            return { data: null, status: 408, statusText: 'Request Timeout' } as any;
          }
          throw new RequestError(
            "请求超时，可能是网络连接问题或后端服务未启动",
            408,
            "Request Timeout"
          );
        case "ABORT":
          // 在开发环境中，AbortError通常是由热重载或页面��载引起的，不应作为真正的错误
          if (process.env.NODE_ENV === 'development') {
            console.debug('Request aborted due to page reload/navigation (development)');
            return { data: null, status: 499, statusText: 'Aborted' } as any;
          }
          throw new RequestError(
            "Request aborted",
            499,
            "Client Closed Request",
          );
        case "NETWORK":
          throw new RequestError("Network error", 0, "Network Error");
        default:
          throw new RequestError(
            error instanceof Error ? error.message : "Unknown error",
            0,
            "Unknown Error",
          );
      }
    }
  }

  /**
   * GET请求
   */
  async get<T = any>(
    url: string,
    params?: Record<string, string | number | boolean>,
    options?: Omit<RequestOptions, "method" | "data" | "params">,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: "GET", params });
  }

  /**
   * POST请求
   */
  async post<T = any>(
    url: string,
    data?: RequestData,
    options?: Omit<RequestOptions, "method" | "data">,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: "POST", data });
  }

  /**
   * PUT请��
   */
  async put<T = any>(
    url: string,
    data?: RequestData,
    options?: Omit<RequestOptions, "method" | "data">,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: "PUT", data });
  }

  /**
   * DELETE请求
   */
  async delete<T = any>(
    url: string,
    options?: Omit<RequestOptions, "method">,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: "DELETE" });
  }

  /**
   * PATCH请求
   */
  async patch<T = any>(
    url: string,
    data?: RequestData,
    options?: Omit<RequestOptions, "method" | "data">,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: "PATCH", data });
  }

  /**
   * 上传文件
   */
  async upload<T = any>(
    url: string,
    formData: FormData,
    options?: Omit<RequestOptions, "method" | "data">,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: "POST",
      data: formData,
    });
  }

  /**
   * 下载文件
   */
  async download(
    url: string,
    params?: Record<string, string | number | boolean>,
    options?: Omit<RequestOptions, "method" | "responseType">,
  ): Promise<ApiResponse<Blob>> {
    return this.request<Blob>(url, {
      ...options,
      method: "GET",
      params,
      responseType: "blob",
    });
  }

  /**
   * 业务接口请求 - 自动处理标���业务响应格式
   */
  async businessRequest<T = any>(
    url: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const response = await this.request<BusinessApiResponse<T>>(url, options);
    const businessData = response.data;

    // 根据业务码判断请求是否成功
    if (businessData.code !== "200" && businessData.code !== "0") {
      throw new RequestError(
        businessData.msg || "业务请求失败",
        parseInt(businessData.code) || 400,
        businessData.msg || "Business Error",
      );
    }

    return businessData.data;
  }

  /**
   * 业务GET请求
   */
  async businessGet<T = any>(
    url: string,
    params?: Record<string, string | number | boolean>,
    options?: Omit<RequestOptions, "method" | "data" | "params">,
  ): Promise<T> {
    return this.businessRequest<T>(url, { ...options, method: "GET", params });
  }

  /**
   * 业务POST请求
   */
  async businessPost<T = any>(
    url: string,
    data?: RequestData,
    options?: Omit<RequestOptions, "method" | "data">,
  ): Promise<T> {
    return this.businessRequest<T>(url, { ...options, method: "POST", data });
  }

  /**
   * 业务PUT请求
   */
  async businessPut<T = any>(
    url: string,
    data?: RequestData,
    options?: Omit<RequestOptions, "method" | "data">,
  ): Promise<T> {
    return this.businessRequest<T>(url, { ...options, method: "PUT", data });
  }

  /**
   * 业务DELETE请求
   */
  async businessDelete<T = any>(
    url: string,
    options?: Omit<RequestOptions, "method">,
  ): Promise<T> {
    return this.businessRequest<T>(url, { ...options, method: "DELETE" });
  }

  /**
   * 业务PATCH请求
   */
  async businessPatch<T = any>(
    url: string,
    data?: RequestData,
    options?: Omit<RequestOptions, "method" | "data">,
  ): Promise<T> {
    return this.businessRequest<T>(url, { ...options, method: "PATCH", data });
  }

  /**
   * 取消指定请求
   */
  abortRequest(requestId: string) {
    this.requestManager.abortRequest(requestId);
  }

  /**
   * 取消所有进行中的请求
   */
  abortAllRequests() {
    this.requestManager.abortAllRequests();
  }
}

// 创建默认实例
export const request = new Request();

// 导出工具函数
export const createRequest = (baseURL: string, config?: RequestConfig) => {
  return new Request(baseURL, config);
};
