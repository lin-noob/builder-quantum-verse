import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BUSINESS_GOALS, 
  mockStrategyData, 
  getBusinessGoalLabel,
  AIGuardrails 
} from '@shared/aiMarketingData';

export default function StrategyGoals() {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([mockStrategyData.currentGoal]);
  const [guardrails, setGuardrails] = useState<AIGuardrails>(mockStrategyData.guardrails);
  const [systemEnabled, setSystemEnabled] = useState(mockStrategyData.systemStatus.isEnabled);

  const handleGuardrailChange = (field: keyof AIGuardrails, value: string | number) => {
    setGuardrails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGoalToggle = (goalValue: string) => {
    setSelectedGoals(prev => {
      if (prev.includes(goalValue)) {
        return prev.filter(g => g !== goalValue);
      } else {
        return [...prev, goalValue];
      }
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">

      {/* System Control Card */}
      <Card>
        <CardHeader>
          <CardTitle>系统总控</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="system-switch" className="text-base">
                AI全自动营销系统总开关
              </Label>
              <p className="text-sm text-gray-600">
                {systemEnabled ? (
                  <span className="text-green-600 font-medium">[运行中]</span>
                ) : (
                  <span className="text-gray-500 font-medium">[已停止]</span>
                )}
              </p>
            </div>
            <Switch
              id="system-switch"
              checked={systemEnabled}
              onCheckedChange={setSystemEnabled}
              className="scale-125"
            />
          </div>
        </CardContent>
      </Card>

      {/* Core Business Goals Card */}
      <Card>
        <CardHeader>
          <CardTitle>AI核心营销目标</CardTitle>
          <p className="text-sm text-gray-600">
            请选择当前阶段最重要的业务增长方向。AI将优先发现并执行与此目标最相关的营销机会。
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business-goal">当前业务目标</Label>
            <Select value={currentGoal} onValueChange={setCurrentGoal}>
              <SelectTrigger className="w-full text-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_GOALS.map((goal) => (
                  <SelectItem key={goal.value} value={goal.value}>
                    {goal.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button disabled className="w-fit">
            保存目标
          </Button>
        </CardContent>
      </Card>

      {/* AI Guardrails Card */}
      <Card>
        <CardHeader>
          <CardTitle>AI行为边界</CardTitle>
          <p className="text-sm text-gray-600">
            为AI设定行为护栏，确保所有营销活动都在可控范围内。
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="max-discount">单次优惠力度上限</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="max-discount"
                  type="number"
                  value={guardrails.maxDiscountPercent}
                  onChange={(e) => handleGuardrailChange('maxDiscountPercent', parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500 min-w-[20px]">%</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-touchpoints">单用户每周最大触达次数</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="max-touchpoints"
                  type="number"
                  value={guardrails.maxWeeklyTouchpoints}
                  onChange={(e) => handleGuardrailChange('maxWeeklyTouchpoints', parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500 min-w-[20px]">次</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>禁止打扰时间段</Label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={guardrails.doNotDisturbStart}
                  onChange={(e) => handleGuardrailChange('doNotDisturbStart', e.target.value)}
                  className="w-24"
                />
                <span className="text-sm text-gray-500">到</span>
                <Input
                  type="time"
                  value={guardrails.doNotDisturbEnd}
                  onChange={(e) => handleGuardrailChange('doNotDisturbEnd', e.target.value)}
                  className="w-24"
                />
              </div>
            </div>
          </div>

          <Button disabled className="w-fit">
            保存边界设置
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
