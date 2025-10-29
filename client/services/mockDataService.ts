import type { ApiUser, ApiLabel, ApiEvent, ApiEventListResponse } from "@/lib/profile";
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
const generateMockUsers = (count: number): MockUser[] => {
  const firstNames = ["王", "李", "张", "刘", "陈", "杨", "赵", "黄", "周", "吴"]; 
  const lastNames = ["伟", "芳", "强", "磊", "军", "洋", "勇", "艳", "杰", "娟"]; 
  const companies = ["星火科技", "天行电商", "华夏数据", "巢云网络", "沧海零售", "云杉数科", "青藤互动", "灵犀传媒"]; 
  const cities = ["上海", "北京", "广州", "深圳", "杭州", "成都", "南京", "西安"]; 
  const currencies = ["CNY", "USD", "EUR", "GBP"]; 

  const users: MockUser[] = [];
  for (let i = 0; i < count; i++) {
    const id = (10000 + i).toString();
    const userId = `U-${id}`;
    const cdpId = `CDP-${20000 + i}`;
    const name = `${firstNames[i % firstNames.length]}${lastNames[i % lastNames.length]}`;
    const company = companies[i % companies.length];
    const city = cities[i % cities.length];
    const currency = currencies[i % currencies.length];

    const now = Date.now();
    const firstVisit = new Date(now - (90 + i) * 86400000).toISOString();
    const registration = new Date(now - (80 + i) * 86400000).toISOString();
    const firstPurchase = new Date(now - (60 + i) * 86400000).toISOString();
    const lastActive = new Date(now - (i % 30) * 86400000).toISOString();

    const totalSpent = Math.round(500 + (i % 50) * 37.5);

    users.push({
      id,
      userId,
      cdpId,
      name,
      company,
      contact: `${name.toLowerCase()}@example.com`,
      firstVisitTime: firstVisit,
      registrationTime: registration,
      firstPurchaseTime: firstPurchase,
      lastActiveTime: lastActive,
      totalSpent,
      currency,
    });
  }
  return users;
};

