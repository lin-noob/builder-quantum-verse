import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, HelpCircle } from 'lucide-react';
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
    <div className="p-6 space-y-6 bg-gray-50 min-h-full max-w-4xl mx-auto">
      {/* 页面头部 */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/response-actions')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? '编辑AI动作' : '创建新AI动作'}
        </h1>
      </div>

      {/* 动作名称卡片 */}
      <Card className="bg-white rounded-lg shadow-sm">
        <CardContent className="pt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">动作名称</label>
            <Input
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="请输入动作名称"
            />
          </div>
        </CardContent>
      </Card>

      {/* AI 监控范围卡片 */}
      <Card className="bg-white rounded-lg shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-2">
            <label className="block text-sm font-medium text-gray-700">AI 监控范围</label>
            <HelpCircle className="h-4 w-4 text-gray-400" title="选择何时触发此动作" />
          </div>
          <Select
            value={formData.monitoringScope}
            onValueChange={(value) => setFormData(prev => ({ ...prev, monitoringScope: value as MonitoringScope }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="real_time_event">实时事件</SelectItem>
              <SelectItem value="user_mode">用户模式</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* 响应动作用途卡片 */}
      <Card className="bg-white rounded-lg shadow-sm">
        <CardContent className="pt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">响应动作用途</label>
            <p className="text-sm text-gray-600 mb-2">描述此动作的具体用途和触发场景</p>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-sky-500"
              rows={3}
              value={formData.purpose || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
              placeholder="请描述动作用途..."
            />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">常用用途建议</p>
            <div className="flex flex-wrap gap-2">
              {COMMON_PURPOSES.map((purpose, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, purpose }))}
                  className="text-sm"
                >
                  {purpose}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 弹窗内容卡片 */}
      <Card className="bg-white rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>弹窗内容</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">弹窗标题</label>
            <Input
              value={formData.popup?.title || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                popup: { ...prev.popup!, title: e.target.value }
              }))}
              placeholder="请输入弹窗标题"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">弹窗正文</label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-sky-500"
              rows={4}
              value={formData.popup?.content || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                popup: { ...prev.popup!, content: e.target.value }
              }))}
              placeholder="请输入弹窗内容"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">按钮文字</label>
            <Input
              value={formData.popup?.buttonText || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                popup: { ...prev.popup!, buttonText: e.target.value }
              }))}
              placeholder="请输入按钮文字"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">按钮链接 (URL)</label>
            <Input
              value={formData.popup?.buttonLink || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                popup: { ...prev.popup!, buttonLink: e.target.value }
              }))}
              placeholder="请输入按钮链接"
            />
          </div>
        </CardContent>
      </Card>

      {/* 页面底部操作栏 */}
      <div className="flex justify-end">
        <Button 
          className="bg-sky-600 text-white"
          onClick={handleSave}
        >
          保存
        </Button>
      </div>
    </div>
  );
}
