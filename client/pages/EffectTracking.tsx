import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Target,
  Calendar,
  ArrowRight,
  ExternalLink,
  BarChart3,
  PieChart,
  LineChart,
  DollarSign
} from "lucide-react";

interface ConversionData {
  id: string;
  userId: string;
  userName: string;
  conversionTime: string;
  conversionType: string;
  conversionValue: number;
  touchpoints: TouchPoint[];
  attributionModel: string;
  campaignSource: string;
}

interface TouchPoint {
  id: string;
  timestamp: string;
  type: 'strategy' | 'fully-auto' | 'semi-auto';
  mode: string;
  strategyName?: string;
  triggerRule: string;
  actionTaken: string;
  influence: number; // 影响权重 0-100
}

// 模拟数据
const mockConversions: ConversionData[] = [
  {
    id: "conv_001",
    userId: "user_12345",
    userName: "张小明",
    conversionTime: "2024-01-15 14:30:25",
    conversionType: "purchase",
    conversionValue: 299.90,
    attributionModel: "first-touch",
    campaignSource: "营销策略",
    touchpoints: [
      {
        id: "tp_001",
        timestamp: "2024-01-12 10:15:30",
        type: "strategy",
        mode: "半自动模式",
        strategyName: "新用户欢迎引导",
        triggerRule: "新用户首次访问",
        actionTaken: "展示欢迎弹窗",
        influence: 35
      },
      {
        id: "tp_002", 
        timestamp: "2024-01-14 09:22:15",
        type: "fully-auto",
        mode: "全动模式",
        triggerRule: "购物车放弃检测",
        actionTaken: "发送优惠券邮件",
        influence: 45
      },
      {
        id: "tp_003",
        timestamp: "2024-01-15 13:45:10",
        type: "strategy",
        mode: "半自动模式", 
        strategyName: "购买转化促进",
        triggerRule: "商品页面停留3分钟",
        actionTaken: "展示限时优惠",
        influence: 20
      }
    ]
  },
  {
    id: "conv_002",
    userId: "user_67890",
    userName: "李小红",
    conversionTime: "2024-01-16 16:20:10",
    conversionType: "subscription",
    conversionValue: 99.00,
    attributionModel: "last-touch",
    campaignSource: "全动模式",
    touchpoints: [
      {
        id: "tp_004",
        timestamp: "2024-01-10 15:30:00",
        type: "strategy",
        mode: "半自动模式",
        strategyName: "会员转化策略",
        triggerRule: "浏览会员页面",
        actionTaken: "展示会员权益",
        influence: 25
      },
      {
        id: "tp_005",
        timestamp: "2024-01-16 15:45:30",
        type: "fully-auto",
        mode: "全动模式",
        triggerRule: "重复访问检测",
        actionTaken: "推送专属优惠",
        influence: 75
      }
    ]
  }
];

const conversionTypeMap = {
  purchase: "商品购买",
  subscription: "会员订阅",
  signup: "用户注册",
  download: "资源下载"
};

const attributionModelMap = {
  "first-touch": "首次触达",
  "last-touch": "最后触达",
  "linear": "线性归因",
  "time-decay": "时间衰减"
};

