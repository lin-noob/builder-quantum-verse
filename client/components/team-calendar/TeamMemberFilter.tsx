import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, CheckCircle, AlertTriangle, TrendingDown } from 'lucide-react';
import { TeamMember } from '@shared/types';
import { teamCalendarService, TeamMemberData } from '@/services/teamCalendarService';
import { useState, useEffect } from 'react';

interface TeamMemberFilterProps {
  selectedMembers: string[];
  onMemberToggle: (memberId: string) => void;
  highlightedMember?: string;
}

export default function TeamMemberFilter({
  selectedMembers,
  onMemberToggle,
  highlightedMember
}: TeamMemberFilterProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMemberData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeamMembers = async () => {
      setLoading(true);
      try {
        const members = await teamCalendarService.getTeamMemberList();
        setTeamMembers(members);
      } catch (error) {
        console.error('Failed to load team members:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTeamMembers();
  }, []);

  const handleSelectAll = () => {
    if (selectedMembers.length === teamMembers.length) {
      // 全部取消选择
      teamMembers.forEach(member => onMemberToggle(member.id));
    } else {
      // 选择全部
      teamMembers.forEach(member => {
        if (!selectedMembers.includes(member.id)) {
          onMemberToggle(member.id);
        }
      });
    }
  };

  const getStatusIcon = (status: TeamMemberData['status']) => {
    switch (status) {
      case 'overloaded':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'underutilized':
        return <TrendingDown className="w-4 h-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: TeamMemberData['status']) => {
    switch (status) {
      case 'overloaded':
        return <Badge variant="destructive" className="text-xs">过载</Badge>;
      case 'healthy':
        return <Badge variant="outline" className="text-xs text-green-700 border-green-500">健康</Badge>;
      case 'underutilized':
        return <Badge variant="outline" className="text-xs text-orange-700 border-orange-500">空闲</Badge>;
      default:
        return null;
    }
  };

  const getWorkloadColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-600 dark:text-red-400';
    if (percentage >= 90) return 'text-orange-600 dark:text-orange-400';
    if (percentage >= 70) return 'text-green-600 dark:text-green-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  return (
    <Card className="mb-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-base font-semibold text-slate-900 dark:text-slate-100">
            <Users className="w-5 h-5 mr-3 text-slate-600 dark:text-slate-400" />
            团队成员
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="text-xs border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            {selectedMembers.length === teamMembers.length ? '取消全选' : '全选'}
          </Button>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-500 mt-2">
          已选择 {selectedMembers.length} / {teamMembers.length} ��成员
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-slate-500 dark:text-slate-400">加载中...</div>
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-slate-500 dark:text-slate-400">暂无团队成员</div>
          </div>
        ) : (
          teamMembers.map(member => {
            const isSelected = selectedMembers.includes(member.id);
            const isHighlighted = highlightedMember === member.id;

            return (
              <div
                key={member.id}
                className={`
                  flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200
                  ${isHighlighted
                    ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/20 shadow-md'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }
                  ${!isSelected ? 'opacity-60' : ''}
                `}
              >
                {/* 复选框 */}
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onMemberToggle(member.id)}
                  className="flex-shrink-0"
                />

                {/* 用户头像 */}
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={member.avatarUrl} alt={member.name} />
                  <AvatarFallback className="text-xs bg-slate-200 dark:bg-slate-700">
                    {member.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                {/* 用户信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {member.name}
                    </span>
                    {getStatusIcon(member.status)}
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">
                    {member.role}
                  </div>

                  {/* 工作负载信息 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-medium ${getWorkloadColor(member.workloadPercentage)}`}>
                        {member.workloadPercentage}%
                      </span>
                      {getStatusBadge(member.status)}
                    </div>
                  </div>

                  {/* 工作负载进度条 */}
                  <div className="mt-2">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                      <div
                        className={`
                          h-1.5 rounded-full transition-all duration-300
                          ${member.workloadPercentage >= 100 ? 'bg-red-400' :
                            member.workloadPercentage >= 90 ? 'bg-amber-400' :
                            member.workloadPercentage >= 70 ? 'bg-emerald-400' : 'bg-indigo-400'}
                        `}
                        style={{ width: `${Math.min(member.workloadPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>

      {/* 底部统计 */}
      <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">过载</div>
            <div className="text-sm font-semibold text-red-600 dark:text-red-400">
              {teamMembers.filter(m => m.status === 'overloaded').length}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">健康</div>
            <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              {teamMembers.filter(m => m.status === 'healthy').length}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">空闲</div>
            <div className="text-sm font-semibold text-amber-600 dark:text-amber-400">
              {teamMembers.filter(m => m.status === 'underutilized').length}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
