import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import {
  actionsData,
  ActionData,
  STATUS_DISPLAY,
  MONITORING_SCOPE_DISPLAY,
  formatNumber,
  calculateConversionRate
} from '@shared/actionLibraryData';

export default function ResponseActionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [action, setAction] = useState<ActionData | null>(null);
  const [loading, setLoading] = useState(true);

  // 加载动作数据
  useEffect(() => {
    if (id) {
      const foundAction = actionsData.find(a => a.id === id);
      setAction(foundAction || null);
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!action) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Link 
            to="/response-actions" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回列表
          </Link>
        </div>
        <div className="text-center">
          <p className="text-gray-900 font-medium mb-2">动作未找到</p>
          <p className="text-gray-600">指定的动作ID不存在</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">

      {/* 基本信息卡片 */}
      <Card className="bg-white rounded-lg shadow-sm">
        <CardContent>
          {/* 动作名称和状态 */}
          <div className="mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">{action.name}</h1>
              <Badge 
                variant={STATUS_DISPLAY[action.status].color === 'green' ? 'default' : 'secondary'}
                className={`${STATUS_DISPLAY[action.status].color === 'green' ? 'bg-green-100 text-green-800' : ''} text-sm px-3 py-1`}
              >
                {STATUS_DISPLAY[action.status].text}
              </Badge>
            </div>
          </div>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-600">规则ID</dt>
              <dd className="mt-1 text-sm text-gray-900">{action.id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">响应动作类型</dt>
              <dd className="mt-1 text-sm text-gray-900">网页弹窗</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">创建时间</dt>
              <dd className="mt-1 text-sm text-gray-900">{action.createdAt}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">更新时间</dt>
              <dd className="mt-1 text-sm text-gray-900">{action.lastUpdated}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">触发器类型</dt>
              <dd className="mt-1 text-sm text-gray-900">{MONITORING_SCOPE_DISPLAY[action.monitoringScope]}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">响应动作用途</dt>
              <dd className="mt-1 text-sm text-gray-900">{action.purpose}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* 效果统计卡片 */}
      <Card className="bg-white rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            效果统计
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-lg font-bold text-gray-900">
                {formatNumber(action.totalExecutions)}
              </div>
              <div className="text-xs text-gray-600">累计执行次数</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-lg font-bold text-gray-900">
                {formatNumber(action.interactions)}
              </div>
              <div className="text-xs text-gray-600">累计互动次数</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-lg font-bold text-gray-900">
                {formatNumber(action.conversions)}
              </div>
              <div className="text-xs text-gray-600">累计转化数</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-lg font-bold text-gray-900">
                {calculateConversionRate(action.conversions, action.interactions)}
              </div>
              <div className="text-xs text-gray-600">转化率</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 响应动作配置卡片 */}
      <Card className="bg-white rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>响应动作配置</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 动作类型标题 */}
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold text-gray-900">网页弹窗</h4>
            </div>
            
            {/* 配置详情 */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">弹窗标题</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">{action.popup.title}</dd>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">按钮文字</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">{action.popup.buttonText}</dd>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 md:col-span-2">
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">弹窗内容</dt>
                  <dd className="mt-1 text-sm text-gray-900">{action.popup.content}</dd>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 md:col-span-2">
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">跳转链接</dt>
                  <dd className="mt-1">
                    <a 
                      href={action.popup.buttonLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {action.popup.buttonLink}
                    </a>
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
