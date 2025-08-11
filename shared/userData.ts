export interface User {
  /** ID */
  id: string;
  /** CDP 用户ID（唯一） */
  cdpUserId: number;
  /** 用户姓名 */
  fullName: string;
  /** 联系方式（Email/手机号） */
  contactInfo: string;
  /** 公司名称 */
  companyName: string;
  /** 注册时间 */
  signTime: string;
  /** 创建时间 */
  createGmt: string;
  /** 首次购买时间 */
  minBuyTime: string;
  /** 最后购买时间 */
  maxBuyTime: string;
  /** 最大订单金额（保留5位小数） */
  maxOrderAmount: number;
  /** 总消费金额（保留5位小数） */
  totalOrders: number;
  /** 订单数量 */
  orderCount: number;
  /** 最后登录时间 */
  loginDate: string;
  /** 地区 */
  location: string;
  /** tenant_id */
  shopid: string;

  // 保留原有字段以兼容现有功能
  cdpId?: string; // 兼容字段
  name?: string; // 兼容字段
  company?: string; // 兼容字段
  country?: string; // 兼容字段
  city?: string; // 兼容字段
  contact?: string; // 兼容字段
  totalSpent?: number; // 兼容字段
  averageOrderValue?: number; // 兼容字段
  lastPurchaseDate?: string; // 兼容字段
  averagePurchaseCycle?: number; // 兼容字段
  tags?: string[]; // 兼容字段
  sessions?: Session[]; // 兼容字段
  orders?: Order[]; // 兼容字段
  firstVisitTime?: string; // 兼容字段
  registrationTime?: string; // 兼容字段
  firstPurchaseTime?: string; // 兼容字段
  lastActiveTime?: string; // 兼容字段
  cartItems?: CartItem[]; // 兼容字段
  totalCartValue?: number; // 兼容字段
  cartCreatedTime?: string; // 兼容字段
  lastCartUpdate?: string; // 兼容字段
  cartAbandonCount?: number; // 兼容字段
  averageCartValue?: number; // 兼容字段
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
  subtotalAmount?: number; // 商品总价，不含运费和税费（可选，向后兼容）
  shippingAmount?: number; // 运费（可选）
  taxAmount?: number; // 税费（可选）
  totalAmount: number; // 最终支付总金额
  currency: string;
  paymentMethod: string;
  discountCode?: string; // 优惠码（可选）
  shippingAddress?: Address; // 收货地址（可选）
  billingAddress?: Address; // 账单地址（可选）
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

export interface CartItem {
  id: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  addedTime: string; // 加入购物车时间
  lastUpdated: string; // 最后更新时间
}

export const mockUsers: User[] = [
  {
    cdpId: "94f7a4a0-552a-6115",
    name: "张伟",
    company: "腾讯科技",
    country: "中国",
    city: "深圳",
    contact: "zhangwei@tencent.com",
    totalSpent: 25680.5,
    totalOrders: 12,
    averageOrderValue: 2140.04,
    lastPurchaseDate: "2024-01-15",
    maxOrderAmount: 5200.0,
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
        location: "深, 中国",
        ipAddress: "183.14.132.117",
        events: [
          {
            timestamp: "09:15:30",
            eventType: "页面访问",
            pageTitle: "首页",
            pageUrl: "/",
            stayDuration: "1分45秒",
            scrollDepth: "60%",
          },
          {
            timestamp: "09:17:15",
            eventType: "页面访问",
            pageTitle: "新产品发布",
            pageUrl: "/products/new-release",
            stayDuration: "8分20秒",
            scrollDepth: "95%",
          },
          {
            timestamp: "09:25:35",
            eventType: "页面访问",
            pageTitle: "价格对比",
            pageUrl: "/pricing",
            stayDuration: "4分15秒",
            scrollDepth: "80%",
          },
        ],
      },
      {
        id: "session-2",
        date: "2024-01-15 14:30",
        summary: "浏览产品页面完成购买",
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
            scrollDepth: "85%",
          },
          {
            timestamp: "14:32:45",
            eventType: "页面访问",
            pageTitle: "产品列表",
            pageUrl: "/products",
            stayDuration: "5分12秒",
            scrollDepth: "100%",
          },
          {
            timestamp: "14:37:57",
            eventType: "页面访问",
            pageTitle: "企业版详情",
            pageUrl: "/products/enterprise",
            stayDuration: "7分30秒",
            scrollDepth: "100%",
          },
          {
            timestamp: "14:45:27",
            eventType: "页面访问",
            pageTitle: "购物车",
            pageUrl: "/cart",
            stayDuration: "3分45秒",
            scrollDepth: "70%",
          },
          {
            timestamp: "14:49:12",
            eventType: "页面访问",
            pageTitle: "结算页面",
            pageUrl: "/checkout",
            stayDuration: "5分20秒",
            scrollDepth: "100%",
          },
        ],
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
            scrollDepth: "90%",
          },
          {
            timestamp: "16:48:30",
            eventType: "页面访问",
            pageTitle: "API文档",
            pageUrl: "/docs/api",
            stayDuration: "12分15秒",
            scrollDepth: "85%",
          },
          {
            timestamp: "17:00:45",
            eventType: "页面访问",
            pageTitle: "集成指南",
            pageUrl: "/docs/integration",
            stayDuration: "6分40秒",
            scrollDepth: "75%",
          },
        ],
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
            eventType: "页面访���",
            pageTitle: "登录页面",
            pageUrl: "/login",
            stayDuration: "1分10秒",
            scrollDepth: "40%",
          },
          {
            timestamp: "11:21:10",
            eventType: "页面访问",
            pageTitle: "账户概览",
            pageUrl: "/account",
            stayDuration: "4分30秒",
            scrollDepth: "95%",
          },
          {
            timestamp: "11:25:40",
            eventType: "页面访问",
            pageTitle: "订单历史",
            pageUrl: "/orders",
            stayDuration: "8分45秒",
            scrollDepth: "100%",
          },
        ],
      },
    ],
    orders: [
      {
        orderNumber: "ORD-2024-003",
        orderDate: "2024-01-15",
        status: "已��成",
        subtotalAmount: 5200.0,
        shippingAmount: 0.0,
        taxAmount: 0.0,
        totalAmount: 5200.0,
        currency: "CNY",
        paymentMethod: "微信支付",
        discountCode: "VIP2024",
        shippingAddress: {
          name: "张伟",
          street: "深圳市南山区科技园南区R4-B栋20层",
          city: "深圳",
          state: "��东省",
          postalCode: "518057",
          country: "中国",
          phone: "13800138000",
        },
        billingAddress: {
          name: "腾讯科技（深圳）有限公司",
          street: "深圳市南山区科技园南区R4-B栋",
          city: "深圳",
          state: "广东省",
          postalCode: "518057",
          country: "中国",
          phone: "0755-86013388",
        },
        items: [
          {
            productName: "企业版软件授权",
            unitPrice: 5200.0,
            quantity: 1,
            totalPrice: 5200.0,
          },
        ],
      },
      {
        orderNumber: "ORD-2024-002",
        orderDate: "2024-01-08",
        status: "已完成",
        subtotalAmount: 3280.5,
        shippingAmount: 50.0,
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
          phone: "13800138000",
        },
        billingAddress: {
          name: "腾讯科技（深圳）有限公司",
          street: "深圳市南山区技园南区R4-B栋",
          city: "深圳",
          state: "广东省",
          postalCode: "518057",
          country: "中国",
          phone: "0755-86013388",
        },
        items: [
          {
            productName: "专业版软件授权",
            unitPrice: 2800.0,
            quantity: 1,
            totalPrice: 2800.0,
          },
          {
            productName: "技术支持服务",
            unitPrice: 480.5,
            quantity: 1,
            totalPrice: 480.5,
          },
        ],
      },
      {
        orderNumber: "ORD-2023-089",
        orderDate: "2023-12-20",
        status: "已完成",
        totalAmount: 4800.0,
        currency: "CNY",
        paymentMethod: "企业转账",
        items: [
          {
            productName: "标准版软件授权",
            unitPrice: 1600.0,
            quantity: 3,
            totalPrice: 4800.0,
          },
        ],
      },
      {
        orderNumber: "ORD-2023-067",
        orderDate: "2023-11-15",
        status: "已完成",
        totalAmount: 2150.0,
        currency: "CNY",
        paymentMethod: "微信支付",
        items: [
          {
            productName: "基础版软件授权",
            unitPrice: 1200.0,
            quantity: 1,
            totalPrice: 1200.0,
          },
          {
            productName: "培训服务",
            unitPrice: 950.0,
            quantity: 1,
            totalPrice: 950.0,
          },
        ],
      },
      {
        orderNumber: "ORD-2023-045",
        orderDate: "2023-10-28",
        status: "已完成",
        totalAmount: 6750.0,
        currency: "CNY",
        paymentMethod: "企业转账",
        items: [
          {
            productName: "企业版软件授权",
            unitPrice: 5200.0,
            quantity: 1,
            totalPrice: 5200.0,
          },
          {
            productName: "定制开发服务",
            unitPrice: 1550.0,
            quantity: 1,
            totalPrice: 1550.0,
          },
        ],
      },
    ],
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
    maxOrderAmount: 4800.0,
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
        summary: "产品演示和技术��估",
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
            scrollDepth: "100%",
          },
          {
            timestamp: "10:45:50",
            eventType: "页面访问",
            pageTitle: "技术规格",
            pageUrl: "/specs",
            stayDuration: "8分45秒",
            scrollDepth: "90%",
          },
          {
            timestamp: "10:54:35",
            eventType: "页面访问",
            pageTitle: "案例研究",
            pageUrl: "/case-studies",
            stayDuration: "12分20秒",
            scrollDepth: "85%",
          },
        ],
      },
      {
        id: "session-lm-2",
        date: "2024-01-10 14:15",
        summary: "完成订单支付和账户设置",
        source: "直接访问",
        deviceType: "桌面端",
        os: "macOS 14",
        browser: "Chrome 120",
        location: "杭州, ��国",
        ipAddress: "120.55.162.203",
        events: [
          {
            timestamp: "14:15:10",
            eventType: "页面访问",
            pageTitle: "登录",
            pageUrl: "/login",
            stayDuration: "1分30秒",
            scrollDepth: "50%",
          },
          {
            timestamp: "14:16:40",
            eventType: "页面访问",
            pageTitle: "购物车",
            pageUrl: "/cart",
            stayDuration: "2分45秒",
            scrollDepth: "70%",
          },
          {
            timestamp: "14:19:25",
            eventType: "页面访问",
            pageTitle: "付页面",
            pageUrl: "/payment",
            stayDuration: "4分15秒",
            scrollDepth: "100%",
          },
          {
            timestamp: "14:23:40",
            eventType: "页面访问",
            pageTitle: "账户设置",
            pageUrl: "/account/settings",
            stayDuration: "6分20秒",
            scrollDepth: "95%",
          },
        ],
      },
      {
        id: "session-lm-3",
        date: "2024-01-05 16:20",
        summary: "产品对比和价格咨��",
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
            scrollDepth: "95%",
          },
          {
            timestamp: "16:29:45",
            eventType: "页面访问",
            pageTitle: "价格方案",
            pageUrl: "/pricing",
            stayDuration: "5分45秒",
            scrollDepth: "80%",
          },
          {
            timestamp: "16:35:30",
            eventType: "页面访问",
            pageTitle: "联系销售",
            pageUrl: "/contact-sales",
            stayDuration: "3分20秒",
            scrollDepth: "75%",
          },
        ],
      },
    ],
    orders: [
      {
        orderNumber: "ORD-2024-015",
        orderDate: "2024-01-10",
        status: "已完成",
        totalAmount: 4800.0,
        currency: "CNY",
        paymentMethod: "支付宝",
        items: [
          {
            productName: "企业版软件授权",
            unitPrice: 4800.0,
            quantity: 1,
            totalPrice: 4800.0,
          },
        ],
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
            productName: "专业��软件授权",
            unitPrice: 2800.0,
            quantity: 1,
            totalPrice: 2800.0,
          },
          {
            productName: "云服务套餐",
            unitPrice: 850.25,
            quantity: 1,
            totalPrice: 850.25,
          },
        ],
      },
      {
        orderNumber: "ORD-2023-134",
        orderDate: "2023-11-30",
        status: "已完成",
        totalAmount: 2250.0,
        currency: "CNY",
        paymentMethod: "支付宝",
        items: [
          {
            productName: "标准版软件授权",
            unitPrice: 1500.0,
            quantity: 1,
            totalPrice: 1500.0,
          },
          {
            productName: "数据分析模块",
            unitPrice: 750.0,
            quantity: 1,
            totalPrice: 750.0,
          },
        ],
      },
      {
        orderNumber: "ORD-2023-089",
        orderDate: "2023-10-15",
        status: "已完成",
        totalAmount: 4950.0,
        currency: "CNY",
        paymentMethod: "企业转账",
        items: [
          {
            productName: "企业版软件授",
            unitPrice: 4800.0,
            quantity: 1,
            totalPrice: 4800.0,
          },
          {
            productName: "���装服务",
            unitPrice: 150.0,
            quantity: 1,
            totalPrice: 150.0,
          },
        ],
      },
      {
        orderNumber: "ORD-2023-067",
        orderDate: "2023-09-20",
        status: "已完成",
        totalAmount: 1850.0,
        currency: "CNY",
        paymentMethod: "微信支付",
        items: [
          {
            productName: "基础版软件授权",
            unitPrice: 1200.0,
            quantity: 1,
            totalPrice: 1200.0,
          },
          {
            productName: "技术支持服务",
            unitPrice: 650.0,
            quantity: 1,
            totalPrice: 650.0,
          },
        ],
      },
      {
        orderNumber: "ORD-2023-045",
        orderDate: "2023-08-10",
        status: "已完成",
        totalAmount: 1400.0,
        currency: "CNY",
        paymentMethod: "支付宝",
        items: [
          {
            productName: "插���扩展包",
            unitPrice: 700.0,
            quantity: 2,
            totalPrice: 1400.0,
          },
        ],
      },
    ],
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
    maxOrderAmount: 6500.0,
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
            eventType: "页面问",
            pageTitle: "新功能介绍",
            pageUrl: "/features/new",
            stayDuration: "12分15秒",
            scrollDepth: "100%",
          },
          {
            timestamp: "13:57:35",
            eventType: "页面访问",
            pageTitle: "功能试用",
            pageUrl: "/trial/features",
            stayDuration: "25分30秒",
            scrollDepth: "95%",
          },
          {
            timestamp: "14:23:05",
            eventType: "页面访问",
            pageTitle: "反馈中心",
            pageUrl: "/feedback",
            stayDuration: "8分45秒",
            scrollDepth: "85%",
          },
        ],
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
            scrollDepth: "90%",
          },
          {
            timestamp: "09:36:40",
            eventType: "页面访问",
            pageTitle: "专属服务",
            pageUrl: "/vip/services",
            stayDuration: "10分20秒",
            scrollDepth: "100%",
          },
          {
            timestamp: "09:47:00",
            eventType: "页面访问",
            pageTitle: "升级方案",
            pageUrl: "/upgrade",
            stayDuration: "7分15秒",
            scrollDepth: "80%",
          },
        ],
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
            scrollDepth: "100%",
          },
          {
            timestamp: "15:39:15",
            eventType: "页面访问",
            pageTitle: "报告中心",
            pageUrl: "/reports",
            stayDuration: "12分30秒",
            scrollDepth: "95%",
          },
          {
            timestamp: "15:51:45",
            eventType: "页面访问",
            pageTitle: "数据导出",
            pageUrl: "/export",
            stayDuration: "5分20秒",
            scrollDepth: "70%",
          },
        ],
      },
      {
        id: "session-wf-4",
        date: "2024-01-15 11:10",
        summary: "团队管理权限设置",
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
            scrollDepth: "100%",
          },
          {
            timestamp: "11:24:45",
            eventType: "页面访问",
            pageTitle: "权限设置",
            pageUrl: "/permissions",
            stayDuration: "9分20秒",
            scrollDepth: "85%",
          },
          {
            timestamp: "11:34:05",
            eventType: "面访问",
            pageTitle: "用户角色",
            pageUrl: "/roles",
            stayDuration: "6分45秒",
            scrollDepth: "75%",
          },
        ],
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
            scrollDepth: "100%",
          },
          {
            timestamp: "16:57:25",
            eventType: "页面��问",
            pageTitle: "开发者控制台",
            pageUrl: "/dev/console",
            stayDuration: "15分30秒",
            scrollDepth: "90%",
          },
          {
            timestamp: "17:12:55",
            eventType: "页面访问",
            pageTitle: "集成示例",
            pageUrl: "/dev/examples",
            stayDuration: "8分40秒",
            scrollDepth: "85%",
          },
        ],
      },
    ],
    orders: [
      {
        orderNumber: "ORD-2024-025",
        orderDate: "2024-01-20",
        status: "已完成",
        totalAmount: 6500.0,
        currency: "CNY",
        paymentMethod: "企业转账",
        items: [
          {
            productName: "旗舰版软件授权",
            unitPrice: 6500.0,
            quantity: 1,
            totalPrice: 6500.0,
          },
        ],
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
            productName: "业版软件授权",
            unitPrice: 3800.0,
            quantity: 1,
            totalPrice: 3800.0,
          },
          {
            productName: "高级数据分析",
            unitPrice: 480.75,
            quantity: 1,
            totalPrice: 480.75,
          },
        ],
      },
      {
        orderNumber: "ORD-2024-008",
        orderDate: "2024-01-08",
        status: "已完成",
        totalAmount: 3650.0,
        currency: "CNY",
        paymentMethod: "微信支付",
        items: [
          {
            productName: "专业版软件授权",
            unitPrice: 2800.0,
            quantity: 1,
            totalPrice: 2800.0,
          },
          {
            productName: "AI智能模块",
            unitPrice: 850.0,
            quantity: 1,
            totalPrice: 850.0,
          },
        ],
      },
      {
        orderNumber: "ORD-2023-198",
        orderDate: "2023-12-28",
        status: "已完成",
        totalAmount: 5420.0,
        currency: "CNY",
        paymentMethod: "企业转账",
        items: [
          {
            productName: "企业版软件授权",
            unitPrice: 3800.0,
            quantity: 1,
            totalPrice: 3800.0,
          },
          {
            productName: "定制开发服务",
            unitPrice: 1620.0,
            quantity: 1,
            totalPrice: 1620.0,
          },
        ],
      },
      {
        orderNumber: "ORD-2023-167",
        orderDate: "2023-12-10",
        status: "已完成",
        totalAmount: 2100.0,
        currency: "CNY",
        paymentMethod: "支付宝",
        items: [
          {
            productName: "准版软件授权",
            unitPrice: 1500.0,
            quantity: 1,
            totalPrice: 1500.0,
          },
          {
            productName: "培训服务",
            unitPrice: 600.0,
            quantity: 1,
            totalPrice: 600.0,
          },
        ],
      },
      {
        orderNumber: "ORD-2023-145",
        orderDate: "2023-11-25",
        status: "已完成",
        totalAmount: 3200.0,
        currency: "CNY",
        paymentMethod: "企业转账",
        items: [
          {
            productName: "专业版软件授权",
            unitPrice: 2800.0,
            quantity: 1,
            totalPrice: 2800.0,
          },
          {
            productName: "技术支持服务",
            unitPrice: 400.0,
            quantity: 1,
            totalPrice: 400.0,
          },
        ],
      },
      {
        orderNumber: "ORD-2023-123",
        orderDate: "2023-11-05",
        status: "已完成",
        totalAmount: 1850.0,
        currency: "CNY",
        paymentMethod: "微信支付",
        items: [
          {
            productName: "基础版软件授权",
            unitPrice: 1200.0,
            quantity: 1,
            totalPrice: 1200.0,
          },
          {
            productName: "云存储服务",
            unitPrice: 650.0,
            quantity: 1,
            totalPrice: 650.0,
          },
        ],
      },
      {
        orderNumber: "ORD-2023-098",
        orderDate: "2023-10-20",
        status: "已完成",
        totalAmount: 4800.0,
        currency: "CNY",
        paymentMethod: "企业转账",
        items: [
          {
            productName: "准版软件授权",
            unitPrice: 1600.0,
            quantity: 3,
            totalPrice: 4800.0,
          },
        ],
      },
      {
        orderNumber: "ORD-2023-076",
        orderDate: "2023-09-30",
        status: "已完成",
        totalAmount: 2200.0,
        currency: "CNY",
        paymentMethod: "支付宝",
        items: [
          {
            productName: "插件扩展包",
            unitPrice: 550.0,
            quantity: 4,
            totalPrice: 2200.0,
          },
        ],
      },
    ],
  },
  {
    cdpId: "d9e5f6g7-8b9c-9012",
    name: "陈杰",
    company: "字节跳动",
    country: "中国",
    city: "北京",
    contact: "chenjie@bytedance.com",
    totalSpent: 12680.0,
    totalOrders: 6,
    averageOrderValue: 2113.33,
    lastPurchaseDate: "2024-01-08",
    maxOrderAmount: 3200.0,
    averagePurchaseCycle: 45,
    tags: ["新客户"],
    firstVisitTime: "2023-11-25 16:30:40",
    registrationTime: "2023-11-28 14:22:15",
    firstPurchaseTime: "2023-12-05 11:10:30",
    lastActiveTime: "2024-01-08 15:45:20",
    cartItems: [
      {
        id: "cart-item-cj-1",
        productName: "标准版软件授权",
        unitPrice: 1600.0,
        quantity: 2,
        totalPrice: 3200.0,
        addedTime: "2024-01-06 14:30:10",
        lastUpdated: "2024-01-08 10:15:45",
      },
      {
        id: "cart-item-cj-2",
        productName: "数据分析模块",
        unitPrice: 750.0,
        quantity: 1,
        totalPrice: 750.0,
        addedTime: "2024-01-07 11:20:30",
        lastUpdated: "2024-01-07 11:20:30",
      },
    ],
    totalCartValue: 3950.0,
    cartCreatedTime: "2024-01-06 14:30:10",
    lastCartUpdate: "2024-01-08 10:15:45",
    cartAbandonCount: 1,
    averageCartValue: 2680.0,
    sessions: [],
    orders: [],
  },
  {
    cdpId: "e0f6g7h8-9c0d-3456",
    name: "刘涛",
    company: "华为技术",
    country: "中国",
    city: "深圳",
    contact: "liutao@huawei.com",
    totalSpent: 45230.8,
    totalOrders: 20,
    averageOrderValue: 2261.54,
    lastPurchaseDate: "2024-01-22",
    maxOrderAmount: 8900.0,
    averagePurchaseCycle: 18,
    tags: ["VIP客户", "长期合作"],
    firstVisitTime: "2023-04-08 12:15:30",
    registrationTime: "2023-04-08 12:45:50",
    firstPurchaseTime: "2023-04-12 09:30:00",
    lastActiveTime: "2024-01-22 18:20:45",
    cartItems: [
      {
        id: "cart-item-lt-1",
        productName: "旗舰版软件授权",
        unitPrice: 8900.0,
        quantity: 1,
        totalPrice: 8900.0,
        addedTime: "2024-01-20 15:30:20",
        lastUpdated: "2024-01-22 16:45:10",
      },
      {
        id: "cart-item-lt-2",
        productName: "企业级安全组件",
        unitPrice: 2200.0,
        quantity: 3,
        totalPrice: 6600.0,
        addedTime: "2024-01-21 09:15:30",
        lastUpdated: "2024-01-21 11:20:45",
      },
    ],
    totalCartValue: 15500.0,
    cartCreatedTime: "2024-01-20 15:30:20",
    lastCartUpdate: "2024-01-22 16:45:10",
    cartAbandonCount: 7,
    averageCartValue: 8750.25,
    sessions: [],
    orders: [],
  },
  {
    cdpId: "f1g7h8i9-0d1e-7890",
    name: "赵敏",
    company: "小米��技",
    country: "中国",
    city: "北京",
    contact: "zhaomin@xiaomi.com",
    totalSpent: 28950.6,
    totalOrders: 11,
    averageOrderValue: 2631.87,
    lastPurchaseDate: "2024-01-18",
    maxOrderAmount: 7200.0,
    averagePurchaseCycle: 30,
    tags: ["企业用户", "技术导向"],
    firstVisitTime: "2023-07-12 10:20:15",
    registrationTime: "2023-07-15 14:35:45",
    firstPurchaseTime: "2023-07-22 16:50:30",
    lastActiveTime: "2024-01-18 11:25:10",
    cartItems: [
      {
        id: "cart-item-zm-1",
        productName: "企业版软件授权",
        unitPrice: 4800.0,
        quantity: 1,
        totalPrice: 4800.0,
        addedTime: "2024-01-16 13:20:15",
        lastUpdated: "2024-01-17 10:30:45",
      },
      {
        id: "cart-item-zm-2",
        productName: "AI智能模块",
        unitPrice: 1200.0,
        quantity: 2,
        totalPrice: 2400.0,
        addedTime: "2024-01-17 14:15:30",
        lastUpdated: "2024-01-18 09:45:20",
      },
    ],
    totalCartValue: 7200.0,
    cartCreatedTime: "2024-01-16 13:20:15",
    lastCartUpdate: "2024-01-18 09:45:20",
    cartAbandonCount: 4,
    averageCartValue: 5280.4,
    sessions: [],
    orders: [],
  },
];

