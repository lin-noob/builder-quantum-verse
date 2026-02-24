import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bot, 
  Sparkles, 
  CheckCircle, 
  BarChart3, 
  Loader2, 
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface AICopilotProps {
  ticketId?: string;
  ticketContext?: string;
  currentDraft?: string;
  context?: any;
  onDraftGenerated?: (draft: string) => void;
  onCheckCompleted?: (suggestions: string[]) => void;
  onEvaluationCompleted?: (evaluation: any) => void;
  onMessageUpdate?: (message: string) => void;
}

export default function AICopilot({
  ticketId,
  ticketContext,
  currentDraft,
  context,
  onDraftGenerated,
  onCheckCompleted,
  onEvaluationCompleted,
  onMessageUpdate
}: AICopilotProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState('');
  const [checkSuggestions, setCheckSuggestions] = useState<string[]>([]);
  const [evaluation, setEvaluation] = useState<any>(null);

  // AI生成Ticket草稿
  const handleGenerateDraft = async () => {
    setIsGenerating(true);
    try {
      // 模拟AI生成过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockDraft = `尊敬的客户，

感谢您联系我们的技术支持团队。我已经仔细查看了您反馈的问题。

根据您的描述，这个问题可能是由以下原因造成的：
1. 浏览器缓存问题
2. 网络连接不稳定
3. 系统临时维护

为了帮助您解决这个问题，请您尝试以下步骤：
1. 清除浏览器缓存和Cookie
2. 尝试使用其他浏览器访问
3. 检查网络连接是否稳定

如果问题仍然存在，请提供以下信息：
- 使用的浏览器类型和版本
- 操作系统版本
- 具体的错误信息截图

我们将根据这些信息为您提供更精准的解决方案。

此致
技术支持团队`;

      setGeneratedDraft(mockDraft);
      onDraftGenerated?.(mockDraft);
      
      toast({
        title: "AI草稿生成成功",
        description: "已根据Ticket上下文生成回复草稿"
      });
    } catch (error) {
      toast({
        title: "生成失败",
        description: "AI草稿生成过程中出现错误",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // AI检查Ticket内容
  const handleCheckDraft = async () => {
    setIsChecking(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockSuggestions = [
        "建议在开头增加对客户问题的确认，显示我们理解了具体情况",
        "可以提供更具体的时间预期，比如'我们将在24小时内跟进'",
        "建议添加备用联系方式，以防客户需要紧急支持",
        "语气可以更加友好和个性化，避免过于正式的表达"
      ];
      
      setCheckSuggestions(mockSuggestions);
      onCheckCompleted?.(mockSuggestions);
      
      toast({
        title: "AI检查完成",
        description: `发现 ${mockSuggestions.length} 个改进建议`
      });
    } catch (error) {
      toast({
        title: "检查失败",
        description: "AI检查过程中出现错误",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  // AI评估Ticket会话
  const handleEvaluateConversation = async () => {
    setIsEvaluating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const mockEvaluation = {
        score: 88,
        summary: "整体处理专业高效，客户满意度较高，响应及时且解决方案有效。",
        details: {
          responseTime: { score: 92, comment: "响应时间优秀，在30分钟内给出了初步回复" },
          professionalism: { score: 85, comment: "回复专业度良好，技术术语使用恰当" },
          problemSolving: { score: 90, comment: "提供了多种解决方案，步骤清晰易懂" },
          customerSatisfaction: { score: 86, comment: "客户反馈积极，问题得到有效解决" }
        },
        recommendations: [
          "可以在首次回复中提供更详细的问题分析",
          "建议增加预防性建议，帮助客户避免类似问题",
          "可以主动询问客户是否需要其他帮助"
        ]
      };
      
      setEvaluation(mockEvaluation);
      onEvaluationCompleted?.(mockEvaluation);
      
      toast({
        title: "AI评估完成",
        description: `评估分数: ${mockEvaluation.score}/100`
      });
    } catch (error) {
      toast({
        title: "评估失败",
        description: "AI评估过程中出现错误",
        variant: "destructive"
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "已复制",
      description: "内容已复制到剪贴板"
    });
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* 头部 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Bot className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI副驾驶</h3>
            <p className="text-xs text-gray-500">智能邮件处理助手</p>
          </div>
        </div>
      </div>

      {/* 功能区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* AI生成草稿 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              AI生成草稿
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-gray-600">
              根据Ticket上下文内容，AI将生成专业的回复草稿供您参考
            </p>
            <Button 
              onClick={handleGenerateDraft}
              disabled={isGenerating}
              className="w-full"
              size="sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  生成草稿
                </>
              )}
            </Button>
            
            {generatedDraft && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-700">生成的草稿</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(generatedDraft)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-xs text-gray-600 max-h-32 overflow-y-auto">
                  {generatedDraft.split('\n').map((line, index) => (
                    <p key={index} className="mb-1">{line}</p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI检查 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              AI检查
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-gray-600">
              AI将检查您的回复草稿，确认是否有误或可改进的点
            </p>
            <Button 
              onClick={handleCheckDraft}
              disabled={isChecking || !currentDraft}
              variant="outline"
              className="w-full"
              size="sm"
            >
              {isChecking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  检查中...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  检查草稿
                </>
              )}
            </Button>
            
            {checkSuggestions.length > 0 && (
              <div className="mt-3 space-y-2">
                <span className="text-xs font-medium text-gray-700">改进建议</span>
                {checkSuggestions.map((suggestion, index) => (
                  <div key={index} className="p-2 bg-yellow-50 rounded text-xs text-gray-700 border-l-2 border-yellow-400">
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI评估 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-500" />
              AI评估
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-gray-600">
              对整个Ticket会话进行综合评估，提供改进建议
            </p>
            <Button 
              onClick={handleEvaluateConversation}
              disabled={isEvaluating}
              variant="outline"
              className="w-full"
              size="sm"
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  评估中...
                </>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  开始评估
                </>
              )}
            </Button>
            
            {evaluation && (
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">评估分数</span>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    {evaluation.score}/100
                  </Badge>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-gray-700 mb-2 font-medium">会话摘要</p>
                  <p className="text-xs text-gray-600">{evaluation.summary}</p>
                </div>
                
                {evaluation.recommendations && (
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-gray-700">改进建议</span>
                    {evaluation.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="p-2 bg-blue-50 rounded text-xs text-gray-700 border-l-2 border-blue-400">
                        {rec}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 底部反馈 */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">AI助手反馈</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm">
              <ThumbsUp className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm">
              <ThumbsDown className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}