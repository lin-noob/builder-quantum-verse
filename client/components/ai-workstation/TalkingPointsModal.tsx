import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Phone, Brain, Clock, Users, CheckCircle, Copy, X } from 'lucide-react';
import { talkingPointsContent } from '@/data/aiWorkstationData';
import { Task } from '@shared/types';

interface TalkingPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

export default function TalkingPointsModal({ isOpen, onClose, task }: TalkingPointsModalProps) {
  const [checkedPoints, setCheckedPoints] = useState<number[]>([]);
  const [callStarted, setCallStarted] = useState(false);

  const handlePointCheck = (index: number) => {
    setCheckedPoints(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleStartCall = () => {
    setCallStarted(true);
    // 模拟开始通话
    alert('正在为您拨打电话到阳光集团...');
  };

  const handleCopyPoints = () => {
    const content = talkingPointsContent.join('\n');
    navigator.clipboard.writeText(content);
    alert('通话要点已复制到剪贴板');
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-lg font-semibold">
            <Brain className="w-5 h-5 mr-2 text-purple-500" />
            AI 通话要点建议
            <div className="ml-3 px-2 py-1 bg-purple-100 dark:bg-purple-900/50 rounded-full text-xs text-purple-700 dark:text-purple-300 font-medium">
              智能分析
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 任务和客户信息 */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
              通话信息
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-slate-500" />
                <span className="text-slate-600 dark:text-slate-400">客户：</span>
                <span className="font-medium text-slate-900 dark:text-slate-100 ml-1">
                  {task.context?.customerName}
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-slate-500" />
                <span className="text-slate-600 dark:text-slate-400">预计时长：</span>
                <span className="font-medium text-slate-900 dark:text-slate-100 ml-1">
                  15-20分钟
                </span>
              </div>
            </div>
            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                <div>
                  <span className="text-amber-800 dark:text-amber-300 font-medium text-sm">
                    案例背景：{task.context?.incidentTitle}
                  </span>
                  <p className="text-amber-700 dark:text-amber-400 text-sm mt-1">
                    该客户近期活跃度下降，存在流失风险。需要了解具体原因并提供解决方案。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI生成的通话要点 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100">
                智能通话要点
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyPoints}
                className="text-xs"
              >
                <Copy className="w-3 h-3 mr-1" />
                复制要点
              </Button>
            </div>
            
            <div className="space-y-3">
              {talkingPointsContent.map((point, index) => (
                <div 
                  key={index}
                  className={`
                    border rounded-lg p-4 transition-all duration-200
                    ${checkedPoints.includes(index) 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }
                  `}
                >
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={checkedPoints.includes(index)}
                      onCheckedChange={() => handlePointCheck(index)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className={`
                        text-sm leading-relaxed
                        ${checkedPoints.includes(index) 
                          ? 'text-green-800 dark:text-green-300' 
                          : 'text-slate-700 dark:text-slate-300'
                        }
                      `}>
                        {point}
                      </p>
                    </div>
                    {checkedPoints.includes(index) && (
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 通话进度追踪 */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 dark:text-purple-300 mb-2">
              通话进度追踪
            </h4>
            <div className="flex items-center justify-between">
              <span className="text-sm text-purple-800 dark:text-purple-300">
                已完成要点: {checkedPoints.length} / {talkingPointsContent.length}
              </span>
              <div className="w-32 bg-purple-200 dark:bg-purple-800 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(checkedPoints.length / talkingPointsContent.length) * 100}%` 
                  }}
                />
              </div>
            </div>
          </div>

          {/* 额外建议 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
              💡 AI额外建议
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• 保持耐心和同理心，客户可能有情绪</li>
              <li>• 记录客户的每一个关键问题点</li>
              <li>• 准备具体的时间节点承诺</li>
              <li>• 通话结束后立即更新CRM系统</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex space-x-3">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            关闭
          </Button>
          {!callStarted && (
            <Button onClick={handleStartCall} className="bg-green-600 hover:bg-green-700">
              <Phone className="w-4 h-4 mr-2" />
              开始通话
            </Button>
          )}
          {callStarted && (
            <Button className="bg-red-600 hover:bg-red-700">
              <Phone className="w-4 h-4 mr-2" />
              结束通话
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
