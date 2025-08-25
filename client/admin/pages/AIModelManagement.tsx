import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Settings, Plus, Edit, Trash2, Brain, Zap, Globe, Key, TestTube, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

// AI模型类型枚举
export type AIModelType = 'GPT' | 'Claude' | 'Gemini' | 'Custom';
export type AIModelStatus = 'active' | 'inactive' | 'testing';

// AI模型接口
export interface AIModel {
  id: string;
  name: string;
  type: AIModelType;
  provider: string;
  status: AIModelStatus;
  apiEndpoint: string;
  apiKey: string;
  maxTokens: number;
  temperature: number;
  description: string;
  supportedScenarios: string[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  usageStats: {
    totalRequests: number;
    successRate: number;
    avgResponseTime: number;
    costPerMonth: number;
  };
}

// AI提示词模板
export interface PromptTemplate {
  id: string;
  name: string;
  scenario: string;
  content: string;
  variables: string[];
  modelId?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// 模拟数据
const mockAIModels: AIModel[] = [
  {
    id: 'model_1',
    name: 'GPT-4 Turbo',
    type: 'GPT',
    provider: 'OpenAI',
    status: 'active',
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: 'sk-...***',
    maxTokens: 4096,
    temperature: 0.7,
    description: '最新的GPT-4 Turbo模型，支持最长上下文，适合复杂的营销文案生成',
    supportedScenarios: ['add_to_cart', 'view_product', 'user_signup', 'purchase'],
    isDefault: true,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    usageStats: {
      totalRequests: 12580,
      successRate: 98.5,
      avgResponseTime: 1200,
      costPerMonth: 485.50
    }
  },
  {
    id: 'model_2',
    name: 'Claude 3.5 Sonnet',
    type: 'Claude',
    provider: 'Anthropic',
    status: 'active',
    apiEndpoint: 'https://api.anthropic.com/v1/messages',
    apiKey: 'sk-ant-...***',
    maxTokens: 8192,
    temperature: 0.8,
    description: 'Anthropic的Claude 3.5，擅长理解上下文和生成高质量文案',
    supportedScenarios: ['user_login', 'exit_intent', 'submit_form'],
    isDefault: false,
    createdAt: '2024-01-12T09:30:00Z',
    updatedAt: '2024-01-16T11:20:00Z',
    usageStats: {
      totalRequests: 8920,
      successRate: 97.8,
      avgResponseTime: 1450,
      costPerMonth: 324.80
    }
  },
  {
    id: 'model_3',
    name: 'Gemini Pro',
    type: 'Gemini',
    provider: 'Google',
    status: 'testing',
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1/models/gemini-pro',
    apiKey: 'AIza...***',
    maxTokens: 2048,
    temperature: 0.6,
    description: '谷歌的Gemini Pro模型，正在测试阶段',
    supportedScenarios: ['search'],
    isDefault: false,
    createdAt: '2024-01-18T15:00:00Z',
    updatedAt: '2024-01-18T15:00:00Z',
    usageStats: {
      totalRequests: 230,
      successRate: 95.2,
      avgResponseTime: 980,
      costPerMonth: 12.30
    }
  }
];

const mockPromptTemplates: PromptTemplate[] = [
  {
    id: 'prompt_1',
    name: '购物车挽留提示词',
    scenario: 'add_to_cart',
    content: '用户[username]将商品[productName](价格：[price])加入了购物车，但在页面停留了[dwellTime]秒后准备离开。请��成一个个性化的挽留弹窗文案，需要包含：1. 友好的问候 2. 商品的价值点 3. 适当的紧迫感 4. 明确的行动号召。文案要简洁有力，不超过50字。',
    variables: ['username', 'productName', 'price', 'dwellTime'],
    modelId: 'model_1',
    isDefault: true,
    createdAt: '2024-01-10T10:30:00Z',
    updatedAt: '2024-01-15T16:00:00Z'
  },
  {
    id: 'prompt_2',
    name: '新用户欢迎邮件',
    scenario: 'user_signup',
    content: '新用户[username]刚刚注册，来源渠道是[source]，注册前浏览了[browsedCategories]类商品。请生成一封温馨的欢迎邮件，包含：1. 个性化问候 2. 基于浏览历史的商品推荐 3. 新用户专属优惠 4. 引导下一步行动。邮件标题要吸引人，正文要亲切自然。',
    variables: ['username', 'source', 'browsedCategories'],
    modelId: 'model_2',
    isDefault: true,
    createdAt: '2024-01-12T11:00:00Z',
    updatedAt: '2024-01-12T11:00:00Z'
  },
  {
    id: 'prompt_3',
    name: '搜索无结果引导',
    scenario: 'search',
    content: '用户搜索了"[searchTerm]"但没有找到匹配的商品。请生成一个友好的引导弹窗，包含：1. 理解用户的搜索意图 2. 推荐相似或相关的商品类别 3. 提供联系客服的选项 4. 鼓励用户继��浏览。语调要积极正面，帮助用户找到替代方案。',
    variables: ['searchTerm'],
    modelId: 'model_3',
    isDefault: false,
    createdAt: '2024-01-18T15:30:00Z',
    updatedAt: '2024-01-18T15:30:00Z'
  }
];

export default function AIModelManagement() {
  const [models, setModels] = useState<AIModel[]>(mockAIModels);
  const [prompts, setPrompts] = useState<PromptTemplate[]>(mockPromptTemplates);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null);
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);
  const [isTestingModel, setIsTestingModel] = useState(false);

