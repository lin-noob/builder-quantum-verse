import { useState } from 'react';
import { getDashboardData } from '@shared/dashboardData';
import KPICard from '@/components/KPICard';
import PerformanceTrend from '@/components/PerformanceTrend';
import DonutChart from '@/components/DonutChart';
import TagChart from '@/components/TagChart';

export default function Dashboard() {
  const dashboardData = getDashboardData();

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* First Row: KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardData.kpis.map((kpi, index) => (
          <KPICard
            key={index}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            isPositive={kpi.isPositive}
          />
        ))}
      </div>

      {/* Second Row: Performance Trend (Full Width) */}
      <div className="w-full">
        <PerformanceTrend metrics={dashboardData.performanceMetrics} />
      </div>

      {/* Third Row: Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DonutChart
          title="用户地域分布"
          data={dashboardData.geoDistribution}
        />
        <DonutChart
          title="访问来源分布"
          data={dashboardData.trafficSources}
        />
        <TagChart data={dashboardData.popularTags} />
      </div>
    </div>
  );
}
