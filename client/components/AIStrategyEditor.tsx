import { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Save, X, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  StrategyDimension,
  ActionType,
  TimingStrategy,
  ContentStrategy,
  DefaultAIConfig
} from '@shared/aiMarketingScenarioData';

interface AIStrategyEditorProps {
  defaultAIConfig: DefaultAIConfig;
  onSave: (updatedConfig: DefaultAIConfig) => Promise<void>;
}

// 预设选项
const ACTION_TYPE_OPTIONS = [
  { value: 'POPUP', label: '网页弹窗', description: '在当前页面显示弹窗' },
  { value: 'EMAIL', label: '发送邮件', description: '向用户邮箱发送邮件' },
  { value: 'SMS', label: '短信通知', description: '向用户手机发送短信' }
];

const TIMING_STRATEGY_OPTIONS = [
  { value: 'IMMEDIATE', label: '立即触发', description: '事件发生后立即执行' },
  { value: 'SMART_DELAY', label: '智能延迟', description: 'AI智能判断最佳时机' }
];

const CONTENT_STRATEGY_OPTIONS = [
  { value: 'FULLY_GENERATIVE', label: '完全生成', description: 'AI完全自主生成内容' },
  { value: 'STATIC', label: '静态内容', description: '使用预设的固定内容' },
  { value: 'AI_ASSISTED', label: 'AI辅助', description: 'AI基于模板生成内容' }
];