// 生成符合现实情况的90天内首访数据
const generateFirstVisitData = (index: number) => {
  // 根据索引确定渠道类型，确保覆盖所有类型
  const channelType = index % 5;
  
  // 基础数据结构
  const baseData = {
    firstReferrer: "",
    firstVisitSource: "",
    firstVisitMedium: "",
    firstVisitCampaign: "",
    firstVisitContent: "",
    firstVisitTerm: "",
    gclid: "",
    gad_source: "",
    gclsrc: "",
    gbraid: "",
    wbraid: "",
    token: "",
    title: "",
    fbclid: "",
    msclkid: "",
    ttclid: "",
    twclid: "",
    qclid: "",
    dclid: "",
    rdt_cid: "",
    irclid: "",
    li_fat_id: "",
    mc_cid: "",
    sccid: "",
    igshid: "",
    _kx: "",
    epik: "",
  };

  switch (channelType) {
    case 0: // 付费广告 - Click ID 自动追踪
      const clickIdTypes = [
        { gclid: `gclid_${index}_${Date.now().toString(36)}`, gad_source: "1" }, // Google Ads
        { fbclid: `fbclid_${index}_${Date.now().toString(36)}` }, // Facebook Ads
        { msclkid: `msclkid_${index}_${Date.now().toString(36)}` }, // Microsoft Ads
        { ttclid: `ttclid_${index}_${Date.now().toString(36)}` }, // TikTok Ads
        { gbraid: `gbraid_${index}_${Date.now().toString(36)}` }, // Google iOS 14+
      ];
      const clickIdData = clickIdTypes[index % clickIdTypes.length];
      return {
        ...baseData,
        ...clickIdData,
        firstReferrer: "https://www.google.com/",
        title: "产品推广活动",
      };

    case 1: // 付费广告 - UTM 标记
      const paidCampaigns = [
        {
          firstVisitSource: "google",
          firstVisitMedium: "cpc",
          firstVisitCampaign: "summer_sale_2024",
          firstVisitContent: "text_ad_01",
          firstVisitTerm: "运动鞋+优惠",
          firstReferrer: "https://www.google.com/search?q=运动鞋优惠",
        },
        {
          firstVisitSource: "baidu",
          firstVisitMedium: "ppc",
          firstVisitCampaign: "brand_awareness",
          firstVisitContent: "banner_large",
          firstVisitTerm: "品牌+官网",
          firstReferrer: "https://www.baidu.com/s?wd=品牌官网",
        },
        {
          firstVisitSource: "facebook",
          firstVisitMedium: "paid",
          firstVisitCampaign: "retargeting_q4",
          firstVisitContent: "carousel_ad",
          firstReferrer: "https://www.facebook.com/",
        },
        {
          firstVisitSource: "tiktok",
          firstVisitMedium: "display",
          firstVisitCampaign: "video_promotion",
          firstVisitContent: "video_ad_15s",
          firstReferrer: "https://www.tiktok.com/",
        },
      ];
      const paidData = paidCampaigns[index % paidCampaigns.length];
      return { ...baseData, ...paidData };

    case 2: // 自然搜索
      const organicSources = [
        {
          firstReferrer: "https://www.google.com/search?q=最佳运动装备推荐",
          firstVisitSource: "google",
          firstVisitMedium: "organic",
        },
        {
          firstReferrer: "https://www.baidu.com/s?wd=户外用品购买指南",
          firstVisitSource: "baidu",
          firstVisitMedium: "organic",
        },
        {
          firstReferrer: "https://www.bing.com/search?q=专业运动器材",
          firstVisitSource: "bing",
          firstVisitMedium: "organic",
        },
        {
          firstReferrer: "https://search.yahoo.com/search?p=运动健身装备",
          firstVisitSource: "yahoo",
          firstVisitMedium: "organic",
        },
      ];
      const organicData = organicSources[index % organicSources.length];
      return { ...baseData, ...organicData };

    case 3: // 其他渠道 - UTM 标记
      const otherChannels = [
        {
          firstVisitSource: "newsletter",
          firstVisitMedium: "email",
          firstVisitCampaign: "weekly_digest_2024",
          firstVisitContent: "product_spotlight",
          firstReferrer: "https://mail.qq.com/",
        },
        {
          firstVisitSource: "wechat",
          firstVisitMedium: "social",
          firstVisitCampaign: "influencer_collab",
          firstVisitContent: "story_post",
          firstReferrer: "https://mp.weixin.qq.com/",
        },
        {
          firstVisitSource: "zhihu",
          firstVisitMedium: "referral",
          firstVisitCampaign: "content_marketing",
          firstVisitContent: "article_link",
          firstReferrer: "https://www.zhihu.com/question/12345678",
        },
        {
          firstVisitSource: "xiaohongshu",
          firstVisitMedium: "social",
          firstVisitCampaign: "ugc_campaign",
          firstVisitContent: "user_review",
          firstReferrer: "https://www.xiaohongshu.com/explore/",
        },
      ];
      const otherData = otherChannels[index % otherChannels.length];
      return { ...baseData, ...otherData };

    case 4: // 直接访问
    default:
      return {
        ...baseData,
        firstReferrer: "", // 空 referrer 表示直接访问
        title: "首页访问",
      };
  }
};

