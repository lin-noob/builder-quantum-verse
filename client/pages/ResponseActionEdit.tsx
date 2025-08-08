import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { 
  ResponseAction, 
  PURPOSE_OPTIONS, 
  PopupParameters, 
  EmailParameters 
} from '@shared/responseActionsData';
import { useResponseActions } from '@/hooks/useResponseActions';
import { useToast } from '@/hooks/use-toast';

interface FormData {
  actionName: string;
  actionType: 'POPUP' | 'EMAIL';
  purpose: string;
  popupTitle: string;
  popupContent: string;
  popupButtonText: string;
  popupButtonLink: string;
  emailSubject: string;
  emailContent: string;
  emailSenderName: string;
}

const initialFormData: FormData = {
  actionName: '',
  actionType: 'POPUP',
  purpose: '',
  popupTitle: '',
  popupContent: '',
  popupButtonText: '',
  popupButtonLink: '',
  emailSubject: '',
  emailContent: '',
  emailSenderName: '',
};

export default function ResponseActionEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { actions, loading, updateAction } = useResponseActions();
  
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [action, setAction] = useState<ResponseAction | null>(null);
  const [saving, setSaving] = useState(false);

  const isEditMode = !!id;

  // Load action data for editing
  useEffect(() => {
    if (!loading && actions.length > 0 && id) {
      const foundAction = actions.find(a => a.id === id);
      if (foundAction) {
        setAction(foundAction);
        const params = foundAction.parameters;
        setFormData({
          actionName: foundAction.actionName,
          actionType: foundAction.actionType,
          purpose: foundAction.purpose,
          popupTitle: params.type === 'popup' ? params.title : '',
          popupContent: params.type === 'popup' ? params.content : '',
          popupButtonText: params.type === 'popup' ? params.buttonText : '',
          popupButtonLink: params.type === 'popup' ? params.buttonLink : '',
          emailSubject: params.type === 'email' ? params.subject : '',
          emailContent: params.type === 'email' ? params.content : '',
          emailSenderName: params.type === 'email' ? params.senderName : '',
        });
      }
    }
  }, [actions, loading, id]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.actionName.trim()) {
      newErrors.actionName = '动作名称不能为空';
    }

    if (!formData.purpose) {
      newErrors.purpose = '请选择用途';
    }

    if (formData.actionType === 'POPUP') {
      if (!formData.popupTitle.trim()) {
        newErrors.popupTitle = '弹窗标题不能为空';
      }
      if (!formData.popupContent.trim()) {
        newErrors.popupContent = '弹窗正文不能为空';
      }
      if (!formData.popupButtonText.trim()) {
        newErrors.popupButtonText = '按钮文字不能为空';
      }
      if (!formData.popupButtonLink.trim()) {
        newErrors.popupButtonLink = '按钮链接不能为空';
      } else if (!isValidUrl(formData.popupButtonLink)) {
        newErrors.popupButtonLink = '请输入有效的URL地址';
      }
    }

    if (formData.actionType === 'EMAIL') {
      if (!formData.emailSubject.trim()) {
        newErrors.emailSubject = '邮件标题不能为空';
      }
      if (!formData.emailContent.trim()) {
        newErrors.emailContent = '邮件正文不能为空';
      }
      if (!formData.emailSenderName.trim()) {
        newErrors.emailSenderName = '发件人名称不能为空';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // URL validation helper
  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      let parameters: PopupParameters | EmailParameters;
      
      if (formData.actionType === 'POPUP') {
        parameters = {
          type: 'popup',
          title: formData.popupTitle,
          content: formData.popupContent,
          buttonText: formData.popupButtonText,
          buttonLink: formData.popupButtonLink,
        } as PopupParameters;
      } else {
        parameters = {
          type: 'email',
          subject: formData.emailSubject,
          content: formData.emailContent,
          senderName: formData.emailSenderName,
        } as EmailParameters;
      }

      const updateData = {
        id: id!,
        actionName: formData.actionName,
        actionType: formData.actionType,
        purpose: formData.purpose,
        parameters
      };
      
      await updateAction(updateData);
      toast({
        title: '更新成功',
        description: `动作"${formData.actionName}"已成功更新`
      });
      
      navigate('/response-actions');
    } catch (err) {
      toast({
        title: '更新失败',
        description: err instanceof Error ? err.message : '未知错误',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/response-actions')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回列表
          </Button>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">正在加载动作信息...</p>
        </div>
      </div>
    );
  }

  // Action not found
  if (isEditMode && !action) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/response-actions')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回列表
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            未找到指定的响应动作，可能已被删��或不存在。
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/response-actions')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回列表
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              编辑动作: {action?.actionName}
            </h1>
            <p className="text-gray-500 mt-1">修改响应动作的配置</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>动作配置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Action Name */}
          <div className="space-y-2">
            <Label htmlFor="actionName">动作名称 *</Label>
            <Input
              id="actionName"
              value={formData.actionName}
              onChange={(e) => handleInputChange('actionName', e.target.value)}
              placeholder="请输入动作名称"
              className={errors.actionName ? 'border-red-500' : ''}
            />
            {errors.actionName && (
              <p className="text-sm text-red-500">{errors.actionName}</p>
            )}
          </div>

          {/* Action Type */}
          <div className="space-y-3">
            <Label>动作类型 *</Label>
            <RadioGroup
              value={formData.actionType}
              onValueChange={(value) => handleInputChange('actionType', value as 'POPUP' | 'EMAIL')}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="POPUP" id="popup" />
                <Label htmlFor="popup">网页弹窗</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="EMAIL" id="email" />
                <Label htmlFor="email">发送邮件</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Purpose */}
          <div className="space-y-2">
            <Label htmlFor="purpose">用途 *</Label>
            <Select 
              value={formData.purpose} 
              onValueChange={(value) => handleInputChange('purpose', value)}
            >
              <SelectTrigger className={errors.purpose ? 'border-red-500' : ''}>
                <SelectValue placeholder="请选择用途（AI自动触发场景）" />
              </SelectTrigger>
              <SelectContent>
                {PURPOSE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.purpose && (
              <p className="text-sm text-red-500">{errors.purpose}</p>
            )}
          </div>

          {/* Conditional Fields - Popup */}
          {formData.actionType === 'POPUP' && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium text-gray-900">网页弹窗参数</h3>
              
              <div className="space-y-2">
                <Label htmlFor="popupTitle">弹窗标题 *</Label>
                <Input
                  id="popupTitle"
                  value={formData.popupTitle}
                  onChange={(e) => handleInputChange('popupTitle', e.target.value)}
                  placeholder="请输入弹窗标题"
                  className={errors.popupTitle ? 'border-red-500' : ''}
                />
                {errors.popupTitle && (
                  <p className="text-sm text-red-500">{errors.popupTitle}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="popupContent">弹窗正文 *</Label>
                <Textarea
                  id="popupContent"
                  value={formData.popupContent}
                  onChange={(e) => handleInputChange('popupContent', e.target.value)}
                  placeholder="请输入弹窗正文内容"
                  rows={4}
                  className={errors.popupContent ? 'border-red-500' : ''}
                />
                {errors.popupContent && (
                  <p className="text-sm text-red-500">{errors.popupContent}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="popupButtonText">按钮文字 *</Label>
                <Input
                  id="popupButtonText"
                  value={formData.popupButtonText}
                  onChange={(e) => handleInputChange('popupButtonText', e.target.value)}
                  placeholder="请输入按钮文字"
                  className={errors.popupButtonText ? 'border-red-500' : ''}
                />
                {errors.popupButtonText && (
                  <p className="text-sm text-red-500">{errors.popupButtonText}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="popupButtonLink">按钮链接 *</Label>
                <Input
                  id="popupButtonLink"
                  value={formData.popupButtonLink}
                  onChange={(e) => handleInputChange('popupButtonLink', e.target.value)}
                  placeholder="https://example.com"
                  className={errors.popupButtonLink ? 'border-red-500' : ''}
                />
                {errors.popupButtonLink && (
                  <p className="text-sm text-red-500">{errors.popupButtonLink}</p>
                )}
              </div>
            </div>
          )}

          {/* Conditional Fields - Email */}
          {formData.actionType === 'EMAIL' && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium text-gray-900">邮件参数</h3>
              
              <div className="space-y-2">
                <Label htmlFor="emailSubject">邮件标题 *</Label>
                <Input
                  id="emailSubject"
                  value={formData.emailSubject}
                  onChange={(e) => handleInputChange('emailSubject', e.target.value)}
                  placeholder="请输入邮件标题"
                  className={errors.emailSubject ? 'border-red-500' : ''}
                />
                {errors.emailSubject && (
                  <p className="text-sm text-red-500">{errors.emailSubject}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailContent">邮件正文 *</Label>
                <Textarea
                  id="emailContent"
                  value={formData.emailContent}
                  onChange={(e) => handleInputChange('emailContent', e.target.value)}
                  placeholder="请输入邮件正文（支持HTML格式）"
                  rows={6}
                  className={errors.emailContent ? 'border-red-500' : ''}
                />
                {errors.emailContent && (
                  <p className="text-sm text-red-500">{errors.emailContent}</p>
                )}
                <p className="text-sm text-gray-500">
                  支持HTML格式，如: &lt;h3&gt;标题&lt;/h3&gt;&lt;p&gt;段落&lt;/p&gt;
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailSenderName">发件人名称 *</Label>
                <Input
                  id="emailSenderName"
                  value={formData.emailSenderName}
                  onChange={(e) => handleInputChange('emailSenderName', e.target.value)}
                  placeholder="请输入��件人名称"
                  className={errors.emailSenderName ? 'border-red-500' : ''}
                />
                {errors.emailSenderName && (
                  <p className="text-sm text-red-500">{errors.emailSenderName}</p>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => navigate('/response-actions')}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? '保存中...' : '保存'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
