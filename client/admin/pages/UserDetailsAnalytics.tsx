import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  User,
  Clock,
  Calendar,
  Globe,
  Smartphone,
  Monitor,
  MousePointer,
  Eye,
  BarChart3,
  TrendingUp,
  Activity,
  MapPin,
  Wifi,
  Settings,
  Target,
  Users,
  Database,
  Brain,
  Zap,
  Mail
} from 'lucide-react';

// 用户行为数据类型定义
interface UserAnalytics {
  userId: string;
  basicInfo: {
    name: string;
    email: string;
    phone: string;
    department: string;
    roles: string[];
    status: string;
    registeredAt: string;
    lastLogin: string;
  };
  
  usageStats: {
    totalSessions: number;
    totalTimeSpent: number; // 分钟
    avgSessionDuration: number; // 分钟
    lastActive: string;
    activeDays: number;
    loginFrequency: number; // 每周平均登录次数
  };

  featureUsage: {
    feature: string;
    usage: number;
    lastUsed: string;
    category: string;
  }[];

  pageVisits: {
    page: string;
    visits: number;
    timeSpent: number;
    bounceRate: number;
  }[];

  deviceInfo: {
    devices: { type: string; count: number; percentage: number; }[];
    browsers: { name: string; count: number; percentage: number; }[];
    os: { name: string; count: number; percentage: number; }[];
  };

  behaviorPatterns: {
    peakHours: { hour: number; activity: number; }[];
    commonPaths: { path: string; frequency: number; }[];
    sessionFlow: { from: string; to: string; count: number; }[];
  };

  engagementMetrics: {
    clickRate: number;
    pageDepth: number;
    returnRate: number;
    featureAdoption: number;
  };

  geographicData: {
    country: string;
    city: string;
    region: string;
    loginCount: number;
    percentage: number;
  }[];
}

// 模拟用户分析数据
const mockUserAnalytics: UserAnalytics = {
  userId: '1',
  basicInfo: {
    name: '系统管理员',
    email: 'admin@company.com',
    phone: '+86 138-0000-0001',
    department: '技术部',
    roles: ['super_admin'],
    status: 'active',
    registeredAt: '2024-01-10',
    lastLogin: '2025-01-20 09:30'
  },
  
  usageStats: {
    totalSessions: 287,
    totalTimeSpent: 1840, // 约30.7小时
    avgSessionDuration: 6.4,
    lastActive: '2025-01-20 09:30',
    activeDays: 45,
    loginFrequency: 4.2
  },

  featureUsage: [
    { feature: '用户管理', usage: 156, lastUsed: '2025-01-20', category: 'user' },
    { feature: 'AI模型管理', usage: 89, lastUsed: '2025-01-19', category: 'ai' },
    { feature: '场景配置', usage: 134, lastUsed: '2025-01-20', category: 'scenario' },
    { feature: '系统监控', usage: 67, lastUsed: '2025-01-18', category: 'system' },
    { feature: '数据分析', usage: 98, lastUsed: '2025-01-19', category: 'data' },
    { feature: '权限管理', usage: 45, lastUsed: '2025-01-17', category: 'user' }
  ],

  pageVisits: [
    { page: '/admin/users', visits: 156, timeSpent: 234, bounceRate: 12 },
    { page: '/admin/ai-models', visits: 89, timeSpent: 167, bounceRate: 8 },
    { page: '/admin/scenarios', visits: 134, timeSpent: 289, bounceRate: 15 },
    { page: '/admin/security', visits: 67, timeSpent: 145, bounceRate: 22 },
    { page: '/admin', visits: 287, timeSpent: 89, bounceRate: 5 }
  ],

  deviceInfo: {
    devices: [
      { type: 'Desktop', count: 198, percentage: 69 },
      { type: 'Mobile', count: 56, percentage: 19 },
      { type: 'Tablet', count: 33, percentage: 12 }
    ],
    browsers: [
      { name: 'Chrome', count: 178, percentage: 62 },
      { name: 'Safari', count: 67, percentage: 23 },
      { name: 'Firefox', count: 28, percentage: 10 },
      { name: 'Edge', count: 14, percentage: 5 }
    ],
    os: [
      { name: 'Windows', count: 156, percentage: 54 },
      { name: 'macOS', count: 89, percentage: 31 },
      { name: 'iOS', count: 28, percentage: 10 },
      { name: 'Android', count: 14, percentage: 5 }
    ]
  },

  behaviorPatterns: {
    peakHours: [
      { hour: 9, activity: 45 },
      { hour: 10, activity: 78 },
      { hour: 11, activity: 65 },
      { hour: 14, activity: 82 },
      { hour: 15, activity: 69 },
      { hour: 16, activity: 54 }
    ],
    commonPaths: [
      { path: '登录 → 用户管理 → 编辑用户', frequency: 89 },
      { path: '登录 → AI模型 → 配置模型', frequency: 67 },
      { path: '登录 → 场景管理 → 查看数据', frequency: 78 }
    ],
    sessionFlow: [
      { from: '登录页', to: '管理后台首页', count: 287 },
      { from: '管理后台首页', to: '用户管理', count: 156 },
      { from: '用户管理', to: '编辑用户', count: 89 }
    ]
  },

  engagementMetrics: {
    clickRate: 76,
    pageDepth: 4.2,
    returnRate: 89,
    featureAdoption: 67
  },

  geographicData: [
    { country: '中国', city: '北京', region: '北京市', loginCount: 198, percentage: 69 },
    { country: '中国', city: '上海', region: '上海市', loginCount: 56, percentage: 19 },
    { country: '中国', city: '深圳', region: '广东省', loginCount: 28, percentage: 10 },
    { country: '中国', city: '杭州', region: '浙江省', loginCount: 5, percentage: 2 }
  ]
};

