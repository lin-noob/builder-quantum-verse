import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Settings,
  Database,
  Mail,
  Bot,
  Shield,
  Bell,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ConfigSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  configs: ConfigItem[];
}

interface ConfigItem {
  key: string;
  label: string;
  description: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'textarea' | 'password';
  value: any;
  options?: { label: string; value: string }[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export default function SystemConfig() {
  const { toast } = useToast();
  const [hasChanges, setHasChanges] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  // 配置数据
  const [configSections, setConfigSections] = useState<ConfigSection[]>([
    {
      id: 'ai',
      title: 'AI引擎配置',
      description: '人工智能算法和模型相关设置',
      icon: <Bot className="h-5 w-5" />,
      configs: [
        {
          key: 'ai.model.version',
          label: '默认AI模型版本',
          description: '系统使用的主要AI模型版本号',
          type: 'select',
          value: 'v2.1',
          options: [
            { label: 'v2.1 (推荐)', value: 'v2.1' },
            { label: 'v2.0 (稳定)', value: 'v2.0' },
            { label: 'v1.9 (兼容)', value: 'v1.9' }
          ]
        },
        {
          key: 'ai.decision.confidence_threshold',
          label: '决策置信度阈值',
          description: 'AI决策的最低置信度要求 (0-1)',
          type: 'number',
          value: 0.75,
          validation: { min: 0, max: 1 }
        },
        {
          key: 'ai.learning.enabled',
          label: '启用机器学习',
          description: '是否允许AI模型根据用户行为自动学习优化',
          type: 'boolean',
          value: true
        },
        {
          key: 'ai.fallback.strategy',
          label: '降级策略',
          description: 'AI服务不可用时的降级处理方式',
          type: 'select',
          value: 'manual',
          options: [
            { label: '人工处理', value: 'manual' },
            { label: '默认规则', value: 'default_rules' },
            { label: '停止处理', value: 'stop' }
          ]
        }
      ]
    },
    {
      id: 'database',
      title: '数据库配置',
      description: '数据存储和连接相关设置',
      icon: <Database className="h-5 w-5" />,
      configs: [
        {
          key: 'db.pool.max_connections',
          label: '最大连接数',
          description: '数据库��接池的最大连接数量',
          type: 'number',
          value: 50,
          validation: { min: 1, max: 200 }
        },
        {
          key: 'db.timeout.query',
          label: '查询超时时间（秒）',
          description: '数据库查询的最大等待时间',
          type: 'number',
          value: 30,
          validation: { min: 5, max: 300 }
        },
        {
          key: 'db.backup.enabled',
          label: '自动备份',
          description: '是否启用定时数据备份功能',
          type: 'boolean',
          value: true
        },
        {
          key: 'db.backup.interval',
          label: '备份间隔',
          description: '自动备份的时间间隔',
          type: 'select',
          value: 'daily',
          options: [
            { label: '每小时', value: 'hourly' },
            { label: '每天', value: 'daily' },
            { label: '每周', value: 'weekly' }
          ]
        }
      ]
    },
    {
      id: 'notification',
      title: '通知配置',
      description: '邮件、短信和系统通知设置',
      icon: <Bell className="h-5 w-5" />,
      configs: [
        {
          key: 'notification.email.enabled',
          label: '启用邮件通知',
          description: '是否允许系统发送邮件通知',
          type: 'boolean',
          value: true
        },
        {
          key: 'notification.email.smtp_host',
          label: 'SMTP服务器地址',
          description: '邮件发送服务器的主机地址',
          type: 'text',
          value: 'smtp.company.com',
          validation: { required: true }
        },
        {
          key: 'notification.email.smtp_port',
          label: 'SMTP端口',
          description: '邮件服务器端口号',
          type: 'number',
          value: 587,
          validation: { min: 1, max: 65535 }
        },
        {
          key: 'notification.sms.enabled',
          label: '启用短信通知',
          description: '是否允许系统发送短信通知',
          type: 'boolean',
          value: false
        },
        {
          key: 'notification.webhook.url',
          label: 'Webhook URL',
          description: '第三方通知webhook地址',
          type: 'text',
          value: '',
          validation: { pattern: 'https?://.*' }
        }
      ]
    },
    {
      id: 'security',
      title: '安全配置',
      description: '系统安全和权限相关设置',
      icon: <Shield className="h-5 w-5" />,
      configs: [
        {
          key: 'security.session.timeout',
          label: '会话超时时间（分钟）',
          description: '用户会话的最大空闲时间',
          type: 'number',
          value: 120,
          validation: { min: 5, max: 1440 }
        },
        {
          key: 'security.password.min_length',
          label: '密码最小长度',
          description: '用户密码的最小字符数要求',
          type: 'number',
          value: 8,
          validation: { min: 6, max: 32 }
        },
        {
          key: 'security.login.max_attempts',
          label: '最大登录尝试次数',
          description: '账户锁定前的最大失败登录次数',
          type: 'number',
          value: 5,
          validation: { min: 3, max: 10 }
        },
        {
          key: 'security.api.rate_limit',
          label: 'API请求限制（每分钟）',
          description: '单个用户每分钟的最大API请求数',
          type: 'number',
          value: 100,
          validation: { min: 10, max: 1000 }
        },
        {
          key: 'security.encryption.enabled',
          label: '启用数据加密',
          description: '是否对敏感数据进行加密存储',
          type: 'boolean',
          value: true
        }
      ]
    }
  ]);

  // 更新配置值
  const updateConfigValue = (sectionId: string, configKey: string, newValue: any) => {
    setConfigSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          configs: section.configs.map(config => 
            config.key === configKey ? { ...config, value: newValue } : config
          )
        };
      }
      return section;
    }));
    setHasChanges(true);
  };

  // 保存所有配置
  const saveConfigs = async () => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "配置已保存",
        description: "系统配置更新成功，部分设置可能需要重启生效",
      });
      
      setHasChanges(false);
    } catch (error) {
      toast({
        title: "保存失败",
        description: "配置保存时发生错误，请重试",
        variant: "destructive"
      });
    }
  };

  // 重置配置
  const resetConfigs = () => {
    // 重置到默认值的逻辑
    toast({
      title: "配置已重置",
      description: "所有配置已恢复到默认值",
    });
    setHasChanges(false);
    setIsResetDialogOpen(false);
  };

  // 渲染配置项
  const renderConfigItem = (section: ConfigSection, config: ConfigItem) => {
    const sectionId = section.id;
    
    return (
      <div key={config.key} className="space-y-2">
        <Label htmlFor={config.key} className="text-sm font-medium">
          {config.label}
          {config.validation?.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <p className="text-xs text-gray-500">{config.description}</p>
        
        {config.type === 'text' && (
          <Input
            id={config.key}
            value={config.value}
            onChange={(e) => updateConfigValue(sectionId, config.key, e.target.value)}
            placeholder={config.description}
          />
        )}
        
        {config.type === 'password' && (
          <Input
            id={config.key}
            type="password"
            value={config.value}
            onChange={(e) => updateConfigValue(sectionId, config.key, e.target.value)}
            placeholder={config.description}
          />
        )}
        
        {config.type === 'number' && (
          <Input
            id={config.key}
            type="number"
            value={config.value}
            onChange={(e) => updateConfigValue(sectionId, config.key, parseFloat(e.target.value))}
            min={config.validation?.min}
            max={config.validation?.max}
          />
        )}
        
        {config.type === 'textarea' && (
          <Textarea
            id={config.key}
            value={config.value}
            onChange={(e) => updateConfigValue(sectionId, config.key, e.target.value)}
            placeholder={config.description}
            rows={3}
          />
        )}
        
        {config.type === 'boolean' && (
          <div className="flex items-center space-x-2">
            <Switch
              id={config.key}
              checked={config.value}
              onCheckedChange={(checked) => updateConfigValue(sectionId, config.key, checked)}
            />
            <Label htmlFor={config.key} className="text-sm text-gray-600">
              {config.value ? '已启用' : '已禁用'}
            </Label>
          </div>
        )}
        
        {config.type === 'select' && (
          <Select value={config.value} onValueChange={(value) => updateConfigValue(sectionId, config.key, value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {config.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">系统配置</h1>
          <p className="text-gray-600 mt-1">管理AI营销平台的核心配置参数</p>
        </div>
        
        {/* 操作按钮 */}
        <div className="flex items-center gap-2">
          <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                重置配置
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>确认重置配置</DialogTitle>
                <DialogDescription>
                  此操作将重置所有配置项到默认值，且无法撤销。确定要继续吗？
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
                  取��
                </Button>
                <Button variant="destructive" onClick={resetConfigs}>
                  确认重置
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button 
            onClick={saveConfigs}
            disabled={!hasChanges}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            保存配置
          </Button>
        </div>
      </div>

      {/* 配置状态提示 */}
      {hasChanges && (
        <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <span className="text-sm text-yellow-800">您有未保存的配置更改</span>
        </div>
      )}

      {/* 配置选项卡 */}
      <Tabs defaultValue="ai" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          {configSections.map(section => (
            <TabsTrigger key={section.id} value={section.id} className="flex items-center gap-2">
              {section.icon}
              <span className="hidden sm:inline">{section.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {configSections.map(section => (
          <TabsContent key={section.id} value={section.id}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {section.icon}
                  {section.title}
                </CardTitle>
                <p className="text-sm text-gray-600">{section.description}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {section.configs.map(config => (
                    <div key={config.key} className="p-4 border rounded-lg bg-gray-50">
                      {renderConfigItem(section, config)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* 配置说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            配置说明
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">自动生效配置</p>
                <p>大部分配置修改会立即生效，���需重启系统</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Zap className="h-4 w-4 text-orange-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">需要重启的配置</p>
                <p>数据库连接、安全设置等核心配置需要重启系统后生效</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">重要提醒</p>
                <p>修改配置前建议备份当前设置，错误的配置可能影响系统正常运行</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
