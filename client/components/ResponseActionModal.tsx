import { useState, useEffect } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { X } from 'lucide-react';
import { 
  ResponseAction, 
  PURPOSE_OPTIONS, 
  PopupParameters, 
  EmailParameters 
} from '@/shared/responseActionsData';

interface ResponseActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAction?: ResponseAction | null;
  onSave: (action: Partial<ResponseAction>, isDraft: boolean) => void;
}

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

export default function ResponseActionModal({ 
  isOpen, 
  onClose, 
  editingAction,
  onSave 
}: ResponseActionModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const isEditMode = !!editingAction;

  // Load editing action data
  useEffect(() => {
    if (editingAction) {
      const params = editingAction.parameters;
      setFormData({
        actionName: editingAction.actionName,
        actionType: editingAction.actionType,
        purpose: editingAction.purpose,
        popupTitle: params.type === 'popup' ? params.title : '',
        popupContent: params.type === 'popup' ? params.content : '',
        popupButtonText: params.type === 'popup' ? params.buttonText : '',
        popupButtonLink: params.type === 'popup' ? params.buttonLink : '',
        emailSubject: params.type === 'email' ? params.subject : '',
        emailContent: params.type === 'email' ? params.content : '',
        emailSenderName: params.type === 'email' ? params.senderName : '',
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [editingAction, isOpen]);

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
  const handleSubmit = (isDraft: boolean = false) => {
    if (!validateForm()) return;

    const actionData: Partial<ResponseAction> = {
      actionName: formData.actionName,
      actionType: formData.actionType,
      purpose: formData.purpose,
      status: isDraft ? 'DRAFT' : 'ACTIVE',
      parameters: formData.actionType === 'POPUP' 
        ? {
            type: 'popup',
            title: formData.popupTitle,
            content: formData.popupContent,
            buttonText: formData.popupButtonText,
            buttonLink: formData.popupButtonLink,
          } as PopupParameters
        : {
            type: 'email',
            subject: formData.emailSubject,
            content: formData.emailContent,
            senderName: formData.emailSenderName,
          } as EmailParameters
    };

    if (isEditMode) {
      actionData.id = editingAction.id;
    }

    onSave(actionData, isDraft);
  };

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? `编辑动作: ${editingAction?.actionName}` : '创建新动作'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
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
                <Label htmlFor="emailSubject">邮件��题 *</Label>
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
                  placeholder="请输入发件人名称"
                  className={errors.emailSenderName ? 'border-red-500' : ''}
                />
                {errors.emailSenderName && (
                  <p className="text-sm text-red-500">{errors.emailSenderName}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          {!isEditMode && (
            <Button 
              variant="secondary" 
              onClick={() => handleSubmit(true)}
            >
              保存为草稿
            </Button>
          )}
          <Button onClick={() => handleSubmit(false)}>
            {isEditMode ? '保存' : '保存并生效'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
