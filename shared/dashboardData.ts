export interface KPIData {
  title: string;
  value: string;
  change: number; // percentage change vs previous period
  isPositive: boolean;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label: string;
}

export interface PerformanceMetric {
  id: string;
  label: string;
  value: string;
  data: ChartDataPoint[];
}

export interface UserCompositionData {
  date: string;
  newUsers: number;
  returningUsers: number;
}

export interface DistributionData {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

export interface TagData {
  label: string;
  count: number;
}

export interface DashboardData {
  kpis: KPIData[];
  performanceMetrics: PerformanceMetric[];
  userComposition: UserCompositionData[];
  geoDistribution: DistributionData[];
  trafficSources: DistributionData[];
  popularTags: TagData[];
}

// Mock data for dashboard
export const mockDashboardData: DashboardData = {
  kpis: [
    {
      title: "总消费���额",
      value: "¥1,254,680",
      change: 5.2,
      isPositive: true
    },
    {
      title: "总订单数",
      value: "8,247",
      change: 12.8,
      isPositive: true
    },
    {
      title: "总用户数",
      value: "3,456",
      change: -2.1,
      isPositive: false
    },
    {
      title: "平均客单价",
      value: "¥152.3",
      change: 8.9,
      isPositive: true
    }
  ],
  performanceMetrics: [
    {
      id: "sales",
      label: "销量",
      value: "15,247",
      data: [
        { date: "2024-01-01", value: 850, label: "1月1日" },
        { date: "2024-01-02", value: 920, label: "1月2日" },
        { date: "2024-01-03", value: 1100, label: "1月3日" },
        { date: "2024-01-04", value: 980, label: "1月4日" },
        { date: "2024-01-05", value: 1200, label: "1月5日" },
        { date: "2024-01-06", value: 1350, label: "1月6日" },
        { date: "2024-01-07", value: 1480, label: "1月7日" },
        { date: "2024-01-08", value: 1320, label: "1月8日" },
        { date: "2024-01-09", value: 1580, label: "1月9日" },
        { date: "2024-01-10", value: 1650, label: "1月10日" }
      ]
    },
    {
      id: "orders",
      label: "订单量",
      value: "8,247",
      data: [
        { date: "2024-01-01", value: 156, label: "1月1日" },
        { date: "2024-01-02", value: 178, label: "1月2日" },
        { date: "2024-01-03", value: 201, label: "1月3日" },
        { date: "2024-01-04", value: 189, label: "1月4日" },
        { date: "2024-01-05", value: 234, label: "1月5日" },
        { date: "2024-01-06", value: 267, label: "1月6日" },
        { date: "2024-01-07", value: 298, label: "1月7日" },
        { date: "2024-01-08", value: 276, label: "1月8日" },
        { date: "2024-01-09", value: 312, label: "1月9日" },
        { date: "2024-01-10", value: 328, label: "1月10日" }
      ]
    },
    {
      id: "revenue",
      label: "销售额",
      value: "¥1,254,680",
      data: [
        { date: "2024-01-01", value: 45680, label: "1月1日" },
        { date: "2024-01-02", value: 52350, label: "1月2日" },
        { date: "2024-01-03", value: 61200, label: "1月3日" },
        { date: "2024-01-04", value: 58900, label: "1月4日" },
        { date: "2024-01-05", value: 67800, label: "1月5日" },
        { date: "2024-01-06", value: 74250, label: "1月6日" },
        { date: "2024-01-07", value: 82100, label: "1月7日" },
        { date: "2024-01-08", value: 76400, label: "1月8日" },
        { date: "2024-01-09", value: 89500, label: "1月9日" },
        { date: "2024-01-10", value: 94800, label: "1月10日" }
      ]
    },
    {
      id: "net_revenue",
      label: "净销售额",
      value: "¥1,128,456",
      data: [
        { date: "2024-01-01", value: 41120, label: "1月1日" },
        { date: "2024-01-02", value: 47115, label: "1月2日" },
        { date: "2024-01-03", value: 55080, label: "1月3日" },
        { date: "2024-01-04", value: 53010, label: "1月4日" },
        { date: "2024-01-05", value: 61020, label: "1月5日" },
        { date: "2024-01-06", value: 66825, label: "1月6日" },
        { date: "2024-01-07", value: 73890, label: "1月7日" },
        { date: "2024-01-08", value: 68760, label: "1月8日" },
        { date: "2024-01-09", value: 80550, label: "1月9日" },
        { date: "2024-01-10", value: 85320, label: "1月10日" }
      ]
    },
    {
      id: "avg_price",
      label: "平均价格",
      value: "¥152.3",
      data: [
        { date: "2024-01-01", value: 148.2, label: "1月1日" },
        { date: "2024-01-02", value: 151.8, label: "1月2日" },
        { date: "2024-01-03", value: 154.6, label: "1月3日" },
        { date: "2024-01-04", value: 149.7, label: "1月4日" },
        { date: "2024-01-05", value: 156.3, label: "1月5日" },
        { date: "2024-01-06", value: 158.9, label: "1月6日" },
        { date: "2024-01-07", value: 162.1, label: "1月7日" },
        { date: "2024-01-08", value: 155.4, label: "1月8日" },
        { date: "2024-01-09", value: 159.8, label: "1月9日" },
        { date: "2024-01-10", value: 163.5, label: "1月10日" }
      ]
    }
  ],
  userComposition: [
    { date: "周一", newUsers: 450, returningUsers: 890 },
    { date: "周二", newUsers: 520, returningUsers: 1100 },
    { date: "周三", newUsers: 380, returningUsers: 950 },
    { date: "周四", newUsers: 620, returningUsers: 1200 },
    { date: "周五", newUsers: 720, returningUsers: 1350 },
    { date: "周六", newUsers: 680, returningUsers: 980 },
    { date: "周日", newUsers: 580, returningUsers: 870 }
  ],
  geoDistribution: [
    { label: "北京", value: 1256, percentage: 36.3, color: "#3b82f6" },
    { label: "上海", value: 896, percentage: 25.9, color: "#06b6d4" },
    { label: "深圳", value: 654, percentage: 18.9, color: "#8b5cf6" },
    { label: "杭州", value: 432, percentage: 12.5, color: "#10b981" },
    { label: "其他", value: 218, percentage: 6.3, color: "#6b7280" }
  ],
  trafficSources: [
    { label: "直接访问", value: 2140, percentage: 45.2, color: "#3b82f6" },
    { label: "搜索引擎", value: 1320, percentage: 27.8, color: "#06b6d4" },
    { label: "社交媒体", value: 680, percentage: 14.3, color: "#8b5cf6" },
    { label: "邮件营销", value: 380, percentage: 8.0, color: "#10b981" },
    { label: "其他", value: 220, percentage: 4.6, color: "#6b7280" }
  ],
  popularTags: [
    { label: "VIP客户", count: 856 },
    { label: "企业用户", count: 643 },
    { label: "高价值用户", count: 421 },
    { label: "长期合作", count: 298 },
    { label: "技术导向", count: 187 }
  ]
};

export const getDashboardData = () => mockDashboardData;
