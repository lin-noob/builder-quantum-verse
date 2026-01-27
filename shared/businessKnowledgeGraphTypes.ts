export type GraphMode = 'macro' | 'mesh' | 'focus';
export type PlaybackMode = 'lifecycle' | 'failure';

// --- Core Data Models (Decoupled from UI) ---

export interface ObjectType {
  id: string;
  name: string;
  color: string;
}

export interface Instance {
  id: string;
  objectTypeId: string;
  status: 'Active' | 'Stuck' | 'Failed' | 'Done';
}

export interface GraphEvent {
  id: string;
  instanceId?: string;
  relationId?: string;
  timestamp: number;
  type: 'created' | 'status_change' | 'interaction' | 'error' | 'resolved';
  description: string;
  isCausal?: boolean; // For Failure mode analysis
}

export interface Relation {
  sourceInstanceId: string;
  targetInstanceId: string;
  type: string;
}

// --- Graph Visualization Models ---

export interface ObjectTypeNode {
  kind: 'ObjectType';
  id: string;
  name: string;
  color: string;
  instanceCount: number;
  x?: number;
  y?: number;
  opacity?: number; // Visual state
}

export interface TypeGroupNode {
  kind: 'TypeGroup';
  id: string; // usually same as objectTypeId or derived
  objectTypeId: string;
  color?: string; // Optional convenience for styling
  instanceIds: string[];
  stats?: {
    total: number;
    active: number;
    stuck: number;
    failed: number;
    done: number;
  };
  x?: number;
  y?: number;
  opacity?: number; // Visual state
}

export interface InstanceNode {
  kind: 'Instance';
  id: string;
  objectTypeId: string;
  status: Instance['status'];
  label?: string; // Optional: for display convenience
  parentId?: string;
  x?: number;
  y?: number;
  opacity?: number; // Visual state for playback
  highlighted?: boolean; // Visual state for hover
  
  // Mesh Mode Enhancements
  createdAt?: number;
  importance?: number; // 0.0 - 1.0
}

export interface ZoneNode {
  kind: 'Zone';
  id: string;
  label: string;
  color: string;
  width: number;
  height: number;
  x?: number;
  y?: number;
}

export type GraphNode = 
  | ObjectTypeNode
  | TypeGroupNode
  | InstanceNode
  | ZoneNode;

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  kind: 'TypeRelation' | 'InstanceRelation';
  opacity?: number; // Visual state
  highlighted?: boolean; // Visual state
  label?: string; // Semantic action label (e.g., "contains")
  
  // Mesh Mode Enhancements
  isCritical?: boolean;
  isActive?: boolean;
  priority?: 'critical' | 'active' | 'normal';
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// --- Graph State & Filters ---

export interface GraphFilters {
  status?: string[];
  search?: string;
  timeRange?: [number, number];
}

export interface GraphStateData {
  mode: GraphMode;
  expandedTypes: string[];        // 仅 Macro Mode 使用（最多 2 个）
  focusedInstanceId?: string;     // 仅 Focus Mode 使用 (Graph Center)
  selectedInstanceId?: string;    // Focus Mode 下，右侧详情面板展示的实例 ID
  filters?: GraphFilters;
  hoveredEventId?: string;        // Interaction
  
  // New: Filter System State
  isFilterDrawerOpen?: boolean;
  activeFilterType?: string;      // The ObjectType ID currently being filtered in Drawer

  // Interaction State
  hoveredInstanceId?: string;     // The ID of the instance currently being hovered

  // Navigation History
  lastMode?: GraphMode;
  showLabels: boolean;
  
  // LOD State
  zoomLevel: number;
}

export interface GraphStateActions {
  setMode: (mode: GraphMode) => void;
  toggleShowLabels: () => void;
  setZoomLevel: (zoom: number) => void;
  setExpandedTypes: (types: string[]) => void;
  setFocusedInstanceId: (id: string | undefined) => void;
  setSelectedInstanceId: (id: string | undefined) => void; // New Action
  setHoveredInstanceId: (id: string | undefined) => void;
  setFilters: (filters: GraphFilters | undefined) => void;
  setHoveredEventId: (id: string | undefined) => void;
  toggleTypeExpansion: (typeId: string) => void;
  resetGraph: () => void;
  
  // New: Filter System Actions
  setFilterDrawerOpen: (isOpen: boolean) => void;
  setActiveFilterType: (typeId: string | undefined) => void;
}

export type GraphStore = GraphStateData & GraphStateActions;
