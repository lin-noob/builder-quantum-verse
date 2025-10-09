import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Send, 
  Clock, 
  User, 
  Mail, 
  Phone,
  Calendar,
  MessageSquare,
  BarChart3,
  Star,
  AlertCircle,
  CheckCircle,
  Edit
} from 'lucide-react';
import { 
  mockTickets, 
  Ticket, 
  TicketMessage,
  TicketEvaluation,
  TICKET_STATUS_CONFIG,
  TICKET_PRIORITY_CONFIG,
  TICKET_TYPE_CONFIG
} from '@/shared/ticketData';
import AICopilot from '@/components/ai/AICopilot';
import { useToast } from '@/hooks/use-toast';

export default function TicketDetail() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('messages');

  useEffect(() => {
    // 模拟从API获取ticket数据
    const foundTicket = mockTickets.find(t => t.id === ticketId);
    if (foundTicket) {
      setTicket(foundTicket);
    } else {
      toast({
        title: "错误",
        description: "未找到指定的Ticket",
        variant: "destructive",
      });
      navigate('/tickets');
    }
  }, [ticketId, navigate, toast]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !ticket) return;
    
    setIsLoading(true);
    
    // 模拟发送消息
    setTimeout(() => {
      const message: TicketMessage = {
        id: `msg_${Date.now()}`,
        sender: 'agent',
        senderName: '客服代表',
        content: newMessage,
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      
      setTicket(prev => prev ? {
        ...prev,
        messages: [...prev.messages, message],
        updatedAt: new Date().toISOString()
      } : null);
      
      setNewMessage('');
      setIsLoading(false);
      
      toast({
        title: "消息已发送",
        description: "您的回复已成功发送给客户",
      });
    }, 1000);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!ticket) return;
    
    const updatedTicket = {
      ...ticket,
      status: newStatus as any,
      updatedAt: new Date().toISOString(),
      ...(newStatus === 'CLOSED' ? { closedAt: new Date().toISOString() } : {})
    };
    
    setTicket(updatedTicket);
    
    // 如果状态变为CLOSED，自动触发AI评估
    if (newStatus === 'CLOSED') {
      try {
        // 模拟AI评估过程
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const autoEvaluation = {
          id: `eval_auto_${Date.now()}`,
          ticketId: ticket.id,
          score: Math.floor(Math.random() * 20) + 80, // 80-100分
          evaluatedAt: new Date().toISOString(),
          summary: "系统自动评估：该Ticket处理流程规范，客户问题得到有效解决。",
          details: [
            { type: 'positive' as const, content: '及时响应客户需求，处理流程规范' },
            { type: 'positive' as const, content: '问题解决方案有效，客户满意度较高' },
            { type: 'neutral' as const, content: 'Ticket已正常关闭，建议后续跟进客户反馈' }
          ],
          evaluationType: 'AUTO' as const
        };
        
        setTicket(prev => prev ? {
          ...prev,
          evaluations: [...prev.evaluations, autoEvaluation],
          latestEvaluationScore: autoEvaluation.score,
          latestEvaluationTime: autoEvaluation.evaluatedAt
        } : null);
        
        toast({
          title: "自动评估完成",
          description: `AI已完成Ticket评估，评分: ${autoEvaluation.score}/100`,
        });
      } catch (error) {
        console.error('Auto evaluation failed:', error);
      }
    }
    
    toast({
      title: "状态已更新",
      description: `Ticket状态已更新为: ${TICKET_STATUS_CONFIG[newStatus as keyof typeof TICKET_STATUS_CONFIG]?.label}`,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const config = TICKET_STATUS_CONFIG[status as keyof typeof TICKET_STATUS_CONFIG];
    if (!config) return null;
    
    return (
      <Badge className={`${config.color} text-xs`}>
        {config.icon} {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const config = TICKET_PRIORITY_CONFIG[priority as keyof typeof TICKET_PRIORITY_CONFIG];
    if (!config) return null;
    
    return (
      <Badge variant="outline" className={`${config.color} text-xs`}>
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const config = TICKET_TYPE_CONFIG[type as keyof typeof TICKET_TYPE_CONFIG];
    if (!config) return null;
    
    return (
      <Badge variant="secondary" className="text-xs">
        {config.icon} {config.label}
      </Badge>
    );
  };

  const getEvaluationScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (!ticket) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

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
                onClick={() => navigate('/tickets')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回列表
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{ticket.subject}</h1>
                <p className="text-sm text-gray-500">Ticket #{ticket.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(ticket.status)}
              {getPriorityBadge(ticket.priority)}
              {getTypeBadge(ticket.type)}
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex">
            {/* 左侧主要内容 */}
            <div className="flex-1 flex flex-col">
              {/* Ticket基本信息 */}
              <div className="bg-white border-b p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">客户信息</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{ticket.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{ticket.customerEmail}</span>
                        </div>
                        {ticket.customerPhone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{ticket.customerPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Ticket详情</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>创建: {formatDate(ticket.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>更新: {formatDate(ticket.updatedAt)}</span>
                        </div>
                        {ticket.assignedAgent && (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>负责人: {ticket.assignedAgent}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">评估信息</h3>
                      {ticket.latestEvaluationScore ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-gray-400" />
                            <Badge className={`${getEvaluationScoreColor(ticket.latestEvaluationScore)} border-0`}>
                              {ticket.latestEvaluationScore}/100
                            </Badge>
                          </div>
                          {ticket.latestEvaluationDate && (
                            <p className="text-xs text-gray-500">
                              评估时间: {formatDate(ticket.latestEvaluationDate)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">暂无评估</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 标签页内容 */}
              <div className="flex-1 overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                  <TabsList className="bg-white border-b rounded-none w-full justify-start px-6">
                    <TabsTrigger value="messages" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      消息历史 ({ticket.messages.length})
                    </TabsTrigger>
                    <TabsTrigger value="evaluations" className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      评估记录 ({ticket.evaluations.length})
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="messages" className="flex-1 flex flex-col m-0">
                    {/* 消息列表 */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {ticket.messages.map((message) => (
                        <div 
                          key={message.id} 
                          className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-2xl ${
                            message.sender === 'agent' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-white border'
                          } rounded-lg p-4 shadow-sm`}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium">
                                {message.senderName}
                              </span>
                              <span className={`text-xs ${
                                message.sender === 'agent' ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {formatDate(message.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* 回复区域 */}
                    <div className="bg-white border-t p-6">
                      <div className="space-y-4">
                        <Textarea
                          placeholder="输入您的回复..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="min-h-[100px] resize-none"
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <select 
                              className="text-sm border rounded px-3 py-1"
                              value={ticket.status}
                              onChange={(e) => handleStatusChange(e.target.value)}
                            >
                              <option value="OPEN">待处理</option>
                              <option value="IN_PROGRESS">处理中</option>
                              <option value="PENDING_CUSTOMER">等待客户</option>
                              <option value="RESOLVED">已解决</option>
                              <option value="CLOSED">已关闭</option>
                            </select>
                          </div>
                          <Button 
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim() || isLoading}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {isLoading ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                              <Send className="h-4 w-4 mr-2" />
                            )}
                            发送回复
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="evaluations" className="flex-1 overflow-y-auto m-0 p-6">
                    <div className="space-y-4">
                      {ticket.evaluations.length > 0 ? (
                        ticket.evaluations.map((evaluation) => (
                          <Card key={evaluation.id}>
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <BarChart3 className="h-5 w-5" />
                                  评估记录
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                  <Badge className={`${getEvaluationScoreColor(evaluation.score)} border-0`}>
                                    {evaluation.score}/100
                                  </Badge>
                                  <span className="text-sm text-gray-500">
                                    {formatDate(evaluation.evaluatedAt)}
                                  </span>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">会话摘要</h4>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                  {evaluation.summary}
                                </p>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">评估详情</h4>
                                <div className="space-y-2">
                                  {evaluation.details.map((detail, index) => (
                                    <div key={index} className="flex items-start gap-2 text-sm">
                                      {detail.type === 'positive' ? (
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                      ) : detail.type === 'negative' ? (
                                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                      ) : (
                                        <Star className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                      )}
                                      <span className="text-gray-700">{detail.content}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">暂无评估记录</p>
                          <p className="text-sm text-gray-400 mt-1">
                            当Ticket状态变为"已关闭"时将自动生成评估
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧AI副驾驶 */}
      <div className="w-80 bg-white border-l">
        <AICopilot 
          ticketId={ticket?.id}
          currentDraft={newMessage}
          context={{
            type: 'ticket',
            ticketId: ticket?.id,
            subject: ticket?.subject,
            messages: ticket?.messages,
            currentMessage: newMessage
          }}
          onDraftGenerated={(draft) => setNewMessage(draft)}
          onMessageUpdate={(message) => setNewMessage(message)}
          onEvaluationCompleted={(evaluation) => {
            if (ticket) {
              setTicket(prev => prev ? {
                ...prev,
                evaluations: [...prev.evaluations, evaluation],
                latestEvaluationScore: evaluation.score,
                latestEvaluationTime: evaluation.evaluatedAt
              } : null);
            }
          }}
        />
      </div>
    </div>
  );
}