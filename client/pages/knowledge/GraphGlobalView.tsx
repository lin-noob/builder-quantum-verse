import React, { useState, useEffect, useCallback } from 'react';
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
  MiniMap
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  AlertTriangle, 
  Share2,
  Activity,
  Maximize2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useKnowledge } from '../../contexts/KnowledgeContext';
import { KnowledgeNode } from '../../types/knowledge';

// --- Custom Node Component ---
const CustomNode = ({ data }: { data: { label: string; type: string; risk: boolean; frequency: number; impacted?: boolean } }) => {
  const isHighRisk = data.risk;
  // Size based on frequency (simplified)
  const sizeClass = data.frequency > 80 ? 'w-32 h-32' : data.frequency > 50 ? 'w-24 h-24' : 'w-20 h-20';
  
  return (
    <div className={`relative flex items-center justify-center rounded-full border-2 transition-all duration-500
      ${sizeClass}
      ${isHighRisk ? 'border-red-400 bg-red-50 shadow-[0_0_15px_rgba(248,113,113,0.4)]' : 'border-blue-400 bg-blue-50 shadow-md'}
      hover:scale-110 hover:shadow-lg cursor-pointer
    `}>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
      {data.impacted && (
        <div className="absolute inset-0 rounded-full ring-2 ring-indigo-400 animate-pulse" />
      )}
      
      {isHighRisk && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 animate-pulse">
          <AlertTriangle className="w-3 h-3" />
        </div>
      )}
      
      <div className="text-center p-2">
        <div className="font-bold text-gray-800 text-xs md:text-sm truncate max-w-full">{data.label}</div>
        <div className="text-[10px] text-gray-500 uppercase tracking-tighter">{data.type}</div>
      </div>
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const GraphGlobalView: React.FC = () => {
  const navigate = useNavigate();
  const { nodes, loading, getNodeById } = useKnowledge();
  const [showInsights, setShowInsights] = useState(false);
  const [insightText, setInsightText] = useState('');
  const [snapshotOpen, setSnapshotOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [layoutMode, setLayoutMode] = useState<'circular' | 'hierarchical' | 'free'>('circular');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Master' | 'Transaction' | 'Result'>('all');
  const [riskFilter, setRiskFilter] = useState<'all' | 'high'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pathMode, setPathMode] = useState(false);
  const [pathStart, setPathStart] = useState<string | null>(null);
  const [pathEnd, setPathEnd] = useState<string | null>(null);
  const [highlightedEdgeIds, setHighlightedEdgeIds] = useState<Set<string>>(new Set());
  const [impactSource, setImpactSource] = useState<string | null>(null);
  const [impactedNodeIds, setImpactedNodeIds] = useState<Set<string>>(new Set());

  // Transform data to ReactFlow format
  const initialNodes: Node[] = [];
  const initialEdges: Edge[] = [];

  // Simple layout algorithm variants
  if (nodes.length > 0) {
    if (layoutMode === 'circular') {
      const centerX = 400;
      const centerY = 300;
      const radius = 250;
      const centerNode = nodes.find(n => n.id === 'order') || nodes[0];
      const otherNodes = nodes.filter(n => n.id !== centerNode.id);
      initialNodes.push({
        id: centerNode.id,
        type: 'custom',
        position: { x: centerX, y: centerY },
        data: { 
          label: centerNode.name, 
          type: centerNode.type, 
          risk: centerNode.actions.some(a => a.riskLevel === 'High'),
          frequency: centerNode.stats.usageFrequency 
        },
      });
      otherNodes.forEach((node, index) => {
        const angle = (index / Math.max(1, otherNodes.length)) * 2 * Math.PI;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        initialNodes.push({
          id: node.id,
          type: 'custom',
          position: { x, y },
          data: { 
            label: node.name, 
            type: node.type,
            risk: node.actions.some(a => a.riskLevel === 'High'),
            frequency: node.stats.usageFrequency 
          },
        });
      });
    } else if (layoutMode === 'hierarchical') {
      const layers: Record<string, number> = { Master: 0, Transaction: 1, Result: 2 };
      const layerCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0 };
      const positions: Record<string, { x: number; y: number }> = {};
      nodes.forEach(n => { layerCounts[layers[n.type]] += 1; });
      const width = 800;
      const height = 600;
      const layerY = [100, height / 2, height - 150];
      const layerSpacingX = [width / (layerCounts[0] + 1), width / (layerCounts[1] + 1), width / (layerCounts[2] + 1)];
      const layerIndex: Record<number, number> = { 0: 1, 1: 1, 2: 1 };
      nodes.forEach(n => {
        const layer = layers[n.type];
        const x = layerSpacingX[layer] * layerIndex[layer];
        const y = layerY[layer];
        layerIndex[layer] += 1;
        positions[n.id] = { x, y };
      });
      nodes.forEach(n => {
        initialNodes.push({
          id: n.id,
          type: 'custom',
          position: positions[n.id],
          data: {
            label: n.name,
            type: n.type,
            risk: n.actions.some(a => a.riskLevel === 'High'),
            frequency: n.stats.usageFrequency
          }
        });
      });
    } else {
      nodes.forEach((n, i) => {
        initialNodes.push({
          id: n.id,
          type: 'custom',
          position: { x: 120 + (i % 5) * 160, y: 120 + Math.floor(i / 5) * 140 },
          data: {
            label: n.name,
            type: n.type,
            risk: n.actions.some(a => a.riskLevel === 'High'),
            frequency: n.stats.usageFrequency
          }
        });
      });
    }

    // Edges
    nodes.forEach(sourceNode => {
      sourceNode.relations.forEach((rel, idx) => {
        // Find if target exists in our subset
        const targetNode = nodes.find(n => n.id === rel.targetNodeType); // Note: in mock data targetNodeType is ID
        if (targetNode) {
            const isRiskPath = rel.semanticName.includes('FULFILLED_BY') || rel.semanticName.includes('PAID_WITH'); // Mock risk path logic
            
            const freq = sourceNode.stats.usageFrequency;
            const dash = freq > 80 ? '2,2' : freq > 60 ? '4,2' : freq > 40 ? '6,3' : '8,4';
            initialEdges.push({
              id: `e-${sourceNode.id}-${targetNode.id}-${idx}`,
              source: sourceNode.id,
              target: targetNode.id,
              label: rel.semanticName,
              type: 'default',
              animated: true,
              style: { 
                stroke: isRiskPath ? '#ef4444' : '#94a3b8', 
                strokeWidth: isRiskPath ? 2.5 : 2,
                strokeDasharray: dash
              },
              labelStyle: { fill: isRiskPath ? '#ef4444' : '#64748b', fontWeight: 700, fontSize: 10 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: isRiskPath ? '#ef4444' : '#94a3b8',
              },
            });
        }
      });
    });
  }

  const [rfNodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [rfEdges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Typewriter effect for insights
  useEffect(() => {
    if (showInsights) {
      const text = "系统分析检测到订单 (Order) 节点的入度异常高，表明它是关键瓶颈。\n\n建议重点监控 订单 -> 履约 的延迟路径，当前交易量已超出基线 15%。\n\n风险评估：延迟传播的高概率风险。";
      let i = 0;
      setInsightText('');
      const timer = setInterval(() => {
        setInsightText(prev => prev + text.charAt(i));
        i++;
        if (i >= text.length) clearInterval(timer);
      }, 30);
      return () => clearInterval(timer);
    }
  }, [showInsights]);

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    navigate(`/knowledge/explorer/${node.id}`);
  }, [navigate]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    setSelectedEdge(null);
    setSnapshotOpen(true);
    if (pathMode) {
      if (!pathStart) {
        setPathStart(node.id);
      } else if (!pathEnd && node.id !== pathStart) {
        setPathEnd(node.id);
      } else {
        setPathStart(node.id);
        setPathEnd(null);
        setHighlightedEdgeIds(new Set());
      }
    }
  }, [pathMode, pathStart, pathEnd]);

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNodeId(null);
    setSnapshotOpen(true);
  }, []);

  useEffect(() => {
    if (pathStart && pathEnd) {
      const adj: Record<string, string[]> = {};
      nodes.forEach(n => { adj[n.id] = []; });
      nodes.forEach(n => {
        n.relations.forEach(rel => {
          if (rel.direction === 'OUT') {
            adj[n.id].push(rel.targetNodeType);
          }
        });
      });
      const queue: string[] = [pathStart];
      const prev: Record<string, string | null> = {};
      nodes.forEach(n => { prev[n.id] = null; });
      const visited = new Set<string>([pathStart]);
      while (queue.length > 0) {
        const u = queue.shift() as string;
        if (u === pathEnd) break;
        adj[u].forEach(v => {
          if (!visited.has(v)) {
            visited.add(v);
            prev[v] = u;
            queue.push(v);
          }
        });
      }
      const path: string[] = [];
      let cur: string | null = pathEnd;
      while (cur) {
        path.unshift(cur);
        cur = prev[cur];
      }
      const edgeIds = new Set<string>();
      for (let i = 0; i < path.length - 1; i++) {
        const s = path[i];
        const t = path[i + 1];
        rfEdges.forEach(e => {
          if (e.source === s && e.target === t) {
            edgeIds.add(e.id);
          }
        });
      }
      setHighlightedEdgeIds(edgeIds);
    } else {
      setHighlightedEdgeIds(new Set());
    }
  }, [pathStart, pathEnd, nodes, rfEdges]);

  const applyFilters = useCallback(() => {
    const filteredNodes = rfNodes.map(n => {
      const nodeData = getNodeById(n.id);
      const typeOk = typeFilter === 'all' || nodeData?.type === typeFilter;
      const riskOk = riskFilter === 'all' || nodeData?.actions.some(a => a.riskLevel === 'High');
      const searchOk = searchQuery.trim() === '' || (nodeData?.name.includes(searchQuery) || nodeData?.actions.some(a => a.label.includes(searchQuery)) || nodeData?.properties.some(p => p.name.includes(searchQuery)));
      return { ...n, hidden: !(typeOk && riskOk && searchOk) };
    });
    const filteredEdges = rfEdges.map(e => {
      const srcHidden = filteredNodes.find(n => n.id === e.source)?.hidden;
      const tgtHidden = filteredNodes.find(n => n.id === e.target)?.hidden;
      return { ...e, hidden: srcHidden || tgtHidden };
    });
    setNodes(filteredNodes);
    setEdges(filteredEdges);
  }, [rfNodes, rfEdges, typeFilter, riskFilter, searchQuery, getNodeById, setNodes, setEdges]);

  useEffect(() => {
    applyFilters();
  }, [typeFilter, riskFilter, searchQuery]);

  useEffect(() => {
    if (impactSource) {
      const impacted = new Set<string>();
      const queue: string[] = [impactSource];
      const visited = new Set<string>([impactSource]);
      const adj: Record<string, string[]> = {};
      nodes.forEach(n => { adj[n.id] = []; });
      nodes.forEach(n => {
        n.relations.forEach(rel => {
          if (rel.direction === 'OUT') {
            adj[n.id].push(rel.targetNodeType);
          }
        });
      });
      while (queue.length > 0) {
        const u = queue.shift() as string;
        adj[u].forEach(v => {
          if (!visited.has(v)) {
            visited.add(v);
            impacted.add(v);
            queue.push(v);
          }
        });
      }
      setImpactedNodeIds(impacted);
    } else {
      setImpactedNodeIds(new Set());
    }
  }, [impactSource, nodes]);

  useEffect(() => {
    const updatedNodes = rfNodes.map(n => {
      return { ...n, data: { ...(n.data as any), impacted: impactedNodeIds.has(n.id) } };
    });
    setNodes(updatedNodes);
  }, [impactedNodeIds]);

  useEffect(() => {
    const updatedEdges = rfEdges.map(e => {
      const isHighlighted = highlightedEdgeIds.has(e.id);
      const base = e.style || {};
      const style = { ...base, stroke: isHighlighted ? '#3b82f6' : base.stroke, strokeWidth: isHighlighted ? 3 : base.strokeWidth };
      return { ...e, style };
    });
    setEdges(updatedEdges);
  }, [highlightedEdgeIds]);

  useEffect(() => {
    if (showInsights) {
      const set = new Set<string>();
      nodes.forEach(n => {
        const deg = n.stats.inDegree + n.stats.outDegree;
        if (deg === 0 || deg >= 3) {
          set.add(n.id);
        }
      });
      setImpactedNodeIds(set);
    } else {
      setImpactedNodeIds(new Set());
    }
  }, [showInsights, nodes]);
  if (loading) return <div className="h-full w-full flex items-center justify-center bg-gray-50 text-slate-400">正在加载图谱...</div>;

  return (
    <div className="h-full w-full bg-gray-50 relative overflow-hidden rounded-xl border border-slate-200 shadow-sm">
      
      {/* Top Bar - Simplified for Embedded View */}
      <div className="absolute top-4 right-4 z-10 pointer-events-auto flex gap-2">
           <button 
             onClick={() => setShowInsights(!showInsights)}
             className="flex items-center gap-2 px-3 py-1.5 bg-white text-indigo-600 border border-indigo-100 rounded-lg shadow-sm hover:bg-indigo-50 transition-all text-xs font-medium"
           >
             <Sparkles className="w-3.5 h-3.5" />
             AI 洞察
           </button>
      </div>
      <div className="absolute top-4 left-4 z-10 pointer-events-auto flex items-center gap-2 bg-white/80 backdrop-blur-sm p-2 rounded-lg border border-slate-200">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} className="text-xs px-2 py-1 border rounded">
          <option value="all">全部类型</option>
          <option value="Master">Master</option>
          <option value="Transaction">Transaction</option>
          <option value="Result">Result</option>
        </select>
        <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value as any)} className="text-xs px-2 py-1 border rounded">
          <option value="all">全部风险</option>
          <option value="high">仅高风险</option>
        </select>
        <select value={layoutMode} onChange={(e) => setLayoutMode(e.target.value as any)} className="text-xs px-2 py-1 border rounded">
          <option value="circular">环形布局</option>
          <option value="hierarchical">层次布局</option>
          <option value="free">自由布局</option>
        </select>
        <input placeholder="自然语言搜索…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="text-xs px-2 py-1 border rounded w-40" />
        <button onClick={() => setPathMode(!pathMode)} className={`text-xs px-2 py-1 rounded border ${pathMode ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-slate-700'}`}>路径模式</button>
        <button onClick={() => setImpactSource(selectedNodeId)} className="text-xs px-2 py-1 rounded border bg-white">影响面</button>
      </div>

      {/* Graph Area */}
      <ReactFlowProvider>
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDoubleClick={onNodeDoubleClick}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          className="bg-slate-50"
        >
          <Background color="#cbd5e1" gap={20} size={1} />
          <Controls className="bg-white shadow-lg border-gray-200 rounded-lg overflow-hidden m-2" />
          <MiniMap pannable zoomable className="bg-white/80 border border-slate-200 rounded-md m-2" />
        </ReactFlow>
      </ReactFlowProvider>

      {/* AI Insights Drawer */}
      <AnimatePresence>
        {showInsights && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 h-full w-80 bg-white shadow-xl z-20 border-l border-gray-200 flex flex-col"
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                AI 分析
              </div>
              <button 
                onClick={() => setShowInsights(false)}
                className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto bg-gray-50/50">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <Activity className="w-3 h-3" />
                  实时洞察
                </div>
                <p className="text-gray-800 leading-relaxed font-mono text-xs whitespace-pre-wrap">
                  {insightText}
                  <span className="inline-block w-1.5 h-3 bg-indigo-500 ml-1 animate-pulse align-middle"></span>
                </p>
              </div>

              <div className="mt-4 space-y-2">
                <h4 className="text-xs font-bold text-gray-900">推荐行动</h4>
                
                <div className="p-2 bg-white border border-gray-200 rounded-lg flex gap-2 hover:border-indigo-300 transition-colors cursor-pointer group">
                  <div className="mt-0.5 p-1 bg-indigo-50 text-indigo-600 rounded">
                    <Maximize2 className="w-3 h-3" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-900 group-hover:text-indigo-700">优化订单 Schema</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">为 'status' 字段添加索引</div>
                  </div>
                </div>

                <div className="p-2 bg-white border border-gray-200 rounded-lg flex gap-2 hover:border-red-300 transition-colors cursor-pointer group">
                   <div className="mt-0.5 p-1 bg-red-50 text-red-600 rounded">
                    <AlertTriangle className="w-3 h-3" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-900 group-hover:text-red-700">审查风险规则</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">支付同步失败率较高</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {snapshotOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 h-full w-96 bg-white shadow-xl z-20 border-l border-gray-200 flex flex-col"
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="text-sm font-bold text-slate-800">对象快照</div>
              <button onClick={() => setSnapshotOpen(false)} className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto bg-gray-50/50">
              {selectedNodeId && (() => {
                const node = getNodeById(selectedNodeId) as KnowledgeNode;
                const coreProps = node.properties.slice(0, 3);
                const coreActions = node.actions.slice(0, 2);
                const relCount = node.relations.length;
                return (
                  <div className="space-y-4">
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-xs text-slate-500 mb-1">对象</div>
                      <div className="text-sm font-bold text-slate-800">{node.name}</div>
                      <div className="text-xs text-slate-500 mt-1">{node.type}</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-xs font-semibold mb-2 text-slate-600">核心属性</div>
                      <div className="space-y-1">
                        {coreProps.map(p => (
                          <div key={p.id} className="flex items-center justify-between text-xs">
                            <span className="text-slate-700">{p.name}</span>
                            <span className="text-slate-400">{p.type}</span>
                          </div>
                        ))}
                        {coreProps.length === 0 && <div className="text-xs text-slate-400">暂无属性</div>}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-xs font-semibold mb-2 text-slate-600">关键动作</div>
                      <div className="space-y-1">
                        {coreActions.map(a => (
                          <div key={a.name} className="flex items-center justify-between text-xs">
                            <span className="text-slate-700">{a.label}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${a.riskLevel === 'High' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>{a.riskLevel}</span>
                          </div>
                        ))}
                        {coreActions.length === 0 && <div className="text-xs text-slate-400">暂无动作</div>}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-xs font-semibold mb-2 text-slate-600">关系摘要</div>
                      <div className="text-xs text-slate-700">连接了 {relCount} 个业务逻辑</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/knowledge/explorer/${node.id}`)} className="text-xs px-2 py-1 border rounded bg-white">进入详情</button>
                      <button onClick={() => setImpactSource(node.id)} className="text-xs px-2 py-1 border rounded bg-white">影响面</button>
                    </div>
                  </div>
                );
              })()}
              {selectedEdge && (() => {
                const s = getNodeById(selectedEdge.source) as KnowledgeNode;
                const t = getNodeById(selectedEdge.target) as KnowledgeNode;
                return (
                  <div className="space-y-4">
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-xs font-semibold mb-2 text-slate-600">关系快照</div>
                      <div className="text-xs text-slate-700">{s?.name} → {t?.name}</div>
                      <div className="text-xs text-slate-500 mt-1">{selectedEdge.label}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setPathMode(true); setPathStart(s.id); setPathEnd(t.id); }} className="text-xs px-2 py-1 border rounded bg-white">路径高亮</button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GraphGlobalView;
