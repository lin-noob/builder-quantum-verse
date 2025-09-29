import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Mail, 
  User, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Send,
  Save,
  RefreshCw,
  Eye,
  Download
} from 'lucide-react';
import { Incident } from '@shared/types';
import { useToast } from '@/hooks/use-toast';

export default function EmailManualProcessing() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const incident = location.state?.incident as Incident;
  const [activeTab, setActiveTab] = useState('details');
  const [replyContent, setReplyContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 模拟邮件数据
  const [emailData, setEmailData] = useState({
    from: 'wangms@example.com',
    to: 'support@company.com',
    subject: '智能手机屏幕显示异常投诉',
    receivedAt: '2024-01-20 15:40:00',
    content: `尊敬的客服团队，

我于上周购买的智能手机（订单号：ORD-2024-001456）出现了严重的屏幕显示问题。具体表现为：

1. 屏幕经常出现花屏现象
2. 触摸响应不灵敏
3. 亮度调节失效

这严重影响了我的正常使用，希望能够尽快得到解决。我要求退换货或者维修处理。

期待您的回复。

王女士
联系电话：138****5678`,
    attachments: ['screenshot1.jpg', 'screenshot2.jpg'],
    priority: 'HIGH',
    sentiment: 'NEGATIVE'
  });

  useEffect(() => {
    if (!incident) {
      toast({
        title: "错误",
        description: "未找到相关事件信息",
        variant: "destructive"
      });
      navigate('/events');
    }
  }, [incident, navigate, toast]);

  const handleSendReply = async () => {
    if (!replyContent.trim()) {
      toast({
        title: "错误",
        description: "请输入回复内容",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    // 模拟发送邮件
    setTimeout(() => {
      toast({
        title: "成功",
        description: "邮件回复已发送",
      });
      setReplyContent('');
      setIsProcessing(false);
    }, 2000);
  };

  const handleSaveDraft = () => {
    toast({
      title: "成功",
      description: "草稿已保存",
    });
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'NEGATIVE':
        return <Badge variant="destructive">负面情绪</Badge>;
      case 'NEUTRAL':
        return <Badge variant="secondary">中性</Badge>;
      case 'POSITIVE':
        return <Badge variant="default">正面情绪</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <Badge variant="destructive">高优先级</Badge>;
      case 'MEDIUM':
        return <Badge variant="secondary">中优先级</Badge>;
      case 'LOW':
        return <Badge variant="outline">低优先级</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  if (!incident) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* 页面头部 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/events')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            返回事件列表
          </Button>
          <div>
            <h1 className="text-2xl font-bold">邮件手动处理</h1>
            <p className="text-gray-600">事件ID: {incident.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getSentimentBadge(emailData.sentiment)}
          {getPriorityBadge(emailData.priority)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：事件信息 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                事件信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">事件标题</Label>
                <p className="text-sm">{incident.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">AI分析</Label>
                <p className="text-sm">{incident.aiAnalysis}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">建议处理方案</Label>
                <p className="text-sm">{incident.suggestedPlan}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">创建时间</Label>
                <p className="text-sm flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(incident.createdAt).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：邮件处理 */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">邮件详情</TabsTrigger>
              <TabsTrigger value="reply">回复邮件</TabsTrigger>
              <TabsTrigger value="history">处理历史</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-500" />
                    邮件详情
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">发件人</Label>
                      <p className="text-sm flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {emailData.from}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">收件人</Label>
                      <p className="text-sm">{emailData.to}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">主题</Label>
                      <p className="text-sm font-medium">{emailData.subject}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">接收时间</Label>
                      <p className="text-sm flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {emailData.receivedAt}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-600">邮件内容</Label>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm">{emailData.content}</pre>
                    </div>
                  </div>

                  {emailData.attachments.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">附件</Label>
                      <div className="mt-2 space-y-2">
                        {emailData.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm">{attachment}</span>
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reply" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="w-5 h-5 text-green-500" />
                    回复邮件
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="replyTo">收件人</Label>
                      <Input id="replyTo" value={emailData.from} readOnly />
                    </div>
                    <div>
                      <Label htmlFor="replySubject">主题</Label>
                      <Input id="replySubject" value={`Re: ${emailData.subject}`} readOnly />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="replyContent">回复内容</Label>
                    <Textarea
                      id="replyContent"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="请输入回复内容..."
                      rows={10}
                      className="mt-2"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={handleSendReply}
                      disabled={isProcessing}
                      className="flex items-center gap-2"
                    >
                      {isProcessing ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {isProcessing ? '发送中...' : '发送回复'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleSaveDraft}
                      className="flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      保存草稿
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-500" />
                    处理历史
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">收到客户邮件</p>
                        <p className="text-xs text-gray-600">2024-01-20 15:40:00</p>
                        <p className="text-xs text-gray-500">AI已自动分类为产品质量投诉</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                        <Eye className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">事件已创建</p>
                        <p className="text-xs text-gray-600">2024-01-20 15:41:00</p>
                        <p className="text-xs text-gray-500">系统自动创建处理事件</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">转入人工处理</p>
                        <p className="text-xs text-gray-600">2024-01-20 15:42:00</p>
                        <p className="text-xs text-gray-500">当前正在人工处理中</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}