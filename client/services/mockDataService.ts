import { ApiEvent, ApiEventListResponse, ApiSessionEvent } from "@/lib/profile";

// 模拟数据服务，避免网络请求延迟
export interface MockUser {
  id: string;
  userId: string;
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
const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
const companies = ["Acme Corp", "Globex", "Soylent Corp", "Initech", "Umbrella Corp", "Stark Ind", "Wayne Ent", "Cyberdyne", "Massive Dynamic", "Hooli"];
const domains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "company.com"];
const eventNames = ["page_view", "click", "scroll", "add_to_cart", "checkout", "payment", "login", "logout", "view_product", "search"];

const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();

const generateMockUsers = (count: number): MockUser[] => {
  const users: MockUser[] = [];
  const now = new Date();
  const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < count; i++) {
    const firstName = getRandom(firstNames);
    const lastName = getRandom(lastNames);
    const company = Math.random() > 0.3 ? getRandom(companies) : "";
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${getRandom(domains)}`;
    
    users.push({
      id: `user_${i + 1}`,
      userId: `u_${10000 + i}`,
      cdpId: `cdp_${50000 + i}`,
      name: `${firstName} ${lastName}`,
      company: company,
      contact: email,
      firstVisitTime: getRandomDate(yearAgo, now),
      registrationTime: getRandomDate(yearAgo, now),
      firstPurchaseTime: getRandomDate(yearAgo, now),
      lastActiveTime: getRandomDate(yearAgo, now),
      totalSpent: getRandomInt(0, 5000),
      currency: "$",
    });
  }
  return users;
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
      filters?: Record<string, any>;
    } = {},
  ): Promise<{ users: MockUser[]; total: number }> {
    // 移除延迟，提供即时响应

    let filteredUsers = [...this.users];

    // 通用动态过滤
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;

        // 处理范围过滤 (min_FIELD, max_FIELD)
        if (key.startsWith("min_")) {
          const field = key.replace("min_", "");
          const numVal = Number(value);
          if (!isNaN(numVal)) {
            filteredUsers = filteredUsers.filter((u: any) => (u[field] ?? 0) >= numVal);
          }
        } else if (key.startsWith("max_")) {
          const field = key.replace("max_", "");
          const numVal = Number(value);
          if (!isNaN(numVal)) {
            filteredUsers = filteredUsers.filter((u: any) => (u[field] ?? 0) <= numVal);
          }
        } 
        // 处理日期过滤 (start_FIELD, end_FIELD)
        else if (key.startsWith("start_")) {
          const field = key.replace("start_", "");
          const dateVal = new Date(value);
          if (!isNaN(dateVal.getTime())) {
            filteredUsers = filteredUsers.filter((u: any) => new Date(u[field] ?? 0) >= dateVal);
          }
        } else if (key.startsWith("end_")) {
          const field = key.replace("end_", "");
          const dateVal = new Date(value);
          if (!isNaN(dateVal.getTime())) {
             // End date usually implies end of day, but here strict comparison
            filteredUsers = filteredUsers.filter((u: any) => new Date(u[field] ?? 0) <= dateVal);
          }
        }
        // 处理文本包含 (contains_FIELD)
        else if (key.startsWith("contains_")) {
          const field = key.replace("contains_", "");
          const strVal = String(value).toLowerCase();
          filteredUsers = filteredUsers.filter((u: any) => String(u[field] ?? "").toLowerCase().includes(strVal));
        }
        // 处理相等 (eq_FIELD)
        else if (key.startsWith("eq_")) {
          const field = key.replace("eq_", "");
          filteredUsers = filteredUsers.filter((u: any) => String(u[field] ?? "") === String(value));
        }
      });
    }

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

  // 获取单个用户详情
  static async getUserById(id: string): Promise<MockUser | null> {
    const user = this.users.find((u) => u.id === id || u.cdpId === id || u.userId === id);
    return user || null;
  }

  // 生成模拟事件列表
  static async getMockEventList(
    userId: string,
    sessionId: string,
    page: number = 1,
    size: number = 10,
    eventType: number = 0
  ): Promise<ApiEventListResponse | null> {
    const sessions: ApiSessionEvent[] = [];
    const now = new Date();
    
    // 生成 3-5 个会话
    const sessionCount = getRandomInt(3, 5);
    
    for (let i = 0; i < sessionCount; i++) {
      const sessionDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000 - getRandomInt(0, 12) * 60 * 60 * 1000);
      const sessionEvents: ApiEvent[] = [];
      // 每个会话生成 5-15 个事件
      const eventCount = getRandomInt(5, 15);
      
      for (let j = 0; j < eventCount; j++) {
        const eventTime = new Date(sessionDate.getTime() + j * 2 * 60 * 1000); // 每2分钟一个事件
        const eventName = getRandom(eventNames);
        
        sessionEvents.push({
          id: `evt_${i}_${j}`,
          gmtCreate: eventTime.toISOString(),
          gmtModified: eventTime.toISOString(),
          tenantId: "mock_tenant",
          eventName: eventName,
          targetEvent: eventName,
          userId: userId,
          timestamp: eventTime.getTime().toString(),
          properties: JSON.stringify({
             page_url: `https://example.com/${eventName}`,
             browser: "Chrome",
             os: "Windows 10",
             device: "Desktop"
          }),
          userName: "Mock User",
          price: eventName === "payment" ? getRandomInt(10, 500) : 0,
          currency: "USD",
          eventType: eventType
        });
      }
      
      // 按时间倒序
      sessionEvents.reverse();
      
      sessions.push({
        sessionId: `sess_${i}`,
        startTime: sessionDate.getTime(),
        endTime: sessionDate.getTime() + eventCount * 2 * 60 * 1000,
        eventCount: eventCount,
        eventList: sessionEvents
      });
    }

    return {
      records: sessions,
      total: sessions.length,
      size: size,
      current: page,
      orders: [],
      optimizeCountSql: true,
      searchCount: true,
      countId: null,
      maxLimit: null,
      pages: 1
    };
  }

  // 检查是否应该使用模拟数据
  static shouldUseMockData(): boolean {
    // 在开发环境中，如果API不可用，使用模拟数据
    return process.env.NODE_ENV === "development";
  }
}
