import { 
  GraphStateData, 
  GraphData, 
  GraphNode, 
  GraphEdge, 
  ObjectType, 
  Instance,
  GraphEvent
} from "@shared/businessKnowledgeGraphTypes";
import { GraphTheme } from "../theme/graphTheme";

// Mock data generator for now
const mockObjectTypes: ObjectType[] = [
  { id: "type_customer", name: "客户", color: GraphTheme.colors.types.type1 },
  { id: "type_order", name: "订单", color: GraphTheme.colors.types.type2 },
  { id: "type_product", name: "商品", color: GraphTheme.colors.types.type3 },
  { id: "type_payment", name: "支付单", color: GraphTheme.colors.types.type2 }, // Using theme color
  { id: "type_logistics", name: "物流单", color: GraphTheme.colors.types.type4 }, // Using theme color
];

const mockInstances: Instance[] = [
  // 场景 1: 完美订单 (李明)
  { id: "cust_001", objectTypeId: "type_customer", status: "Active" },
  { id: "order_1001", objectTypeId: "type_order", status: "Done" },
  { id: "prod_501", objectTypeId: "type_product", status: "Active" },
  { id: "pay_2001", objectTypeId: "type_payment", status: "Success" },
  { id: "log_3001", objectTypeId: "type_logistics", status: "Delivered" },

  // 场景 2: 支付失败 (王强)
  { id: "cust_002", objectTypeId: "type_customer", status: "Active" },
  { id: "order_1002", objectTypeId: "type_order", status: "Cancelled" },
  { id: "prod_502", objectTypeId: "type_product", status: "Active" },
  { id: "pay_2002", objectTypeId: "type_payment", status: "Failed" },

  // 场景 3: 物流滞留 (张伟)
  { id: "cust_003", objectTypeId: "type_customer", status: "Warning" },
  { id: "order_1003", objectTypeId: "type_order", status: "Stuck" },
  { id: "prod_503", objectTypeId: "type_product", status: "Active" },
  { id: "pay_2003", objectTypeId: "type_payment", status: "Success" },
  { id: "log_3003", objectTypeId: "type_logistics", status: "Stuck" },
];

const mockInstanceRelations = [
  // 场景 1 关系
  { id: "rel_1_1", source: "cust_001", target: "order_1001" },
  { id: "rel_1_2", source: "order_1001", target: "prod_501" },
  { id: "rel_1_3", source: "order_1001", target: "pay_2001" },
  { id: "rel_1_4", source: "order_1001", target: "log_3001" },

  // 场景 2 关系
  { id: "rel_2_1", source: "cust_002", target: "order_1002" },
  { id: "rel_2_2", source: "order_1002", target: "prod_502" },
  { id: "rel_2_3", source: "order_1002", target: "pay_2002" },

  // 场景 3 关系
  { id: "rel_3_1", source: "cust_003", target: "order_1003" },
  { id: "rel_3_2", source: "order_1003", target: "prod_503" },
  { id: "rel_3_3", source: "order_1003", target: "pay_2003" },
  { id: "rel_3_4", source: "order_1003", target: "log_3003" },
];

// --- GENERATE LARGE SCALE MOCK DATA ---
const GENERATE_COUNT = 100;
const types = mockObjectTypes.map(t => t.id);
const statuses: Instance['status'][] = ['Active', 'Active', 'Active', 'Stuck', 'Failed', 'Done'];

for (let i = 0; i < GENERATE_COUNT; i++) {
    const typeId = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const id = `gen_${typeId}_${i}`;
    
    mockInstances.push({
        id,
        objectTypeId: typeId,
        status
    });

    // Random relations (Sparse graph)
    if (i > 0 && Math.random() > 0.7) {
        const targetIndex = Math.floor(Math.random() * i);
        const targetId = mockInstances[targetIndex].id; // Connect to existing node
        mockInstanceRelations.push({
            id: `gen_rel_${i}`,
            source: id,
            target: targetId
        });
    }
}

