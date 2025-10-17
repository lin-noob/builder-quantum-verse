import { useState } from 'react';
import { Incident } from '@shared/types';
import { mockIncidents } from '@/data/mockData';
import IncidentListItem from '@/components/incident/IncidentListItem';
import IncidentDetails from '@/components/incident/IncidentDetails';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';

type PriorityFilter = 'all' | 'high' | 'medium' | 'low';
type ProgressFilter = 'all' | 'pending_human' | 'in_progress' | 'automated' | 'resolved';
type TypeFilter = 'all' | 'type_customer' | 'type_order' | 'type_product';

const priorityFilterLabels: Record<PriorityFilter, string> = {
  all: '全部',
  high: '高',
  medium: '中',
  low: '低',
};

const progressFilterLabels: Record<ProgressFilter, string> = {
  all: '全部',
  pending_human: '待处理',
  in_progress: '处理中',
  automated: 'AI全自动处理中',
  resolved: '已完成',
};

const typeFilterLabels: Record<TypeFilter, string> = {
  all: '全部类型',
  type_customer: '客户相关',
  type_order: '订单相关',
  type_product: '商品相关',
};

// 保留底部状态栏使用的统计（与筛选UI无关）
const statusFilterCounts = {
  all: mockIncidents.length,
  urgent: mockIncidents.filter(i => i.priority === 'high').length,
  pending_human: mockIncidents.filter(i => i.status === 'pending_human').length,
  in_progress: mockIncidents.filter(i => i.status === 'in_progress').length,
  automated: mockIncidents.filter(i => i.status === 'automated').length,
  resolved: mockIncidents.filter(i => i.status === 'resolved').length,
};

// 类型筛选不再显示计数

export default function Index() {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(mockIncidents[0]);
  const [activePriorityFilter, setActivePriorityFilter] = useState<PriorityFilter>('all');
  const [activeProgressFilter, setActiveProgressFilter] = useState<ProgressFilter>('all');
  const [activeTypeFilter, setActiveTypeFilter] = useState<TypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIncidents = mockIncidents.filter((incident) => {
    // Apply priority filter
    if (activePriorityFilter !== 'all' && incident.priority !== activePriorityFilter) return false;

    // Apply progress filter
    if (activeProgressFilter === 'pending_human' && incident.status !== 'pending_human') return false;
    if (activeProgressFilter === 'in_progress' && incident.status !== 'in_progress') return false;
    if (activeProgressFilter === 'automated' && incident.status !== 'automated') return false;
    if (activeProgressFilter === 'resolved' && incident.status !== 'resolved') return false;

    // Apply type filter
    if (activeTypeFilter === 'type_customer' && !incident.involvedEntities.some(e => e.type === 'customer')) return false;
    if (activeTypeFilter === 'type_order' && !incident.involvedEntities.some(e => e.type === 'order')) return false;
    if (activeTypeFilter === 'type_product' && !incident.involvedEntities.some(e => e.type === 'product')) return false;
    
    // Apply search
    if (searchQuery && !incident.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  return (
      <div className="flex h-full">
        {/* Event Stream (Left Column) */}
        <div className="w-96 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              实时事件流
            </h2>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="搜索事件..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters: Dropdown Row */}
            <div className="mb-2 grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-slate-500 mb-1">状态筛选</div>
                <Select value={activePriorityFilter} onValueChange={(v: PriorityFilter) => setActivePriorityFilter(v)}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{priorityFilterLabels.all}</SelectItem>
                    <SelectItem value="high">{priorityFilterLabels.high}</SelectItem>
                    <SelectItem value="medium">{priorityFilterLabels.medium}</SelectItem>
                    <SelectItem value="low">{priorityFilterLabels.low}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">处理进度筛选</div>
                <Select value={activeProgressFilter} onValueChange={(v: ProgressFilter) => setActiveProgressFilter(v)}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{progressFilterLabels.all}</SelectItem>
                    <SelectItem value="pending_human">{progressFilterLabels.pending_human}</SelectItem>
                    <SelectItem value="in_progress">{progressFilterLabels.in_progress}</SelectItem>
                    <SelectItem value="resolved">{progressFilterLabels.resolved}</SelectItem>
                    <SelectItem value="automated">{progressFilterLabels.automated}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filters: Type Row - Horizontal scroll chips */}
            <div>
              <div className="text-xs text-slate-500 mb-1">类型筛选</div>
              <div className="overflow-x-auto whitespace-nowrap">
                <div className="flex gap-2">
                  {(['all','type_customer','type_order','type_product'] as TypeFilter[]).map((filter) => (
                    <Button
                      key={filter}
                      variant={activeTypeFilter === filter ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveTypeFilter(filter)}
                      className={`text-xs ${
                        activeTypeFilter === filter 
                          ? 'bg-eip-accent hover:bg-eip-accent/90' 
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {typeFilterLabels[filter]}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Incident List */}
          <div className="flex-1 overflow-y-auto">
            {filteredIncidents.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-slate-500 dark:text-slate-400">
                <div className="text-center">
                  <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">没有找到匹配的事件</p>
                </div>
              </div>
            ) : (
              filteredIncidents.map((incident) => (
                <IncidentListItem
                  key={incident.id}
                  incident={incident}
                  isSelected={selectedIncident?.id === incident.id}
                  onClick={() => setSelectedIncident(incident)}
                />
              ))
            )}
          </div>

          {/* Status Bar */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
              <span>显示 {filteredIncidents.length} 个事件</span>
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-eip-alert rounded-full mr-1"></div>
                  高优先级: {statusFilterCounts.urgent}
                </span>
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-eip-warning rounded-full mr-1"></div>
                  待处理: {statusFilterCounts.pending_human}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Incident Details & Response Workstation (Right Column) */}
        <div className="flex-1">
          <IncidentDetails incident={selectedIncident} />
        </div>
      </div>
  );
}
