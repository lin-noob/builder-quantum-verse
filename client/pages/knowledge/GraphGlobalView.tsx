import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  MarkerType,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Handle,
  Position,
  MiniMap,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search,
  Layout,
  Maximize2,
  Database,
  Share2,
  Zap,
  Box,
  ArrowRight,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useKnowledge } from '../../contexts/KnowledgeContext';
import { KnowledgeNode } from '../../types/knowledge';

// --- Visual Config ---
const TYPE_COLORS = {
  Master: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800' },
  Transaction: { bg: 'bg-purple-50', border: 'border-purple-500', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-800' },
  Result: { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-700', badge: 'bg-green-100 text-green-800' },
  default: { bg: 'bg-slate-50', border: 'border-slate-400', text: 'text-slate-700', badge: 'bg-slate-100 text-slate-800' }
};

// --- Custom Node Component ---
const CustomNode = React.memo(({ data, selected }: { data: any, selected: boolean }) => {
  const style = TYPE_COLORS[data.type as keyof typeof TYPE_COLORS] || TYPE_COLORS.default;
  const isHighRisk = data.hasHighRiskAction;
  
  return (
    <div className={`
      relative flex flex-col items-center justify-center w-32 h-32 rounded-full border-2 transition-all duration-300
      ${style.bg} ${style.border}
      ${selected ? 'ring-4 ring-offset-2 ring-blue-200 scale-110 z-10' : 'shadow-md hover:shadow-lg hover:scale-105'}
      ${isHighRisk ? 'ring-2 ring-red-500 ring-offset-1' : ''}
      ${data.dimmed ? 'opacity-30 grayscale' : 'opacity-100'}
    `}>
      <Handle type="target" position={Position.Top} className="!bg-slate-400" />
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400" />
      
      {isHighRisk && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm animate-pulse">
          Risk
        </div>
      )}
      
      <div className="text-center p-2 flex flex-col items-center gap-1">
        <div className={`font-bold text-sm truncate max-w-[110px] ${style.text}`}>{data.label}</div>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${style.badge}`}>
          {data.type}
        </span>
      </div>
    </div>
  );
});

const nodeTypes = {
  custom: CustomNode,
};

const GraphGlobalView: React.FC = () => {
  const navigate = useNavigate();
  const { nodes, loading, getNodeById } = useKnowledge();
  
  // UI State
  const [layoutMode, setLayoutMode] = useState<'hierarchical' | 'circular'>('hierarchical');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // ReactFlow State
  const [rfNodes, setNodes, onNodesChange] = useNodesState([]);
  const [rfEdges, setEdges, onEdgesChange] = useEdgesState([]);

  // Compute Layout & Elements
  useEffect(() => {
    if (loading || nodes.length === 0) return;

    // 1. Create Nodes
    let newNodes: Node[] = [];
    
    if (layoutMode === 'circular') {
      const centerX = 400;
      const centerY = 300;
      const radius = 300;
      
      // Sort nodes to group by type roughly
      const sortedNodes = [...nodes].sort((a, b) => a.type.localeCompare(b.type));
      
      sortedNodes.forEach((node, index) => {
        const angle = (index / sortedNodes.length) * 2 * Math.PI;
        newNodes.push({
          id: node.id,
          type: 'custom',
          position: {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
          },
          data: { 
            label: node.name, 
            type: node.type,
            hasHighRiskAction: node.actions.some(a => a.riskLevel === 'High'),
            dimmed: false
          },
        });
      });
    } else {
      // Hierarchical Layout (Master -> Transaction -> Result)
      const layers = { Master: 0, Transaction: 1, Result: 2 };
      const groupedNodes: Record<string, KnowledgeNode[]> = { Master: [], Transaction: [], Result: [] };
      
      nodes.forEach(n => {
        const type = n.type as keyof typeof groupedNodes;
        if (groupedNodes[type]) {
          groupedNodes[type].push(n);
        } else {
          // Fallback for unknown types
          if (!groupedNodes['Result']) groupedNodes['Result'] = [];
          groupedNodes['Result'].push(n);
        }
      });

      const startY = 50;
      const layerHeight = 250; // Vertical distance between layers
      const canvasWidth = 1000;

      Object.entries(groupedNodes).forEach(([type, typeNodes]) => {
        const layerIndex = layers[type as keyof typeof layers] || 2;
        const count = typeNodes.length;
        if (count === 0) return;

        const availableWidth = Math.max(canvasWidth, count * 150);
        const spacingX = availableWidth / (count + 1);

        typeNodes.forEach((node, idx) => {
          newNodes.push({
            id: node.id,
            type: 'custom',
            position: {
              x: (idx + 1) * spacingX,
              y: startY + layerIndex * layerHeight
            },
            data: { 
              label: node.name, 
              type: node.type,
              hasHighRiskAction: node.actions.some(a => a.riskLevel === 'High'),
              dimmed: false
            },
          });
        });
      });
    }

    // 2. Create Edges
    const newEdges: Edge[] = [];
    nodes.forEach(sourceNode => {
      sourceNode.relations.forEach((rel, idx) => {
        const targetNode = nodes.find(n => n.id === rel.targetNodeType);
        if (targetNode) {
          newEdges.push({
            id: `${sourceNode.id}-${targetNode.id}-${rel.semanticName}`,
            source: sourceNode.id,
            target: targetNode.id,
            label: rel.semanticName,
            type: 'default', // Using default bezier curve
            markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
            style: { stroke: '#94a3b8', strokeWidth: 1.5 },
            labelStyle: { fill: '#64748b', fontWeight: 600, fontSize: 10 },
            data: { dimmed: false }
          });
        }
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [nodes, loading, layoutMode, setNodes, setEdges]);

  // Handle Search & Highlighting
  useEffect(() => {
    setNodes(nds => nds.map(node => {
      const isMatch = !searchQuery || node.data.label.toLowerCase().includes(searchQuery.toLowerCase());
      
      let isDimmed = !isMatch;
      
      // If a node is selected, override dimming logic to focus on 1-degree connections
      if (selectedNodeId) {
        if (node.id === selectedNodeId) {
          isDimmed = false;
        } else {
          // Check if connected
          const isConnected = rfEdges.some(e => 
            (e.source === selectedNodeId && e.target === node.id) || 
            (e.target === selectedNodeId && e.source === node.id)
          );
          isDimmed = !isConnected;
        }
      } else if (searchQuery) {
        // If searching, dim non-matches
        isDimmed = !isMatch;
      } else {
        // No selection, no search -> show all
        isDimmed = false;
      }

      return {
        ...node,
        data: { ...node.data, dimmed: isDimmed }
      };
    }));

    setEdges(eds => eds.map(edge => {
      let isDimmed = false;
      if (selectedNodeId) {
        isDimmed = edge.source !== selectedNodeId && edge.target !== selectedNodeId;
      } else if (searchQuery) {
         // If searching, dim edges not connected to visible nodes
         // (Simplified: just show all edges if no selection, or could verify source/target visibility)
         const sourceVisible = rfNodes.find(n => n.id === edge.source)?.data.dimmed === false;
         const targetVisible = rfNodes.find(n => n.id === edge.target)?.data.dimmed === false;
         isDimmed = !(sourceVisible && targetVisible);
      }
      
      return {
        ...edge,
        style: { 
          ...edge.style, 
          stroke: isDimmed ? '#e2e8f0' : '#94a3b8',
          opacity: isDimmed ? 0.2 : 1 
        },
        labelStyle: {
          ...edge.labelStyle,
          opacity: isDimmed ? 0.2 : 1
        }
      };
    }));
  }, [searchQuery, selectedNodeId, rfEdges.length, setNodes, setEdges]); // rfEdges.length to trigger when edges are re-created

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const selectedNodeData = useMemo(() => {
    if (!selectedNodeId) return null;
    return getNodeById(selectedNodeId);
  }, [selectedNodeId, getNodeById]);

  if (loading) return <div className="h-full w-full flex items-center justify-center bg-gray-50 text-slate-400">正在加载图谱...</div>;

  return (
    <div className="h-full w-full bg-slate-50 relative overflow-hidden flex">
      
      {/* Main Canvas Area */}
      <div className="flex-1 relative h-full">
        {/* Top Toolbar */}
        <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none flex justify-between">
           <div className="bg-white/90 backdrop-blur shadow-sm border border-slate-200 p-2 rounded-lg pointer-events-auto flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input 
                  placeholder="搜索对象名称..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-100" 
                />
              </div>
              <div className="h-6 w-px bg-slate-200 mx-1"></div>
              <div className="flex bg-slate-100 p-1 rounded-md">
                <button 
                  onClick={() => setLayoutMode('hierarchical')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${layoutMode === 'hierarchical' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  层级布局
                </button>
                <button 
                  onClick={() => setLayoutMode('circular')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${layoutMode === 'circular' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  环形布局
                </button>
              </div>
           </div>
           
           <div className="bg-white/90 backdrop-blur shadow-sm border border-slate-200 px-3 py-2 rounded-lg pointer-events-auto flex items-center gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-100 border border-blue-500"></div>
                <span>Master</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-100 border border-purple-500"></div>
                <span>Transaction</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-green-100 border border-green-500"></div>
                <span>Result</span>
              </div>
              <div className="h-4 w-px bg-slate-200 mx-1"></div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full border-2 border-red-500"></div>
                <span>高风险对象</span>
              </div>
           </div>
        </div>

        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          className="bg-slate-50"
          minZoom={0.1}
          maxZoom={1.5}
        >
          <Background color="#cbd5e1" gap={20} size={1} />
          <Controls className="bg-white shadow-lg border-gray-200 rounded-lg overflow-hidden m-2" />
          <MiniMap 
            pannable 
            zoomable 
            className="bg-white border border-slate-200 rounded-lg shadow-sm m-4 !w-32 !h-32" 
            nodeColor={(node) => {
              const type = node.data.type;
              if (type === 'Master') return '#3b82f6';
              if (type === 'Transaction') return '#a855f7';
              if (type === 'Result') return '#22c55e';
              return '#94a3b8';
            }}
          />
        </ReactFlow>
      </div>

      {/* Right Snapshot Panel */}
      <AnimatePresence>
        {selectedNodeId && selectedNodeData && (
          <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="w-80 h-full bg-white border-l border-slate-200 shadow-xl z-20 flex flex-col"
          >
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
               <div className="flex items-start justify-between">
                 <div>
                   <h3 className="font-bold text-lg text-slate-900">{selectedNodeData.name}</h3>
                   <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                     TYPE_COLORS[selectedNodeData.type as keyof typeof TYPE_COLORS]?.badge || 'bg-slate-100 text-slate-600'
                   }`}>
                     {selectedNodeData.type}
                   </span>
                 </div>
                 <button 
                   onClick={() => setSelectedNodeId(null)}
                   className="text-slate-400 hover:text-slate-600"
                 >
                   <Maximize2 className="w-4 h-4 rotate-45" /> {/* Use as close icon alternative or just standard close */}
                 </button>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
               <div className="space-y-4">
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">概览统计</h4>
                 <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <Database className="w-3.5 h-3.5" />
                        <span className="text-xs">核心属性</span>
                      </div>
                      <div className="text-xl font-bold text-slate-800">{selectedNodeData.properties.length}</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <Share2 className="w-3.5 h-3.5" />
                        <span className="text-xs">关系定义</span>
                      </div>
                      <div className="text-xl font-bold text-slate-800">{selectedNodeData.relations.length}</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 col-span-2">
                      <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <Zap className="w-3.5 h-3.5" />
                        <span className="text-xs">绑定动作</span>
                      </div>
                      <div className="text-xl font-bold text-slate-800">{selectedNodeData.actions.length}</div>
                      {selectedNodeData.actions.some(a => a.riskLevel === 'High') && (
                        <div className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100 flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          存在高风险动作
                        </div>
                      )}
                    </div>
                 </div>
               </div>

               <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">关系摘要</h4>
                  {selectedNodeData.relations.length === 0 ? (
                    <div className="text-sm text-slate-400 italic">暂无关系定义</div>
                  ) : (
                    <div className="space-y-2">
                      {selectedNodeData.relations.slice(0, 5).map((rel, i) => (
                        <div key={i} className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded border border-slate-100">
                           <span className="font-mono text-xs text-blue-600 font-medium">{rel.semanticName}</span>
                           <div className="flex items-center gap-1 text-slate-500 text-xs">
                             <ArrowRight className="w-3 h-3" />
                             <span>{rel.targetNodeType}</span>
                           </div>
                        </div>
                      ))}
                      {selectedNodeData.relations.length > 5 && (
                        <div className="text-xs text-center text-slate-400">
                          还有 {selectedNodeData.relations.length - 5} 条关系...
                        </div>
                      )}
                    </div>
                  )}
               </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50/30">
              <button 
                onClick={() => navigate(`/knowledge/explorer/${selectedNodeId}`)}
                className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-700 py-2.5 rounded-lg transition-all shadow-sm font-medium text-sm"
              >
                <Box className="w-4 h-4" />
                进入对象详情
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GraphGlobalView;