export default function UserDetailsAnalytics() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟数据加载
    setTimeout(() => {
      setAnalytics(mockUserAnalytics);
      setLoading(false);
    }, 1000);
  }, [userId]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'user': return <Users className="h-4 w-4" />;
      case 'ai': return <Brain className="h-4 w-4" />;
      case 'scenario': return <Target className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      case 'data': return <Database className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">用户不存在</h2>
          <Button onClick={() => navigate('/admin/users')}>
            返回用户列表
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/users')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回用户列表
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">用户详情分析</h1>
            <p className="text-sm text-gray-600 mt-1">
              {analytics.basicInfo.name} 的使用数据和行为分析
            </p>
          </div>
        </div>
      </div>

      {/* 用户基本信息卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            基本信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-medium text-lg">{analytics.basicInfo.name}</div>
                <div className="text-sm text-gray-500">{analytics.basicInfo.department}</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                {analytics.basicInfo.email}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-400" />
                最后登录: {analytics.basicInfo.lastLogin}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {analytics.basicInfo.roles.map(role => (
                <Badge key={role} className="bg-blue-100 text-blue-800">
                  {role === 'super_admin' ? '超级管理员' : role}
                </Badge>
              ))}
              <Badge className="bg-green-100 text-green-800">
                {analytics.basicInfo.status === 'active' ? '正常' : '禁用'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 使用统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总会话数</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.usageStats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              过去60天内
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总使用时长</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(analytics.usageStats.totalTimeSpent)}</div>
            <p className="text-xs text-muted-foreground">
              平均会话 {analytics.usageStats.avgSessionDuration.toFixed(1)} 分钟
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃天数</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.usageStats.activeDays}</div>
            <p className="text-xs text-muted-foreground">
              过去60天内活跃
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">登录频率</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.usageStats.loginFrequency}</div>
            <p className="text-xs text-muted-foreground">
              次/周平均
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="features" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="features">功能使用</TabsTrigger>
          <TabsTrigger value="pages">页面访问</TabsTrigger>
          <TabsTrigger value="devices">设备信息</TabsTrigger>
          <TabsTrigger value="behavior">行为模式</TabsTrigger>
          <TabsTrigger value="engagement">参与度</TabsTrigger>
        </TabsList>

        {/* 功能使用分析 */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>功能使用频率</CardTitle>
              <CardDescription>各功能模块的使用情况统计</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.featureUsage.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(feature.category)}
                      <div>
                        <div className="font-medium">{feature.feature}</div>
                        <div className="text-sm text-gray-500">
                          最后使用: {feature.lastUsed}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">{feature.usage}</div>
                      <div className="text-sm text-gray-500">次使用</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 页面访问分析 */}
        <TabsContent value="pages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>页面访问统计</CardTitle>
              <CardDescription>用户访问各页面的详细数据</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.pageVisits.map((page, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-medium">{page.page}</div>
                      <Badge variant="outline">{page.visits} 次访问</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">停留时间</div>
                        <div className="font-medium">{formatDuration(page.timeSpent)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">跳出率</div>
                        <div className="font-medium">{page.bounceRate}%</div>
                      </div>
                      <div>
                        <div className="text-gray-500">平均停留</div>
                        <div className="font-medium">
                          {(page.timeSpent / page.visits).toFixed(1)} 分钟
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 设备信息分析 */}
        <TabsContent value="devices" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  设备类型
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.deviceInfo.devices.map((device, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{device.type}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${device.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{device.percentage}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  浏览器
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.deviceInfo.browsers.map((browser, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{browser.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${browser.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{browser.percentage}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  操作系统
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.deviceInfo.os.map((os, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{os.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${os.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{os.percentage}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 行为模式分析 */}
        <TabsContent value="behavior" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>活跃时段分布</CardTitle>
                <CardDescription>用户在不同时间段的活跃度</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.behaviorPatterns.peakHours.map((hour, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm w-12">{hour.hour}:00</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full" 
                        style={{ width: `${(hour.activity / 100) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-8">{hour.activity}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>常用操作路径</CardTitle>
                <CardDescription>用户最常执行的操作序列</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.behaviorPatterns.commonPaths.map((path, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="text-sm font-medium mb-1">{path.path}</div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">执行频率</div>
                      <Badge variant="outline">{path.frequency} 次</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>地理位置分布</CardTitle>
              <CardDescription>用户登录的地理位置统计</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.geographicData.map((location, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{location.city}</div>
                        <div className="text-sm text-gray-500">{location.region}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{location.loginCount} 次</div>
                      <div className="text-sm text-gray-500">{location.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 参与度分析 */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>参与度指标</CardTitle>
                <CardDescription>用户的整体参与度评估</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>点击率</span>
                    <span>{analytics.engagementMetrics.clickRate}%</span>
                  </div>
                  <Progress value={analytics.engagementMetrics.clickRate} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>页面深度</span>
                    <span>{analytics.engagementMetrics.pageDepth} 页/会话</span>
                  </div>
                  <Progress value={(analytics.engagementMetrics.pageDepth / 10) * 100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>回访率</span>
                    <span>{analytics.engagementMetrics.returnRate}%</span>
                  </div>
                  <Progress value={analytics.engagementMetrics.returnRate} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>功能采用率</span>
                    <span>{analytics.engagementMetrics.featureAdoption}%</span>
                  </div>
                  <Progress value={analytics.engagementMetrics.featureAdoption} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>使用建议</CardTitle>
                <CardDescription>基于数据分析的使用改进建议</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800 font-medium mb-1">
                    <Zap className="h-4 w-4" />
                    高活跃用户
                  </div>
                  <p className="text-sm text-blue-700">
                    该用户表现出很高的参与度，可以考虑邀请其参与新功能测试或反馈收集。
                  </p>
                </div>
                
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800 font-medium mb-1">
                    <Target className="h-4 w-4" />
                    功能专家
                  </div>
                  <p className="text-sm text-green-700">
                    在用户管理和场景配置方面使用频率很高，可以作为这些功能的内部专家。
                  </p>
                </div>
                
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-800 font-medium mb-1">
                    <Activity className="h-4 w-4" />
                    优化建议
                  </div>
                  <p className="text-sm text-orange-700">
                    主要在工作时间使用系统，建议在高峰时段优化系统性能。
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