// 将 MockUser 转换为 ApiUser（用于页面展示）
export const convertMockUserToApiUser = (mock: MockUser, index = 0): ApiUser => {
  const toCurrencySymbol = (cur: string) => {
    switch (cur) {
      case "CNY":
        return "￥";
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      default:
        return "$";
    }
  };

  const now = new Date();
  const daysSinceFirst = Math.max(1, Math.floor((now.getTime() - new Date(mock.firstVisitTime).getTime()) / 86400000));
  // 90天LTV的演示估算：基于总消费的比例，随索引稳定变化
  const ltvBaseRatio = [0.55, 0.6, 0.5, 0.65, 0.48][index % 5];
  const ltv90Days = Math.floor(mock.totalSpent * ltvBaseRatio);

  // 5+2扩展指标（演示计算）
  const sessions30d = 6 + (index % 10); // 6~15
  const avgPagesPerSession = 4 + (index % 5); // 4~8
  const pageviews30d = sessions30d * avgPagesPerSession;
  const aov30d = Math.max(80, Math.floor((mock.totalSpent * 0.18) / Math.max(1, (index % 3) + 1))); // 粗略估算
  const bounceRates = [0.22, 0.35, 0.18, 0.5, 0.42, 0.28, 0.31];
  const bounceRate = bounceRates[index % bounceRates.length];

  // 生成90天内首访数据
  const firstVisitData = generateFirstVisitData(index);

  return {
    id: mock.id,
    distinctId: mock.userId,
    userId: mock.userId,
    cdpUserId: Number(mock.cdpId.replace("CDP-", "")),
    fullName: mock.name,
    contactInfo: mock.contact,
    companyName: mock.company,
    signTime: mock.registrationTime,
    createGmt: mock.firstVisitTime,
    minBuyTime: mock.firstPurchaseTime,
    maxBuyTime: mock.lastActiveTime,
    totalOrders: mock.totalSpent,
    orderCount: Math.max(1, Math.floor(mock.totalSpent / 320)),
    maxOrderAmount: Math.floor(mock.totalSpent * 0.42),
    loginDate: mock.lastActiveTime,
    location: "中国/北京",
    shopid: "shop_demo",
    currencySymbol: toCurrencySymbol(mock.currency),
    sessionId: `session-${mock.id}`,
    labelList: [
      { id: `label-1-${mock.id}`, labelName: "活跃用户" } as ApiLabel,
      { id: `label-2-${mock.id}`, labelName: "高价值客户" } as ApiLabel,
    ],
    // 90天内首访数据
    ...firstVisitData,
    ltv90Days,
    // 5+2扩展指标
    sessions30d,
    pageviews30d,
    aov30d,
    bounceRate,
  } as ApiUser;
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
          const result = (aValue as string).localeCompare(bValue as string);
          return params.sortDirection === "desc" ? -result : result;
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          const result = (aValue as number) - (bValue as number);
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

  // 返回 ApiUser 以便页面直接渲染
  static async getApiUsers(
    params: {
      page?: number;
      pageSize?: number;
      search?: string;
      sortField?: string;
      sortDirection?: "asc" | "desc";
      filters?: {
        ltv90Min?: number;
        ltv90Max?: number;
        sessionsMin?: number;
        sessionsMax?: number;
        pageviewsMin?: number;
        pageviewsMax?: number;
        aovMin?: number;
        aovMax?: number;
        bounceMin?: number; // 0..1
        bounceMax?: number; // 0..1
      };
    } = {},
  ): Promise<{ users: ApiUser[]; total: number }> {
    const isDerivedField = ["ltv90Days", "sessions30d", "pageviews30d", "aov30d", "bounceRate"].includes(
      params.sortField || "",
    );
    const hasDerivedFilter = !!params.filters && Object.values(params.filters).some((v) => v !== undefined && v !== null);

    let working = [...this.users];

    // 搜索过滤与 getUsers 保持一致
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      working = working.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.company.toLowerCase().includes(searchLower) ||
          user.contact.toLowerCase().includes(searchLower) ||
          user.cdpId.includes(searchLower),
      );
    }

    // 若存在扩展筛选或扩展排序，统一使用 ApiUser 转换路径
    if (hasDerivedFilter || isDerivedField) {
      const converted = working.map((u, i) => convertMockUserToApiUser(u, i));

      // 扩展指标筛选
      if (params.filters) {
        const {
          ltv90Min, ltv90Max,
          sessionsMin, sessionsMax,
          pageviewsMin, pageviewsMax,
          aovMin, aovMax,
          bounceMin, bounceMax,
        } = params.filters;

        const meetsRange = (value: number | undefined, min?: number, max?: number) => {
          if (value === undefined || value === null) return false; // 若没有值，则不通过筛选
          if (min !== undefined && value < min) return false;
          if (max !== undefined && value > max) return false;
          return true;
        };

        const optionalRange = (value: number | undefined, min?: number, max?: number) => {
          if (min === undefined && max === undefined) return true; // 无筛选
          return meetsRange(value, min, max);
        };

        // 逐项过滤（bounceRate 为 0..1）
        const filtered = converted.filter((u) =>
          optionalRange(u.ltv90Days, ltv90Min, ltv90Max) &&
          optionalRange(u.sessions30d, sessionsMin, sessionsMax) &&
          optionalRange(u.pageviews30d, pageviewsMin, pageviewsMax) &&
          optionalRange(u.aov30d, aovMin, aovMax) &&
          optionalRange(u.bounceRate, bounceMin, bounceMax),
        );

        // 用筛选结果继续
        let list = filtered;

        // 排序：支持扩展字段与基础字段映射（基础字段映射到 ApiUser 对应字段）
        if (params.sortField) {
          const sf = params.sortField;
          list.sort((a, b) => {
            let aValue: any;
            let bValue: any;
            switch (sf) {
              case "ltv90Days":
              case "sessions30d":
              case "pageviews30d":
              case "aov30d":
              case "bounceRate":
                aValue = (a as any)[sf] ?? 0;
                bValue = (b as any)[sf] ?? 0;
                break;
              case "firstVisitTime":
                aValue = new Date(a.createGmt).getTime();
                bValue = new Date(b.createGmt).getTime();
                break;
              case "registrationTime":
                aValue = new Date(a.signTime).getTime();
                bValue = new Date(b.signTime).getTime();
                break;
              case "firstPurchaseTime":
                aValue = new Date(a.minBuyTime).getTime();
                bValue = new Date(b.minBuyTime).getTime();
                break;
              case "lastActiveTime":
                aValue = new Date(a.maxBuyTime).getTime();
                bValue = new Date(b.maxBuyTime).getTime();
                break;
              case "totalSpent":
                aValue = a.totalOrders ?? 0;
                bValue = b.totalOrders ?? 0;
                break;
              default:
                aValue = 0; bValue = 0;
            }
            const diff = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            return params.sortDirection === "desc" ? -diff : diff;
          });
        }

        // 分页
        const page = params.page || 1;
        const pageSize = params.pageSize || 10;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paged = list.slice(startIndex, endIndex);
        return { users: paged, total: list.length };
      }

      // 若没有 filters，仅扩展排序（保留原有行为）
      converted.sort((a, b) => {
        const field = params.sortField as keyof ApiUser;
        const aValue = (a[field] as any) ?? 0;
        const bValue = (b[field] as any) ?? 0;
        const isNumber = typeof aValue === "number" && typeof bValue === "number";
        let result = 0;
        if (isNumber) {
          result = (aValue as number) - (bValue as number);
        } else if (typeof aValue === "string" && typeof bValue === "string") {
          result = (aValue as string).localeCompare(bValue as string);
        }
        return params.sortDirection === "desc" ? -result : result;
      });
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paged = converted.slice(startIndex, endIndex);
      return { users: paged, total: converted.length };
    }

    // 无扩展筛选与排序时，沿用原先的排序+分页，再转换
    const { users, total } = await this.getUsers({
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      sortField: params.sortField,
      sortDirection: params.sortDirection,
    });
    return { users: users.map((u, i) => convertMockUserToApiUser(u, i)), total };
  }

  // 获取单个用户详情
  static async getUserById(id: string): Promise<MockUser | null> {
    const user = this.users.find((u) => u.id === id || u.cdpId === id || u.userId === id);
    return user || null;
  }

  static async getApiUserById(id: string): Promise<ApiUser | null> {
    const user = await this.getUserById(id);
    // 单个用户没有索引，基于id稳定映射来源与媒介
    const idx = user ? (parseInt(user.id, 10) % 10) : 0;
    return user ? convertMockUserToApiUser(user, idx) : null;
  }

  // 检查是否应该使用模拟数据（演示模式）
  static shouldUseMockData(): boolean {
    const flag = (import.meta as any)?.env?.VITE_DEMO_MODE;
    const isDemo = flag === true || flag === "true";
    const mode = (import.meta as any)?.env?.MODE;
    const isDevOrStaging = (import.meta as any)?.env?.DEV || ["development", "staging"].includes(mode);
    return !!isDemo && !!isDevOrStaging;
  }

  // 生成订单事件
  private static generateOrderEventsForUser(user: MockUser, count: number = 24): ApiEvent[] {
    const symbol = (() => {
      switch (user.currency) {
        case "CNY":
          return "￥";
        case "USD":
          return "$";
        case "EUR":
          return "€";
        case "GBP":
          return "£";
        default:
          return "$";
      }
    })();

    const statuses = ["unconfirmed", "confirmed", "completed", "cancelled"];
    const paymentMethods = ["支付宝", "微信支付", "信用卡", "Apple Pay"];
    const products = [
      { name: "iPhone 15 Pro", price: 8999, sn: "SKU-IP15P" },
      { name: "AirPods Pro 2", price: 1999, sn: "SKU-APP2" },
      { name: "MacBook Air M3", price: 9999, sn: "SKU-MBA13" },
      { name: "智能手表", price: 1299, sn: "SKU-SWATCH" },
      { name: "蓝牙音箱", price: 599, sn: "SKU-BTSPEAK" },
    ];

    const events: ApiEvent[] = [];
    for (let i = 0; i < count; i++) {
      const itemCount = 1 + (i % 3);
      const chosenItems = Array.from({ length: itemCount }).map((_, idx) => {
        const p = products[(i + idx) % products.length];
        const count = 1 + ((i + idx) % 2);
        return {
          name: p.name,
          price: p.price,
          count,
          totalPrice: p.price * count,
          sn: p.sn,
        };
      });
      const subtotal = chosenItems.reduce((sum, it) => sum + it.totalPrice, 0);
      const tax = Math.round(subtotal * 0.06);
      const shipping = subtotal > 3000 ? 0 : 25;
      const discount = (i % 4 === 0) ? Math.round(subtotal * 0.1) : 0;
      const totalAmount = subtotal + tax + shipping - discount;
      const status = statuses[i % statuses.length];

      const properties = {
        status,
        payment_method: paymentMethods[i % paymentMethods.length],
        line_items: chosenItems,
        shipping_address: "北京市朝阳区示例路 66 号",
        consignee: user.name,
        phone: "13800138000",
        sn: `ORD-${new Date().getFullYear()}-${String(1000 + i).padStart(6, "0")}`,
        subtotal_amount: subtotal,
        tax_amount: tax,
        shipping_amount: shipping,
        discount_amount: discount,
        total_amount: totalAmount,
      };

      const when = new Date(Date.now() - i * 86400000);
      const event: ApiEvent = {
        id: `${user.id}-order-${i}`,
        gmtCreate: when.toISOString(),
        gmtModified: when.toISOString(),
        tenantId: "mockTenant",
        eventName: "CompletePurchase",
        userId: user.userId,
        timestamp: String(when.getTime()),
        properties: JSON.stringify(properties),
        userName: user.name,
        price: totalAmount,
        currency: symbol,
        eventType: 1,
        nullId: false,
      };
      events.push(event);
    }

    return events;
  }

  // 生成行为事件（时间线）
  private static generateBehaviorEventsForUser(user: MockUser, count: number = 36): ApiEvent[] {
    const symbol = (() => {
      switch (user.currency) {
        case "CNY":
          return "￥";
        case "USD":
          return "$";
        case "EUR":
          return "€";
        case "GBP":
          return "£";
        default:
          return "$";
      }
    })();

    const pages = [
      { title: "首页", url: "/", full: "https://demo.cdp.example/" },
      { title: "商品列表", url: "/products", full: "https://demo.cdp.example/products" },
      { title: "商品详情", url: "/products/iphone-15-pro", full: "https://demo.cdp.example/products/iphone-15-pro" },
      { title: "购物车", url: "/cart", full: "https://demo.cdp.example/cart" },
      { title: "结算页", url: "/checkout", full: "https://demo.cdp.example/checkout" },
    ];

    const eventNames: Array<{
      name: string;
      buildProps: (i: number) => any;
    }> = [
      {
        name: "$pageview",
        buildProps: (i) => {
          const p = pages[i % pages.length];
          return {
            source: "web",
            deviceType: i % 3 === 0 ? "mobile" : "desktop",
            pageTitle: `${p.title} - CDP 演示`,
            pageURL: p.full,
            $event_type: "$pageview",
            $browser_version: 119,
            $timezone: "Asia/Shanghai",
            $current_url: p.full,
            $referrer: "https://search.example?q=cdp",
            $pathname: p.url,
            dwellTimeMs: 20000 + (i % 5) * 3500,
            maxScrollDepth: 1200 + (i % 4) * 260,
            maxDepthPercent: 50 + (i % 4) * 12,
            $screen_width: 1920,
            $screen_height: 1080,
            $viewport_width: 1600,
            $viewport_height: 900,
          };
        },
      },
      {
        name: "ViewProduct",
        buildProps: (i) => {
          return {
            source: "web",
            deviceType: "desktop",
            pageTitle: "商品详情 - iPhone 15 Pro",
            pageURL: "https://demo.cdp.example/products/iphone-15-pro",
            productId: "P-IP15P",
            productName: "iPhone 15 Pro",
            productCategory: "手机",
            productPrice: 8999,
            productCurrency: symbol,
            productBrand: "Apple",
            $pathname: "/products/iphone-15-pro",
          };
        },
      },
      {
        name: "$autocapture",
        buildProps: (i) => {
          return {
            $event_type: "click",
            $elements: [
              {
                tag_name: "button",
                attr__id: "add-to-cart",
                classes: ["btn", "btn-primary"],
                nth_child: 3,
                $el_text: "加入购物车",
              },
            ],
            $elements_chain: "div > button#add-to-cart.btn.btn-primary",
            $current_url: "https://demo.cdp.example/products/iphone-15-pro",
            $pathname: "/products/iphone-15-pro",
            $screen_width: 1920,
            $screen_height: 1080,
          };
        },
      },
      {
        name: "AddToCart",
        buildProps: (i) => ({
          source: "web",
          deviceType: "desktop",
          elementText: "将 iPhone 15 Pro 加入购物车",
          productId: "P-IP15P",
          productName: "iPhone 15 Pro",
          productCategory: "手机",
          productPrice: 8999,
          productCurrency: symbol,
          productBrand: "Apple",
          $pathname: "/products/iphone-15-pro",
        }),
      },
      {
        name: "StartCheckout",
        buildProps: (i) => ({
          source: "web",
          deviceType: "desktop",
          pageTitle: "结算页",
          pageURL: "https://demo.cdp.example/checkout",
          $pathname: "/checkout",
        }),
      },
      {
        name: "UserLogin",
        buildProps: (i) => ({
          source: "web",
          deviceType: i % 2 === 0 ? "mobile" : "desktop",
          elementText: `${user.name} 已登录`,
          $pathname: "/login",
        }),
      },
      {
        name: "Search",
        buildProps: (i) => ({
          source: "web",
          deviceType: "mobile",
          elementText: "搜索关键词: \"蓝牙耳机\", \"降噪\"",
          $pathname: "/products",
        }),
      },
      {
        name: "PageDwellTime",
        buildProps: (i) => ({
          source: "web",
          deviceType: "desktop",
          dwellTimeMs: 38000 + (i % 3) * 4500,
          $pathname: "/",
        }),
      },
    ];

    const events: ApiEvent[] = [];
    for (let i = 0; i < count; i++) {
      const typeIdx = i % eventNames.length;
      const def = eventNames[typeIdx];
      const props = def.buildProps(i);
      const when = new Date(Date.now() - i * 3600_000);

      const event: ApiEvent = {
        id: `${user.id}-beh-${i}`,
        gmtCreate: when.toISOString(),
        gmtModified: when.toISOString(),
        tenantId: "mockTenant",
        eventName: def.name,
        userId: user.userId,
        timestamp: String(when.getTime()),
        properties: JSON.stringify(props),
        userName: user.name,
        price: 0,
        currency: symbol,
        eventType: 2,
        nullId: false,
      };
      events.push(event);
    }

    return events;
  }

  // 获取模拟事件列表（订单/行为）
  static async getMockEventList(
    userId: string,
    sessionId: string,
    page: number = 1,
    size: number = 10,
    eventType: number = 1,
  ): Promise<ApiEventListResponse> {
    const user = this.users.find((u) => u.userId === userId || u.cdpId === userId || u.id === userId);
    // 如果找不到用户，生成一个临时用户以便演示
    const baseUser: MockUser = user || {
      id: userId || "temp",
      userId: userId || `U-${userId}`,
      cdpId: `CDP-${userId}`,
      name: "演示用户",
      company: "演示公司",
      contact: "demo.user@example.com",
      firstVisitTime: new Date(Date.now() - 90 * 86400000).toISOString(),
      registrationTime: new Date(Date.now() - 80 * 86400000).toISOString(),
      firstPurchaseTime: new Date(Date.now() - 60 * 86400000).toISOString(),
      lastActiveTime: new Date(Date.now() - 1 * 86400000).toISOString(),
      totalSpent: 12888,
      currency: "CNY",
    };

    const isOrder = eventType === 0 || eventType === 1;
    const allEvents = isOrder
      ? this.generateOrderEventsForUser(baseUser, 28)
      : this.generateBehaviorEventsForUser(baseUser, 42);

    const total = allEvents.length;
    const pages = Math.max(1, Math.ceil(total / size));
    const current = Math.min(Math.max(1, page), pages);
    const startIndex = (current - 1) * size;
    const endIndex = startIndex + size;
    const records = allEvents.slice(startIndex, endIndex);

    const response: ApiEventListResponse = {
      records,
      total,
      size,
      current,
      orders: [],
      optimizeCountSql: false,
      searchCount: true,
      countId: null,
      maxLimit: null,
      pages,
    };

    return response;
  }
}