export default function AIStrategyEditor({ defaultAIConfig, onSave }: AIStrategyEditorProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editingConfig, setEditingConfig] = useState<DefaultAIConfig>(defaultAIConfig);
  const [saving, setSaving] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setEditingConfig({ ...defaultAIConfig });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingConfig(defaultAIConfig);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(editingConfig);
      setIsEditing(false);
      toast({
        title: '保存成功',
        description: 'AI策略配置已更新'
      });
    } catch (error) {
      toast({
        title: '保存失败',
        description: '请检查配置是否正确',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const updateDimension = (index: number, field: keyof StrategyDimension, value: string) => {
    const newDimensions = [...editingConfig.dimensions];
    newDimensions[index] = { ...newDimensions[index], [field]: value };
    setEditingConfig({ ...editingConfig, dimensions: newDimensions });
  };

  const addExample = (dimensionIndex: number) => {
    const newDimensions = [...editingConfig.dimensions];
    newDimensions[dimensionIndex].examples.push('');
    setEditingConfig({ ...editingConfig, dimensions: newDimensions });
  };

  const updateExample = (dimensionIndex: number, exampleIndex: number, value: string) => {
    const newDimensions = [...editingConfig.dimensions];
    newDimensions[dimensionIndex].examples[exampleIndex] = value;
    setEditingConfig({ ...editingConfig, dimensions: newDimensions });
  };

  const removeExample = (dimensionIndex: number, exampleIndex: number) => {
    const newDimensions = [...editingConfig.dimensions];
    newDimensions[dimensionIndex].examples.splice(exampleIndex, 1);
    setEditingConfig({ ...editingConfig, dimensions: newDimensions });
  };

  const displayConfig = isEditing ? editingConfig : defaultAIConfig;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            🤖 AI策略配置
          </CardTitle>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-1" />
                编辑配置
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-1" />
                  取消
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-1" />
                  {saving ? '保存中...' : '保存'}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 全局配置 */}
          {isEditing && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/10">
              <h4 className="font-medium">全局配置</h4>
              
              {/* 允许的营销方式 */}
              <div className="space-y-2">
                <Label>允许的营销方式</Label>
                <div className="flex flex-wrap gap-2">
                  {ACTION_TYPE_OPTIONS.map(option => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`action-${option.value}`}
                        checked={editingConfig.allowedActionTypes.includes(option.value as ActionType)}
                        onChange={(e) => {
                          const newActionTypes = e.target.checked
                            ? [...editingConfig.allowedActionTypes, option.value as ActionType]
                            : editingConfig.allowedActionTypes.filter(t => t !== option.value);
                          setEditingConfig({ ...editingConfig, allowedActionTypes: newActionTypes });
                        }}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor={`action-${option.value}`} className="text-sm font-medium">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* 时机策略 */}
              <div className="space-y-2">
                <Label>默认时机策略</Label>
                <Select
                  value={editingConfig.timingStrategy}
                  onValueChange={(value: TimingStrategy) =>
                    setEditingConfig({ ...editingConfig, timingStrategy: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMING_STRATEGY_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-muted-foreground">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 内容策略 */}
              <div className="space-y-2">
                <Label>默认内容策略</Label>
                <Select
                  value={editingConfig.contentStrategy}
                  onValueChange={(value: ContentStrategy) =>
                    setEditingConfig({ ...editingConfig, contentStrategy: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_STRATEGY_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-muted-foreground">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 策略描述 */}
              <div className="space-y-2">
                <Label>策略描述</Label>
                <Textarea
                  value={editingConfig.description}
                  onChange={(e) =>
                    setEditingConfig({ ...editingConfig, description: e.target.value })
                  }
                  placeholder="描述AI的工作方式和策略"
                  rows={3}
                />
              </div>

              {/* 策略总结 */}
              <div className="space-y-2">
                <Label>策略总结</Label>
                <Input
                  value={editingConfig.strategySummary}
                  onChange={(e) =>
                    setEditingConfig({ ...editingConfig, strategySummary: e.target.value })
                  }
                  placeholder="一句话总结策略目标"
                />
              </div>
            </div>
          )}

          {/* 决策维度详情 */}
          <div>
            <Tabs defaultValue="0" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                {displayConfig.dimensions.map((dimension, index) => (
                  <TabsTrigger
                    key={index}
                    value={index.toString()}
                    className="text-xs"
                  >
                    {dimension.dimension}
                  </TabsTrigger>
                ))}
              </TabsList>

              {displayConfig.dimensions.map((dimension, index) => (
                <TabsContent
                  key={index}
                  value={index.toString()}
                  className="mt-4"
                >
                  <div className="border rounded-lg p-4 bg-muted/20">
                    {isEditing ? (
                      // 编辑模式
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <Input
                            value={dimension.dimension}
                            onChange={(e) => updateDimension(index, 'dimension', e.target.value)}
                            className="font-medium text-lg bg-background"
                            placeholder="维度名称"
                          />
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                              策略要点
                            </Label>
                            <Input
                              value={dimension.strategy}
                              onChange={(e) => updateDimension(index, 'strategy', e.target.value)}
                              placeholder="策略要点（如：优先使用网页弹窗）"
                            />
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                              决策依据
                            </Label>
                            <Textarea
                              value={dimension.reasoning}
                              onChange={(e) => updateDimension(index, 'reasoning', e.target.value)}
                              placeholder="解释为什么选择这个策略"
                              rows={3}
                            />
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                              策略示例
                            </Label>
                            <div className="space-y-2">
                              {dimension.examples.map((example, exampleIndex) => (
                                <div key={exampleIndex} className="flex items-center gap-2">
                                  <Input
                                    value={example}
                                    onChange={(e) => updateExample(index, exampleIndex, e.target.value)}
                                    placeholder="示例场景说明"
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeExample(index, exampleIndex)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addExample(index)}
                                className="w-full"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                添加示例
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // 显示模式
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-foreground">
                            {dimension.dimension}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {dimension.strategy}
                          </Badge>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground mb-2">
                              决策依据
                            </dt>
                            <dd className="text-sm text-foreground leading-relaxed">
                              {dimension.reasoning}
                            </dd>
                          </div>

                          <div>
                            <dt className="text-sm font-medium text-muted-foreground mb-2">
                              策略示例
                            </dt>
                            <dd className="space-y-2">
                              {dimension.examples.map((example, exampleIndex) => (
                                <div
                                  key={exampleIndex}
                                  className="text-sm text-foreground bg-background/60 p-3 rounded border-l-3 border-primary/40"
                                >
                                  {example}
                                </div>
                              ))}
                            </dd>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
