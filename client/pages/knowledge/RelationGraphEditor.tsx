import React, { useCallback, useEffect, useMemo } from 'react';
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
  EdgeLabelRenderer
} from 'reactflow';
import 'reactflow/dist/style.css';
import { KnowledgeRelation, RelationDirection } from '../../types/knowledge';
import { Button } from "@/components/ui/button";
import { Plus, X, Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// --- Custom Node Types ---

const SourceNode = ({ data }: NodeProps) => {
  return (
    <div className="w-40 h-40 rounded-full bg-blue-50 border-2 border-blue-500 flex flex-col items-center justify-center shadow-lg relative">
      <div className="font-bold text-blue-900">{data.label}</div>
      <div className="text-xs text-blue-600 font-mono mt-1">{data.id}</div>
      <div className="absolute -bottom-6 text-xs text-slate-400 font-medium">当前对象</div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500" />
    </div>
  );
};

const TargetNode = ({ data, id }: NodeProps) => {
  return (
    <div className="min-w-[140px] px-4 py-3 rounded-xl bg-white border-2 border-slate-200 shadow-sm flex flex-col items-center justify-center group hover:border-blue-400 transition-colors relative">
       {/* Delete Button */}
       {!data.readOnly && (
         <button 
          className="absolute -top-2 -right-2 bg-white border border-slate-200 rounded-full p-1 text-slate-400 hover:text-red-500 hover:border-red-200 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
          onClick={(e) => {
            e.stopPropagation();
            data.onDelete?.(id);
          }}
        >
          <X className="w-3 h-3" />
        </button>
       )}

      <div className="font-bold text-slate-800">{data.label || 'Unknown Type'}</div>
      <div className="text-xs text-slate-500 font-mono mt-1">Target Type</div>
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-slate-300" />
      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-slate-300" />
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
          }}
          className="nodrag nopan"
        >
          <div 
            className={`flex flex-col items-center gap-1 group ${!data.readOnly ? 'cursor-pointer' : ''}`}
            onClick={() => !data.readOnly && data?.onEdit?.(data.index)}
          >
            <div className={`bg-white border px-2 py-1 rounded shadow-sm font-mono text-xs font-bold transition-colors ${!data.readOnly ? 'border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300' : 'border-slate-200 text-slate-600'}`}>
              {data?.label || 'RELATION'}
            </div>
             {!data.readOnly && (
               <div className="bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                点击编辑
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
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Edit Dialog State
  const [editingRelIndex, setEditingRelIndex] = React.useState<number | null>(null);
  const [editForm, setEditForm] = React.useState<Partial<KnowledgeRelation>>({});

  // Initialize Graph
  useEffect(() => {
    // 1. Source Node (Center)
    const sourceNode: Node = {
      id: 'source',
      type: 'source',
      position: { x: 0, y: 0 },
      data: { id: currentId, label: currentName },
      draggable: false, // Keep center fixed? Or let it move. Let's fix it for now or center it.
    };

    // 2. Target Nodes & Edges
    const targetNodes: Node[] = [];
    const relEdges: Edge[] = [];

    relations.forEach((rel, index) => {
      // Check if target node already exists (for multiple relations to same type)
      // Actually, to make it editable visually, distinct relations should probably have distinct edges.
      // But if we have multiple relations to "Order", do we show "Order" node once or multiple times?
      // For simplicity in this editor, let's create a unique node for each relation instance to allow easy 1-1 mapping.
      // This is "Relation Instance" view.
      
      // Calculate position in a circle
      const angle = (index / relations.length) * 2 * Math.PI;
      const radius = 300;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      const nodeId = `target-${index}`;
      
      targetNodes.push({
        id: nodeId,
        type: 'target',
        position: { x, y },
        data: { 
          label: rel.targetNodeType, 
          onDelete: () => handleDeleteRelation(index),
          readOnly: readOnly
        },
      });

      relEdges.push({
        id: `edge-${index}`,
        source: 'source',
        target: nodeId,
        type: 'custom',
        data: { 
          label: rel.semanticName, 
          index: index,
          onEdit: (idx: number) => handleEditRelation(idx),
          readOnly: readOnly
        },
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: readOnly ? '#94a3b8' : '#6366f1', strokeWidth: 2 },
      });
    });

    setNodes([sourceNode, ...targetNodes]);
    setEdges(relEdges);
  }, [relations, currentId, currentName, readOnly]);

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
    if (editingRelIndex !== null && editForm && !readOnly) {
      const newRels = [...relations];
      newRels[editingRelIndex] = editForm as KnowledgeRelation;
      onChange?.(newRels);
      setEditingRelIndex(null);
    }
  };

  const handleAddRelation = () => {
    if (readOnly) return;
    const newRel: KnowledgeRelation = {
      semanticName: "NEW_RELATION",
      targetNodeType: "NewType",
      direction: "OUT",
      isMutable: false
    };
    onChange?.([...relations, newRel]);
  };

  return (
    <div className="w-full h-[600px] bg-slate-50 relative border rounded-xl overflow-hidden group">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>

      {/* Floating Toolbar */}
      {!readOnly && (
        <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-md border border-slate-200">
          <Button onClick={handleAddRelation} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Plus className="w-4 h-4" /> 添加关系节点
          </Button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editingRelIndex !== null} onOpenChange={(open) => !open && setEditingRelIndex(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>配置关系</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">语义名称</Label>
              <Input 
                value={editForm.semanticName || ''} 
                onChange={(e) => setEditForm({...editForm, semanticName: e.target.value})}
                className="col-span-3 font-mono" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">目标类型</Label>
              <Input 
                value={editForm.targetNodeType || ''} 
                onChange={(e) => setEditForm({...editForm, targetNodeType: e.target.value})}
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">方向</Label>
              <Select 
                value={editForm.direction} 
                onValueChange={(val: any) => setEditForm({...editForm, direction: val})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OUT">OUT (指向目标)</SelectItem>
                  <SelectItem value="IN">IN (来自目标)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">可变性</Label>
              <Select 
                value={editForm.isMutable ? "yes" : "no"} 
                onValueChange={(val) => setEditForm({...editForm, isMutable: val === "yes"})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">可变</SelectItem>
                  <SelectItem value="no">不可变</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">来源动作</Label>
              <Input 
                value={editForm.sourceAction || ''} 
                onChange={(e) => setEditForm({...editForm, sourceAction: e.target.value})}
                className="col-span-3" 
                placeholder="例如: create_order"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRelIndex(null)}>取消</Button>
            <Button onClick={handleSaveEdit}>保存更改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RelationGraphEditor;
