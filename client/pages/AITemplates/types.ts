
export type AnalysisTargetType = 'risk' | 'classification' | 'summary';

export interface OutputField {
  id: string;
  name: string; // e.g. risk_level
  description: string;
  type: string; // enum, boolean, string, number
  required: boolean;
  enumValues?: string[];
}

export interface AITemplate {
  id: string;
  name: string;
  description: string;
  targetObjectType: string; // e.g. Customer, Order, Conversation
  
  // Context Scope
  relatedObjects: string[]; // e.g. ['Order', 'Conversation']
  
  // Analysis Goal
  analysisGoal: string;
  analysisTargetType: AnalysisTargetType;
  
  // Output Structure
  outputStructure: OutputField[];
  
  // Metadata
  referenceCount: number;
  isActive: boolean;
  lastUsedAt?: string;
  updatedAt: string;
}

export const MOCK_TEMPLATES: AITemplate[] = [
  {
    id: '1',
    name: '客户邮件语义理解',
    description: '深入分析客户邮件的意图、情绪和关键诉求，辅助人工快速决策。',
    targetObjectType: 'Conversation',
    relatedObjects: ['Order', 'Customer'],
    analysisGoal: '判断当前邮件是否需要人工介入，并提取客户的核心诉求。',
    analysisTargetType: 'classification',
    outputStructure: [
      { id: '1', name: 'intent', description: '客户主要意图', type: 'enum', required: true, enumValues: ['complaint', 'inquiry', 'refund'] },
      { id: '2', name: 'sentiment', description: '客户情绪指数', type: 'number', required: true },
      { id: '3', name: 'urgency', description: '是否紧急', type: 'boolean', required: true }
    ],
    referenceCount: 12,
    isActive: true,
    lastUsedAt: '2023-10-27 10:30:00',
    updatedAt: '2023-10-25'
  },
  {
    id: '2',
    name: '客户行为异常分析',
    description: '监测客户在短时间内的异常操作行为，识别潜在的欺诈或流失风险。',
    targetObjectType: 'Customer',
    relatedObjects: ['Order', 'LoginHistory'],
    analysisGoal: '判断客户是否存在账号被盗或恶意刷单的风险。',
    analysisTargetType: 'risk',
    outputStructure: [
      { id: '1', name: 'risk_level', description: '风险等级', type: 'enum', required: true, enumValues: ['low', 'medium', 'high'] },
      { id: '2', name: 'reason', description: '风险判定理由', type: 'string', required: true }
    ],
    referenceCount: 5,
    isActive: true,
    lastUsedAt: '2023-10-26 15:20:00',
    updatedAt: '2023-10-20'
  }
];
