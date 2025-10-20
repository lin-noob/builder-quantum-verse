import { request } from '@/lib/request';
import { ApproverOption } from '@/pages/ApprovalConfig/components/ApproverSelector';

type EventTypeString = 'meeting' | 'task' | 'other';
type EventTypeNumber = 0 | 1 | 2;

type PriorityString = 'high' | 'medium' | 'low';
type PriorityNumber = 0 | 1 | 2;

const typeStringToNumber = (type: EventTypeString): EventTypeNumber => {
  const map: Record<EventTypeString, EventTypeNumber> = {
    'meeting': 0,
    'task': 1,
    'other': 2,
  };
  return map[type];
};

const typeNumberToString = (type: EventTypeNumber): EventTypeString => {
  const map: Record<EventTypeNumber, EventTypeString> = {
    0: 'meeting',
    1: 'task',
    2: 'other',
  };
  return map[type];
};

const priorityStringToNumber = (priority: PriorityString): PriorityNumber => {
  const map: Record<PriorityString, PriorityNumber> = {
    'high': 0,
    'medium': 1,
    'low': 2,
  };
  return map[priority];
};

const priorityNumberToString = (priority: PriorityNumber): PriorityString => {
  const map: Record<PriorityNumber, PriorityString> = {
    0: 'high',
    1: 'medium',
    2: 'low',
  };
  return map[priority];
};

export interface CalendarEventRequest {
  id?: string;
  title: string;
  description?: string;
  allDay?: boolean;
  color?: string;
  type?: number;
  priority?: number;
  reminderMinutes?: number;
  userId?: number | string;
  startDate: string;
  endDate: string;
}

export interface CalendarEventResponse {
  id: string;
  gmtCreate?: string;
  gmtModified?: string;
  event?: string;
  companyId?: string;
  startDate: string;
  endDate: string;
  dayStr?: string;
  userId?: string;
  userName?: string;
  title: string;
  description?: string;
  allDay?: boolean;
  color?: string;
  type?: number;
  priority?: number;
  reminderMinutes?: number;
}

export interface CalendarEventApiResponse {
  [date: string]: CalendarEventResponse[];
}

export interface TeamMemberData {
  id: string;
  name: string;
  avatarUrl?: string;
  role: string;
  capacity?: number;
  currentLoad?: number;
  workloadPercentage: number;
  status: 'healthy' | 'overloaded' | 'underutilized';
}

class TeamCalendarService {
  async createEvent(data: CalendarEventRequest): Promise<CalendarEventResponse> {
    const response = await request.post<{ code: string; data: CalendarEventResponse; msg: string }>(
      '/admin/api/v1/team',
      data
    );

    if (response.data.code === '200' || response.data.code === '201') {
      return response.data.data;
    }

    throw new Error(response.data.msg || '创建日历事件失败');
  }

  async updateEvent(id: string, data: CalendarEventRequest): Promise<CalendarEventResponse> {
    const requestData = {
      ...data,
      id,
    };

    const response = await request.post<{ code: string; data: CalendarEventResponse; msg: string }>(
      '/admin/api/v1/team',
      requestData
    );

    if (response.data.code === '200' || response.data.code === '201') {
      return response.data.data;
    }

    throw new Error(response.data.msg || '更新日历事件失败');
  }

  async getEventList(userId?: string, monthStr?: string): Promise<CalendarEventResponse[]> {
    try {
      // 构建查询参数
      const params = new URLSearchParams();
      if (userId) {
        params.append('userId', userId);
      }
      if (monthStr) {
        params.append('monthStr', monthStr);
      }

      const queryString = params.toString();
      const url = `/admin/api/v1/team/info${queryString ? '?' + queryString : ''}`;

      const response = await request.get<{ code: string; data: CalendarEventApiResponse; msg: string }>(
        url
      );

      if (response.data.code === '200' || response.data.code === '201') {
        const eventsByDate = response.data.data || {};
        const allEvents: CalendarEventResponse[] = [];

        Object.values(eventsByDate).forEach(dateEvents => {
          if (Array.isArray(dateEvents)) {
            allEvents.push(...dateEvents);
          }
        });

        return allEvents;
      }

      throw new Error(response.data.msg || '获取日程列表失败');
    } catch (error) {
      console.error('Failed to fetch event list:', error);
      return [];
    }
  }

  async fetchTeamMembers(params: { page: number; limit: number; keyword?: string }): Promise<{ users: ApproverOption[]; total: number }> {
    try {
      const response = await request.post<{ code: string; data: { records: any[]; total: number }; msg: string }>(
        '/admin/api/v1/users/list',
        params
      );

      if (response.data.code === '200' || response.data.code === '201') {
        const users = response.data.data.records.map((user: any) => ({
          userId: user.userId || user.id,
          userName: user.userName || user.name,
          roleName: user.roleName || user.role,
          deptName: user.deptName || user.department,
        }));

        return {
          users,
          total: response.data.data.total,
        };
      }

      throw new Error(response.data.msg || '获取团队成员失败');
    } catch (error) {
      console.error('Failed to fetch team members:', error);
      return { users: [], total: 0 };
    }
  }

  async getTeamMemberList(): Promise<TeamMemberData[]> {
    try {
      const response = await request.get<{ code: string; data: TeamMemberData[]; msg: string }>(
        '/admin/api/v1/team/member/list'
      );

      if (response.data.code === '200' || response.data.code === '201') {
        return response.data.data || [];
      }

      throw new Error(response.data.msg || '获取团队成员列表失败');
    } catch (error) {
      console.error('Failed to fetch team member list:', error);
      return [];
    }
  }
}

export const teamCalendarService = new TeamCalendarService();
