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
  Zap,
  Plus
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  // 悬浮侧边栏宽度与拖拽状态
  const [aiSidebarWidth, setAiSidebarWidth] = useState<number>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('aiSidebarWidth') : null;
    const width = saved ? parseInt(saved) : 380;
    return isNaN(width) ? 380 : width;
  });
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      // 右侧悬浮，拖拽左边缘，依据鼠标X计算宽度
      const calculated = window.innerWidth - e.clientX;
      const clamped = Math.min(Math.max(calculated, 300), 640); // 限制最小/最大宽度
      setAiSidebarWidth(clamped);
    };
    const handleMouseUp = () => {
      setIsResizing(false);
      try {
        localStorage.setItem('aiSidebarWidth', String(aiSidebarWidth));
      } catch {}
      document.body.style.cursor = '';
    };
    document.body.style.cursor = 'col-resize';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
    };
  }, [isResizing, aiSidebarWidth]);
  
  // AI对话相关状态
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: `📧 邮件智能分析报告

📊 **情感分析**
• 情感倾向：强烈负面 (85%)
• 紧急程度：高优先级
• 关键词：严重、影响、要求、退换货
• 客户类型：价值客户（有明确订单）
• 处理建议：立即回复并提供解决方案

🔍 **关键信息提取**
📋 客户信息：
• 姓名：王明生
• 联系方式：138****8888
• 邮箱：wangms@example.com

📦 订单信息：
• 订单号：ORD-2024-001456
• 购买日期：2024-01-13
• 产品：智能手机

⚠️ 问题描述：
• 屏幕花屏现象
• 触摸响应不灵敏
• 亮度调节失效

💡 客户诉求：
• 退换货或维修处理
• 希望尽快解决

💎 **客户价值评估**
📊 客户等级：高价值客户
• 购买频次：近6个月内2次购买
• 客单价：中等偏上
• 推荐潜力：高（有明确联系方式）

🎯 营销机会：
• 交叉销售：推荐手机配件
• 升级销售：新款手机预售通知
• 忠诚度计划：邀请加入VIP会员

⚠️ 风险评估：
• 流失风险：中等（问题处理满意度影响）
• 口碑影响：高（可能影响周边客户）

💡 **处理建议**
• 优先级：最高
• 补偿力度：适中偏上
• 后续营销：重点关注

需要我为您生成专业回复或提供其他帮助吗？`,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [chatInput, setChatInput] = useState('');

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

  // 移除强制跳转逻辑，允许页面在没有incident数据时正常显示
  // useEffect(() => {
  //   if (!incident) {
  //     navigate('/dashboard2');
  //     return;
  //   }
  // }, [incident, navigate]);

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

  // 处理AI对话
  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      id: chatMessages.length + 1,
      type: 'user',
      content: chatInput,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    // 模拟AI回复
    setTimeout(() => {
      const aiResponses = [
        '根据邮件内容分析，建议您首先向客户表示歉意，然后提供具体的解决方案。我可以为您生成一份专业的回复模板。',
        '这类产品质量问题通常需要技术部门介入。建议您同时联系技术支持团队，获取更详细的故障排查步骤。',
        '客户提到了订单号ORD-2024-001456，建议您先查询该订单的详细信息，包括产品批次、保修状态等。',
        '从客户的语气来看，他们比较着急。建议在回复中明确给出处理时间节点，比如"24小时内联系"等具体承诺。'
      ];
      
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      const aiMessage = {
        id: chatMessages.length + 2,
        type: 'ai',
        content: randomResponse,
        timestamp: new Date().toLocaleTimeString()
      };

      setChatMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendChatMessage();
    }
  };

  // 移除条件渲染限制，允许页面在没有incident数据时正常显示
  // if (!incident) {
  //   return null;
  // }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 顶部工具栏 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(-1)}
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
            <p className="text-sm text-gray-500">事件ID: {incident?.id || '演示模式'}</p>
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

        {/* AI对话悬浮侧边栏 */}
        {aiSidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setAiSidebarOpen(false)}
            />
            <div
              className="fixed right-0 top-0 h-full max-w-[90vw] bg-white dark:bg-neutral-900 border-l border-gray-200 shadow-xl z-50 flex flex-col relative"
              style={{ width: aiSidebarWidth }}
            >
              {/* 左侧拖拽手柄 */}
              <div
                className="absolute left-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-gray-200/50"
                onMouseDown={() => setIsResizing(true)}
                title="拖拽调整宽度"
              />
            {/* 对话头部 */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-blue-600" />
                  <h2 className="font-semibold text-gray-900">AI智能助手</h2>
                </div>
                <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => setChatMessages([{
                     id: 1,
                     type: 'ai',
                     content: `📧 邮件智能分析报告

📊 **情感分析**
• 情感倾向：强烈负面 (85%)
• 紧急程度：高优先级
• 关键词：严重、影响、要求、退换货
• 客户类型：价值客户（有明确订单）
• 处理建议：立即回复并提供解决方案

🔍 **关键信息提取**
📋 客户信息：
• 姓名：王明生
• 联系方式：138****8888
• 邮箱：wangms@example.com

📦 订单信息：
• 订单号：ORD-2024-001456
• 购买日期：2024-01-13
• 产品：智能手机

⚠️ 问题描述：
• 屏幕花屏现象
• 触摸响应不灵敏
• 亮度调节失效

💡 客户诉求：
• 退换货或维修处理
• 希望尽快解决

💎 **客户价值评估**
📊 客户等级：高价值客户
• 购买频次：近6个月内2次购买
• 客单价：中等偏上
• 推荐潜力：高（有明确联系方式）

🎯 营销机会：
• 交叉销售：推荐手机配件
• 升级销售：新款手机预售通知
• 忠诚度计划：邀请加入VIP会员

⚠️ 风险评估：
• 流失风险：中等（问题处理满意度影响）
• 口碑影响：高（可能影响周边客户）

💡 **处理建议**
• 优先级：最高
• 补偿力度：适中偏上
• 后续营销：重点关注

需要我为您生成专业回复或提供其他帮助吗？`,
                     timestamp: new Date().toLocaleTimeString()
                   }])}
                   className="text-xs"
                 >
                  <Plus className="w-4 h-4" />
                  新对话
                </Button>
              </div>
            </div>

            {/* 对话消息区域 */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      <div className="flex items-center justify-between mt-2">
                        <div
                          className={`text-xs ${
                            message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          {message.timestamp}
                        </div>
                        {message.type === 'ai' && (message.content.includes('回复模板') || message.content.includes('跟进邮件')) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // 提取邮件内容（去除标题和格式）
                              let emailContent = message.content;
                              if (emailContent.includes('回复模板：')) {
                                emailContent = emailContent.split('回复模板：')[1] || emailContent;
                              }
                              if (emailContent.includes('跟进邮件模板：')) {
                                emailContent = emailContent.split('跟进邮件模板：')[1] || emailContent;
                              }
                              // 去除主题行
                              if (emailContent.includes('主题：')) {
                                const lines = emailContent.split('\n');
                                emailContent = lines.slice(2).join('\n');
                              }
                              setReplyContent(emailContent.trim());
                              toast({
                                title: "内容已应用",
                                description: "AI生成的内容已填入回复框",
                              });
                            }}
                            className="text-xs h-6 px-2 text-gray-600 hover:text-gray-900"
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            应用到回复
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* AI快捷功能区 */}
              <div className="p-3 border-t border-gray-100">
                <div className="text-xs font-medium text-gray-700 mb-2">AI助手</div>
                <div className="flex gap-2 overflow-x-auto pb-2 whitespace-nowrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const message = {
                        id: chatMessages.length + 1,
                        type: 'user',
                        content: '帮我生成专业回复',
                        timestamp: new Date().toLocaleTimeString()
                      };
                      setChatMessages(prev => [...prev, message]);
                      setTimeout(() => {
                        const aiMessage = {
                          id: chatMessages.length + 2,
                          type: 'ai',
                          content: '好的，我为您生成一份专业的回复模板：\n\n尊敬的王先生，\n\n感谢您联系我们的客服团队。我们对您遇到的产品质量问题深表歉意。\n\n我们已经记录了您的投诉（投诉单号：CP-2024-001234），并将立即安排技术人员对您描述的屏幕显示问题进行调查。\n\n根据我们的保修政策，您可以选择：\n1. 免费维修服务\n2. 7天内无理由退货\n3. 同型号产品更换\n\n我们将在24小时内与您联系，安排具体的处理方案。\n\n再次为给您带来的不便深表歉意。\n\n客服团队\n2024-01-20',
                          timestamp: new Date().toLocaleTimeString()
                        };
                        setChatMessages(prev => [...prev, aiMessage]);
                      }, 1000);
                    }}
                    className="text-xs whitespace-nowrap flex-shrink-0"
                  >
                    生成回复
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const message = {
                        id: chatMessages.length + 1,
                        type: 'user',
                        content: '生成跟进邮件',
                        timestamp: new Date().toLocaleTimeString()
                      };
                      setChatMessages(prev => [...prev, message]);
                      setTimeout(() => {
                        const aiMessage = {
                          id: chatMessages.length + 2,
                          type: 'ai',
                          content: '📧 跟进邮件模板：\n\n主题：关于您的产品问题处理进展 - 订单ORD-2024-001456\n\n尊敬的王先生，\n\n我是负责跟进您产品问题的客服专员。\n\n关于您反映的智能手机屏幕显示问题，我们的技术团队已完成初步检测，确认这是该批次产品的已知问题。\n\n为了表达我们的歉意，我们为您准备了以下补偿方案：\n1. 免费更换全新设备\n2. 延长保修期至2年\n3. 赠送价值200元的配件大礼包\n\n请您回复确认最方便的处理时间，我们将安排专人上门服务。\n\n感谢您的耐心等待！',
                          timestamp: new Date().toLocaleTimeString()
                        };
                        setChatMessages(prev => [...prev, aiMessage]);
                      }, 1000);
                    }}
                    className="text-xs whitespace-nowrap flex-shrink-0"
                  >
                    跟进邮件
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const message = {
                        id: chatMessages.length + 1,
                        type: 'user',
                        content: '优化营销策略',
                        timestamp: new Date().toLocaleTimeString()
                      };
                      setChatMessages(prev => [...prev, message]);
                      setTimeout(() => {
                        const aiMessage = {
                          id: chatMessages.length + 2,
                          type: 'ai',
                          content: '📈 营销策略优化建议：\n\n🎯 个性化策略：\n• 基于客户购买历史定制内容\n• 使用客户姓名进行个性化称呼\n• 根据问题类型调整回复语调\n\n⏰ 时机优化：\n• 负面情感邮件：2小时内回复\n• 一般咨询：24小时内回复\n• 跟进邮件：3-5天后发送\n\n📝 内容优化：\n• 开头表示理解和歉意\n• 中间提供具体解决方案\n• 结尾给出明确时间承诺\n• 附加价值：提供使用技巧或优惠',
                          timestamp: new Date().toLocaleTimeString()
                        };
                        setChatMessages(prev => [...prev, aiMessage]);
                      }, 1000);
                    }}
                    className="text-xs whitespace-nowrap flex-shrink-0"
                  >
                    营销策略
                  </Button>
                  {/* 新增邮箱营销快捷功能 */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const message = {
                        id: chatMessages.length + 1,
                        type: 'user',
                        content: '生成A/B测试主题',
                        timestamp: new Date().toLocaleTimeString()
                      };
                      setChatMessages(prev => [...prev, message]);
                      setTimeout(() => {
                        const aiMessage = {
                          id: chatMessages.length + 2,
                          type: 'ai',
                          content: '🅰️/🅱️ 主题备选：\n\nA) 关于您反馈的问题处理进展（附补偿方案）\nB) 我们已准备好解决方案与专属优惠（请查收）\n\n建议：同时测试“含具体承诺”与“含优惠”两种风格，以观察打开率差异。',
                          timestamp: new Date().toLocaleTimeString()
                        };
                        setChatMessages(prev => [...prev, aiMessage]);
                      }, 800);
                    }}
                    className="text-xs whitespace-nowrap flex-shrink-0"
                  >
                    A/B主题
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const message = {
                        id: chatMessages.length + 1,
                        type: 'user',
                        content: '生成CTA建议',
                        timestamp: new Date().toLocaleTimeString()
                      };
                      setChatMessages(prev => [...prev, message]);
                      setTimeout(() => {
                        const aiMessage = {
                          id: chatMessages.length + 2,
                          type: 'ai',
                          content: '📣 CTA建议：\n• 立即确认处理方案\n• 预约上门服务时间\n• 领取专属补偿礼包\n• 查看保修延长详情\n\n文案提示：将CTA置于首屏区域，使用动词开头，减少认知负担。',
                          timestamp: new Date().toLocaleTimeString()
                        };
                        setChatMessages(prev => [...prev, aiMessage]);
                      }, 800);
                    }}
                    className="text-xs whitespace-nowrap flex-shrink-0"
                  >
                    CTA建议
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const message = {
                        id: chatMessages.length + 1,
                        type: 'user',
                        content: '推荐发送时机',
                        timestamp: new Date().toLocaleTimeString()
                      };
                      setChatMessages(prev => [...prev, message]);
                      setTimeout(() => {
                        const aiMessage = {
                          id: chatMessages.length + 2,
                          type: 'ai',
                          content: '⏰ 发送时机建议：\n• 客服回复：尽量在2小时内\n• 跟进确认：工作日 10:00-12:00 或 14:00-16:00\n• 优惠通知：周二/周四上午\n\n说明：基于常见打开率趋势与客户当前负面情绪，需要更快响应以提升满意度。',
                          timestamp: new Date().toLocaleTimeString()
                        };
                        setChatMessages(prev => [...prev, aiMessage]);
                      }, 800);
                    }}
                    className="text-xs whitespace-nowrap flex-shrink-0"
                  >
                    发送时机
                  </Button>
                </div>
              </div>

            {/* 输入区域 */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <Textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="输入您的问题..."
                  rows={2}
                  className="flex-1 resize-none"
                />
                <Button
                  onClick={handleSendChatMessage}
                  disabled={!chatInput.trim()}
                  size="sm"
                  className="self-end"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
            </div>
          </>
        )}

        {/* 悬浮打开按钮（当侧边栏关闭时显示） */}
        {!aiSidebarOpen && (
          <Button
            onClick={() => setAiSidebarOpen(true)}
            size="sm"
            className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg px-4"
          >
            <Bot className="w-4 h-4 mr-2" />
            AI
          </Button>
        )}
      </div>
    </div>
  );
}