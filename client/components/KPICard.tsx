import { Card, CardContent } from '@/components/ui/card';

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  isPositive: boolean;
}

export default function KPICard({ title, value }: KPICardProps) {
  return (
    <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-3">
          {/* Title */}
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>

          {/* Main Value */}
          <div className="text-3xl font-bold text-gray-900">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
