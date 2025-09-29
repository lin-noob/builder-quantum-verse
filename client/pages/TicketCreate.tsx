import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { 
  TicketStatus, 
  TicketPriority, 
  TicketType,
  TICKET_PRIORITY_CONFIG,
  TICKET_TYPE_CONFIG
} from '@/shared/ticketData';
import AICopilot from '@/components/ai/AICopilot';
import { useToast } from '@/hooks/use-toast';

interface TicketFormData {
  subject: string;
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  priority: TicketPriority;
  type: TicketType;
  assignedAgent: string;
}

export default function TicketCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<TicketFormData>({
    subject: '',
    description: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    priority: 'MEDIUM',
    type: 'GENERAL_INQUIRY',
    assignedAgent: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<TicketFormData>>({});

  const handleInputChange = (field: keyof TicketFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<TicketFormData> = {};
    
    if (!formData.subject.trim()) {
      newErrors.subject = '请输入Ticket标题';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = '请输入问题描述';
    }
    
    if (!formData.customerName.trim()) {
      newErrors.customerName = '请输入客户姓名';
    }
    
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = '请输入客户邮箱';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = '请输入有效的邮箱地址';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!isDraft && !validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    // 模拟创建Ticket
    setTimeout(() => {
      const newTicketId = `ticket_${Date.now()}`;
      
      toast({
        title: isDraft ? "草稿已保存" : "Ticket已创建",
        description: isDraft 
          ? "您的Ticket草稿已保存，可以稍后继续编辑"
          : `新的Ticket已成功创建，ID: ${newTicketId}`,
      });
      
      setIsLoading(false);
      
      if (!isDraft) {
        navigate(`/tickets/${newTicketId}`);
      }
    }, 1000);
  };

  const handleCancel = () => {
    navigate('/tickets');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部导航 */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCancel}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回列表
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">创建新Ticket</h1>
                <p className="text-sm text-gray-500">填写以下信息创建客户支持工单</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleSubmit(true)}
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                保存草稿
              </Button>
              <Button 
                onClick={() => handleSubmit(false)}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                创建Ticket
              </Button>
            </div>
          </div>
        </div>

        {/* 表单内容 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* 基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="subject">Ticket标题 *</Label>
                    <Input
                      id="subject"
                      placeholder="请简要描述问题..."
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      className={errors.subject ? 'border-red-500' : ''}
                    />
                    {errors.subject && (
                      <p className="text-sm text-red-500 mt-1">{errors.subject}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="priority">优先级</Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value) => handleInputChange('priority', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择优先级" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TICKET_PRIORITY_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Ticket类型</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => handleInputChange('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择类型" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TICKET_TYPE_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.icon} {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="assignedAgent">分配给</Label>
                    <Select 
                      value={formData.assignedAgent} 
                      onValueChange={(value) => handleInputChange('assignedAgent', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择负责人" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">未分配</SelectItem>
                        <SelectItem value="张三">张三</SelectItem>
                        <SelectItem value="李四">李四</SelectItem>
                        <SelectItem value="王五">王五</SelectItem>
                        <SelectItem value="赵六">赵六</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">问题描述 *</Label>
                  <Textarea
                    id="description"
                    placeholder="请详细描述遇到的问题..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className={`min-h-[120px] resize-none ${errors.description ? 'border-red-500' : ''}`}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 客户信息 */}
            <Card>
              <CardHeader>
                <CardTitle>客户信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerName">客户姓名 *</Label>
                    <Input
                      id="customerName"
                      placeholder="请输入客户姓名"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                      className={errors.customerName ? 'border-red-500' : ''}
                    />
                    {errors.customerName && (
                      <p className="text-sm text-red-500 mt-1">{errors.customerName}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="customerEmail">客户邮箱 *</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      placeholder="请输入客户邮箱"
                      value={formData.customerEmail}
                      onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                      className={errors.customerEmail ? 'border-red-500' : ''}
                    />
                    {errors.customerEmail && (
                      <p className="text-sm text-red-500 mt-1">{errors.customerEmail}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="customerPhone">客户电话</Label>
                    <Input
                      id="customerPhone"
                      placeholder="请输入客户电话（可选）"
                      value={formData.customerPhone}
                      onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 右侧AI副驾驶 */}
      <div className="w-80 bg-white border-l">
        <AICopilot 
          context={{
            type: 'ticket_create',
            formData: formData
          }}
          onDraftGenerated={(draft) => {
            // 根据生成的草稿更新表单
            try {
              const draftData = JSON.parse(draft);
              setFormData(prev => ({
                ...prev,
                ...draftData
              }));
            } catch {
              // 如果不是JSON格式，则作为描述内容
              handleInputChange('description', draft);
            }
          }}
        />
      </div>
    </div>
  );
}