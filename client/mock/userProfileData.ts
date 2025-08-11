/**
 * 用户画像模拟数据
 */
import type { UserProfile } from "@/types/userProfile";

/**
 * 生成随机用户画像数据
 */
function generateMockUserProfile(id: number): UserProfile {
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
    "天津市",
    "苏州市",
    "长沙市",
    "郑州市",
    "青岛市",
  ];

  const surnames = ["张", "王", "李", "赵", "陈", "刘", "杨", "黄", "周", "吴"];
  const givenNames = [
    "伟", "芳", "娜", "秀英", "敏", "静", "丽", "强", "磊", "军",
    "洋", "勇", "艳", "杰", "娟", "涛", "明", "超", "秀兰", "霞",
  ];

  const emailDomains = [
    "@gmail.com",
    "@163.com",
    "@qq.com",
    "@sina.com",
    "@126.com",
    "@outlook.com",
    "@hotmail.com",
  ];

  const surname = surnames[Math.floor(Math.random() * surnames.length)];
  const givenName = givenNames[Math.floor(Math.random() * givenNames.length)];
  const fullName = surname + givenName;
  
  const isEmail = Math.random() > 0.5;
  const contactInfo = isEmail 
    ? `${fullName.toLowerCase()}${Math.floor(Math.random() * 999)}${emailDomains[Math.floor(Math.random() * emailDomains.length)]}`
    : `1${Math.floor(Math.random() * 9) + 3}${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;

  const signTime = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 3);
  const createGmt = new Date(signTime.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);
  const minBuyTime = new Date(signTime.getTime() + Math.random() * 60 * 24 * 60 * 60 * 1000);
  const maxBuyTime = new Date(minBuyTime.getTime() + Math.random() * 200 * 24 * 60 * 60 * 1000);
  const loginDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

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
  };
}

/**
 * 生成用户画像列表数据
 */
export function generateMockUserProfileList(
  page: number = 1,
  pageSize: number = 10,
  keywords?: string,
): {
  list: UserProfile[];
  total: number;
  page: number;
  pageSize: number;
} {
  // 生���总数据（模拟数据库中的数据）
  const totalUsers = 1286; // 模拟总用户数
  const allUsers: UserProfile[] = [];
  
  // 如果有缓存，使用缓存
  const cacheKey = `mock_users_${totalUsers}`;
  const cached = sessionStorage.getItem(cacheKey);
  
  if (cached) {
    allUsers.push(...JSON.parse(cached));
  } else {
    // 生成新数据
    for (let i = 1; i <= totalUsers; i++) {
      allUsers.push(generateMockUserProfile(i));
    }
    // 缓存数据
    sessionStorage.setItem(cacheKey, JSON.stringify(allUsers));
  }

  // 过滤数据（模拟搜索）
  let filteredUsers = allUsers;
  if (keywords && keywords.trim()) {
    const searchTerm = keywords.toLowerCase();
    filteredUsers = allUsers.filter(
      (user) =>
        user.fullName.toLowerCase().includes(searchTerm) ||
        user.contactInfo.toLowerCase().includes(searchTerm) ||
        user.companyName.toLowerCase().includes(searchTerm) ||
        user.location.toLowerCase().includes(searchTerm),
    );
  }

  // 分页处理
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  return {
    list: paginatedUsers,
    total: filteredUsers.length,
    page,
    pageSize,
  };
}

/**
 * 模��API响应延迟
 */
export function mockApiDelay(ms: number = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 清除缓存
 */
export function clearMockCache(): void {
  const keys = Object.keys(sessionStorage);
  keys.forEach((key) => {
    if (key.startsWith("mock_users_")) {
      sessionStorage.removeItem(key);
    }
  });
}
