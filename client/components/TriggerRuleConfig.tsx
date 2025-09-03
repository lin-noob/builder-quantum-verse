import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import {
  TriggerRule,
  TriggerEventName,
  EventCondition,
  FilterField,
  ComparisonOperator,
  EVENT_DISPLAY_NAMES,
  FIELD_DISPLAY_NAMES,
  OPERATOR_DISPLAY_NAMES,
  EVENT_FIELD_MAPPING,
  generateTriggerRuleSummary
} from '@shared/aiMarketingStrategyData';

interface TriggerRuleConfigProps {
  value: TriggerRule;
  onChange: (rule: TriggerRule) => void;
  className?: string;
}

export default function TriggerRuleConfig({ value, onChange, className = '' }: TriggerRuleConfigProps) {
  const [selectedEvent, setSelectedEvent] = useState<TriggerEventName>(value.config.eventName);
  const [conditions, setConditions] = useState<EventCondition[]>(value.config.conditions || []);

  // 获取当前事件可用的字段
  const availableFields = EVENT_FIELD_MAPPING[selectedEvent] || [];

  // 更新父组件
  useEffect(() => {
    onChange({
      type: 'REAL_TIME',
      config: {
        eventName: selectedEvent,
        conditions: conditions
      }
    });
  }, [selectedEvent, conditions, onChange]);

  // 添加新条件
  const addCondition = () => {
    if (availableFields.length === 0) return;
    
    const newCondition: EventCondition = {
      field: availableFields[0],
      operator: '=',
      value: ''
    };
    setConditions([...conditions, newCondition]);
  };

  // 删除条件
  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  // 更新条件
  const updateCondition = (index: number, updates: Partial<EventCondition>) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], ...updates };
    setConditions(newConditions);
  };

  // 事件改变时重置条件
  const handleEventChange = (eventName: TriggerEventName) => {
    setSelectedEvent(eventName);
    setConditions([]); // 清空条件，因为字段可能不兼容
  };

  // 获取操作符选项（根据字段类型）
  const getOperatorOptions = (field: FilterField): ComparisonOperator[] => {
    // 数值型字段支持所有操作符
    if (['price', 'cart_total_amount', 'page_dwell_time_seconds'].includes(field)) {
      return ['=', '!=', '>', '<', 'CONTAINS', 'NOT_CONTAINS'];
    }
    // 文本型字段不支持大小比较
    return ['=', '!=', 'CONTAINS', 'NOT_CONTAINS'];
  };

  // 获取输入类型
  const getInputType = (field: FilterField): 'text' | 'number' => {
    return ['price', 'cart_total_amount', 'page_dwell_time_seconds'].includes(field) ? 'number' : 'text';
  };

  // 验证条件是否完整
  const isConditionComplete = (condition: EventCondition): boolean => {
    return condition.field && condition.operator && condition.value !== '';
  };

  // 验证所有条件是否完整
  const allConditionsComplete = conditions.every(isConditionComplete);

  return (
    <div className={`space-y-6 ${className}`}>
          {/* 第一步：选择触发事件 */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              触发事件 <span className="text-red-500">*</span>
            </label>
            <Select value={selectedEvent} onValueChange={handleEventChange}>
              <SelectTrigger>
                <SelectValue placeholder="选择用户行为事件" />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1 text-xs font-medium text-gray-500 border-b">生命周期</div>
                <SelectItem value="user_signup">用户注册</SelectItem>
                <SelectItem value="user_login">用户登录</SelectItem>
                
                <div className="px-2 py-1 text-xs font-medium text-gray-500 border-b mt-2">浏览互动</div>
                <SelectItem value="session_start">开始会话</SelectItem>
                <SelectItem value="page_view">浏览页面</SelectItem>
                <SelectItem value="exit_intent">离开意图</SelectItem>
                
                <div className="px-2 py-1 text-xs font-medium text-gray-500 border-b mt-2">电商行为</div>
                <SelectItem value="search">执行搜索</SelectItem>
                <SelectItem value="view_product">查看商品</SelectItem>
                <SelectItem value="add_to_cart">加入购物车</SelectItem>
                <SelectItem value="remove_from_cart">从购物车移除</SelectItem>
                <SelectItem value="start_checkout">开始结账</SelectItem>
                <SelectItem value="purchase">完成购买</SelectItem>
                
                <div className="px-2 py-1 text-xs font-medium text-gray-500 border-b mt-2">表单沟通</div>
                <SelectItem value="submit_form">提交表单</SelectItem>
                <SelectItem value="newsletter_subscribe">订阅邮件</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              选择作为策略启动信号的核心用户行为
            </p>
          </div>

          {/* 第二步：事件过滤条件 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-900">
                过滤条件 <span className="text-gray-400">(可选)</span>
              </label>
              {availableFields.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCondition}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  添加条件
                </Button>
              )}
            </div>

            {availableFields.length === 0 ? (
              <div className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg">
                当前事件"{EVENT_DISPLAY_NAMES[selectedEvent]}"已足够明确，无需额外过滤条件
              </div>
            ) : (
              <div className="space-y-3">
                {conditions.map((condition, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {/* 字段选择 */}
                    <div className="flex-1">
                      <Select
                        value={condition.field}
                        onValueChange={(value) => updateCondition(index, { field: value as FilterField })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableFields.map(field => (
                            <SelectItem key={field} value={field}>
                              {FIELD_DISPLAY_NAMES[field]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 操作符选择 */}
                    <div className="w-24">
                      <Select
                        value={condition.operator}
                        onValueChange={(value) => updateCondition(index, { operator: value as ComparisonOperator })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getOperatorOptions(condition.field).map(op => (
                            <SelectItem key={op} value={op}>
                              {OPERATOR_DISPLAY_NAMES[op]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 值输入 */}
                    <div className="flex-1">
                      <Input
                        type={getInputType(condition.field)}
                        value={condition.value}
                        onChange={(e) => updateCondition(index, { value: e.target.value })}
                        placeholder="输入比较值"
                        className="h-9"
                      />
                    </div>

                    {/* 删除按钮 */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCondition(index)}
                      className="h-9 w-9 p-0 text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {conditions.length > 0 && (
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">注意：</span>多个条件之间为"且"关系，即所有条件都必须满足
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 规则预览 */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">规则预览</label>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-100 text-blue-800">触发条件</Badge>
              </div>
              <p className="text-sm text-blue-900 font-medium">
                {generateTriggerRuleSummary({
                  type: 'REAL_TIME',
                  config: { eventName: selectedEvent, conditions }
                })}
              </p>
              {conditions.length > 0 && !allConditionsComplete && (
                <p className="text-xs text-orange-600 mt-2">
                  ⚠️ 部分过滤条件不完整，请补充所有字段
                </p>
              )}
            </div>
          </div>
    </div>
  );
}
