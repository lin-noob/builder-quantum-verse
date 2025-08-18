import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { type UserCompositionData } from '@shared/dashboardData';

interface UserCompositionProps {
  data: UserCompositionData[];
}

export default function UserComposition({ data }: UserCompositionProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const newUsers = payload.find((p: any) => p.dataKey === 'newUsers')?.value || 0;
      const returningUsers = payload.find((p: any) => p.dataKey === 'returningUsers')?.value || 0;
      const total = newUsers + returningUsers;
      
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 bg-blue-500 rounded"></div>
              <span className="text-gray-600">新访客:</span>
              <span className="font-medium">{newUsers.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 bg-blue-300 rounded"></div>
              <span className="text-gray-600">回访客:</span>
              <span className="font-medium">{returningUsers.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-xs pt-1 border-t border-gray-100">
              <span className="text-gray-600">总计:</span>
              <span className="font-medium">{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">活跃用户构成</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap="25%">
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                hide={false}
                tickCount={5}
                minTickGap={5}
                mirror={false}
                reversed={false}
                includeHidden={false}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(value) => value.toLocaleString()}
                hide={false}
                tickCount={5}
                minTickGap={5}
                mirror={false}
                reversed={false}
                includeHidden={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="returningUsers" 
                stackId="users" 
                fill="#93c5fd" 
                radius={[0, 0, 0, 0]}
              />
              <Bar 
                dataKey="newUsers" 
                stackId="users" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">新访客</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-300 rounded"></div>
            <span className="text-sm text-gray-600">回访客</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