  // Pagination state for models
  const [currentModelPage, setCurrentModelPage] = useState(1);
  const [modelsPerPage] = useState(5);

  // Pagination state for prompts
  const [currentPromptPage, setCurrentPromptPage] = useState(1);
  const [promptsPerPage] = useState(10);

  const getStatusBadge = (status: AIModelStatus) => {
    const config = {
      active: { label: '运行中', className: 'bg-green-100 text-green-800' },
      inactive: { label: '已停用', className: 'bg-gray-100 text-gray-800' },
      testing: { label: '测试中', className: 'bg-yellow-100 text-yellow-800' }
    };
    const { label, className } = config[status];
    return <Badge className={className}>{label}</Badge>;
  };

  const getStatusIcon = (status: AIModelStatus) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'testing':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const handleTestModel = async (model: AIModel) => {
    setIsTestingModel(true);
    // 模拟API调用测试
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsTestingModel(false);
    alert('模型 ' + model.name + ' 测试成功！响应时间: 1.2s');
  };

  const handleSetDefaultModel = (modelId: string) => {
    setModels(prev => prev.map(model => ({
      ...model,
      isDefault: model.id === modelId
    })));
  };

  const handleDeleteModel = (modelId: string) => {
    setModels(prev => prev.filter(model => model.id !== modelId));
  };

  // Pagination logic for models
  const totalModelPages = Math.ceil(models.length / modelsPerPage);
  const startModelIndex = (currentModelPage - 1) * modelsPerPage;
  const endModelIndex = startModelIndex + modelsPerPage;
  const currentModels = models.slice(startModelIndex, endModelIndex);

