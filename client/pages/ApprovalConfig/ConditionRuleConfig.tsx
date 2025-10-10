import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit, Trash2, Settings, Save, X, Code, Play, TestTube, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { ApprovalCondition, ApprovalConditionType } from '@/types/approval';

interface ConditionRule {
  id: string;
  name: string;
  description: string;
  conditions: ApprovalCondition[];
  logicOperator: 'AND' | 'OR';
  expression: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

interface ConditionRuleConfigProps {
  rules: ConditionRule[];
  onRulesChange: (rules: ConditionRule[]) => void;
}

interface RuleFormData {
  name: string;
  description: string;
  conditions: ApprovalCondition[];
  logicOperator: 'AND' | 'OR';
  expression: string;
  isActive: boolean;
  priority: number;
}

const ConditionRuleConfig: React.FC<ConditionRuleConfigProps> = ({ rules, onRulesChange }) => {
  const [selectedRule, setSelectedRule] = useState<ConditionRule | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const [formData, setFormData] = useState<RuleFormData>({
    name: '',
    description: '',
    conditions: [],
    logicOperator: 'AND',
    expression: '',
    isActive: true,
    priority: 1
  });

  const [conditionFormData, setConditionFormData] = useState({
    type: ApprovalConditionType.AMOUNT,
    operator: '>',
    value: '',
    description: ''
  });

  const [testData, setTestData] = useState({
    amount: '',
    department: '',
    role: '',
    customFields: {} as Record<string, string>
  });

  const [testResult, setTestResult] = useState<{
    passed: boolean;
    message: string;
    details: string[];
  } | null>(null);

  // 模拟规则数据
  const mockRules: ConditionRule[] = [
    {
      id: '1',
      name: '大额费用审批规则',
      description: '金额超过10000元的费用需要特殊审批',
      conditions: [
        {
          type: ApprovalConditionType.AMOUNT,
          operator: '>',
          value: '10000',
          description: '金额大于10000元'
        }
      ],
      logicOperator: 'AND',
      expression: 'amount > 10000',
      isActive: true,
      priority: 1,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: '2',
      name: '跨部门协作审批规则',
      description: '涉及多个部门的项目需要部门主管审批',
      conditions: [
        {
          type: ApprovalConditionType.DEPARTMENT,
          operator: '!=',
          value: 'current_department',
          description: '跨部门项目'
        },
        {
          type: ApprovalConditionType.AMOUNT,
          operator: '>',
          value: '5000',
          description: '金额大于5000元'
        }
      ],
      logicOperator: 'AND',
      expression: 'department != current_department AND amount > 5000',
      isActive: true,
      priority: 2,
      createdAt: '2024-01-10',
      updatedAt: '2024-01-12'
    },
    {
      id: '3',
      name: '高级管理层审批规则',
      description: '总监级别以上的审批权限',
      conditions: [
        {
          type: ApprovalConditionType.ROLE,
          operator: 'in',
          value: '总监,副总,总经理',
          description: '高级管理层角色'
        }
      ],
      logicOperator: 'OR',
      expression: 'role in ["总监", "副总", "总经理"]',
      isActive: false,
      priority: 3,
      createdAt: '2024-01-08',
      updatedAt: '2024-01-08'
    }
  ];

  useEffect(() => {
    if (rules.length === 0) {
      onRulesChange(mockRules);
    }
  }, [rules, onRulesChange]);

  const resetFormData = () => {
    setFormData({
      name: '',
      description: '',
      conditions: [],
      logicOperator: 'AND',
      expression: '',
      isActive: true,
      priority: 1
    });
  };

  const getConditionTypeLabel = (type: ApprovalConditionType) => {
    const labels = {
      [ApprovalConditionType.AMOUNT]: '金额条件',
      [ApprovalConditionType.DEPARTMENT]: '部门条件',
      [ApprovalConditionType.ROLE]: '角色条件',
      [ApprovalConditionType.CUSTOM]: '自定义条件'
    };
    return labels[type] || type;
  };

  const getOperatorLabel = (operator: string) => {
    const labels: Record<string, string> = {
      '>': '大于',
      '>=': '大于等于',
      '<': '小于',
      '<=': '小于等于',
      '=': '等于',
      '!=': '不等于',
      'in': '包含于',
      'not_in': '不包含于',
      'contains': '包含',
      'not_contains': '不包含'
    };
    return labels[operator] || operator;
  };

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && rule.isActive) ||
                         (filterStatus === 'inactive' && !rule.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleCreateRule = () => {
    resetFormData();
    setIsCreateDialogOpen(true);
  };

  const handleEditRule = (rule: ConditionRule) => {
    setSelectedRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description,
      conditions: rule.conditions,
      logicOperator: rule.logicOperator,
      expression: rule.expression,
      isActive: rule.isActive,
      priority: rule.priority
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveRule = () => {
    const ruleData: ConditionRule = {
      id: selectedRule?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      conditions: formData.conditions,
      logicOperator: formData.logicOperator,
      expression: formData.expression,
      isActive: formData.isActive,
      priority: formData.priority,
      createdAt: selectedRule?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    if (selectedRule) {
      // 编辑现有规则
      const updatedRules = rules.map(rule =>
        rule.id === selectedRule.id ? ruleData : rule
      );
      onRulesChange(updatedRules);
      setIsEditDialogOpen(false);
    } else {
      // 创建新规则
      onRulesChange([...rules, ruleData]);
      setIsCreateDialogOpen(false);
    }
    setSelectedRule(null);
  };

  const handleDeleteRule = (ruleId: string) => {
    const updatedRules = rules.filter(rule => rule.id !== ruleId);
    onRulesChange(updatedRules);
  };

  const handleToggleRule = (ruleId: string) => {
    const updatedRules = rules.map(rule =>
      rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
    );
    onRulesChange(updatedRules);
  };

  const handleAddCondition = () => {
    const newCondition: ApprovalCondition = {
      type: conditionFormData.type,
      operator: conditionFormData.operator,
      value: conditionFormData.value,
      description: conditionFormData.description
    };

    setFormData(prev => ({
      ...prev,
      conditions: [...prev.conditions, newCondition]
    }));

    // 自动生成表达式
    generateExpression([...formData.conditions, newCondition], formData.logicOperator);

    setConditionFormData({
      type: ApprovalConditionType.AMOUNT,
      operator: '>',
      value: '',
      description: ''
    });
  };

  const handleRemoveCondition = (index: number) => {
    const updatedConditions = formData.conditions.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      conditions: updatedConditions
    }));
    generateExpression(updatedConditions, formData.logicOperator);
  };