export const getUsers = () => mockUsers;

export const getUserById = (cdpId: string) =>
  mockUsers.find((user) => user.cdpId === cdpId);

/**
 * 新API相关类型定义
 */

/**
 * 订单汇总请求参数
 */
export interface OrderSummaryDto {
  /** 当前页 */
  currentpage?: number;
  /** 结束日期 */
  endDate?: string;
  /** 搜索关键词 */
  keywords?: string;
  /** 排序类型(desc降序，asc升序) */
  order?: "desc" | "asc";
  /** 每页记录数 */
  pagesize?: number;
  /** 追加参数 */
  paramother?: Record<string, string>;
  /** 日期搜索类型 */
  searchtype?: "signTime" | "minBuyTime" | "maxBuyTime" | "createGmt";
  /** 店铺ID */
  shopid?: string;
  /** 排序字段 */
  sort?: string;
  /** 开始日期 */
  startDate?: string;
}

/**
 * 用户画像列表查询参数
 */
export interface UserProfileListParams {
  /** 每页数量 */
  limit?: number;
  /** 用户名 */
  name?: string;
  /** 页码 */
  page?: number;
  /** 请求体参数 */
  body?: OrderSummaryDto;
}

/**
 * 生���符合新API规范的用户数据
 */
function generateNewFormatUser(id: number): User {
  const companies = [
    "阿里巴巴集团",
    "腾讯科技",
    "字节跳动",
    "华为技术",
    "小米科技",
    "美团科技",
    "滴滴出行",
    "京东科技",
    "网易科技",
    "百度在线",
    "蚂蚁金服",
    "拼多多",
    "快手科技",
    "新浪微博",
    "搜狐科技",
  ];

  const locations = [
    "北京市",
    "上海市",
    "深圳市",
    "广州市",
    "杭州市",
    "成都市",
    "武汉市",
    "西安市",
    "南京市",
    "重庆市",
  ];

  const surnames = ["张", "王", "李", "赵", "陈", "刘", "杨", "黄", "周", "吴"];
  const givenNames = [
    "伟",
    "芳",
    "娜",
    "秀英",
    "敏",
    "静",
    "丽",
    "强",
    "磊",
    "军",
  ];

  const emailDomains = [
    "@gmail.com",
    "@163.com",
    "@qq.com",
    "@sina.com",
    "@126.com",
  ];

  const surname = surnames[Math.floor(Math.random() * surnames.length)];
  const givenName = givenNames[Math.floor(Math.random() * givenNames.length)];
  const fullName = surname + givenName;

  const isEmail = Math.random() > 0.5;
  const contactInfo = isEmail
    ? `${fullName.toLowerCase()}${Math.floor(Math.random() * 999)}${emailDomains[Math.floor(Math.random() * emailDomains.length)]}`
    : `1${Math.floor(Math.random() * 9) + 3}${Math.floor(
        Math.random() * 100000000,
      )
        .toString()
        .padStart(8, "0")}`;

  const signTime = new Date(
    Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 3,
  );
  const createGmt = new Date(
    signTime.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000,
  );
  const minBuyTime = new Date(
    signTime.getTime() + Math.random() * 60 * 24 * 60 * 60 * 1000,
  );
  const maxBuyTime = new Date(
    minBuyTime.getTime() + Math.random() * 200 * 24 * 60 * 60 * 1000,
  );
  const loginDate = new Date(
    Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
  );

  const orderCount = Math.floor(Math.random() * 50) + 1;
  const avgOrderAmount = Math.random() * 2000 + 100;
  const totalOrders = orderCount * avgOrderAmount * (0.5 + Math.random());
  const maxOrderAmount = avgOrderAmount * (1.5 + Math.random() * 2);

  return {
    id: `user_${id}`,
    cdpUserId: 1000000 + id,
    fullName,
    contactInfo,
    companyName: companies[Math.floor(Math.random() * companies.length)],
    signTime: signTime.toISOString(),
    createGmt: createGmt.toISOString(),
    minBuyTime: minBuyTime.toISOString(),
    maxBuyTime: maxBuyTime.toISOString(),
    maxOrderAmount: Math.round(maxOrderAmount * 100) / 100,
    totalOrders: Math.round(totalOrders * 100) / 100,
    orderCount,
    loginDate: loginDate.toISOString(),
    location: locations[Math.floor(Math.random() * locations.length)],
    shopid: "shop_001",

    // 兼容字段
    cdpId: `cdp_${id}`,
    name: fullName,
    company: companies[Math.floor(Math.random() * companies.length)],
    contact: contactInfo,
    totalSpent: Math.round(totalOrders * 100) / 100,
    tags: [],
    sessions: [],
    orders: [],
  };
}

