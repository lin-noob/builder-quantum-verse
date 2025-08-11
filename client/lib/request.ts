/**
 * 通用请求配置接口
 */
export interface RequestConfig {
  /** 请求头 */
  headers?: Record<string, string>;
  /** 超时时间(毫秒) */
  timeout?: number;
  /** 是否携带凭证 */
  credentials?: RequestCredentials;
  /** 请求拦截器 */
  beforeRequest?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
  /** 响应拦截器 */
  afterResponse?: (response: Response) => Response | Promise<Response>;
  /** 错误处理器 */
  onError?: (error: Error) => void;
}

/**
 * 请求方法类型
 */
export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

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
export interface RequestOptions extends Omit<RequestConfig, 'beforeRequest' | 'afterResponse' | 'onError'> {
  /** 请求方法 */
  method?: RequestMethod;
  /** 请求数据 */
  data?: RequestData;
  /** 查询参数 */
  params?: Record<string, string | number | boolean>;
  /** 响应类型 */
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer';
}

/**
 * 标准业务API响应格式
 */
export interface BusinessApiResponse<T = any> {
  /** 响应码 */
  code: string;
  /** 响应数据 */
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

  constructor(message: string, status: number, statusText: string, response?: Response) {
    super(message);
    this.name = 'RequestError';
    this.status = status;
    this.statusText = statusText;
    this.response = response;
  }
}

/**
 * 通用HTTP请求类
 */
export class Request {
  private baseURL: string;
  private defaultConfig: RequestConfig;

  constructor(baseURL: string = '', config: RequestConfig = {}) {
    this.baseURL = baseURL;
    this.defaultConfig = {
      timeout: 10000,
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      ...config,
    };
  }

  /**
   * 构建完整URL
   */
  private buildURL(url: string, params?: Record<string, string | number | boolean>): string {
    const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    
    if (!params || Object.keys(params).length === 0) {
      return fullURL;
    }

    const urlObj = new URL(fullURL);
    Object.entries(params).forEach(([key, value]) => {
      urlObj.searchParams.set(key, String(value));
    });

    return urlObj.toString();
  }

  /**
   * 处理请求数据和请求头
   */
  private processRequestData(data: RequestData, headers: Record<string, string>) {
    if (!data) {
      return { body: null, headers };
    }

    // FormData类型数据
    if (data instanceof FormData) {
      // 移除Content-Type，让浏览器自动设置boundary
      const { 'Content-Type': contentType, ...restHeaders } = headers;
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
    if (typeof data === 'string') {
      return { body: data, headers };
    }

    // 对象类型数据，转换为JSON
    return { 
      body: JSON.stringify(data), 
      headers: { ...headers, 'Content-Type': 'application/json' }
    };
  }

  /**
   * 处理响应数据
   */
  private async processResponse<T>(response: Response, responseType: string = 'json'): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const errorMessage = `Request failed: ${response.status} ${response.statusText}`;
      throw new RequestError(errorMessage, response.status, response.statusText, response);
    }

    let data: any;
    
    try {
      switch (responseType) {
        case 'json':
          data = await response.json();
          break;
        case 'text':
          data = await response.text();
          break;
        case 'blob':
          data = await response.blob();
          break;
        case 'arrayBuffer':
          data = await response.arrayBuffer();
          break;
        default:
          data = await response.json();
      }
    } catch (error) {
      throw new RequestError(
        `Failed to parse response as ${responseType}`,
        response.status,
        response.statusText,
        response
      );
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  }

  /**
   * 创建超时控制器
   */
  private createTimeoutController(timeout: number) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    return { controller, timeoutId };
  }

  /**
   * 通用请求方法
   */
  async request<T = any>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const config = { ...this.defaultConfig, ...options };
    const {
      method = 'GET',
      data,
      params,
      headers = {},
      timeout = this.defaultConfig.timeout || 10000,
      credentials = this.defaultConfig.credentials,
      responseType = 'json',
    } = config;

    try {
      // 执行请求拦截器
      const processedConfig = this.defaultConfig.beforeRequest 
        ? await this.defaultConfig.beforeRequest(config)
        : config;

      const fullURL = this.buildURL(url, params);
      const mergedHeaders = { ...this.defaultConfig.headers, ...headers };
      const { body, headers: finalHeaders } = this.processRequestData(data, mergedHeaders);

      // 创建超时控制器
      const { controller, timeoutId } = this.createTimeoutController(timeout);

      const fetchOptions: RequestInit = {
        method,
        headers: finalHeaders,
        body: method !== 'GET' ? body : null,
        credentials,
        signal: controller.signal,
      };

      const response = await fetch(fullURL, fetchOptions);
      clearTimeout(timeoutId);

      // 执行响应拦截器
      const processedResponse = this.defaultConfig.afterResponse
        ? await this.defaultConfig.afterResponse(response)
        : response;

      return await this.processResponse<T>(processedResponse, responseType);

    } catch (error) {
      // 执行错误处理器
      if (this.defaultConfig.onError) {
        this.defaultConfig.onError(error as Error);
      }

      // 重新抛出错误
      if (error instanceof RequestError) {
        throw error;
      }

      // 处理超时错误
      if (error instanceof Error && error.name === 'AbortError') {
        throw new RequestError('Request timeout', 408, 'Request Timeout');
      }

      // 处理网络错误
      throw new RequestError(
        error instanceof Error ? error.message : 'Unknown error',
        0,
        'Network Error'
      );
    }
  }

  /**
   * GET请求
   */
  async get<T = any>(url: string, params?: Record<string, string | number | boolean>, options?: Omit<RequestOptions, 'method' | 'data' | 'params'>): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET', params });
  }

  /**
   * POST请求
   */
  async post<T = any>(url: string, data?: RequestData, options?: Omit<RequestOptions, 'method' | 'data'>): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'POST', data });
  }

  /**
   * PUT请求
   */
  async put<T = any>(url: string, data?: RequestData, options?: Omit<RequestOptions, 'method' | 'data'>): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'PUT', data });
  }

  /**
   * DELETE请求
   */
  async delete<T = any>(url: string, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }

  /**
   * PATCH请求
   */
  async patch<T = any>(url: string, data?: RequestData, options?: Omit<RequestOptions, 'method' | 'data'>): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'PATCH', data });
  }

  /**
   * 上传文件
   */
  async upload<T = any>(url: string, formData: FormData, options?: Omit<RequestOptions, 'method' | 'data'>): Promise<ApiResponse<T>> {
    return this.request<T>(url, { 
      ...options, 
      method: 'POST', 
      data: formData,
    });
  }

  /**
   * 下载文件
   */
  async download(url: string, params?: Record<string, string | number | boolean>, options?: Omit<RequestOptions, 'method' | 'responseType'>): Promise<ApiResponse<Blob>> {
    return this.request<Blob>(url, { 
      ...options, 
      method: 'GET', 
      params,
      responseType: 'blob',
    });
  }
}

// 创建默认实例
export const request = new Request();

// 导出工具函数
export const createRequest = (baseURL: string, config?: RequestConfig) => {
  return new Request(baseURL, config);
};
