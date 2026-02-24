import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical,
  Clock,
  User,
  Tag,
  BarChart3
} from 'lucide-react';
import { 
  mockTickets, 
  Ticket, 
  TicketStatus, 
  TicketPriority, 
  TicketType,
  TICKET_STATUS_CONFIG,
  TICKET_PRIORITY_CONFIG,
  TICKET_TYPE_CONFIG,
  getStatusLabel,
  getPriorityLabel,
  getTypeLabel
} from '@shared/ticketData';
import { useToast } from '@/hooks/use-toast';

export default function TicketManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<TicketType | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'priority'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 过滤和排序Tickets
  const filteredAndSortedTickets = useMemo(() => {
    let filtered = mockTickets.filter(ticket => {
      const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || ticket.priority === priorityFilter;
      const matchesType = typeFilter === 'ALL' || ticket.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesType;
    });

    // 排序
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        case 'priority':
          const priorityOrder = { 'URGENT': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        default:
          return 0;
      }
      
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });

    return filtered;
  }, [searchTerm, statusFilter, priorityFilter, typeFilter, sortBy, sortOrder]);

  const handleTicketClick = (ticketId: string) => {
    navigate(`/tickets/${ticketId}`);
  };

  const handleCreateTicket = () => {
    navigate('/tickets/create');
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

  const getStatusBadge = (status: TicketStatus) => {
    const config = TICKET_STATUS_CONFIG[status];
    return (
      <Badge className={`${config.color} text-xs`}>
        {config.icon} {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: TicketPriority) => {
    const config = TICKET_PRIORITY_CONFIG[priority];
    return (
      <Badge variant="outline" className={`${config.color} text-xs`}>
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: TicketType) => {
    const config = TICKET_TYPE_CONFIG[type];
    return (
      <Badge variant="secondary" className="text-xs">
        {config.icon} {config.label}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ticket管理</h1>
          <p className="text-gray-600 mt-1">管理客户支持工单和邮件处理</p>
        </div>
        <Button onClick={handleCreateTicket} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          创建Ticket
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{mockTickets.length}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Tag className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">待处理</p>
                <p className="text-2xl font-bold text-red-600">
                  {mockTickets.filter(t => t.status === 'OPEN').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">处理中</p>
                <p className="text-2xl font-bold text-blue-600">
                  {mockTickets.filter(t => t.status === 'IN_PROGRESS').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">平均评分</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(mockTickets
                    .filter(t => t.latestEvaluationScore)
                    .reduce((acc, t) => acc + (t.latestEvaluationScore || 0), 0) / 
                    mockTickets.filter(t => t.latestEvaluationScore).length) || 0}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索Ticket标题、客户姓名或邮箱..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TicketStatus | 'ALL')}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">全部状态</SelectItem>
                  <SelectItem value="OPEN">待处理</SelectItem>
                  <SelectItem value="IN_PROGRESS">处理中</SelectItem>
                  <SelectItem value="PENDING_CUSTOMER">等待客户</SelectItem>
                  <SelectItem value="RESOLVED">已解决</SelectItem>
                  <SelectItem value="CLOSED">已关闭</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as TicketPriority | 'ALL')}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="优先级" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">全部优先级</SelectItem>
                  <SelectItem value="URGENT">紧急</SelectItem>
                  <SelectItem value="HIGH">高</SelectItem>
                  <SelectItem value="MEDIUM">中</SelectItem>
                  <SelectItem value="LOW">低</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as TicketType | 'ALL')}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">全部类型</SelectItem>
                  <SelectItem value="TECHNICAL_SUPPORT">技术支持</SelectItem>
                  <SelectItem value="BILLING">账单问题</SelectItem>
                  <SelectItem value="FEATURE_REQUEST">功能请求</SelectItem>
                  <SelectItem value="BUG_REPORT">错误报告</SelectItem>
                  <SelectItem value="GENERAL_INQUIRY">一般咨询</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ticket列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Ticket列表</span>
            <span className="text-sm font-normal text-gray-500">
              共 {filteredAndSortedTickets.length} 个Ticket
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    客户
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    优先级
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    类型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    评估分数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    更新时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedTickets.map((ticket) => (
                  <tr 
                    key={ticket.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleTicketClick(ticket.id)}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {ticket.subject}
                        </p>
                        <p className="text-xs text-gray-500">#{ticket.id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-900">{ticket.customerName}</p>
                        <p className="text-xs text-gray-500">{ticket.customerEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="px-6 py-4">
                      {getPriorityBadge(ticket.priority)}
                    </td>
                    <td className="px-6 py-4">
                      {getTypeBadge(ticket.type)}
                    </td>
                    <td className="px-6 py-4">
                      {ticket.latestEvaluationScore ? (
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {ticket.latestEvaluationScore}/100
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">未评估</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(ticket.updatedAt)}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTicketClick(ticket.id);
                        }}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredAndSortedTickets.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">没有找到匹配的Ticket</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}