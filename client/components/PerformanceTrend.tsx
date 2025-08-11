import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { type PerformanceMetric } from '@shared/dashboardData';

interface PerformanceTrendProps {
  metrics: PerformanceMetric[];
  dateRange?: string;
}

export default function PerformanceTrend({ metrics, dateRange = '30days' }: PerformanceTrendProps) {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['totalRevenue']); // Default to "总消费金额"


  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

  const getXAxisDataKey = () => {
    if (dateRange === '7days' || dateRange === '30days') {
      return 'label'; // 显示具体日期
    }
    return 'label'; // 默认显示label
  };

  const toggleMetric = (metricId: string) => {
    // 销售额不能被取消选择
    if (metricId === 'revenue') {
      return;
    }

    setSelectedMetrics(prev =>
      prev.includes(metricId)
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  // 定义数据类型分组，相似的数据类型使用同一个Y轴
  const getMetricGroup = (metricId: string) => {
    if (metricId === 'revenue' || metricId === 'net_revenue') return 'revenue'; // 金额类
    if (metricId === 'sales' || metricId === 'orders') return 'count'; // 数量类
    if (metricId === 'avg_price') return 'price'; // 价格类
    return metricId; // 其他独立分组
  };

  // Combine data from all selected metrics
  const chartData = useMemo(() => {
    if (selectedMetrics.length === 0) return [];

    const firstMetric = metrics.find(m => m.id === selectedMetrics[0]);
    if (!firstMetric) return [];

    return firstMetric.data.map((dataPoint, index) => {
      const result: any = {
        label: dataPoint.label,
        date: dataPoint.date
      };

      selectedMetrics.forEach(metricId => {
        const metric = metrics.find(m => m.id === metricId);
        if (metric && metric.data[index]) {
          result[metricId] = metric.data[index].value;
        }
      });

      return result;
    });
  }, [selectedMetrics, metrics]);

  const formatValue = (value: number, metricId: string) => {
    if (metricId === 'revenue' || metricId === 'net_revenue') {
      return `¥${value.toLocaleString()}`;
    }
    if (metricId === 'avg_price') {
      return `¥${value.toFixed(1)}`;
    }
    return value.toLocaleString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => {
            const metric = metrics.find(m => m.id === entry.dataKey);
            return (
              <div key={index} className="flex items-center justify-between gap-3 mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-gray-600">{metric?.label}:</span>
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
        <CardTitle className="text-lg font-semibold text-gray-900">业绩走势</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Metric Selector Cards */}
        <div className="grid grid-cols-5 gap-3">
          {metrics.map((metric, index) => {
            const isSelected = selectedMetrics.includes(metric.id);
            const isRevenue = metric.id === 'revenue';
            const color = colors[index % colors.length];

            return (
              <button
                key={metric.id}
                onClick={() => toggleMetric(metric.id)}
                className={cn(
                  "p-3 rounded-lg text-center border transition-all relative",
                  isSelected
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100",
                  isRevenue && "ring-2 ring-blue-300"
                )}
                disabled={isRevenue && isSelected}
                title={isRevenue ? "销售额为必选指标" : ""}
              >
                {isSelected && (
                  <div
                    className="absolute top-2 left-2 w-3 h-3 rounded"
                    style={{ backgroundColor: color }}
                  />
                )}
                {isRevenue && (
                  <div className="absolute top-2 right-2">
                    <span className="text-xs text-blue-600">★</span>
                  </div>
                )}
                <div className="text-xs text-gray-500 mb-1">{metric.label}</div>
                <div className="text-sm font-semibold">{metric.value}</div>
              </button>
            );
          })}
        </div>

        {/* Multi-Line Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%" margin={{ left: 20, right: 20 }}>
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 80, left: 80, bottom: 20 }}
            >
              <XAxis
                dataKey={getXAxisDataKey()}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                interval="preserveStartEnd"
              />

              {/* Multiple Y-Axes for different metric types */}
              {(() => {
                // 获取唯一的分组
                const groups = [...new Set(selectedMetrics.map(getMetricGroup))];

                return groups.map((group, groupIndex) => {
                  // 找到第一个属于这个分组的指标作为代表
                  const representativeMetricId = selectedMetrics.find(id => getMetricGroup(id) === group);
                  if (!representativeMetricId) return null;

                  const orientation = groupIndex % 2 === 0 ? 'left' : 'right';
                  const yAxisId = group; // 使用分组名作为yAxisId

                  return (
                    <YAxis
                      key={`yAxis-${group}`}
                      yAxisId={yAxisId}
                      orientation={orientation}
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 11,
                        fill: colors[groupIndex % colors.length],
                        dx: orientation === 'left' ? -5 : 5
                      }}
                      tickFormatter={(value) => formatValue(value, representativeMetricId)}
                      width={70}
                    />
                  );
                });
              })()}

              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {selectedMetrics.map((metricId, index) => {
                const metric = metrics.find(m => m.id === metricId);
                if (!metric) return null;

                const group = getMetricGroup(metricId);

                return (
                  <Line
                    key={metricId}
                    yAxisId={group} // 使用分组名
                    type="monotone"
                    dataKey={metricId}
                    name={metric.label}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
