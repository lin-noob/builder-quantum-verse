import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  Download,
  Reply,
  Forward,
  Archive,
  Trash2,
  Star,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  Bot,
  Lightbulb,
  TrendingUp,
  MessageSquare,
  Zap
} from 'lucide-react';
import { Incident } from '@shared/types';
import { useToast } from '@/hooks/use-toast';

export default function EmailManualProcessing() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const incident = location.state?.incident as Incident;
  const [selectedEmail, setSelectedEmail] = useState(0);
  const [replyContent, setReplyContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiSidebarOpen, setAiSidebarOpen] = useState(true);

  // 模拟邮件列表数据
  const [emailList] = useState([
    {
      id: 1,
      from: 'wangms@example.com',
      fromName: '王明生',
      subject: '智能手机屏幕显示异常投诉',
      preview: '尊敬的客服团队，我于上周购买的智能手机出现了严重的屏幕显示问题...',
      receivedAt: '2024-01-20 15:40:00',
      isRead: false,
      isStarred: false,
      hasAttachments: true,
      priority: 'HIGH',
      sentiment: 'NEGATIVE'
    },
    {
      id: 2,
      from: 'support@company.com',
      fromName: '客服团队',
      subject: 'Re: 智能手机屏幕显示异常投诉',
      preview: '感谢您的反馈，我们已经收到您的投诉，正在安排技术人员处理...',
      receivedAt: '2024-01-20 16:20:00',
      isRead: true,
      isStarred: false,
      hasAttachments: false,
      priority: 'MEDIUM',
      sentiment: 'NEUTRAL'
    }
  ]);

  // 当前选中邮件的详细内容
  const currentEmail = {
    ...emailList[selectedEmail],
    content: `尊敬的客服团队，

我于上周购买的智能手机（订单号：ORD-2024-001456）出现了严重的屏幕显示问题。具体表现为：

1. 屏幕经常出现花屏现象
2. 触摸响应不灵敏  
3. 亮度调节失效

这严重影响了我的正常使用，希望能够尽快得到解决。我要求退换货或者维修处理。

期待您的回复。

此致
敬礼

王明生
联系电话：138****8888
购买日期：2024-01-13`,
    attachments: ['订单截图.png', '问题视频.mp4']
  };

  // AI分析数据
  const aiAnalysis = {
    sentiment: {
      score: 0.85,
      label: '强烈负面',
      confidence: 0.92
    },
    priority: {
      score: 0.78,
      label: '高优先级',
      reason: '产品质量问题，客户要求退换货'
    },
    keyPoints: [
      '产品质量问题：屏幕显示异常',
      '具体症状：花屏、触摸不灵敏、亮度调节失效',
      '客户诉求：退换货或维修',
      '订单信息：ORD-2024-001456',
      '购买时间：2024-01-13'
    ],
    suggestedActions: [
      {
        type: 'immediate',
        title: '立即回复确认',
        description: '向客户确认已收到投诉，表示重视'
      },
      {
        type: 'investigation',
        title: '产品质量调查',
        description: '联系技术部门调查产品批次问题'
      },
      {
        type: 'solution',
        title: '提供解决方案',
        description: '根据保修政策提供退换货或维修选项'
      }
    ],
    suggestedReplies: [
      {
        tone: 'professional',
        content: '尊敬的王先生，\n\n感谢您联系我们的客服团队。我们对您遇到的产品质量问题深表歉意。\n\n我们已经记录了您的投诉（投诉单号：CP-2024-001234），并将立即安排技术人员对您描述的屏幕显示问题进行调查。\n\n根据我们的保修政策，您可以选择：\n1. 免费维修服务\n2. 7天内无理由退货\n3. 同型号产品更换\n\n我们将在24小时内与您联系，安排具体的处理方案。\n\n再次为给您带来的不便深表歉意。\n\n客服团队\n2024-01-20'
      },
      {
        tone: 'empathetic',
        content: '亲爱的王先生，\n\n非常理解您对产品质量问题的担忧和不满。作为我们的重要客户，您的体验对我们来说至关重要。\n\n我已经将您的情况标记为高优先级处理，并亲自跟进您的案例。我们承诺：\n\n• 24小时内给您明确的解决方案\n• 如需退换货，我们承担所有物流费用\n• 为您提供额外的服务补偿\n\n请您保持电话畅通，我们的专员将尽快与您联系。\n\n感谢您的耐心和理解。\n\n客户关怀专员 李小雨\n直线电话：400-888-9999'
      }
    ]
  };

  useEffect(() => {
    if (!incident) {
      navigate('/events');
      return;
    }
  }, [incident, navigate]);

  const handleSendReply = async () => {
    if (!replyContent.trim()) {
      toast({
        title: "错误",
        description: "请输入回复内容",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // 模拟发送邮件
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "成功",
        description: "邮件已发送",
      });
      
      setReplyContent('');
    } catch (error) {
      toast({
        title: "错误",
        description: "发送失败，请重试",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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
        return <Badge variant="destructive" className="text-xs">负面</Badge>;
      case 'NEUTRAL':
        return <Badge variant="secondary" className="text-xs">中性</Badge>;
      case 'POSITIVE':
        return <Badge variant="default" className="text-xs">正面</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">未知</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <Badge variant="destructive" className="text-xs">高</Badge>;
      case 'MEDIUM':
        return <Badge variant="secondary" className="text-xs">中</Badge>;
      case 'LOW':
        return <Badge variant="outline" className="text-xs">低</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">-</Badge>;
    }
  };

  const useAiSuggestion = (content: string) => {
    setReplyContent(content);
    toast({
      title: "AI建议已应用",
      description: "回复内容已填入编辑器",
    });
  };

  if (!incident) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 顶部工具栏 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/events')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Reply className="w-4 h-4" />
                回复
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Forward className="w-4 h-4" />
                转发
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Archive className="w-4 h-4" />
                归档
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                删除
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAiSidebarOpen(!aiSidebarOpen)}
              className="flex items-center gap-2"
            >
              <Bot className="w-4 h-4" />
              AI助手
              {aiSidebarOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 左侧邮件列表 */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">收件箱</h2>
            <p className="text-sm text-gray-500">事件ID: {incident.id}</p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {emailList.map((email, index) => (
              <div
                key={email.id}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedEmail === index ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => setSelectedEmail(index)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${email.isRead ? 'bg-gray-300' : 'bg-blue-500'}`} />
                    <span className={`text-sm ${email.isRead ? 'text-gray-600' : 'font-semibold text-gray-900'}`}>
                      {email.fromName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getPriorityBadge(email.priority)}
                    {getSentimentBadge(email.sentiment)}
                  </div>
                </div>
                
                <h3 className={`text-sm mb-1 ${email.isRead ? 'text-gray-700' : 'font-semibold text-gray-900'}`}>
                  {email.subject}
                </h3>
                
                <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                  {email.preview}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{email.receivedAt}</span>
                  <div className="flex items-center gap-1">
                    {email.hasAttachments && <div className="w-1 h-1 bg-gray-400 rounded-full" />}
                    {email.isStarred && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 中间邮件内容区域 */}
        <div className={`flex-1 flex flex-col bg-white ${aiSidebarOpen ? '' : 'mr-0'}`}>
          {/* 邮件头部信息 */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-900 mb-2">{currentEmail.subject}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{currentEmail.fromName} &lt;{currentEmail.from}&gt;</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{currentEmail.receivedAt}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getSentimentBadge(currentEmail.sentiment)}
                {getPriorityBadge(currentEmail.priority)}
                <Button variant="ghost" size="sm">
                  <Star className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* 邮件内容 */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                {currentEmail.content}
              </pre>
            </div>

            {/* 附件 */}
            {currentEmail.attachments && currentEmail.attachments.length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">附件 ({currentEmail.attachments.length})</h4>
                <div className="space-y-2">
                  {currentEmail.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                      <span className="text-sm text-gray-700">{attachment}</span>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 回复区域 */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">回复邮件</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="replyTo" className="text-sm font-medium">收件人</Label>
                    <Input id="replyTo" value={currentEmail.from} readOnly className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="replySubject" className="text-sm font-medium">主题</Label>
                    <Input id="replySubject" value={`Re: ${currentEmail.subject}`} readOnly className="mt-1" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="replyContent" className="text-sm font-medium">回复内容</Label>
                  <Textarea
                    id="replyContent"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="请输入回复内容..."
                    rows={8}
                    className="mt-1"
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
              </div>
            </div>
          </div>
        </div>

        {/* AI侧边栏 */}
        {aiSidebarOpen && (
          <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-gray-900">AI智能助手</h2>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* 情感分析 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    情感分析
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">情感倾向</span>
                    <Badge variant="destructive">{aiAnalysis.sentiment.label}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">置信度</span>
                    <span className="text-sm font-medium">{(aiAnalysis.sentiment.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${aiAnalysis.sentiment.score * 100}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 优先级评估 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    优先级评估
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">优先级</span>
                    <Badge variant="destructive">{aiAnalysis.priority.label}</Badge>
                  </div>
                  <p className="text-xs text-gray-600">{aiAnalysis.priority.reason}</p>
                </CardContent>
              </Card>

              {/* 关键信息提取 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-500" />
                    关键信息
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {aiAnalysis.keyPoints.map((point, index) => (
                      <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                        <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* 建议处理方案 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    建议处理方案
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {aiAnalysis.suggestedActions.map((action, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-xs font-medium text-gray-900 mb-1">{action.title}</h4>
                      <p className="text-xs text-gray-600">{action.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* 智能回复建议 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-green-500" />
                    智能回复建议
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {aiAnalysis.suggestedReplies.map((reply, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {reply.tone === 'professional' ? '专业回复' : '情感回复'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => useAiSuggestion(reply.content)}
                          className="text-xs h-6 px-2"
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          使用
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-3">{reply.content}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}