import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { type DistributionData } from '@shared/dashboardData';

interface DonutChartProps {
  title: string;
  data: DistributionData[];
}

export default function DonutChart({ title, data }: DonutChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <div 
              className="w-3 h-3 rounded" 
              style={{ backgroundColor: data.color }}
            ></div>
            <span className="text-sm font-medium text-gray-900">{data.label}</span>
          </div>
          <div className="text-sm text-gray-600">
            数量: {data.value.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">
            占比: {data.percentage}%
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="space-y-2 mt-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-gray-600">{item.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium text-gray-900">{item.value.toLocaleString()}</span>
                <span className="text-gray-500 w-12 text-right">{item.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
