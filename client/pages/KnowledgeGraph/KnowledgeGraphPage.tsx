import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GraphCanvas } from './components/GraphCanvas';
import { GraphSearchBar } from './components/GraphSearchBar';
import { GraphFilterPanel } from './components/GraphFilterPanel';
import { TemporalController } from './components/TemporalController';
import { HistorySidePanel } from './components/HistorySidePanel';
import { GlobalGraphCanvas } from './components/global/GlobalGraphCanvas';
import { GlobalControlPanel, GlobalFilterState } from './components/global/GlobalControlPanel';
import { generateGlobalGraphData, GlobalGraphData } from './components/global/GlobalMockData';
import { MOCK_MACRO_DATA } from './components/MacroTypeNode';
import { getIndexSubgraph } from './components/InstanceIndexSubgraph';
import { getEgoGraph } from './components/FocusEgoGraph';
import { cn } from '@/lib/utils';
import { LayoutGrid, Globe } from 'lucide-react';

// View Modes
export type GraphViewMode = 'macro' | 'global' | 'index' | 'focus';

// Data Types
export interface GraphNode {
  id: string;
  label?: string;
  type: string; // 'type-node' | 'instance-node' | 'cluster-node'
  data?: any;
  style?: any;
}

export interface GraphEdge {
  id?: string;
  source: string;
  target: string;
  label?: string;
  data?: any;
  style?: any;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface FilterState {
    objectType?: string;
    status: string[];
}

const KnowledgeGraphPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<GraphViewMode>('macro');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  
  // New States for Interaction Rules
  const [expandedObjectTypes, setExpandedObjectTypes] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<FilterState | undefined>(undefined);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  
  const [playbackMode, setPlaybackMode] = useState<'lifecycle' | 'failure'>('lifecycle');