const mockSchemas: Record<string, { name: string; type: string; description?: string }[]> = {
  type_customer: [
    { name: "customer_id", type: "string", description: "客户唯一标识" },
    { name: "name", type: "string", description: "客户名称" },
    { name: "tier", type: "string", description: "客户等级" },
    { name: "created_at", type: "datetime", description: "创建时间" },
  ],
  type_order: [
    { name: "order_id", type: "string", description: "订单号" },
    { name: "amount", type: "number", description: "订单金额" },
    { name: "status", type: "string", description: "订单状态" },
    { name: "created_at", type: "datetime", description: "创建时间" },
  ],
  type_product: [
    { name: "product_id", type: "string", description: "商品ID" },
    { name: "name", type: "string", description: "商品名称" },
    { name: "category", type: "string", description: "分类" },
    { name: "price", type: "number", description: "价格" },
  ],
  type_payment: [
    { name: "payment_id", type: "string", description: "支付单号" },
    { name: "method", type: "string", description: "支付方式" },
    { name: "status", type: "string", description: "支付状态" },
    { name: "paid_at", type: "datetime", description: "支付时间" },
  ],
  type_logistics: [
    { name: "log_id", type: "string", description: "物流单号" },
    { name: "carrier", type: "string", description: "承运商" },
    { name: "status", type: "string", description: "物流状态" },
    { name: "updated_at", type: "datetime", description: "更新时间" },
  ],
};

// Mock Events
// Timestamps are roughly in last 24h: now is T. T-24h to T.
const T = Date.now();
const H = 3600 * 1000;

export const mockEvents: GraphEvent[] = [
    // --- 场景 1: 完美订单 (李明) ---
    // T-20h: 下单
    { id: "evt_1_1", instanceId: "cust_001", timestamp: T - 20*H, type: 'interaction', description: '用户访问' },
    { id: "evt_1_2", instanceId: "order_1001", timestamp: T - 19.5*H, type: 'created', description: '订单创建' },
    { id: "evt_1_3", relationId: "rel_1_1", timestamp: T - 19.5*H, type: 'interaction', description: '关联客户' },
    
    // T-19h: 支付成功
    { id: "evt_1_4", instanceId: "pay_2001", timestamp: T - 19*H, type: 'created', description: '发起支付' },
    { id: "evt_1_5", instanceId: "pay_2001", timestamp: T - 18.8*H, type: 'status_change', description: '支付成功' },
    { id: "evt_1_6", relationId: "rel_1_3", timestamp: T - 18.8*H, type: 'interaction', description: '支付关联订单' },
    
    // T-15h: 发货
    { id: "evt_1_7", instanceId: "order_1001", timestamp: T - 15*H, type: 'status_change', description: '订单状态 -> 待发货' },
    { id: "evt_1_8", instanceId: "log_3001", timestamp: T - 14*H, type: 'created', description: '物流单创建' },
    { id: "evt_1_9", relationId: "rel_1_4", timestamp: T - 14*H, type: 'interaction', description: '发货关联' },
    
    // T-2h: 签收
    { id: "evt_1_10", instanceId: "log_3001", timestamp: T - 2*H, type: 'status_change', description: '已签收' },
    { id: "evt_1_11", instanceId: "order_1001", timestamp: T - 2*H, type: 'status_change', description: '订单完成' },

    // --- 场景 2: 支付失败 (王强) ---
    // T-12h: 下单
    { id: "evt_2_1", instanceId: "cust_002", timestamp: T - 12*H, type: 'interaction', description: '用户访问' },
    { id: "evt_2_2", instanceId: "order_1002", timestamp: T - 11.5*H, type: 'created', description: '订单创建' },
    
    // T-11h: 支付失败
    { id: "evt_2_3", instanceId: "pay_2002", timestamp: T - 11*H, type: 'created', description: '发起支付' },
    { id: "evt_2_4", instanceId: "pay_2002", timestamp: T - 10.9*H, type: 'error', description: '余额不足', isCausal: true },
    { id: "evt_2_5", instanceId: "order_1002", timestamp: T - 10.5*H, type: 'status_change', description: '订单取消' },

    // --- 场景 3: 物流滞留 (张伟) ---
    // T-22h: 下单
    { id: "evt_3_1", instanceId: "cust_003", timestamp: T - 22*H, type: 'interaction', description: '用户访问' },
    { id: "evt_3_2", instanceId: "order_1003", timestamp: T - 21.5*H, type: 'created', description: '订单创建' },
    
    // T-21h: 支付成功
    { id: "evt_3_3", instanceId: "pay_2003", timestamp: T - 21*H, type: 'status_change', description: '支付成功' },
    
    // T-18h: 发货
    { id: "evt_3_4", instanceId: "log_3003", timestamp: T - 18*H, type: 'created', description: '物流单创建' },
    { id: "evt_3_5", instanceId: "log_3003", timestamp: T - 17*H, type: 'status_change', description: '运输中' },
    
    // T-5h: 滞留异常
    { id: "evt_3_6", instanceId: "log_3003", timestamp: T - 5*H, type: 'error', description: '中转站滞留', isCausal: true },
    { id: "evt_3_7", instanceId: "cust_003", timestamp: T - 4.5*H, type: 'interaction', description: '用户投诉' },
    { id: "evt_3_8", instanceId: "order_1003", timestamp: T - 4*H, type: 'status_change', description: '订单状态 -> 异常' },
];

