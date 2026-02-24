import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  History, 
  Webhook, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Copy,
  ExternalLink,
  Filter,
  Search
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface WebhookConfig {
  id: string;
  name: string;
  endpointUrl: string;
  description?: string;
  events: string[];
  headers: Record<string, string>;
  secret?: string;
  enabled: boolean;
  retryConfig: {
    maxRetries: number;
    retryDelay: number;
  };
  createdAt: string;
  updatedAt: string;
  lastTriggered?: string;
  triggerCount: number;
  successRate: number;
}

interface WebhookLog {
  id: string;
  webhookId: string;
  event: string;
  status: 'success' | 'failed' | 'pending';
  request: {
    url: string;
    headers: Record<string, string>;
    body: any;
    timestamp: string;
  };
  response?: {
    status: number;
    headers: Record<string, string>;
    body: any;
    timestamp: string;
  };
  error?: string;
  retryCount: number;
  duration: number;
}

const AVAILABLE_EVENTS = [
  'customer.created',
  'customer.updated',
  'customer.deleted',
  'order.created',
  'order.updated',
  'order.completed',
  'order.cancelled',
  'payment.succeeded',
  'payment.failed',
  'subscription.created',
  'subscription.cancelled',
  'user.login',
  'user.logout',
  'entity.created',
  'entity.updated',
  'entity.deleted',
  'capability.executed',
  'rule.triggered',
  'event.emitted'
];

const MOCK_WEBHOOKS: WebhookConfig[] = [
  {
    id: '1',
    name: '客户数据同步',
    endpointUrl: 'https://api.company.com/webhooks/customers',
    description: '同步客户创建和更新事件到CRM系统',
    events: ['customer.created', 'customer.updated'],
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'demo-key-123'
    },
    secret: 'webhook-secret-123',
    enabled: true,
    retryConfig: {
      maxRetries: 3,
      retryDelay: 5000
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    lastTriggered: '2024-01-15T14:30:00Z',
    triggerCount: 45,
    successRate: 95.5
  },
  {
    id: '2',
    name: '订单通知',
    endpointUrl: 'https://api.company.com/webhooks/orders',
    description: '处理订单相关事件通知',
    events: ['order.created', 'order.completed', 'order.cancelled'],
    headers: {
      'Content-Type': 'application/json'
    },
    enabled: false,
    retryConfig: {
      maxRetries: 5,
      retryDelay: 10000
    },
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
    triggerCount: 12,
    successRate: 83.3
  }
];

const MOCK_LOGS: WebhookLog[] = [
  {
    id: '1',
    webhookId: '1',
    event: 'customer.created',
    status: 'success',
    request: {
      url: 'https://api.company.com/webhooks/customers',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'demo-key-123'
      },
      body: {
        event: 'customer.created',
        data: {
          id: 'cust_123',
          name: '张三',
          email: 'zhangsan@example.com'
        },
        timestamp: '2024-01-15T14:30:00Z'
      },
      timestamp: '2024-01-15T14:30:00Z'
    },
    response: {
      status: 200,
      headers: {
        'content-type': 'application/json'
      },
      body: {
        success: true,
        message: 'Customer created successfully'
      },
      timestamp: '2024-01-15T14:30:01Z'
    },
    retryCount: 0,
    duration: 1245
  },
  {
    id: '2',
    webhookId: '1',
    event: 'customer.updated',
    status: 'failed',
    request: {
      url: 'https://api.company.com/webhooks/customers',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'demo-key-123'
      },
      body: {
        event: 'customer.updated',
        data: {
          id: 'cust_456',
          name: '李四',
          email: 'lisi@example.com'
        },
        timestamp: '2024-01-15T14:25:00Z'
      },
      timestamp: '2024-01-15T14:25:00Z'
    },
    error: 'Connection timeout',
    retryCount: 3,
    duration: 30000
  }
];

