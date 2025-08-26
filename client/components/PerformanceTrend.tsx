import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { type PerformanceMetric } from "@shared/dashboardData";

interface PerformanceTrendProps {
  metrics: PerformanceMetric[];
  dateRange?: string;
}

// 🚀 优化的PerformanceTrend组件 - 移除性能瓶颈
const PerformanceTrend: React.FC<PerformanceTrendProps> = ({
  metrics,
  dateRange = "30days",
}) => {
  // 🎯 单一useMemo优化 - 避免重复计算和多次依赖更新
  const { selectedMetrics, chartData } = useMemo(() => {
    // 构建指标映射，避免重复查找 O(1)查找性能
    const metricMap = new Map(metrics.map(m => [m.id, m]));

    // 过滤可用的指标
    const defaultMetrics = ["totalRevenue", "totalOrders", "totalUsers", "avgOrderValue"];
    const availableMetrics = defaultMetrics.filter(id => metricMap.has(id));

    // 如果没有可用指标，返回空数据
    if (availableMetrics.length === 0) {
      return { selectedMetrics: availableMetrics, chartData: [] };
    }

    // 获取第一个指标的数据长度作为基准
    const firstMetric = metricMap.get(availableMetrics[0]);
    if (!firstMetric?.data) {
      return { selectedMetrics: availableMetrics, chartData: [] };
    }

    // 高效数据组装 - 单次遍历，使用Map直接查找
    const data = firstMetric.data.map((dataPoint, index) => {
      const point: any = {
        label: dataPoint.label,
        date: dataPoint.date
      };

      // 使用Map直接查找，避免重复find操作
      for (const metricId of availableMetrics) {
        const metric = metricMap.get(metricId);
        if (metric?.data?.[index]) {
          point[metricId] = metric.data[index].value;
        }
      }

      return point;
    });

    return { selectedMetrics: availableMetrics, chartData: data };
  }, [metrics]); // 仅依赖metrics，避免其他不必要的重计算

  console.log("Available metrics:", availableMetricIds);
  console.log("Selected metrics:", selectedMetrics);

  const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];

  const getXAxisDataKey = () => {
    if (dateRange === "7days" || dateRange === "30days") {
      return "label"; // 显示具体日期
    }
    return "label"; // 默认显示label
  };

  // 定义数据类型分组，相似的数据类型使用同一个Y轴
  const getMetricGroup = (metricId: string) => {
    if (metricId === "totalRevenue" || metricId === "avgOrderValue")
      return "revenue"; // 金额类
    if (metricId === "totalOrders" || metricId === "totalUsers") return "count"; // 数量类
    return metricId; // 其他独立分组
  };

  // Combine data from all selected metrics
  const chartData = useMemo(() => {
    console.log("=== Chart Data Generation ===");
    console.log("metrics:", metrics);
    console.log("selectedMetrics:", selectedMetrics);

    if (!metrics || metrics.length === 0) {
      console.log("No metrics available");
      return [];
    }

    if (selectedMetrics.length === 0) {
      console.log("No selected metrics, returning empty array");
      return [];
    }

    const firstMetric = metrics.find((m) => m.id === selectedMetrics[0]);
    if (!firstMetric || !firstMetric.data) {
      console.log("First metric not found or has no data:", selectedMetrics[0]);
      return [];
    }

    console.log("First metric data length:", firstMetric.data.length);

    const result = firstMetric.data.map((dataPoint, index) => {
      const resultPoint: any = {
        label: dataPoint.label,
        date: dataPoint.date,
      };

      selectedMetrics.forEach((metricId) => {
        const metric = metrics.find((m) => m.id === metricId);
        if (metric && metric.data && metric.data[index]) {
          resultPoint[metricId] = metric.data[index].value;
        }
      });

      return resultPoint;
    });

    console.log("Generated chart data length:", result.length);
    console.log("First data point:", result[0]);
    return result;
  }, [metrics, selectedMetrics]);

  // 🎯 优化的格式化函数
  const formatValue = (value: number, metricId: string) => {
    if (metricId === "totalRevenue") {
      return `¥${value.toLocaleString()}`;
    }
    if (metricId === "avgOrderValue") {
      return `¥${value.toFixed(2)}`;
    }
    if (metricId === "totalOrders") {
      return `${value.toLocaleString()} 单`;
    }
    if (metricId === "totalUsers") {
      return `${value.toLocaleString()} 人`;
    }
    return value.toLocaleString();
  };

  // 🎨 优化的图表颜色配置
  const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"];

  // 📊 优化的时间轴配置
  const getXAxisDataKey = () => {
    switch (dateRange) {
      case "7days":
      case "30days":
        return "date";
      case "3months":
      case "6months":
      case "1year":
        return "label";
      default:
        return "label";
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => {
            const metric = metrics.find((m) => m.id === entry.dataKey);
            return (
              <div
                key={index}
                className="flex items-center justify-between gap-3 mb-1"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-gray-600">
                    {metric?.label}:
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatValue(entry.value, entry.dataKey)}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          业绩走��
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Multi-Line Chart */}
        <div className="h-80 w-full">
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-muted-foreground">暂无数据</p>
                <p className="text-xs text-muted-foreground mt-1">
                  选中指标: {selectedMetrics.join(", ") || "无"}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-72 recharts-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                  syncId="performanceChart"
                >
                  <XAxis
                    dataKey={getXAxisDataKey()}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    interval="preserveStartEnd"
                    type="category"
                    allowDataOverflow={false}
                  />

                  {/* 左Y轴：金额类数据 (totalRevenue, avgOrderValue) */}
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#3b82f6" }}
                    type="number"
                    allowDataOverflow={false}
                    tickFormatter={(value) => {
                      if (value >= 1000000) {
                        return `¥${(value / 1000000).toFixed(1)}M`;
                      } else if (value >= 1000) {
                        return `¥${(value / 1000).toFixed(1)}K`;
                      }
                      return `¥${value}`;
                    }}
                  />

                  {/* 右Y轴：数量类数据 (totalOrders, totalUsers) */}
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#ef4444" }}
                    type="number"
                    allowDataOverflow={false}
                    tickFormatter={(value) => {
                      if (value >= 1000) {
                        return `${(value / 1000).toFixed(1)}K`;
                      }
                      return value.toString();
                    }}
                  />

                  <Tooltip content={<CustomTooltip />} />
                  <Legend />

                  {selectedMetrics.map((metricId, index) => {
                    const metric = metrics.find((m) => m.id === metricId);
                    if (!metric) return null;

                    // 根据���标类型选择Y轴
                    const yAxisId = (metricId === 'totalRevenue' || metricId === 'avgOrderValue')
                      ? 'left'
                      : 'right';

                    return (
                      <Line
                        key={metricId}
                        yAxisId={yAxisId}
                        type="monotone"
                        dataKey={metricId}
                        name={metric.label}
                        stroke={colors[index % colors.length]}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                        connectNulls={false}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
