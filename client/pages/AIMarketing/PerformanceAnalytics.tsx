import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, Eye } from 'lucide-react';
import { mockAnalyticsData, ActivityRecord, getResultIcon } from '@shared/aiMarketingData';

export default function PerformanceAnalytics() {
  const [timeRange, setTimeRange] = useState('7days');
  const [activityType, setActivityType] = useState('all');
  const [effectFilter, setEffectFilter] = useState('all');
  const [activities, setActivities] = useState(mockAnalyticsData.activities);
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    content: string;
    title: string;
  }>({
    isOpen: false,
    content: '',
    title: ''
  });

  const handleFeedback = (activityId: string, feedback: 'positive' | 'negative') => {
    setActivities(prev => prev.map(activity => 
      activity.id === activityId 
        ? { ...activity, feedback: activity.feedback === feedback ? null : feedback }
        : activity
    ));
  };

  const handlePreview = (activity: ActivityRecord) => {
    let fullContent = '';
    if (activity.contentType === 'email') {
      fullContent = `
邮件标题: ${activity.contentPreview.split('"')[1]}

邮件正文:
${activity.contentPreview.includes('Alex') ? 
  'Hi Alex，秋色正浓，您的���机是否还在等待最完美的那一刻？我们注意到您对摄影装备的热爱，特别为您准备了这个秋季的摄影套装优惠...' :
  activity.contentPreview.includes('收藏') ?
  '您收藏的徒步鞋已到货，现有库存充足。同时我们为您推荐了几款搭配的户外装备，让您的户外体验更加完美...' :
  activity.contentPreview.includes('很久') ?
  '我们注意到您很久没来了，您的会员权益即将过期。作为我们的重要客户，我们为您准备了专属的回归礼包...' :
  '欢迎加入！探索您感兴趣的户外运动装备，我们根据您的浏览记录为您推荐了以下商品...'
}

发送时间: ${activity.executionTime}
发送对象: ${activity.summary.split('针对 ')[1]}
      `;
    } else {
      fullContent = `
弹窗标题: ${activity.contentPreview.split('"')[1]}

弹窗内容:
${activity.contentPreview.includes('咖啡') ?
  '配齐您的咖啡角！我们发现您购买了高端咖啡机，为了让您享受最完美的咖啡体验，我们推荐这些精选咖啡豆和配件...' :
  '您的新手机需要一个保护壳！为了保护您的新投资，我们为您推荐了几款高品质手机壳，现在购买还有额外优惠...'
}

显示时间: ${activity.executionTime}
目标用户: ${activity.summary.split('针对 ')[1]}
      `;
    }
    
    setPreviewModal({
      isOpen: true,
      content: fullContent,
      title: `${activity.contentType === 'email' ? '邮件' : '弹窗'}内容预览`
    });
  };

  return (
    <div className="p-6 space-y-6">

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">时间范围</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">过去7天</SelectItem>
                  <SelectItem value="30days">过去30天</SelectItem>
                  <SelectItem value="90days">过去90天</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">活动类型</label>
              <Select value={activityType} onValueChange={setActivityType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="email">邮件</SelectItem>
                  <SelectItem value="popup">弹窗</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">效果筛选</label>
              <Select value={effectFilter} onValueChange={setEffectFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="converted">已转化</SelectItem>
                  <SelectItem value="opened">已打开</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {mockAnalyticsData.kpis.totalExecutions.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 mt-1">总执行次数</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {mockAnalyticsData.kpis.totalConversions.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 mt-1">总转化数</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                ¥{mockAnalyticsData.kpis.totalRevenue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 mt-1">总转化金额 (GMV)</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {mockAnalyticsData.kpis.averageROI}x
              </div>
              <div className="text-sm text-gray-600 mt-1">平均投资回报率 (ROI)</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activities Table */}
      <Card>
        <CardHeader>
          <CardTitle>营销活动明细数据表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>活动摘要</TableHead>
                <TableHead>生成内容预览</TableHead>
                <TableHead>执行时间</TableHead>
                <TableHead>效果详情</TableHead>
                <TableHead className="text-center">您的反馈</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">
                    {activity.summary}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">
                        {activity.contentPreview}
                      </span>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-blue-600"
                        onClick={() => handlePreview(activity)}
                      >
                        [预览]
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{activity.executionTime}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{getResultIcon(activity.result.type)}</span>
                      <span className="text-sm">
                        {activity.result.value}
                        {activity.result.amount && (
                          <span className="font-medium text-green-600 ml-1">
                            ¥{activity.result.amount.toLocaleString()}
                          </span>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 p-0 ${
                          activity.feedback === 'positive' 
                            ? 'bg-green-100 text-green-600 border border-green-200' 
                            : 'text-gray-400 hover:text-green-600'
                        }`}
                        onClick={() => handleFeedback(activity.id, 'positive')}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 p-0 ${
                          activity.feedback === 'negative' 
                            ? 'bg-red-100 text-red-600 border border-red-200' 
                            : 'text-gray-400 hover:text-red-600'
                        }`}
                        onClick={() => handleFeedback(activity.id, 'negative')}
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {previewModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{previewModal.title}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewModal({ isOpen: false, content: '', title: '' })}
              >
                ✕
              </Button>
            </div>
            <div className="whitespace-pre-line text-sm text-gray-700 bg-gray-50 p-4 rounded-md">
              {previewModal.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
