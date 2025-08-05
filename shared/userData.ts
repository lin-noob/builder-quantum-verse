export interface User {
  cdpId: string;
  name: string;
  company: string;
  country: string;
  city: string;
  contact: string;
  totalSpent: number;
  totalOrders: number;
  averageOrderValue: number;
  lastPurchaseDate: string;
  maxOrderAmount: number;
  averagePurchaseCycle: number;
  tags: string[];
  sessions: Session[];
  orders: Order[];
}

export interface Session {
  id: string;
  date: string;
  summary: string;
  source: string;
  deviceType: string;
  os: string;
  browser: string;
  location: string;
  ipAddress: string;
  events: SessionEvent[];
}

export interface SessionEvent {
  timestamp: string;
  eventType: string;
  pageTitle: string;
  pageUrl: string;
  stayDuration: string;
  scrollDepth: string;
}

export interface Order {
  orderNumber: string;
  orderDate: string;
  status: string;
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  items: OrderItem[];
}

export interface OrderItem {
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export const mockUsers: User[] = [
  {
    cdpId: "94f7a4a0-552a-6115",
    name: "张伟",
    company: "腾讯科技",
    country: "中国",
    city: "深圳",
    contact: "zhangwei@tencent.com",
    totalSpent: 25680.50,
    totalOrders: 12,
    averageOrderValue: 2140.04,
    lastPurchaseDate: "2024-01-15",
    maxOrderAmount: 5200.00,
    averagePurchaseCycle: 28,
    tags: ["VIP客户", "企业用户"],
    sessions: [
      {
        id: "session-1",
        date: "2024-01-15 14:30",
        summary: "浏览产品页面并完成购买",
        source: "直接访问",
        deviceType: "桌面端",
        os: "Windows 11",
        browser: "Chrome 120",
        location: "深圳, 中国",
        ipAddress: "183.14.132.117",
        events: [
          {
            timestamp: "14:30:15",
            eventType: "页面访问",
            pageTitle: "首页",
            pageUrl: "/",
            stayDuration: "2分30秒",
            scrollDepth: "85%"
          },
          {
            timestamp: "14:32:45",
            eventType: "页面访问",
            pageTitle: "产品列表",
            pageUrl: "/products",
            stayDuration: "5分12秒",
            scrollDepth: "100%"
          }
        ]
      }
    ],
    orders: [
      {
        orderNumber: "ORD-2024-001",
        orderDate: "2024-01-15",
        status: "已完成",
        totalAmount: 5200.00,
        currency: "CNY",
        paymentMethod: "微信支付",
        items: [
          {
            productName: "企业版软件授权",
            unitPrice: 5200.00,
            quantity: 1,
            totalPrice: 5200.00
          }
        ]
      }
    ]
  },
  {
    cdpId: "b7c3d8e9-4f2a-1234",
    name: "李明",
    company: "阿里巴巴",
    country: "中国",
    city: "杭州",
    contact: "liming@alibaba.com",
    totalSpent: 18900.25,
    totalOrders: 8,
    averageOrderValue: 2362.53,
    lastPurchaseDate: "2024-01-10",
    maxOrderAmount: 4800.00,
    averagePurchaseCycle: 35,
    tags: ["企业用户"],
    sessions: [],
    orders: []
  },
  {
    cdpId: "c8d4e5f6-7a8b-5678",
    name: "王芳",
    company: "百度科技",
    country: "中国",
    city: "北京",
    contact: "wangfang@baidu.com",
    totalSpent: 32150.75,
    totalOrders: 15,
    averageOrderValue: 2143.38,
    lastPurchaseDate: "2024-01-20",
    maxOrderAmount: 6500.00,
    averagePurchaseCycle: 22,
    tags: ["VIP客户", "高价值用户"],
    sessions: [],
    orders: []
  },
  {
    cdpId: "d9e5f6g7-8b9c-9012",
    name: "陈杰",
    company: "字节跳动",
    country: "中国",
    city: "北京",
    contact: "chenjie@bytedance.com",
    totalSpent: 12680.00,
    totalOrders: 6,
    averageOrderValue: 2113.33,
    lastPurchaseDate: "2024-01-08",
    maxOrderAmount: 3200.00,
    averagePurchaseCycle: 45,
    tags: ["新客户"],
    sessions: [],
    orders: []
  },
  {
    cdpId: "e0f6g7h8-9c0d-3456",
    name: "刘涛",
    company: "华为技术",
    country: "中国",
    city: "深圳",
    contact: "liutao@huawei.com",
    totalSpent: 45230.80,
    totalOrders: 20,
    averageOrderValue: 2261.54,
    lastPurchaseDate: "2024-01-22",
    maxOrderAmount: 8900.00,
    averagePurchaseCycle: 18,
    tags: ["VIP客户", "长期合作"],
    sessions: [],
    orders: []
  },
  {
    cdpId: "f1g7h8i9-0d1e-7890",
    name: "赵敏",
    company: "小米科技",
    country: "中国",
    city: "北京",
    contact: "zhaomin@xiaomi.com",
    totalSpent: 28950.60,
    totalOrders: 11,
    averageOrderValue: 2631.87,
    lastPurchaseDate: "2024-01-18",
    maxOrderAmount: 7200.00,
    averagePurchaseCycle: 30,
    tags: ["企业用户", "技术导向"],
    sessions: [],
    orders: []
  }
];

export const getUsers = () => mockUsers;

export const getUserById = (cdpId: string) => 
  mockUsers.find(user => user.cdpId === cdpId);

export const getAllLocations = () => {
  const locations = new Set<string>();
  mockUsers.forEach(user => {
    locations.add(`${user.country}/${user.city}`);
  });
  return Array.from(locations).sort();
};
