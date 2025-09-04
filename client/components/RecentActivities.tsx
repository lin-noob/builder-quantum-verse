import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getRecentActivities, type RecentActivity } from '@shared/recentActivities';

const getActivityBadgeColor = (type: RecentActivity['type']) => {
  switch (type) {
    case 'order':
      return 'bg-green-100 text-green-800';
    case 'user':
      return 'bg-blue-100 text-blue-800';
    case 'payment':
      return 'bg-yellow-100 text-yellow-800';
    case 'support':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function RecentActivities() {
  const activities = getRecentActivities();

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">近期关键动态</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">
                  {activity.icon}
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.userName}</span>{' '}
                      <span className="text-gray-600">{activity.description}</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getActivityBadgeColor(activity.type)}`}
                      >
                        {activity.type === 'order' && '订单'}
                        {activity.type === 'user' && '新用户'}
                        {activity.type === 'payment' && '支付'}
                        {activity.type === 'support' && '支持'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="text-xs text-gray-500">{activity.relativeTime}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* View More */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            查看更多动态 →
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