  const generateExpression = (conditions: ApprovalCondition[], operator: 'AND' | 'OR') => {
    if (conditions.length === 0) {
      setFormData(prev => ({ ...prev, expression: '' }));
      return;
    }

    const expressions = conditions.map(condition => {
      const field = condition.type.toLowerCase();
      const op = condition.operator;
      const value = condition.value;
      
      if (op === 'in' || op === 'not_in') {
        const values = value.split(',').map(v => `"${v.trim()}"`).join(', ');
        return `${field} ${op === 'in' ? 'in' : 'not in'} [${values}]`;
      }
      
      return `${field} ${op} ${isNaN(Number(value)) ? `"${value}"` : value}`;
    });

    const expression = expressions.join(` ${operator} `);
    setFormData(prev => ({ ...prev, expression }));
  };

  const handleTestRule = (rule: ConditionRule) => {
    setSelectedRule(rule);
    setTestData({
      amount: '',
      department: '',
      role: '',
      customFields: {}
    });
    setTestResult(null);
    setIsTestDialogOpen(true);
  };

  const executeTest = () => {
    if (!selectedRule) return;

    try {
      const results: string[] = [];
      let allPassed = true;

      selectedRule.conditions.forEach((condition, index) => {
        let testValue: string | number = '';
        let actualValue: string | number = '';

        switch (condition.type) {
          case ApprovalConditionType.AMOUNT:
            testValue = parseFloat(condition.value);
            actualValue = parseFloat(testData.amount);
            break;
          case ApprovalConditionType.DEPARTMENT:
            testValue = condition.value;
            actualValue = testData.department;
            break;
          case ApprovalConditionType.ROLE:
            testValue = condition.value;
            actualValue = testData.role;
            break;
          default:
            testValue = condition.value;
            actualValue = testData.customFields[condition.type] || '';
        }

        let conditionPassed = false;
        let resultMessage = '';

        switch (condition.operator) {
          case '>':
            conditionPassed = Number(actualValue) > Number(testValue);
            resultMessage = `${actualValue} > ${testValue} = ${conditionPassed}`;
            break;
          case '>=':
            conditionPassed = Number(actualValue) >= Number(testValue);
            resultMessage = `${actualValue} >= ${testValue} = ${conditionPassed}`;
            break;
          case '<':
            conditionPassed = Number(actualValue) < Number(testValue);
            resultMessage = `${actualValue} < ${testValue} = ${conditionPassed}`;
            break;
          case '<=':
            conditionPassed = Number(actualValue) <= Number(testValue);
            resultMessage = `${actualValue} <= ${testValue} = ${conditionPassed}`;
            break;
          case '=':
            conditionPassed = actualValue === testValue;
            resultMessage = `${actualValue} = ${testValue} = ${conditionPassed}`;
            break;
          case '!=':
            conditionPassed = actualValue !== testValue;
            resultMessage = `${actualValue} != ${testValue} = ${conditionPassed}`;
            break;
          case 'in':
            const inValues = testValue.toString().split(',').map(v => v.trim());
            conditionPassed = inValues.includes(actualValue.toString());
            resultMessage = `${actualValue} in [${inValues.join(', ')}] = ${conditionPassed}`;
            break;
          case 'not_in':
            const notInValues = testValue.toString().split(',').map(v => v.trim());
            conditionPassed = !notInValues.includes(actualValue.toString());
            resultMessage = `${actualValue} not in [${notInValues.join(', ')}] = ${conditionPassed}`;
            break;
          default:
            conditionPassed = false;
            resultMessage = `未知操作符: ${condition.operator}`;
        }

        results.push(`条件 ${index + 1}: ${condition.description || getConditionTypeLabel(condition.type)} - ${resultMessage}`);

        if (selectedRule.logicOperator === 'AND' && !conditionPassed) {
          allPassed = false;
        } else if (selectedRule.logicOperator === 'OR' && conditionPassed) {
          allPassed = true;
        }
      });

      // 对于OR逻辑，如果没有任何条件通过，则失败
      if (selectedRule.logicOperator === 'OR' && selectedRule.conditions.length > 0) {
        allPassed = selectedRule.conditions.some((condition, index) => {
          // 重新计算每个条件的结果
          let testValue: string | number = '';
          let actualValue: string | number = '';

          switch (condition.type) {
            case ApprovalConditionType.AMOUNT:
              testValue = parseFloat(condition.value);
              actualValue = parseFloat(testData.amount);
              break;
            case ApprovalConditionType.DEPARTMENT:
              testValue = condition.value;
              actualValue = testData.department;
              break;
            case ApprovalConditionType.ROLE:
              testValue = condition.value;
              actualValue = testData.role;
              break;
            default:
              testValue = condition.value;
              actualValue = testData.customFields[condition.type] || '';
          }

          switch (condition.operator) {
            case '>': return Number(actualValue) > Number(testValue);
            case '>=': return Number(actualValue) >= Number(testValue);
            case '<': return Number(actualValue) < Number(testValue);
            case '<=': return Number(actualValue) <= Number(testValue);
            case '=': return actualValue === testValue;
            case '!=': return actualValue !== testValue;
            case 'in': return testValue.toString().split(',').map(v => v.trim()).includes(actualValue.toString());
            case 'not_in': return !testValue.toString().split(',').map(v => v.trim()).includes(actualValue.toString());
            default: return false;
          }
        });
      }

      setTestResult({
        passed: allPassed,
        message: allPassed ? '规则测试通过' : '规则测试失败',
        details: results
      });

    } catch (error) {
      setTestResult({
        passed: false,
        message: '测试执行出错',
        details: [`错误信息: ${error instanceof Error ? error.message : '未知错误'}`]
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">条件规则配置</h2>
          <p className="text-muted-foreground">配置审批流程的触发条件和业务规则</p>
        </div>
        <Button onClick={handleCreateRule} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          创建规则
        </Button>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="搜索规则名称或描述..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={(value: 'all' | 'active' | 'inactive') => setFilterStatus(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="active">启用</SelectItem>
            <SelectItem value="inactive">禁用</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 规则列表 */}
      <div className="grid gap-4">
        {filteredRules.map((rule) => (
          <Card key={rule.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{rule.name}</CardTitle>
                    <Badge variant={rule.isActive ? "default" : "secondary"}>
                      {rule.isActive ? "启用" : "禁用"}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      优先级 {rule.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{rule.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{rule.conditions.length} 个条件</span>
                    <span>逻辑: {rule.logicOperator}</span>
                    <span>更新: {rule.updatedAt}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTestRule(rule)}
                    title="测试规则"
                  >
                    <TestTube className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleRule(rule.id)}
                    title={rule.isActive ? "禁用规则" : "启用规则"}
                  >
                    {rule.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditRule(rule)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确认删除</AlertDialogTitle>
                        <AlertDialogDescription>
                          确定要删除规则 "{rule.name}" 吗？此操作不可撤销。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteRule(rule.id)}>
                          确认删除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* 条件列表 */}
                <div>
                  <div className="text-sm font-medium mb-2">条件：</div>
                  <div className="space-y-2">
                    {rule.conditions.map((condition, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="text-xs">
                          {getConditionTypeLabel(condition.type)}
                        </Badge>
                        <span>{getOperatorLabel(condition.operator)}</span>
                        <span className="font-mono bg-muted px-2 py-1 rounded text-xs">
                          {condition.value}
                        </span>
                        {condition.description && (
                          <span className="text-muted-foreground">({condition.description})</span>
                        )}
                        {index < rule.conditions.length - 1 && (
                          <Badge variant="secondary" className="text-xs">
                            {rule.logicOperator}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 表达式 */}
                {rule.expression && (
                  <div>
                    <div className="text-sm font-medium mb-2">表达式：</div>
                    <div className="bg-muted p-3 rounded font-mono text-sm">
                      {rule.expression}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredRules.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无匹配的规则</p>
              {searchTerm || filterStatus !== 'all' ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                  }}
                  className="mt-4"
                >
                  清除筛选
                </Button>
              ) : (
                <Button onClick={handleCreateRule} className="mt-4">
                  创建第一个规则
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* 创建规则对话框 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>创建条件规则</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList>
              <TabsTrigger value="basic">基本信息</TabsTrigger>
              <TabsTrigger value="conditions">条件配置</TabsTrigger>
              <TabsTrigger value="expression">表达式</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div>
                <Label htmlFor="rule-name">规则名称</Label>
                <Input
                  id="rule-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="输入规则名称"
                />
              </div>
              <div>
                <Label htmlFor="rule-description">规则描述</Label>
                <Textarea
                  id="rule-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="输入规则描述"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="logic-operator">逻辑操作符</Label>
                  <Select value={formData.logicOperator} onValueChange={(value: 'AND' | 'OR') => {
                    setFormData(prev => ({ ...prev, logicOperator: value }));
                    generateExpression(formData.conditions, value);
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">AND - 所有条件都必须满足</SelectItem>
                      <SelectItem value="OR">OR - 任意条件满足即可</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">优先级</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                    min="1"
                    max="10"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is-active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="is-active">启用规则</Label>
              </div>
            </TabsContent>

            <TabsContent value="conditions" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">条件配置</h3>
              </div>
              
              {/* 添加条件表单 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">添加新条件</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="condition-type">条件类型</Label>
                      <Select value={conditionFormData.type} onValueChange={(value: ApprovalConditionType) => setConditionFormData(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ApprovalConditionType.AMOUNT}>金额条件</SelectItem>
                          <SelectItem value={ApprovalConditionType.DEPARTMENT}>部门条件</SelectItem>
                          <SelectItem value={ApprovalConditionType.ROLE}>角色条件</SelectItem>
                          <SelectItem value={ApprovalConditionType.CUSTOM}>自定义条件</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="condition-operator">操作符</Label>
                      <Select value={conditionFormData.operator} onValueChange={(value) => setConditionFormData(prev => ({ ...prev, operator: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value=">">大于 (&gt;)</SelectItem>
                          <SelectItem value=">=">大于等于 (&gt;=)</SelectItem>
                          <SelectItem value="<">小于 (&lt;)</SelectItem>
                          <SelectItem value="<=">小于等于 (&lt;=)</SelectItem>
                          <SelectItem value="=">等于 (=)</SelectItem>
                          <SelectItem value="!=">不等于 (!=)</SelectItem>
                          <SelectItem value="in">包含于 (in)</SelectItem>
                          <SelectItem value="not_in">不包含于 (not in)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="condition-value">值</Label>
                    <Input
                      id="condition-value"
                      value={conditionFormData.value}
                      onChange={(e) => setConditionFormData(prev => ({ ...prev, value: e.target.value }))}
                      placeholder={conditionFormData.operator === 'in' || conditionFormData.operator === 'not_in' ? "多个值用逗号分隔" : "输入条件值"}
                    />
                  </div>
                  <div>
                    <Label htmlFor="condition-description">描述</Label>
                    <Input
                      id="condition-description"
                      value={conditionFormData.description}
                      onChange={(e) => setConditionFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="输入条件描述（可选）"
                    />
                  </div>
                  <Button onClick={handleAddCondition} disabled={!conditionFormData.value} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    添加条件
                  </Button>
                </CardContent>
              </Card>

              {/* 已添加的条件列表 */}
              <div className="space-y-2">
                <h4 className="font-medium">已添加的条件：</h4>
                {formData.conditions.map((condition, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{getConditionTypeLabel(condition.type)}</Badge>
                            <span className="text-sm">{getOperatorLabel(condition.operator)} {condition.value}</span>
                          </div>
                          {condition.description && (
                            <p className="text-sm text-muted-foreground">{condition.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {index < formData.conditions.length - 1 && (
                            <Badge variant="secondary" className="text-xs">
                              {formData.logicOperator}
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCondition(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {formData.conditions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>暂无条件</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="expression" className="space-y-4">
              <div>
                <Label htmlFor="expression">生成的表达式</Label>
                <Textarea
                  id="expression"
                  value={formData.expression}
                  onChange={(e) => setFormData(prev => ({ ...prev, expression: e.target.value }))}
                  placeholder="表达式将根据条件自动生成，也可以手动编辑"
                  className="font-mono"
                  rows={6}
                />
              </div>
              <div className="bg-muted p-4 rounded">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  表达式语法说明
                </h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• 字段名：amount（金额）、department（部门）、role（角色）</li>
                  <li>• 操作符：&gt;, &gt;=, &lt;, &lt;=, =, !=, in, not in</li>
                  <li>• 逻辑连接：AND, OR</li>
                  <li>• 字符串值需要用双引号包围</li>
                  <li>• 数组值用方括号包围，如：["值1", "值2"]</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveRule} disabled={!formData.name || formData.conditions.length === 0}>
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑规则对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑条件规则 - {selectedRule?.name}</DialogTitle>
          </DialogHeader>
          
          {/* 内容与创建对话框相同，这里省略重复代码 */}
          <div className="text-center py-8 text-muted-foreground">
            <p>编辑表单内容与创建表单相同</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveRule} disabled={!formData.name || formData.conditions.length === 0}>
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 测试规则对话框 */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              测试规则 - {selectedRule?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded">
              <h4 className="font-medium mb-2">规则信息</h4>
              <p className="text-sm text-muted-foreground mb-2">{selectedRule?.description}</p>
              <div className="font-mono text-sm bg-background p-2 rounded">
                {selectedRule?.expression}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">测试数据</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="test-amount">金额</Label>
                  <Input
                    id="test-amount"
                    type="number"
                    value={testData.amount}
                    onChange={(e) => setTestData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="输入测试金额"
                  />
                </div>
                <div>
                  <Label htmlFor="test-department">部门</Label>
                  <Input
                    id="test-department"
                    value={testData.department}
                    onChange={(e) => setTestData(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="输入测试部门"
                  />
                </div>
                <div>
                  <Label htmlFor="test-role">角色</Label>
                  <Input
                    id="test-role"
                    value={testData.role}
                    onChange={(e) => setTestData(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="输入测试角色"
                  />
                </div>
              </div>
            </div>

            <Button onClick={executeTest} className="w-full">
              <Play className="h-4 w-4 mr-2" />
              执行测试
            </Button>

            {testResult && (
              <div className="space-y-3">
                <Separator />
                <div className={`p-4 rounded border ${testResult.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {testResult.passed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className={`font-medium ${testResult.passed ? 'text-green-800' : 'text-red-800'}`}>
                      {testResult.message}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {testResult.details.map((detail, index) => (
                      <div key={index} className="text-sm text-muted-foreground font-mono">
                        {detail}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTestDialogOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConditionRuleConfig;