// Generates the Ego Graph for a specific instance
export const getEgoGraph = (instanceId: string) => {
     // Mocking Ego Graph
     const mainNode = { 
         id: instanceId, 
         label: instanceId, 
         type: 'circle', 
         data: { nodeType: 'instance-node' },
         style: { r: 35, fill: '#3B82F6', stroke: '#1E40AF', lineWidth: 4, cursor: 'default' } 
     };

     const upstream = [
         { id: 'Customer-Bob', label: 'Bob Smith', type: 'circle', data: { nodeType: 'instance-node' }, style: { r: 25, fill: '#A78BFA' } }
     ];

     const downstream = [
         { id: 'Product-X', label: 'Quantum Widget', type: 'circle', data: { nodeType: 'instance-node' }, style: { r: 25, fill: '#FBBF24' } },
         { id: 'Product-Y', label: 'Flux Capacitor', type: 'circle', data: { nodeType: 'instance-node' }, style: { r: 25, fill: '#FBBF24' } }
     ];

     const nodes = [mainNode, ...upstream, ...downstream];
     
     const edges = [
         { source: 'Customer-Bob', target: instanceId, label: 'ordered', style: { endArrow: true } },
         { source: instanceId, target: 'Product-X', label: 'contains', style: { endArrow: true } },
         { source: instanceId, target: 'Product-Y', label: 'contains', style: { endArrow: true } },
     ];

     return { nodes, edges };
};
