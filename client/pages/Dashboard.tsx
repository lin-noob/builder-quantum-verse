import { useState } from 'react';
import { getDashboardData } from '@shared/dashboardData';
import KPICard from '@/components/KPICard';
import PerformanceTrend from '@/components/PerformanceTrend';
import DonutChart from '@/components/DonutChart';
import TagChart from '@/components/TagChart';
import RecentActivities from '@/components/RecentActivities';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';

export default function Dashboard() {
  const dashboardData = getDashboardData();

  // Global date range state
  const [globalDateRange, setGlobalDateRange] = useState('30days');
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const dateRangeOptions = [
    { value: '7days', label: '过去7天' },
    { value: '30days', label: '过去30天' },
    { value: 'current_month', label: '本月' },
    { value: 'last_month', label: '上月' },
    { value: 'custom', label: '自定义日期' }
  ];

  const handleDateRangeChange = (value: string) => {
    setGlobalDateRange(value);
    if (value === 'custom') {
      setShowCustomDate(true);
    } else {
      setShowCustomDate(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* Page Header with Global Date Selector */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">数据概览</h1>
        <div className="flex items-center gap-4">
          {/* Global Date Range Selector */}
          <div className="w-48">
            <Select value={globalDateRange} onValueChange={handleDateRangeChange}>
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
      </div>

      {/* Custom Date Range */}
      {showCustomDate && (
        <div className="flex items-center gap-3 mb-6 p-4 bg-white rounded-lg border border-gray-200">
          <Calendar className="h-4 w-4 text-gray-500" />
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="w-auto"
            />
            <span className="text-gray-500">至</span>
            <Input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="w-auto"
            />
            <Button size="sm" variant="outline">
              应用
            </Button>
          </div>
        </div>
      )}

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
        <PerformanceTrend
          metrics={dashboardData.performanceMetrics}
          dateRange={globalDateRange}
        />
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

      {/* Fourth Row: Recent Activities */}
      <div className="w-full">
        <RecentActivities />
      </div>
    </div>
  );
}
