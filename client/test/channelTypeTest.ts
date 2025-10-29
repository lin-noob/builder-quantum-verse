// 渠道类型判断逻辑测试
// 用于验证按照优先级和判断条件实现的分类逻辑

interface TestApiUser {
  firstVisitSource?: string;
  firstVisitMedium?: string;
  firstVisitCampaign?: string;
  firstVisitContent?: string;
  firstVisitTerm?: string;
  firstReferrer?: string;
  gclid?: string;
  fbclid?: string;
  msclkid?: string;
  ttclid?: string;
  twclid?: string;
  dclid?: string;
  qclid?: string;
  rdt_cid?: string;
  irclid?: string;
  li_fat_id?: string;
  mc_cid?: string;
  sccid?: string;
  gad_source?: string;
  gbraid?: string;
  wbraid?: string;
  epik?: string;
  _kx?: string;
}

function getChannelType(apiUser: TestApiUser | null, user: any = null) {
  // 获取所有相关字段
  const source = apiUser?.firstVisitSource || user?.firstVisitSource || "";
  const medium = apiUser?.firstVisitMedium || user?.firstVisitMedium || "";
  const campaign = apiUser?.firstVisitCampaign || "";
  const content = apiUser?.firstVisitContent || "";
  const term = apiUser?.firstVisitTerm || "";
  const referrer = apiUser?.firstReferrer || "";
  
  // 所有 Click ID 字段（以 clid 结尾的字段）
  const clickIds = {
    gclid: apiUser?.gclid || "",
    fbclid: apiUser?.fbclid || "",
    msclkid: apiUser?.msclkid || "",
    ttclid: apiUser?.ttclid || "",
    twclid: apiUser?.twclid || "",
    dclid: apiUser?.dclid || "",
    qclid: apiUser?.qclid || "",
    rdt_cid: apiUser?.rdt_cid || "",
    irclid: apiUser?.irclid || "",
    li_fat_id: apiUser?.li_fat_id || "",
    mc_cid: apiUser?.mc_cid || "",
    sccid: apiUser?.sccid || "",
    // 其他相关广告标识
    gad_source: apiUser?.gad_source || "",
    gbraid: apiUser?.gbraid || "",
    wbraid: apiUser?.wbraid || "",
    epik: apiUser?.epik || "",
    _kx: apiUser?._kx || ""
  };
  
  // 步骤 1: 付费广告 (Click ID 自动追踪) - 最高优先级
  const hasClickId = Object.values(clickIds).some(id => Boolean(id));
  if (hasClickId) {
    return { type: "付费广告", color: "bg-red-100 text-red-800" };
  }
  
  // 步骤 2: 付费广告 (UTM 标记) - 检查 utm_medium 是否标记了明确的付费渠道
  const paidMediums = ['cpc', 'ppc', 'paid', 'banner', 'email', 'display'];
  const isPaidMedium = paidMediums.some(paidType => 
    medium.toLowerCase().includes(paidType.toLowerCase())
  );
  if (isPaidMedium) {
    return { type: "付费广告", color: "bg-red-100 text-red-800" };
  }
  
  // 步骤 3: 自然搜索 (Organic) - 基于 Referrer 判断
  const searchEngines = ['google.com', 'bing.com', 'baidu.com', 'yahoo.com', 'duckduckgo.com', 'yandex.com'];
  const isFromSearchEngine = searchEngines.some(engine => 
    referrer.toLowerCase().includes(engine)
  );
  // 确保不是付费媒介且来自搜索引擎
  if (isFromSearchEngine && !isPaidMedium && !hasClickId) {
    return { type: "自然搜索", color: "bg-green-100 text-green-800" };
  }
  
  // 步骤 4: 其他渠道 (UTM 标记) - 有明确的 UTM 标记但不是付费广告或自然搜索
  const hasUtmParams = Boolean(source || medium || campaign || content || term);
  if (hasUtmParams) {
    return { type: "其他渠道", color: "bg-gray-100 text-gray-800" };
  }
  
  // 步骤 5: 直接访问 (Direct) - 最低优先级，排除所有其他情况后的默认分类
  // 所有 Click ID 字段均为空，所有 UTM 参数均为空，Referrer 为空或内部页面
  const isInternalReferrer = referrer && (
    referrer.includes('localhost') || 
    referrer.startsWith('/') ||
    referrer === ''
  );
  
  if (!hasClickId && !hasUtmParams && (!referrer || isInternalReferrer)) {
    return { type: "直接访问", color: "bg-blue-100 text-blue-800" };
  }
  
  // 兜底情况：如果有 referrer 但不符合其他条件，归为其他渠道
  return { type: "其他渠道", color: "bg-gray-100 text-gray-800" };
}

// 测试用例
const testCases = [
  {
    name: "步骤1: 付费广告 - Google Ads (gclid)",
    data: { gclid: "abc123" },
    expected: "付费广告"
  },
  {
    name: "步骤1: 付费广告 - Facebook Ads (fbclid)",
    data: { fbclid: "xyz789" },
    expected: "付费广告"
  },
  {
    name: "步骤2: 付费广告 - UTM Medium CPC",
    data: { firstVisitMedium: "cpc", firstVisitSource: "google" },
    expected: "付费广告"
  },
  {
    name: "步骤2: 付费广告 - UTM Medium PPC",
    data: { firstVisitMedium: "ppc", firstVisitSource: "bing" },
    expected: "付费广告"
  },
  {
    name: "步骤3: 自然搜索 - Google Organic",
    data: { firstReferrer: "https://www.google.com/search?q=test" },
    expected: "自然搜索"
  },
  {
    name: "步骤3: 自然搜索 - Baidu Organic",
    data: { firstReferrer: "https://www.baidu.com/s?wd=test" },
    expected: "自然搜索"
  },
  {
    name: "步骤4: 其他渠道 - UTM Source",
    data: { firstVisitSource: "newsletter" },
    expected: "其他渠道"
  },
  {
    name: "步骤4: 其他渠道 - UTM Campaign",
    data: { firstVisitCampaign: "summer_sale" },
    expected: "其他渠道"
  },
  {
    name: "步骤5: 直接访问 - 无参数",
    data: {},
    expected: "直接访问"
  },
  {
    name: "步骤5: 直接访问 - 内部 Referrer",
    data: { firstReferrer: "/internal-page" },
    expected: "直接访问"
  },
  {
    name: "兜底: 其他渠道 - 外部 Referrer",
    data: { firstReferrer: "https://external-site.com" },
    expected: "其他渠道"
  }
];

// 运行测试
console.log("=== 渠道类型判断逻辑测试 ===\n");

testCases.forEach((testCase, index) => {
  const result = getChannelType(testCase.data);
  const passed = result.type === testCase.expected;
  
  console.log(`测试 ${index + 1}: ${testCase.name}`);
  console.log(`输入数据:`, testCase.data);
  console.log(`期望结果: ${testCase.expected}`);
  console.log(`实际结果: ${result.type}`);
  console.log(`测试状态: ${passed ? '✅ 通过' : '❌ 失败'}`);
  console.log('---');
});

export { getChannelType, testCases };