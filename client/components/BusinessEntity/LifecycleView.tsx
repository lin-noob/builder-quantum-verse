import React, { useState, useMemo, useRef } from "react";
import { Plus, ArrowRight, GitCommit, Trash2, Scale, Zap, Workflow, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { request } from "@/lib/request";
import { Entity, LifecycleState } from "./types";

const LifecycleView = ({
  entity,
  updateEntity,
  refreshDetail,
}: {
  entity: Entity;
  updateEntity: (e: Entity) => void;
  refreshDetail: (id: string) => Promise<void>;
}) => {
  const [selectedStateId, setSelectedStateId] = useState<number | null>(entity.lifecycle[0]?.id || null);

  const selectedState = useMemo(
    () => entity.lifecycle.find((s) => s.id === selectedStateId),
    [entity.lifecycle, selectedStateId],
  );

  const addState = async () => {
    const payload = {
      description: "",
      mainId: Number(entity.id) || 0,
      stateName: "新状态",
      stateType: 1, // Normal
      systemCode: "NEW_STATE" + new Date().getTime(),
    };

    try {
      await request.post("/quote/api/v1/lifecycle", payload);
      await refreshDetail(entity.id);
    } catch (error) {
      console.error("Failed to create lifecycle state:", error);
    }
  };

  const deleteState = async (id: number) => {
    try {
      await request.delete("/quote/api/v1/lifecycle", { data: { id } });
      await refreshDetail(entity.id);
      if (selectedStateId === id) setSelectedStateId(null);
    } catch (error) {
      console.error("Failed to delete lifecycle state:", error);
    }
  };

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSaveState = async (state: LifecycleState) => {
    const payload = {
      id: state.id,
      description: state.description,
      mainId: state.mainId,
      stateName: state.stateName,
      stateType: state.stateType,
      systemCode: state.systemCode,
    };
    try {
      await request.put("/quote/api/v1/lifecycle", payload);
    } catch (error) {
      console.error("Failed to update lifecycle state:", error);
    }
  };

  const updateState = (id: number, field: keyof LifecycleState, value: any) => {
    const newLifecycle = entity.lifecycle.map((s) => (s.id === id ? { ...s, [field]: value } : s));
    updateEntity({ ...entity, lifecycle: newLifecycle });

    const updatedState = newLifecycle.find((s) => s.id === id);
    if (updatedState) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        handleSaveState(updatedState);
      }, 500);
    }
  };

  // Logic Preview Node
  const LogicPreview = () => (
    <div className="bg-slate-50 border rounded-lg p-4 flex gap-4 items-center overflow-x-auto min-h-[120px]">
      {entity.lifecycle.length === 0 && <div className="text-gray-400 text-sm italic mx-auto">暂无状态流转定义</div>}
      {entity.lifecycle.map((state, idx) => (
        <div key={state.id} className="flex items-center gap-2 shrink-0">
          <div
            className={`
                        px-4 py-2 rounded-lg border text-sm font-medium shadow-sm flex flex-col items-center gap-1
                        ${
                          state.stateType === 0
                            ? "bg-green-50 border-green-200 text-green-700"
                            : state.stateType === 2
                              ? "bg-slate-100 border-slate-300 text-slate-600"
                              : "bg-white border-blue-200 text-blue-700"
                        }
                    `}
          >
            <span>{state.stateName}</span>
            <span className="text-[10px] opacity-70 font-mono">{state.systemCode}</span>
          </div>
          {idx < entity.lifecycle.length - 1 && <ArrowRight className="h-4 w-4 text-slate-300" />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex h-full">
      {/* Left: State Axis (30%) */}
      <div className="w-1/3 border-r bg-gray-50/30 flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-white">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <GitCommit className="h-4 w-4 text-primary" />
            状态轴 (State Axis)
          </h3>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={addState}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="relative pl-4 space-y-0">
            {/* Timeline Line */}
            <div className="absolute left-[23px] top-2 bottom-2 w-px bg-slate-200 -z-10" />

            {entity.lifecycle.map((state, index) => (
              <div key={state.id} className="flex gap-4 !mb-6 relative group">
                <div
                  className={`
                                        w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 bg-white z-10 mt-1 cursor-pointer transition-colors
                                        ${selectedStateId === state.id ? "border-primary text-primary ring-2 ring-primary/20" : "border-slate-300 text-slate-300 hover:border-slate-400"}
                                    `}
                  onClick={() => setSelectedStateId(state.id)}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${selectedStateId === state.id ? "bg-primary" : "bg-transparent"}`}
                  />
                </div>
                <div
                  className={`
                                        flex-1 p-3 rounded-lg border cursor-pointer transition-all
                                        ${selectedStateId === state.id ? "bg-white border-primary shadow-sm" : "bg-white border-slate-200 hover:border-slate-300"}
                                    `}
                  onClick={() => setSelectedStateId(state.id)}
                >
                  <div className="flex justify-between items-start pr-5">
                    <div>
                      <div className="font-medium text-sm text-gray-900">{state.stateName}</div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">{state.systemCode}</div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] h-5 border-0 ${
                        state.stateType === 0
                          ? "bg-green-100 text-green-700"
                          : state.stateType === 2
                            ? "bg-slate-100 text-slate-600"
                            : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {state.stateType === 0 ? "Start" : state.stateType === 2 ? "End" : "Normal"}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteState(state.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}

            {entity.lifecycle.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">点击右上角 + 添加状态</div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right: Detail Configuration (70%) */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        {selectedState ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex gap-4">
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-gray-500">状态名称</Label>
                      <Input
                        value={selectedState.stateName}
                        onChange={(e) => updateState(selectedState.id, "stateName", e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-gray-500">System Code</Label>
                      <Input
                        value={selectedState.systemCode}
                        onChange={(e) => updateState(selectedState.id, "systemCode", e.target.value)}
                        className="h-8 font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-gray-500">状态类型</Label>
                      <Select
                        value={String(selectedState.stateType)}
                        onValueChange={(val) => updateState(selectedState.id, "stateType", Number(val))}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">起始状态 (Start)</SelectItem>
                          <SelectItem value="1">中间状态 (Normal)</SelectItem>
                          <SelectItem value="2">终态 (End)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* 1. Entry Rules */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Scale className="h-4 w-4 text-indigo-600" />
                    准入规则 (Entry Rules)
                  </h4>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    <Plus className="h-3 w-3 mr-1" /> 关联规则
                  </Button>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 min-h-[60px]">
                  {selectedState.entryRules.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedState.entryRules.map((rule, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                        >
                          {rule}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic">无准入限制，任何前置状态均可流转至此</div>
                  )}
                </div>
              </div>

              <Separator />

              {/* 2. Allowed Actions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    允许动作 (Allowed Actions)
                  </h4>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    <Plus className="h-3 w-3 mr-1" /> 关联能力
                  </Button>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 min-h-[60px]">
                  {selectedState.allowedActions.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {selectedState.allowedActions.map((action, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 bg-white px-3 py-2 rounded border border-slate-200 shadow-sm text-sm"
                        >
                          <PlayCircle className="h-3 w-3 text-amber-500" />
                          {action}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic">当前状态下无可用动作</div>
                  )}
                </div>
              </div>

              <Separator />

              {/* 3. Transitions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Workflow className="h-4 w-4 text-blue-500" />
                    流转出口 (Transitions)
                  </h4>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    <Plus className="h-3 w-3 mr-1" /> 添加流转
                  </Button>
                </div>
                <div className="space-y-2">
                  {selectedState.transitions.length > 0 ? (
                    selectedState.transitions.map((trans, i) => {
                      const targetName =
                        entity.lifecycle.find((s) => s.id === trans.targetStateId)?.stateName || "Unknown";
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 shadow-sm"
                        >
                          <div className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">When</div>
                          <div className="font-medium text-sm text-slate-800">{trans.triggerEvent}</div>
                          <ArrowRight className="h-4 w-4 text-slate-300" />
                          <div className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">Goto</div>
                          <div className="font-medium text-sm text-blue-700 bg-blue-50 px-2 py-1 rounded">
                            {targetName}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-400 italic text-center">
                      无流转出口（终态或孤立状态）
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Logic Preview (Bottom) */}
            <div className="p-4 bg-slate-50 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">Logic Preview</span>
                <Badge variant="outline" className="text-[10px] bg-white">
                  Read Only
                </Badge>
              </div>
              <LogicPreview />
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 flex-col gap-3">
            <GitCommit className="h-12 w-12 opacity-20" />
            <p className="text-sm">请选择左侧状态查看详情</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LifecycleView;
