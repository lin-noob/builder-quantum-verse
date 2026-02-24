
export type EventSource = 'email' | 'webhook' | 'tracking';

export interface MappingRule {
  id: string;
  name: string;
  description?: string;
  eventSource: EventSource;
  eventType: string; // The business event type identified
  isActive: boolean;
  lastMatchedAt?: string;
  
  // Module B: Conditions
  conditions: RuleCondition[];
  conditionLogic: 'AND' | 'OR'; // Simplified for MVP

  // Module C: Anchors
  anchors: BusinessAnchor[];

  // Module D: Instances
  instances: InstanceDeclaration[];

  // Module E: Relations
  relations: RelationDeclaration[];

  // Module F: AI Trigger
  triggerAI: boolean;
  aiTemplate?: string; // Selected AI Analysis Template
}

export interface RuleCondition {
  id: string;
  field: string; // JSON path in Normalized Event
  operator: 'equals' | 'contains' | 'regex' | 'exists';
  value?: string;
}

export interface BusinessAnchor {
  id: string;
  objectType: string; // e.g., 'User', 'Order'
  fieldSource: string; // JSON path
  extractionRegex?: string; // Optional regex extraction
}

export interface InstanceDeclaration {
  id: string;
  objectType: string;
  anchorRefId: string; // References a BusinessAnchor.id
}

export interface RelationDeclaration {
  id: string;
  sourceInstanceId: string; // References InstanceDeclaration.id
  targetInstanceId: string; // References InstanceDeclaration.id
  relationType: string; // e.g., 'BELONGS_TO', 'CREATED'
}

// Mock Data
export const MOCK_RULES: MappingRule[] = [
  {
    id: '1',
    name: '高价值订单邮件识别',
    description: '从邮件通知中识别高价值订单',
    eventSource: 'email',
    eventType: 'ORDER_CREATED',
    isActive: true,
    lastMatchedAt: '2023-10-27 14:30:00',
    conditionLogic: 'AND',
    conditions: [
      { id: 'c1', field: 'subject', operator: 'contains', value: 'Order Confirmation' },
      { id: 'c2', field: 'body', operator: 'contains', value: 'Total: $' }
    ],
    anchors: [
      { id: 'a1', objectType: 'Order', fieldSource: 'body', extractionRegex: 'Order #(\\d+)' },
      { id: 'a2', objectType: 'Customer', fieldSource: 'from_address' }
    ],
    instances: [
      { id: 'i1', objectType: 'Order', anchorRefId: 'a1' },
      { id: 'i2', objectType: 'Customer', anchorRefId: 'a2' }
    ],
    relations: [
      { id: 'r1', sourceInstanceId: 'i1', targetInstanceId: 'i2', relationType: 'BELONGS_TO' }
    ],
    triggerAI: true,
    aiTemplate: 'customer_email_semantic'
  },
  {
    id: '2',
    name: '系统告警 Webhook',
    description: '来自监控系统的严重告警',
    eventSource: 'webhook',
    eventType: 'SYSTEM_ALERT',
    isActive: false,
    lastMatchedAt: '2023-10-26 09:15:00',
    conditionLogic: 'OR',
    conditions: [
      { id: 'c1', field: 'payload.severity', operator: 'equals', value: 'critical' }
    ],
    anchors: [],
    instances: [],
    relations: [],
    triggerAI: false
  }
];
