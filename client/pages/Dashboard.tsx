import { useState } from 'react';
import { getDashboardData } from '@shared/dashboardData';
import KPICard from '@/components/KPICard';
import PerformanceTrend from '@/components/PerformanceTrend';
import DonutChart from '@/components/DonutChart';
import TagChart from '@/components/TagChart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, ChevronDown } from 'lucide-react';

export default function Dashboard() {
  const dashboardData = getDashboardData();

  // Global date range state
  const [globalDateRange, setGlobalDateRange] = useState('30days');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
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
    if (value === 'custom') {
      setIsCustomDateDialogOpen(true);
      // Don't change globalDateRange yet, wait for user to apply custom dates
    } else {
      setGlobalDateRange(value);
    }
  };

  // Apply custom date range
  const applyCustomDateRange = () => {
    if (customStartDate && customEndDate) {
      setGlobalDateRange('custom');
      setIsCustomDateDialogOpen(false);
      // Here you would typically trigger data refresh with custom date range
      console.log('Applying custom date range:', customStartDate, 'to', customEndDate);
    }
  };

  // Cancel custom date selection
  const cancelCustomDateRange = () => {
    setIsCustomDateDialogOpen(false);
    // Reset to previous selection if no custom dates were applied
    if (globalDateRange === 'custom' && (!customStartDate || !customEndDate)) {
      setGlobalDateRange('30days');
    }
  };

  // Get current date range display text for select
  const getCurrentDateRangeText = () => {
    if (globalDateRange === 'custom' && customStartDate && customEndDate) {
      return `${customStartDate} 至 ${customEndDate}`;
    }
    const option = dateRangeOptions.find(opt => opt.value === globalDateRange);
    return option?.label || '过去30天';
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* Page Header with Global Date Selector */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">数据概览</h1>
        </div>
        <div className="flex items-center gap-4">
          {/* Global Date Range Selector */}
          <div className="w-48">
            <Select value={globalDateRange} onValueChange={handleDateRangeChange}>
              <SelectTrigger>
                <SelectValue placeholder="选择时间范围">
                  {getCurrentDateRangeText()}
                </SelectValue>
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

      {/* Custom Date Range Dialog */}
      <Dialog open={isCustomDateDialogOpen} onOpenChange={setIsCustomDateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>选择自定义日期范围</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">请选择开始和结束日期</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">开始日期</label>
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">结束日期</label>
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={cancelCustomDateRange}
              >
                取消
              </Button>
              <Button
                onClick={applyCustomDateRange}
                disabled={!customStartDate || !customEndDate}
              >
                应用
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

    </div>
  );
}