/**
 * 唯一允许生成图节点与边的函数
 * 所有的业务逻辑差异、Mode 差异必须在此处处理
 */
export function buildGraph(state: GraphStateData): GraphData {
  const { mode, expandedTypes, focusedInstanceId, filters, hoveredEventId } = state;

  // console.log(`[buildGraph] Building graph for mode: ${mode}`);

  // ❌ 任何组件不得自行拼接 nodes / edges
  // ❌ 不允许在渲染层判断 Mode
  // Mode 切换 = 调用 buildGraph 重新生成

  let nodes: GraphNode[] = [];
  let edges: GraphEdge[] = [];

  switch (mode) {
    case 'macro':
      // Macro View: Show ObjectTypes + Expanded Type Groups
      nodes = buildMacroNodes(expandedTypes);
      edges = buildMacroEdges();
      
      // 强制断言
      if (mode === 'macro') {
        // assert(noInstanceEdges)
        const hasInstanceEdges = edges.some(e => e.kind === 'InstanceRelation');
        if (hasInstanceEdges) {
            throw new Error("[Macro Mode Violation] Instance edges found! Macro mode should only contain Type relations.");
        }

        // assert(instancesInsideContainersOnly)
        // Check if any instance node exists without a parent (which implies container membership in this context).
        // In React Flow, child nodes are part of the flat nodes array but MUST have a parentId.
        const orphanInstances = nodes.filter(n => n.kind === 'Instance' && !n.parentId);
        if (orphanInstances.length > 0) {
             throw new Error(`[Macro Mode Violation] Orphan Instance nodes found! ID: ${orphanInstances[0].id}. Instances must be inside TypeGroup containers.`);
        }
      }
      break;

    case 'mesh':
      // Mesh View: Show Global Instance Mesh (filtered)
      nodes = buildMeshNodes(filters);
      edges = buildMeshEdges();
      
      // Enforce Mesh Mode constraints
      if (mode === 'mesh') {
          // ❌ ObjectTypeNode forbidden
          const hasObjectNodes = nodes.some(n => n.kind === 'ObjectType');
          if (hasObjectNodes) throw new Error("[Mesh Mode Violation] ObjectTypeNode found!");

          // ❌ TypeGroupNode forbidden
          const hasGroupNodes = nodes.some(n => n.kind === 'TypeGroup');
          if (hasGroupNodes) throw new Error("[Mesh Mode Violation] TypeGroupNode found!");
          
          // ✅ InstanceNode allowed (checked implicitly as only residue)
      }
      break;

    case 'focus':
      // Focus View: Show Ego Graph around focusedInstanceId
      if (focusedInstanceId) {
        const result = buildFocusGraph(focusedInstanceId);
        nodes = result.nodes;
        edges = result.edges;

        // Apply Interaction Logic (Hover)
        if (hoveredEventId) {
             applyHoverVisuals(nodes, edges, hoveredEventId);
        }

      } else {
        nodes = [];
        edges = [];
      }
      break;

    default:
      assertUnreachable(mode);
  }

  // console.log(`[buildGraph] Generated ${nodes.length} nodes and ${edges.length} edges.`);
  return { nodes, edges };
}

// --- Specific Builders (Internal) ---

function applyHoverVisuals(nodes: GraphNode[], edges: GraphEdge[], hoveredEventId: string) {
    const event = mockEvents.find(e => e.id === hoveredEventId);
    if (!event) return;

    if (event.instanceId) {
        const node = nodes.find(n => n.id === event.instanceId);
        if (node && node.kind === 'Instance') {
            node.highlighted = true;
        }
    }

    if (event.relationId) {
        const edge = edges.find(e => e.id === event.relationId);
        if (edge) {
            edge.highlighted = true;
        }
    }
}

