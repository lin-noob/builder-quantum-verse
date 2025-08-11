import { useState, useEffect, useRef } from 'react';
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
      setIsDatePickerOpen(true);
      // Don't change globalDateRange yet, wait for user to apply custom dates
    } else {
      setGlobalDateRange(value);
      setIsDatePickerOpen(false);
    }
  };

  // Apply custom date range
  const applyCustomDateRange = () => {
    if (customStartDate && customEndDate) {
      setGlobalDateRange('custom');
      setIsDatePickerOpen(false);
      // Here you would typically trigger data refresh with custom date range
      console.log('Applying custom date range:', customStartDate, 'to', customEndDate);
    }
  };

  // Cancel custom date selection
  const cancelCustomDateRange = () => {
    setIsDatePickerOpen(false);
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
          <div className="relative">
            <button
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="flex items-center justify-between gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[200px]"
            >
              <span className="text-sm text-gray-900">{getCurrentDateRangeText()}</span>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isDatePickerOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDatePickerOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="p-2">
                  {/* Preset Options */}
                  <div className="space-y-1 mb-3">
                    {dateRangeOptions.filter(opt => opt.value !== 'custom').map(option => (
                      <button
                        key={option.value}
                        onClick={() => handleDateRangeChange(option.value)}
                        className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                          globalDateRange === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                    <button
                      onClick={() => handleDateRangeChange('custom')}
                      className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                        globalDateRange === 'custom' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      自定义日期
                    </button>
                  </div>

                  {/* Custom Date Range Section */}
                  {globalDateRange === 'custom' && (
                    <div className="border-t border-gray-200 pt-3 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                        <Calendar className="h-3 w-3" />
                        自定义日期范围
                      </div>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">开始日期</label>
                          <Input
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            className="w-full text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">结束日期</label>
                          <Input
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            className="w-full text-xs"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelCustomDateRange}
                          className="text-xs"
                        >
                          取消
                        </Button>
                        <Button
                          size="sm"
                          onClick={applyCustomDateRange}
                          disabled={!customStartDate || !customEndDate}
                          className="text-xs"
                        >
                          应用
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
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
