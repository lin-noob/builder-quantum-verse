import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X, Info } from 'lucide-react';

// 新的数据类型定义
export type TriggerEventName =
  | 'page_view'
  | 'view_product'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'start_checkout'
  | 'purchase'
  | 'user_signup'
  | 'user_signin'
  | 'submit_form'
  | 'search';

export type ComparisonOperator = '=' | '!=' | '>' | '<' | 'CONTAINS' | '!CONTAINS';

// ���件接口
export interface ConditionItem {
  field: string;
  operator: ComparisonOperator;
  value: string | number;
}

// 新的触发规则配置
export interface NewTriggerRuleConfig {
  eventName: TriggerEventName;
  conditions: ConditionItem[];
  userConditions: ConditionItem[];
}

// 新的触发规则
export interface NewTriggerRule {
  type: 'REAL_TIME';
  config: NewTriggerRuleConfig;
}

// 字段配置
interface FieldConfig {
  id: string;
  name: string;
  dataType: 'text' | 'number';
  description: string;
  applicableEvents?: TriggerEventName[];
}

// 事件属性字段
const EVENT_FIELDS: FieldConfig[] = [
  { id: 'page_url', name: '页面URL', dataType: 'text', description: '事件发生时所在页面的网址', applicableEvents: ['page_view'] },
  { id: 'page_title', name: '页面标题', dataType: 'text', description: '事件发生时所在页面的标题', applicableEvents: ['page_view'] },
  { id: 'page_dwell_time_seconds', name: '页面停留时长(秒)', dataType: 'number', description: '用户在该页面已停留的总秒数', applicableEvents: ['page_view'] },
  { id: 'page_scroll_depth', name: '页面滚动深度(%)', dataType: 'number', description: '用户在该页面向下的最大滚动位置', applicableEvents: ['page_view'] },
  { id: 'product_name', name: '商品名称', dataType: 'text', description: '相关的商品名称', applicableEvents: ['view_product', 'add_to_cart', 'remove_from_cart'] },
  { id: 'category', name: '商品品类', dataType: 'text', description: '相关的商品品类', applicableEvents: ['view_product', 'add_to_cart', 'remove_from_cart'] },
  { id: 'price', name: '商品价格', dataType: 'number', description: '相关的商品单价', applicableEvents: ['view_product', 'add_to_cart', 'remove_from_cart'] },
  { id: 'cart_total_amount', name: '当前购物车总金额', dataType: 'number', description: '购物车商品总价', applicableEvents: ['add_to_cart', 'remove_from_cart'] },
  { id: 'form_name', name: '表单名称/ID', dataType: 'text', description: '提交的表单名称或ID', applicableEvents: ['submit_form'] },
  { id: 'search_term', name: '搜索关键词', dataType: 'text', description: '用户输入的搜索词', applicableEvents: ['search'] },
];

// 用户画像字段
const USER_FIELDS: FieldConfig[] = [
  { id: 'tag', name: '用户标签', dataType: 'text', description: '用户所拥有的标签' },
  { id: 'total_spend', name: '累计消费金额', dataType: 'number', description: '用户历史累计的总消费' },
  { id: 'total_orders', name: '总订单数', dataType: 'number', description: '用户历史累计的总订单数' },
  { id: 'last_purchase_days', name: '���上次购买天数', dataType: 'number', description: '距离该用户上一次购买过去了多少天' },
];

// 事件显示名称
const EVENT_DISPLAY_NAMES: Record<TriggerEventName, string> = {
  'page_view': '浏览页面',
  'view_product': '查看商品',
  'add_to_cart': '加入购物车',
  'remove_from_cart': '从购物车移除',
  'start_checkout': '开始结账',
  'purchase': '完成购买',
  'user_signup': '用户注册',
  'user_signin': '用户登录',
  'submit_form': '提交表单',
  'search': '执行搜索',
};

