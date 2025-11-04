import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";

import { Plus, Edit, Trash2, CopyPlus, GripVertical, HelpCircle, Search, RefreshCw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { eventRuleService, starterTemplates } from "@/services/eventRuleService";
import { EventRule, NamedEvent, RawEventType, summarizeRule } from "@shared/eventRuleTypes";

const eventLabels: Record<string, string> = {
  Login: "Login",
  Signup: "Signup",
  OrderSuccess: "OrderSuccess",
};

const rawTypeLabels: Record<RawEventType, string> = {
  click: "点击",
  form_submit: "表单提交",
  pageview: "页面浏览",
  custom: "自定义",
};

const RulesPage = () => {
  const [rules, setRules] = useState<EventRule[]>([]);
  const [openEditor, setOpenEditor] = useState(false);
  const [editingRule, setEditingRule] = useState<EventRule | null>(null);
  const [customEvents, setCustomEvents] = useState<string[]>([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEventName, setNewEventName] = useState("");
  const [showInlineAddEvent, setShowInlineAddEvent] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);
  const [draggedRule, setDraggedRule] = useState<string | null>(null);
  
  // 筛选相关状态
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const reload = () => setRules(eventRuleService.list());

  useEffect(() => {
    reload();
    // 确保有多个模拟规则数据
    const existing = eventRuleService.list();
    if (existing.length === 0) {
      // 创建多个模拟规则
      const mockRules = [
        {
          name: "用户登录规则",
          targetEvent: "Login" as NamedEvent,
          scope: { type: "prefix" as const, value: "/" },
          conditions: {
            eventType: "click" as const,
            text: { aliases: ["登录", "Sign in", "Log in"], matchMode: "contains" as const }
          },
          enabled: true,
          priority: 100,
          dedup: { windowSeconds: 5, oncePerSession: false },
        },
        {
          name: "用户注册规则",
          targetEvent: "Signup" as NamedEvent,
          scope: { type: "prefix" as const, value: "/" },
          conditions: {
            eventType: "click" as const,
            text: { aliases: ["注册", "Sign up", "Register"], matchMode: "contains" as const }
          },
          enabled: true,
          priority: 90,
          dedup: { windowSeconds: 10, oncePerSession: true },
        },
        {
          name: "订单成功规则",
          targetEvent: "OrderSuccess" as NamedEvent,
          scope: { type: "prefix" as const, value: "/order" },
          conditions: {
            eventType: "pageview" as const,
            text: { aliases: ["成功", "Success", "Complete"], matchMode: "contains" as const }
          },
          enabled: true,
          priority: 80,
          dedup: { windowSeconds: 30, oncePerSession: false },
        },
        {
          name: "购物车添加规则",
          targetEvent: "OrderSuccess" as NamedEvent,
          scope: { type: "prefix" as const, value: "/cart" },
          conditions: {
            eventType: "click" as const,
            text: { aliases: ["添加", "Add to cart", "加入购物车"], matchMode: "contains" as const }
          },
          enabled: false,
          priority: 70,
          dedup: { windowSeconds: 3, oncePerSession: false },
        },
        {
          name: "表单提交规则",
          targetEvent: "Login" as NamedEvent,
          scope: { type: "regex" as const, value: ".*\\/form.*" },
          conditions: {
            eventType: "form_submit" as const,
            text: { aliases: ["提交", "Submit", "Send"], matchMode: "contains" as const }
          },
          enabled: true,
          priority: 60,
          dedup: { windowSeconds: 15, oncePerSession: true },
        }
      ];
      
      mockRules.forEach(rule => {
        eventRuleService.create(rule as any);
      });
      reload();
    }
  }, []);

  // Load custom named events from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("custom_named_events");
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          setCustomEvents(arr.filter((x: any) => typeof x === "string"));
        }
      }
    } catch {}
  }, []);

  const handleCreateFromTemplate = () => {
    // Append templates if not exists
    const existing = eventRuleService.list();
    const existsIds = new Set(existing.map((r) => r.id));
    const toCreate = starterTemplates.filter((t) => !existsIds.has(t.id)).map((t) => ({
      name: t.name,
      targetEvent: t.targetEvent,
      scope: t.scope,
      conditions: t.conditions,
      enabled: t.enabled,
      priority: t.priority,
      dedup: t.dedup,
    }));
    toCreate.forEach((tpl) => eventRuleService.create(tpl as any));
    reload();
  };

  const handleCreate = () => {
    setEditingRule({
      id: "",
      name: "新建事件规则",
      targetEvent: "Login",
      scope: { type: "prefix", value: "/" },
      conditions: { eventType: "click", text: { aliases: [], matchMode: "contains" } },
      enabled: true,
      priority: Math.max(...rules.map((r) => r.priority), 0) + 1,
      dedup: { windowSeconds: 5, oncePerSession: false },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setOpenEditor(true);
  };

  const handleEdit = (rule: EventRule) => {
    setEditingRule(rule);
    setOpenEditor(true);
  };

  const handleDelete = (rule: EventRule) => {
    eventRuleService.remove(rule.id);
    reload();
  };



  const saveRule = () => {
    if (!editingRule) return;
    if (!editingRule.name.trim()) return;
    if (editingRule.id) {
      eventRuleService.update(editingRule.id, editingRule);
    } else {
      const { id, createdAt, updatedAt, ...rest } = editingRule;
      eventRuleService.create(rest as any);
    }
    setOpenEditor(false);
    setEditingRule(null);
    // 重置下拉框相关状态
    setShowInlineAddEvent(false);
    setNewEventName("");
    setSelectOpen(false);
    reload();
  };

  const updateEditing = (patch: Partial<EventRule>) => {
    setEditingRule((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const addCustomEvent = () => {
    const name = newEventName.trim();
    if (!name) return;
    setCustomEvents((prev) => {
      const next = prev.includes(name) ? prev : [...prev, name];
      try {
        localStorage.setItem("custom_named_events", JSON.stringify(next));
      } catch {}
      return next;
    });
    updateEditing({ targetEvent: name as NamedEvent });
    setShowAddEvent(false);
    setShowInlineAddEvent(false);
    setNewEventName("");
    // 保持下拉框打开状态，不调用 setSelectOpen(false)
  };

  const cancelAddEvent = () => {
    setShowAddEvent(false);
    setShowInlineAddEvent(false);
    setNewEventName("");
    // 保持下拉框打开状态，不调用 setSelectOpen(false)
  };

  // 拖拽处理函数
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, ruleId: string) => {
    setDraggedRule(ruleId);
    if (e.currentTarget) {
      e.currentTarget.classList.add('opacity-50');
    }
    // 设置拖拽效果
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', ruleId);
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setDraggedRule(null);
    if (e.currentTarget) {
      e.currentTarget.classList.remove('opacity-50');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    const draggedRuleId = e.dataTransfer.getData('text/plain');
    
    if (draggedRuleId && draggedRule) {
      // 获取筛选后列表中的目标规则
      const targetRule = filteredRules[targetIndex];
      if (!targetRule) return;
      
      // 在原始规则数组中找到拖拽规则和目标规则的索引
      const draggedIndex = rules.findIndex(rule => rule.id === draggedRuleId);
      const realTargetIndex = rules.findIndex(rule => rule.id === targetRule.id);
      
      if (draggedIndex !== -1 && realTargetIndex !== -1 && draggedIndex !== realTargetIndex) {
        // 重新排序规则
        const newRules = [...rules];
        const [draggedItem] = newRules.splice(draggedIndex, 1);
        newRules.splice(realTargetIndex, 0, draggedItem);
        setRules(newRules);
        
        // 这里可以调用API保存新的排序
        // eventRuleService.updateOrder(newRules.map(r => r.id));
      }
    }
    
    setDraggedRule(null);
  };

  const updateTextAliases = (idx: number, value: string) => {
    if (!editingRule) return;
    const aliases = editingRule.conditions.text?.aliases || [];
    const next = [...aliases];
    next[idx] = value;
    updateEditing({
      conditions: {
        ...editingRule.conditions,
        text: {
          aliases: next,
          matchMode: editingRule.conditions.text?.matchMode || "contains",
        },
      },
    });
  };

  const addAlias = () => {
    if (!editingRule) return;
    const aliases = editingRule.conditions.text?.aliases || [];
    updateEditing({
      conditions: {
        ...editingRule.conditions,
        text: {
          aliases: [...aliases, ""],
          matchMode: editingRule.conditions.text?.matchMode || "contains",
        },
      },
    });
  };

  const removeAlias = (idx: number) => {
    if (!editingRule) return;
    const aliases = editingRule.conditions.text?.aliases || [];
    const next = aliases.filter((_, i) => i !== idx);
    updateEditing({
      conditions: {
        ...editingRule.conditions,
        text: {
          aliases: next,
          matchMode: editingRule.conditions.text?.matchMode || "contains",
        },
      },
    });
  };

  const updateTitleIncludes = (idx: number, value: string) => {
    if (!editingRule) return;
    const list = editingRule.conditions.pageTitleIncludes || [];
    const next = [...list];
    next[idx] = value;
    updateEditing({
      conditions: { ...editingRule.conditions, pageTitleIncludes: next },
    });
  };

  const addTitleInclude = () => {
    if (!editingRule) return;
    const list = editingRule.conditions.pageTitleIncludes || [];
    updateEditing({
      conditions: { ...editingRule.conditions, pageTitleIncludes: [...list, ""] },
    });
  };

  const removeTitleInclude = (idx: number) => {
    if (!editingRule) return;
    const list = editingRule.conditions.pageTitleIncludes || [];
    const next = list.filter((_, i) => i !== idx);
    updateEditing({
      conditions: { ...editingRule.conditions, pageTitleIncludes: next },
    });
  };

  // 筛选逻辑
  const filteredRules = useMemo(() => {
    return rules.filter((rule) => {
      const matchesSearch = 
        rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eventLabels[rule.targetEvent]?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = 
        statusFilter === "all" || 
        (statusFilter === "enabled" && rule.enabled) ||
        (statusFilter === "disabled" && !rule.enabled);

      return matchesSearch && matchesStatus;
    });
  }, [rules, searchTerm, statusFilter]);

  // 筛选处理函数
  const handleSearch = () => {
    // 搜索逻辑已在 useMemo 中实现，这里可以添加额外的搜索行为
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  return (
    <div className="p-4 space-y-4">
      {/* 筛选区域 */}
      <Card className="p-6 bg-white shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* 搜索框 */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="搜索规则名称或目标事件..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 状态筛选 */}
          <div className="w-full md:w-48">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="enabled">启用</SelectItem>
                <SelectItem value="disabled">禁用</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button
              variant="default"
              onClick={handleSearch}
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              查询
            </Button>
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              重置
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex justify-start">
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" /> 新建规则
        </Button>
      </div>
        <Card>
          <CardContent className="space-y-3 pt-4">
          {filteredRules.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              {rules.length === 0 ? '暂无规则，点击"新建规则"开始。' : '没有符合筛选条件的规则。'}
            </div>
          ) : (
            filteredRules.map((rule, idx) => (
              <Card 
                key={rule.id}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDrop={(e) => handleDrop(e, idx)}
                className={`transition-opacity ${draggedRule === rule.id ? 'opacity-50' : ''}`}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, rule.id)}
                        onDragEnd={handleDragEnd}
                        className="cursor-grab active:cursor-grabbing p-2 rounded hover:bg-gray-100"
                      >
                        <GripVertical className="h-4 w-4" />
                      </div>
                      <div className="font-medium">{rule.name}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {eventLabels[rule.targetEvent]}
                      </Badge>
                      <Badge variant={rule.enabled ? "default" : "secondary"}>
                        {rule.enabled ? "启用" : "禁用"}
                      </Badge>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(rule)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(rule)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* 编辑抽屉 */}
      <Sheet open={openEditor} onOpenChange={(open) => {
        setOpenEditor(open);
        if (!open) {
          // 关闭编辑器时重置所有状态
          setShowInlineAddEvent(false);
          setNewEventName("");
          setSelectOpen(false);
        }
      }}>
        <SheetContent side="right" className="w-[720px] sm:w-[840px] p-0">
          <div className="flex h-full flex-col">
            <div className="flex-none p-6">
              <SheetHeader>
                <SheetTitle>{editingRule?.id ? "编辑规则" : "新建规则"}</SheetTitle>
              </SheetHeader>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {editingRule && (
                <div className="space-y-6">
                  {/* 基础信息卡片 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">基础信息</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2 space-y-2">
                          <Label>规则名称</Label>
                          <Input value={editingRule.name} onChange={(e) => updateEditing({ name: e.target.value })} />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-1">
                            <Label>目标事件</Label>
                            <Tooltip delayDuration={300}>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs bg-gray-900 text-white border-gray-700">
                                规则匹配成功后产出的业务事件名称，用于报表与自动化策略触发；可选择内置或自定义事件。
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Select 
                            value={editingRule.targetEvent} 
                            open={selectOpen}
                            onOpenChange={(open) => {
                              // 如果正在显示内联添加事件，不允许关闭下拉框
                              if (!open && showInlineAddEvent) {
                                return;
                              }
                              setSelectOpen(open);
                            }}
                            onValueChange={(v) => {
                              if (v === "__add_new__") {
                                setShowInlineAddEvent(true);
                                setNewEventName("");
                                setSelectOpen(true); // 保持下拉框打开
                              } else {
                                updateEditing({ targetEvent: v as NamedEvent });
                                setSelectOpen(false); // 选择其他选项时关闭下拉框
                              }
                            }}>
                            <SelectTrigger>
                              <SelectValue placeholder="选择事件" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(eventLabels).map((k) => (
                                <SelectItem key={k} value={k}>{eventLabels[k]}</SelectItem>
                              ))}
                              {customEvents.map((ev) => (
                                <SelectItem key={ev} value={ev}>{ev}</SelectItem>
                              ))}
                              {!showInlineAddEvent && (
                                <SelectItem value="__add_new__" className="text-blue-600 font-medium">
                                  <div className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    新增事件
                                  </div>
                                </SelectItem>
                              )}
                              {showInlineAddEvent && (
                                <div className="p-2 border-t">
                                  <div className="flex items-center gap-2">
                                    <Input 
                                      className="h-8 flex-1" 
                                      placeholder="如 AddToCart" 
                                      value={newEventName} 
                                      onChange={(e) => setNewEventName(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          addCustomEvent();
                                        } else if (e.key === 'Escape') {
                                          e.preventDefault();
                                          cancelAddEvent();
                                        }
                                      }}
                                      autoFocus
                                    />
                                    <Button size="sm" onClick={addCustomEvent} disabled={!newEventName.trim()}>
                                      保存
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={cancelAddEvent}>
                                      取消
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>启用</Label>
                          <div className="flex items-center h-10"><Switch checked={editingRule.enabled} onCheckedChange={(v) => updateEditing({ enabled: v })} /></div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-1">
                            <Label>URL范围类型</Label>
                            <Tooltip delayDuration={300}>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs bg-gray-900 text-white border-gray-700">
                                限定规则生效的URL匹配方式：前缀匹配（简单高效）或正则匹配（适用于复杂路径）。
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Select value={editingRule.scope.type} onValueChange={(v) => updateEditing({ scope: { ...editingRule.scope, type: v as any } })}>
                            <SelectTrigger>
                              <SelectValue placeholder="选择范围类型" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="prefix">前缀</SelectItem>
                              <SelectItem value="regex">正则</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-1">
                            <Label>URL范围值</Label>
                            <Tooltip delayDuration={300}>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs bg-gray-900 text-white border-gray-700">
                                与范围类型配合使用的具体匹配值：如 /auth、/order（前缀），或 ^/checkout/(success|complete)$（正则）。
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Input value={editingRule.scope.value} onChange={(e) => updateEditing({ scope: { ...editingRule.scope, value: e.target.value } })} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">识别条件</CardTitle>
                    </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>事件类型</Label>
                            <Select value={editingRule.conditions.eventType} onValueChange={(v) => updateEditing({ conditions: { ...editingRule.conditions, eventType: v as RawEventType } })}>
                              <SelectTrigger>
                                <SelectValue placeholder="选择事件类型" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.keys(rawTypeLabels).map((k) => (
                                  <SelectItem key={k} value={k}>{rawTypeLabels[k as RawEventType]}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <div className="flex items-center gap-2">
                              <Label>标题包含</Label>
                              <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs bg-gray-900 text-white border-gray-700">
                                  匹配页面标题中包含特定文字的页面。当用户访问的页面标题包含指定关键词时，触发事件规则。例如：设置"登录"，当用户访问标题包含"登录"的页面时匹配。
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            {(editingRule.conditions.pageTitleIncludes || []).map((v, idx) => (
                              <div key={idx} className="flex gap-2 mb-2">
                                <Input value={v} onChange={(e) => updateTitleIncludes(idx, e.target.value)} />
                                <Button variant="ghost" size="sm" onClick={() => removeTitleInclude(idx)}>删除</Button>
                              </div>
                            ))}
                            <Button variant="secondary" size="sm" onClick={addTitleInclude}>添加标题</Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label>文本别名</Label>
                            <Tooltip delayDuration={300}>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs bg-gray-900 text-white border-gray-700">
                                定义多个文本关键词，用于匹配页面中的文本内容。识别页面中包含特定文本的元素（如按钮文字、链接文字等）。例如：设置["提交", "Submit", "Send"]，匹配包含这些文字的元素。
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          {(editingRule.conditions.text?.aliases || []).map((v, idx) => (
                            <div key={idx} className="flex gap-2 mb-2">
                              <Input value={v} onChange={(e) => updateTextAliases(idx, e.target.value)} />
                              <Button variant="ghost" size="sm" onClick={() => removeAlias(idx)}>删除</Button>
                            </div>
                          ))}
                          <Button variant="secondary" size="sm" onClick={addAlias}>添加别名</Button>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label>匹配模式</Label>
                                <Tooltip delayDuration={300}>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-xs bg-gray-900 text-white border-gray-700">
                                    定义文本别名的匹配方式。等于：完全匹配；包含：部分匹配（默认）；前缀：以指定文本开头；后缀：以指定文本结尾。
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <Select value={editingRule.conditions.text?.matchMode || "contains"} onValueChange={(v) => updateEditing({ conditions: { ...editingRule.conditions, text: { aliases: editingRule.conditions.text?.aliases || [], matchMode: v as any } } })}>
                                <SelectTrigger>
                                  <SelectValue placeholder="选择匹配模式" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="equals">等于</SelectItem>
                                  <SelectItem value="contains">包含</SelectItem>
                                  <SelectItem value="starts_with">前缀</SelectItem>
                                  <SelectItem value="ends_with">后缀</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Label>选择器</Label>
                              <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs bg-gray-900 text-white border-gray-700">
                                  使用CSS选择器精确定位页面元素。通过CSS选择器语法指定要监听的具体DOM元素。例如：#login-btn、.submit-button、button[type="submit"]。
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <Input value={editingRule.conditions.selector?.selector || ""} onChange={(e) => updateEditing({ conditions: { ...editingRule.conditions, selector: { ...(editingRule.conditions.selector || {}), selector: e.target.value } } })} />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Label>属性（键=值，逗号分隔）</Label>
                              <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs bg-gray-900 text-white border-gray-700">
                                  匹配具有特定属性值的HTML元素。格式：键=值，多个用逗号分隔。进一步细化元素匹配条件。例如：data-role=login,data-id=btn1 匹配同时具有这两个属性的元素。
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <Input placeholder="data-role=login,data-id=btn1" value={Object.entries(editingRule.conditions.selector?.attributes || {}).map(([k, v]) => `${k}=${v}`).join(",")} onChange={(e) => {
                              const kvs = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                              const attrs: Record<string, string> = {};
                              kvs.forEach((kv) => {
                                const [k, v] = kv.split("=");
                                if (k && v) attrs[k] = v;
                              });
                              updateEditing({ conditions: { ...editingRule.conditions, selector: { ...(editingRule.conditions.selector || {}), attributes: attrs } } });
                            }} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">去重策略</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1">
                          <Label>去重窗口（秒）</Label>
                          <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs bg-gray-900 text-white border-gray-700">
                              设置时间窗口内的去重机制。在指定时间内（如30秒）多次触发同一事件时，只记录第一次。可避免误操作或网络延迟导致的重复事件。
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input type="number" value={editingRule.dedup?.windowSeconds || 0} onChange={(e) => updateEditing({ dedup: { ...(editingRule.dedup || {}), windowSeconds: Number(e.target.value) } })} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-1">
                          <Label>会话唯一</Label>
                          <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs bg-gray-900 text-white border-gray-700">
                              开启后，在用户整个会话期间（从进入到离开网站），同一事件只会被记录一次。适用于登录、注册等只需记录一次的事件。
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="flex items-center h-10"><Switch checked={!!editingRule.dedup?.oncePerSession} onCheckedChange={(v) => updateEditing({ dedup: { ...(editingRule.dedup || {}), oncePerSession: v } })} /></div>
                      </div>
                    </CardContent>
                  </Card>

                </div>
              )}
            </div>
            <div className="flex-none p-6">
              <SheetFooter>
                <Button onClick={() => { 
                  setOpenEditor(false); 
                  setEditingRule(null); 
                  // 重置下拉框相关状态
                  setShowInlineAddEvent(false);
                  setNewEventName("");
                  setSelectOpen(false);
                }}>取消</Button>
                <Button onClick={saveRule}>保存</Button>
              </SheetFooter>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default RulesPage;