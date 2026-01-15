export type EntityType = "Master" | "Transaction" | "Result";

export interface EntityAttribute {
  id: string;
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isRequired: boolean;
  isSensitive: boolean; // 脱敏
  description?: string;
}

export interface DBMapping {
  tableName: string;
  dataSource: string;
}

export interface EntityRelationship {
  id: string;
  targetObject: string;
  relationship: "1:1" | "1:N" | "N:1" | "N:N";
  foreignKey?: string;
  description: string;
  gmtCreate?: string;
  gmtModified?: string;
}

// Lifecycle Types
export interface LifecycleTransition {
  id: string;
  targetStateId: number;
  triggerEvent: string; // Event Name or ID
  description?: string;
}

export interface LifecycleState {
  id: number;
  mainId: number;
  stateName: string;
  systemCode: string;
  stateType: number; // 0: Start, 1: Normal, 2: End
  description: string;
  gmtCreate: string;
  gmtModified: string;
  entryRules: string[]; // Rule IDs/Names
  allowedActions: string[]; // Capability IDs/Names
  transitions: LifecycleTransition[];
}

export interface Entity {
  id: string;
  name: string; // Display Name
  code: string; // System Code
  type: EntityType;
  description: string;

  // Attributes
  attributes: EntityAttribute[];

  // DB Mapping
  dbMapping?: DBMapping;

  // Tags
  isSettlement: boolean;
  isRiskControl: boolean;
  isCompliance: boolean;
  allowAI: boolean;

  relationships: EntityRelationship[];

  // System Inference (Read-only)
  usedByCapabilities: string[];
  constrainedByRules: string[];
  lifecycleRisk: boolean;

  // Lifecycle Definition
  lifecycle: LifecycleState[];
}
