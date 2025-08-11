export interface UserListItem {
  id: string;
  name: string;
  segment: string;
  tags: string[];
  totalSpend: number;
  totalOrders: number;
  lastPurchase: string;
}

export interface UserDetailResponse {
  basicInfo: {
    email: string;
    phone: string;
    gender: string;
    age: number;
    location: string;
    company: string;
    title: string;
  };
  kpis: {
    totalSpend: string;
    totalOrders: string;
    avgValue: string;
    lastPurchaseDays: string;
    avgCycle: string;
    ltvQuintile: string;
    rfmSegment: string;
    lifecycleStage: string;
    repurchaseRate: string;
  };
  sessions: Array<{
    time: string;
    duration: string;
    source: string;
    device: string;
    location: string;
    events: Array<{
      time: string;
      type: string;
      desc: string;
      url: string;
      duration: string;
    }>;
  }>;
  orders: Array<{
    id: string;
    time: string;
    status: string;
    total: number;
    payment: string;
    items: Array<{
      name: string;
      price: number;
      qty: number;
      total: number;
    }>;
  }>;
  allProfileData: {
    identity: {
      [key: string]: { [key: string]: string };
    };
    value: {
      [key: string]: { [key: string]: string };
    };
    behavior: {
      [key: string]: { [key: string]: string };
    };
    tech: {
      [key: string]: { [key: string]: string };
    };
  };
}

// Mock data for users list
export const mockUsersData: UserListItem[] = [
  {
    id: "94f7a4a0",
    name: "李四",
    segment: "VIP客户",
    tags: ["高价值", "忠诚型客户"],
    totalSpend: 25100.00,
    totalOrders: 21,
    lastPurchase: "2025-08-01"
  },
  {
    id: "a2b3c4d5",
    name: "张三",
    segment: "新用户",
    tags: ["高潜力"],
    totalSpend: 899.00,
    totalOrders: 1,
    lastPurchase: "2025-08-10"
  },
  {
    id: "e6f7g8h9",
    name: "王五",
    segment: "普通用户",
    tags: ["比价型客户"],
    totalSpend: 3450.00,
    totalOrders: 6,
    lastPurchase: "2025-07-15"
  },
  {
    id: "i0j1k2l3",
    name: "赵六",
    segment: "VIP客户",
    tags: ["高价值", "有流失风险", "摄影爱好者"],
    totalSpend: 18200.00,
    totalOrders: 18,
    lastPurchase: "2025-05-18"
  },
  {
    id: "m4n5o6p7",
    name: "孙七",
    segment: "潜在流失",
    tags: [],
    totalSpend: 5600.00,
    totalOrders: 9,
    lastPurchase: "2025-04-01"
  },
  {
    id: "n8o9p0q1",
    name: "陈八",
    segment: "企业用户",
    tags: ["B2B客户", "大客户"],
    totalSpend: 45600.00,
    totalOrders: 32,
    lastPurchase: "2025-08-08"
  },
  {
    id: "r2s3t4u5",
    name: "刘九",
    segment: "普通用户",
    tags: ["活跃用户"],
    totalSpend: 2800.00,
    totalOrders: 4,
    lastPurchase: "2025-07-28"
  },
  {
    id: "v6w7x8y9",
    name: "黄十",
    segment: "新用户",
    tags: ["移动端用户", "年轻群体"],
    totalSpend: 560.00,
    totalOrders: 2,
    lastPurchase: "2025-08-05"
  }
];

