import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { type PerformanceMetric } from '@shared/dashboardData';

interface PerformanceTrendProps {
  metrics: PerformanceMetric[];
}

export default function PerformanceTrend({ metrics }: PerformanceTrendProps) {
  const [selectedMetric, setSelectedMetric] = useState(metrics[2]); // Default to "销售额"
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

  const getXAxisDataKey = () => {
    if (dateRange === '7days' || dateRange === '30days') {
      return 'label'; // 显示具体日期
    }
    return 'label'; // 默认显示label
  };

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
      const data = payload[0];
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-sm font-medium text-gray-900">
            {formatValue(data.value, selectedMetric.id)}
          </p>
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
          {metrics.map((metric) => (
            <button
              key={metric.id}
              onClick={() => setSelectedMetric(metric)}
              className={cn(
                "p-3 rounded-lg text-center border transition-all",
                selectedMetric.id === metric.id
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
              )}
            >
              <div className="text-xs text-gray-500 mb-1">{metric.label}</div>
              <div className="text-sm font-semibold">{metric.value}</div>
            </button>
          ))}
        </div>

        {/* Area Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={selectedMetric.data}>
              <defs>
                <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis
                dataKey={getXAxisDataKey()}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(value) => formatValue(value, selectedMetric.id)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorArea)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
