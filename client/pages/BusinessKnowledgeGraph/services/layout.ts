import { forceSimulation, forceLink, forceManyBody, forceCollide, forceX, forceY } from 'd3-force';
import { Node, Edge } from '@xyflow/react';
import { GraphTheme } from '../theme/graphTheme';

export function applyFocusLayout(nodes: Node[], edges: Edge[], centerId?: string): Promise<Node[]> {
    return new Promise((resolve) => {
        const width = 1200;
        const height = 800;
        const centerX = width * 0.5;
        const centerY = height * 0.5;
        const leftX = width * 0.2;
        const rightX = width * 0.8;

        const upstreamIds = new Set<string>();
        const downstreamIds = new Set<string>();

        edges.forEach(edge => {
            if (!centerId) return;
            if (edge.target === centerId) upstreamIds.add(edge.source);
            if (edge.source === centerId) downstreamIds.add(edge.target);
        });

        const leftNodes = nodes.filter(n => upstreamIds.has(n.id) && n.id !== centerId);
        const rightNodes = nodes.filter(n => downstreamIds.has(n.id) && n.id !== centerId);
        const centerNode = nodes.find(n => n.id === centerId);

        const distributeY = (list: Node[]) => {
            const spacing = height / (list.length + 1);
            return list.map((node, index) => ({
                ...node,
                position: { x: leftX, y: spacing * (index + 1) },
            }));
        };

        const distributeYRight = (list: Node[]) => {
            const spacing = height / (list.length + 1);
            return list.map((node, index) => ({
                ...node,
                position: { x: rightX, y: spacing * (index + 1) },
            }));
        };

        const layoutedNodes = [
            ...(centerNode
                ? [{ ...centerNode, position: { x: centerX, y: centerY } }]
                : []),
            ...distributeY(leftNodes),
            ...distributeYRight(rightNodes),
        ];

        const positionedIds = new Set(layoutedNodes.map(n => n.id));
        const remainingNodes = nodes.filter(n => !positionedIds.has(n.id)).map((node, index) => ({
            ...node,
            position: { x: rightX, y: (height / (nodes.length + 1)) * (index + 1) },
        }));

        resolve([...layoutedNodes, ...remainingNodes]);
    });
}

export function applyMeshLayout(nodes: Node[], edges: Edge[]): Promise<Node[]> {
    return new Promise((resolve) => {
        // 1. Data Preparation
        // Extract Unique Types for Radial Anchors
        const types = Array.from(new Set(nodes.map(n => n.data.objectTypeId as string))).sort();
        const typeCount = types.length;
        
        // Define Layout Constants
        const canvasWidth = 1200;
        const canvasHeight = 900;
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        const anchorRadius = 350; // Radius for Type Anchors

        // Calculate Anchor Positions (Radial)
        const typeAnchors = new Map<string, {x: number, y: number}>();
        types.forEach((typeId, index) => {
            const angle = (index / typeCount) * 2 * Math.PI - Math.PI / 2; // Start from top
            typeAnchors.set(typeId, {
                x: centerX + anchorRadius * Math.cos(angle),
                y: centerY + anchorRadius * Math.sin(angle)
            });
        });

        // Initialize Nodes near their Type Anchor
        const simNodes = nodes.map(n => {
            const typeId = n.data.objectTypeId as string;
            const anchor = typeAnchors.get(typeId) || { x: centerX, y: centerY };
            
            // Add some jitter so they don't stack perfectly
            const jitterX = (Math.random() - 0.5) * 100;
            const jitterY = (Math.random() - 0.5) * 100;

            return {
                ...n,
                x: anchor.x + jitterX,
                y: anchor.y + jitterY,
                // Store anchor for custom force
                anchorX: anchor.x,
                anchorY: anchor.y
            };
        });
        
        const simLinks = edges.map(e => ({
            source: e.source,
            target: e.target
        }));

        // 2. Simulation - Semantic Foci Layout
        const simulation = forceSimulation(simNodes as any)
            .force("link", forceLink(simLinks).id((d: any) => d.id).distance(100).strength(0.1)) // Very weak links to allow clustering
            .force("charge", forceManyBody().strength(-200)) // Repel to prevent overlap
            .force("collide", forceCollide((d: any) => {
                // Dynamic collision radius based on importance
                const importance = (d.data.importance as number) || 0.5;
                return 30 + importance * 10; 
            }))
            // Strong pull towards Type Anchor (Foci)
            .force("x", forceX((d: any) => d.anchorX).strength(0.8)) 
            .force("y", forceY((d: any) => d.anchorY).strength(0.8))
            .stop();

        // Run simulation with more ticks for stability
        simulation.tick(300);
        
        // 3. Post-Processing: Generate Zone Nodes (Islands)
        const zoneNodes: Node[] = types.map(typeId => {
            const typeNodes = simNodes.filter(n => n.data.objectTypeId === typeId);
            if (typeNodes.length === 0) return null;

            const xs = typeNodes.map(n => n.x);
            const ys = typeNodes.map(n => n.y);
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minY = Math.min(...ys);
            const maxY = Math.max(...ys);
            
            const padding = 60; // Slightly tighter padding

            // Determine color based on typeId
            let color = '#cbd5e1';
            if (typeId.includes('order')) color = GraphTheme.colors.types.type2;
            else if (typeId.includes('customer')) color = GraphTheme.colors.types.type1;
            else if (typeId.includes('product')) color = GraphTheme.colors.types.type3;
            else if (typeId.includes('payment')) color = '#8b5cf6';
            else if (typeId.includes('logistics')) color = '#f97316';

            return {
                id: `zone-${typeId}`,
                type: 'mesh-zone',
                position: { x: minX - padding, y: minY - padding },
                data: {
                    label: typeId.replace('type_', '').toUpperCase(),
                    color: color,
                    width: (maxX - minX) + padding * 2,
                    height: (maxY - minY) + padding * 2,
                },
                draggable: false,
                selectable: false,
                zIndex: -10,
            };
        }).filter(z => z !== null) as Node[];

        
        const layoutedNodes = simNodes.map((n, i) => ({
            ...n,
            position: {
                x: n.x,
                y: n.y
            }
        }));
        
        resolve([...zoneNodes, ...layoutedNodes]);
    });
}

