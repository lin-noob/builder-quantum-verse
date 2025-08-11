import { useState } from 'react';
import { getDashboardData } from '@shared/dashboardData';
import KPICard from '@/components/KPICard';
import PerformanceTrend from '@/components/PerformanceTrend';
import TagChart from '@/components/TagChart';
import AdvancedDateRangePicker from '@/components/AdvancedDateRangePicker';

interface DateRange {
  start: Date | null;
  end: Date | null;
}

export default function Dashboard2() {
  const dashboardData = getDashboardData();

  // Date range state for the advanced picker
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(2025, 6, 12), // July 12, 2025
    end: new Date(2025, 7, 10)    // August 10, 2025
  });
  const [currentPreset, setCurrentPreset] = useState('last30days');

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    // Here you would typically trigger data refresh with new date range
    console.log('Date range changed:', range);
  };

  const handlePresetChange = (preset: string) => {
    setCurrentPreset(preset);
    console.log('Preset changed:', preset);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* Page Header with Global Date Selector */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">数据概览 2.0</h1>
        </div>
        <div className="flex items-center gap-4">
          {/* Advanced Date Range Picker */}
          <AdvancedDateRangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            onPresetChange={handlePresetChange}
          />
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
          dateRange={currentPreset}
        />
      </div>

      {/* Third Row: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TagChart data={dashboardData.popularTags} />
        {/* Placeholder for future content */}
      </div>

    </div>
  );
}