  // Pagination logic for prompts
  const totalPromptPages = Math.ceil(prompts.length / promptsPerPage);
  const startPromptIndex = (currentPromptPage - 1) * promptsPerPage;
  const endPromptIndex = startPromptIndex + promptsPerPage;
  const currentPrompts = prompts.slice(startPromptIndex, endPromptIndex);

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI模型管理</h1>
          <p className="text-sm text-gray-600 mt-1">
            管理AI模型的接入、配置和提示词模板
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setIsPromptDialogOpen(true)}
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            添加提示词
          </Button>
          <Button 
            onClick={() => setIsModelDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            添加新模型
          </Button>
        </div>
      </div>

      <Tabs defaultValue="models" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="models">AI模型配置</TabsTrigger>
          <TabsTrigger value="prompts">提示词模板</TabsTrigger>
        </TabsList>

        {/* AI模型配置Tab */}
        <TabsContent value="models" className="space-y-6">
          {/* 统计概览 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总模型数</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{models.length}</div>
                <p className="text-xs text-muted-foreground">
                  其中 {models.filter(m => m.status === 'active').length} 个运行中
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">月度调用</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {models.reduce((sum, m) => sum + m.usageStats.totalRequests, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  总成功率 {(models.reduce((sum, m) => sum + m.usageStats.successRate, 0) / models.length).toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">月度成本</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${models.reduce((sum, m) => sum + m.usageStats.costPerMonth, 0).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  平均响应时间 {Math.round(models.reduce((sum, m) => sum + m.usageStats.avgResponseTime, 0) / models.length)}ms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">默认模型</CardTitle>
                <Key className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {models.find(m => m.isDefault)?.name || '未设置'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {models.find(m => m.isDefault)?.provider}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* AI模型列表 */}
          <Card>
            <CardHeader>
              <CardTitle>AI模型列表</CardTitle>
              <CardDescription>
                管理已接入的AI模型，配置参数和监控使用情况
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentModels.map((model) => (
                  <div
                    key={model.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      {getStatusIcon(model.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{model.name}</span>
                          {model.isDefault && (
                            <Badge variant="secondary">默认</Badge>
                          )}
                          {getStatusBadge(model.status)}
                        </div>
                        <p className="text-sm text-gray-600">{model.description}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span>提供商: {model.provider}</span>
                          <span>支持场景: {model.supportedScenarios.length}个</span>
                          <span>成功率: {model.usageStats.successRate}%</span>
                          <span>月成本: ${model.usageStats.costPerMonth}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestModel(model)}
                        disabled={isTestingModel || model.status === 'inactive'}
                      >
                        <TestTube className="h-4 w-4 mr-1" />
                        {isTestingModel ? '测试中...' : '测试'}
                      </Button>
                      {!model.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefaultModel(model.id)}
                        >
                          设为默认
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedModel(model);
                          setIsModelDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteModel(model.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Models Pagination */}
              {totalModelPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-700 order-2 sm:order-1">
                    正在显示 {startModelIndex + 1} - {Math.min(endModelIndex, models.length)} 条，共 {models.length} 条
                  </div>
                  <div className="flex items-center gap-2 order-1 sm:order-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentModelPage(prev => Math.max(1, prev - 1))}
                      disabled={currentModelPage === 1}
                    >
                      上一页
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentModelPage(prev => Math.min(totalModelPages, prev + 1))}
                      disabled={currentModelPage === totalModelPages}
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 提示词模板Tab */}
        <TabsContent value="prompts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>提示词模板管理</CardTitle>
              <CardDescription>
                为不同营销场景配置AI提示词模板，优化文案生成效果
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>模板名称</TableHead>
                    <TableHead>适用场景</TableHead>
                    <TableHead>关联模型</TableHead>
                    <TableHead>变量数量</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPrompts.map((prompt) => (
                    <TableRow key={prompt.id}>
                      <TableCell className="font-medium">{prompt.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{prompt.scenario}</Badge>
                      </TableCell>
                      <TableCell>
                        {models.find(m => m.id === prompt.modelId)?.name || '未指定'}
                      </TableCell>
                      <TableCell>{prompt.variables.length}</TableCell>
                      <TableCell>
                        {prompt.isDefault ? (
                          <Badge>默认</Badge>
                        ) : (
                          <Badge variant="secondary">备用</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPrompt(prompt);
                              setIsPromptDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              setPrompts(prev => prev.filter(p => p.id !== prompt.id));
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Prompts Pagination */}
              {totalPromptPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-700 order-2 sm:order-1">
                    正在显示 {startPromptIndex + 1} - {Math.min(endPromptIndex, prompts.length)} 条，共 {prompts.length} 条
                  </div>
                  <div className="flex items-center gap-2 order-1 sm:order-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPromptPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPromptPage === 1}
                    >
                      上一页
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPromptPage(prev => Math.min(totalPromptPages, prev + 1))}
                      disabled={currentPromptPage === totalPromptPages}
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI模型配置对话框 */}
      <Dialog open={isModelDialogOpen} onOpenChange={setIsModelDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedModel ? '编辑AI模型' : '接入新AI模型'}
            </DialogTitle>
            <DialogDescription>
              配置AI模型的基本信息和连接参数
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="model-name">模型名称</Label>
                <Input 
                  id="model-name" 
                  placeholder="例如: GPT-4 Turbo"
                  defaultValue={selectedModel?.name}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model-type">模型类型</Label>
                <Select defaultValue={selectedModel?.type}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择模型类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GPT">GPT系列</SelectItem>
                    <SelectItem value="Claude">Claude系列</SelectItem>
                    <SelectItem value="Gemini">Gemini系列</SelectItem>
                    <SelectItem value="Custom">自定义模型</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider">提供商</Label>
              <Input 
                id="provider" 
                placeholder="例如: OpenAI"
                defaultValue={selectedModel?.provider}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-endpoint">API端点</Label>
              <Input 
                id="api-endpoint" 
                placeholder="https://api.openai.com/v1/chat/completions"
                defaultValue={selectedModel?.apiEndpoint}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-key">API密钥</Label>
              <Input 
                id="api-key" 
                type="password"
                placeholder="输入API密钥"
                defaultValue={selectedModel?.apiKey}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max-tokens">最大Token数</Label>
                <Input 
                  id="max-tokens" 
                  type="number"
                  placeholder="4096"
                  defaultValue={selectedModel?.maxTokens}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature</Label>
                <Input 
                  id="temperature" 
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  placeholder="0.7"
                  defaultValue={selectedModel?.temperature}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Textarea 
                id="description" 
                placeholder="描述模型的特��和适用场景..."
                defaultValue={selectedModel?.description}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsModelDialogOpen(false);
                setSelectedModel(null);
              }}
            >
              取消
            </Button>
            <Button onClick={() => {
              // 这里应该处理保存逻辑
              setIsModelDialogOpen(false);
              setSelectedModel(null);
            }}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 提示词模板配置对话框 */}
      <Dialog open={isPromptDialogOpen} onOpenChange={setIsPromptDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedPrompt ? '编辑提示词模板' : '创建提示词模板'}
            </DialogTitle>
            <DialogDescription>
              为特定营销场景配置AI提示词模板
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prompt-name">模板名称</Label>
                <Input 
                  id="prompt-name" 
                  placeholder="例如: 购物车挽留提示词"
                  defaultValue={selectedPrompt?.name}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prompt-scenario">适用场景</Label>
                <Select defaultValue={selectedPrompt?.scenario}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择营销场景" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add_to_cart">加入购物车</SelectItem>
                    <SelectItem value="view_product">查看商品</SelectItem>
                    <SelectItem value="user_signup">用户注册</SelectItem>
                    <SelectItem value="user_login">用户��录</SelectItem>
                    <SelectItem value="start_checkout">开始结账</SelectItem>
                    <SelectItem value="purchase">完成购买</SelectItem>
                    <SelectItem value="search">执行搜索</SelectItem>
                    <SelectItem value="exit_intent">离开意图</SelectItem>
                    <SelectItem value="submit_form">提交表单</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt-model">关联模型</Label>
              <Select defaultValue={selectedPrompt?.modelId}>
                <SelectTrigger>
                  <SelectValue placeholder="选择AI模型（可选）" />
                </SelectTrigger>
                <SelectContent>
                  {models.map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name} ({model.provider})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt-content">提示词内容</Label>
              <Textarea 
                id="prompt-content" 
                placeholder="输入提示词模板，使用 [变量名] 表示动态变量..."
                className="min-h-[200px]"
                defaultValue={selectedPrompt?.content}
              />
              <p className="text-xs text-gray-500">
                提示：使用方括号包围变量名，如 [username]���[productName] 等
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt-variables">变量列表</Label>
              <Input 
                id="prompt-variables" 
                placeholder="用逗号分隔，如: username,productName,price"
                defaultValue={selectedPrompt?.variables?.join(',')}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="is-default" 
                defaultChecked={selectedPrompt?.isDefault}
              />
              <Label htmlFor="is-default">设为该场景的默认模板</Label>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsPromptDialogOpen(false);
                setSelectedPrompt(null);
              }}
            >
              取消
            </Button>
            <Button onClick={() => {
              // 这里应该处理保存逻辑
              setIsPromptDialogOpen(false);
              setSelectedPrompt(null);
            }}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
