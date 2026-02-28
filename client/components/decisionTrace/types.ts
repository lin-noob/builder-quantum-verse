export type DecisionStep = "intent" | "data" | "reasoning" | "action" | "result";

export interface DecisionGoal {
  id: string;
  description: string;
  initialSuggestion: string;
  isConfirmed: boolean;
  isEnabled: boolean;
  suggestedNextStep?: string;
  source?: "ai" | "human";
  isSuggestionStale?: boolean;
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
  missingFields?: string[]; // New: Track missing fields per instance
}

export interface DataIntegrityIssue {
  id: string;
  goalId?: string; // Associated Goal ID
  type: "missing_field" | "conflict" | "warning";
  description: string;
  severity: "high" | "medium" | "low";
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
  goal_id: string;
  summary?: string; // New: AI provided title
  goalDescription?: string; // New: AI provided description
  goal_description?: string;
  facts: ReasoningFact[];
  inferences: ReasoningInference[];
  risks: ReasoningRisk[];
  assumptions: string[]; // Assumptions/Missing fields
  status: "PENDING" | "ACCEPTED" | "QUESTIONABLE" | "RE_REASON_NEEDED" | "WARNING";
  userNote?: string; // Required if QUESTIONABLE
}

export interface ActionItem {
  id: string;
  type: "ai_executable" | "human_confirm";
  description: string;
  status: "pending" | "approved" | "rejected" | "executing" | "completed" | "failed" | "blocked";

  // Common fields
  timestamp?: string;
  result?: string;
  executor?: string; // 'AI Agent' or Approver Name

  // AI Action specific
  actionType?: "write" | "generate" | "update";
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

export interface SortingInstance {
  instance_id: string;
  rank: number;
  reason: string;
  instance_snapshot: {
    instance_id: string;
    instance_name: string;
    current_status: string;
    created_at: string;
    updated_at: string;
    runtime_properties: any[];
  };
}

export interface SortingObject {
  object_type: string;
  object_name: string;
  ranked_instances: SortingInstance[];
}

export interface SortingGoalResult {
  goal_id: string;
  goal_description: string;
  human_context_note?: string;
  ranked_objects: SortingObject[];
}

export interface FilteringTraceItem {
  instance_id: string;
  is_filtered: boolean;
  filter_reason: string;
}

export interface RankingTraceItem {
  instance_id: string;
  score: number;
  rank_reason: string;
}

export interface ObjectAnalysis {
  object_type: string;
  object_name: string;
  filtering_trace: FilteringTraceItem[];
  ranking_trace: RankingTraceItem[];
}

export interface GoalLevelAnalysis {
  goal_id: string;
  goal_level_analysis: string;
  per_object_analysis: ObjectAnalysis[];
}

export interface SortingEngine {
  results: SortingGoalResult[];
  reasoning_trace: {
    per_goal_analysis: GoalLevelAnalysis[];
  };
}

export interface DecisionTraceState {
  currentStep: DecisionStep;
  overallStatus?: "IN_PROGRESS" | "WAITING_CONFIRMATION" | "COMPLETED" | "TERMINATED" | "PAUSED";

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
    urgency: "High" | "Medium" | "Low";
    goals: DecisionGoal[];
    status: "pending" | "completed";
    confidence?: number;
    stepStatus: "AI_ANALYZED" | "HUMAN_MODIFIED" | "CONFIRMED" | "TERMINATED";
    isModified: boolean;
    semanticSummary?: {
      reasoning_trace?: {
        input_analysis?: {
          sender_signal?: string;
          time_signal?: string;
          subject_signal?: string;
          body_signal?: string;
        };
        intent_derivation?: {
          key_clues?: string[];
          reasoning_logic?: string;
        };
        goal_derivation?: Array<{
          goal_id: string;
          derived_from?: string[];
          derivation_logic?: string;
        }>;
      };
      core_intent?: { summary: string; confidence?: number };
      goals?: any[];
      [key: string]: any;
    };
  };

  // Step 2: Data
  dataPreparation: {
    requirements: DataRequirement[];
    candidates: CandidateInstance[];
    integrityIssues: DataIntegrityIssue[];
    status: "pending" | "completed";
    // New fields for risk management
    riskAccepted?: boolean;
    riskNote?: string;
    confirmedGoalIds?: string[]; // IDs of goals manually confirmed by user
    expertBriefing?: string; // New: AI briefing for data preparation
    supplementaryNotes?: Record<string, string>; // New: goalId -> note
    excludedObjectIds?: string[]; // New: list of AI-matched object IDs to hide
    semanticSummaryWord?: string; // New: Raw prompt for Step 1
    expertBriefingWord?: string; // New: Raw prompt for Step 2
    sortingEngineWord?: string; // New: Raw prompt for Sorting Engine
    sortingResults?: SortingEngine; // New: Ranking results from Analysis API
  };

  // Step 3: Reasoning
  reasoning: {
    status: "NOT_STARTED" | "REASONING" | "COMPLETED" | "WARNING";
    snapshotId: string;
    executedAt?: string;
    executor?: string;
    inferenceWord?: string; // New: Raw prompt for Step 3
    results: GoalReasoning[];
  };

  // Step 4: Action
  execution: {
    actions: ActionItem[];
    status: "pending" | "generated_waiting_confirm" | "executing" | "completed";
    generationInfo?: {
      source: string;
      generatedAt: string;
      generator: string;
    };
  };

  // Step 5: Result
  result: DecisionResult | null;
}