export default function WebhookManagement() {
  const { toast } = useToast();
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>(MOCK_WEBHOOKS);
  const [logs, setLogs] = useState<WebhookLog[]>(MOCK_LOGS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'webhooks' | 'logs'>('webhooks');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [selectedWebhookForLogs, setSelectedWebhookForLogs] = useState<string>('all');

  const [formData, setFormData] = useState<Partial<WebhookConfig>>({
    name: '',
    endpointUrl: '',
    description: '',
    events: [],
    headers: {},
    secret: '',
    enabled: true,
    retryConfig: {
      maxRetries: 3,
      retryDelay: 5000
    }
  });

  const [headerKey, setHeaderKey] = useState('');
  const [headerValue, setHeaderValue] = useState('');

  const filteredWebhooks = webhooks.filter(webhook => {
    const matchesSearch = webhook.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         webhook.endpointUrl.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'enabled' && webhook.enabled) ||
                         (filterStatus === 'disabled' && !webhook.enabled);
    return matchesSearch && matchesFilter;
  });

  const filteredLogs = logs.filter(log => 
    selectedWebhookForLogs === 'all' || log.webhookId === selectedWebhookForLogs
  );

  const handleCreateWebhook = () => {
    setEditingWebhook(null);
    setFormData({
      name: '',
      endpointUrl: '',
      description: '',
      events: [],
      headers: {},
      secret: '',
      enabled: true,
      retryConfig: {
        maxRetries: 3,
        retryDelay: 5000
      }
    });
    setIsDialogOpen(true);
  };

  const handleEditWebhook = (webhook: WebhookConfig) => {
    setEditingWebhook(webhook);
    setFormData(webhook);
    setIsDialogOpen(true);
  };

  const handleDeleteWebhook = (webhookId: string) => {
    if (window.confirm('确定要删除这个Webhook吗？')) {
      setWebhooks(webhooks.filter(w => w.id !== webhookId));
      toast({
        title: '删除成功',
        description: 'Webhook已删除',
      });
    }
  };

  const handleSaveWebhook = () => {
    if (!formData.name || !formData.endpointUrl) {
      toast({
        title: '验证失败',
        description: '请填写必填字段',
        variant: 'destructive',
      });
      return;
    }

    if (editingWebhook) {
      const updatedWebhook = {
        ...editingWebhook,
        ...formData,
        updatedAt: new Date().toISOString()
      } as WebhookConfig;
      setWebhooks(webhooks.map(w => w.id === editingWebhook.id ? updatedWebhook : w));
      toast({
        title: '更新成功',
        description: 'Webhook已更新',
      });
    } else {
      const newWebhook = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        triggerCount: 0,
        successRate: 100
      } as WebhookConfig;
      setWebhooks([...webhooks, newWebhook]);
      toast({
        title: '创建成功',
        description: 'Webhook已创建',
      });
    }

    setIsDialogOpen(false);
  };

  const handleTestWebhook = (webhook: WebhookConfig) => {
    toast({
      title: '测试已发送',
      description: `正在测试Webhook: ${webhook.name}`,
    });
    // 模拟测试结果
    setTimeout(() => {
      toast({
        title: '测试完成',
        description: 'Webhook测试成功',
      });
    }, 2000);
  };

  const addHeader = () => {
    if (headerKey && headerValue) {
      setFormData({
        ...formData,
        headers: {
          ...formData.headers,
          [headerKey]: headerValue
        }
      });
      setHeaderKey('');
      setHeaderValue('');
    }
  };

  const removeHeader = (key: string) => {
    const newHeaders = { ...formData.headers };
    delete newHeaders[key];
    setFormData({ ...formData, headers: newHeaders });
  };

  const getStatusBadge = (enabled: boolean) => {
    return enabled ? 
      <Badge className="bg-green-100 text-green-800">启用</Badge> : 
      <Badge className="bg-gray-100 text-gray-800">禁用</Badge>;
  };

  const getLogStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />成功</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />失败</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />待处理</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Webhook管理</h1>
          <p className="text-gray-600">管理您的Webhook配置和监控事件触发</p>
        </div>
        <Button onClick={handleCreateWebhook}>
          <Plus className="w-4 h-4 mr-2" />
          创建Webhook
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'webhooks' | 'logs')}>
        <TabsList>
          <TabsTrigger value="webhooks">Webhook配置</TabsTrigger>
          <TabsTrigger value="logs">触发日志</TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks" className="space-y-4">
          {/* 搜索和过滤 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="搜索Webhook名称或URL..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="状态筛选" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部状态</SelectItem>
                      <SelectItem value="enabled">已启用</SelectItem>
                      <SelectItem value="disabled">已禁用</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Webhook列表 */}
          <Card>
            <CardHeader>
              <CardTitle>Webhook列表</CardTitle>
              <CardDescription>配置和管理您的Webhook端点</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名称</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>事件</TableHead>
                    <TableHead>触发次数</TableHead>
                    <TableHead>成功率</TableHead>
                    <TableHead>最后触发</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWebhooks.map((webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell className="font-medium">{webhook.name}</TableCell>
                      <TableCell>{getStatusBadge(webhook.enabled)}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        <a href={webhook.endpointUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                          {webhook.endpointUrl}
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {webhook.events.slice(0, 2).map((event) => (
                            <Badge key={event} variant="outline" className="text-xs">{event}</Badge>
                          ))}
                          {webhook.events.length > 2 && (
                            <Badge variant="outline" className="text-xs">+{webhook.events.length - 2}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{webhook.triggerCount}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${webhook.successRate >= 90 ? 'bg-green-500' : webhook.successRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${webhook.successRate}%` }}
                            />
                          </div>
                          <span className="text-sm">{webhook.successRate}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {webhook.lastTriggered ? new Date(webhook.lastTriggered).toLocaleString() : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTestWebhook(webhook)}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditWebhook(webhook)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteWebhook(webhook.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          {/* 日志筛选 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>选择Webhook</Label>
                  <Select value={selectedWebhookForLogs} onValueChange={setSelectedWebhookForLogs}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择Webhook查看日志" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部Webhook</SelectItem>
                      {webhooks.map((webhook) => (
                        <SelectItem key={webhook.id} value={webhook.id}>{webhook.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline">
                    <History className="w-4 h-4 mr-2" />
                    刷新日志
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 日志列表 */}
          <Card>
            <CardHeader>
              <CardTitle>触发日志</CardTitle>
              <CardDescription>查看Webhook的触发历史和详细信息</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>时间</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>事件</TableHead>
                    <TableHead>Webhook</TableHead>
                    <TableHead>耗时</TableHead>
                    <TableHead>重试次数</TableHead>
                    <TableHead>错误信息</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{new Date(log.request.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{getLogStatusBadge(log.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.event}</Badge>
                      </TableCell>
                      <TableCell>
                        {webhooks.find(w => w.id === log.webhookId)?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>{log.duration}ms</TableCell>
                      <TableCell>{log.retryCount}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {log.error || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 创建/编辑对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingWebhook ? '编辑Webhook' : '创建Webhook'}</DialogTitle>
            <DialogDescription>
              配置您的Webhook端点和事件订阅
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">名称 *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="输入Webhook名称"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="endpointUrl">Endpoint URL *</Label>
              <Input
                id="endpointUrl"
                value={formData.endpointUrl || ''}
                onChange={(e) => setFormData({ ...formData, endpointUrl: e.target.value })}
                placeholder="https://your-api.com/webhook"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="描述这个Webhook的用途"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label>订阅事件</Label>
              <div className="border rounded-md p-4 max-h-40 overflow-y-auto">
                {AVAILABLE_EVENTS.map((event) => (
                  <div key={event} className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      id={`event-${event}`}
                      checked={formData.events?.includes(event) || false}
                      onChange={(e) => {
                        const currentEvents = formData.events || [];
                        if (e.target.checked) {
                          setFormData({ ...formData, events: [...currentEvents, event] });
                        } else {
                          setFormData({ ...formData, events: currentEvents.filter(e => e !== event) });
                        }
                      }}
                    />
                    <Label htmlFor={`event-${event}`} className="text-sm">{event}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>自定义Headers</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Header名称"
                  value={headerKey}
                  onChange={(e) => setHeaderKey(e.target.value)}
                />
                <Input
                  placeholder="Header值"
                  value={headerValue}
                  onChange={(e) => setHeaderValue(e.target.value)}
                />
                <Button type="button" onClick={addHeader}>
                  添加
                </Button>
              </div>
              <div className="space-y-2">
                {Object.entries(formData.headers || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="font-mono text-sm flex-1">{key}: {value}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeHeader(key)}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="secret">Secret (可选)</Label>
              <Input
                id="secret"
                type="password"
                value={formData.secret || ''}
                onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
                placeholder="用于验证Webhook签名的密钥"
              />
            </div>

            <div className="grid gap-2">
              <Label>重试配置</Label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="maxRetries" className="text-sm">最大重试次数</Label>
                  <Input
                    id="maxRetries"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.retryConfig?.maxRetries || 3}
                    onChange={(e) => setFormData({
                      ...formData,
                      retryConfig: {
                        ...formData.retryConfig,
                        maxRetries: parseInt(e.target.value)
                      }
                    })}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="retryDelay" className="text-sm">重试延迟 (毫秒)</Label>
                  <Input
                    id="retryDelay"
                    type="number"
                    min="1000"
                    step="1000"
                    value={formData.retryConfig?.retryDelay || 5000}
                    onChange={(e) => setFormData({
                      ...formData,
                      retryConfig: {
                        ...formData.retryConfig,
                        retryDelay: parseInt(e.target.value)
                      }
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="enabled"
                checked={formData.enabled || false}
                onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
              />
              <Label htmlFor="enabled">启用Webhook</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveWebhook}>
              {editingWebhook ? '更新' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}