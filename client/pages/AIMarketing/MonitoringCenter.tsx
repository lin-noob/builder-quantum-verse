import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Clock, 
  Bot, 
  User, 
  Undo2, 
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import {
  DecisionRecord,
  mockDecisionRecords,
  getModeDisplay,
  getModeColor,
  getStatusDisplay
} from '@shared/aiMarketingMonitoringData';
import { useToast } from '@/hooks/use-toast';

export default function MonitoringCenter() {
  const { toast } = useToast();
  const [records, setRecords] = useState<DecisionRecord[]>(mockDecisionRecords);
  const [animatedRecords, setAnimatedRecords] = useState<string[]>([]);
  const [revokeDialog, setRevokeDialog] = useState<{
    isOpen: boolean;
    record: DecisionRecord | null;
  }>({ isOpen: false, record: null });
  const [revoking, setRevoking] = useState(false);

  // Simulate new records appearing with animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedRecords([records[0]?.id]);
    }, 100);

    return () => clearTimeout(timer);
  }, [records]);

  const handleRevoke = (record: DecisionRecord) => {
    setRevokeDialog({ isOpen: true, record });
  };

  const confirmRevoke = async () => {
    if (!revokeDialog.record) return;

    setRevoking(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const recordId = revokeDialog.record.id;
      const canActuallyRevoke = revokeDialog.record.canRevoke && !revokeDialog.record.revokeReason;

      if (canActuallyRevoke) {
        // Update record status to revoked
        setRecords(prev => 
          prev.map(r => 
            r.id === recordId 
              ? { ...r, status: 'revoked' as const, canRevoke: false }
              : r
          )
        );
        
        toast({
          title: '撤销成功',
          description: `针对用户 ${revokeDialog.record.userId} 的操作已成功撤销`
        });
      } else {
        // For irreversible operations, just record the feedback
        toast({
          title: '反馈已记录',
          description: '操作无法撤销，但您的反馈已记录，将用于优化AI未来决策。',
          variant: 'default'
        });
      }
    } catch (error) {
      toast({
        title: '撤销失败',
        description: '系统错误，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setRevoking(false);
      setRevokeDialog({ isOpen: false, record: null });
    }
  };

  const renderStatusAction = (record: DecisionRecord) => {
    const statusDisplay = getStatusDisplay(record.status);

    switch (record.status) {
      case 'generating':
        return (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
            <span className={statusDisplay.color}>{statusDisplay.text}</span>
          </div>
        );

      case 'executed':
        if (record.canRevoke && !record.revokeReason) {
          return (
            <div className="flex items-center gap-3">
              <span className={statusDisplay.color}>{statusDisplay.text}</span>
              <button
                onClick={() => handleRevoke(record)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
              >
                撤销
              </button>
            </div>
          );
        } else if (record.revokeReason) {
          return (
            <div className="flex items-center gap-2">
              <span className={statusDisplay.color}>{statusDisplay.text}</span>
              <div className="group relative">
                <button
                  disabled
                  className="text-gray-400 text-sm cursor-not-allowed"
                >
                  撤销
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                  <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                    {record.revokeReason}
                  </div>
                </div>
              </div>
            </div>
          );
        } else {
          return <span className={statusDisplay.color}>{statusDisplay.text}</span>;
        }

      case 'revoked':
        return (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-gray-400" />
            <span className={statusDisplay.color}>{statusDisplay.text}</span>
          </div>
        );

      default:
        return <span className={statusDisplay.color}>{statusDisplay.text}</span>;
    }
  };

  return (
    <div className="p-6 space-y-6">

      {/* AI Real-time Decision Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            AI实时决策流
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {records.map((record) => (
              <div
                key={record.id}
                className={`
                  p-4 border rounded-lg transition-all duration-500 ease-in-out
                  ${record.status === 'revoked' 
                    ? 'bg-gray-50 border-gray-200 opacity-60' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                  }
                  ${animatedRecords.includes(record.id) 
                    ? 'animate-in slide-in-from-top-2 fade-in-0 duration-500' 
                    : ''
                  }
                `}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    {/* Header with timestamp and mode */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        {record.timestamp}
                      </div>
                      <Badge className={getModeColor(record.mode)}>
                        {getModeDisplay(record.mode)}
                      </Badge>
                    </div>

                    {/* Content */}
                    <div className="text-sm text-gray-900 leading-relaxed">
                      {record.content}
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex-shrink-0">
                    {renderStatusAction(record)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revoke Confirmation Dialog */}
      <Dialog open={revokeDialog.isOpen} onOpenChange={(open) => {
        if (!revoking) {
          setRevokeDialog({ isOpen: open, record: null });
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              确认撤销
            </DialogTitle>
            <DialogDescription className="text-left">
              您确定要撤销针对用户{' '}
              <span className="font-semibold text-gray-900">{revokeDialog.record?.userId}</span>{' '}
              的操作吗？
              <br />
              <br />
              可逆操作将立即执行，不可逆操作仅作为负反馈记录。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setRevokeDialog({ isOpen: false, record: null })}
              disabled={revoking}
            >
              取消
            </Button>
            <Button
              onClick={confirmRevoke}
              disabled={revoking}
              className="flex items-center gap-2"
            >
              {revoking && <Loader2 className="h-4 w-4 animate-spin" />}
              {revoking ? '处理中...' : '确认撤销'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
