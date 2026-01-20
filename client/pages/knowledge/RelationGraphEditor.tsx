import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  Handle,
  Position,
  NodeProps,
  EdgeProps,
  getBezierPath,
  BaseEdge,
  EdgeLabelRenderer,
  OnConnect
} from 'reactflow';
import 'reactflow/dist/style.css';
import { KnowledgeRelation, RelationDirection } from '../../types/knowledge';
import { Button } from "@/components/ui/button";
import { Plus, X, Settings, ArrowRightLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useKnowledge } from '../../contexts/KnowledgeContext';
import { Badge } from "@/components/ui/badge";

// --- Custom Node Types ---

const SourceNode = ({ data }: NodeProps) => {
  return (
    <div className="w-40 h-40 rounded-full bg-blue-50 border-4 border-blue-500 flex flex-col items-center justify-center shadow-xl relative z-10">
      <div className="font-bold text-blue-900 text-lg">{data.label}</div>
      <div className="text-xs text-blue-600 font-mono mt-1 bg-blue-100 px-2 py-0.5 rounded">{data.id}</div>
      <div className="absolute -bottom-8 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">当前对象类型</div>
      <Handle type="source" position={Position.Right} className="w-4 h-4 bg-blue-500 border-2 border-white" />
      <Handle type="target" position={Position.Left} className="w-4 h-4 bg-blue-500 border-2 border-white" />
    </div>
  );
};

const TargetNode = ({ data, id }: NodeProps) => {
  return (
    <div className="min-w-[160px] px-5 py-4 rounded-lg bg-white border-2 border-slate-200 shadow-md flex flex-col items-center justify-center group hover:border-indigo-400 transition-all relative">
       {/* Delete Button */}
       {!data.readOnly && (
         <button 
          className="absolute -top-3 -right-3 bg-white border border-slate-200 rounded-full p-1.5 text-slate-400 hover:text-red-500 hover:border-red-200 shadow-sm opacity-0 group-hover:opacity-100 transition-all z-20"
          onClick={(e) => {
            e.stopPropagation();
            data.onDelete?.(id);
          }}
          title="删除"
        >
          <X className="w-3 h-3" />
        </button>
       )}

      <div className="font-bold text-slate-800 text-base">{data.label || 'Unknown Type'}</div>
      <div className="text-xs text-slate-500 mt-1 bg-slate-100 px-2 py-0.5 rounded">对象类型</div>
      
      {/* Visual Indicator for connection status if needed */}
      {data.isTemp && (
        <div className="absolute -bottom-6 text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
          待连接配置
        </div>
      )}

      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-slate-300 group-hover:bg-indigo-400 transition-colors" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-slate-300 group-hover:bg-indigo-400 transition-colors" />
    </div>
  );
};

const nodeTypes = {
  source: SourceNode,
  target: TargetNode,
};

// --- Custom Edge with Label & Actions ---

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
            zIndex: 10,
          }}
          className="nodrag nopan"
        >
          <div 
            className={`flex flex-col items-center gap-1 group ${!data.readOnly ? 'cursor-pointer' : ''}`}
            onClick={() => !data.readOnly && data?.onEdit?.(data.index)}
          >
            <div className={`bg-white border px-3 py-1.5 rounded-md shadow-sm font-mono text-xs font-bold transition-all flex items-center gap-2 ${!data.readOnly ? 'border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-md hover:scale-105' : 'border-slate-200 text-slate-600'}`}>
              {data.direction === 'IN' && <ArrowRightLeft className="w-3 h-3 rotate-180" />}
              {data?.label || 'RELATION'}
              {data.direction === 'OUT' && <ArrowRightLeft className="w-3 h-3" />}
            </div>
             {!data.readOnly && (
               <div className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                点击配置关系
              </div>
             )}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

const edgeTypes = {
  custom: CustomEdge,
};

// --- Main Component ---

interface RelationGraphEditorProps {
  currentId: string;
  currentName: string;
  relations: KnowledgeRelation[];
  onChange?: (newRelations: KnowledgeRelation[]) => void;
  readOnly?: boolean;
}

