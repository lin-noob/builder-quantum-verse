export enum PropSource {
  DB_COLUMN = "DB_COLUMN",
  COMPUTED = "COMPUTED",
  EXTERNAL_SYNC = "EXTERNAL_SYNC",
}

export type KnowledgeNodeType = "Master" | "Transaction" | "Result";

export type RelationDirection = "IN" | "OUT";

export type RiskLevel = "Low" | "Mid" | "High";

export type LifecycleStatus = "active" | "deprecated";

export interface KnowledgeProperty {
  id: string;
  name: string;
  type: string; // e.g., 'string', 'number', 'boolean', 'date'
  source: PropSource;
  sourceLabel: string; // e.g., 'Database', 'Calculated', 'ERP Sync'
  description?: string;
  relatedDbColumn?: string;
}

export interface KnowledgeRelation {
  semanticName: string; // e.g., 'PLACED_BY'
  targetNodeType: string; // ID or Name of the target node type
  direction: RelationDirection;
  sourceAction?: string; // Action that creates this relation
  isMutable: boolean;
}

export interface KnowledgeAction {
  name: string; // Unique identifier/name for the action
  label: string; // Display name
  apiEndpoint: string;
  httpMethod: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  conditions?: string[]; // Pre-conditions
  riskLevel: RiskLevel;
  affectedProperties?: string[]; // IDs of properties
  affectedRelations?: string[]; // Semantic names of relations
}

export interface KnowledgeRule {
  id: string;
  name: string;
  description: string;
  expression: string;
}

export interface KnowledgeNodeStats {
  inDegree: number;
  outDegree: number;
  referenceCount: number;
  usageFrequency: number; // e.g., 0-100 score
}

export interface KnowledgeNode {
  id: string;
  numericId?: number;
  name: string;
  type: KnowledgeNodeType;
  lifecycleStatus?: LifecycleStatus;
  icon: string; // Lucide icon name
  description?: string;

  stats: KnowledgeNodeStats;

  properties: KnowledgeProperty[];
  relations: KnowledgeRelation[];
  actions: KnowledgeAction[];
  rules: KnowledgeRule[];

  attributeCount?: number;
  relationCount?: number;
  actionCount?: number;
  ruleCount?: number;
  instanceCount?: number;
}

export interface KnowledgeInstanceSummary {
  typeId: string;
  modelId: number;
  typeName: string;
  type: KnowledgeNodeType; // Added for styling
  totalInstances: number;
  statusDistribution: Record<string, number>;
  recentActivityCount: number; // last 7 days
  relationCount: number;
}
