import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  MarketingScenario,
  OverrideRule,
  TriggerCondition,
  TriggerConditions,
  ResponseAction,
  ActionConfig,
  ActionType,
  TimingStrategy,
  ContentStrategy,
  ConditionOperator,
  ConditionCategory,
  addOverrideRule,
  updateOverrideRule
} from "../../shared/aiMarketingScenarioData";

interface RuleBuilderModalProps {
  open: boolean;
  onClose: () => void;
  scenario: MarketingScenario | null;
  rule?: OverrideRule | null;
  onSave: () => void;
}

const operatorLabels: Record<ConditionOperator, string> = {
  '=': '等于',
  '!=': '不等于',
  '>': '大于',
  '<': '小于',
  '>=': '大于等于',
  '<=': '小于等于',
  'CONTAINS': '包含',
  '!CONTAINS': '不包含',
  'IN': '在列表中',
  '!IN': '不在列表中',
};

const actionTypeLabels: Record<ActionType, string> = {
  'POPUP': '网页弹窗',
  'EMAIL': '邮件',
  'SMS': '短信',
};

const timingLabels: Record<TimingStrategy, string> = {
  'IMMEDIATE': '立即触发',
  'SMART_DELAY': '智能延迟',
};

const contentStrategyLabels: Record<ContentStrategy, string> = {
  'STATIC': '静态内容',
  'AI_ASSISTED': 'AI辅助',
  'FULLY_GENERATIVE': '完全生成',
};

