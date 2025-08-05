import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { type PerformanceMetric } from '@shared/dashboardData';

interface PerformanceTrendProps {
  metrics: PerformanceMetric[];
}

export default function PerformanceTrend({ metrics }: PerformanceTrendProps) {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([metrics[2].id]); // Default to "销售额"
  const [dateRange, setDateRange] = useState('30days');
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
    setDateRange(value);
    if (value === 'custom') {
      setShowCustomDate(true);
    } else {
      setShowCustomDate(false);
    }
  };

  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

  const getXAxisDataKey = () => {
    if (dateRange === '7days' || dateRange === '30days') {
      return 'label'; // 显示具体日期
    }
    return 'label'; // 默认显示label
  };

  const toggleMetric = (metricId: string) => {
    setSelectedMetrics(prev =>
      prev.includes(metricId)
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
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
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">业绩走势</CardTitle>
          <div className="flex items-center gap-4">
            {/* Date Range Filter */}
            <div className="w-48">
              <Select value={dateRange} onValueChange={handleDateRangeChange}>
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
          <div className="flex items-center gap-3 mt-4 p-4 bg-gray-50 rounded-lg">
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
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Metric Selector Cards */}
        <div className="grid grid-cols-5 gap-3">
          {metrics.map((metric, index) => {
            const isSelected = selectedMetrics.includes(metric.id);
            const color = colors[index % colors.length];

            return (
              <button
                key={metric.id}
                onClick={() => toggleMetric(metric.id)}
                className={cn(
                  "p-3 rounded-lg text-center border transition-all relative",
                  isSelected
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                )}
              >
                {isSelected && (
                  <div
                    className="absolute top-2 left-2 w-3 h-3 rounded"
                    style={{ backgroundColor: color }}
                  />
                )}
                <div className="text-xs text-gray-500 mb-1">{metric.label}</div>
                <div className="text-sm font-semibold">{metric.value}</div>
              </button>
            );
          })}
        </div>

        {/* Multi-Line Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey={getXAxisDataKey()}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                interval="preserveStartEnd"
              />

              {/* Multiple Y-Axes for different metric types */}
              {selectedMetrics.map((metricId, index) => {
                const isFirst = index === 0;
                const metric = metrics.find(m => m.id === metricId);
                if (!metric) return null;

                return (
                  <YAxis
                    key={`yAxis-${metricId}`}
                    yAxisId={metricId}
                    orientation={index % 2 === 0 ? 'left' : 'right'}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: colors[index % colors.length] }}
                    tickFormatter={(value) => formatValue(value, metricId)}
                    hide={selectedMetrics.length === 1 ? false : !isFirst}
                  />
                );
              })}

              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {selectedMetrics.map((metricId, index) => {
                const metric = metrics.find(m => m.id === metricId);
                if (!metric) return null;

                return (
                  <Line
                    key={metricId}
                    yAxisId={metricId}
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