/**
 * 获取用户画像列表的mock数据
 */
export function getMockUserProfileList(params: UserProfileListParams = {}) {
  const { page = 1, limit = 10, name, body = {} } = params;
  const { keywords, searchtype, sort, order } = body;

  // 生成用户列表
  const totalUsers = 1286;
  const allUsers: User[] = [];

  // 检查缓存
  const cacheKey = `mock_profile_users_${totalUsers}`;
  const cached =
    typeof window !== "undefined" ? sessionStorage.getItem(cacheKey) : null;

  if (cached) {
    allUsers.push(...JSON.parse(cached));
  } else {
    for (let i = 1; i <= totalUsers; i++) {
      allUsers.push(generateNewFormatUser(i));
    }
    if (typeof window !== "undefined") {
      sessionStorage.setItem(cacheKey, JSON.stringify(allUsers));
    }
  }

  // 过滤数据
  let filteredUsers = allUsers;
  const searchTerm = keywords || name;
  if (searchTerm && searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    filteredUsers = allUsers.filter(
      (user) =>
        user.fullName.toLowerCase().includes(term) ||
        user.contactInfo.toLowerCase().includes(term) ||
        user.companyName.toLowerCase().includes(term) ||
        user.location.toLowerCase().includes(term),
    );
  }

  // 排序
  if (sort) {
    filteredUsers.sort((a, b) => {
      const aValue = a[sort as keyof User] as any;
      const bValue = b[sort as keyof User] as any;

      if (typeof aValue === "number" && typeof bValue === "number") {
        return order === "asc" ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return order === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });
  }

  // 分页
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  return {
    list: paginatedUsers,
    total: filteredUsers.length,
    currentpage: page,
    pagesize: limit,
  };
}

/**
 * 模拟API调用延迟
 */
export function mockApiDelay(ms: number = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const getAllLocations = () => {
  const locations = new Set<string>();
  mockUsers.forEach((user) => {
    locations.add(`${user.country}/${user.city}`);
  });
  return Array.from(locations).sort();
};
