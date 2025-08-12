import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  HelpCircle, 
  Settings, 
  MessageSquare, 
  Target, 
  Link as LinkIcon,
  Eye,
  Save,
  RotateCcw
} from 'lucide-react';
import {
  actionsData,
  ActionData,
  MonitoringScope,
  COMMON_PURPOSES,
  STATUS_DISPLAY
} from '@shared/actionLibraryData';
import { useToast } from '@/hooks/use-toast';

export default function ResponseActionCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<Partial<ActionData>>({
    name: '',
    monitoringScope: 'real_time_event',
    purpose: '',
    popup: {
      title: '',
      content: '',
      buttonText: '',
      buttonLink: ''
    }
  });

  // 如果是编辑模式，加载现有数据
  useEffect(() => {
    if (isEditing && id) {
      const action = actionsData.find(a => a.id === id);
      if (action) {
        setFormData(action);
      }
    }
  }, [isEditing, id]);

  const handleSave = () => {
    if (!formData.name?.trim()) {
      toast({
        title: "请填写动作名称",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: isEditing ? "保存成功" : "创建成功",
      description: `动作"${formData.name}"已保存`
    });
    
    navigate('/response-actions');
  };

  const handleReset = () => {
    if (isEditing && id) {
      const action = actionsData.find(a => a.id === id);
      if (action) {
        setFormData(action);
      }
    } else {
      setFormData({
        name: '',
        monitoringScope: 'real_time_event',
        purpose: '',
        popup: {
          title: '',
          content: '',
          buttonText: '',
          buttonLink: ''
        }
      });
    }
    toast({
      title: "已重置",
      description: "表单已恢复到初始状���"
    });
  };

  return (
    <div className="min-h-full bg-gray-50">
      {/* 顶部操作栏 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/response-actions')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                返回列表
              </Button>
              <div className="h-6 border-l border-gray-300" />
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    {isEditing ? '编辑动作' : '创建新动作'}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {isEditing ? '修改响应动作的配置信息' : '配置新的AI响应动作'}
                  </p>
                </div>
                {isEditing && formData.status && (
                  <Badge 
                    variant={STATUS_DISPLAY[formData.status].color === 'green' ? 'default' : 'secondary'}
                    className={STATUS_DISPLAY[formData.status].color === 'green' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {STATUS_DISPLAY[formData.status].text}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                重置
              </Button>
              <Button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                保存
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 左侧主要配置区域 */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 基本信息 */}
            <Card className="shadow-sm border-0 ring-1 ring-gray-200">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Settings className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">基本信息</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">设置动作的基本属性和触发条件</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      动作名称 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.name || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="例如：新用户注册欢迎弹窗"
                      className="text-base"
                    />
                    <p className="text-xs text-gray-500 mt-1">为这个响应动作起一个描述性的名称</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-sm font-medium text-gray-900">监控范围</label>
                      <HelpCircle className="h-4 w-4 text-gray-400" title="选择何时触发此动作" />
                    </div>
                    <Select
                      value={formData.monitoringScope}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, monitoringScope: value as MonitoringScope }))}
                    >
                      <SelectTrigger className="text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="real_time_event">实时事件</SelectItem>
                        <SelectItem value="user_mode">用户模式</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">动作类型</label>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">网页弹窗</span>
                      </div>
                      <p className="text-xs text-blue-700 mt-1">在用户浏览器中显示弹窗消息</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    动作用途 <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    rows={3}
                    value={formData.purpose || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                    placeholder="描述此动作的具体用途和触发场景..."
                  />
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">快速选择常用场景：</p>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_PURPOSES.map((purpose, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData(prev => ({ ...prev, purpose }))}
                          className="text-xs h-7"
                        >
                          {purpose}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 弹窗内容配置 */}
            <Card className="shadow-sm border-0 ring-1 ring-gray-200">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">弹窗内容</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">设计用户看到的弹窗内容和交互</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      弹窗标题 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.popup?.title || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        popup: { ...prev.popup!, title: e.target.value }
                      }))}
                      placeholder="例如：欢迎加入我们！"
                      className="text-base font-medium"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      弹窗内容 <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                      rows={4}
                      value={formData.popup?.content || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        popup: { ...prev.popup!, content: e.target.value }
                      }))}
                      placeholder="输入弹窗的详细内容，告诉用户您想传达的信息..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      按钮文字 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.popup?.buttonText || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        popup: { ...prev.popup!, buttonText: e.target.value }
                      }))}
                      placeholder="例如：立即体验"
                      className="text-base"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-sm font-medium text-gray-900">跳转链接</label>
                      <LinkIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      value={formData.popup?.buttonLink || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        popup: { ...prev.popup!, buttonLink: e.target.value }
                      }))}
                      placeholder="例如：/products"
                      className="text-base font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">用户点击按钮后跳转的页面地址</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧预览和辅助信息 */}
          <div className="space-y-6">
            
            {/* 弹窗预览 */}
            <Card className="shadow-sm border-0 ring-1 ring-gray-200">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-gray-600" />
                  <CardTitle className="text-base font-semibold">实时预览</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm mx-auto">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-gray-900 text-sm">
                        {formData.popup?.title || '弹窗标题'}
                      </h4>
                      <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer">
                        <span className="text-xs text-gray-500">×</span>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                      {formData.popup?.content || '这里是弹窗的内容文字...'}
                    </p>
                    <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                      {formData.popup?.buttonText || '按钮文字'}
                    </button>
                  </div>
                  <p className="text-xs text-center text-blue-600 mt-3 font-medium">实时预览效果</p>
                </div>
              </CardContent>
            </Card>

            {/* 帮助信息 */}
            <Card className="shadow-sm border-0 ring-1 ring-gray-200">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <HelpCircle className="h-4 w-4 text-gray-600" />
                  <CardTitle className="text-base font-semibold">配置建议</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">动作名称</p>
                      <p className="text-xs text-gray-600">使用描述性的名称，便于后续管理</p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">弹窗标题</p>
                      <p className="text-xs text-gray-600">简洁明了，突出核心价值</p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">内容文案</p>
                      <p className="text-xs text-gray-600">清楚说明用户能获得什么价值</p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">按钮文字</p>
                      <p className="text-xs text-gray-600">使用行动导向的词语，如"立即体验"</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 快捷操作 */}
            <Card className="shadow-sm border-0 ring-1 ring-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">快捷操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  size="sm"
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    popup: { 
                      ...prev.popup!, 
                      title: '欢迎加入我们！',
                      content: '感谢您的注册，开启您的购物之旅吧！',
                      buttonText: '开始购物',
                      buttonLink: '/products'
                    }
                  }))}
                >
                  <Target className="h-4 w-4 mr-2" />
                  使用欢迎新用户模板
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  size="sm"
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    popup: { 
                      ...prev.popup!, 
                      title: '限时优惠���',
                      content: '您关注的商品正在促销，限时优惠不容错过！',
                      buttonText: '查看优惠',
                      buttonLink: '/sale'
                    }
                  }))}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  使用促销推广模板
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
