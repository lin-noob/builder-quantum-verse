import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  HelpCircle, 
  Settings, 
  MessageSquare
} from 'lucide-react';
import {
  actionsData,
  ActionData,
  MonitoringScope,
  COMMON_PURPOSES
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

  return (
    <div className="min-h-full bg-gray-50">
      {/* 顶部操作栏 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-end h-16">
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/response-actions')}
              >
                取消
              </Button>
              <Button 
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700"
              >
                保存
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-none mx-auto px-6 lg:px-12 py-8">
        <div className="space-y-6">

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
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2">
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
                    <HelpCircle
                      className="h-4 w-4 text-gray-400 cursor-help"
                      title="为AI圈定一个宏观的监控范围，作为其进行意图分析的前提，有助于提升系统效率。"
                    />
                  </div>
                  <Select
                    value={formData.monitoringScope}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, monitoringScope: value as MonitoringScope }))}
                  >
                    <SelectTrigger className="h-[42px]">
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
                  <div className="h-[42px] p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">网页弹窗</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
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
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2">
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
                  <label className="block text-sm font-medium text-gray-900 mb-2">跳转链接</label>
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

              <div className="mt-6">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