  // Global View State
  const [globalFilters, setGlobalFilters] = useState<GlobalFilterState>({
      objectTypes: ['Customer', 'Order', 'Product', 'Supplier'],
      statuses: ['Active', 'Failed', 'Stuck'],
      activity: 'all'
  });
  const [globalRawData, setGlobalRawData] = useState<GlobalGraphData>({ nodes: [], edges: [] });
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);

  // Load Global Data Logic
  useEffect(() => {
      if (viewMode === 'global' && globalRawData.nodes.length === 0) {
          setIsGlobalLoading(true);
          setTimeout(() => {
              const data = generateGlobalGraphData(300);
              setGlobalRawData(data);
              setIsGlobalLoading(false);
          }, 800);
      }
  }, [viewMode]);

  // Filter Global Data
  const globalFilteredData = useMemo(() => {
      if (!globalRawData.nodes.length) return { nodes: [], edges: [] };

      const visibleNodeIds = new Set<string>();

      const filteredNodes = globalRawData.nodes.filter(node => {
          if (node.type === 'cluster-node') return true;

          const matchesType = globalFilters.objectTypes.includes(node.data.objectType);
          const matchesStatus = globalFilters.statuses.includes(node.data.currentStatus);
          const matchesActivity = globalFilters.activity === 'all' || 
                                  (globalFilters.activity === '24h' && node.data.isActiveRecently) ||
                                  (globalFilters.activity === '1h' && node.data.isActiveRecently) || 
                                  (globalFilters.activity === '7d');

          const isVisible = matchesType && matchesStatus && matchesActivity;
          if (isVisible) visibleNodeIds.add(node.id);
          return isVisible;
      });

      const filteredEdges = globalRawData.edges.filter(edge => 
          visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
      );

      return { nodes: filteredNodes, edges: filteredEdges };
  }, [globalRawData, globalFilters]);

  const handleGlobalNodeClick = useCallback((nodeId: string) => {
      setViewMode('focus');
      setSelectedNodeId(nodeId);
      const egoData = getEgoGraph(nodeId);
      setGraphData(egoData as any);
      setIsFilterPanelOpen(false);
  }, []);

  const handleGlobalClusterClick = useCallback((clusterId: string) => {
      // Logic from GlobalInstanceGraphPage
       const timestamp = Date.now();
       const expandedNodes = Array.from({ length: 5 }).map((_, i) => ({
           id: `expanded-${clusterId}-${i}-${timestamp}`,
           label: `Expanded #${i}`,
           type: 'instance-node',
           data: {
               objectType: 'Order', 
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

       setGlobalRawData(prev => ({
           nodes: prev.nodes.filter(n => n.id !== clusterId).concat(expandedNodes as any),
           edges: prev.edges.concat(expandedEdges)
       }));
  }, []);

  // Handlers
  const handleNodeClick = useCallback((nodeId: string, nodeType: string) => {
    console.log('Node clicked:', nodeId, nodeType);
    
    if (nodeType === 'type-node') {
        // --- Macro Node Interaction Rules ---
        
        // Check if already expanded
        if (expandedObjectTypes.includes(nodeId)) {
            // Toggle OFF: Remove from expanded
            const newExpanded = expandedObjectTypes.filter(id => id !== nodeId);
            setExpandedObjectTypes(newExpanded);
            
            // If no more expanded types, switch back to macro view and close filter panel
            if (newExpanded.length === 0) {
                setViewMode('macro');
                setIsFilterPanelOpen(false);
                setActiveFilters(undefined);
            }
            return; 
        }

        // Logic for expansion (Removed FIFO limit)
        let newExpanded = [...expandedObjectTypes];
        // FIFO limit removed as per user request
        newExpanded.push(nodeId);
        
        // Update State
        setExpandedObjectTypes(newExpanded);
        setViewMode('index'); // Conceptual state
        
        // Auto Open Filter & Apply Defaults
        setIsFilterPanelOpen(true);
        setActiveFilters({
            objectType: nodeId,
            status: ['Failed', 'Stuck']
        });

    } else if (nodeType === 'instance-node' || nodeType === 'cluster-node') {
      // --- Instance Node Interaction Rules ---
      
      // Transition to Focus View
      setViewMode('focus');
      setSelectedNodeId(nodeId);
      
      // For Focus View, we might want to show Ego Graph.
      // But user says "Schema / Instance / Graph 视图是同一个画布的不同状态"
      // Ideally we expand the ego graph WITHIN the current canvas.
      // However, the current getEgoGraph implementation returns a separate graph.
      // For now, let's switch data to Ego Graph as per previous logic, 
      // but strictly it should probably be an overlay or merge.
      // Given the strict requirement "Entire system always in same canvas", replacing data is fine as long as container doesn't change.
      const egoData = getEgoGraph(nodeId);
      setGraphData(egoData as any);
      
      // Hide Filter Panel in Focus Mode (usually Focus View has different controls)
      setIsFilterPanelOpen(false); 
    }
  }, [expandedObjectTypes]);

  // Rebuild Graph Data based on state
  const rebuildGraphData = useCallback((expandedTypes: string[]) => {
      // 1. Start with Macro Data (always visible)
      // Highlight expanded nodes via style, and repel unexpanded nodes
      let nodes = MOCK_MACRO_DATA.nodes.map(node => {
          if (expandedTypes.includes(node.id)) {
              return {
                  ...node,
                  type: 'type-group-node',
                  style: {
                      width: 600,
                      height: 600,
                      zIndex: -1
                  },
                  data: {
                      ...node.data,
                      label: node.label.split('\n')[0], // Clean label
                      isExpanded: true,
                      onToggleExpand: (id: string) => handleNodeClick(id, 'type-node'),
                      activeFilters: activeFilters?.objectType === node.id ? activeFilters.status : [],
                      onFilterClick: (filter: string) => {
                          console.log('Quick Filter Clicked:', filter);
                          // Simple toggle logic for demo
                          setActiveFilters(prev => {
                              if (prev?.objectType !== node.id) {
                                  return { objectType: node.id, status: [filter] };
                              }
                              const newStatus = prev.status.includes(filter) 
                                  ? prev.status.filter(s => s !== filter)
                                  : [...prev.status, filter];
                              return { ...prev, status: newStatus };
                          });
                      },
                      onMoreFilters: () => {
                          setIsFilterPanelOpen(true);
                          if (activeFilters?.objectType !== node.id) {
                              setActiveFilters({ objectType: node.id, status: [] });
                          }
                      }
                  }
              };
          } else {
             // Unexpanded nodes: Keep visible, but maybe push them away?
             // We can use G6 layout parameters or just rely on the new nodes pushing them.
             // No transparency change allowed.
             return {
                 ...node,
                 type: 'type-node', // Explicitly set type
                 data: {
                     ...node.data,
                     isExpanded: false
                 }
             };
          }
      });

      let edges = [...MOCK_MACRO_DATA.edges];

      // 2. Merge Expanded Instances
      expandedTypes.forEach(typeId => {
          const subgraph = getIndexSubgraph(typeId);
          
          // Filter out the center node (type node) from subgraph to avoid duplication
          // because it is already in MOCK_MACRO_DATA.
          const instanceNodes = subgraph.nodes
            .filter(n => n.id !== typeId)
            .map(n => ({
                ...n,
                parentId: typeId, // React Flow parentId
                extent: 'parent', // Constrain movement to parent
                data: {
                    ...n.data,
                    parentId: typeId // For GraphCanvas layout logic
                }
            }));
          
          nodes = [...nodes, ...instanceNodes];
          edges = [...edges, ...subgraph.edges];
      });

      return { nodes, edges };
  }, [activeFilters, handleNodeClick]);

  // Initial Load
  useEffect(() => {
    const focusInstanceId = searchParams.get('focusInstance');
    if (focusInstanceId) {
        setViewMode('focus');
        setSelectedNodeId(focusInstanceId);
        const egoData = getEgoGraph(focusInstanceId);
        setGraphData(egoData as any);
        setIsFilterPanelOpen(false);
    } else {
        setGraphData(rebuildGraphData(expandedObjectTypes) as any);
    }
  }, []); // Run once

  // Effect to update graph when expansion changes
  useEffect(() => {
      const newData = rebuildGraphData(expandedObjectTypes);
      setGraphData(newData as any);
  }, [expandedObjectTypes, rebuildGraphData]);



  const handleCanvasDoubleClick = useCallback(() => {
      // --- Global Collapse Interaction Rules ---
      if (expandedObjectTypes.length > 0 || viewMode === 'focus') {
          setExpandedObjectTypes([]);
          setViewMode('macro');
          setSelectedNodeId(null);
          setIsFilterPanelOpen(false);
          // Graph data will update via Effect
      }
  }, [expandedObjectTypes, viewMode]);

  const handleSearch = useCallback((query: string) => {
    if (!query) return;
    setViewMode('focus');
    setSelectedNodeId(query);
    const egoData = getEgoGraph(query);
    setGraphData(egoData as any);
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-slate-50 overflow-hidden relative">
      {/* Header / Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-slate-800">Knowledge Graph</h1>
          <div className="flex gap-2">
             {/* Mode Switcher for World View */}
            <div className="flex bg-slate-100 p-1 rounded-lg mr-4">
                <button
                    onClick={() => {
                        setViewMode('macro');
                        setExpandedObjectTypes([]); // Reset expansions when going back to Macro
                    }}
                    className={cn(
                        "flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                        viewMode === 'macro' || viewMode === 'index' 
                            ? "bg-white text-blue-600 shadow-sm" 
                            : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    <LayoutGrid className="w-4 h-4 mr-2" />
                    Macro View
                </button>
                <button
                    onClick={() => setViewMode('global')}
                    className={cn(
                        "flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                        viewMode === 'global' 
                            ? "bg-white text-blue-600 shadow-sm" 
                            : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    <Globe className="w-4 h-4 mr-2" />
                    Global Mesh
                </button>
            </div>

            <div className="h-6 w-px bg-slate-200 mx-2 self-center" />

             {/* Breadcrumb / Status Indicators */}
            <span className={cn("px-2 py-1 text-xs rounded-full font-medium transition-colors", viewMode === 'index' ? "bg-blue-100 text-blue-700" : "text-slate-400")}>Index View</span>
            <span className={cn("px-2 py-1 text-xs rounded-full font-medium transition-colors", viewMode === 'focus' ? "bg-blue-100 text-blue-700" : "text-slate-400")}>Focus View</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <GraphSearchBar onSearch={handleSearch} />
          {/* Manual Filter Toggle */}
          <button 
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            title="Toggle Filters"
          >
            Filters
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex">
        
        {/* Global Control Panel (Left Side, only in Global Mode) */}
        {viewMode === 'global' && (
            <div className="z-10 h-full flex">
                 <GlobalControlPanel 
                    filters={globalFilters} 
                    onFilterChange={setGlobalFilters} 
                />
            </div>
        )}

        {/* Graph Canvas */}
        <div className="flex-1 relative h-full bg-slate-50">
            {viewMode === 'global' ? (
                 isGlobalLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-slate-500 text-sm">Loading Global Topology...</p>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full">
                        <GlobalGraphCanvas 
                            data={globalFilteredData} 
                            onNodeClick={handleGlobalNodeClick}
                            onClusterClick={handleGlobalClusterClick}
                        />
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
                )
            ) : (
                <GraphCanvas 
                    data={graphData} 
                    viewMode={viewMode as 'macro' | 'index' | 'focus'}
                    onNodeClick={handleNodeClick}
                    onCanvasDoubleClick={handleCanvasDoubleClick}
                    selectedNodeId={selectedNodeId}
                />
            )}
            
            {/* Temporal Controller Overlay (only in Focus View) */}
            {viewMode === 'focus' && (
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-3/4 max-w-2xl z-20">
                <TemporalController 
                    playbackMode={playbackMode}
                    onModeChange={setPlaybackMode}
                />
              </div>
            )}
        </div>

        {/* Right Sidebar Area */}
        <div className="absolute right-0 top-0 h-full z-20 flex pointer-events-none">
            {/* Pointer events none for container, auto for children to allow clicking through empty space if needed, 
                but actually we want the sidebar to be solid. 
                Wait, if it's absolute, it covers the canvas. 
                We should make sure children have pointer-events-auto.
            */}
            
            {/* History Panel (Only in Focus View) */}
            {viewMode === 'focus' && (
               <div className="w-80 h-full pointer-events-auto">
                  <HistorySidePanel 
                    isOpen={true} 
                    onClose={() => {}} 
                    playbackMode={playbackMode}
                  />
               </div>
            )}

            {/* Filter Panel (Auto-opens in Index View) */}
            {isFilterPanelOpen && (viewMode === 'index' || viewMode === 'macro') && (
               <div className="w-80 bg-white border-l border-slate-200 h-full shadow-lg transition-transform pointer-events-auto">
                 <GraphFilterPanel 
                    onClose={() => setIsFilterPanelOpen(false)} 
                    initialFilters={activeFilters}
                 />
               </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraphPage;
