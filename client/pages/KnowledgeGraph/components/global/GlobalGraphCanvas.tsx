
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, { 
  Node, 
  Edge, 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState,
  MarkerType,
  MiniMap
} from 'reactflow';
import 'reactflow/dist/style.css';
import { GlobalGraphData } from './GlobalMockData';

interface GlobalGraphCanvasProps {
  data: GlobalGraphData;
  onNodeClick: (nodeId: string) => void;
  onClusterClick?: (clusterId: string) => void;
}

// Semantic Foci Layout Simulation
const runForceLayout = (nodes: Node[], edges: Edge[], width = 800, height = 600, iterations = 150) => {
    // 1. Identify Object Types and Calculate Foci (Anchors)
    const objectTypes = Array.from(new Set(nodes.map(n => n.data?.objectType).filter(Boolean)));
    const foci: Record<string, { x: number, y: number }> = {};
    
    console.log('Global Layout Object Types:', objectTypes);

    if (objectTypes.length > 0) {
        const radius = Math.min(width, height) * 0.4; // Foci circle radius (increased)
        objectTypes.forEach((type, i) => {
            const angle = (i / objectTypes.length) * 2 * Math.PI - Math.PI / 2; // Start from top
            foci[type] = {
                x: width / 2 + Math.cos(angle) * radius,
                y: height / 2 + Math.sin(angle) * radius
            };
        });
    }

    // Clone to avoid mutating state directly during calculation
    const simulationNodes = nodes.map(n => {
        const type = n.data?.objectType;
        const anchor = foci[type];
        
        // Better Initialization: Start near the anchor to help convergence
        const initialX = anchor ? anchor.x + (Math.random() - 0.5) * 100 : Math.random() * width;
        const initialY = anchor ? anchor.y + (Math.random() - 0.5) * 100 : Math.random() * height;

        return { 
            ...n, 
            x: initialX, 
            y: initialY,
            vx: 0,
            vy: 0,
            objectType: type
        };
    });

    const k = Math.sqrt((width * height) / (simulationNodes.length || 1));
    const repulsion = 600; // Stronger repulsion
    const edgeStrength = 0.01; // Very weak edge pull
    const typeGravity = 0.15; // Very strong pull to type anchor

    for (let i = 0; i < iterations; i++) {
        // 1. Repulsion (Node-Node)
        for (let a = 0; a < simulationNodes.length; a++) {
            const nodeA = simulationNodes[a];
            for (let b = a + 1; b < simulationNodes.length; b++) {
                const nodeB = simulationNodes[b];
                const dx = nodeA.x - nodeB.x;
                const dy = nodeA.y - nodeB.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                
                if (dist < 250) { 
                    const force = (k * k) / dist;
                    const fx = (dx / dist) * force;
                    const fy = (dy / dist) * force;
                    
                    nodeA.vx += fx;
                    nodeA.vy += fy;
                    nodeB.vx -= fx;
                    nodeB.vy -= fy;
                }
            }
        }

        // 2. Edge Attraction
        edges.forEach(edge => {
            const source = simulationNodes.find(n => n.id === edge.source);
            const target = simulationNodes.find(n => n.id === edge.target);
            if (source && target) {
                const dx = source.x - target.x;
                const dy = source.y - target.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                
                // If same type, stronger attraction (keep cluster tight)
                // If diff type, weaker attraction (allow separation)
                const isSameType = source.objectType === target.objectType;
                const currentEdgeStrength = isSameType ? edgeStrength * 2 : edgeStrength * 0.5;

                const force = (dist * dist) / k * currentEdgeStrength;
                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;

                source.vx -= fx;
                source.vy -= fy;
                target.vx += fx;
                target.vy += fy;
            }
        });

        // 3. Foci Gravity (Pull to Type Anchor)
    simulationNodes.forEach(node => {
        const anchor = foci[node.objectType];
        if (anchor) {
            const dx = anchor.x - node.x;
            const dy = anchor.y - node.y;
            // Stronger Pull
            node.vx += dx * typeGravity * 2;
            node.vy += dy * typeGravity * 2;
        } else {
            node.vx += (width / 2 - node.x) * 0.05;
            node.vy += (height / 2 - node.y) * 0.05;
        }
    });

        // 4. Apply velocities with damping
        simulationNodes.forEach(node => {
            const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
            const maxSpeed = 20 * (1 - i / iterations); // Higher initial speed
            
            if (speed > maxSpeed) {
                node.vx = (node.vx / speed) * maxSpeed;
                node.vy = (node.vy / speed) * maxSpeed;
            }

            node.x += node.vx;
            node.y += node.vy;
        });
    }

    return simulationNodes.map((n, i) => ({
        ...nodes[i],
        position: { x: n.x, y: n.y }
    }));
};

export const GlobalGraphCanvas: React.FC<GlobalGraphCanvasProps> = ({ data, onNodeClick, onClusterClick }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!data) return;

    const rfNodes: Node[] = data.nodes.map(n => ({
        id: n.id,
        type: 'default',
        data: { 
            label: n.label || n.id,
            ...n.data,
            nodeType: n.data?.nodeType // Explicitly pass nodeType
        },
        style: {
            background: n.style?.fill || '#fff',
            border: `2px solid ${n.style?.stroke || '#000'}`,
            borderRadius: '50%',
            width: (n.style?.r || 20) * 2,
            height: (n.style?.r || 20) * 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '10px',
            color: '#333',
            boxShadow: n.style?.shadowColor ? `0 0 ${n.style.shadowBlur}px ${n.style.shadowColor}` : undefined,
            ...n.style
        },
        position: { x: Math.random() * 800, y: Math.random() * 600 }
    }));

    const rfEdges: Edge[] = data.edges.map(e => ({
        id: e.id || `${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        style: {
            stroke: e.style?.stroke || '#cbd5e1',
            strokeWidth: e.style?.lineWidth || 1,
            strokeDasharray: e.style?.lineDash ? '5 5' : undefined
        },
        animated: e.data?.relationType === 'depends_on', // Example: animate dependencies
    }));

    // Run layout
    // Pass width/height based on window or container if possible, but 800x600 is fine for simulation base
    const layoutedNodes = runForceLayout(rfNodes, rfEdges, 1200, 900, 200);
    
    setNodes(layoutedNodes);
    setEdges(rfEdges);
  }, [data, setNodes, setEdges]);

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
      const nodeType = node.data?.nodeType;
      if (nodeType === 'cluster-node' && onClusterClick) {
          onClusterClick(node.id);
      } else {
          onNodeClick(node.id);
      }
  }, [onNodeClick, onClusterClick]);

  return (
    <div className="w-full h-full bg-slate-50">
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            fitView
            attributionPosition="bottom-right"
            minZoom={0.1}
            maxZoom={4}
        >
            <Background color="#f1f5f9" gap={20} />
            <Controls />
            <MiniMap 
                nodeStrokeColor={(n) => {
                    if (n.data?.currentStatus === 'Failed') return '#ef4444';
                    if (n.data?.currentStatus === 'Active') return '#22c55e';
                    return '#cbd5e1';
                }}
                nodeColor={(n) => {
                     return '#fff';
                }}
            />
        </ReactFlow>
    </div>
  );
};
