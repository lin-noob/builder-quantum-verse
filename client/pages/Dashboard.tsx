import { useState, useEffect } from "react";
import { getDashboardData, type TagData } from "@shared/dashboardData";
import KPICard from "@/components/KPICard";
import PerformanceTrend from "@/components/PerformanceTrend";
import TagChart from "@/components/TagChart";
import AdvancedDateRangePicker from "@/components/AdvancedDateRangePicker";
import { request } from "@/lib/request";

interface DateRange {
  start: Date | null;
  end: Date | null;
}

export default function Dashboard() {
  const { performanceMetrics } = getDashboardData();

  // Date range state for the advanced picker
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(2025, 6, 12), // July 12, 2025
    end: new Date(2025, 7, 10), // August 10, 2025
  });
  const [currentPreset, setCurrentPreset] = useState("last30days");

  // 热门标签数据（使用接口返回）
  const [hotTags, setHotTags] = useState<TagData[]>([]);
  // 概览KPI（使用接口返回）
  const [overviewKpis, setOverviewKpis] = useState<
    Array<{ title: string; value: string }>
  >([]);

  useEffect(() => {
    // Skip API calls in development mode to avoid fetch errors
    if (process.env.NODE_ENV === "development") {
      console.log("开发模式：跳过热门标签 API 调用");
      setHotTags([]);
      return;
    }

    (async () => {
      try {
        const res = await request.get("/quote/api/v1/dashboard/hot");
        console.log("热门标签 API 返回:", res);
        const list = Array.isArray(res?.data) ? res.data : [];
        const mapped: TagData[] = list.slice(0, 5).map((item: any) => ({
          label: item?.labelName ?? "",
          count: Number(item?.count ?? 0),
        }));
        setHotTags(mapped);
      } catch (e) {
        console.error("热门标签 API 调用失败:", e);
        setHotTags([]);
      }
    })();
  }, []);

  useEffect(() => {
    if (!dateRange.start || !dateRange.end) return;

    // Skip API calls in development mode to avoid fetch errors
    if (process.env.NODE_ENV === "development") {
      console.log("开发模式：跳过数据概览 API 调用");
      setOverviewKpis([]);
      return;
    }

    const startDate = dateRange.start.toISOString();
    const endDate = dateRange.end.toISOString();
    (async () => {
      try {
        const res = await request.request("/quote/api/v1/dashboard/overview", {
          method: "POST",
          data: {
            startDate,
            endDate,
          },
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log("数据概览 API 返回:", res);
        const data = res?.data || {};
        const currency = data?.currency ?? "";
        const fmtMoney = (n: number) =>
          `${currency}${Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        const fmtInt = (n: number) => `${Number(n ?? 0).toLocaleString()}`;
        setOverviewKpis([
          { title: "总消费金额", value: fmtMoney(data.totalPrice) },
          { title: "总订单数", value: fmtInt(data.orderNum) },
          { title: "总用户数", value: fmtInt(data.userNum) },
          { title: "平均客单价", value: fmtMoney(data.avgPrice) },
        ]);
      } catch (e) {
        console.error("数据概览 API 调用失败:", e);
        setOverviewKpis([]);
      }
    })();
  }, [dateRange.start, dateRange.end]);

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    console.log("Date range changed:", range);
  };

  const handlePresetChange = (preset: string) => {
    setCurrentPreset(preset);
    console.log("Preset changed:", preset);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* Page Header with Global Date Selector */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">数据概览</h1>
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

      {/* First Row: KPI Cards (仅使用接口数据) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewKpis.map((kpi, index) => (
          <KPICard
            key={index}
            title={kpi.title}
            value={kpi.value}
            change={0}
            isPositive={true}
          />
        ))}
      </div>

      {/* Test Chart */}
      <SimpleChart />

      {/* Second Row: Performance Trend (仍使用本地 mock 数据) */}
      <div className="w-full">
        <PerformanceTrend
          metrics={performanceMetrics}
          dateRange={currentPreset}
        />
      </div>

      {/* Third Row: Charts (热门标签仅使用接口数据) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TagChart data={hotTags} />
        {/* Placeholder for future content */}
      </div>
    </div>
  );
}
