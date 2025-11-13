import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import KPICard from "@/components/KPICard";
import TagChart from "@/components/TagChart";
import DonutChart from "@/components/DonutChart";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getDashboardData, type TagData } from "@shared/dashboardData";

export default function EmailAnalytics() {
  const { campaignId } = useParams();

  // 简化：复用仪表盘的标签数据作为“点击热门链接/主题词”示意
  const tags: TagData[] = useMemo(() => getDashboardData().popularTags, []);
  const dashboard = useMemo(() => getDashboardData(), []);

  // 模拟活动数据（与列表页对齐显示名称与状态）
  const mockCampaigns = {
    cmp_001: { name: "双十一预热邮件", status: "draft", updatedAt: "2025-11-05 14:22" },
    cmp_002: { name: "新品上架通知", status: "scheduled", updatedAt: "2025-11-06 09:10" },
    cmp_003: { name: "老客回访优惠券", status: "sent", updatedAt: "2025-11-01 18:30" },
  } as const;
  const statusLabel: Record<"draft" | "scheduled" | "sent", string> = {
    draft: "草稿",
    scheduled: "已排期",
    sent: "已发送",
  };
  const campaign = campaignId && (mockCampaigns as any)[campaignId];

  // KPI 示例：可接入真实数据源（使用数字并格式化）
  const kpi = {
    sent: 15600,
    opened: 8420,
    clicked: 2135,
    converted: 326,
    unsubscribed: 178,
    bounced: 92,
  };
  const rate = {
    openRate: Math.round((kpi.opened / kpi.sent) * 1000) / 10,
    clickRate: Math.round((kpi.clicked / kpi.sent) * 1000) / 10,
    convertRate: Math.round((kpi.converted / kpi.sent) * 1000) / 10,
    unsubscribeRate: Math.round((kpi.unsubscribed / kpi.sent) * 1000) / 10,
    bounceRate: Math.round((kpi.bounced / kpi.sent) * 1000) / 10,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link to="/ai-marketing/email-campaigns" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> 返回列表
            </Link>
          </Button>
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold">活动分析 #{campaignId}</h1>
            {campaign && (
              <div className="text-sm text-muted-foreground">
                {campaign.name} · {statusLabel[campaign.status as keyof typeof statusLabel]} · 更新于 {campaign.updatedAt}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <KPICard title="发送总量" value={kpi.sent.toLocaleString()} change={0} isPositive={true} />
        <KPICard title="打开数" value={kpi.opened.toLocaleString()} change={0} isPositive={true} />
        <KPICard title="点击数" value={kpi.clicked.toLocaleString()} change={0} isPositive={true} />
        <KPICard title="转化数" value={kpi.converted.toLocaleString()} change={0} isPositive={true} />
        <KPICard title="退订数" value={kpi.unsubscribed.toLocaleString()} change={0} isPositive={false} />
        <KPICard title="退回数" value={kpi.bounced.toLocaleString()} change={0} isPositive={false} />
      </div>

      {/* Rates */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <KPICard title="打开率" value={`${rate.openRate}%`} change={0} isPositive={true} />
        <KPICard title="点击率" value={`${rate.clickRate}%`} change={0} isPositive={true} />
        <KPICard title="转化率" value={`${rate.convertRate}%`} change={0} isPositive={true} />
        <KPICard title="退订率" value={`${rate.unsubscribeRate}%`} change={0} isPositive={false} />
        <KPICard title="跳出率" value={`${rate.bounceRate}%`} change={0} isPositive={false} />
      </div>

      {/* 热门标签与占比图表 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TagChart data={tags} />
        <DonutChart title="来源渠道构成" data={dashboard.trafficSources} />
        <DonutChart title="地域分布占比" data={dashboard.geoDistribution} />
      </div>

      {/* 明细表占位 */}
      <Card>
        <CardHeader>
          <CardTitle>用户行为明细（示意）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">后续可补充打开时间、点击链接、转化事件等明细数据表。</div>
        </CardContent>
      </Card>
    </div>
  );
}