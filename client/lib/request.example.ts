/**
 * Request请求类使用示例
 */
import { request, createRequest, RequestError } from "./request";

// =============== 基础使用示例 ===============

// 1. GET请求
async function getUsers() {
  try {
    const response = await request.get("/api/users", { page: 1, limit: 10 });
    console.log("用户列表:", response.data);
  } catch (error) {
    if (error instanceof RequestError) {
      console.error("请求失败:", error.status, error.message);
    }
  }
}

// 2. POST请求 - JSON数据
async function createUser() {
  try {
    const userData = {
      name: "张三",
      email: "zhangsan@example.com",
      age: 25,
    };

    const response = await request.post("/api/users", userData);
    console.log("创建用户成功:", response.data);
  } catch (error) {
    if (error instanceof RequestError) {
      console.error("创建失败:", error.message);
    }
  }
}

// 3. POST请求 - FormData数据
async function uploadUserAvatar() {
  try {
    const formData = new FormData();
    formData.append("avatar", file); // file是File对象
    formData.append("userId", "123");

    const response = await request.post("/api/users/avatar", formData);
    console.log("头像上传成功:", response.data);
  } catch (error) {
    console.error("上传失败:", error);
  }
}

// 4. 文件上传专用方法
async function uploadFile(file: File) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", "documents");

    const response = await request.upload("/api/upload", formData, {
      timeout: 30000, // 30秒超时
      headers: {
        "X-Upload-Type": "document",
      },
    });

    console.log("文件上传成功:", response.data);
  } catch (error) {
    console.error("上传失败:", error);
  }
}

// 5. 文件下载
async function downloadFile() {
  try {
    const response = await request.download("/api/files/report.pdf", {
      format: "pdf",
      compress: true,
    });

    // 创建下载链接
    const url = URL.createObjectURL(response.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = "report.pdf";
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("下载失败:", error);
  }
}

// =============== 高级配置示例 ===============

// 6. 创建带拦截器的请求实例
const apiRequest = createRequest("/api", {
  timeout: 15000,
  headers: {
    "X-App-Version": "1.0.0",
  },
  beforeRequest: async (config) => {
    // 请求拦截器 - 添加认证token
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    console.log("发送请求:", config);
    return config;
  },
  afterResponse: async (response) => {
    // 响应拦截器
    console.log("收到响应:", response.status);
    return response;
  },
  onError: (error) => {
    // 全局错误处理
    console.error("请求错误:", error.message);
    if (error instanceof RequestError && error.status === 401) {
      // 清除过期token，跳转登录页
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
  },
});

// 7. 使用配置好的请求实例
async function getUserProfile(userId: string) {
  try {
    const response = await apiRequest.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// 8. 不同响应类型示例
async function getTextContent() {
  const response = await request.get(
    "/api/content/text",
    {},
    {
      responseType: "text",
    },
  );
  console.log("文本内容:", response.data);
}

async function getBinaryData() {
  const response = await request.get(
    "/api/data/binary",
    {},
    {
      responseType: "arrayBuffer",
    },
  );
  console.log("二进制数据:", response.data);
}

// =============== 错误处理示例 ===============

// 9. 完整的错误处理
async function robustRequest() {
  try {
    const response = await request.post("/api/data", { value: "test" });
    return response.data;
  } catch (error) {
    if (error instanceof RequestError) {
      switch (error.status) {
        case 400:
          console.error("请求参数错误");
          break;
        case 401:
          console.error("未授权访问");
          break;
        case 403:
          console.error("权限不足");
          break;
        case 404:
          console.error("资源不存在");
          break;
        case 500:
          console.error("服务器内部错误");
          break;
        default:
          console.error("请求失败:", error.message);
      }
    } else {
      console.error("网络错误或其他异常:", error);
    }
    throw error;
  }
}

// =============== TypeScript类型示例 ===============

// 10. 定义API响应类型
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface ApiListResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// 带类型的请求
async function getTypedUsers(): Promise<ApiListResponse<User>> {
  const response = await request.get<ApiListResponse<User>>("/api/users");
  return response.data;
}

async function createTypedUser(userData: Omit<User, "id">): Promise<User> {
  const response = await request.post<User>("/api/users", userData);
  return response.data;
}

// =============== 实际业务场景示例 ===============

// 11. 用户认证
class AuthService {
  private apiClient = createRequest("/auth");

  async login(credentials: { email: string; password: string }) {
    const response = await this.apiClient.post("/login", credentials);
    const { token, user } = response.data;
    localStorage.setItem("authToken", token);
    return user;
  }

  async logout() {
    await this.apiClient.post("/logout");
    localStorage.removeItem("authToken");
  }

  async refreshToken() {
    const response = await this.apiClient.post("/refresh");
    const { token } = response.data;
    localStorage.setItem("authToken", token);
    return token;
  }
}

// 12. 文件管理
class FileService {
  private apiClient = createRequest("/files");

  async uploadMultipleFiles(files: File[], category: string = "general") {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file_${index}`, file);
    });
    formData.append("category", category);

    return this.apiClient.upload("/batch-upload", formData, {
      timeout: 60000, // 1分钟超时
      headers: {
        "X-Upload-Batch": "true",
      },
    });
  }

  async deleteFile(fileId: string) {
    return this.apiClient.delete(`/${fileId}`);
  }

  async getFileInfo(fileId: string) {
    return this.apiClient.get(`/${fileId}/info`);
  }
}

export {
  getUsers,
  createUser,
  uploadUserAvatar,
  uploadFile,
  downloadFile,
  getUserProfile,
  getTextContent,
  getBinaryData,
  robustRequest,
  getTypedUsers,
  createTypedUser,
  AuthService,
  FileService,
};
