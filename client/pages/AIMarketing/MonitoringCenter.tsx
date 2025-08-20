import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  XCircle,
  Loader2,
  Eye,
  Search,
  Filter,
  Calendar,
  Target,
  Zap,
  Settings,
  RefreshCw,
  RotateCcw
} from 'lucide-react';
import {
  LogEntry,
  mockLogEntries,
  mockCustomRules,
  MARKETING_SCENARIOS,
  getScenarioName,
  getDecisionSourceDisplay,
  getStatusDisplay,
  formatTimestamp
} from '@shared/monitoringLogData';
import { useToast } from '@/hooks/use-toast';
import AdvancedDateRangePicker from '@/components/AdvancedDateRangePicker';

export default function MonitoringCenter() {
  const { toast } = useToast();
  
  // 数据状态
  const [logEntries, setLogEntries] = useState<LogEntry[]>(mockLogEntries);
  const [animatedEntries, setAnimatedEntries] = useState<string[]>([]);
  
  // 筛选状态
  const [searchText, setSearchText] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<string>('all');
  const [selectedDecisionSource, setSelectedDecisionSource] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{start: Date | null; end: Date | null}>({start: null, end: null});
  
  // 对话框状态
  const [undoDialog, setUndoDialog] = useState<{
    isOpen: boolean;
    entry: LogEntry | null;
  }>({ isOpen: false, entry: null });
  const [snapshotDialog, setSnapshotDialog] = useState<{
    isOpen: boolean;
    entry: LogEntry | null;
  }>({ isOpen: false, entry: null });
  const [undoing, setUndoing] = useState(false);

  // 实时更新动画
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedEntries([logEntries[0]?.logId]);
    }, 100);
    return () => clearTimeout(timer);
  }, [logEntries]);

  // 筛选逻辑
  const filteredEntries = useMemo(() => {
    return logEntries.filter(entry => {
      // 搜索文本过滤
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const matchesSearch = 
          entry.userId.toLowerCase().includes(searchLower) ||
          entry.sourceName.toLowerCase().includes(searchLower) ||
          entry.actionTaken.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      // 场景过滤
      if (selectedScenario !== 'all' && entry.scenarioId !== selectedScenario) {
        return false;
      }
      
      // 决策来源过滤
      if (selectedDecisionSource !== 'all' && entry.decisionSource !== selectedDecisionSource) {
        return false;
      }
      
      // 状态过滤
      if (selectedStatus !== 'all' && entry.status !== selectedStatus) {
        return false;
      }
      
      // 时间范围过滤
      if (dateRange.start || dateRange.end) {
        const entryDate = entry.timestamp;
        if (dateRange.start && entryDate < dateRange.start) return false;
        if (dateRange.end && entryDate > dateRange.end) return false;
      }
      
      return true;
    });
  }, [logEntries, searchText, selectedScenario, selectedDecisionSource, selectedStatus, dateRange]);

  // 撤销操作
  const handleUndo = (entry: LogEntry) => {
    setUndoDialog({ isOpen: true, entry });
  };

  const confirmUndo = async () => {
    if (!undoDialog.entry) return;

    setUndoing(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));

      const entryId = undoDialog.entry.logId;
      setLogEntries(prev => 
        prev.map(entry => 
          entry.logId === entryId 
            ? { ...entry, status: 'UNDONE' as const }
            : entry
        )
      );
      
      toast({
        title: '撤销成功',
        description: `针对用户 ${undoDialog.entry.userId} 的操作已成功撤销`,
      });
    } catch (error) {
      toast({
        title: '撤销失败',
        description: '系统错误，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setUndoing(false);
      setUndoDialog({ isOpen: false, entry: null });
    }
  };

  // 查看决策快照
  const handleViewSnapshot = (entry: LogEntry) => {
    setSnapshotDialog({ isOpen: true, entry });
  };

  // 清空筛选
  const clearFilters = () => {
    setSearchText('');
    setSelectedScenario('all');
    setSelectedDecisionSource('all');
    setSelectedStatus('all');
    setDateRange({start: null, end: null});
  };

  // 渲染日志条目
  const renderLogEntry = (entry: LogEntry) => {
    const decisionDisplay = getDecisionSourceDisplay(entry.decisionSource);
    const statusDisplay = getStatusDisplay(entry.status);

    return (
      <div
        key={entry.logId}
        className={`
          p-4 border rounded-lg transition-all duration-500 ease-in-out
          ${entry.status === 'UNDONE' 
            ? 'bg-gray-50 border-gray-200 opacity-70' 
            : 'bg-white border-gray-200 hover:border-gray-300'
          }
          ${animatedEntries.includes(entry.logId) 
            ? 'animate-in slide-in-from-top-2 fade-in-0 duration-500' 
            : ''
          }
        `}
      >
        {/* 头部信息 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              {formatTimestamp(entry.timestamp)}
            </div>
            <Badge 
              variant="outline" 
              className="text-xs bg-gray-50"
            >
              {getScenarioName(entry.scenarioId)}
            </Badge>
            <Badge 
              variant="outline" 
              className={`text-xs border ${decisionDisplay.bgColor} ${decisionDisplay.color}`}
            >
              {decisionDisplay.text}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {/* 状态显示 */}
            <div className={`flex items-center gap-1 text-sm ${statusDisplay.color}`}>
              {entry.status === 'EXECUTED' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              {statusDisplay.text}
            </div>
          </div>
        </div>

        {/* 来源和用户信息 */}
        <div className="mb-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">用户:</span>
              <span className="font-medium text-gray-900">{entry.userId}</span>
            </div>
            <div className="flex items-center gap-1">
              <Settings className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">来源:</span>
              <span className="font-medium text-gray-900">{entry.sourceName}</span>
            </div>
          </div>
        </div>

        {/* 执行动作 */}
        <div className="mb-4">
          <div className="text-sm text-gray-700 leading-relaxed p-3 bg-gray-50 rounded-md">
            {entry.actionTaken}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewSnapshot(entry)}
            className="flex items-center gap-1 text-xs"
          >
            <Eye className="h-3 w-3" />
            查看决策快照
          </Button>
          
          {entry.status === 'EXECUTED' && entry.isReversible && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUndo(entry)}
              className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 hover:border-red-300"
            >
              <Undo2 className="h-3 w-3" />
              撤销
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* 筛选控制区 */}
      <Card className="p-6 bg-white shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          {/* 搜索框 */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="搜索用户ID或规则名称..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 营销场景筛选 */}
          <div className="lg:w-1/5">
            <Select value={selectedScenario} onValueChange={setSelectedScenario}>
              <SelectTrigger>
                <SelectValue placeholder="营销场景" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部场景</SelectItem>
                {MARKETING_SCENARIOS.map(scenario => (
                  <SelectItem key={scenario.id} value={scenario.id}>
                    {scenario.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 决策来源筛选 */}
          <div className="lg:w-1/5">
            <Select value={selectedDecisionSource} onValueChange={setSelectedDecisionSource}>
              <SelectTrigger>
                <SelectValue placeholder="决策来源" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部来源</SelectItem>
                <SelectItem value="DEFAULT_AI">默认AI策略</SelectItem>
                <SelectItem value="CUSTOM_RULE">自定义规则</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 状态筛选 */}
          <div className="lg:w-1/6">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="执行状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="EXECUTED">已执行</SelectItem>
                <SelectItem value="UNDONE">已撤销</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 时间范围选择器 */}
          <div className="lg:w-1/4">
            <AdvancedDateRangePicker
              value={dateRange}
              onChange={setDateRange}
            />
          </div>

          {/* 清空筛选按钮 */}
          <div className="flex items-end">
            <Button
              variant="outline"
              size="default"
              onClick={clearFilters}
              className="flex items-center gap-2 h-10"
            >
              <RotateCcw className="h-4 w-4" />
              重置
            </Button>
          </div>
        </div>
      </Card>

      {/* 实时日志流 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            实时营销活动日志
            <Badge variant="secondary" className="ml-2">
              {filteredEntries.length} 条记录
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无匹配的日志记录</p>
              <p className="text-sm text-gray-400 mt-2">尝试调整筛选条件或等待新的营销活动</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map(renderLogEntry)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 撤销确认对话框 */}
      <Dialog open={undoDialog.isOpen} onOpenChange={(open) => {
        if (!undoing) {
          setUndoDialog({ isOpen: open, entry: null });
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              确认撤销操作
            </DialogTitle>
            <DialogDescription className="text-left">
              您确定要撤销针对用户{' '}
              <span className="font-semibold text-gray-900">{undoDialog.entry?.userId}</span>{' '}
              的操作吗？
              <br />
              <br />
              <span className="text-sm text-gray-600">
                动作: {undoDialog.entry?.actionTaken}
              </span>
              <br />
              <br />
              <span className="text-red-600 font-medium">此操作将立即执行反向操作并无法恢复。</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setUndoDialog({ isOpen: false, entry: null })}
              disabled={undoing}
            >
              取消
            </Button>
            <Button
              onClick={confirmUndo}
              disabled={undoing}
              variant="destructive"
              className="flex items-center gap-2"
            >
              {undoing && <Loader2 className="h-4 w-4 animate-spin" />}
              {undoing ? '撤销中...' : '确认撤销'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 决策快照对话框 */}
      <Dialog open={snapshotDialog.isOpen} onOpenChange={(open) => {
        setSnapshotDialog({ isOpen: open, entry: null });
      }}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              决策快照
            </DialogTitle>
            <DialogDescription>
              查看该次营销决策的完整上下文和决策依据
            </DialogDescription>
          </DialogHeader>
          
          {snapshotDialog.entry && (
            <div className="space-y-6">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-gray-600">目标用户</Label>
                  <p className="text-sm font-semibold">{snapshotDialog.entry.userId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">执行时间</Label>
                  <p className="text-sm">{formatTimestamp(snapshotDialog.entry.timestamp)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">营销场景</Label>
                  <p className="text-sm">{getScenarioName(snapshotDialog.entry.scenarioId)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">决策来源</Label>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getDecisionSourceDisplay(snapshotDialog.entry.decisionSource).bgColor}`}
                  >
                    {snapshotDialog.entry.sourceName}
                  </Badge>
                </div>
              </div>

              {/* 用户画像快照 */}
              {snapshotDialog.entry.userSnapshot && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">用户画像快照</h4>
                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">用户分层</Label>
                        <p className="text-sm">{snapshotDialog.entry.userSnapshot.tier}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">用户细分</Label>
                        <p className="text-sm">{snapshotDialog.entry.userSnapshot.segment}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">生命周期价值</Label>
                        <p className="text-sm font-semibold">¥{snapshotDialog.entry.userSnapshot.ltv.toLocaleString()}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">用户标签</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {snapshotDialog.entry.userSnapshot.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 触发事件 */}
              {snapshotDialog.entry.triggerEvent && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">触发事件</h4>
                  <div className="p-4 border rounded-lg space-y-2">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">事件类型</Label>
                      <p className="text-sm">{snapshotDialog.entry.triggerEvent.eventType}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">页面URL</Label>
                      <p className="text-sm text-blue-600">{snapshotDialog.entry.triggerEvent.pageUrl}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">事件数据</Label>
                      <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(snapshotDialog.entry.triggerEvent.eventData, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* AI决策理由 */}
              {snapshotDialog.entry.aiReasoning && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">AI决策理由</h4>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Zap className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-900 leading-relaxed">
                        {snapshotDialog.entry.aiReasoning}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 执行动作 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">执行动作</h4>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-900">
                    {snapshotDialog.entry.actionTaken}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSnapshotDialog({ isOpen: false, entry: null })}
            >
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
