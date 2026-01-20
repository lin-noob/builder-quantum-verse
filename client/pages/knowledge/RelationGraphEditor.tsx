import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
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
import { Request } from "@/lib/request";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRelIndex, setEditingRelIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<KnowledgeRelation>>({
    direction: "OUT"
  });
  
  // Available Object Types for Target Selection
  const [availableTypes, setAvailableTypes] = useState<{name: string, code: string}[]>([]);

  // Fetch available types when dialog opens
  useEffect(() => {
    if (isDialogOpen && availableTypes.length === 0) {
      const fetchTypes = async () => {
        const request = new Request();
        try {
          const response = await request.request("/quote/api/v1/digital/list", { method: "GET" });
          if (response.status === 200 && response.data.data) {
            const types = response.data.data.map((item: any) => ({
              name: item.objectName,
              code: item.objectCode // Using objectName as display, objectName (or code?) as value. 
                                    // User requirement: "Target Object Type (Required): Dropdown selection from system knowledge object types"
                                    // "Example: Customer, Order..." (Names).
                                    // Relation stores `targetNodeType`. 
                                    // Let's assume we store the Name or Code depending on backend.
                                    // Existing code used `targetNodeType`.
            }));
            setAvailableTypes(types);
          }
        } catch (e) {
          console.error("Failed to fetch types", e);
        }
      };
      fetchTypes();
    }
  }, [isDialogOpen, availableTypes.length]);

  // Initialize Graph
  useEffect(() => {
    // 1. Source Node (Center)
    const sourceNode: Node = {
      id: 'source',
      type: 'source',
      position: { x: 0, y: 0 },
      data: { id: currentId, label: currentName },
      draggable: false, 
    };

    // 2. Target Nodes & Edges
    const targetNodes: Node[] = [];
    const relEdges: Edge[] = [];

    relations.forEach((rel, index) => {
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
    setIsDialogOpen(true);
  };

  const handleAddRelation = () => {
    if (readOnly) return;
    setEditingRelIndex(null);
    setEditForm({
      semanticName: "",
      targetNodeType: "",
      direction: "OUT",
      sourceAction: "",
      isMutable: true
    });
    setIsDialogOpen(true);
  };

  const handleDeleteRelation = (index: number) => {
    if (readOnly) return;
    const newRels = [...relations];
    newRels.splice(index, 1);
    onChange?.(newRels);
  };

  const handleSave = () => {
    if (!editForm.targetNodeType || !editForm.semanticName) {
      // Basic validation
      return; 
    }

    const newRel: KnowledgeRelation = {
      semanticName: editForm.semanticName.toUpperCase(), // Enforce uppercase
      targetNodeType: editForm.targetNodeType,
      direction: editForm.direction || "OUT",
      sourceAction: editForm.sourceAction || "",
      isMutable: editForm.isMutable ?? true
    };

    if (editingRelIndex !== null) {
      // Update existing
      const newRels = [...relations];
      newRels[editingRelIndex] = newRel;
      onChange?.(newRels);
    } else {
      // Add new
      onChange?.([...relations, newRel]);
    }
    setIsDialogOpen(false);
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
            <Plus className="w-4 h-4" /> 添加对象类型关系
          </Button>
        </div>
      )}

      {/* Unified Configuration Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>添加对象类型关系</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* 1. Current Object Type (Read-only) */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-slate-500">当前对象类型</Label>
              <div className="col-span-3 px-3 py-2 bg-slate-100 rounded-md text-sm text-slate-700 font-medium border border-slate-200">
                {currentName}
              </div>
              <div className="col-start-2 col-span-3 text-[10px] text-slate-400 -mt-2">
                该关系将从此对象类型出发
              </div>
            </div>

            {/* 2. Target Object Type (Select) */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">目标对象类型 <span className="text-red-500">*</span></Label>
              <div className="col-span-3">
                <Select 
                  value={editForm.targetNodeType} 
                  onValueChange={(val) => setEditForm({...editForm, targetNodeType: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择目标对象类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTypes.map(t => (
                      <SelectItem key={t.code} value={t.name}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 3. Relation Semantic Name (Input) */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">关系语义 <span className="text-red-500">*</span></Label>
              <div className="col-span-3">
                <Input 
                  value={editForm.semanticName || ''} 
                  onChange={(e) => setEditForm({...editForm, semanticName: e.target.value.toUpperCase()})}
                  className="font-mono uppercase"
                  placeholder="PLACED_BY" 
                />
                <div className="text-[10px] text-slate-400 mt-1">
                  大写英文，下划线分隔。例如：CONTAINS, BELONGS_TO
                </div>
              </div>
            </div>

            {/* 4. Direction (Select) */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">关系方向 <span className="text-red-500">*</span></Label>
              <div className="col-span-3">
                <Select 
                  value={editForm.direction} 
                  onValueChange={(val: any) => setEditForm({...editForm, direction: val})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OUT">从当前对象 → 目标对象</SelectItem>
                    <SelectItem value="IN">从目标对象 → 当前对象</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 5. Source Action (Optional) */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">来源动作</Label>
              <div className="col-span-3">
                <Input 
                  value={editForm.sourceAction || ''} 
                  onChange={(e) => setEditForm({...editForm, sourceAction: e.target.value})}
                  placeholder="create_order" 
                />
                <div className="text-[10px] text-slate-400 mt-1">
                  表示该关系通常由哪个业务动作产生
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>取消</Button>
            <Button onClick={handleSave} disabled={!editForm.targetNodeType || !editForm.semanticName}>
              保存关系
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RelationGraphEditor;