export type DecisionStep = 'intent' | 'data' | 'reasoning' | 'action' | 'result';

export interface DecisionGoal {
  id: string;
  description: string;
  initialSuggestion: string;
  isConfirmed: boolean;
  isEnabled: boolean;
  suggestedNextStep?: string;
  source?: 'ai' | 'human';
  isSuggestionStale?: boolean;
  unmatchedReason?: string; // Reason why no objects were matched
  matchReason?: string; // Reason why specific objects were matched
}
  matchReason?: string; // Reason for successful matching (Goal level)
}

export interface DataRequirement {
  id: string;
  goalId: string;
  objectType: string;
  fields: string[];
  relations: string[];
}

export interface CandidateInstance {
  id: string;
  goalId?: string; // Associated Goal ID
  name: string;
  type: string;
  isSelected: boolean;
  data: Record<string, any>;
  missingFields?: string[]; // Track missing fields per instance
  matchReason?: string; // Reason for matching/ranking
  rank?: number; // Ranking order (1 = best match)
}

export interface DataIntegrityIssue {
  id: string;
  goalId?: string; // Associated Goal ID
  type: 'missing_field' | 'conflict' | 'warning';
  description: string;
  severity: 'high' | 'medium' | 'low';
  affectedField?: string;
  affectedInstanceId?: string;
}

export interface ReasoningFact {
  id: string;
  text: string;
  confidence: number; // Default 1.0
  source: string; // Instance + Field
}

export interface ReasoningInference {
  id: string;
  text: string;
  logic: string;
  confidence: number;
  dependentFacts: string[]; // Fact IDs
}

export interface ReasoningRisk {
  id: string;
  triggerCondition: string;
  impact: string;
  probability: string;
}

export interface GoalReasoning {
  goalId: string;
  facts: ReasoningFact[];
  inferences: ReasoningInference[];
  risks: ReasoningRisk[];
  uncertainties: string[]; // Assumptions/Missing fields
  status: 'PENDING' | 'ACCEPTED' | 'QUESTIONABLE' | 'RE_REASON_NEEDED';
  userNote?: string; // Required if QUESTIONABLE
}

export interface ActionItem {
  id: string;
  type: 'ai_executable' | 'human_confirm';
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'executing' | 'completed' | 'failed' | 'blocked';
  
  // Common fields
  timestamp?: string;
  result?: string;
  executor?: string; // 'AI Agent' or Approver Name

  // AI Action specific
  actionType?: 'write' | 'generate' | 'update';
  targetObject?: string;
  triggerBasis?: string; // Reasoning Conclusion ID
  dependencies?: string[]; // IDs of actions this action depends on
  
  // Human Action specific
  relatedGoalId?: string;
  impact?: string;
  role?: string;
  approvalNote?: string;
}

export interface ObjectChangeLog {
  id: string;
  objectType: string; // Order, Customer, Email
  objectId: string;
  before: Record<string, any>;
  after: Record<string, any>;
  triggerActionId: string;
  timestamp: string;
}

export interface DecisionResult {
  solved: boolean;
  hasLoss: boolean;
  needsReview: boolean;
  adoptedSolution: string;
  recordedAt: string;
  
  // Execution Summary
  totalAiActions: number;
  totalHumanActions: number;
  startTime: string;
  endTime: string;
  
  // Trace Data
  changeLogs: ObjectChangeLog[];
  
  // New fields for error handling and details
  errorStack?: string;
  suggestions?: string[];
  operator?: string;
}

export interface DecisionTraceState {
  currentStep: DecisionStep;
  overallStatus?: 'IN_PROGRESS' | 'WAITING_CONFIRMATION' | 'COMPLETED' | 'TERMINATED' | 'PAUSED';
  
  // Step 0: Trigger
  triggerEvent: {
    id: string;
    type: string;
    content: string; // Email body
    timestamp: string;
  };

  // Step 1: Intent
  intentAnalysis: {
    coreIntent: string;
    urgency: 'High' | 'Medium' | 'Low';
    goals: DecisionGoal[];
    status: 'pending' | 'completed';
    confidence?: number;
    stepStatus: 'AI_ANALYZED' | 'HUMAN_MODIFIED' | 'CONFIRMED' | 'TERMINATED';
    isModified: boolean;
  };

  // Step 2: Data
  dataPreparation: {
    requirements: DataRequirement[];
    candidates: CandidateInstance[];
    integrityIssues: DataIntegrityIssue[];
    status: 'pending' | 'completed';
    // New fields for risk management
    riskAccepted?: boolean;
    riskNote?: string;
    confirmedGoalIds?: string[]; // IDs of goals manually confirmed by user
    goalDescriptions?: Record<string, string>; // Manual descriptions per goal
  };

  // Step 3: Reasoning
  reasoning: {
    status: 'NOT_STARTED' | 'REASONING' | 'COMPLETED' | 'WARNING';
    snapshotId: string;
    executedAt?: string;
    executor?: string;
    results: GoalReasoning[];
  };

  // Step 4: Action
  execution: {
    actions: ActionItem[];
    status: 'pending' | 'generated_waiting_confirm' | 'executing' | 'completed';
    generationInfo?: {
      source: string;
      generatedAt: string;
      generator: string;
    };
  };

  // Step 5: Result
  result: DecisionResult | null;
}
