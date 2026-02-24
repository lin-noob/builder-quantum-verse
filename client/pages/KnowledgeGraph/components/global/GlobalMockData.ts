
import { GraphNode, GraphEdge } from '../GraphCanvas'; // Reuse basic types if compatible, or define new ones

// Specific types for Global Graph to enforce constraints
export interface GlobalGraphNode {
    id: string;
    label?: string; // Optional, usually ID or key attribute
    type: 'circle'; 
    data: {
        objectType: string; // Customer, Order, etc.
        currentStatus: 'Active' | 'Failed' | 'Stuck' | 'Done';
        keyAttributes?: Record<string, any>;
        isActiveRecently: boolean;
        weight: number; // For size
        nodeType: 'instance-node' | 'cluster-node'; // For G6 rendering logic
        [key: string]: any;
    };
    style?: any;
}

export interface GlobalGraphEdge {
    id: string;
    source: string;
    target: string;
    label?: string; // Relation type
    data: {
        relationType: 'owns' | 'belongs_to' | 'depends_on' | 'related_to';
        strength: number; // 1-10
    };
    style?: any;
}

export interface GlobalGraphData {
    nodes: GlobalGraphNode[];
    edges: GlobalGraphEdge[];
}

// Generators
const OBJECT_TYPES = ['Customer', 'Order', 'Product', 'Supplier'];
const STATUSES = ['Active', 'Failed', 'Stuck', 'Done'];
const RELATIONS = ['owns', 'belongs_to', 'depends_on', 'related_to'];

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const generateGlobalGraphData = (count: number = 200): GlobalGraphData => {
    const nodes: GlobalGraphNode[] = [];
    const edges: GlobalGraphEdge[] = [];

    // 1. Generate Nodes
    for (let i = 0; i < count; i++) {
        const type = getRandomItem(OBJECT_TYPES);
        const status = getRandomItem(STATUSES) as any;
        const isCluster = i > count - 5; // Last 5 are clusters for demo

        if (isCluster) {
             nodes.push({
                id: `cluster-${i}`,
                label: `${type} Cluster`,
                type: 'circle',
                data: {
                    objectType: type,
                    currentStatus: 'Active', // Clusters are usually neutral or mixed
                    isActiveRecently: false,
                    weight: 50, // Big
                    nodeType: 'cluster-node',
                    count: getRandomInt(50, 500)
                },
                style: {
                    r: 40,
                    fill: '#F1F5F9',
                    stroke: '#94A3B8',
                    lineWidth: 2,
                    lineDash: [5, 5]
                }
            });
        } else {
            const weight = getRandomInt(10, 30);
            nodes.push({
                id: `inst-${i}`,
                label: `${type} #${i}`,
                type: 'circle',
                data: {
                    objectType: type,
                    currentStatus: status,
                    isActiveRecently: Math.random() > 0.7,
                    weight: weight,
                    nodeType: 'instance-node',
                    keyAttributes: {
                        amount: `$${getRandomInt(100, 10000)}`,
                        region: getRandomItem(['US', 'EU', 'APAC']),
                        priority: getRandomItem(['High', 'Medium', 'Low'])
                    }
                },
                style: {
                    r: weight,
                    // Color will be handled by renderer based on status, but we can pre-calc defaults
                    fill: status === 'Active' ? '#DCFCE7' : // Green-100
                          status === 'Done' ? '#F1F5F9' :   // Slate-100
                          '#FEE2E2',                        // Red-100
                    stroke: status === 'Active' ? '#16A34A' : // Green-600
                            status === 'Done' ? '#64748B' :   // Slate-500
                            '#EF4444',                        // Red-500
                    lineWidth: 2
                }
            });
        }
    }

    // 2. Generate Edges (Random connections)
    // Connect instances to other instances
    // Ensure some structure: Customers own Orders, Orders contain Products
    
    nodes.forEach((sourceNode) => {
        if (sourceNode.type === 'cluster-node') return;
        
        const numEdges = getRandomInt(0, 3);
        for (let j = 0; j < numEdges; j++) {
            const targetNode = getRandomItem(nodes);
            if (targetNode.id === sourceNode.id) continue;

            const relType = getRandomItem(RELATIONS) as any;
            edges.push({
                id: `edge-${sourceNode.id}-${targetNode.id}-${j}`,
                source: sourceNode.id,
                target: targetNode.id,
                data: {
                    relationType: relType,
                    strength: getRandomInt(1, 5)
                },
                style: {
                    lineWidth: getRandomInt(1, 3),
                    stroke: '#CBD5E1',
                    lineDash: relType === 'related_to' ? [2, 2] : []
                }
            });
        }
    });

    return { nodes, edges };
};