const RuleBuilderModal = ({ open, onClose, scenario, rule, onSave }: RuleBuilderModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState("conditions");
  
  // 表单数据
  const [ruleName, setRuleName] = useState("");
  const [triggerConditions, setTriggerConditions] = useState<TriggerConditions>({
    eventConditions: [],
    sessionConditions: [],
    userConditions: []
  });
  const [responseAction, setResponseAction] = useState<ResponseAction>({
    actionType: 'POPUP',
    timing: 'IMMEDIATE',
    contentMode: 'STATIC',
    actionConfig: {}
  });

  // 初始化表单数据
  useEffect(() => {
    if (open) {
      if (rule) {
        // 编辑模式 - 如果是邮件或短信，强制改为弹窗
        setRuleName(rule.ruleName);
        setTriggerConditions(rule.triggerConditions);
        const actionType = (rule.responseAction.actionType === 'EMAIL' || rule.responseAction.actionType === 'SMS')
          ? 'POPUP'
          : rule.responseAction.actionType;
        setResponseAction({
          ...rule.responseAction,
          actionType
        });
      } else {
        // 创建模式
        setRuleName("");
        setTriggerConditions({
          eventConditions: [],
          sessionConditions: [],
          userConditions: []
        });
        setResponseAction({
          actionType: 'POPUP',
          timing: 'IMMEDIATE',
          contentMode: 'STATIC',
          actionConfig: {}
        });
      }
      setCurrentTab("conditions");
    }
  }, [open, rule]);

  const addCondition = (category: ConditionCategory) => {
    const newCondition: TriggerCondition = {
      id: `condition_${Date.now()}`,
      category,
      field: '',
      operator: '=',
      value: ''
    };

    setTriggerConditions(prev => ({
      ...prev,
      [`${category}Conditions`]: [
        ...prev[`${category}Conditions` as keyof TriggerConditions],
        newCondition
      ]
    }));
  };

  const updateCondition = (
    category: ConditionCategory, 
    id: string, 
    updates: Partial<TriggerCondition>
  ) => {
    setTriggerConditions(prev => ({
      ...prev,
      [`${category}Conditions`]: prev[`${category}Conditions` as keyof TriggerConditions].map(
        (condition: TriggerCondition) => 
          condition.id === id ? { ...condition, ...updates } : condition
      )
    }));
  };

  const removeCondition = (category: ConditionCategory, id: string) => {
    setTriggerConditions(prev => ({
      ...prev,
      [`${category}Conditions`]: prev[`${category}Conditions` as keyof TriggerConditions].filter(
        (condition: TriggerCondition) => condition.id !== id
      )
    }));
  };

  const updateActionConfig = (updates: Partial<ActionConfig>) => {
    setResponseAction(prev => ({
      ...prev,
      actionConfig: { ...prev.actionConfig, ...updates }
    }));
  };

  const validateForm = () => {
    if (!ruleName.trim()) {
      toast({
        title: "请输入规则名称",
        variant: "destructive",
      });
      return false;
    }

    // 检查是否有可用的触发条件字段
    const hasEventFields = scenario?.availableFields?.event?.length > 0;
    const hasUserFields = scenario?.availableFields?.user?.length > 0;
    const hasTriggerConditions = hasEventFields || hasUserFields;
    
    // 如果有可用的触发���件字段，才验证条件
    if (hasTriggerConditions) {
      const totalConditions =
        triggerConditions.eventConditions.length +
        triggerConditions.userConditions.length;

      if (totalConditions === 0) {
        toast({
          title: "请至少添加一个触发条件",
          variant: "destructive",
        });
        setCurrentTab("conditions");
        return false;
      }

      // 检查所有条件是否��写完整
      const allConditions = [
        ...triggerConditions.eventConditions,
        ...triggerConditions.userConditions
      ];

      for (const condition of allConditions) {
        if (!condition.field || condition.value === '') {
          toast({
            title: "请完整填写所有触发条件",
            variant: "destructive",
          });
          setCurrentTab("conditions");
          return false;
        }
      }
    }

    // 检查响应动作配置
    if (responseAction.contentMode === 'STATIC') {
      if (responseAction.actionType === 'POPUP') {
        if (!responseAction.actionConfig.title || !responseAction.actionConfig.body) {
          toast({
            title: "请填写弹窗标题和内容",
            variant: "destructive",
          });
          setCurrentTab("action");
          return false;
        }
      } else if (responseAction.actionType === 'EMAIL') {
        if (!responseAction.actionConfig.subject || !responseAction.actionConfig.emailBody) {
          toast({
            title: "请填写邮件主题和内容",
            variant: "destructive",
          });
          setCurrentTab("action");
          return false;
        }
      } else if (responseAction.actionType === 'SMS') {
        if (!responseAction.actionConfig.smsContent) {
          toast({
            title: "请填写短信内容",
            variant: "destructive",
          });
          setCurrentTab("action");
          return false;
        }
      }
    } else if (responseAction.contentMode === 'AI_ASSISTED') {
      if (!responseAction.actionConfig.aiPrompt) {
        toast({
          title: "请填写AI指令",
          variant: "destructive",
        });
        setCurrentTab("action");
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!scenario || !validateForm()) return;

    setLoading(true);
    try {
      const ruleData = {
        ruleName,
        priority: scenario.overrideRules.length + 1,
        isEnabled: true,
        triggerConditions,
        responseAction
      };

      if (rule) {
        // 更新现有规则
        await updateOverrideRule(scenario.scenarioId, rule.ruleId, ruleData);
        toast({
          title: "规则已更新",
          description: `自定义规则「${ruleName}」已更新`,
        });
      } else {
        // 创建新规则
        await addOverrideRule(scenario.scenarioId, ruleData);
        toast({
          title: "规则已创建",
          description: `自定义规则「${ruleName}」已创建`,
        });
      }

      onSave();
    } catch (error) {
      toast({
        title: "保存失败",
        description: "无法保存规则，请重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderConditionBuilder = (
    category: ConditionCategory,
    conditions: TriggerCondition[],
    categoryLabel: string
  ) => {
    if (!scenario) return null;

    const availableFields = scenario.availableFields[category] || [];

    // 如果没有可用字段，不显示此条件类型
    if (availableFields.length === 0) return null;

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{categoryLabel}</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addCondition(category)}
            >
              <Plus className="h-4 w-4 mr-2" />
              添加条件
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {conditions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>暂无{categoryLabel}</p>
              <p className="text-sm mt-1">点击上方按钮添加第一个条件</p>
            </div>
          ) : (
            conditions.map((condition) => (
              <div key={condition.id} className="border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-sm">字段</Label>
                      <Select
                        value={condition.field}
                        onValueChange={(value) => updateCondition(category, condition.id, { field: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择字段" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableFields.map((field) => (
                            <SelectItem key={field.field} value={field.field}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm">操作符</Label>
                      <Select
                        value={condition.operator}
                        onValueChange={(value) => updateCondition(category, condition.id, { operator: value as ConditionOperator })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="操作符" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(operatorLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm">值</Label>
                      <Input
                        placeholder="输入值"
                        value={condition.value}
                        onChange={(e) => updateCondition(category, condition.id, { value: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCondition(category, condition.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    );
  };

  const renderActionConfig = () => {
    if (responseAction.contentMode === 'FULLY_GENERATIVE') {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            内容将完全由AI根据用户画像和场景自动生成，无需配置具体内容。
          </AlertDescription>
        </Alert>
      );
    }

    if (responseAction.contentMode === 'AI_ASSISTED') {
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="aiPrompt">AI指令</Label>
            <Textarea
              id="aiPrompt"
              placeholder="请输入给AI的业务用途和指令，例如：为VIP客��生成专属优惠信息..."
              value={responseAction.actionConfig.aiPrompt || ''}
              onChange={(e) => updateActionConfig({ aiPrompt: e.target.value })}
              rows={3}
            />
          </div>
        </div>
      );
    }

    // 静态内容模式
    switch (responseAction.actionType) {
      case 'POPUP':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">弹窗标题 *</Label>
              <Input
                id="title"
                placeholder="输入弹窗标题"
                value={responseAction.actionConfig.title || ''}
                onChange={(e) => updateActionConfig({ title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="body">弹窗内容 *</Label>
              <Textarea
                id="body"
                placeholder="输入弹窗正文内容"
                value={responseAction.actionConfig.body || ''}
                onChange={(e) => updateActionConfig({ body: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="buttonText">按钮文字</Label>
              <Input
                id="buttonText"
                placeholder="输入按钮文字，默认为'确定'"
                value={responseAction.actionConfig.buttonText || ''}
                onChange={(e) => updateActionConfig({ buttonText: e.target.value })}
              />
            </div>
          </div>
        );

      case 'EMAIL':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">邮件主题 *</Label>
              <Input
                id="subject"
                placeholder="输入邮件主题"
                value={responseAction.actionConfig.subject || ''}
                onChange={(e) => updateActionConfig({ subject: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="emailBody">邮件内容 *</Label>
              <Textarea
                id="emailBody"
                placeholder="输入邮件正文内容"
                value={responseAction.actionConfig.emailBody || ''}
                onChange={(e) => updateActionConfig({ emailBody: e.target.value })}
                rows={4}
              />
            </div>
          </div>
        );

      case 'SMS':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="smsContent">���信内容 *</Label>
              <Textarea
                id="smsContent"
                placeholder="输入短信内容（建议控制在70字以内）"
                value={responseAction.actionConfig.smsContent || ''}
                onChange={(e) => updateActionConfig({ smsContent: e.target.value })}
                rows={2}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[800px] max-w-[90vw] flex flex-col">
        <SheetHeader>
          <SheetTitle>
            {rule ? '编辑自定义规则' : '创建自定义规则'}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          <div>
            <Label htmlFor="ruleName">规则名称 *</Label>
            <Input
              id="ruleName"
              placeholder="为这条规则取个名字，例如：VIP客户高价值购物车挽留"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
            />
          </div>

          {(() => {
            // 检查是否有可用的触发条件字段
            const hasEventFields = scenario?.availableFields?.event?.length > 0;
            const hasUserFields = scenario?.availableFields?.user?.length > 0;
            const hasTriggerConditions = hasEventFields || hasUserFields;
            
            // 如果没有触发条件，直接显示响应动作
            if (!hasTriggerConditions) {
              return (
                <div className="space-y-6">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      当前场景下无可用的触发条件字段，规则将直接应用于该场景的所有触发事件。
                    </AlertDescription>
                  </Alert>
                  
                  <div>
                    <Label>营销方式</Label>
                    <Select
                      value={responseAction.actionType}
                      onValueChange={(value) => setResponseAction(prev => ({
                        ...prev,
                        actionType: value as ActionType,
                        actionConfig: {}
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(actionTypeLabels).map(([value, label]) => (
                          <SelectItem
                            key={value}
                            value={value}
                            disabled={value === 'EMAIL' || value === 'SMS'}
                          >
                            {label}{(value === 'EMAIL' || value === 'SMS') && ' (暂不可用)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>营销时机</Label>
                    <Select
                      value={responseAction.timing}
                      onValueChange={(value) => setResponseAction(prev => ({
                        ...prev,
                        timing: value as TimingStrategy
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(timingLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>内容模式</Label>
                    <RadioGroup
                      value={responseAction.contentMode}
                      onValueChange={(value) => setResponseAction(prev => ({
                        ...prev,
                        contentMode: value as ContentStrategy,
                        actionConfig: {}
                      }))}
                      className="mt-2"
                    >
                      {Object.entries(contentStrategyLabels).map(([value, label]) => (
                        <div key={value} className="flex items-center space-x-2">
                          <RadioGroupItem value={value} id={value} />
                          <Label htmlFor={value}>{label}</Label>
                        </div>
                      ))}
                    </RadioGroup>

                    <div className="mt-4">
                      {renderActionConfig()}
                    </div>
                  </div>
                </div>
              );
            }
            
            // 有触发条件时显示标签页
            return (
              <Tabs value={currentTab} onValueChange={setCurrentTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="conditions">触发条件</TabsTrigger>
                  <TabsTrigger value="action">响应动作</TabsTrigger>
                </TabsList>

                <TabsContent value="conditions" className="space-y-4 mt-4">
                  {scenario && scenario.availableFields.event.length > 0 &&
                    renderConditionBuilder('event', triggerConditions.eventConditions, '事件属性条件')
                  }
                  {scenario && scenario.availableFields.user.length > 0 &&
                    renderConditionBuilder('user', triggerConditions.userConditions, '用户画像条件')
                  }
                </TabsContent>

                <TabsContent value="action" className="space-y-4 mt-4">
                  <div>
                    <Label>营销方式</Label>
                    <Select
                      value={responseAction.actionType}
                      onValueChange={(value) => setResponseAction(prev => ({
                        ...prev,
                        actionType: value as ActionType,
                        actionConfig: {}
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(actionTypeLabels).map(([value, label]) => (
                          <SelectItem
                            key={value}
                            value={value}
                            disabled={value === 'EMAIL' || value === 'SMS'}
                          >
                            {label}{(value === 'EMAIL' || value === 'SMS') && ' (暂不可用)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>营销时机</Label>
                    <Select
                      value={responseAction.timing}
                      onValueChange={(value) => setResponseAction(prev => ({
                        ...prev,
                        timing: value as TimingStrategy
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(timingLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>内容模式</Label>
                    <RadioGroup
                      value={responseAction.contentMode}
                      onValueChange={(value) => setResponseAction(prev => ({
                        ...prev,
                        contentMode: value as ContentStrategy,
                        actionConfig: {}
                      }))}
                      className="mt-2"
                    >
                      {Object.entries(contentStrategyLabels).map(([value, label]) => (
                        <div key={value} className="flex items-center space-x-2">
                          <RadioGroupItem value={value} id={value} />
                          <Label htmlFor={value}>{label}</Label>
                        </div>
                      ))}
                    </RadioGroup>

                    <div className="mt-4">
                      {renderActionConfig()}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            );
          })()}
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "保存中..." : "保存规则"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default RuleBuilderModal;
