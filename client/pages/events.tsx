import { useState } from 'react';
import { Incident, IncidentFilter } from '@shared/types';
import { mockIncidents } from '@/data/mockData';
import IncidentListItem from '@/components/incident/IncidentListItem';
import IncidentDetails from '@/components/incident/IncidentDetails';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';

const filterLabels: Record<IncidentFilter, string> = {
  all: '全部',
  urgent: '紧急',
  pending_human: '待人工处理',
  ai_processed: 'AI已处理'
};

const filterCounts = {
  all: mockIncidents.length,
  urgent: mockIncidents.filter(i => i.priority === 'high').length,
  pending_human: mockIncidents.filter(i => i.status === 'pending_human').length,
  ai_processed: mockIncidents.filter(i => i.status === 'automated').length
};

export default function Index() {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(mockIncidents[0]);
  const [activeFilter, setActiveFilter] = useState<IncidentFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIncidents = mockIncidents.filter((incident) => {
    // Apply filter
    if (activeFilter === 'urgent' && incident.priority !== 'high') return false;
    if (activeFilter === 'pending_human' && incident.status !== 'pending_human') return false;
    if (activeFilter === 'ai_processed' && incident.status !== 'automated') return false;
    
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

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {(Object.keys(filterLabels) as IncidentFilter[]).map((filter) => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter)}
                  className={`text-xs ${
                    activeFilter === filter 
                      ? 'bg-eip-accent hover:bg-eip-accent/90' 
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {filterLabels[filter]}
                  <Badge 
                    variant="secondary" 
                    className="ml-2 text-xs bg-white/20 text-inherit"
                  >
                    {filter === 'all' ? filteredIncidents.length : filterCounts[filter]}
                  </Badge>
                </Button>
              ))}
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
                  高优先级: {filterCounts.urgent}
                </span>
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-eip-warning rounded-full mr-1"></div>
                  待处理: {filterCounts.pending_human}
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
