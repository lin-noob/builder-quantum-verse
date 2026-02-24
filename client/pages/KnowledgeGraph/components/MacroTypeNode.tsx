// Defines the visual style and data structure for Macro View Type Nodes
export const getMacroTypeNodeStyle = (data: any) => {
    return {
        type: 'circle',
        style: {
            r: 40,
            fill: '#EFF6FF',
            stroke: '#3B82F6',
            lineWidth: 2,
            cursor: 'pointer',
        },
        labelStyle: {
            fill: '#1E293B',
            fontSize: 14,
            fontWeight: 500,
            position: 'bottom',
        }
    };
};

export const MOCK_MACRO_DATA = {
    nodes: [
        { id: 'Customer', label: 'Customer\n(1.2k)', type: 'circle', data: { nodeType: 'type-node', count: 1200 }, style: { r: 40, fill: '#EFF6FF', stroke: '#3B82F6', lineWidth: 2 } },
        { id: 'Order', label: 'Order\n(8.5k)', type: 'circle', data: { nodeType: 'type-node', count: 8500 }, style: { r: 45, fill: '#EFF6FF', stroke: '#3B82F6', lineWidth: 2 } },
        { id: 'Product', label: 'Product\n(450)', type: 'circle', data: { nodeType: 'type-node', count: 450 }, style: { r: 35, fill: '#EFF6FF', stroke: '#3B82F6', lineWidth: 2 } },
        { id: 'Supplier', label: 'Supplier\n(20)', type: 'circle', data: { nodeType: 'type-node', count: 20 }, style: { r: 30, fill: '#EFF6FF', stroke: '#3B82F6', lineWidth: 2 } },
    ],
    edges: [
        { source: 'Customer', target: 'Order', label: 'places', style: { lineWidth: 2, endArrow: true } },
        { source: 'Order', target: 'Product', label: 'contains', style: { lineWidth: 2, endArrow: true } },
        { source: 'Product', target: 'Supplier', label: 'supplied_by', style: { lineWidth: 1, endArrow: true } },
    ]
};
