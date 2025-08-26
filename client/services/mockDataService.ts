// 模拟数据服务，避免网络请求延迟
export interface MockUser {
  id: string;
  cdpId: string;
  name: string;
  company: string;
  contact: string;
  firstVisitTime: string;
  registrationTime: string;
  firstPurchaseTime: string;
  lastActiveTime: string;
  totalSpent: number;
  currency: string;
}

// 生成模拟用户数据
const generateMockUsers = (count: number): MockUser[] => {
  const companies = [
    "华为技术",
    "腾讯科技",
    "百度科技",
    "阿里巴巴",
    "小米科技",
    "字节跳动",
  ];
  const names = ["刘涛", "张伟", "王芳", "李明", "赵��", "陈涛"];

  return Array.from({ length: count }, (_, index) => {
    const now = new Date();
    const randomDays = Math.floor(Math.random() * 365);
    const registrationDate = new Date(
      now.getTime() - randomDays * 24 * 60 * 60 * 1000,
    );

    return {
      id: `user-${index + 1}`,
      cdpId: `${Math.floor(Math.random() * 900000) + 100000}`,
      name: names[index % names.length],
      company: companies[index % companies.length],
      contact: `user${index + 1}@${companies[index % companies.length].toLowerCase().replace(/[^\w]/g, "")}.com`,
      firstVisitTime: registrationDate.toISOString(),
      registrationTime: registrationDate.toISOString(),
      firstPurchaseTime: new Date(
        registrationDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      lastActiveTime: new Date(
        now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      totalSpent: Math.floor(Math.random() * 100000) + 1000,
      currency: "¥",
    };
  });
};

export class MockDataService {
  private static users: MockUser[] = generateMockUsers(50);

  // 立即响应，无延迟 - 最佳性能
  private static delay(ms: number = 0) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static async getUsers(
    params: {
      page?: number;
      pageSize?: number;
      search?: string;
      sortField?: string;
      sortDirection?: "asc" | "desc";
    } = {},
  ): Promise<{ users: MockUser[]; total: number }> {
    // 移除延迟，提供即时响应

    let filteredUsers = [...this.users];

    // 搜索过滤
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.company.toLowerCase().includes(searchLower) ||
          user.contact.toLowerCase().includes(searchLower) ||
          user.cdpId.includes(searchLower),
      );
    }

    // 排序
    if (params.sortField) {
      filteredUsers.sort((a, b) => {
        const aValue = a[params.sortField as keyof MockUser];
        const bValue = b[params.sortField as keyof MockUser];

        if (typeof aValue === "string" && typeof bValue === "string") {
          const result = aValue.localeCompare(bValue);
          return params.sortDirection === "desc" ? -result : result;
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          const result = aValue - bValue;
          return params.sortDirection === "desc" ? -result : result;
        }

        return 0;
      });
    }

    // 分页
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return {
      users: filteredUsers.slice(startIndex, endIndex),
      total: filteredUsers.length,
    };
  }

  // 检查是否应该使用模拟数据
  static shouldUseMockData(): boolean {
    // 在开发环境中，如果API不可用，使用模拟数据
    return process.env.NODE_ENV === "development";
  }
}
