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
  // New time-based fields
  firstVisitTime: string;      // 首次访问时间
  registrationTime: string;    // 注册时间
  firstPurchaseTime: string;   // 首次购买时间
  lastActiveTime: string;      // 最后活跃时间
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
  subtotalAmount?: number;   // 商品总价，不含运费和税费（可选，向后兼容）
  shippingAmount?: number;   // 运费（可选）
  taxAmount?: number;        // 税费（可选）
  totalAmount: number;       // 最终支付总金额
  currency: string;
  paymentMethod: string;
  discountCode?: string;     // 优惠码（可选）
  shippingAddress?: Address; // 收货地址（可选）
  billingAddress?: Address;  // 账单地址（可选）
  items: OrderItem[];
}

export interface Address {
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
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
    firstVisitTime: "2023-08-15 14:22:33",
    registrationTime: "2023-08-15 14:35:12",
    firstPurchaseTime: "2023-08-20 10:45:00",
    lastActiveTime: "2024-01-22 09:15:30",
    sessions: [
      {
        id: "session-1",
        date: "2024-01-22 09:15",
        summary: "查看新产品发布和价格对比",
        source: "邮件链接",
        deviceType: "桌面端",
        os: "Windows 11",
        browser: "Chrome 120",
        location: "深���, 中国",
        ipAddress: "183.14.132.117",
        events: [
          {
            timestamp: "09:15:30",
            eventType: "页面访问",
            pageTitle: "首页",
            pageUrl: "/",
            stayDuration: "1分45秒",
            scrollDepth: "60%"
          },
          {
            timestamp: "09:17:15",
            eventType: "页面访问",
            pageTitle: "新产品发布",
            pageUrl: "/products/new-release",
            stayDuration: "8分20秒",
            scrollDepth: "95%"
          },
          {
            timestamp: "09:25:35",
            eventType: "页面访问",
            pageTitle: "价格对比",
            pageUrl: "/pricing",
            stayDuration: "4分15秒",
            scrollDepth: "80%"
          }
        ]
      },
      {
        id: "session-2",
        date: "2024-01-15 14:30",
        summary: "浏览产品页面���完成购买",
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
          },
          {
            timestamp: "14:37:57",
            eventType: "页面访问",
            pageTitle: "企业版详情",
            pageUrl: "/products/enterprise",
            stayDuration: "7分30秒",
            scrollDepth: "100%"
          },
          {
            timestamp: "14:45:27",
            eventType: "页面访问",
            pageTitle: "购物车",
            pageUrl: "/cart",
            stayDuration: "3分45秒",
            scrollDepth: "70%"
          },
          {
            timestamp: "14:49:12",
            eventType: "页面访问",
            pageTitle: "结算页面",
            pageUrl: "/checkout",
            stayDuration: "5分20秒",
            scrollDepth: "100%"
          }
        ]
      },
      {
        id: "session-3",
        date: "2024-01-10 16:45",
        summary: "技术支持咨询和文档查看",
        source: "搜索引擎",
        deviceType: "移动端",
        os: "iOS 17",
        browser: "Safari 17",
        location: "深圳, 中国",
        ipAddress: "183.14.132.118",
        events: [
          {
            timestamp: "16:45:10",
            eventType: "页面访问",
            pageTitle: "技术支持",
            pageUrl: "/support",
            stayDuration: "3分20秒",
            scrollDepth: "90%"
          },
          {
            timestamp: "16:48:30",
            eventType: "页面访问",
            pageTitle: "API文档",
            pageUrl: "/docs/api",
            stayDuration: "12分15秒",
            scrollDepth: "85%"
          },
          {
            timestamp: "17:00:45",
            eventType: "页面访问",
            pageTitle: "集成指南",
            pageUrl: "/docs/integration",
            stayDuration: "6分40秒",
            scrollDepth: "75%"
          }
        ]
      },
      {
        id: "session-4",
        date: "2024-01-08 11:20",
        summary: "账户管理和历史订单查看",
        source: "直接访问",
        deviceType: "桌面端",
        os: "Windows 11",
        browser: "Edge 120",
        location: "深圳, 中国",
        ipAddress: "183.14.132.117",
        events: [
          {
            timestamp: "11:20:00",
            eventType: "页面访问",
            pageTitle: "登录页面",
            pageUrl: "/login",
            stayDuration: "1分10秒",
            scrollDepth: "40%"
          },
          {
            timestamp: "11:21:10",
            eventType: "页面访问",
            pageTitle: "账户概览",
            pageUrl: "/account",
            stayDuration: "4分30秒",
            scrollDepth: "95%"
          },
          {
            timestamp: "11:25:40",
            eventType: "页面访问",
            pageTitle: "订单历史",
            pageUrl: "/orders",
            stayDuration: "8分45秒",
            scrollDepth: "100%"
          }
        ]
      }
    ],
    orders: [
      {
        orderNumber: "ORD-2024-003",
        orderDate: "2024-01-15",
        status: "已��成",
        subtotalAmount: 5200.00,
        shippingAmount: 0.00,
        taxAmount: 0.00,
        totalAmount: 5200.00,
        currency: "CNY",
        paymentMethod: "微信支付",
        discountCode: "VIP2024",
        shippingAddress: {
          name: "张伟",
          street: "深圳市南山区科技园南区R4-B栋20层",
          city: "深圳",
          state: "广东省",
          postalCode: "518057",
          country: "中国",
          phone: "13800138000"
        },
        billingAddress: {
          name: "腾讯科技（深圳）有限公司",
          street: "深圳市南山区科技园南区R4-B栋",
          city: "深圳",
          state: "广东省",
          postalCode: "518057",
          country: "中国",
          phone: "0755-86013388"
        },
        items: [
          {
            productName: "企业版软件授权",
            unitPrice: 5200.00,
            quantity: 1,
            totalPrice: 5200.00
          }
        ]
      },
      {
        orderNumber: "ORD-2024-002",
        orderDate: "2024-01-08",
        status: "已完成",
        subtotalAmount: 3280.50,
        shippingAmount: 50.00,
        taxAmount: 328.05,
        totalAmount: 3658.55,
        currency: "CNY",
        paymentMethod: "支付宝",
        shippingAddress: {
          name: "张伟",
          street: "深圳市南山区科技园南区R4-B栋20层",
          city: "深圳",
          state: "广东省",
          postalCode: "518057",
          country: "中国",
          phone: "13800138000"
        },
        billingAddress: {
          name: "腾讯科技（深圳）有限公司",
          street: "深圳市南山区���技园南区R4-B栋",
          city: "深圳",
          state: "广东省",
          postalCode: "518057",
          country: "中国",
          phone: "0755-86013388"
        },
        items: [
          {
            productName: "专业版软件授权",
            unitPrice: 2800.00,
            quantity: 1,
            totalPrice: 2800.00
          },
          {
            productName: "技术支持服务",
            unitPrice: 480.50,
            quantity: 1,
            totalPrice: 480.50
          }
        ]
      },
      {
        orderNumber: "ORD-2023-089",
        orderDate: "2023-12-20",
        status: "已完成",
        totalAmount: 4800.00,
        currency: "CNY",
        paymentMethod: "企业转账",
        items: [
          {
            productName: "标准版软件授权",
            unitPrice: 1600.00,
            quantity: 3,
            totalPrice: 4800.00
          }
        ]
      },
      {
        orderNumber: "ORD-2023-067",
        orderDate: "2023-11-15",
        status: "已完成",
        totalAmount: 2150.00,
        currency: "CNY",
        paymentMethod: "微信支付",
        items: [
          {
            productName: "基础版软件授权",
            unitPrice: 1200.00,
            quantity: 1,
            totalPrice: 1200.00
          },
          {
            productName: "培训服务",
            unitPrice: 950.00,
            quantity: 1,
            totalPrice: 950.00
          }
        ]
      },
      {
        orderNumber: "ORD-2023-045",
        orderDate: "2023-10-28",
        status: "已完成",
        totalAmount: 6750.00,
        currency: "CNY",
        paymentMethod: "企业转账",
        items: [
          {
            productName: "企业版软件授权",
            unitPrice: 5200.00,
            quantity: 1,
            totalPrice: 5200.00
          },
          {
            productName: "定制开发服务",
            unitPrice: 1550.00,
            quantity: 1,
            totalPrice: 1550.00
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
    firstVisitTime: "2023-06-20 11:15:45",
    registrationTime: "2023-06-22 09:30:18",
    firstPurchaseTime: "2023-07-05 16:20:30",
    lastActiveTime: "2024-01-20 10:30:20",
    sessions: [
      {
        id: "session-lm-1",
        date: "2024-01-20 10:30",
        summary: "产品演示和技术评估",
        source: "社交媒体广告",
        deviceType: "桌面端",
        os: "macOS 14",
        browser: "Safari 17",
        location: "杭州, 中国",
        ipAddress: "120.55.162.203",
        events: [
          {
            timestamp: "10:30:20",
            eventType: "页面访问",
            pageTitle: "产品演示",
            pageUrl: "/demo",
            stayDuration: "15分30秒",
            scrollDepth: "100%"
          },
          {
            timestamp: "10:45:50",
            eventType: "页面访问",
            pageTitle: "技术规格",
            pageUrl: "/specs",
            stayDuration: "8分45秒",
            scrollDepth: "90%"
          },
          {
            timestamp: "10:54:35",
            eventType: "页面访问",
            pageTitle: "案例研究",
            pageUrl: "/case-studies",
            stayDuration: "12分20秒",
            scrollDepth: "85%"
          }
        ]
      },
      {
        id: "session-lm-2",
        date: "2024-01-10 14:15",
        summary: "完成订单支付和账户设置",
        source: "直接访问",
        deviceType: "桌面端",
        os: "macOS 14",
        browser: "Chrome 120",
        location: "杭州, 中国",
        ipAddress: "120.55.162.203",
        events: [
          {
            timestamp: "14:15:10",
            eventType: "页面访问",
            pageTitle: "登录",
            pageUrl: "/login",
            stayDuration: "1分30秒",
            scrollDepth: "50%"
          },
          {
            timestamp: "14:16:40",
            eventType: "页面访问",
            pageTitle: "购物车",
            pageUrl: "/cart",
            stayDuration: "2分45秒",
            scrollDepth: "70%"
          },
          {
            timestamp: "14:19:25",
            eventType: "页面访问",
            pageTitle: "���付页面",
            pageUrl: "/payment",
            stayDuration: "4分15秒",
            scrollDepth: "100%"
          },
          {
            timestamp: "14:23:40",
            eventType: "页面访问",
            pageTitle: "账户设置",
            pageUrl: "/account/settings",
            stayDuration: "6分20秒",
            scrollDepth: "95%"
          }
        ]
      },
      {
        id: "session-lm-3",
        date: "2024-01-05 16:20",
        summary: "产品对比和价格咨询",
        source: "搜索引擎",
        deviceType: "��动端",
        os: "iOS 17",
        browser: "Safari 17",
        location: "杭州, 中国",
        ipAddress: "120.55.162.204",
        events: [
          {
            timestamp: "16:20:15",
            eventType: "页面访问",
            pageTitle: "产品对比",
            pageUrl: "/compare",
            stayDuration: "9分30秒",
            scrollDepth: "95%"
          },
          {
            timestamp: "16:29:45",
            eventType: "页面访问",
            pageTitle: "价格方案",
            pageUrl: "/pricing",
            stayDuration: "5分45秒",
            scrollDepth: "80%"
          },
          {
            timestamp: "16:35:30",
            eventType: "页面访问",
            pageTitle: "联系销售",
            pageUrl: "/contact-sales",
            stayDuration: "3分20秒",
            scrollDepth: "75%"
          }
        ]
      }
    ],
    orders: [
      {
        orderNumber: "ORD-2024-015",
        orderDate: "2024-01-10",
        status: "已完成",
        totalAmount: 4800.00,
        currency: "CNY",
        paymentMethod: "支付宝",
        items: [
          {
            productName: "企业版软件授权",
            unitPrice: 4800.00,
            quantity: 1,
            totalPrice: 4800.00
          }
        ]
      },
      {
        orderNumber: "ORD-2023-156",
        orderDate: "2023-12-25",
        status: "已完成",
        totalAmount: 3650.25,
        currency: "CNY",
        paymentMethod: "企业转账",
        items: [
          {
            productName: "专业版软件授权",
            unitPrice: 2800.00,
            quantity: 1,
            totalPrice: 2800.00
          },
          {
            productName: "云服务套餐",
            unitPrice: 850.25,
            quantity: 1,
            totalPrice: 850.25
          }
        ]
      },
      {
        orderNumber: "ORD-2023-134",
        orderDate: "2023-11-30",
        status: "已完成",
        totalAmount: 2250.00,
        currency: "CNY",
        paymentMethod: "支付宝",
        items: [
          {
            productName: "标准版软件授权",
            unitPrice: 1500.00,
            quantity: 1,
            totalPrice: 1500.00
          },
          {
            productName: "数据分析模块",
            unitPrice: 750.00,
            quantity: 1,
            totalPrice: 750.00
          }
        ]
      },
      {
        orderNumber: "ORD-2023-089",
        orderDate: "2023-10-15",
        status: "已完成",
        totalAmount: 4950.00,
        currency: "CNY",
        paymentMethod: "企业转账",
        items: [
          {
            productName: "企业版软件授���",
            unitPrice: 4800.00,
            quantity: 1,
            totalPrice: 4800.00
          },
          {
            productName: "安装服务",
            unitPrice: 150.00,
            quantity: 1,
            totalPrice: 150.00
          }
        ]
      },
      {
        orderNumber: "ORD-2023-067",
        orderDate: "2023-09-20",
        status: "已完成",
        totalAmount: 1850.00,
        currency: "CNY",
        paymentMethod: "微信支付",
        items: [
          {
            productName: "基础版软件授权",
            unitPrice: 1200.00,
            quantity: 1,
            totalPrice: 1200.00
          },
          {
            productName: "技术支持服务",
            unitPrice: 650.00,
            quantity: 1,
            totalPrice: 650.00
          }
        ]
      },
      {
        orderNumber: "ORD-2023-045",
        orderDate: "2023-08-10",
        status: "已完成",
        totalAmount: 1400.00,
        currency: "CNY",
        paymentMethod: "支付宝",
        items: [
          {
            productName: "插件扩展包",
            unitPrice: 700.00,
            quantity: 2,
            totalPrice: 1400.00
          }
        ]
      }
    ]
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
    firstVisitTime: "2023-05-10 08:45:22",
    registrationTime: "2023-05-10 09:12:50",
    firstPurchaseTime: "2023-05-15 13:25:15",
    lastActiveTime: "2024-01-21 13:45:20",
    sessions: [
      {
        id: "session-wf-1",
        date: "2024-01-21 13:45",
        summary: "新功能体验和反��提交",
        source: "邮件通知",
        deviceType: "桌面端",
        os: "Windows 11",
        browser: "Chrome 120",
        location: "北京, 中国",
        ipAddress: "123.125.114.144",
        events: [
          {
            timestamp: "13:45:20",
            eventType: "页面���问",
            pageTitle: "新功能介绍",
            pageUrl: "/features/new",
            stayDuration: "12分15秒",
            scrollDepth: "100%"
          },
          {
            timestamp: "13:57:35",
            eventType: "页面访问",
            pageTitle: "功能试用",
            pageUrl: "/trial/features",
            stayDuration: "25分30秒",
            scrollDepth: "95%"
          },
          {
            timestamp: "14:23:05",
            eventType: "页面访问",
            pageTitle: "反馈中心",
            pageUrl: "/feedback",
            stayDuration: "8分45秒",
            scrollDepth: "85%"
          }
        ]
      },
      {
        id: "session-wf-2",
        date: "2024-01-20 09:30",
        summary: "VIP专享服务和升级咨询",
        source: "直接访问",
        deviceType: "移动端",
        os: "Android 14",
        browser: "Chrome 120",
        location: "北京, 中国",
        ipAddress: "123.125.114.145",
        events: [
          {
            timestamp: "09:30:10",
            eventType: "页面访问",
            pageTitle: "VIP中心",
            pageUrl: "/vip",
            stayDuration: "6分30秒",
            scrollDepth: "90%"
          },
          {
            timestamp: "09:36:40",
            eventType: "页面访问",
            pageTitle: "专属服务",
            pageUrl: "/vip/services",
            stayDuration: "10分20秒",
            scrollDepth: "100%"
          },
          {
            timestamp: "09:47:00",
            eventType: "页面访问",
            pageTitle: "升级方案",
            pageUrl: "/upgrade",
            stayDuration: "7分15秒",
            scrollDepth: "80%"
          }
        ]
      },
      {
        id: "session-wf-3",
        date: "2024-01-18 15:20",
        summary: "数据分析报告查看和导出",
        source: "直接访问",
        deviceType: "桌面端",
        os: "Windows 11",
        browser: "Edge 120",
        location: "北京, 中国",
        ipAddress: "123.125.114.144",
        events: [
          {
            timestamp: "15:20:30",
            eventType: "页面访��",
            pageTitle: "数据分析",
            pageUrl: "/analytics",
            stayDuration: "18分45秒",
            scrollDepth: "100%"
          },
          {
            timestamp: "15:39:15",
            eventType: "页面访问",
            pageTitle: "报告中心",
            pageUrl: "/reports",
            stayDuration: "12分30秒",
            scrollDepth: "95%"
          },
          {
            timestamp: "15:51:45",
            eventType: "页面访问",
            pageTitle: "数据导出",
            pageUrl: "/export",
            stayDuration: "5分20秒",
            scrollDepth: "70%"
          }
        ]
      },
      {
        id: "session-wf-4",
        date: "2024-01-15 11:10",
        summary: "团队管理���权限设置",
        source: "直接访问",
        deviceType: "桌面端",
        os: "Windows 11",
        browser: "Chrome 120",
        location: "北京, 中国",
        ipAddress: "123.125.114.144",
        events: [
          {
            timestamp: "11:10:15",
            eventType: "页面访问",
            pageTitle: "团队管理",
            pageUrl: "/team",
            stayDuration: "14分30秒",
            scrollDepth: "100%"
          },
          {
            timestamp: "11:24:45",
            eventType: "页面访问",
            pageTitle: "权限设置",
            pageUrl: "/permissions",
            stayDuration: "9分20秒",
            scrollDepth: "85%"
          },
          {
            timestamp: "11:34:05",
            eventType: "页面访问",
            pageTitle: "用户角色",
            pageUrl: "/roles",
            stayDuration: "6分45秒",
            scrollDepth: "75%"
          }
        ]
      },
      {
        id: "session-wf-5",
        date: "2024-01-12 16:35",
        summary: "API集成和开发者工具",
        source: "技术文档",
        deviceType: "桌面端",
        os: "Windows 11",
        browser: "Chrome 120",
        location: "北京, 中国",
        ipAddress: "123.125.114.144",
        events: [
          {
            timestamp: "16:35:10",
            eventType: "页面访问",
            pageTitle: "API文档",
            pageUrl: "/api/docs",
            stayDuration: "22分15秒",
            scrollDepth: "100%"
          },
          {
            timestamp: "16:57:25",
            eventType: "页面访问",
            pageTitle: "开发者控制台",
            pageUrl: "/dev/console",
            stayDuration: "15分30秒",
            scrollDepth: "90%"
          },
          {
            timestamp: "17:12:55",
            eventType: "页面访问",
            pageTitle: "集成示例",
            pageUrl: "/dev/examples",
            stayDuration: "8分40秒",
            scrollDepth: "85%"
          }
        ]
      }
    ],
    orders: [
      {
        orderNumber: "ORD-2024-025",
        orderDate: "2024-01-20",
        status: "已完成",
        totalAmount: 6500.00,
        currency: "CNY",
        paymentMethod: "企业转账",
        items: [
          {
            productName: "旗舰版软件授权",
            unitPrice: 6500.00,
            quantity: 1,
            totalPrice: 6500.00
          }
        ]
      },
      {
        orderNumber: "ORD-2024-018",
        orderDate: "2024-01-15",
        status: "已完成",
        totalAmount: 4280.75,
        currency: "CNY",
        paymentMethod: "支付宝",
        items: [
          {
            productName: "���业版软件授权",
            unitPrice: 3800.00,
            quantity: 1,
            totalPrice: 3800.00
          },
          {
            productName: "高级数据分析",
            unitPrice: 480.75,
            quantity: 1,
            totalPrice: 480.75
          }
        ]
      },
      {
        orderNumber: "ORD-2024-008",
        orderDate: "2024-01-08",
        status: "已完成",
        totalAmount: 3650.00,
        currency: "CNY",
        paymentMethod: "微信支付",
        items: [
          {
            productName: "专业版软件授权",
            unitPrice: 2800.00,
            quantity: 1,
            totalPrice: 2800.00
          },
          {
            productName: "AI智能模块",
            unitPrice: 850.00,
            quantity: 1,
            totalPrice: 850.00
          }
        ]
      },
      {
        orderNumber: "ORD-2023-198",
        orderDate: "2023-12-28",
        status: "已完成",
        totalAmount: 5420.00,
        currency: "CNY",
        paymentMethod: "企业转账",
        items: [
          {
            productName: "企业版软件授权",
            unitPrice: 3800.00,
            quantity: 1,
            totalPrice: 3800.00
          },
          {
            productName: "定制开发服务",
            unitPrice: 1620.00,
            quantity: 1,
            totalPrice: 1620.00
          }
        ]
      },
      {
        orderNumber: "ORD-2023-167",
        orderDate: "2023-12-10",
        status: "已完成",
        totalAmount: 2100.00,
        currency: "CNY",
        paymentMethod: "支付宝",
        items: [
          {
            productName: "标准版软件授权",
            unitPrice: 1500.00,
            quantity: 1,
            totalPrice: 1500.00
          },
          {
            productName: "培训服务",
            unitPrice: 600.00,
            quantity: 1,
            totalPrice: 600.00
          }
        ]
      },
      {
        orderNumber: "ORD-2023-145",
        orderDate: "2023-11-25",
        status: "已完成",
        totalAmount: 3200.00,
        currency: "CNY",
        paymentMethod: "企业转账",
        items: [
          {
            productName: "专业版软件授权",
            unitPrice: 2800.00,
            quantity: 1,
            totalPrice: 2800.00
          },
          {
            productName: "技术支持服务",
            unitPrice: 400.00,
            quantity: 1,
            totalPrice: 400.00
          }
        ]
      },
      {
        orderNumber: "ORD-2023-123",
        orderDate: "2023-11-05",
        status: "已完成",
        totalAmount: 1850.00,
        currency: "CNY",
        paymentMethod: "微信支付",
        items: [
          {
            productName: "基础版软件授权",
            unitPrice: 1200.00,
            quantity: 1,
            totalPrice: 1200.00
          },
          {
            productName: "云存储服务",
            unitPrice: 650.00,
            quantity: 1,
            totalPrice: 650.00
          }
        ]
      },
      {
        orderNumber: "ORD-2023-098",
        orderDate: "2023-10-20",
        status: "已完成",
        totalAmount: 4800.00,
        currency: "CNY",
        paymentMethod: "企业转账",
        items: [
          {
            productName: "���准版软件授权",
            unitPrice: 1600.00,
            quantity: 3,
            totalPrice: 4800.00
          }
        ]
      },
      {
        orderNumber: "ORD-2023-076",
        orderDate: "2023-09-30",
        status: "已完成",
        totalAmount: 2200.00,
        currency: "CNY",
        paymentMethod: "支付宝",
        items: [
          {
            productName: "插件扩展包",
            unitPrice: 550.00,
            quantity: 4,
            totalPrice: 2200.00
          }
        ]
      }
    ]
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
    firstVisitTime: "2023-11-25 16:30:40",
    registrationTime: "2023-11-28 14:22:15",
    firstPurchaseTime: "2023-12-05 11:10:30",
    lastActiveTime: "2024-01-08 15:45:20",
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
    firstVisitTime: "2023-04-08 12:15:30",
    registrationTime: "2023-04-08 12:45:50",
    firstPurchaseTime: "2023-04-12 09:30:00",
    lastActiveTime: "2024-01-22 18:20:45",
    sessions: [],
    orders: []
  },
  {
    cdpId: "f1g7h8i9-0d1e-7890",
    name: "赵敏",
    company: "小米��技",
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
    firstVisitTime: "2023-07-12 10:20:15",
    registrationTime: "2023-07-15 14:35:45",
    firstPurchaseTime: "2023-07-22 16:50:30",
    lastActiveTime: "2024-01-18 11:25:10",
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