const RelationGraphEditor: React.FC<RelationGraphEditorProps> = ({
  currentId,
  currentName,
  relations,
  onChange,
  readOnly = false
}) => {
  const { nodes: allSystemNodes } = useKnowledge();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Local state for unconnected candidate nodes
  const [tempNodes, setTempNodes] = useState<Node[]>([]);
  
  // Dialog States
  const [editingRelIndex, setEditingRelIndex] = useState<number | null>(null); // Index in relations array, or -1 for new
  // Removed isAddNodeOpen and selectedNodeTypeToAdd as we use unified modal now
  
  // Form State
  const [editForm, setEditForm] = useState<Partial<KnowledgeRelation>>({
    direction: 'OUT',
    semanticName: ''
  });

  // --- Graph Initialization ---
  useEffect(() => {
    // 1. Source Node (Center)
    const sourceNode: Node = {
      id: 'source',
      type: 'source',
      position: { x: 0, y: 0 },
      data: { id: currentId, label: currentName },
      draggable: false, 
    };

    // 2. Target Nodes & Edges from Relations
    const relationNodes: Node[] = [];
    const relationEdges: Edge[] = [];

    relations.forEach((rel, index) => {
      // Calculate position in a circle
      const angle = (index / Math.max(1, relations.length)) * 2 * Math.PI;
      const radius = 350;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      const nodeId = `target-${index}`;
      const targetNodeLabel = allSystemNodes.find(n => n.id === rel.targetNodeType)?.name || rel.targetNodeType;
      
      relationNodes.push({
        id: nodeId,
        type: 'target',
        position: { x, y },
        data: { 
          label: targetNodeLabel, 
          onDelete: () => handleDeleteRelation(index),
          readOnly: readOnly,
          isTemp: false
        },
      });

      relationEdges.push({
        id: `edge-${index}`,
        source: 'source',
        target: nodeId,
        type: 'custom',
        data: { 
          label: rel.semanticName, 
          direction: rel.direction,
          index: index,
          onEdit: (idx: number) => handleEditRelation(idx),
          readOnly: readOnly
        },
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: readOnly ? '#94a3b8' : '#6366f1', strokeWidth: 2 },
      });
    });

    // 3. Combine with Temp Nodes
    // We removed explicit temp node adding via button, but we keep tempNodes state 
    // in case we need it for drag-connect in future or if logic changes. 
    // However, for now, tempNodes will likely be empty.
    const finalNodes = [sourceNode, ...relationNodes, ...tempNodes];
    
    setNodes(finalNodes);
    setEdges(relationEdges);
  }, [relations, currentId, currentName, readOnly, tempNodes, allSystemNodes]);

  // --- Handlers ---

  const handleEditRelation = (index: number) => {
    if (readOnly) return;
    setEditingRelIndex(index);
    setEditForm({ ...relations[index] });
  };

  const handleDeleteRelation = (index: number) => {
    if (readOnly) return;
    const newRels = [...relations];
    newRels.splice(index, 1);
    onChange?.(newRels);
  };

  const handleSaveEdit = () => {
    if (editingRelIndex === null || !editForm.semanticName || !editForm.targetNodeType) return;
    
    // Validate: Uppercase + Underscore
    const semanticName = editForm.semanticName.toUpperCase().replace(/\s+/g, '_');
    
    const newRel: KnowledgeRelation = {
      semanticName,
      targetNodeType: editForm.targetNodeType,
      direction: editForm.direction || 'OUT',
      sourceAction: editForm.sourceAction,
      isMutable: false // Default
    };

    const newRels = [...relations];
    
    if (editingRelIndex === -1) {
      // New Relation
      newRels.push(newRel);
      
      // If we created a relation to a temp node, remove that temp node
      setTempNodes(prev => prev.filter(n => n.data.targetTypeId !== newRel.targetNodeType));
    } else {
      // Update Existing
      newRels[editingRelIndex] = newRel;
    }
    
    onChange?.(newRels);
    setEditingRelIndex(null);
    setEditForm({ direction: 'OUT', semanticName: '' });
  };

  // Open Unified Modal for New Relation
  const handleAddRelation = () => {
    setEditingRelIndex(-1);
    setEditForm({
        direction: 'OUT',
        semanticName: '',
        targetNodeType: '' // Empty, user must select
    });
  };


  // Handle Connection -> Open Modal
  const onConnect: OnConnect = useCallback((params) => {
    if (readOnly) return;
    
    const targetNode = nodes.find(n => n.id === params.target);
    if (!targetNode) return;

    // Identify target type
    // If it's a temp node, the ID is in data.targetTypeId
    // If it's an existing relation node (target-X), the ID is in relations[X].targetNodeType
    let targetTypeId = targetNode.data.targetTypeId;
    
    if (!targetTypeId && targetNode.id.startsWith('target-')) {
       const index = parseInt(targetNode.id.split('-')[1]);
       if (!isNaN(index) && relations[index]) {
         targetTypeId = relations[index].targetNodeType;
       }
    }

    if (targetTypeId) {
      setEditForm({
        targetNodeType: targetTypeId,
        direction: 'OUT',
        semanticName: '',
      });
      setEditingRelIndex(-1); // Mark as new
    }
  }, [nodes, relations, readOnly]);

  // Handle Semantic Name Input
  const handleSemanticChange = (val: string) => {
    // Force Uppercase and Underscore
    const formatted = val.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    setEditForm({...editForm, semanticName: formatted});
  };

  return (
    <div className="w-full h-[600px] bg-slate-50 relative border rounded-xl overflow-hidden group">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <Background color="#e2e8f0" gap={20} />
        <Controls />
      </ReactFlow>

      {/* Floating Toolbar */}
      {!readOnly && (
        <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-md border border-slate-200">
          <Button onClick={handleAddRelation} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> 添加对象类型关系
          </Button>
        </div>
      )}

      {/* Configure Relation Dialog */}
      <Dialog open={editingRelIndex !== null} onOpenChange={(open) => !open && setEditingRelIndex(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingRelIndex === -1 ? '添加对象类型关系' : '配置对象类型关系'}</DialogTitle>
            <DialogDescription>
              {editingRelIndex === -1 ? '添加并配置新的对象类型关系。' : <span>定义 <b>{currentName}</b> 与目标对象类型之间的概念关系。</span>}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            
            {/* 1. Source & Target Types */}
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label>当前对象类型</Label>
                 <div className="h-10 px-3 py-2 rounded-md border border-slate-200 bg-slate-50 text-slate-500 text-sm font-medium flex items-center justify-between cursor-not-allowed">
                   {currentName}
                   <Badge variant="secondary" className="text-[10px]">Current</Badge>
                 </div>
                 <p className="text-[10px] text-slate-400">该关系从此对象类型出发</p>
               </div>
               
               <div className="space-y-2">
                 <Label>目标对象类型 <span className="text-red-500">*</span></Label>
                 <Select 
                    value={editForm.targetNodeType} 
                    onValueChange={(val) => setEditForm({...editForm, targetNodeType: val})}
                    disabled={editingRelIndex !== -1 && !!editForm.targetNodeType} // Only editable if new or previously unset
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="选择目标类型" />
                    </SelectTrigger>
                    <SelectContent>
                      {allSystemNodes.filter(n => n.id !== currentId).map(node => (
                        <SelectItem key={node.id} value={node.id}>{node.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
               </div>
            </div>

            {/* 2. Relation Semantic Name */}
            <div className="space-y-2">
              <Label>关系语义名称 (Relation Semantic) <span className="text-red-500">*</span></Label>
              <Input 
                value={editForm.semanticName || ''} 
                onChange={(e) => handleSemanticChange(e.target.value)}
                className="font-mono bg-indigo-50/50 border-indigo-200 focus-visible:ring-indigo-500 text-indigo-700 font-bold uppercase" 
                placeholder="例如：PLACED_BY / CONTAINS / FULFILLED_BY"
              />
              <p className="text-[11px] text-slate-500">
                必须为大写字母加下划线格式。用于图谱连线展示和 AI 理解对象关系。
              </p>
            </div>

            {/* 3. Direction & Action */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>关系方向</Label>
                <Select 
                  value={editForm.direction} 
                  onValueChange={(val: any) => setEditForm({...editForm, direction: val})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OUT">
                      <div className="flex items-center gap-2">
                        <ArrowRightLeft className="w-3 h-3" /> 
                        <span>从当前对象 → 目标对象</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="IN">
                      <div className="flex items-center gap-2">
                        <ArrowRightLeft className="w-3 h-3 rotate-180" /> 
                        <span>从目标对象 → 当前对象</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>来源动作 (可选)</Label>
                <Input 
                  value={editForm.sourceAction || ''} 
                  onChange={(e) => setEditForm({...editForm, sourceAction: e.target.value})}
                  placeholder="例如：create_order"
                />
                <p className="text-[10px] text-slate-400">表示该关系通常由哪个业务动作产生，用于后续 AI 推理</p>
              </div>
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRelIndex(null)}>取消</Button>
            <Button onClick={handleSaveEdit} disabled={!editForm.semanticName || !editForm.targetNodeType} className="bg-indigo-600 hover:bg-indigo-700">
              保存关系定义
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RelationGraphEditor;
