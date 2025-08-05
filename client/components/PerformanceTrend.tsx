import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { type PerformanceMetric } from '@shared/dashboardData';

interface PerformanceTrendProps {
  metrics: PerformanceMetric[];
}

export default function PerformanceTrend({ metrics }: PerformanceTrendProps) {
  const [selectedMetric, setSelectedMetric] = useState(metrics[2]); // Default to "销售额"

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
        <CardTitle className="text-lg font-semibold text-gray-900">业绩走势</CardTitle>
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
                dataKey="label" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
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
