import { useState, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  type StrategyDimension,
  type DefaultAIConfig
} from '@shared/aiMarketingScenarioData';

interface AIStrategyEditorModalProps {
  open: boolean;
  onClose: () => void;
  defaultAIConfig: DefaultAIConfig;
  onSave: (updatedConfig: DefaultAIConfig) => Promise<void>;
}

export default function AIStrategyEditorModal({ 
  open, 
  onClose, 
  defaultAIConfig, 
  onSave 
}: AIStrategyEditorModalProps) {
  const { toast } = useToast();
  const [editingConfig, setEditingConfig] = useState<DefaultAIConfig>(defaultAIConfig);
  const [saving, setSaving] = useState(false);

  // 当弹窗打开时，重置编辑状态
  useEffect(() => {
    if (open) {
      setEditingConfig({ ...defaultAIConfig });
    }
  }, [open, defaultAIConfig]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(editingConfig);
      onClose();
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🤖 编辑AI策略配置
          </DialogTitle>
          <DialogDescription>
            配置AI在不同营销维度的策略和行为
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 决策维度详情 */}
          <div>
            <Tabs defaultValue="0" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                {editingConfig.dimensions.map((dimension, index) => (
                  <TabsTrigger
                    key={index}
                    value={index.toString()}
                    className="text-xs"
                  >
                    {dimension.dimension}
                  </TabsTrigger>
                ))}
              </TabsList>

              {editingConfig.dimensions.map((dimension, index) => (
                <TabsContent
                  key={index}
                  value={index.toString()}
                  className="mt-4"
                >
                  <div className="border rounded-lg p-4 bg-muted/20 space-y-4">
                    {/* 维度名称 */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">维度名称</Label>
                      <Input
                        value={dimension.dimension}
                        onChange={(e) => updateDimension(index, 'dimension', e.target.value)}
                        placeholder="维度名称（如：营销方式）"
                      />
                    </div>

                    {/* 策略要点 */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">策略要点</Label>
                      <Input
                        value={dimension.strategy}
                        onChange={(e) => updateDimension(index, 'strategy', e.target.value)}
                        placeholder="策略要点（如：优先使用网页弹窗）"
                      />
                    </div>

                    {/* 决策依据 */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">决策依据</Label>
                      <Textarea
                        value={dimension.reasoning}
                        onChange={(e) => updateDimension(index, 'reasoning', e.target.value)}
                        placeholder="解释为什么选择这个策略"
                        rows={3}
                      />
                    </div>

                    {/* 策略示例 */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">策略示例</Label>
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
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            <X className="h-4 w-4 mr-1" />
            取消
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-1" />
            {saving ? '保存中...' : '保存配置'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