export function applyMacroLayout(nodes: Node[], edges: Edge[]): Node[] {
  // 1. Separate Top-Level Nodes (Objects & Groups) and Child Nodes (Instances)
  const topLevelNodes = nodes.filter(n => !n.parentId);
  const childNodes = nodes.filter(n => n.parentId);
  
  // 2. Layout Top-Level Nodes in a Circle
  // Assuming a canvas center.
  const centerX = 600;
  const centerY = 400;
  const radius = 500; // Increased radius for larger groups
  const count = topLevelNodes.length;
  
  // Sort topLevelNodes by ID to be deterministic
  topLevelNodes.sort((a, b) => a.id.localeCompare(b.id));
  
  topLevelNodes.forEach((node, index) => {
    const angle = (index / count) * 2 * Math.PI;
    
    // Adjust position based on node size to center it
    const isGroup = node.type === 'macro-group';
    const width = isGroup ? GraphTheme.sizes.macro.groupMin : GraphTheme.sizes.macro.objectBase;
    const height = isGroup ? GraphTheme.sizes.macro.groupMin : GraphTheme.sizes.macro.objectBase;
    
    node.position = {
      x: centerX + radius * Math.cos(angle) - width / 2,
      y: centerY + radius * Math.sin(angle) - height / 2,
    };
    
    // If it's a group, layout its children
    if (isGroup) {
        const children = childNodes.filter(c => c.parentId === node.id);
        layoutGroupChildren(children, width, height);
    }
  });
  
  return [...topLevelNodes, ...childNodes];
}

function layoutGroupChildren(nodes: Node[], containerWidth: number, containerHeight: number) {
    // Spiral layout inside the group
    // Center of the container
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2 + 20; // Offset for header
    
    // Phyllotaxis spiral
    // r = c * sqrt(n)
    // theta = n * 137.5 degrees
    const c = 45; // Increased scaling factor for larger nodes
    
    nodes.forEach((node, i) => {
        const r = c * Math.sqrt(i + 1);
        const theta = i * 2.4; // approx 137.5 degrees in radians
        
        node.position = {
            x: centerX + r * Math.cos(theta) - (GraphTheme.sizes.macro.instance / 2),
            y: centerY + r * Math.sin(theta) - (GraphTheme.sizes.macro.instance / 2),
        };
    });
}