// Mock data for user detail (example for userId: 94f7a4a0)
export const mockUserDetail: UserDetailResponse = {
  basicInfo: { 
    email: "lisi@example.com", 
    phone: "138****1234", 
    gender: "男", 
    age: 37, 
    location: "中国/上海市", 
    company: "示例科技有限公司", 
    title: "市场经理" 
  },
  kpis: { 
    totalSpend: "¥25,100.00", 
    totalOrders: "21", 
    avgValue: "¥1,195.24", 
    lastPurchaseDays: "10天前", 
    avgCycle: "28天", 
    ltvQuintile: "Top 20%", 
    rfmSegment: "重要价值客户", 
    lifecycleStage: "忠诚", 
    repurchaseRate: "75%" 
  },
  sessions: [
    { 
      time: "2025-08-05 14:30 - 14:55", 
      duration: "25分钟", 
      source: "Google搜索", 
      device: "桌面端, macOS, Chrome", 
      location: "上海市", 
      events: [
        { time: "14:30:15", type: "page_view", desc: "首页", url: "/", duration: "1分20秒" },
        { time: "14:31:35", type: "page_view", desc: "产品列表", url: "/products", duration: "5分10秒" },
        { time: "14:36:45", type: "add_to_cart", desc: "将\"ProBook X1\"加入购物车", url: "-", duration: "-" }
      ]
    },
    { 
      time: "2025-08-01 10:05 - 10:18", 
      duration: "13分钟", 
      source: "直接访问", 
      device: "移动端, iOS, Safari", 
      location: "上海市", 
      events: [
        { time: "10:05:30", type: "page_view", desc: "购物车", url: "/cart", duration: "3分" },
        { time: "10:08:30", type: "start_checkout", desc: "开始结账流程", url: "/checkout", duration: "5分" },
        { time: "10:15:00", type: "purchase", desc: "完成订单 ORD-20250801-001", url: "-", duration: "-" }
      ]
    }
  ],
  orders: [
    { 
      id: "ORD-20250801-001", 
      time: "2025-08-01 10:15", 
      status: "已完成", 
      total: 1899.00, 
      payment: "支付宝", 
      items: [
        { name: "ProBook X1", price: 1599.00, qty: 1, total: 1599.00 },
        { name: "无线鼠标", price: 300.00, qty: 1, total: 300.00 }
      ]
    },
    { 
      id: "ORD-20250615-005", 
      time: "2025-06-15 20:45", 
      status: "已完成", 
      total: 250.00, 
      payment: "微信支付", 
      items: [
        { name: "键盘膜", price: 50.00, qty: 1, total: 50.00 },
        { name: "USB-C扩展坞", price: 200.00, qty: 1, total: 200.00 }
      ]
    }
  ],
  allProfileData: {
    identity: {
      "核心身份": { "CDP 统一ID": "94f7a4a0...", "外部系统ID": "{\"erp_id\": \"CUST1001\"}" },
      "基础信息": { 
        "姓名": "李四", 
        "性别": "男", 
        "生日": "1988-08-08", 
        "年龄": "37", 
        "国家/城市": "中国/上海市", 
        "时区": "Asia/Shanghai", 
        "主邮箱": "lisi@example.com", 
        "主手机号": "138****1234", 
        "公司名称": "示例科技有限公司", 
        "职位": "市场经理" 
      }
    },
    value: {
      "标签与分层": { 
        "生命周期阶段": "忠诚", 
        "用户分层": "VIP客户", 
        "行为分群": "忠诚型客户", 
        "RFM分群": "重要价值客户", 
        "手动标签": "高价值, 忠诚型客户" 
      },
      "价值维度": { 
        "总消费金额": "¥25,100.00", 
        "平均客单价": "¥1,195.24", 
        "最高单笔订单金额": "¥3,500.00", 
        "LTV价值五分位": "Top 20%", 
        "AOV价值五分位": "Top 20%", 
        "R-近度分数": "5", 
        "F-频度分数": "5", 
        "M-金额分数": "4" 
      },
      "活跃与生命周期": { 
        "首次访问时间": "2024-03-15", 
        "注册时间": "2024-03-20", 
        "首次购买时间": "2024-04-01", 
        "最后活跃时间": "2025-08-05", 
        "距上次购买天数": "10", 
        "平均购买周期(天)": "28", 
        "复购率": "75%", 
        "客户任期(天)": "498" 
      }
    },
    behavior: {
      "行为模式分析": { 
        "首次购买前访问次数": "3", 
        "偏好星期几": "周五", 
        "Top购买品类": "电子产品", 
        "Top搜索词": "笔记本电脑" 
      },
      "购物车与意图": { 
        "当前购物车商品数": "0", 
        "当前��物车总金额": "¥0.00", 
        "历史放弃购物车次数": "2", 
        "购物车放弃率": "9.5%" 
      }
    },
    tech: {
      "技术与环境": { 
        "首次触点来源": "付费搜索", 
        "最近使用设备类型": "桌面端", 
        "最近使用操作系统": "macOS", 
        "最近使用浏览器": "Chrome" 
      }
    }
  }
};

// API functions
export const fetchUsers = async (): Promise<UserListItem[]> => {
  // Simulate API call
  return new Promise(resolve => {
    setTimeout(() => resolve(mockUsersData), 300);
  });
};

export const fetchUserDetail = async (userId: string): Promise<UserDetailResponse> => {
  // Find the user in the list to get basic info
  const user = mockUsersData.find(u => u.id === userId);

  // Create dynamic user detail based on the user data
  const dynamicUserDetail: UserDetailResponse = {
    ...mockUserDetail,
    basicInfo: {
      ...mockUserDetail.basicInfo,
      email: user ? `${user.name.toLowerCase()}@example.com` : "user@example.com"
    },
    kpis: {
      ...mockUserDetail.kpis,
      totalSpend: user ? `¥${user.totalSpend.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}` : "¥0.00",
      totalOrders: user ? user.totalOrders.toString() : "0"
    },
    allProfileData: {
      ...mockUserDetail.allProfileData,
      identity: {
        ...mockUserDetail.allProfileData.identity,
        "基础信息": {
          ...mockUserDetail.allProfileData.identity["基础信息"],
          "姓名": user?.name || "未知用户",
          "主邮箱": user ? `${user.name.toLowerCase()}@example.com` : "user@example.com"
        }
      },
      value: {
        ...mockUserDetail.allProfileData.value,
        "标签与分层": {
          ...mockUserDetail.allProfileData.value["标签与分层"],
          "用户分层": user?.segment || "普通用户",
          "手动标签": user?.tags.join(", ") || ""
        },
        "价值维度": {
          ...mockUserDetail.allProfileData.value["价值维度"],
          "总消费金额": user ? `¥${user.totalSpend.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}` : "¥0.00"
        }
      }
    }
  };

  // Simulate API call
  return new Promise(resolve => {
    setTimeout(() => resolve(dynamicUserDetail), 500);
  });
};
