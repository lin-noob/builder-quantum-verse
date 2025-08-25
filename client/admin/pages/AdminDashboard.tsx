import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Settings, 
  Database, 
  Shield, 
  BarChart3, 
  Bot,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

export default function AdminDashboard() {
  // 模拟系统状态数据
  const systemStats = {
    totalUsers: 1248,
    activeScenarios: 15,
    aiModelsRunning: 8,
    systemHealth: 'healthy',
    todayConversions: 342,
    errorRate: 0.02
  };

  const recentActivities = [
    {
      id: 1,
      action: '新增营销场景',
      target: '生日关怀场景',
      user: 'admin@example.com',
      time: '5分钟前',
      type: 'create'
    },
    {
      id: 2,
      action: 'AI模型更新',
      target: '默认推荐算法 v2.1',
      user: 'system',
      time: '1小时前',
      type: 'update'
    },
    {
      id: 3,
      action: '用户权限修改',
      target: 'marketing@company.com',
      user: 'admin@example.com',
      time: '2小时前',
      type: 'permission'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* 系统状态概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">系统用户</p>
                <p className="text-2xl font-bold text-gray-900">{systemStats.totalUsers}</p>
                <p className="text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  本月新增 23人
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">活跃场景</p>
                <p className="text-2xl font-bold text-gray-900">{systemStats.activeScenarios}</p>
                <p className="text-xs text-gray-500 mt-1">总计 28 个场景</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI模型</p>
                <p className="text-2xl font-bold text-gray-900">{systemStats.aiModelsRunning}</p>
                <p className="text-xs text-green-600 mt-1">
                  <CheckCircle className="h-3 w-3 inline mr-1" />
                  运行正常
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Bot className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">今日转化</p>
                <p className="text-2xl font-bold text-gray-900">{systemStats.todayConversions}</p>
                <p className="text-xs text-red-600 mt-1">
                  错误率: {(systemStats.errorRate * 100).toFixed(2)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 系统健康状态 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              系统健康状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">数据库连接</span>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                  正常
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">AI引擎</span>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                  运行中
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">邮件服务</span>
                </div>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                  延迟
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">API网关</span>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                  正常
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 最近活动 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              最近系统活动
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map(activity => (
                <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                    {activity.type === 'create' && <Settings className="h-4 w-4 text-blue-600" />}
                    {activity.type === 'update' && <Bot className="h-4 w-4 text-green-600" />}
                    {activity.type === 'permission' && <Shield className="h-4 w-4 text-purple-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.target}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">操作人: {activity.user}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 快捷操作 */}
      <Card>
        <CardHeader>
          <CardTitle>快捷管理操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <Users className="h-6 w-6 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">���户管理</p>
                <p className="text-sm text-gray-600">管理系统用户和权限</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <Bot className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">AI模型配置</p>
                <p className="text-sm text-gray-600">管理AI算法和策略</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <Database className="h-6 w-6 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">数据源配置</p>
                <p className="text-sm text-gray-600">配置外部数据接口</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <BarChart3 className="h-6 w-6 text-orange-600" />
              <div>
                <p className="font-medium text-gray-900">系统监控</p>
                <p className="text-sm text-gray-600">查看性能和日志</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
