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
  /** ��应类型 */
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
    try {
      const controllers = Array.from(this.requests.values());

      controllers.forEach((controller) => {
        try {
          if (controller && !controller.signal.aborted) {
            // 在调用 abort 之前，添加一个事件监听器来静默处理 AbortError
            const originalSignal = controller.signal;
            if (originalSignal && !originalSignal.aborted) {
              // 静默调用 abort，不抛出任何错误
              Promise.resolve()
                .then(() => {
                  try {
                    controller.abort(
                      new DOMException("Request cancelled", "AbortError"),
                    );
                  } catch (e) {
                    // 静默处理
                  }
                })
                .catch(() => {
                  // 静默处理异步错误
                });
            }
          }
        } catch (error) {
          // 静默处理所有错误
        }
      });
    } catch (error) {
      // 静默处理顶级错误
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

    // 对于绝对URL��使用URL对象处理
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
    const contentType = response.headers.get("content-type") || "";

    // 检查响应状态
    if (!response.ok) {
      const statusError = `HTTP ${response.status} ${response.statusText}`;

      // 对于错误响应，先尝试获取响应内容来提供更好的错误信息
      try {
        const errorText = await response.text();

        // 检查是否返回了HTML错误页面
        if (errorText.trim().toLowerCase().startsWith("<!doctype") ||
            errorText.trim().toLowerCase().startsWith("<html")) {

          if (process.env.NODE_ENV === 'development') {
            console.group(`🚨 API Error: HTML Response Instead of JSON`);
            console.log(`URL: ${response.url}`);
            console.log(`Status: ${response.status} ${response.statusText}`);
            console.log(`Content-Type: ${contentType}`);
            console.log(`Response Preview:`, errorText.substring(0, 300));
            console.log(`Possible causes:
              1. API endpoint doesn't exist
              2. Server routing issue
              3. Backend service not running
              4. Proxy configuration problem`);
            console.groupEnd();
          }

          throw new RequestError(
            `服务器返回了HTML错误页面而不是JSON数据 (${statusError})`,
            response.status,
            response.statusText,
            response
          );
        }

        throw new RequestError(
          `请求失败: ${statusError}${errorText ? ` - ${errorText}` : ''}`,
          response.status,
          response.statusText,
          response
        );
      } catch (parseError) {
        if (parseError instanceof RequestError) {
          throw parseError;
        }

        throw new RequestError(
          `请求失败: ${statusError}`,
          response.status,
          response.statusText,
          response
        );
      }
    }

    // 根据期望的响应类型处理数据
    try {
      switch (responseType) {
        case "json":
          // 对于 JSON 类型，检查 content-type
          if (!contentType.includes("application/json") && !contentType.includes("text/json")) {
            // 如果不是 JSON content-type，先获取文本内容检查
            const textContent = await response.text();

            // 检查是否意外返回了 HTML
            if (textContent.trim().toLowerCase().startsWith("<!doctype") ||
                textContent.trim().toLowerCase().startsWith("<html")) {
              console.error("Expected JSON but received HTML:", {
                url: response.url,
                contentType,
                preview: textContent.substring(0, 200) + "..."
              });

              throw new Error(`服务器返回了HTML页面而不是期望的JSON数据。可能的原因：\n1. API端点不存在\n2. 服务器配置错误\n3. 路由问题`);
            }

            // 尝试解析为 JSON（可能是没有正确设置 content-type 的 JSON）
            try {
              data = JSON.parse(textContent);
            } catch (jsonError) {
              console.error("Failed to parse response as JSON:", {
                url: response.url,
                contentType,
                content: textContent.substring(0, 500)
              });
              throw new Error(`无法解析响应为JSON格式，响应内容: ${textContent.substring(0, 100)}...`);
            }
          } else {
            data = await response.json();
          }
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
      // 提供更详细的解析错误信息
      const errorMessage = error instanceof Error ? error.message : "Unknown parsing error";

      console.error(`Failed to parse response as ${responseType}:`, {
        error: errorMessage,
        url: response.url,
        status: response.status,
        contentType,
        responseType
      });

      // 重新抛出更有意义的错误
      throw new Error(`响应解析失败 (${responseType}): ${errorMessage}`);
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    } as ApiResponse<T>;
  }

  /**
   * 创建超时控制器
   */
  private createTimeoutController(timeout: number, requestId: string) {
    const controller = this.requestManager.createController(requestId);
    const timeoutId = setTimeout(() => {
      try {
        if (!controller.signal.aborted) {
          if (process.env.NODE_ENV === "development") {
            console.warn(`Request timeout after ${timeout}ms: ${requestId}`);
            console.warn(`开发环境提示：请检查后端服务是否运行在��置的地址上`);
          }
          // 使用 DOMException 而不是 Error，���样更符合浏览器标准
          try {
            controller.abort(new DOMException("Request timeout", "AbortError"));
          } catch (err) {
            // 某些环境可能不支持传递 reason，回退到普通的 abort()
            controller.abort();
          }
        }
      } catch (error) {
        // 静默处理超时abort中的错误
        if (process.env.NODE_ENV === "development") {
          console.debug("Timeout abort handled (development)");
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

    // 在开发环境中，对于特定的API路径，直接返回mock响应避免超时
    if (
      false &&
      process.env.NODE_ENV === "development" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname.includes("fly.dev")) &&
      url.includes("/quote/api/")
    ) {
      console.log(
        `Mock response for ${method} ${url} in development environment`,
      );
      await new Promise((resolve) => setTimeout(resolve, 200)); // 模拟网络延迟

      // 为营销场景列表API提供特定的mock数据
      if (url.includes("/quote/api/v1/scene/list")) {
        const mockScenarios = [
          {
            id: "add_to_cart",
            sceneName: "加入购物车",
            status: 1,
            aiStrategyConfig: JSON.stringify({
              defaultAIConfig: {
                description:
                  "AI会根据用户画像、购物车商品等信息，自主生成最合适的挽留或激励文案",
                strategySummary:
                  "在用户犹豫或准备离开时进行精准挽留，提升订单转化率。",
                coreStrategies: ["网页弹窗", "智能延迟", "个性化生成"],
              },
            }),
            gmtCreate: "2024-01-10T10:00:00Z",
            gmtModified: "2024-01-15T14:30:00Z",
            nullId: false,
          },
          {
            id: "view_product",
            sceneName: "���品浏览",
            status: 0,
            aiStrategyConfig: JSON.stringify({
              defaultAIConfig: {
                description: "根据用户浏览行为��商品信息，推荐相关产品或优惠",
                strategySummary: "通过智能推荐提升用户购买转化。",
                coreStrategies: ["个性化推荐", "智能营销", "精准投放"],
              },
            }),
            gmtCreate: "2024-01-08T09:00:00Z",
            gmtModified: "2024-01-12T16:20:00Z",
            nullId: false,
          },
          {
            id: "user_signup",
            sceneName: "用户注册",
            status: 1,
            aiStrategyConfig: JSON.stringify({
              defaultAIConfig: {
                description: "为新注册用户提供个性化欢迎内容和新手引导",
                strategySummary: "提升新用户的首次购买转化率。",
                coreStrategies: ["欢迎引导", "新手优惠", "个性化推荐"],
              },
            }),
            gmtCreate: "2024-01-05T08:30:00Z",
            gmtModified: "2024-01-20T11:45:00Z",
            nullId: false,
          },
          {
            id: "purchase",
            sceneName: "购买完成",
            status: 1,
            aiStrategyConfig: JSON.stringify({
              defaultAIConfig: {
                description: "购买后的交叉销售和复��引导策略",
                strategySummary: "通过购买后营销提升客户生命周期价值。",
                coreStrategies: ["交叉销售", "复购引导", "会员推荐"],
              },
            }),
            gmtCreate: "2024-01-03T07:15:00Z",
            gmtModified: "2024-01-18T13:30:00Z",
            nullId: false,
          },
        ];

        return { data: mockScenarios, status: 200, statusText: "OK" } as any;
      }

      // 为营销场景详情API提供mock数据
      if (url.includes("/quote/api/v1/scene/view/")) {
        const scenarioId = url.split("/").pop();
        console.log(`Mock scenario detail API for: ${scenarioId}`);

        const scenarioDetails: Record<string, any> = {
          add_to_cart: {
            id: "add_to_cart",
            sceneName: "加入购物车",
            status: 1,
            aiStrategyConfig: JSON.stringify({
              defaultAIConfig: {
                allowedActionTypes: ["POPUP"],
                timingStrategy: "SMART_DELAY",
                contentStrategy: "FULLY_GENERATIVE",
                description:
                  "AI会根据��户画像、购物车商品等信息，自主生成最合适的挽留或激励文案",
                strategySummary:
                  "在用户犹豫或准备离开时进行精准挽留，提升订单转化率。",
                coreStrategies: ["网页弹窗", "智能延迟", "个性化生成"],
                dimensions: [
                  {
                    dimension: "营销方式",
                    strategy: '优先使用"网页弹窗"',
                    reasoning:
                      "AI会优先选择干预性最强、最能实时触达的网页弹窗，以抓住稍瞬即逝的挽留机会。",
                    examples: [
                      "桌面端: 可能会选择模态框弹窗，信息更完整。",
                      "移动端: 可能会选择更轻量的底部横幅或顶部通知，避免影响体验。",
                    ],
                  },
                ],
              },
            }),
            gmtCreate: "2024-01-10T10:00:00Z",
            gmtModified: "2024-01-15T14:30:00Z",
            nullId: false,
            marketingSceneRules: [
              {
                id: "rule_1",
                sceneId: "add_to_cart",
                ruleName: "高价值用户挽留",
                triggerCondition: "user_segment = 'vip'",
                marketingMethod: "POPUP",
                marketingTiming: "IMMEDIATE",
                contentMode: "AI_ASSISTED",
                popupTitle: "专属优惠等��领取！",
                popupContent: "作为我们的VIP会员，为您准备了专属优惠券",
                buttonText: "立即领取",
                status: 1,
                instruction: "针对VIP用户的专属优惠策略",
              },
            ],
          },
          view_product: {
            id: "view_product",
            sceneName: "商品浏览",
            status: 0,
            aiStrategyConfig: JSON.stringify({
              defaultAIConfig: {
                description: "根据用户浏���行为和商品信息，推荐相关产品或优惠",
                strategySummary: "通过智能推荐提升用户购买转化。",
                coreStrategies: ["个性化推荐", "智能营销", "精准投放"],
              },
            }),
            gmtCreate: "2024-01-08T09:00:00Z",
            gmtModified: "2024-01-12T16:20:00Z",
            nullId: false,
            marketingSceneRules: [],
          },
          user_signup: {
            id: "user_signup",
            sceneName: "用户注册",
            status: 1,
            aiStrategyConfig: JSON.stringify({
              defaultAIConfig: {
                description: "为新注册用户提供个性化欢迎内容和新手引导",
                strategySummary: "提升新用户的首次购买转化率。",
                coreStrategies: ["欢迎引��", "新手优惠", "个性化推荐"],
              },
            }),
            gmtCreate: "2024-01-05T08:30:00Z",
            gmtModified: "2024-01-20T11:45:00Z",
            nullId: false,
            marketingSceneRules: [],
          },
          purchase: {
            id: "purchase",
            sceneName: "购买完成",
            status: 1,
            aiStrategyConfig: JSON.stringify({
              defaultAIConfig: {
                description: "购买后的交叉销售和复购引导策略",
                strategySummary: "通过购买后营销提升客户生命周期价值。",
                coreStrategies: ["交叉销售", "复购引导", "会员推荐"],
              },
            }),
            gmtCreate: "2024-01-03T07:15:00Z",
            gmtModified: "2024-01-18T13:30:00Z",
            nullId: false,
            marketingSceneRules: [],
          },
        };

        const scenarioDetail = scenarioDetails[scenarioId as string];
        if (scenarioDetail) {
          return { data: scenarioDetail, status: 200, statusText: "OK" } as any;
        } else {
          return { data: null, status: 404, statusText: "Not Found" } as any;
        }
      }

      // 为营销场景更新API提供mock响应
      if (
        url.includes("/quote/api/v1/scene") &&
        method === "POST" &&
        !url.includes("/list")
      ) {
        console.log("Mock scene update API called with data:", data);
        return {
          data: { success: true },
          status: 200,
          statusText: "OK",
        } as any;
      }

      return { data: null, status: 200, statusText: "OK" } as any;
    }

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

      // 特殊处理 AbortError - 静默处理，避免不必要的错误抛出
      if (
        error instanceof Error &&
        (error.name === "AbortError" || error.message.includes("aborted"))
      ) {
        // AbortError 通常是由以下情况���起的：
        // 1. 用户导航到其他页面
        // 2. 组件卸载
        // 3. 开发环境的热重载
        // 4. 显式的请求取消
        // 这些情况都不应该作为错误抛出

        if (process.env.NODE_ENV === "development") {
          console.debug(
            "Request aborted (likely due to navigation/unmount/hot-reload)",
          );
        }

        // 返回一个静默的响应而不是抛出错误
        return { data: null, status: 499, statusText: "Aborted" } as any;
      }

      // 使用新的错误处理系统
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
          if (process.env.NODE_ENV === "development") {
            console.warn(`Request timeout in development: ${url}`);
            console.warn("开发环境提示：后端服务可能未启动，建议检查服务状态");
            // 返回一个默认响应而不是抛出错误
            return {
              data: null,
              status: 408,
              statusText: "Request Timeout",
            } as any;
          }
          throw new RequestError(
            "请求超时，可能是网络连接问题或后端服务未启动",
            408,
            "Request Timeout",
          );
        case "ABORT":
          // 在开发环境中，AbortError通常是由热重载或页面��载引起的，不应作为真正的错误
          if (process.env.NODE_ENV === "development") {
            console.debug(
              "Request aborted due to page reload/navigation (development)",
            );
            return { data: null, status: 499, statusText: "Aborted" } as any;
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
