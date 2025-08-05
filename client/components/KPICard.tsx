import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  isPositive: boolean;
}

export default function KPICard({ title, value, change, isPositive }: KPICardProps) {
  return (
    <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-3">
          {/* Title */}
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          
          {/* Main Value */}
          <div className="text-3xl font-bold text-gray-900">{value}</div>
          
          {/* Change Indicator */}
          <div className={cn(
            "flex items-center gap-1 text-sm",
            isPositive ? "text-green-600" : "text-red-600"
          )}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span className="font-medium">
              {isPositive ? '+' : ''}{change.toFixed(1)}% vs 上期
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
