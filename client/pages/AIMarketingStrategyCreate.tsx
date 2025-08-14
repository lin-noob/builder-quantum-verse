import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  MessageSquare,
  Target,
  ChevronRight,
  Check,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import {
  sampleStrategies,
  AIMarketingStrategy,
  TriggerRule,
  BaseActionParameters,
  generateTriggerRuleSummary
} from '@shared/aiMarketingStrategyData';
import TriggerRuleConfig from '@/components/TriggerRuleConfig';
import { useToast } from '@/hooks/use-toast';

// 步骤枚举
type CreateStep = 1 | 2 | 3 | 4;

export default function AIMarketingStrategyCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  // 当前步骤
  const [currentStep, setCurrentStep] = useState<CreateStep>(1);

  // 表单数据
  const [formData, setFormData] = useState<Partial<AIMarketingStrategy>>({
    strategyName: '',
    actionPurpose: '',
    triggerRule: {
      type: 'REAL_TIME',
      config: {
        eventName: 'user_signup',
        conditions: []
      }
    },
    baseActionParameters: {
      title: '',
      bodyText: '',
      buttonText: '',
      buttonUrl: ''
    }
  });

  // ���果是编辑模式，加载现有数据
  useEffect(() => {
    if (isEditing && id) {
      const strategy = sampleStrategies.find(s => s.strategyId === id);
      if (strategy) {
        setFormData(strategy);
      }
    }
  }, [isEditing, id]);

  // 步骤配置
  const steps = [
    {
      number: 1,
      title: '设定触发规则',
      subtitle: '定义AI监控的精确条件',
      icon: Settings,
      description: '设置触发策略的条件，告诉AI什么时候开始工作'
    },
    {
      number: 2,
      title: '设定业务用途',
      subtitle: '向AI下达核心任务指令',
      icon: Target,
      description: '用自然语言描述策略的核心目标，指导AI做出正确决策'
    },
    {
      number: 3,
      title: '配置基础弹窗',
      subtitle: '设计安全降级方案',
      icon: MessageSquare,
      description: '提供基础弹窗内容，作为AI个性化生成的参考'
    },
    {
      number: 4,
      title: '保存策略',
      subtitle: '完成创建并选择发布方式',
      icon: Check,
      description: '检查所有配置并保存策略'
    }
  ];

  // 常用业务用途示例
  const commonPurposes = [
    '尽力挽留用户，促使其完成订单',
    '欢迎新用户，并根据其兴趣进行初���引导',
    '帮助用户找到相关产品，提升用户体验',
    '推荐个性化商品，提高转化率',
    '收集用户反馈，改善产品服务',
    '引导用户关注优惠活动',
    '促进用户注册会员',
    '鼓励用户分享和推荐'
  ];

  // 验证当前步骤是否完成
  const isStepValid = (step: CreateStep): boolean => {
    switch (step) {
      case 1:
        return Boolean(formData.triggerRule?.config.eventName);
      case 2:
        return Boolean(formData.actionPurpose?.trim());
      case 3:
        return Boolean(
          formData.baseActionParameters?.title?.trim() &&
          formData.baseActionParameters?.bodyText?.trim() &&
          formData.baseActionParameters?.buttonText?.trim()
        );
      case 4:
        return Boolean(formData.strategyName?.trim());
      default:
        return false;
    }
  };

  // 下一步
  const nextStep = () => {
    if (currentStep < 4 && isStepValid(currentStep)) {
      setCurrentStep((prev) => (prev + 1) as CreateStep);
    }
  };

  // 上一步
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as CreateStep);
    }
  };

  // 保存策略
  const handleSave = () => {
    if (!formData.strategyName?.trim()) {
      toast({
        title: "请填写策略名称",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: isEditing ? "保存成功" : "创建成功",
      description: `策略"${formData.strategyName}"已保存为草稿状态`
    });
    
    navigate('/ai-marketing-strategies');
  };

  // 保存并启用策略
  const handleSaveAndActivate = () => {
    if (!formData.strategyName?.trim()) {
      toast({
        title: "请填写策略名称",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: isEditing ? "保存并启用成功" : "创建并启用成功",
      description: `策略"${formData.strategyName}"已启用，开始监控用户行为`
    });
    
    navigate('/ai-marketing-strategies');
  };

  // 渲染步骤指示器
  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          const isValid = isStepValid(step.number);
          
          return (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  ${isCompleted 
                    ? 'bg-green-500 text-white' 
                    : isActive 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 max-w-24 leading-tight">
                    {step.subtitle}
                  </div>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`
                  flex-1 h-0.5 mx-4 mt-[-20px]
                  ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                `} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // 渲染步骤1：触发规则配置
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">设定触发规则</h2>
        <p className="text-gray-600 mt-2">
          定义AI需要监控的精确用户行为场景，作为策略启动的"守门员"
        </p>
      </div>

      <TriggerRuleConfig
        value={formData.triggerRule!}
        onChange={(rule) => setFormData(prev => ({ ...prev, triggerRule: rule }))}
      />
    </div>
  );

  // 渲染步骤2：业务用途配置
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">设定业务用途</h2>
        <p className="text-gray-600 mt-2">
          用自然语言清晰地描述这个策略的核心任务目标，AI将理解您的意图并自主决策
        </p>
      </div>

      <Card className="shadow-sm border-0 ring-1 ring-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">业务用途描述</CardTitle>
              <p className="text-sm text-gray-500 mt-1">向AI说明这个策略要达成的核心目标</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              业务用途 <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              rows={4}
              value={formData.actionPurpose || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, actionPurpose: e.target.value }))}
              placeholder="用自然语言描述此策略希望达成的业务目标，例如：尽力挽留用户，促使其完成订单"
            />
            <p className="text-xs text-gray-500 mt-1">
              AI将基于这个描述理解您的意图，在触发规则命中时自主选择最佳的个性化策略
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">快速选择常用场景：</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {commonPurposes.map((purpose, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, actionPurpose: purpose }))}
                  className="text-sm h-auto py-2 px-3 text-left justify-start whitespace-normal"
                >
                  {purpose}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // 渲染步骤3：基础弹窗配置
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">配置基础弹窗</h2>
        <p className="text-gray-600 mt-2">
          设计一个基础的弹窗内容，AI将以此为参考进行个性化优化和安全降级
        </p>
      </div>

      <Card className="shadow-sm border-0 ring-1 ring-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">基础弹窗内容</CardTitle>
              <p className="text-sm text-gray-500 mt-1">AI个性化生成的参考模板和安全降级方案</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                弹窗标题 <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.baseActionParameters?.title || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  baseActionParameters: { ...prev.baseActionParameters!, title: e.target.value }
                }))}
                placeholder="例如：请留步！"
                className="text-base font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                按钮文字 <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.baseActionParameters?.buttonText || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  baseActionParameters: { ...prev.baseActionParameters!, buttonText: e.target.value }
                }))}
                placeholder="例如：完成我的订单"
                className="text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">跳转链接</label>
              <Input
                value={formData.baseActionParameters?.buttonUrl || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  baseActionParameters: { ...prev.baseActionParameters!, buttonUrl: e.target.value }
                }))}
                placeholder="例如：/checkout"
                className="text-base font-mono text-sm"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              弹窗正文 <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              rows={4}
              value={formData.baseActionParameters?.bodyText || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                baseActionParameters: { ...prev.baseActionParameters!, bodyText: e.target.value }
              }))}
              placeholder="例如：您的专属10%优惠券已生效，完成订单即可使用！"
            />
            <p className="text-xs text-gray-500 mt-1">
              AI将基于用户画像和行为数据，对这个基础内容进行个性化改写和优化
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // 渲染步骤4：保存策略
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">保存策略</h2>
        <p className="text-gray-600 mt-2">
          为策略起个名字，检查配置并选择发布方式
        </p>
      </div>

      <Card className="shadow-sm border-0 ring-1 ring-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Check className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">策略信息</CardTitle>
              <p className="text-sm text-gray-500 mt-1">完善策略基本信息</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              策略名称 <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.strategyName || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, strategyName: e.target.value }))}
              placeholder="例如：高价值购物车挽留策略"
              className="text-base"
            />
            <p className="text-xs text-gray-500 mt-1">为这个AI营销策略起一个描述性的名称，便于管理</p>
          </div>

          {/* 配置预览 */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-900 mb-4">配置预览</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-blue-100 text-blue-800">触发规则</Badge>
                </div>
                <p className="text-sm text-gray-700">
                  {formData.triggerRule && (
                    generateTriggerRuleSummary(formData.triggerRule)
                  )}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-purple-100 text-purple-800">业务用途</Badge>
                </div>
                <p className="text-sm text-gray-700">
                  {formData.actionPurpose || '未设置'}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-green-100 text-green-800">基础弹窗</Badge>
                </div>
                <div className="text-sm text-gray-700">
                  <div><strong>标题：</strong>{formData.baseActionParameters?.title || '未设置'}</div>
                  <div><strong>正文：</strong>{formData.baseActionParameters?.bodyText || '未设置'}</div>
                  <div><strong>按钮：</strong>{formData.baseActionParameters?.buttonText || '未设置'}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/ai-marketing-strategies')}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? '编辑AI营销策略' : '创建AI营销策略'}
            </h1>
          </div>
          <p className="text-gray-600">
            {steps[currentStep - 1].description}
          </p>
        </div>

        {/* 步骤指示器 */}
        {renderStepIndicator()}

        {/* 步骤内容 */}
        <div className="mb-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        {/* 导航按钮 */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            上一步
          </Button>
          
          <div className="flex gap-3">
            {currentStep === 4 ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleSave}
                  disabled={!isStepValid(4)}
                >
                  保存草稿
                </Button>
                <Button
                  onClick={handleSaveAndActivate}
                  disabled={!isStepValid(4)}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                >
                  保存并启用
                  <Check className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!isStepValid(currentStep)}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                下一步
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