function buildMacroNodes(expandedTypes: string[]): GraphNode[] {
  return mockObjectTypes.flatMap(type => {
    const isExpanded = expandedTypes.includes(type.id);
    
    if (isExpanded) {
      // 1. Create the Container Node (TypeGroup)
      const typeInstances = mockInstances.filter(i => i.objectTypeId === type.id);
      
      const stats = {
        total: typeInstances.length,
        active: typeInstances.filter(i => i.status === 'Active' || i.status === 'Success' || i.status === 'Delivered').length,
        stuck: typeInstances.filter(i => i.status === 'Stuck' || i.status === 'Warning').length,
        failed: typeInstances.filter(i => i.status === 'Failed' || i.status === 'Cancelled').length,
        done: typeInstances.filter(i => i.status === 'Done').length,
      };

      const groupNode: GraphNode = {
        kind: 'TypeGroup',
        id: type.id, 
        objectTypeId: type.id,
        color: type.color,
        instanceIds: [],
        stats: stats
      };

      // 2. Create Child Nodes (Instances)
      // ✅ InstanceNode（仅限容器内部）
      (groupNode as any).instanceIds = typeInstances.map(i => i.id);

      const instanceNodes: GraphNode[] = typeInstances.map(inst => ({
        kind: 'Instance',
        id: inst.id,
        objectTypeId: inst.objectTypeId,
        status: inst.status,
        parentId: type.id, // IMPORTANT: Links to the group node
      }));

      return [groupNode, ...instanceNodes];
    } else {
      // Return ObjectTypeNode
      // ✅ ObjectTypeNode
      const instanceCount = mockInstances.filter(i => i.objectTypeId === type.id).length;
      return [{
        kind: 'ObjectType',
        id: type.id,
        name: type.name,
        color: type.color,
        instanceCount: instanceCount
      }];
    }
  });
}

function buildMacroEdges(): GraphEdge[] {
  // ✅ ❌ Instance ↔ Instance 真实连线 (Forbidden in Macro)
  // Only return Type Relations
  return [
    { id: "e1", source: "type_customer", target: "type_order", kind: "TypeRelation", label: "下单" },
    { id: "e2", source: "type_order", target: "type_product", kind: "TypeRelation", label: "包含" },
    { id: "e3", source: "type_order", target: "type_payment", kind: "TypeRelation", label: "支付" },
    { id: "e4", source: "type_order", target: "type_logistics", kind: "TypeRelation", label: "发货" }
  ];
}

function buildMeshNodes(filters?: GraphStateData['filters']): GraphNode[] {
  // Filter instances based on global filters
  let filteredInstances = mockInstances;
  
  if (filters?.status && filters.status.length > 0) {
    filteredInstances = filteredInstances.filter(i => filters.status!.includes(i.status));
  }

  if (filters?.search) {
      const term = filters.search.toLowerCase();
      filteredInstances = filteredInstances.filter(i => 
          i.id.toLowerCase().includes(term) || 
          i.objectTypeId.toLowerCase().includes(term)
      );
  }
  
  return filteredInstances.map(inst => {
    // 1. Calculate CreatedAt (Earliest Event)
    const instanceEvents = mockEvents.filter(e => e.instanceId === inst.id);
    let createdAt = Date.now();
    if (instanceEvents.length > 0) {
        createdAt = Math.min(...instanceEvents.map(e => e.timestamp));
    } else {
        // Fallback: Use consistent random offset based on ID hash
        const hash = inst.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        createdAt = Date.now() - (hash % 24) * 3600 * 1000; 
    }

    // 2. Calculate Importance
    let importance = 0.5;
    if (inst.objectTypeId === 'type_order') importance = 0.95;
    else if (inst.objectTypeId === 'type_customer') importance = 0.85;
    else if (inst.objectTypeId === 'type_payment') importance = 0.75;
    else if (inst.objectTypeId === 'type_logistics') importance = 0.65;
    
    // Boost importance if it has many events
    if (instanceEvents.length > 3) importance += 0.1;
    importance = Math.min(importance, 1.0);

    return {
        kind: 'Instance',
        id: inst.id,
        objectTypeId: inst.objectTypeId,
        status: inst.status,
        label: `Instance ${inst.id}`,
        createdAt,
        importance
    };
  });
}

