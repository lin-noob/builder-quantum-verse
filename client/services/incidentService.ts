import { Incident } from '@shared/types';
import { mockIncidents } from '@/data/mockData';

/**
 * 获取单个事件详情
 * @param id 事件ID
 * @returns 事件详情
 */
export const getEventDetails = async (id: string): Promise<Incident> => {
  // 使用模拟数据查找事件
  const incident = mockIncidents.find(inc => inc.id === id);
  
  if (!incident) {
    throw new Error(`Event with ID ${id} not found`);
  }
  
  // 模拟异步操作
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return incident;
};