// Generates the index subgraph around a type
export const getIndexSubgraph = (typeId: string) => {
    // Mocking a subgraph expansion
    // The center is the type node (aggregated)
    const centerNode = { 
        id: typeId, 
        label: typeId, 
        type: 'circle',
        data: { nodeType: 'type-node' },
        style: { r: 50, fill: '#DBEAFE', stroke: '#2563EB', lineWidth: 2, cursor: 'default' } 
    };

    // Generate instances with visual encoding
    // 1. color: status (Failed=Red, Paid=Green, Shipped=Gray)
    // 2. halo: recent event
    // 3. size: importance
    const instances = Array.from({ length: 15 }).map((_, i) => {
        // Simulation logic
        const isFailed = i < 5; // First 5 are failed
        const isPaid = i >= 5 && i < 10;
        const isShipped = i >= 10;
        
        let status = 'Unknown';
        let color = '#94A3B8'; // Default gray
        
        if (isFailed) { status = 'Failed'; color = '#EF4444'; } // Red
        else if (isPaid) { status = 'Paid'; color = '#10B981'; } // Green
        else if (isShipped) { status = 'Shipped'; color = '#64748B'; } // Slate

        const hasRecentEvent = i % 2 === 0;
        const importance = (i % 3) + 1; // 1, 2, 3
        const size = 15 + (importance * 3); // 18, 21, 24

        return {
            id: `${typeId}-${i}`,
            label: `#${1000 + i}`,
            type: 'circle',
            data: { 
                nodeType: 'instance-node', 
                status: status,
                hasRecentEvent: hasRecentEvent
            },
            style: { 
                r: size, 
                fill: color,
                stroke: hasRecentEvent ? '#F59E0B' : '#fff', // Orange halo if recent event
                lineWidth: hasRecentEvent ? 3 : 2,
                cursor: 'pointer'
            }
        };
    });

    // Prevention of explosion mechanism (Cluster Node)
    // If > threshold, aggregate into cluster
    const clusterNode = {
        id: `${typeId}-cluster`,
        label: `Failed Orders × 127`,
        type: 'circle',
        data: { nodeType: 'cluster-node' },
        style: { 
            r: 40, 
            fill: '#FEE2E2', // Light red
            stroke: '#EF4444', 
            lineWidth: 2, 
            lineDash: [5, 5],
            cursor: 'pointer'
        }
    };
    
    const edges = instances.map(inst => ({
        source: typeId,
        target: inst.id,
        style: { lineWidth: 1, stroke: '#CBD5E1', lineDash: [4, 4] }
    }));

    // Add edge to cluster
    edges.push({
        source: typeId,
        target: clusterNode.id,
        style: { lineWidth: 2, stroke: '#EF4444', lineDash: [2, 2] }
    });
    
    return {
        nodes: [centerNode, ...instances, clusterNode],
        edges: edges
    };
};
