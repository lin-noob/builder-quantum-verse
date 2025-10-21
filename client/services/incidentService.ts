import { request } from '@/lib/request';
import { Incident } from '@shared/types';

/**
 * 获取单个事件详情
 * @param id 事件ID
 * @returns 事件详情
 */
export const getEventDetails = async (id: string): Promise<Incident> => {
  const response = await request.get(`/admin/api/v1/event/${id}`);
  const eventData = response.data.data; // Assuming the data is wrapped in a response object
  
  // Map the API response to the Incident type
  return {
    ...eventData,
    id: eventData.id || id,
    title: eventData.eventName || eventData.title,
    description: eventData.description,
    status: mapStatus(eventData.status?.toString()),
    priority: mapPriority(eventData.priority?.toString()),
    timestamp: new Date(eventData.eventTime || eventData.gmtCreate),
  } as Incident;
};

/**
 * 将后端状态值映射为前端状态枚举
 */
const mapStatus = (status: string): 'pending_human' | 'in_progress' | 'resolved' | 'automated' | 'open' => {
  if (!status) return 'pending_human';
  switch (status) {
    case '1':
      return 'pending_human';
    case '2':
      return 'in_progress';
    case '3':
      return 'resolved';
    case '4':
      return 'automated';
    case '0': // Assuming '0' might represent 'open'
      return 'open';
    default:
      return 'pending_human';
  }
};

/**
 * 将后端优先级值映射为前端优先级枚举
 */
const mapPriority = (priority: string): 'low' | 'medium' | 'high' => {
  if (!priority) return 'medium';
  switch (priority) {
    case '1':
      return 'low';
    case '2':
      return 'medium';
    case '3':
      return 'high';
    default:
      return 'medium';
  }
};