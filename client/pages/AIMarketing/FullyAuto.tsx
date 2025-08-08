import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
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
import { Plus, Settings, Users, Target, ToggleLeft, ToggleRight, Save } from 'lucide-react';
import { AutoModeConfig, mockAutoModeConfig } from '@shared/aiMarketingMonitoringData';
import { useToast } from '@/hooks/use-toast';

export default function FullyAuto() {
  const { toast } = useToast();
  const [config, setConfig] = useState<AutoModeConfig>(mockAutoModeConfig);
  const [customRuleDialog, setCustomRuleDialog] = useState(false);
  const [boundariesDialog, setBoundariesDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  // Custom rule form state
  const [newRule, setNewRule] = useState({
    field: '',
    operator: '',
    value: ''
  });

  // Boundaries form state
  const [boundaries, setBoundaries] = useState(config.boundaries);

  const handleTargetGroupChange = (group: keyof typeof config.targetGroups, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      targetGroups: {
        ...prev.targetGroups,
        [group]: checked
      }
    }));
  };

  const handleAddCustomRule = () => {
    if (newRule.field && newRule.operator && newRule.value) {
      const rule = {
        id: Date.now().toString(),
        ...newRule
      };
      
      setConfig(prev => ({
        ...prev,
        customRules: [...prev.customRules, rule]
      }));

      setNewRule({ field: '', operator: '', value: '' });
      setCustomRuleDialog(false);
      
      toast({
        title: '规则添加成功',
        description: '自定义筛选规则已添加到应用��围'
      });
    }
  };

  const handleRemoveCustomRule = (ruleId: string) => {
    setConfig(prev => ({
      ...prev,
      customRules: prev.customRules.filter(rule => rule.id !== ruleId)
    }));
  };

  const handleSaveBoundaries = () => {
    setConfig(prev => ({
      ...prev,
      boundaries
    }));
    setBoundariesDialog(false);
    
    toast({
      title: '边界设置已更新',
      description: '行为边界配置已保存'
    });
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: '设置保存成功',
        description: '全自动模式配置已更新'
      });
    } catch (error) {
      toast({
        title: '保存失败',
        description: '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">全自动模式配置</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Automation Scope */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              AI自动化应用范围
            </CardTitle>
            <p className="text-sm text-gray-600">
              请圈选需要由AI进行全自动营销的用户群体。对于未被选中的群体（如VIP客户），AI将不会进行任何主动的营销干预。
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Preset User Groups */}
            <div>
              <Label className="text-base font-medium mb-4 block">预设用户分层</Label>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="newUsers"
                    checked={config.targetGroups.newUsers}
                    onCheckedChange={(checked) => handleTargetGroupChange('newUsers', !!checked)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="newUsers" className="font-medium">新用户</Label>
                    <p className="text-sm text-gray-600">适用于标准化的欢迎和初次转化引导。</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="lowFrequencyUsers"
                    checked={config.targetGroups.lowFrequencyUsers}
                    onCheckedChange={(checked) => handleTargetGroupChange('lowFrequencyUsers', !!checked)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="lowFrequencyUsers" className="font-medium">订货不多的用户</Label>
                    <p className="text-sm text-gray-600">适用于促活和复购率提升策略。</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="vipUsers"
                    checked={config.targetGroups.vipUsers}
                    onCheckedChange={(checked) => handleTargetGroupChange('vipUsers', !!checked)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="vipUsers" className="font-medium">VIP客户</Label>
                    <p className="text-sm text-gray-600">高价值客户，建议进行精细化的人工沟通。</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Rules */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-medium">自定义筛选规则</Label>
                <Dialog open={customRuleDialog} onOpenChange={setCustomRuleDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      自定义筛选规则
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>自定义应用范围</DialogTitle>
                      <DialogDescription>
                        创建自定义规则来精确定义AI自动化的用户范围
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>字段</Label>
                        <Select value={newRule.field} onValueChange={(value) => setNewRule(prev => ({ ...prev, field: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="选择字段" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="totalSpent">历史总消费金额</SelectItem>
                            <SelectItem value="orderCount">订单数量</SelectItem>
                            <SelectItem value="lastOrderDays">最后下单天数</SelectItem>
                            <SelectItem value="userTag">用户标签</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>操作符</Label>
                        <Select value={newRule.operator} onValueChange={(value) => setNewRule(prev => ({ ...prev, operator: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="选择操作符" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="<">小于</SelectItem>
                            <SelectItem value=">">大于</SelectItem>
                            <SelectItem value="=">等于</SelectItem>
                            <SelectItem value="!=">不等于</SelectItem>
                            <SelectItem value="contains">��含</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>值</Label>
                        <Input
                          value={newRule.value}
                          onChange={(e) => setNewRule(prev => ({ ...prev, value: e.target.value }))}
                          placeholder="输入筛选值"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCustomRuleDialog(false)}>
                        取消
                      </Button>
                      <Button onClick={handleAddCustomRule}>
                        添加规则
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {config.customRules.length > 0 ? (
                <div className="space-y-2">
                  {config.customRules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">
                        {rule.field} {rule.operator} {rule.value}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCustomRule(rule.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        删除
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">暂无自定义规则</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Core Objectives and Boundaries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              核心业务目标与边界
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Core Objective */}
            <div>
              <Label className="font-medium">AI核心营销目标</Label>
              <Select 
                value={config.coreObjective} 
                onValueChange={(value) => setConfig(prev => ({ ...prev, coreObjective: value }))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="提高用户复购率">提高用户复购率</SelectItem>
                  <SelectItem value="增加客单价">增加客单价</SelectItem>
                  <SelectItem value="提升用户活跃度">提升用户活跃度</SelectItem>
                  <SelectItem value="促进新用户转化">促进新用户转化</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Boundaries */}
            <div>
              <div className="flex items-center justify-between">
                <Label className="font-medium">行为边界</Label>
                <Dialog open={boundariesDialog} onOpenChange={setBoundariesDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      设置行为边界
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>设置行为边界</DialogTitle>
                      <DialogDescription>
                        设置AI自动营销的行为限制和边界条件
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>单次优惠力度上限 (%)</Label>
                        <Input
                          type="number"
                          value={boundaries.maxDiscountPercent}
                          onChange={(e) => setBoundaries(prev => ({ 
                            ...prev, 
                            maxDiscountPercent: parseInt(e.target.value) || 0 
                          }))}
                          className="mt-2"
                          min="0"
                          max="100"
                        />
                      </div>
                      <div>
                        <Label>单用户每周最大触达次数</Label>
                        <Input
                          type="number"
                          value={boundaries.maxWeeklyTouchPoints}
                          onChange={(e) => setBoundaries(prev => ({ 
                            ...prev, 
                            maxWeeklyTouchPoints: parseInt(e.target.value) || 0 
                          }))}
                          className="mt-2"
                          min="1"
                          max="20"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setBoundariesDialog(false)}>
                        取消
                      </Button>
                      <Button onClick={handleSaveBoundaries}>
                        保存边界
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="mt-2 space-y-2 text-sm text-gray-600">
                <div>单次优惠力度上限: {config.boundaries.maxDiscountPercent}%</div>
                <div>单用户每周最大触达次数: {config.boundaries.maxWeeklyTouchPoints}次</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Master Control */}
        <Card>
          <CardHeader>
            <CardTitle>总控开关</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Master Switch */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">全自动模式状态</Label>
                <p className="text-sm text-gray-600 mt-1">
                  {config.isEnabled ? '当前运行中' : '当前已停止'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={config.isEnabled}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, isEnabled: checked }))}
                  className="data-[state=checked]:bg-green-500"
                />
                {config.isEnabled ? (
                  <ToggleRight className="h-6 w-6 text-green-500" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-gray-400" />
                )}
              </div>
            </div>

            {/* Priority Notice */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>请注意：</strong>手动营销操作的优先级高于AI自动营销。当您对特定用户进行手动干预时，AI在短时间内将不会对该用户进行重复打扰。
              </p>
            </div>

            {/* Save Button */}
            <Button 
              onClick={handleSaveConfig} 
              disabled={saving}
              className="w-full flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? '保存中...' : '保存设置'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
