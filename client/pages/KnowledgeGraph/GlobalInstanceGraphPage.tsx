
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalGraphCanvas } from './components/global/GlobalGraphCanvas';
import { GlobalControlPanel, GlobalFilterState } from './components/global/GlobalControlPanel';
import { generateGlobalGraphData, GlobalGraphData } from './components/global/GlobalMockData';
import { ChevronRight, Home, RefreshCw } from 'lucide-react';

const GlobalInstanceGraphPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [rawData, setRawData] = useState<GlobalGraphData>({ nodes: [], edges: [] });
    
    // Initial Filter State
    const [filters, setFilters] = useState<GlobalFilterState>({
        objectTypes: ['Customer', 'Order', 'Product', 'Supplier'],
        statuses: ['Active', 'Failed', 'Stuck'],
        activity: '24h'
    });

    // 1. Load Data (Simulate API)
    useEffect(() => {
        setIsLoading(true);
        // Simulate network delay
        setTimeout(() => {
            const data = generateGlobalGraphData(300); // Generate 300 nodes for "Top N" view
            setRawData(data);
            setIsLoading(false);
        }, 800);
    }, []);

    // 2. Filter Data Logic
    const filteredData = useMemo(() => {
        if (!rawData.nodes.length) return { nodes: [], edges: [] };

        const visibleNodeIds = new Set<string>();

        const filteredNodes = rawData.nodes.filter(node => {
            // Always show clusters for now, or filter them too? 
            // Clusters usually summarize content, so maybe keep them if they contain matching types?
            // For simplicity in this mock, keep clusters always visible or check data.
            if (node.type === 'cluster-node') return true;

            const matchesType = filters.objectTypes.includes(node.data.objectType);
            const matchesStatus = filters.statuses.includes(node.data.currentStatus);
            // Activity filter is a bit abstract in mock, but let's assume 'isActiveRecently' maps to '24h'
            const matchesActivity = filters.activity === 'all' || 
                                    (filters.activity === '24h' && node.data.isActiveRecently) ||
                                    (filters.activity === '1h' && node.data.isActiveRecently) || // Mock approximation
                                    (filters.activity === '7d'); // Mock approximation

            const isVisible = matchesType && matchesStatus && matchesActivity;
            if (isVisible) visibleNodeIds.add(node.id);
            return isVisible;
        });

        // Filter edges: both source and target must be visible
        const filteredEdges = rawData.edges.filter(edge => 
            visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
        );

        return { nodes: filteredNodes, edges: filteredEdges };
    }, [rawData, filters]);

    // 3. Handlers
    const handleNodeClick = (nodeId: string) => {
        // Navigate to Focus View via URL param
        // Assuming KnowledgeGraphPage checks for ?focusInstance=...
        navigate(`/knowledge-graph?focusInstance=${nodeId}`);
    };

    const handleClusterClick = (clusterId: string) => {
        // Lazy Load Mock: Expand cluster into nodes
        const timestamp = Date.now();
        const expandedNodes = Array.from({ length: 5 }).map((_, i) => ({
            id: `expanded-${clusterId}-${i}-${timestamp}`,
            label: `Expanded #${i}`,
            type: 'instance-node',
            data: {
                objectType: 'Order', // Mock type
                currentStatus: i % 2 === 0 ? 'Active' : 'Failed',
                isActiveRecently: true,
                weight: 20,
                nodeType: 'instance-node'
            },
            style: {
                r: 20,
                fill: i % 2 === 0 ? '#DCFCE7' : '#FEE2E2',
                stroke: i % 2 === 0 ? '#16A34A' : '#EF4444',
                lineWidth: 2
            }
        }));

        // Link expanded nodes to each other or random neighbors
        const expandedEdges = expandedNodes.map((node, i) => {
             if (i === 0) return null;
             return {
                 id: `edge-${node.id}-${expandedNodes[i-1].id}`,
                 source: node.id,
                 target: expandedNodes[i-1].id,
                 data: { relationType: 'related_to', strength: 1 },
                 style: { lineWidth: 1, stroke: '#CBD5E1' }
             };
        }).filter(Boolean) as any[];

        setRawData(prev => ({
            nodes: prev.nodes.filter(n => n.id !== clusterId).concat(expandedNodes as any),
            edges: prev.edges.concat(expandedEdges)
        }));
    };

    const handleReset = () => {
        setFilters({
            objectTypes: ['Customer', 'Order', 'Product', 'Supplier'],
            statuses: ['Active', 'Failed', 'Stuck'],
            activity: '24h'
        });
        // Optionally reload data
        setIsLoading(true);
        setTimeout(() => {
             const data = generateGlobalGraphData(300);
             setRawData(data);
             setIsLoading(false);
        }, 500);
    };

    return (
        <div className="flex h-[calc(100vh-64px)] w-full bg-slate-50 overflow-hidden flex-col">
            {/* Top Bar: Breadcrumb + Reset */}
            <div className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4 shadow-sm z-20">
                <div className="flex items-center text-sm text-slate-600">
                    <Home className="w-4 h-4 mr-2" />
                    <span className="hover:text-slate-900 cursor-pointer" onClick={() => navigate('/knowledge-graph')}>Knowledge Graph</span>
                    <ChevronRight className="w-4 h-4 mx-2 text-slate-400" />
                    <span className="font-semibold text-slate-900">Global Instance Graph</span>
                </div>
                
                <button 
                    onClick={handleReset}
                    className="flex items-center px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                >
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    Reset View
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Left Control Panel */}
                <GlobalControlPanel 
                    filters={filters} 
                    onFilterChange={setFilters} 
                    className="z-10"
                />

                {/* Graph Canvas */}
                <div className="flex-1 relative bg-slate-50">
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                                <p className="text-slate-500 text-sm">Loading Global Topology...</p>
                            </div>
                        </div>
                    ) : (
                        <GlobalGraphCanvas 
                            data={filteredData} 
                            onNodeClick={handleNodeClick} 
                            onClusterClick={handleClusterClick}
                        />
                    )}
                    
                    {/* Legend Overlay */}
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-3 rounded-lg shadow-sm border border-slate-200 text-xs pointer-events-none">
                        <div className="font-semibold mb-2 text-slate-700">Legend</div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>Active</div>
                            <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>Failed</div>
                            <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div>Stuck</div>
                            <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-slate-400 mr-2"></div>Done</div>
                            <div className="flex items-center"><div className="w-2 h-2 rounded-full border-2 border-dashed border-slate-400 mr-2"></div>Cluster</div>
                            <div className="flex items-center"><div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)] bg-blue-500 mr-2"></div>Recent Activity</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalInstanceGraphPage;
