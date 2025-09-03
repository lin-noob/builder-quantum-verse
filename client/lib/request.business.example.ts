/**
 * 标准业务接口使用示例
 */
import {
  request,
  createRequest,
  BusinessApiResponse,
  RequestError,
} from "./request";

// =============== 业务接口类型定义 ===============

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

interface UserListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
}

interface UserListData {
  list: User[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

interface CreateUserData {
  name: string;
  email: string;
  password: string;
}

// =============== 基础业务接口使用 ===============

// 1. 获取用户列表 - 使用业务方法（推荐）
async function getUserList(params: UserListParams = {}) {
  try {
    // businessGet方法会自动处理标准业务响应格式
    const data = await request.businessGet<UserListData>("/api/users", params);
    console.log("用户列表:", data.list);
    console.log("总数:", data.pagination.total);
    return data;
  } catch (error) {
    if (error instanceof RequestError) {
      console.error("获取用户列表失败:", error.message);
    }
    throw error;
  }
}

// 2. 创建用户
async function createUser(userData: CreateUserData) {
  try {
    const newUser = await request.businessPost<User>("/api/users", userData);
    console.log("创建用户成功:", newUser);
    return newUser;
  } catch (error) {
    if (error instanceof RequestError) {
      console.error("创建用户失败:", error.message);
    }
    throw error;
  }
}

// 3. 更新用户
async function updateUser(userId: string, userData: Partial<User>) {
  try {
    const updatedUser = await request.businessPut<User>(
      `/api/users/${userId}`,
      userData,
    );
    console.log("更新用户成功:", updatedUser);
    return updatedUser;
  } catch (error) {
    console.error("更新用户失败:", error);
    throw error;
  }
}

// 4. 删除用户
async function deleteUser(userId: string) {
  try {
    await request.businessDelete(`/api/users/${userId}`);
    console.log("删除用户成功");
  } catch (error) {
    console.error("删除用户失败:", error);
    throw error;
  }
}

// =============== 原始响应格式使用（不推荐，但有时需要） ===============

// 5. 获取原始业务响应（包含code、msg、total等信息）
async function getUserListWithFullResponse(params: UserListParams = {}) {
  try {
    const response = await request.get<BusinessApiResponse<UserListData>>(
      "/api/users",
      params,
    );
    const businessResponse = response.data;

    console.log("响应码:", businessResponse.code);
    console.log("响应消息:", businessResponse.msg);
    console.log("总数:", businessResponse.total);
    console.log("数据:", businessResponse.data);

    // 手动检查业务码
    if (businessResponse.code !== "200" && businessResponse.code !== "0") {
      throw new Error(businessResponse.msg || "请求失败");
    }

    return businessResponse.data;
  } catch (error) {
    console.error("请求失败:", error);
    throw error;
  }
}

// =============== 实际业务场景示例 ===============

// 6. 用户管理服务类
class UserService {
  private apiClient = createRequest("/api");

  // 获取用户列表（带分页）
  async getUsers(params: UserListParams = {}) {
    const defaultParams = { page: 1, pageSize: 10, ...params };
    return this.apiClient.businessGet<UserListData>("/users", defaultParams);
  }

  // 根据ID获取用户详情
  async getUserById(userId: string) {
    return this.apiClient.businessGet<User>(`/users/${userId}`);
  }

  // 创建用户
  async createUser(userData: CreateUserData) {
    return this.apiClient.businessPost<User>("/users", userData);
  }

  // 更新用户
  async updateUser(userId: string, userData: Partial<User>) {
    return this.apiClient.businessPut<User>(`/users/${userId}`, userData);
  }

  // 删除用户
  async deleteUser(userId: string) {
    return this.apiClient.businessDelete(`/users/${userId}`);
  }

  // 批量删除用户
  async batchDeleteUsers(userIds: string[]) {
    return this.apiClient.businessPost("/users/batch-delete", { userIds });
  }

  // 上传用户头像
  async uploadAvatar(userId: string, file: File) {
    const formData = new FormData();
    formData.append("avatar", file);
    return this.apiClient.businessPost<{ avatarUrl: string }>(
      `/users/${userId}/avatar`,
      formData,
    );
  }
}

// 7. 完整的错误处理示例
async function robustUserOperation() {
  const userService = new UserService();

  try {
    // 获取用户列表
    const userList = await userService.getUsers({ page: 1, pageSize: 20 });

    if (userList.list.length > 0) {
      const firstUser = userList.list[0];

      // 更新第一个用户
      const updatedUser = await userService.updateUser(firstUser.id, {
        name: firstUser.name + "_updated",
      });

      console.log("操作成功:", updatedUser);
    }
  } catch (error) {
    if (error instanceof RequestError) {
      // 处理业务错误
      switch (error.status) {
        case 400:
          console.error("请求参数错误:", error.message);
          break;
        case 401:
          console.error("用户未登录:", error.message);
          // 跳转到登录页
          window.location.href = "/login";
          break;
        case 403:
          console.error("权限不足:", error.message);
          break;
        case 404:
          console.error("用户不存在:", error.message);
          break;
        case 500:
          console.error("服务器错误:", error.message);
          break;
        default:
          console.error("业务操作失败:", error.message);
      }
    } else {
      console.error("未知错误:", error);
    }
  }
}

// =============== TypeScript类型安全示例 ===============

// 8. 严格的类型定义
interface ApiListResponse<T> {
  list: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

interface ProductSearchParams {
  keyword?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
  sortBy?: "price" | "name" | "createTime";
  sortOrder?: "asc" | "desc";
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  images: string[];
  stock: number;
  status: "active" | "inactive";
  createTime: string;
}

// 产品搜索服务
class ProductService {
  private apiClient = createRequest("/api");

  async searchProducts(params: ProductSearchParams) {
    return this.apiClient.businessGet<ApiListResponse<Product>>(
      "/products/search",
      params,
    );
  }

  async getProductById(productId: string) {
    return this.apiClient.businessGet<Product>(`/products/${productId}`);
  }

  async createProduct(productData: Omit<Product, "id" | "createTime">) {
    return this.apiClient.businessPost<Product>("/products", productData);
  }
}

// 使用示例
async function productExample() {
  const productService = new ProductService();

  try {
    // 搜索产品（类型安全）
    const searchResult = await productService.searchProducts({
      keyword: "手机",
      category: "electronics",
      minPrice: 1000,
      maxPrice: 5000,
      page: 1,
      pageSize: 20,
      sortBy: "price",
      sortOrder: "asc",
    });

    console.log("搜索结果:", searchResult.list);
    console.log("总数:", searchResult.pagination.total);

    // 获取第一个产品详情
    if (searchResult.list.length > 0) {
      const product = await productService.getProductById(
        searchResult.list[0].id,
      );
      console.log("产品详情:", product);
    }
  } catch (error) {
    console.error("产品操作失败:", error);
  }
}

export {
  getUserList,
  createUser,
  updateUser,
  deleteUser,
  getUserListWithFullResponse,
  UserService,
  robustUserOperation,
  ProductService,
  productExample,
};
