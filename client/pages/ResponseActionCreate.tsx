import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import {
  Rule,
  TriggerConfig,
  ActionConfig,
  RealTimeEventTrigger,
  UserSegmentTrigger,
  PopupAction,
  EmailAction,
  EVENT_NAME_DISPLAY,
  EVENT_FIELD_OPTIONS,
  USER_SEGMENT_FIELDS,
  SCHEDULE_DISPLAY
} from '@shared/ruleData';
import { useToast } from '@/hooks/use-toast';

interface FormData {
  ruleName: string;
  trigger: Partial<TriggerConfig>;
  action: Partial<ActionConfig>;
}

export default function ResponseActionCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<FormData>({
    ruleName: '',
    trigger: { type: 'real_time_event' },
    action: { type: 'popup' }
  });

  const [triggerType, setTriggerType] = useState<'real_time_event' | 'user_segment'>('real_time_event');
  const [actionType, setActionType] = useState<'popup' | 'email'>('popup');
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Handle trigger type change
  const handleTriggerTypeChange = (type: 'real_time_event' | 'user_segment') => {
    setTriggerType(type);
    if (type === 'real_time_event') {
      setFormData(prev => ({
        ...prev,
        trigger: { type: 'real_time_event', eventName: 'user_signup' } as Partial<RealTimeEventTrigger>
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        trigger: {
          type: 'user_segment',
          segmentRule: { field: 'tag', operator: '=', value: '' },
          schedule: 'daily'
        } as Partial<UserSegmentTrigger>
      }));
    }
  };

  // Handle action type change
  const handleActionTypeChange = (type: 'popup' | 'email') => {
    setActionType(type);
    if (type === 'popup') {
      setFormData(prev => ({
        ...prev,
        action: { type: 'popup', title: '', content: '', buttonText: '', buttonLink: '' } as Partial<PopupAction>
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        action: { type: 'email', subject: '', content: '', senderName: '' } as Partial<EmailAction>
      }));
    }
  };

  // Handle form submission
  const handleSave = async () => {
    try {
      setLoading(true);

      // Validate form
      if (!formData.ruleName.trim()) {
        toast({
          title: '请填写规则名称',
          variant: 'destructive'
        });
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: isEditing ? '更新成功' : '创建成功',
        description: `规则"${formData.ruleName}"已保存为草稿`
      });

      navigate('/response-actions');
    } catch (error) {
      toast({
        title: '保存失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get field options based on selected event
  const getFieldOptions = () => {
    if (triggerType === 'real_time_event' && selectedEvent) {
      const eventKey = selectedEvent as keyof typeof EVENT_FIELD_OPTIONS;
      return EVENT_FIELD_OPTIONS[eventKey] || [];
    }
    return [];
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/response-actions')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </Button>
      </div>

      <div className="space-y-6">
        {/* Step 1: Configure Trigger */}
        <Card>
          <CardHeader>
            <CardTitle>第一步：设定触发条件</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Trigger Type Selection */}
            <div>
              <Label className="text-base font-medium">触发器类型</Label>
              <RadioGroup
                value={triggerType}
                onValueChange={(value: 'real_time_event' | 'user_segment') => handleTriggerTypeChange(value)}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="real_time_event" id="real_time" />
                  <Label htmlFor="real_time">实时事件</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="user_segment" id="user_segment" />
                  <Label htmlFor="user_segment">用户模式</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Real Time Event Configuration */}
            {triggerType === 'real_time_event' && (
              <div className="space-y-4">
                <div>
                  <Label>当以下事件发生时</Label>
                  <Select
                    value={selectedEvent}
                    onValueChange={(value) => {
                      setSelectedEvent(value);
                      setFormData(prev => ({
                        ...prev,
                        trigger: {
                          ...prev.trigger,
                          eventName: value as any
                        }
                      }));
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="选择事件类型" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(EVENT_NAME_DISPLAY).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Condition */}
                <div>
                  <Label>并且满足条件</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-1">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="字段" />
                      </SelectTrigger>
                      <SelectContent>
                        {getFieldOptions().map((field) => (
                          <SelectItem key={field} value={field}>{field}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="操作符" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="=">=</SelectItem>
                        <SelectItem value="!=">!=</SelectItem>
                        <SelectItem value="contains">包含</SelectItem>
                        <SelectItem value="not_contains">不包含</SelectItem>
                        <SelectItem value=">">&gt;</SelectItem>
                        <SelectItem value="<">&lt;</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input placeholder="值" />
                  </div>
                </div>
              </div>
            )}

            {/* User Segment Configuration */}
            {triggerType === 'user_segment' && (
              <div className="space-y-4">
                <div>
                  <Label>筛选用户</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-1">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="字段" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(USER_SEGMENT_FIELDS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="操作符" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="=">=</SelectItem>
                        <SelectItem value="!=">!=</SelectItem>
                        <SelectItem value="contains">包含</SelectItem>
                        <SelectItem value="not_contains">不包含</SelectItem>
                        <SelectItem value=">">&gt;</SelectItem>
                        <SelectItem value="<">&lt;</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input placeholder="值" />
                  </div>
                </div>

                <div>
                  <Label>执行频率</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="选择执行频率" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SCHEDULE_DISPLAY).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Configure Action */}
        <Card>
          <CardHeader>
            <CardTitle>第二步：设定响应动作</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Action Type Selection */}
            <div>
              <Label className="text-base font-medium">响应动作类型</Label>
              <RadioGroup
                value={actionType}
                onValueChange={(value: 'popup' | 'email') => handleActionTypeChange(value)}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="popup" id="popup" />
                  <Label htmlFor="popup">网页弹窗</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email" />
                  <Label htmlFor="email">发送邮件</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Popup Configuration */}
            {actionType === 'popup' && (
              <div className="space-y-4">
                <div>
                  <Label>���窗标���</Label>
                  <Input
                    className="mt-1"
                    placeholder="输入弹窗标题"
                    value={(formData.action as PopupAction)?.title || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      action: { ...prev.action, title: e.target.value } as PopupAction
                    }))}
                  />
                </div>
                <div>
                  <Label>弹窗正文</Label>
                  <Textarea
                    className="mt-1"
                    placeholder="输入弹窗内容"
                    rows={4}
                    value={(formData.action as PopupAction)?.content || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      action: { ...prev.action, content: e.target.value } as PopupAction
                    }))}
                  />
                </div>
                <div>
                  <Label>按钮文字</Label>
                  <Input
                    className="mt-1"
                    placeholder="输入按钮文字"
                    value={(formData.action as PopupAction)?.buttonText || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      action: { ...prev.action, buttonText: e.target.value } as PopupAction
                    }))}
                  />
                </div>
                <div>
                  <Label>按钮链接</Label>
                  <Input
                    className="mt-1"
                    placeholder="输入按钮链接"
                    value={(formData.action as PopupAction)?.buttonLink || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      action: { ...prev.action, buttonLink: e.target.value } as PopupAction
                    }))}
                  />
                </div>
              </div>
            )}

            {/* Email Configuration */}
            {actionType === 'email' && (
              <div className="space-y-4">
                <div>
                  <Label>邮件标题</Label>
                  <Input
                    className="mt-1"
                    placeholder="输入邮件标题"
                    value={(formData.action as EmailAction)?.subject || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      action: { ...prev.action, subject: e.target.value } as EmailAction
                    }))}
                  />
                </div>
                <div>
                  <Label>邮件正文</Label>
                  <Textarea
                    className="mt-1"
                    placeholder="输入邮件内容（支持HTML）"
                    rows={6}
                    value={(formData.action as EmailAction)?.content || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      action: { ...prev.action, content: e.target.value } as EmailAction
                    }))}
                  />
                </div>
                <div>
                  <Label>发件人名称</Label>
                  <Input
                    className="mt-1"
                    placeholder="输入发件人名称"
                    value={(formData.action as EmailAction)?.senderName || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      action: { ...prev.action, senderName: e.target.value } as EmailAction
                    }))}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 3: Save Rule */}
        <Card>
          <CardHeader>
            <CardTitle>第三步：命名并保存</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>规则名称</Label>
              <Input
                className="mt-1"
                placeholder="例如：新用户注册欢迎弹窗"
                value={formData.ruleName}
                onChange={(e) => setFormData(prev => ({ ...prev, ruleName: e.target.value }))}
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {loading ? '保存中...' : '保存为草稿'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
