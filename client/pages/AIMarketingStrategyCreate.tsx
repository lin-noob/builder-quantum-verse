import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Settings,
  MessageSquare,
  Target
} from 'lucide-react';
import {
  sampleStrategies,
  AIMarketingStrategy,
  TriggerRule,
  BaseActionParameters
} from '@shared/aiMarketingStrategyData';
import TriggerRuleConfig from '@/components/TriggerRuleConfig';
import { useToast } from '@/hooks/use-toast';

export default function AIMarketingStrategyCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = Boolean(id);

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

  // 常用业务用途示例
  const commonPurposes = [
    '尽力挽留用户，促使其完成订单',
    '欢迎新用户，并根据其兴趣进行初步引导',
    '帮助用户找到相关产品，提升用户体验',
    '推荐个性化商品，提高转化率',
    '收集用户反馈，改善产品服务',
    '引导用户关注优惠活动',
    '促进用户注册会员',
    '鼓励用户分享和推荐'
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

    // 全人工模式需要检查业务用途
    if (formData.executionMode === 'FULL_MANUAL' && !formData.actionPurpose?.trim()) {
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

    // 全人工模式需要检查业务用途
    if (formData.executionMode === 'FULL_MANUAL' && !formData.actionPurpose?.trim()) {
      toast({
        title: "请填写业务用途",
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

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-none mx-auto px-6 lg:px-12 py-8">
        <div className="space-y-6">

          {/* 流���步骤卡片 */}
          {/* 执行模式选择 */}
          <Card className="shadow-sm border-0 ring-1 ring-gray-200">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Settings className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">执行模式选择</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">选择策略的执��方式：AI智能决策或固定内容执行</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.executionMode === 'SEMI_AUTO'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, executionMode: 'SEMI_AUTO' }))}
                >
                  <div className="flex items-center mb-2">
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      formData.executionMode === 'SEMI_AUTO'
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {formData.executionMode === 'SEMI_AUTO' && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900">半自动模式</h3>
                  </div>
                  <p className="text-sm text-gray-600 ml-7">
                    商家设定触发规则，AI根据用户画像自主决策生成个性化内容
                  </p>
                </div>

                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.executionMode === 'FULL_MANUAL'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, executionMode: 'FULL_MANUAL' }))}
                >
                  <div className="flex items-center mb-2">
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      formData.executionMode === 'FULL_MANUAL'
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-300'
                    }`}>
                      {formData.executionMode === 'FULL_MANUAL' && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900">全人工模式</h3>
                  </div>
                  <p className="text-sm text-gray-600 ml-7">
                    商家设定触发规则和固定响应内容，系统严格按照预设指令执行
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 基本信息 */}
          <Card className="shadow-sm border-0 ring-1 ring-gray-200">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Settings className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">基本信息</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">设置策略的基本属性和标识信息</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-w-2xl">
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
              </div>
            </CardContent>
          </Card>

          {/* 触发规则配置 */}
          <Card className="shadow-sm border-0 ring-1 ring-gray-200">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">触发规则配置</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">定义AI需要监控的精确用户行为场景，作为策略启动的"守门员"</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <TriggerRuleConfig
                value={formData.triggerRule!}
                onChange={(rule) => setFormData(prev => ({ ...prev, triggerRule: rule }))}
              />
            </CardContent>
          </Card>

          {/* 业务用途配置 */}
          <Card className="shadow-sm border-0 ring-1 ring-gray-200">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Target className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">业务用途设定</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">向AI下达核心任务指令，指导AI做出正确的个性化决策</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  业务用途 <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  用自然语言清晰地描述这个策略希望达成的业务目标。AI将理解您的意图，在触发规则命中时自主选择最佳的个性化策略。
                </p>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  rows={4}
                  value={formData.actionPurpose || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, actionPurpose: e.target.value }))}
                  placeholder="例如：尽���挽留用户，促使其完成订单"
                />
                <div className="mt-4">
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
              </div>
            </CardContent>
          </Card>

          {/* 基础弹窗配置 */}
          <Card className="shadow-sm border-0 ring-1 ring-gray-200">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">
                    {formData.executionMode === 'SEMI_AUTO' ? '基础弹窗配置' : '弹窗内容配置'}
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.executionMode === 'SEMI_AUTO'
                      ? '设计一个基础的弹窗内容，AI将以此为参考进行个性化优化和安全降级'
                      : '设计固定的弹窗内容，系统将严格按照此内容展示给用户'
                    }
                  </p>
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
                    value={formData.actionParameters?.title || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      actionParameters: { ...prev.actionParameters!, title: e.target.value }
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
                    value={formData.actionParameters?.buttonText || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      actionParameters: { ...prev.actionParameters!, buttonText: e.target.value }
                    }))}
                    placeholder="例如：完成我的订单"
                    className="text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">跳转链接</label>
                  <Input
                    value={formData.actionParameters?.buttonUrl || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      actionParameters: { ...prev.actionParameters!, buttonUrl: e.target.value }
                    }))}
                    placeholder="���如：/checkout"
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
                  value={formData.actionParameters?.bodyText || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    actionParameters: { ...prev.actionParameters!, bodyText: e.target.value }
                  }))}
                  placeholder="例如：您的专属10%优惠券已生效，完成订单即可使用！"
                />
                <p className="text-xs text-gray-500 mt-2">
                  AI将基于用户画像和行为数据，对这个基础内容进行个性化��写和优化
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <Card className="shadow-sm border-0 ring-1 ring-gray-200">
            <CardContent className="py-4">
              <div className="flex justify-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/ai-marketing-strategies')}
                  className="px-6"
                >
                  取消
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSave}
                  className="px-6"
                >
                  保存草稿
                </Button>
                <Button
                  onClick={handleSaveAndActivate}
                  className="bg-blue-600 hover:bg-blue-700 px-6"
                >
                  {isEditing ? '保存并启用' : '创建并启用'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
