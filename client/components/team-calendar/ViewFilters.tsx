import { useState } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColorBy } from '@shared/types';
import { getTeamMembers, colorConfigs } from '@/data/teamCalendarData';

interface ViewFiltersProps {
  selectedMembers: string[];
  onMemberToggle: (memberId: string) => void;
  showExternal: boolean;
  onExternalToggle: (show: boolean) => void;
  colorBy: ColorBy;
  onColorByChange: (colorBy: ColorBy) => void;
}

export default function ViewFilters({
  selectedMembers,
  onMemberToggle,
  showExternal,
  onExternalToggle,
  colorBy,
  onColorByChange
}: ViewFiltersProps) {
  const teamMembers = getTeamMembers();
  
  const colorByOptions = [
    { value: 'assignee' as ColorBy, label: '按负责人' },
    { value: 'incident_priority' as ColorBy, label: '按案例优先级' },
    { value: 'task_type' as ColorBy, label: '按任务类型' }
  ];
  
  const getMemberColor = (memberId: string) => {
    return colorConfigs.assignee[memberId] || '#9CA3AF';
  };
  
  return (
    <div className="space-y-6">
      {/* 添加日历 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
            添加日历
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <Plus className="w-4 h-4 text-slate-400" />
          </Button>
        </div>
      </div>
      
      {/* 我的日历 */}
      <div>
        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4">
          我的日历
        </h3>
        
        <div className="space-y-3">
          {/* 团队成员列表 */}
          {teamMembers.map((member) => {
            const isSelected = selectedMembers.includes(member.id);
            return (
              <div key={member.id} className="flex items-center space-x-3">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onMemberToggle(member.id)}
                  className="flex-shrink-0"
                />
                <div 
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: getMemberColor(member.id) }}
                />
                <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">
                  {member.name}的日历
                </span>
              </div>
            );
          })}
          
          {/* 外部会议 */}
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={showExternal}
              onCheckedChange={onExternalToggle}
              className="flex-shrink-0"
            />
            <div className="w-3 h-3 rounded-sm bg-slate-400 flex-shrink-0" />
            <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">
              外部会议
            </span>
          </div>
        </div>
      </div>
      
      {/* 着色依据 */}
      <div>
        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4">
          视图设置
        </h3>
        
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 mb-2 block">
              着色依据
            </label>
            <Select value={colorBy} onValueChange={onColorByChange}>
              <SelectTrigger className="w-full h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {colorByOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* 颜色图例 */}
          <div className="mt-3">
            <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
              当前着色方案
            </div>
            <div className="space-y-1">
              {colorBy === 'assignee' && teamMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getMemberColor(member.id) }}
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    {member.name}
                  </span>
                </div>
              ))}
              
              {colorBy === 'incident_priority' && (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">高优先级</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">中等优先级</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-slate-400" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">低优先级</span>
                  </div>
                </>
              )}
              
              {colorBy === 'task_type' && (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">电话</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">邮件</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">报告</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-slate-400" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">常规</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