// 操作符显示名称
const OPERATOR_DISPLAY_NAMES: Record<ComparisonOperator, string> = {
  '=': '等于',
  '!=': '不等于',
  '>': '大于',
  '<': '小于',
  'CONTAINS': '包含',
  '!CONTAINS': '不包含',
};

interface TriggerRuleConfigProps {
  value: NewTriggerRule;
  onChange: (rule: NewTriggerRule) => void;
  className?: string;
}

export default function TriggerRuleConfigNew({ value, onChange, className = '' }: TriggerRuleConfigProps) {
  const [selectedEvent, setSelectedEvent] = useState<TriggerEventName>(value.config.eventName);
  const [conditions, setConditions] = useState<ConditionItem[]>(value.config.conditions || []);
  const [userConditions, setUserConditions] = useState<ConditionItem[]>(value.config.userConditions || []);

  // ���新父组件
  useEffect(() => {
    onChange({
      type: 'REAL_TIME',
      config: {
        eventName: selectedEvent,
        conditions: conditions,
        userConditions: userConditions
      }
    });
  }, [selectedEvent, conditions, userConditions, onChange]);

  // ���取当前事件可用的事件属性字段
  const getAvailableEventFields = (): FieldConfig[] => {
    return EVENT_FIELDS.filter(field => 
      !field.applicableEvents || field.applicableEvents.includes(selectedEvent)
    );
  };

  // 获取操作符选项（根据字段类型）
  const getOperatorOptions = (dataType: 'text' | 'number'): ComparisonOperator[] => {
    if (dataType === 'number') {
      return ['=', '!=', '>', '<'];
    }
    return ['=', '!=', 'CONTAINS', '!CONTAINS'];
  };

  // 事件改变时重置所有条件
  const handleEventChange = (eventName: TriggerEventName) => {
    setSelectedEvent(eventName);
    setConditions([]);
    setUserConditions([]);
  };

  // 条件管理函数
  const addCondition = (type: 'event' | 'user') => {
    let fields: FieldConfig[];
    let setter: (conditions: ConditionItem[]) => void;
    let currentConditions: ConditionItem[];

    switch (type) {
      case 'event':
        fields = getAvailableEventFields();
        setter = setConditions;
        currentConditions = conditions;
        break;
      case 'user':
        fields = USER_FIELDS;
        setter = setUserConditions;
        currentConditions = userConditions;
        break;
    }

    if (fields.length === 0) return;

    const newCondition: ConditionItem = {
      field: fields[0].id,
      operator: '=',
      value: ''
    };
    setter([...currentConditions, newCondition]);
  };

  const removeCondition = (type: 'event' | 'user', index: number) => {
    switch (type) {
      case 'event':
        setConditions(conditions.filter((_, i) => i !== index));
        break;
      case 'user':
        setUserConditions(userConditions.filter((_, i) => i !== index));
        break;
    }
  };

  const updateCondition = (
    type: 'event' | 'user',
    index: number,
    updates: Partial<ConditionItem>
  ) => {
    const updateArray = (current: ConditionItem[]) => {
      const newConditions = [...current];
      newConditions[index] = { ...newConditions[index], ...updates };
      return newConditions;
    };

    switch (type) {
      case 'event':
        setConditions(updateArray(conditions));
        break;
      case 'user':
        setUserConditions(updateArray(userConditions));
        break;
    }
  };

  // 条件渲染组件
  const renderConditions = (
    type: 'event' | 'user',
    conditionsList: ConditionItem[],
    fields: FieldConfig[]
  ) => {
    if (conditionsList.length === 0) {
      return (
        <div className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg">
          暂无{type === 'event' ? '事件属性' : '用户画像'}过滤条件
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {conditionsList.map((condition, index) => {
          const field = fields.find(f => f.id === condition.field);
          return (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {/* 字段选择 */}
              <div className="flex-1">
                <Select
                  value={condition.field}
                  onValueChange={(value) => updateCondition(type, index, { field: value })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fields.map(field => (
                      <SelectItem key={field.id} value={field.id}>
                        {field.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 操作符选择 */}
              <div className="w-24">
                <Select
                  value={condition.operator}
                  onValueChange={(value) => updateCondition(type, index, { operator: value as ComparisonOperator })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getOperatorOptions(field?.dataType || 'text').map(op => (
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
                  type={field?.dataType === 'number' ? 'number' : 'text'}
                  value={condition.value}
                  onChange={(e) => updateCondition(type, index, { value: e.target.value })}
                  placeholder="输入比较值"
                  className="h-9"
                />
              </div>

              {/* 删除按钮 */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeCondition(type, index)}
                className="h-9 w-9 p-0 text-gray-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 触发事件选择 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">触发事件</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedEvent} onValueChange={handleEventChange}>
            <SelectTrigger>
              <SelectValue placeholder="选择用户行为事件" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(EVENT_DISPLAY_NAMES).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-2">
            作为启动规则判断的核心用户行为
          </p>
        </CardContent>
      </Card>

      {/* 条件配置 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">过滤条件配置</CardTitle>
          <p className="text-sm text-gray-600">
            可设置多种类型的过滤条件，同类型条件之间为"且"关系
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="event" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="event">事件属性条件</TabsTrigger>
              <TabsTrigger value="user">用户画像条件</TabsTrigger>
            </TabsList>

            {/* 事件属性条件 */}
            <TabsContent value="event" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">事件属性条件</h4>
                  <Badge variant="outline" className="text-xs">
                    {conditions.length} 条
                  </Badge>
                </div>
                {getAvailableEventFields().length > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addCondition('event')}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    添加条件
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    添加条件
                  </Button>
                )}
              </div>
              <div className="text-xs text-gray-500 flex items-start gap-2">
                <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                对主要触发事件的属性进行过滤，如页面URL、商品价格等
              </div>
              {getAvailableEventFields().length > 0 ? (
                renderConditions('event', conditions, getAvailableEventFields())
              ) : (
                <div className="text-sm text-gray-500 italic bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                  ⚠️ 当前触发事件"{EVENT_DISPLAY_NAMES[selectedEvent]}"无需设置事件属性条件
                </div>
              )}
            </TabsContent>

            {/* 用户画像条件 */}
            <TabsContent value="user" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">用户画像条件</h4>
                  <Badge variant="outline" className="text-xs">
                    {userConditions.length} 条
                  </Badge>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addCondition('user')}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  添加条件
                </Button>
              </div>
              <div className="text-xs text-gray-500 flex items-start gap-2">
                <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                对触发事件的用户本人的画像进行过滤，如用户标签、消费记录等
              </div>
              {renderConditions('user', userConditions, USER_FIELDS)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 规则预览 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">规则预览</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">触发事件</Badge>
              <span className="text-sm font-medium">
                {EVENT_DISPLAY_NAMES[selectedEvent]}
              </span>
            </div>
            
            {conditions.length > 0 && (
              <div>
                <Badge variant="outline" className="mb-2">事件属性条件 ({conditions.length})</Badge>
                <div className="text-sm text-gray-700 space-y-1">
                  {conditions.map((condition, index) => {
                    const field = getAvailableEventFields().find(f => f.id === condition.field);
                    return (
                      <div key={index} className="pl-2">
                        • {field?.name} {OPERATOR_DISPLAY_NAMES[condition.operator]} {condition.value}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {userConditions.length > 0 && (
              <div>
                <Badge variant="outline" className="mb-2">用户画像条件 ({userConditions.length})</Badge>
                <div className="text-sm text-gray-700 space-y-1">
                  {userConditions.map((condition, index) => {
                    const field = USER_FIELDS.find(f => f.id === condition.field);
                    return (
                      <div key={index} className="pl-2">
                        • {field?.name} {OPERATOR_DISPLAY_NAMES[condition.operator]} {condition.value}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {conditions.length === 0 && userConditions.length === 0 && (
              <div className="text-sm text-gray-500 italic">
                当前仅使用基础触发事件，未设置额外过滤条件
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
