import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getDashboardData } from '@shared/dashboardData';
import KPICard from '@/components/KPICard';
import PerformanceTrend from '@/components/PerformanceTrend';
import UserComposition from '@/components/UserComposition';
import DonutChart from '@/components/DonutChart';
import TagChart from '@/components/TagChart';

export default function Dashboard() {
  const [dateRange, setDateRange] = useState('30days');
  const dashboardData = getDashboardData();

  const dateRangeOptions = [
    { value: '7days', label: '过去7天' },
    { value: '30days', label: '过去30天' },
    { value: 'current_month', label: '本月' },
    { value: 'last_month', label: '上月' }
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">仪表盘</h1>
          <p className="text-gray-600">核心业务数据与客户洞察总览。</p>
        </div>
        
        {/* Date Range Filter */}
        <div className="w-48">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger>
              <SelectValue placeholder="选择时间范围" />
            </SelectTrigger>
            <SelectContent>
              {dateRangeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

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

      {/* Second Row: Performance Trend & User Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <PerformanceTrend metrics={dashboardData.performanceMetrics} />
        </div>
        <div className="lg:col-span-2">
          <UserComposition data={dashboardData.userComposition} />
        </div>
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
