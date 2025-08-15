import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  sampleStrategies,
  AIMarketingStrategy,
  TriggerRule,
  BaseActionParameters
} from '@shared/aiMarketingStrategyData';
import TriggerRuleConfigNew, { type NewTriggerRule } from '@/components/TriggerRuleConfigNew';
import { useToast } from '@/hooks/use-toast';

export default function AIMarketingStrategyCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  // 当前步骤状态
  const [currentStep, setCurrentStep] = useState(1);
  
  // 表单数据
  const [formData, setFormData] = useState<Partial<AIMarketingStrategy>>({
    strategyName: '',
    executionMode: 'SEMI_AUTO',
    actionPurpose: '',
    triggerRule: {
      type: 'REAL_TIME',
      config: {
        eventName: 'user_signup',
        conditions: []
      }
    },
    actionParameters: {
      title: '',
      bodyText: '',
      buttonText: '',
      buttonUrl: ''
    }
  });

  // 如果是编辑模式，加载现有数据
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
      id: 1, 
      title: '模式选择', 
      description: '选择执行模式和基本信息',
      isRequired: true
    },
    { 
      id: 2, 
      title: '触发规则', 
      description: '配置触发条件',
      isRequired: true
    },
    { 
      id: 3, 
      title: '业务用途', 
      description: '设定AI任务指令',
      isRequired: formData.executionMode === 'SEMI_AUTO'
    },
    { 
      id: 4, 
      title: '弹窗配置', 
      description: '设计弹窗内容',
      isRequired: true
    }
  ];
  
  // 获取实际需要的步骤（过滤掉不需要的步骤）
  const activeSteps = steps.filter(step => step.isRequired);
  const totalSteps = activeSteps.length;

  // 常用业务用途示例
  const commonPurposeOptions = [
    {
      title: '尽力挽留用户，促使其完成订单',
      content: '当识别到用户在购物车页面停留时间超过3分钟且未完成支付，或者用户尝试离开结账页面时，系统将自动展示个性化挽留弹窗。结合用户的浏览历史和购买偏好，智能推荐相似产品或提供限时优惠券（如"专属8折优惠，仅限10分钟"），同时展示该商品的稀缺性提示（如"仅剩3件"）和社会证明（如"已有1280人购买此商品"）。针��高价值用户，可额外提供免费配送或延长退换货期限等增值服务，通过多重激励机制最大化转化可能性，降低购物车放弃率。'
    },
    {
      title: '欢迎新用户，并根据其兴趣进行初步引导',
      content: '当系统检测到新用户首次访问网站或应用时，基于用户的注册信息、访问来源渠道、浏览设备类型等数据，智能展示个性化欢迎引导流程。通过分析用户点击的商品类别、停留时间、搜索关键词等行为数据，动态调整引导内容和产品推荐。为新用户提供专属新人礼包（如首单优惠券、会员积分奖励）、个性化商品推荐清单、平台核心功能介绍等，帮助用户快速了解平台价值并找到感兴趣的内容。同时收集用户偏好标签，为后续个性化营销奠定基础。'
    },
    {
      title: '帮助用户找到相关产品，提升用户体验',
      content: '当用户在网站上搜索无结果、浏览时间较长但未发生点击行为、或在某个类目页面反复浏览时，系统将主动提供智能搜索建议和产品推荐服务。基于用户的搜索历史、浏览轨迹、同类用户购买行为等数据，提供精准的替��产品推荐、相关类目引导、热门搜索词提示等。通过智能客服��器人主动询问用户需求，提供个性化购物助手服务，包括产品对比、尺寸建议、搭配推荐等，显著提升用户的购物体验和找到心仪商品的效率。'
    },
    {
      title: '推荐个性化商品，提高转化率',
      content: '基于用户的历史购买记录、浏览行为、收藏清单、搜索历史、个人档案信息等多维度数据，运用协同过滤和深度学习算法，在用户浏览商品详情页、购物车页面、或完成订单后，智能推荐高相关性的个性化商品。推荐策略包括：购买了A商品的用户还喜欢B商品、基于季节和节日的时令推荐、根据用户生活方式的场景化推荐、价格敏感度匹配的商品推荐等。通过A/B测试不断优化推荐算法和展示样式，提升点击率和转化率，增加用户客单价和复购频次。'
    }
  ];

  // 保存策略
  const handleSave = () => {
    if (!formData.strategyName?.trim()) {
      toast({
        title: "请填写策略名称",
        variant: "destructive"
      });
      return;
    }

    // 半自动模式需要检查业务用途
    if (formData.executionMode === 'SEMI_AUTO' && !formData.actionPurpose?.trim()) {
      toast({
        title: "请填写业务用途",
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

    // 半自动模式需要检查业务用途
    if (formData.executionMode === 'SEMI_AUTO' && !formData.actionPurpose?.trim()) {
      toast({
        title: "请填写业务用途",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: isEditing ? "保存并启用成功" : "创建并启用成功",
      description: formData.executionMode === 'SEMI_AUTO' 
        ? `策略"${formData.strategyName}"已启用，AI开始监控用户行为`
        : `策略"${formData.strategyName}"已启用，系统开始监控用户行为`
    });

    navigate('/ai-marketing-strategies');
  };
  
  // 下一步
  const handleNext = () => {
    // 验证当前步骤
    if (!validateCurrentStep()) {
      return;
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  // 上一步
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // 验证当前步骤
  const validateCurrentStep = () => {
    const currentActiveStep = activeSteps[currentStep - 1];
    
    switch (currentActiveStep.id) {
      case 1:
        if (!formData.strategyName?.trim()) {
          toast({
            title: "请填写策略名称",
            variant: "destructive"
          });
          return false;
        }
        return true;
        
      case 2:
        // 触发规则验证（这里可以添加更复杂的验证）
        return true;
        
      case 3:
        if (formData.executionMode === 'SEMI_AUTO' && !formData.actionPurpose?.trim()) {
          toast({
            title: "请填写业务用途",
            variant: "destructive"
          });
          return false;
        }
        return true;
        
      case 4:
        if (!formData.actionParameters?.title?.trim()) {
          toast({
            title: "请填写弹窗标题",
            variant: "destructive"
          });
          return false;
        }
        if (!formData.actionParameters?.bodyText?.trim()) {
          toast({
            title: "请填写弹窗正文",
            variant: "destructive"
          });
          return false;
        }
        if (!formData.actionParameters?.buttonText?.trim()) {
          toast({
            title: "请填写按钮文字",
            variant: "destructive"
          });
          return false;
        }
        return true;
        
      default:
        return true;
    }
  };
  
  // 获取步骤状���
  const getStepStatus = (stepIndex: number) => {
    if (stepIndex + 1 < currentStep) {
      return 'completed';
    } else if (stepIndex + 1 === currentStep) {
      return 'current';
    } else {
      return 'upcoming';
    }
  };
  
  // 渲染步骤指示器
  const renderStepIndicator = () => {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {activeSteps.map((step, index) => {
              const status = getStepStatus(index);
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors
                        ${status === 'completed' ? 'bg-primary border-primary text-primary-foreground' : 
                          status === 'current' ? 'bg-background border-primary text-primary' : 
                          'bg-background border-muted text-muted-foreground'}
                      `}
                    >
                      {status === 'completed' ? '✓' : step.id}
                    </div>
                    <div className="mt-3 text-center max-w-24">
                      <div className={`text-sm font-medium ${
                        status === 'current' ? 'text-foreground' : 
                        status === 'completed' ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  {index < activeSteps.length - 1 && (
                    <div className={`flex-1 h-px mx-6 transition-colors ${
                      status === 'completed' ? 'bg-primary' : 'bg-border'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  // 渲染当前步骤内容
  const renderStepContent = () => {
    const currentActiveStep = activeSteps[currentStep - 1];
    
    switch (currentActiveStep.id) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
  };
  
  // 第一步：模式选择和基本信息
  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">策略配置</CardTitle>
        <p className="text-sm text-muted-foreground">设置基本信息并选择执行模式</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 基本信息 */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">基本信息</h4>
          <div className="max-w-xl">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                策略名称 <span className="text-destructive">*</span>
              </label>
              <Input
                value={formData.strategyName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, strategyName: e.target.value }))}
                placeholder="例如：高价值购物车挽留策略"
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {formData.executionMode === 'SEMI_AUTO'
                  ? '为这个营销策略起一个描述性的名称，便于管理'
                  : '为这个营销策略起一个描述性的名称，便于管理'
                }
              </p>
            </div>
          </div>
        </div>

        {/* 执行模式选择 */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">执行模式</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                formData.executionMode === 'SEMI_AUTO'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground'
              }`}
              onClick={() => setFormData(prev => ({ ...prev, executionMode: 'SEMI_AUTO' }))}
            >
              <div className="flex items-center mb-3">
                <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                  formData.executionMode === 'SEMI_AUTO'
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground'
                }`}>
                  {formData.executionMode === 'SEMI_AUTO' && (
                    <div className="w-2 h-2 bg-primary-foreground rounded-full m-0.5"></div>
                  )}
                </div>
                <h3 className="font-medium text-foreground">半自动模式</h3>
              </div>
              <p className="text-sm text-muted-foreground ml-7">
                商家设定触发规则和业务用途，AI根据用户画像自主决策生成个性化内容
              </p>
            </div>

            <div
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                formData.executionMode === 'FULL_MANUAL'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground'
              }`}
              onClick={() => setFormData(prev => ({ ...prev, executionMode: 'FULL_MANUAL' }))}
            >
              <div className="flex items-center mb-3">
                <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                  formData.executionMode === 'FULL_MANUAL'
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground'
                }`}>
                  {formData.executionMode === 'FULL_MANUAL' && (
                    <div className="w-2 h-2 bg-primary-foreground rounded-full m-0.5"></div>
                  )}
                </div>
                <h3 className="font-medium text-foreground">全人工模式</h3>
              </div>
              <p className="text-sm text-muted-foreground ml-7">
                商家设定触发规则和固定响应内容，系统严格按照预设指令执行
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  // 第二步：触发规则配置
  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">触发规则配置</CardTitle>
        <p className="text-sm text-muted-foreground">
          {formData.executionMode === 'SEMI_AUTO'
            ? '定义AI需要监控的精确用户行为场景，作为策略启动的"守门员"'
            : '定义系统需要监控的精确用户行为场景，作为固定内容执行的触发条件'
          }
        </p>
      </CardHeader>
      <CardContent>
        <TriggerRuleConfig
          value={formData.triggerRule!}
          onChange={(rule) => setFormData(prev => ({ ...prev, triggerRule: rule }))}
        />
      </CardContent>
    </Card>
  );
  
  // 第三步：业务用途设定
  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">业务用途设定</CardTitle>
        <p className="text-sm text-muted-foreground">向AI下达核心任务指令，指导AI做出正确的个性化决策</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            业务用途 <span className="text-destructive">*</span>
          </label>
          <p className="text-xs text-muted-foreground mb-3">
            用自然语言清晰地描述这个策略希望达成的业务目标。AI将理解您的意图，在触发规则命中时自主选择最佳的个性化策略。
          </p>
          <textarea
            className="w-full px-3 py-2 border border-border rounded-md resize-none focus:ring-2 focus:ring-ring focus:border-ring text-sm"
            rows={4}
            value={formData.actionPurpose || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, actionPurpose: e.target.value }))}
            placeholder="例如：尽力挽留用户，促使其完成订单"
          />
        </div>
        
        <div>
          <p className="text-sm font-medium text-foreground mb-3">快速选择常用场景：</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {commonPurposeOptions.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setFormData(prev => ({ ...prev, actionPurpose: option.content }))}
                className="text-sm h-auto py-2 px-3 text-left justify-start whitespace-normal"
              >
                {option.title}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  // 第四步：基础弹窗配置
  const renderStep4 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {formData.executionMode === 'SEMI_AUTO' ? '基础弹窗配置' : '弹窗内容配置'}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {formData.executionMode === 'SEMI_AUTO'
            ? '设计一个基础的弹窗内容，AI将以此为参考进行个性化优化和安全降级'
            : '设计固定的弹窗内容，系统将严格按照此内容展示给用户'
          }
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              弹窗标题 <span className="text-destructive">*</span>
            </label>
            <Input
              value={formData.actionParameters?.title || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                actionParameters: { ...prev.actionParameters!, title: e.target.value }
              }))}
              placeholder={
                formData.executionMode === 'SEMI_AUTO' 
                  ? "例如：请留步！"
                  : "例如：您有新消息！"
              }
              className="text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              按钮文字 <span className="text-destructive">*</span>
            </label>
            <Input
              value={formData.actionParameters?.buttonText || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                actionParameters: { ...prev.actionParameters!, buttonText: e.target.value }
              }))}
              placeholder={
                formData.executionMode === 'SEMI_AUTO' 
                  ? "例如���完成我的订单"
                  : "例如：查看详情"
              }
              className="text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">跳转链接</label>
            <Input
              value={formData.actionParameters?.buttonUrl || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                actionParameters: { ...prev.actionParameters!, buttonUrl: e.target.value }
              }))}
              placeholder="例如：/checkout"
              className="text-sm font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            弹窗正文 <span className="text-destructive">*</span>
          </label>
          <textarea
            className="w-full px-3 py-2 border border-border rounded-md resize-none focus:ring-2 focus:ring-ring focus:border-ring text-sm"
            rows={4}
            value={formData.actionParameters?.bodyText || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              actionParameters: { ...prev.actionParameters!, bodyText: e.target.value }
            }))}
            placeholder={
              formData.executionMode === 'SEMI_AUTO' 
                ? "例如：您的专属10%优惠券已生效，完成订单即可使用！"
                : "例如：我们为您准备了特别优惠，点击查看详情。"
            }
          />
          <p className="text-xs text-muted-foreground mt-2">
            {formData.executionMode === 'SEMI_AUTO'
              ? 'AI将基于用户画像和行为数据，对这个基础内容进行个性化改写和优化'
              : '系统将严格按照此内容展示给用户，不会进行任何修改'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
  
  return (
    <div className="p-6 space-y-6 bg-background min-h-full">
      
      {/* 步骤指示器 */}
      {renderStepIndicator()}
      
      {/* 当前步骤内容 */}
      <div className="mb-6">
        {renderStepContent()}
      </div>
      
      {/* 导航按钮 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between">
            <div>
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                >
                  上一步
                </Button>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => navigate('/ai-marketing-strategies')}
              >
                取消
              </Button>
              
              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                >
                  下一步
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={handleSave}
                  >
                    保存草稿
                  </Button>
                  <Button
                    onClick={handleSaveAndActivate}
                  >
                    {isEditing ? '保存并启用' : '创建并启用'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
