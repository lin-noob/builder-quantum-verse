import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  Database,
  Share2,
  Zap,
  BookOpen,
  Plus,
  Trash2,
  Box,
  ShoppingCart,
  FileText,
  Settings,
  LayoutGrid,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  KnowledgeNode,
  KnowledgeNodeType,
  PropSource,
  RiskLevel,
  RelationDirection,
  KnowledgeRelation,
} from "../../types/Knowledge";
import RelationGraphEditor from "./RelationGraphEditor";
import { Request } from "@/lib/request";
import useProjectStore from "@/stores/projectStore";
import { useToast } from "@/hooks/use-toast";

const KnowledgeObjectEditor: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const initialData = (location.state as { initialData?: KnowledgeNode })?.initialData || {
    id: "",
    name: "",
    type: "Master",
    numericId: null,
    description: "",
    properties: [],
    relations: [],
    actions: [],
    rules: [],
    stats: { inDegree: 0, outDegree: 0, referenceCount: 0, usageFrequency: 0 },
  };

  const [formData, setFormData] = useState<Partial<KnowledgeNode>>(initialData);
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(false);
  const isEditing = !!initialData.id;

  useEffect(() => {
    const fetchDetail = async () => {
      // If we have an ID but no name, it means we likely only have partial data from state or need to refresh
      if (isEditing && !formData.name) {
        setLoading(true);
        const request = new Request();
        try {
          const response = await request.request(`/quote/api/v1/digital/view/${formData.id}`, {
            method: "GET",
          });
          if (response.status === 200 && response.data.data) {
            const item = response.data.data;
            const typeMap: Record<string, string> = {
              "1": "Master",
              "2": "Transaction",
              "3": "Result",
            };

            const mappedData: Partial<KnowledgeNode> = {
              id: item.objectCode,
              numericId: item.id,
              name: item.objectName,
              type: (typeMap[item.modelType] as any) || "Master",
              description: item.description,
              stats: {
                inDegree: item.inDegree || 0,
                outDegree: item.outDegree || 0,
                referenceCount: Number(item.referenceCount) || 0,
                usageFrequency: item.usageRate || 0,
              },
              properties: (item.attributes || []).map((attr: any) => ({
                id: attr.attributeCode,
                name: attr.attributeName,
                type: attr.attributeType,
                source: attr.attributeSource as PropSource,
                sourceLabel: attr.attributeSource,
                description: attr.attributeDesc,
                relatedDbColumn: attr.dbColumnName,
              })),
              relations: (item.relations || []).map((rel: any) => ({
                semanticName: rel.relationName,
                targetNodeType: rel.targetType,
                direction: rel.direction || "OUT",
                sourceAction: rel.sourceAction,
                isMutable: rel.mutability === "true",
              })),
              actions: (item.actions || []).map((act: any) => ({
                name: act.actionCode,
                label: act.actionName,
                apiEndpoint: act.apiEndpoint,
                httpMethod: act.httpMethod as any,
                conditions: act.preConditions ? act.preConditions.split(",").map((s: string) => s.trim()) : [],
                riskLevel: act.riskLevel as RiskLevel,
              })),
              rules: (item.rules || []).map((rule: any) => ({
                id: rule.ruleCode,
                name: rule.ruleName,
                description: rule.ruleDesc,
                expression: rule.ruleExpression,
              })),
            };
            setFormData(mappedData);
          }
        } catch (error) {
          console.error("Failed to fetch detail:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDetail();
  }, [isEditing, formData.id, formData.name]);

  const updateData = (updates: Partial<KnowledgeNode>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.id) {
      toast({
        title: "提示",
        description: "请填写名称和ID",
        variant: "destructive",
      });
      return;
    }

    const request = new Request();

    const typeMap: Record<string, number> = {
      Master: 1,
      Transaction: 2,
      Result: 3,
    };

    const currentProject = useProjectStore.getState().currentProject;

    const payload = {
      id: (formData as any).numericId || undefined,
      objectCode: formData.id,
      objectName: formData.name,
      description: formData.description || "",
      modelType: typeMap[formData.type || "Master"],
      projectId: currentProject?.id || 0,
      tenantId: currentProject?.tenantId || "",
      inDegree: formData.stats?.inDegree || 0,
      outDegree: formData.stats?.outDegree || 0,
      referenceCount: formData.stats?.referenceCount || 0,
      usageRate: formData.stats?.usageFrequency || 0,
      attributeCount: (formData.properties || []).length,
      attributes: (formData.properties || []).map((p) => ({
        attributeCode: p.id,
        attributeName: p.name,
        attributeType: p.type,
        attributeSource: p.source,
        attributeDesc: p.description || "",
        dbColumnName: p.relatedDbColumn || "",
        status: "",
      })),
      relationCount: (formData.relations || []).length,
      relations: (formData.relations || []).map((r) => ({
        relationName: r.semanticName,
        targetType: r.targetNodeType,
        sourceAction: r.sourceAction || "",
        status: "",
        mutability: r.isMutable ? "true" : "false",
        direction: r.direction,
        targetModelId: r.targetNodeType,
      })),
      actionCount: (formData.actions || []).length,
      actions: (formData.actions || []).map((a) => ({
        actionCode: a.name,
        actionName: a.label,
        apiEndpoint: a.apiEndpoint,
        httpMethod: a.httpMethod || "POST",
        preConditions: a.conditions?.join(", ") || "",
        riskLevel: a.riskLevel,
        status: "",
      })),
      ruleCount: (formData.rules || []).length,
      rules: (formData.rules || []).map((r) => ({
        ruleCode: r.id,
        ruleName: r.name,
        ruleDesc: r.description,
        ruleExpression: r.expression,
        status: "",
      })),
    };

    try {
      const response = isEditing
        ? await request.put("/quote/api/v1/digital", payload)
        : await request.post("/quote/api/v1/digital", payload);

      if (response.status === 200) {
        toast({
          title: "成功",
          description: isEditing ? "更新成功" : "创建成功",
        });
        navigate("/Knowledge/explorer");
      } else {
        toast({
          title: "失败",
          description: response.data.msg || (isEditing ? "更新失败" : "创建失败"),
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Save failed:", error);
      toast({
        title: "保存失败",
        description: error.message || "未知错误",
        variant: "destructive",
      });
    }
  };

  const addProperty = () => {
    const newProp = {
      id: `prop_${Date.now()}`,
      name: "",
      type: "string",
      source: PropSource.DB_COLUMN,
      sourceLabel: "数据库",
      description: "",
      relatedDbColumn: "",
    };
    updateData({ properties: [...(formData.properties || []), newProp] });
  };

  const updateProperty = (index: number, field: string, value: any) => {
    const newProps = [...(formData.properties || [])];
    (newProps[index] as any)[field] = value;
    updateData({ properties: newProps });
  };

  const removeProperty = (index: number) => {
    const newProps = (formData.properties || []).filter((_, i) => i !== index);
    updateData({ properties: newProps });
  };

  const handleRelationsChange = (newRelations: KnowledgeRelation[]) => {
    updateData({ relations: newRelations });
  };

  const addAction = () => {
    const newAction = {
      name: `action_${Date.now()}`,
      label: "",
      apiEndpoint: "",
      httpMethod: "POST" as const,
      riskLevel: "Low" as RiskLevel,
      conditions: [],
    };
    updateData({ actions: [...(formData.actions || []), newAction] });
  };

  const updateAction = (index: number, field: string, value: any) => {
    const newActions = [...(formData.actions || [])];
    if (field === "conditions") {
      (newActions[index] as any)[field] =
        typeof value === "string"
          ? value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : value;
    } else {
      (newActions[index] as any)[field] = value;
    }
    updateData({ actions: newActions });
  };

  const removeAction = (index: number) => {
    const newActions = (formData.actions || []).filter((_, i) => i !== index);
    updateData({ actions: newActions });
  };

  const addRule = () => {
    const newRule = {
      id: `rule_${Date.now()}`,
      name: "",
      description: "",
      expression: "",
    };
    updateData({ rules: [...(formData.rules || []), newRule] });
  };

  const updateRule = (index: number, field: string, value: any) => {
    const newRules = [...(formData.rules || [])];
    (newRules[index] as any)[field] = value;
    updateData({ rules: newRules });
  };

  const removeRule = (index: number) => {
    const newRules = (formData.rules || []).filter((_, i) => i !== index);
    updateData({ rules: newRules });
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b flex items-center px-6 justify-between shrink-0 bg-white z-20 shadow-sm sticky top-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-bold text-lg text-slate-900">
              {isEditing ? `编辑对象: ${formData.name}` : "新建知识对象"}
            </h1>
            <p className="text-xs text-slate-500">{isEditing ? `ID: ${formData.id}` : "定义新的业务实体模型"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            取消
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Save className="h-4 w-4 mr-2" />
            保存配置
          </Button>
        </div>
      </header>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Navigation Only */}
        <aside className="w-64 bg-white border-r border-slate-200 overflow-y-auto flex flex-col z-10 py-6">
          <div className="px-4 flex-1">
            <div className="space-y-1">
              {[
                { id: "basic", label: "基础配置", icon: Settings },
                { id: "properties", label: "属性定义", icon: Database, count: formData.properties?.length },
                { id: "relations", label: "关系配置", icon: Share2, count: formData.relations?.length },
                { id: "actions", label: "动作与能力", icon: Zap, count: formData.actions?.length },
                { id: "rules", label: "业务规则", icon: BookOpen, count: formData.rules?.length },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${activeTab === item.id ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 ${activeTab === item.id ? "text-blue-600" : "text-slate-400"}`} />
                    {item.label}
                  </div>
                  {item.count ? (
                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">{item.count}</span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 overflow-hidden flex flex-col bg-white">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full">
            <div className="h-14 border-b bg-white flex items-center px-8 sticky top-0 shrink-0">
              {/* Tab Headers could go here if we didn't use Sidebar nav */}
              <h2 className="text-lg font-semibold text-slate-800">
                {activeTab === "basic" && "基础配置"}
                {activeTab === "properties" && "属性定义"}
                {activeTab === "relations" && "关系配置"}
                {activeTab === "actions" && "动作与能力"}
                {activeTab === "rules" && "业务规则"}
              </h2>
            </div>

            <div className="flex-1 p-8 overflow-hidden flex flex-col">
              <div className="max-w-[1200px] w-full h-full flex flex-col">
                {activeTab === "basic" && (
                  <TabsContent value="basic" className="mt-0 h-full flex flex-col overflow-y-auto" forceMount>
                    <div className="shrink-0 space-y-4 mb-4">
                      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Settings className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-blue-900">基础配置</h4>
                          <p className="text-xs text-blue-700 mt-1 leading-relaxed opacity-80">
                            设置业务对象的核心身份信息、描述及类型分类。
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 p-1">
                      <section className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                        <div className="grid grid-cols-12 gap-8">
                          <div className="col-span-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-700">
                                  对象名称 <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  value={formData.name || ""}
                                  onChange={(e) => updateData({ name: e.target.value })}
                                  placeholder="例如：订单"
                                  className="bg-white h-10"
                                />
                                <p className="text-[10px] text-slate-400">业务对象的中文显示名称。</p>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-700">
                                  唯一标识 (ID) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  value={formData.id || ""}
                                  onChange={(e) => updateData({ id: e.target.value })}
                                  placeholder="order"
                                  className="font-mono bg-slate-50 h-10"
                                  disabled={isEditing}
                                />
                                <p className="text-[10px] text-slate-400">系统内唯一的英文标识，创建后不可修改。</p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-slate-700">业务描述</Label>
                              <Textarea
                                value={formData.description || ""}
                                onChange={(e) => updateData({ description: e.target.value })}
                                placeholder="请输入该业务对象的详细描述..."
                                className="min-h-[120px] text-sm bg-white resize-none"
                              />
                            </div>
                          </div>

                          <div className="col-span-4 bg-slate-50 rounded-lg p-5 border border-slate-100">
                            <Label className="text-sm font-medium text-slate-700 mb-4 block">对象类型</Label>
                            <div className="space-y-3">
                              {[
                                {
                                  id: "Master",
                                  name: "主数据",
                                  icon: Database,
                                  desc: "核心业务实体，如客户、产品。",
                                },
                                {
                                  id: "Transaction",
                                  name: "交易数据",
                                  icon: ShoppingCart,
                                  desc: "业务过程记录，如订单、流水。",
                                },
                                {
                                  id: "Result",
                                  name: "结果数据",
                                  icon: FileText,
                                  desc: "分析或计算产生的衍生数据。",
                                },
                              ].map((type) => (
                                <div
                                  key={type.id}
                                  onClick={() => updateData({ type: type.id as KnowledgeNodeType })}
                                  className={`
                                      cursor-pointer rounded-lg border p-3 flex items-start gap-3 transition-all
                                      ${
                                        formData.type === type.id
                                          ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                                          : "border-slate-200 bg-white hover:border-blue-300"
                                      }
                                    `}
                                >
                                  <div
                                    className={`mt-0.5 p-1.5 rounded-md ${formData.type === type.id ? "bg-blue-200 text-blue-700" : "bg-slate-100 text-slate-500"}`}
                                  >
                                    <type.icon className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <div
                                      className={`text-sm font-bold ${formData.type === type.id ? "text-blue-800" : "text-slate-700"}`}
                                    >
                                      {type.name}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1 leading-snug">{type.desc}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>
                  </TabsContent>
                )}

                {activeTab === "properties" && (
                  <TabsContent value="properties" className="mt-0 h-full flex flex-col" forceMount>
                    <div className="shrink-0 space-y-4 mb-4">
                      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Database className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-blue-900">属性定义</h4>
                          <p className="text-xs text-blue-700 mt-1 leading-relaxed opacity-80">
                            定义对象的静态属性结构，支持关联数据库列以实现自动映射。
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <Button onClick={addProperty} className="shadow-sm bg-blue-600 hover:bg-blue-700 text-white">
                          <Plus className="h-4 w-4 mr-2" /> 添加属性
                        </Button>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
                      <div className="flex-1 overflow-y-auto">
                        <Table>
                          <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                            <TableRow>
                              <TableHead className="w-[180px]">属性名</TableHead>
                              <TableHead className="w-[120px]">类型</TableHead>
                              <TableHead className="w-[150px]">来源</TableHead>
                              <TableHead className="w-[180px]">数据库列 (DB Column)</TableHead>
                              <TableHead>描述</TableHead>
                              <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(formData.properties || []).map((prop, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <Input
                                    value={prop.name}
                                    onChange={(e) => updateProperty(index, "name", e.target.value)}
                                    placeholder="属性名"
                                    className="h-8"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Select value={prop.type} onValueChange={(val) => updateProperty(index, "type", val)}>
                                    <SelectTrigger className="h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="string">String</SelectItem>
                                      <SelectItem value="number">Number</SelectItem>
                                      <SelectItem value="boolean">Boolean</SelectItem>
                                      <SelectItem value="date">Date</SelectItem>
                                      <SelectItem value="currency">Currency</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <Select
                                    value={prop.source}
                                    onValueChange={(val) => updateProperty(index, "source", val)}
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value={PropSource.DB_COLUMN}>DB Column</SelectItem>
                                      <SelectItem value={PropSource.COMPUTED}>Computed</SelectItem>
                                      <SelectItem value={PropSource.EXTERNAL_SYNC}>External</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <div className="relative">
                                    <Database className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                                    <Input
                                      value={prop.relatedDbColumn || ""}
                                      onChange={(e) => updateProperty(index, "relatedDbColumn", e.target.value)}
                                      placeholder="column_name"
                                      className={`h-8 pl-8 font-mono text-xs ${prop.source !== PropSource.DB_COLUMN ? "opacity-50" : ""}`}
                                      disabled={prop.source !== PropSource.DB_COLUMN}
                                    />
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={prop.description || ""}
                                    onChange={(e) => updateProperty(index, "description", e.target.value)}
                                    placeholder="描述..."
                                    className="h-8"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-400 hover:text-red-600"
                                    onClick={() => removeProperty(index)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                            {(formData.properties || []).length === 0 && (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                                  暂无属性配置，请点击右上角添加。
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </TabsContent>
                )}

                {activeTab === "relations" && (
                  <TabsContent value="relations" className="mt-0 h-full flex flex-col" forceMount>
                    <div className="shrink-0 space-y-4 mb-4">
                      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Share2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-blue-900">关系图谱编辑器</h4>
                          <p className="text-xs text-blue-700 mt-1 leading-relaxed opacity-80">
                            可视化定义对象间的关联关系。中心节点为当前对象。您可以添加目标类型节点并配置连接关系。
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
                      <RelationGraphEditor
                        currentId={formData.id || "Current"}
                        currentName={formData.name || "Current Object"}
                        relations={formData.relations || []}
                        onChange={handleRelationsChange}
                        id={initialData.numericId ?? null}
                      />
                    </div>
                  </TabsContent>
                )}

                {activeTab === "actions" && (
                  <TabsContent value="actions" className="mt-0 h-full flex flex-col" forceMount>
                    <div className="shrink-0 space-y-4 mb-4">
                      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Zap className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-blue-900">动作与能力</h4>
                          <p className="text-xs text-blue-700 mt-1 leading-relaxed opacity-80">
                            定义对象可执行的操作（如API调用），配置输入参数、风险等级及执行前置条件。
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <Button onClick={addAction} className="shadow-sm bg-blue-600 hover:bg-blue-700 text-white">
                          <Plus className="h-4 w-4 mr-2" /> 添加动作
                        </Button>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
                      <div className="flex-1 overflow-y-auto">
                        <Table>
                          <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                            <TableRow>
                              <TableHead className="w-[150px]">显示名称</TableHead>
                              <TableHead className="w-[150px]">API Endpoint</TableHead>
                              <TableHead className="w-[100px]">Method</TableHead>
                              <TableHead className="w-[100px]">风险等级</TableHead>
                              <TableHead>前置条件 (逗号分隔)</TableHead>
                              <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(formData.actions || []).map((action, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <Input
                                    value={action.label}
                                    onChange={(e) => updateAction(index, "label", e.target.value)}
                                    placeholder="例如: 取消订单"
                                    className="h-8"
                                  />
                                  <div className="text-[10px] text-slate-400 mt-1 font-mono">{action.name}</div>
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={action.apiEndpoint}
                                    onChange={(e) => updateAction(index, "apiEndpoint", e.target.value)}
                                    placeholder="/api/..."
                                    className="h-8 font-mono text-xs"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Select
                                    value={action.httpMethod}
                                    onValueChange={(val) => updateAction(index, "httpMethod", val)}
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="GET">GET</SelectItem>
                                      <SelectItem value="POST">POST</SelectItem>
                                      <SelectItem value="PUT">PUT</SelectItem>
                                      <SelectItem value="DELETE">DELETE</SelectItem>
                                      <SelectItem value="PATCH">PATCH</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <Select
                                    value={action.riskLevel}
                                    onValueChange={(val) => updateAction(index, "riskLevel", val)}
                                  >
                                    <SelectTrigger
                                      className={`h-8 ${action.riskLevel === "High" ? "text-red-600 font-medium" : ""}`}
                                    >
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Low">低 (Low)</SelectItem>
                                      <SelectItem value="Mid">中 (Mid)</SelectItem>
                                      <SelectItem value="High" className="text-red-600">
                                        高 (High)
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={action.conditions?.join(", ") || ""}
                                    onChange={(e) => updateAction(index, "conditions", e.target.value)}
                                    placeholder="Status=Paid, ..."
                                    className="h-8"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-400 hover:text-red-600"
                                    onClick={() => removeAction(index)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                            {(formData.actions || []).length === 0 && (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                                  暂无动作配置，请点击右上角添加。
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </TabsContent>
                )}

                {activeTab === "rules" && (
                  <TabsContent value="rules" className="mt-0 h-full flex flex-col" forceMount>
                    <div className="shrink-0 space-y-4 mb-4">
                      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-blue-900">业务规则</h4>
                          <p className="text-xs text-blue-700 mt-1 leading-relaxed opacity-80">
                            设置对象的验证规则、自动计算逻辑或风险预警条件。
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <Button onClick={addRule} className="shadow-sm bg-blue-600 hover:bg-blue-700 text-white">
                          <Plus className="h-4 w-4 mr-2" /> 添加规则
                        </Button>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
                      <div className="flex-1 overflow-y-auto">
                        <Table>
                          <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                            <TableRow>
                              <TableHead className="w-[200px]">规则名称</TableHead>
                              <TableHead className="w-[250px]">描述</TableHead>
                              <TableHead>逻辑表达式</TableHead>
                              <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(formData.rules || []).map((rule, index) => (
                              <TableRow key={index}>
                                <TableCell className="align-top">
                                  <Input
                                    value={rule.name}
                                    onChange={(e) => updateRule(index, "name", e.target.value)}
                                    placeholder="例如: 高价值订单"
                                    className="h-8 mb-1"
                                  />
                                  <div className="text-[10px] text-slate-400 font-mono">{rule.id}</div>
                                </TableCell>
                                <TableCell className="align-top">
                                  <Textarea
                                    value={rule.description}
                                    onChange={(e) => updateRule(index, "description", e.target.value)}
                                    placeholder="规则说明..."
                                    className="min-h-[60px] text-xs resize-none"
                                  />
                                </TableCell>
                                <TableCell className="align-top">
                                  <Textarea
                                    value={rule.expression}
                                    onChange={(e) => updateRule(index, "expression", e.target.value)}
                                    placeholder="total_amount > 1000 && status == 'PAID'"
                                    className="min-h-[60px] font-mono text-xs bg-slate-50 resize-none text-blue-600"
                                  />
                                </TableCell>
                                <TableCell className="align-top">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-400 hover:text-red-600"
                                    onClick={() => removeRule(index)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                            {(formData.rules || []).length === 0 && (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-12 text-slate-400">
                                  暂无业务规则，请点击右上角添加。
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </TabsContent>
                )}
              </div>
            </div>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default KnowledgeObjectEditor;
