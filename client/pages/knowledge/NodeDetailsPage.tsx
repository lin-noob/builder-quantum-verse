import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Share2, 
  Database, 
  Calculator, 
  Globe, 
  Zap, 
  AlertTriangle, 
  BookOpen, 
  Box,
  Edit,
  Trash2,
  Info,
  Settings,
  ShoppingCart,
  FileText
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import RelationGraphEditor from './RelationGraphEditor';
import { useKnowledge } from '../../contexts/KnowledgeContext';
import { PropSource, KnowledgeNode, LifecycleStatus } from '../../types/knowledge';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const NodeDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getNodeById, loading, error } = useKnowledge();
  
  const node = id ? getNodeById(id) : undefined;
  
  const [activeTab, setActiveTab] = useState('basic');
  const [propertySearch, setPropertySearch] = useState('');
  const [propertySortKey, setPropertySortKey] = useState<'name' | 'type' | 'source'>('name');
  const [propertySortAsc, setPropertySortAsc] = useState(true);
  const [showAllProperties, setShowAllProperties] = useState(false);

  if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;
  if (error || !node) return <div className="p-10 text-center text-red-500">未找到节点或加载数据错误。</div>;

  const handleEditObject = () => {
    navigate('/knowledge/editor', { state: { initialData: node } });
  };

  const toggleRelation = (relName: string) => {
    setExpandedRelations(prev => 
      prev.includes(relName) 
        ? prev.filter(r => r !== relName) 
        : [...prev, relName]
    );
  };

  const getSourceBadge = (source: PropSource) => {
    switch (source) {
      case PropSource.DB_COLUMN:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 font-normal shadow-none">数据库字段</Badge>;
      case PropSource.COMPUTED:
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-100 font-normal shadow-none">计算字段</Badge>;
      case PropSource.EXTERNAL_SYNC:
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100 font-normal shadow-none">外部同步</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  const getTypeIcon = (type: KnowledgeNode['type']) => {
    switch (type) {
      case 'Master':
        return Database;
      case 'Transaction':
        return ShoppingCart;
      case 'Result':
        return FileText;
      default:
        return Box;
    }
  };

  const getLifecycleLabel = (status?: LifecycleStatus) => {
    if (status === 'active') return '活跃';
    if (status === 'deprecated') return '已弃用';
    return '未配置';
  };

  const getLifecycleClass = (status?: LifecycleStatus) => {
    if (status === 'active') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (status === 'deprecated') return 'bg-slate-100 text-slate-500 border-slate-200';
    return 'bg-slate-50 text-slate-500 border-slate-200';
  };

  const filteredProperties = node
    ? node.properties
        .filter((prop) => {
          if (!propertySearch) return true;
          const keyword = propertySearch.toLowerCase();
          return (
            prop.name.toLowerCase().includes(keyword) ||
            prop.type.toLowerCase().includes(keyword) ||
            prop.sourceLabel.toLowerCase().includes(keyword)
          );
        })
        .sort((a, b) => {
          const dir = propertySortAsc ? 1 : -1;
          if (propertySortKey === 'name') {
            return a.name.localeCompare(b.name) * dir;
          }
          if (propertySortKey === 'type') {
            return a.type.localeCompare(b.type) * dir;
          }
          return a.sourceLabel.localeCompare(b.sourceLabel) * dir;
        })
    : [];

  const visibleProperties =
    showAllProperties || filteredProperties.length <= 10
      ? filteredProperties
      : filteredProperties.slice(0, 10);

  const navItems = [
    { id: 'basic', label: '基础信息', icon: Settings },
    { id: 'properties', label: '属性列表', icon: Database, count: node.properties.length },
    { id: 'relations', label: '关系画布', icon: Share2, count: node.relations.length },
    { id: 'actions', label: '动作面板', icon: Zap, count: node.actions.length },
    { id: 'rules', label: '规则与推理', icon: BookOpen, count: node.rules.length },
  ];

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col bg-white overflow-hidden">
      <header className="h-16 border-b flex items-center px-6 justify-between shrink-0 bg-white z-20 shadow-sm sticky top-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50">
              {React.createElement(getTypeIcon(node.type), {
                className: "h-5 w-5 text-blue-600",
              })}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-slate-900">
                  {node.name}
                </h1>
                <Badge variant="outline" className="font-mono bg-slate-50 text-slate-600 border-slate-200">
                  {node.type}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-xs border ${getLifecycleClass(node.lifecycleStatus)}`}
                >
                  生命周期：{getLifecycleLabel(node.lifecycleStatus)}
                </Badge>
              </div>
              <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>标识 ID：{node.id}</span>
                <span>版本：{node.version || '未配置'}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">
                      责任人：{node.owner || '未配置'}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs space-y-1">
                      <div>所属团队：{node.ownerTeam || '未配置'}</div>
                      <div>联系方式：{node.ownerContact || '未配置'}</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleEditObject}>
            <Edit className="h-4 w-4 mr-2" /> 编辑
          </Button>
          <Button variant="outline" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-600 border-red-100">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar: Navigation Only */}
        <aside className="w-64 bg-white border-r border-slate-200 overflow-y-auto flex flex-col z-10 py-6">
          <div className="px-4 flex-1">
            <div className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${activeTab === item.id 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-slate-600 hover:bg-slate-50'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-blue-600' : 'text-slate-400'}`} />
                    {item.label}
                  </div>
                  {item.count !== undefined ? (
                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">
                      {item.count}
                    </span>
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
               <h2 className="text-lg font-semibold text-slate-800">
                 {activeTab === 'basic' && '基础信息'}
                 {activeTab === 'properties' && '属性列表'}
                 {activeTab === 'relations' && '关系画布'}
                 {activeTab === 'actions' && '动作面板'}
                 {activeTab === 'rules' && '规则与推理'}
               </h2>
            </div>

            <div className="flex-1 p-8 overflow-hidden flex flex-col">
              <div className="max-w-[1200px] w-full h-full flex flex-col">
                
                {activeTab === 'basic' && (
                  <TabsContent value="basic" className="mt-0 h-full flex flex-col overflow-y-auto" forceMount>
                     <div className="shrink-0 space-y-4 mb-4">
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <Settings className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-blue-900">基础配置</h4>
                            <p className="text-xs text-blue-700 mt-1 leading-relaxed opacity-80">
                              查看业务对象的核心身份信息、描述及类型分类。
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
                                  <Label className="text-sm font-medium text-slate-500">对象名称</Label>
                                  <div className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                    {node.name}
                                    <Badge variant="outline" className="ml-2 font-normal text-xs text-blue-600 bg-blue-50 border-blue-100">
                                      {node.type}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium text-slate-500">唯一标识 (ID)</Label>
                                  <div className="font-mono text-sm text-slate-700 bg-slate-50 px-3 py-1.5 rounded w-fit border border-slate-200">
                                    {node.id}
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-500">业务描述</Label>
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-700 leading-relaxed min-h-[100px]">
                                  {node.description || '暂无描述'}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium text-slate-500">时间信息</Label>
                                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-xs text-slate-600 space-y-1.5">
                                    <div>创建时间：{node.createdAt || '未配置'}</div>
                                    <div>最后更新时间：{node.updatedAt || '未配置'}</div>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium text-slate-500">标签</Label>
                                  {node.tags && node.tags.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                      {node.tags.map((tag) => (
                                        <span
                                          key={tag}
                                          className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-700"
                                          title={tag}
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-xs text-slate-400">未设置标签</div>
                                  )}
                                </div>
                              </div>
                           </div>

                           {/* Stats Panel */}
                           <div className="col-span-4 bg-slate-50 rounded-lg p-5 border border-slate-100 flex flex-col justify-between">
                              <div>
                                <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                  <Calculator className="w-4 h-4 text-blue-600" /> 数据统计
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
                                <div className="text-xs text-slate-500 mb-1">引用次数</div>
                                    <div className="text-xl font-bold text-slate-900">{node.stats.referenceCount}</div>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4 pt-4 border-t border-slate-200">
                                <div className="text-xs text-slate-400 flex items-center justify-between">
                                  <span>上次更新: 2024-03-20</span>
                                  <span>版本: v1.0.2</span>
                                </div>
                              </div>
                           </div>
                        </div>
                      </section>
                   </div>
                  </TabsContent>
                )}

                {/* 1. Properties */}
                {activeTab === 'properties' && (
                  <TabsContent value="properties" className="mt-0 h-full flex flex-col" forceMount>
                    <div className="shrink-0 space-y-4 mb-4">
                      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Database className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-blue-900">属性定义</h4>
                          <p className="text-xs text-blue-700 mt-1 leading-relaxed opacity-80">
                            当前对象包含的所有静态属性及其数据来源。
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
                      <div className="flex items-center justify-between px-6 py-3 border-b bg-slate-50">
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>共 {filteredProperties.length} 个属性</span>
                          {filteredProperties.length > 10 && (
                            <button
                              onClick={() => setShowAllProperties(!showAllProperties)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              {showAllProperties ? '折叠部分属性' : '展开全部属性'}
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <span>排序：</span>
                            <button
                              onClick={() => {
                                setPropertySortKey('name');
                                setPropertySortAsc(propertySortKey === 'name' ? !propertySortAsc : true);
                              }}
                              className={`px-2 py-0.5 rounded ${
                                propertySortKey === 'name' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'
                              }`}
                            >
                              按名称
                            </button>
                            <button
                              onClick={() => {
                                setPropertySortKey('type');
                                setPropertySortAsc(propertySortKey === 'type' ? !propertySortAsc : true);
                              }}
                              className={`px-2 py-0.5 rounded ${
                                propertySortKey === 'type' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'
                              }`}
                            >
                              按类型
                            </button>
                          </div>
                          <div className="relative">
                            <Input
                              value={propertySearch}
                              onChange={(e) => setPropertySearch(e.target.value)}
                              placeholder="搜索属性名称或类型"
                              className="h-8 text-xs pl-3 pr-3 w-56"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0 z-10 shadow-sm">
                            <tr>
                              <th className="px-6 py-3 border-b">属性名称</th>
                              <th className="px-6 py-3 border-b">类型</th>
                              <th className="px-6 py-3 border-b">来源</th>
                              <th className="px-6 py-3 border-b">数据库关联</th>
                              <th className="px-6 py-3 border-b">描述</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {visibleProperties.map((prop) => (
                              <tr key={prop.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900" title={prop.name}>{prop.name}</td>
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
                                  {prop.description || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </TabsContent>
                )}

                {/* 2. Relations */}
                {activeTab === 'relations' && (
                  <TabsContent value="relations" className="mt-0 h-full flex flex-col" forceMount>
                    <div className="shrink-0 space-y-4 mb-4">
                      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                             <Share2 className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-blue-900">类型关系图谱</h4>
                            <p className="text-xs text-blue-700 mt-1 leading-relaxed opacity-80">
                              可视化展示该对象类型的全局关系定义。
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
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

                {/* 3. Actions */}
                {activeTab === 'actions' && (
                  <TabsContent value="actions" className="mt-0 h-full flex flex-col" forceMount>
                    <div className="shrink-0 space-y-4 mb-4">
                      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Zap className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-blue-900">动作面板</h4>
                          <p className="text-xs text-blue-700 mt-1 leading-relaxed opacity-80">
                            对象可执行的操作列表及风险提示。
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                      <div className="flex-1 overflow-y-auto p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {node.actions.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-slate-400 italic">无可用动作。</div>
                          ) : (
                            node.actions.map((action) => (
                              <div 
                                key={action.name} 
                                className="flex flex-col p-5 border rounded-xl bg-white relative overflow-hidden group transition-all border-slate-200 hover:border-blue-200 hover:shadow-sm"
                              >
                                {action.riskLevel === 'High' && (
                                  <div className="absolute top-0 right-0 p-2">
                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                  </div>
                                )}
                                
                                <div className="flex items-center justify-between mb-3">
                                  <h3 className="font-bold text-slate-900">{action.label}</h3>
                                  <Badge variant="secondary" className={`
                                    ${action.httpMethod === 'GET' ? 'bg-blue-50 text-blue-700' :
                                      action.httpMethod === 'POST' ? 'bg-green-50 text-green-700' :
                                      action.httpMethod === 'DELETE' ? 'bg-red-50 text-red-700' : 'bg-slate-100'}
                                  `}>
                                    {action.httpMethod}
                                  </Badge>
                                </div>
                                
                                <code className="block w-full bg-slate-50 p-2 rounded text-xs text-slate-600 font-mono mb-4 break-all border border-slate-100">
                                  {action.apiEndpoint}
                                </code>
                                
                                <div className="mt-auto space-y-2">
                                  {action.conditions && action.conditions.length > 0 && (
                                    <div className="flex items-start gap-2 text-xs text-slate-500">
                                      <span className="font-medium min-w-[60px] text-slate-700">前提条件:</span>
                                      <ul className="list-disc pl-3 space-y-0.5">
                                        {action.conditions.map((cond, i) => (
                                          <li key={i}>{cond}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  {action.riskLevel === 'High' && (
                                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-2 py-1.5 rounded border border-red-100 font-medium">
                                      <AlertTriangle className="w-3 h-3" />
                                      高风险动作 - 需审批
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

                {/* 4. Rules */}
                {activeTab === 'rules' && (
                  <TabsContent value="rules" className="mt-0 h-full flex flex-col" forceMount>
                    <div className="shrink-0 space-y-4 mb-4">
                      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-blue-900">规则与推理</h4>
                          <p className="text-xs text-blue-700 mt-1 leading-relaxed opacity-80">
                            应用于该对象的业务验证与推理规则。
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                      <div className="flex-1 overflow-y-auto p-6 space-y-4">
                         {node.rules.length === 0 ? (
                          <div className="text-center py-8 text-slate-400 italic">未定义规则。</div>
                        ) : (
                          node.rules.map((rule) => {
                            return (
                              <div 
                                key={rule.id} 
                                className="p-4 rounded-lg border flex flex-col gap-2 transition-all bg-white border-slate-200"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-slate-900">
                                      {rule.name}
                                    </h3>
                                  </div>
                                  <span className="text-xs font-mono text-slate-400">#{rule.id}</span>
                                </div>
                                <p className="text-sm text-slate-600">{rule.description}</p>
                                
                                <div className="mt-2 p-3 bg-slate-50 rounded border border-slate-200 font-mono text-xs text-indigo-600 overflow-x-auto">
                                  {rule.expression}
                                </div>
                                
                                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 bg-slate-50/50 p-2 rounded">
                                  <Share2 className="w-3 h-3" />
                                  <span>影响范围: </span>
                                  <span className="font-medium text-slate-700">订单状态, 风险评分</span>
                                </div>
                              </div>
                            );
                          })
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

      {/* Wizard Modal Removed */}
    </div>
    </TooltipProvider>
  );
};

export default NodeDetailsPage;