export default function EffectTracking() {
  const [filters, setFilters] = useState({
    search: "",
    conversionType: "all",
    attributionModel: "all",
    dateRange: "7days"
  });

  const [selectedConversion, setSelectedConversion] = useState<ConversionData | null>(null);

  // 过滤数据
  const filteredConversions = useMemo(() => {
    return mockConversions.filter(conversion => {
      if (filters.search && !conversion.userName.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.conversionType !== "all" && conversion.conversionType !== filters.conversionType) {
        return false;
      }
      if (filters.attributionModel !== "all" && conversion.attributionModel !== filters.attributionModel) {
        return false;
      }
      return true;
    });
  }, [filters]);

  // 统计数据
  const stats = useMemo(() => {
    const totalConversions = filteredConversions.length;
    const totalValue = filteredConversions.reduce((sum, conv) => sum + conv.conversionValue, 0);
    const avgValue = totalConversions > 0 ? totalValue / totalConversions : 0;
    
    const sourceDistribution = filteredConversions.reduce((acc, conv) => {
      acc[conv.campaignSource] = (acc[conv.campaignSource] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalConversions,
      totalValue,
      avgValue,
      sourceDistribution
    };
  }, [filteredConversions]);

  const formatCurrency = (value: number) => `¥${value.toFixed(2)}`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('zh-CN');

  const getTypeColor = (type: TouchPoint['type']) => {
    switch (type) {
      case 'strategy': return 'bg-blue-100 text-blue-700';
      case 'fully-auto': return 'bg-green-100 text-green-700';
      case 'semi-auto': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-full">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">总转化次数</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalConversions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">总转化价值</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">平均转化价值</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.avgValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">主要来源</p>
                <p className="text-lg font-bold text-foreground">
                  {Object.entries(stats.sourceDistribution).sort(([,a], [,b]) => b - a)[0]?.[0] || '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选器 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="搜索用户名..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.conversionType} onValueChange={(value) => setFilters(prev => ({ ...prev, conversionType: value }))}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有转化类型</SelectItem>
                <SelectItem value="purchase">商品购买</SelectItem>
                <SelectItem value="subscription">会员订阅</SelectItem>
                <SelectItem value="signup">用户注册</SelectItem>
                <SelectItem value="download">资源下载</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.attributionModel} onValueChange={(value) => setFilters(prev => ({ ...prev, attributionModel: value }))}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有归因模型</SelectItem>
                <SelectItem value="first-touch">首次触达</SelectItem>
                <SelectItem value="last-touch">最后触达</SelectItem>
                <SelectItem value="linear">线性归因</SelectItem>
                <SelectItem value="time-decay">时间衰减</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 主要内容 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 转化列表 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              转化记录
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {filteredConversions.map((conversion) => (
                <div
                  key={conversion.id}
                  className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedConversion?.id === conversion.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => setSelectedConversion(conversion)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{conversion.userName}</p>
                        <Badge variant="secondary" className="text-xs">
                          {conversionTypeMap[conversion.conversionType as keyof typeof conversionTypeMap]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span>{formatDate(conversion.conversionTime)}</span>
                        <span>{formatCurrency(conversion.conversionValue)}</span>
                        <span>{conversion.touchpoints.length} 个触点</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 归因分析详情 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              归因分析详情
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedConversion ? (
              <div className="space-y-4">
                {/* 转化信息 */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">用户</p>
                      <p className="font-medium">{selectedConversion.userName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">转化价值</p>
                      <p className="font-medium">{formatCurrency(selectedConversion.conversionValue)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">归因模型</p>
                      <p className="font-medium">{attributionModelMap[selectedConversion.attributionModel as keyof typeof attributionModelMap]}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">主要来源</p>
                      <p className="font-medium">{selectedConversion.campaignSource}</p>
                    </div>
                  </div>
                </div>

                {/* 触点时间线 */}
                <div>
                  <h4 className="font-medium mb-3">用户转化路径</h4>
                  <div className="space-y-3">
                    {selectedConversion.touchpoints.map((touchpoint, index) => (
                      <div key={touchpoint.id} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                            {index + 1}
                          </div>
                          {index < selectedConversion.touchpoints.length - 1 && (
                            <div className="w-px h-8 bg-border mt-1"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getTypeColor(touchpoint.type)}>
                              {touchpoint.mode}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              影响权重: {touchpoint.influence}%
                            </span>
                          </div>
                          {touchpoint.strategyName && (
                            <p className="text-sm font-medium text-foreground mb-1">
                              {touchpoint.strategyName}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground mb-1">
                            触发: {touchpoint.triggerRule}
                          </p>
                          <p className="text-sm text-muted-foreground mb-1">
                            动作: {touchpoint.actionTaken}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(touchpoint.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 转化结果 */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingCart className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">转化完成</span>
                  </div>
                  <p className="text-sm text-green-700">
                    {formatDate(selectedConversion.conversionTime)} - {formatCurrency(selectedConversion.conversionValue)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">请选择左侧的转化记录查看详细的归因分析</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