function getRelationLabel(relationId: string): string | undefined {
  const events = mockEvents.filter(e => e.relationId === relationId).sort((a, b) => b.timestamp - a.timestamp);
  return events[0]?.description;
}

function buildMeshEdges(): GraphEdge[] {
  return mockInstanceRelations.map(rel => {
      const hasRelationError = mockEvents.some(e => 
          e.relationId === rel.id && (e.type === 'error' || e.description.includes('失败') || e.description.includes('Failure'))
      );

      const sourceInst = mockInstances.find(i => i.id === rel.source);
      const targetInst = mockInstances.find(i => i.id === rel.target);
      const isCrossDomain = sourceInst && targetInst && sourceInst.objectTypeId !== targetInst.objectTypeId;

      const hasEndpointError = mockEvents.some(e =>
          (e.type === 'error' || e.isCausal) &&
          (e.instanceId === rel.source || e.instanceId === rel.target)
      );

      const isCritical = hasRelationError || hasEndpointError;

      const activeStatuses = ['Active', 'Stuck', 'Warning', 'Success', 'Delivered'];
      const isSourceActive = sourceInst ? activeStatuses.includes((sourceInst as any).status) : false;
      const isTargetActive = targetInst ? activeStatuses.includes((targetInst as any).status) : false;
      const isActive = !isCritical && (isSourceActive || isTargetActive);

      const priority: 'critical' | 'active' | 'normal' = isCritical ? 'critical' : isActive ? 'active' : 'normal';

      return {
          id: rel.id,
          source: rel.source,
          target: rel.target,
          kind: 'InstanceRelation',
          isCritical,
          isActive,
          priority,
          label: getRelationLabel(rel.id),
          data: {
              isCrossDomain,
              isCritical,
              isActive,
              priority
          }
      };
  });
}

function buildFocusGraph(centerId: string): { nodes: GraphNode[], edges: GraphEdge[] } {
    // 1. Find Center Node
    const centerInstance = mockInstances.find(i => i.id === centerId);
    if (!centerInstance) return { nodes: [], edges: [] };

    // 2. BFS / Traversal for 1-2 hops
    const visitedNodeIds = new Set<string>([centerId]);
    const visitedEdgeIds = new Set<string>();
    
    // We need bidirectional traversal (Upstream + Downstream)
    // mockInstanceRelations is directed.
    // Upstream: target == current
    // Downstream: source == current

    const connectedEdges = mockInstanceRelations.filter(rel => 
        rel.source === centerId || rel.target === centerId
    );

    connectedEdges.forEach(edge => {
        visitedEdgeIds.add(edge.id);
        const neighborId = edge.source === centerId ? edge.target : edge.source;
        visitedNodeIds.add(neighborId);
    });

    // 3. Build Result Nodes
    const resultNodes: GraphNode[] = Array.from(visitedNodeIds).map(id => {
        const inst = mockInstances.find(i => i.id === id);
        if (!inst) return null; // Should not happen if data integrity holds
        return {
            kind: 'Instance',
            id: inst.id,
            objectTypeId: inst.objectTypeId,
            status: inst.status,
            label: inst.id === centerId ? `[FOCUS] ${inst.id}` : inst.id,
            schema: mockSchemas[inst.objectTypeId] || []
        };
    }).filter(n => n !== null) as GraphNode[];

    // 4. Build Result Edges (Only those connecting visited nodes)
    const resultEdges: GraphEdge[] = mockInstanceRelations
        .filter(rel => rel.source === centerId || rel.target === centerId)
        .map(rel => {
            const isCritical = mockEvents.some(e => 
                e.relationId === rel.id && (e.type === 'error' || e.description.includes('失败') || e.description.includes('Failure'))
            );
            return {
                id: rel.id,
                source: rel.source,
                target: rel.target,
                kind: 'InstanceRelation',
                isCritical,
                label: getRelationLabel(rel.id)
            };
        });

    return { nodes: resultNodes, edges: resultEdges };
}

function assertUnreachable(x: never): never {
  throw new Error(`Unexpected object: ${x}`);
}
