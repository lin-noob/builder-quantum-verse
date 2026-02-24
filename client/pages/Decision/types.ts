export type DecisionStatus = 'PENDING' | 'EXECUTED' | 'CANCELLED' | 'FAILED';
export type DecisionSource = 'RULE' | 'MANUAL' | 'EVENT' | 'SCHEDULED';
export type DecisionType = 'MARKETING' | 'PRICING' | 'INVENTORY' | 'RISK' | 'SERVICE';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ActionItem {
  id: string;
  name: string;
  target: {
    type: string;
    scope: string; // e.g., "All VIP Users", "Order #123"
  };
  expectedEffect: {
    metric: string;
    value: string; // e.g., "+15%"
  };
  riskLevel: RiskLevel;
}

export interface Decision {
  id: string;
  name: string;
  type: DecisionType;
  source: DecisionSource;
  status: DecisionStatus;
  createdAt: string;
  version: string;
  
  context: {
    events: string[];
    objects: string[];
    metrics: Array<{ name: string; value: string }>;
    timeRange: string;
    dataIntegrity: 'COMPLETE' | 'PARTIAL' | 'ABNORMAL';
  };

  recommendation: {
    conclusion: string;
    actions: ActionItem[];
  };

  reasoning: {
    evidence: Array<{ name: string; value: string; description?: string }>;
    causality?: string;
  };
}

export type ExecutionStatus = 'RUNNING' | 'COMPLETED' | 'PARTIAL_FAILED' | 'FAILED';
export type ExecutionMode = 'MANUAL' | 'AUTO_IMMEDIATE' | 'AUTO_DELAYED';

export interface ActionResult {
  actionId: string;
  name: string;
  target: string;
  status: 'SUCCESS' | 'FAILURE';
  message?: string;
  details?: any; // For expanded technical details
}

export interface MetricSnapshot {
  name: string;
  before: number;
  after: number;
  unit: string;
}

export interface AIEvaluation {
  isExpected: boolean;
  deviationReason?: string;
  recommendation: 'CONTINUE' | 'ADJUST' | 'ROLLBACK';
}

export interface ExecutionRecord {
  id: string;
  decisionId: string;
  status: ExecutionStatus;
  mode: ExecutionMode;
  startTime: string;
  endTime?: string;
  executor: string;
  
  actionResults: ActionResult[];
  
  metrics: {
    snapshots: MetricSnapshot[];
    observationPeriod: 'SHORT' | 'MEDIUM' | 'LONG';
  };
  
  aiEvaluation: AIEvaluation;
  
  nextActions: {
    aiRecommended: string;
  };
}
