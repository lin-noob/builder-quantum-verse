import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Send, Edit3, X, Copy, RefreshCw } from 'lucide-react';
import { emailDraftContent } from '@/data/aiWorkstationData';
import { Task } from '@shared/types';

interface EmailDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

export default function EmailDraftModal({ isOpen, onClose, task }: EmailDraftModalProps) {
  const [emailContent, setEmailContent] = useState(emailDraftContent);
  const [subject, setSubject] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);

  // 根据任务信息初始化邮件内容
  useState(() => {
    if (task && isOpen) {
      setSubject(`关于${task.context?.incidentTitle} - 重要通知`);
      setRecipient(`${task.context?.customerName} <${task.context?.customerName?.toLowerCase()}@company.com>`);
    }
  });

  const handleSendEmail = () => {
    // 模拟发送邮件
    alert('邮件已发送！任务状态已更新为已完成。');
    onClose();
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(emailContent);
    alert('邮件内容已复制到剪贴板');
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    // 模拟AI重新生成内容的过程
    setTimeout(() => {
      setEmailContent(prev => prev + '\n\nP.S. 我们还为您准备了专属的定制化服务方案，详情请查看附件。');
      setIsRegenerating(false);
    }, 1500);
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-lg font-semibold">
            <Sparkles className="w-5 h-5 mr-2 text-blue-500" />
            AI 邮件草稿
            <div className="ml-3 px-2 py-1 bg-blue-100 dark:bg-blue-900/50 rounded-full text-xs text-blue-700 dark:text-blue-300 font-medium">
              智能生成
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 任务上下文信息 */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
              任务上下文
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600 dark:text-slate-400">案例：</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {task.context?.incidentTitle}
                </span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400">客户：</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {task.context?.customerName}
                </span>
              </div>
            </div>
          </div>

          {/* 邮件编辑区域 */}
          <div className="space-y-4">
            {/* 收件人 */}
            <div>
              <Label htmlFor="recipient">收件人</Label>
              <Input
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="输入收件人邮箱地址"
                className="mt-1"
              />
            </div>

            {/* 主题 */}
            <div>
              <Label htmlFor="subject">主题</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="输入邮件主题"
                className="mt-1"
              />
            </div>

            {/* 邮件内容 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="content">邮件内容</Label>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyContent}
                    className="text-xs"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    复制
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className="text-xs"
                  >
                    <RefreshCw className={`w-3 h-3 mr-1 ${isRegenerating ? 'animate-spin' : ''}`} />
                    {isRegenerating ? '重新生成中...' : '重新生成'}
                  </Button>
                </div>
              </div>
              <Textarea
                id="content"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                className="min-h-[300px] font-mono text-sm leading-relaxed"
                placeholder="AI将为您生成个性化的邮件内容..."
              />
            </div>
          </div>

          {/* AI建议区域 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2 flex items-center">
              <Sparkles className="w-4 h-4 mr-1" />
              AI 优化��议
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• 邮件语调专业而亲切，符合B2B客户沟通习惯</li>
              <li>• 包含了针对性的解决方案和补偿措施</li>
              <li>• 建议在发送前再次确认客户的具体问题点</li>
              <li>• 可考虑添加具体的联系方式和后续跟进时间</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex space-x-3">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            取消
          </Button>
          <Button variant="outline">
            <Edit3 className="w-4 h-4 mr-2" />
            继续修改
          </Button>
          <Button onClick={handleSendEmail} className="bg-blue-600 hover:bg-blue-700">
            <Send className="w-4 h-4 mr-2" />
            发送邮件
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
