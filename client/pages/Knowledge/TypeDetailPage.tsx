import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Share2,
  Database,
  Zap,
  BookOpen,
  Box,
  Edit,
  Trash2,
  Settings,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import RelationGraphEditor from "./RelationGraphEditor";
import { PropSource, KnowledgeNode, KnowledgeNodeType, RiskLevel } from "../../types/Knowledge";
import { mockKnowledgeNodes } from "./mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Request } from "@/lib/request";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

const typeDisplayMap: Record<string, string> = {
  "Master": "主数据",
  "Transaction": "交易数据",
  "Result": "结果数据",
};

const TypeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [node, setNode] = useState<KnowledgeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    const fetchNodeDetail = async () => {
      if (!id) return;
      setLoading(true);
      const request = new Request();
      try {
        const response = await request.request(`/quote/api/v1/digital/view/${id}`, {
          method: "GET",
        });
        if (response.status === 200 && response.data.data) {
          const item = response.data.data;
          const typeMap: Record<string, string> = {
            "1": "Master",
            "2": "Transaction",
            "3": "Result",
          };

          const mappedNode: KnowledgeNode = {
            id: item.objectCode,
            numericId: item.id,
            name: item.objectName,
            type: (typeMap[item.modelType] as KnowledgeNodeType) || "Master",
            description: item.description,
            icon: "Box",
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
            attributeCount: item.attributeCount,
            relationCount: item.relationCount,
            actionCount: item.actionCount,
            ruleCount: item.ruleCount,
          };
          setNode(mappedNode);
        } else {
          // Fallback to mock data
          const mockNode = mockKnowledgeNodes.find(n => n.numericId === Number(id) || n.id === id);
          if (mockNode) {
             console.log("Using mock data for node", id);
             setNode(mockNode);
          } else {
             setError(response.data.msg || "加载详情失败");
          }
        }
      } catch (err) {
        // Fallback to mock data
        const mockNode = mockKnowledgeNodes.find(n => n.numericId === Number(id) || n.id === id);
        if (mockNode) {
           console.log("Using mock data for node (on error)", id);
           setNode(mockNode);
        } else {
           setError("网络请求失败");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNodeDetail();
  }, [id]);

  const handleDelete = async () => {
    if (!node?.numericId) return;

    const request = new Request();
    try {
      const response = await request.delete("/quote/api/v1/digital", {
        data: { id: node.numericId },
      });

      if (response.status === 200) {
        toast({
          title: "成功",
          description: "对象类型删除成功",
        });
        navigate("/Knowledge/explorer");
      } else {
        toast({
          title: "删除失败",
          description: response.data.msg || "服务器错误",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Delete failed:", err);
      toast({
        title: "删除失败",
        description: err.message || "未知错误",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const getSourceBadge = (source: PropSource) => {
    switch (source) {
      case PropSource.DB_COLUMN:
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 font-normal shadow-none">
            数据库列
          </Badge>
        );
      case PropSource.COMPUTED:
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-100 font-normal shadow-none">
            计算属性
          </Badge>
        );
      case PropSource.EXTERNAL_SYNC:
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100 font-normal shadow-none">
            外部同步
          </Badge>
        );
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  const navItems = [
    { id: "basic", label: "基础信息", icon: Settings },
    { id: "properties", label: "属性列表", icon: Database, count: node?.properties.length },
    { id: "relations", label: "关系画布", icon: Share2, count: node?.relations.length },
    { id: "actions", label: "动作面板", icon: Zap, count: node?.actions.length },
    { id: "rules", label: "规则与推理", icon: BookOpen, count: node?.rules.length },
  ];

  if (loading)
    return (
      <div className="p-10 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  if (error || !node) return <div className="p-10 text-center text-red-500">加载节点数据失败。</div>;

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
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <Box className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-slate-900">{node.name}</h1>
                <Badge variant="outline" className="font-mono bg-slate-50 text-slate-600 border-slate-200">
                  {typeDisplayMap[node.type] || node.type}
                </Badge>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                架构定义
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                {node.id}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/Knowledge/editor", { state: { initialData: node } })}>
            <Edit className="h-4 w-4 mr-2" /> 编辑架构
          </Button>

          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="text-red-500 hover:bg-red-50 hover:text-red-600 border-red-100"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>删除对象类型？</AlertDialogTitle>
                <AlertDialogDescription>
                  您确定要删除“{node.name}”吗？这将删除架构定义。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
                  删除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 overflow-y-auto flex flex-col z-10 py-6">
          <div className="px-4 flex-1">
            <div className="space-y-1">
              {navItems.map((item) => (
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
                  {item.count !== undefined ? (
                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">{item.count}</span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-hidden flex flex-col bg-white">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full">
            <div className="h-14 border-b bg-white flex items-center px-8 sticky top-0 shrink-0">
              <h2 className="text-lg font-semibold text-slate-800">
                {activeTab === "basic" && "基础信息"}
                {activeTab === "properties" && "属性列表"}
                {activeTab === "relations" && "关系画布"}
                {activeTab === "actions" && "动作面板"}
                {activeTab === "rules" && "规则"}
              </h2>
            </div>

            <div className="flex-1 p-8 overflow-hidden flex flex-col">
              <div className="max-w-[1200px] w-full h-full flex flex-col">
                
                {/* 1. Basic Info */}
                {activeTab === "basic" && (
                  <TabsContent value="basic" className="mt-0 h-full flex flex-col overflow-y-auto" forceMount>
                     <div className="space-y-6 p-1">
                      <section className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                        <div className="grid grid-cols-12 gap-8">
                          <div className="col-span-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-500">对象名称</Label>
                                <div className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                  {node.name}
                                  <Badge variant="outline" className="ml-2 font-normal text-xs text-blue-600 bg-blue-50 border-blue-100">
                                    {typeDisplayMap[node.type] || node.type}
                                  </Badge>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-500">唯一标识</Label>
                                <div className="font-mono text-sm text-slate-700 bg-slate-50 px-3 py-1.5 rounded w-fit border border-slate-200">
                                  {node.id}
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-slate-500">描述</Label>
                              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-700 leading-relaxed min-h-[100px]">
                                {node.description || "未提供描述。"}
                              </div>
                            </div>
                          </div>
                          
                          {/* Metrics Panel */}
                          <div className="col-span-4 bg-slate-50 rounded-lg p-5 border border-slate-100 flex flex-col">
                            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                              模型重要性指标
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
                                <div className="text-xs text-slate-500 mb-1">入度</div>
                                <div className="text-xl font-bold text-slate-900">{node.stats.inDegree}</div>
                              </div>
                              <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
                                <div className="text-xs text-slate-500 mb-1">出度</div>
                                <div className="text-xl font-bold text-slate-900">{node.stats.outDegree}</div>
                              </div>
                              <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
                                <div className="text-xs text-slate-500 mb-1">引用数</div>
                                <div className="text-xl font-bold text-slate-900">{node.stats.referenceCount}</div>
                              </div>
                              <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
                                <div className="text-xs text-slate-500 mb-1">使用频率</div>
                                <div className="text-xl font-bold text-slate-900">{node.stats.usageFrequency}%</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>
                  </TabsContent>
                )}

                {/* 2. Properties (Schema Only) */}
                {activeTab === "properties" && (
                  <TabsContent value="properties" className="mt-0 h-full flex flex-col" forceMount>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
                      <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0 z-10 shadow-sm">
                            <tr>
                              <th className="px-6 py-3 border-b">属性名称</th>
                              <th className="px-6 py-3 border-b">数据类型</th>
                              <th className="px-6 py-3 border-b">来源</th>
                              <th className="px-6 py-3 border-b">技术映射</th>
                              <th className="px-6 py-3 border-b">描述</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {node.properties.map((prop) => (
                              <tr key={prop.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900">{prop.name}</td>
                                <td className="px-6 py-4 text-slate-500 font-mono text-xs">{prop.type}</td>
                                <td className="px-6 py-4">{getSourceBadge(prop.source)}</td>
                                <td className="px-6 py-4">
                                  {prop.source === PropSource.DB_COLUMN && prop.relatedDbColumn ? (
                                    <div className="flex items-center gap-1.5 font-mono text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200 w-fit">
                                      <Database className="w-3 h-3 text-slate-400" />
                                      {prop.relatedDbColumn}
                                    </div>
                                  ) : (
                                    <span className="text-slate-300 text-xs">-</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-slate-400 text-xs max-w-xs truncate" title={prop.description}>
                                  {prop.description || "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </TabsContent>
                )}

                {/* 3. Relations (Structural Only) */}
                {activeTab === "relations" && (
                  <TabsContent value="relations" className="mt-0 h-full flex flex-col" forceMount>
                     <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
                      <RelationGraphEditor
                        currentId={node.id}
                        currentName={node.name}
                        relations={node.relations}
                        readOnly={true}
                      />
                    </div>
                  </TabsContent>
                )}

                {/* 4. Actions (Definition Only) */}
                {activeTab === "actions" && (
                  <TabsContent value="actions" className="mt-0 h-full flex flex-col" forceMount>
                    <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                      <div className="flex-1 overflow-y-auto p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {node.actions.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-slate-400 italic">未定义动作。</div>
                          ) : (
                            node.actions.map((action) => (
                              <div key={action.name} className="flex flex-col p-5 border rounded-xl bg-white relative overflow-hidden group transition-all border-slate-200 hover:border-blue-200 hover:shadow-sm">
                                {action.riskLevel === "High" && (
                                  <div className="absolute top-0 right-0 p-2">
                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                  </div>
                                )}
                                <div className="flex items-center justify-between mb-3">
                                  <h3 className="font-bold text-slate-900">{action.label}</h3>
                                  <Badge variant="secondary" className="bg-slate-100">{action.httpMethod}</Badge>
                                </div>
                                <div className="text-xs text-slate-500 mb-2">仅作为能力定义 - 此处无法执行</div>
                                <code className="block w-full bg-slate-50 p-2 rounded text-xs text-slate-600 font-mono mb-4 break-all border border-slate-100">
                                  {action.apiEndpoint}
                                </code>
                                <div className="mt-auto space-y-2">
                                  {action.conditions && action.conditions.length > 0 && (
                                    <div className="flex items-start gap-2 text-xs text-slate-500">
                                      <span className="font-medium min-w-[60px] text-slate-700">前置条件：</span>
                                      <ul className="list-disc pl-3 space-y-0.5">
                                        {action.conditions.map((cond, i) => <li key={i}>{cond}</li>)}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                )}

                {/* 5. Rules (Schema Definition) */}
                {activeTab === "rules" && (
                  <TabsContent value="rules" className="mt-0 h-full flex flex-col" forceMount>
                    <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                      <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {node.rules.length === 0 ? (
                          <div className="text-center py-8 text-slate-400 italic">未定义规则。</div>
                        ) : (
                          node.rules.map((rule) => (
                            <div key={rule.id} className="p-4 rounded-lg border flex flex-col gap-2 transition-all bg-white border-slate-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-slate-900">{rule.name}</h3>
                                </div>
                                <span className="text-xs font-mono text-slate-400">#{rule.id}</span>
                              </div>
                              <p className="text-sm text-slate-600">{rule.description}</p>
                              <div className="mt-2 p-3 bg-slate-50 rounded border border-slate-200 font-mono text-xs text-indigo-600 overflow-x-auto">
                                {rule.expression}
                              </div>
                            </div>
                          ))
                        )}
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

export default TypeDetailPage;
