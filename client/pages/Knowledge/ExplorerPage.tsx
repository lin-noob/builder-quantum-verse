import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, PackageOpen, Layers, Database, ScanLine, CloudUpload } from "lucide-react";
import ObjectCard from "../../components/Knowledge/ObjectCard";
import InstanceSummaryCard from "../../components/Knowledge/InstanceSummaryCard";
import DataImportDialog from "../../components/Knowledge/DataImportDialog";
import {
  KnowledgeNodeType,
  KnowledgeNode,
  PropSource,
  RiskLevel,
  KnowledgeInstanceSummary,
} from "../../types/Knowledge";
import { Button } from "@/components/ui/button";
import { Request } from "@/lib/request";
import { useDebounce } from "@/hooks/useDebounce";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ViewMode = "schema" | "instance";

const ExplorerPage: React.FC = () => {
  const navigate = useNavigate();

  // Global State
  const [viewMode, setViewMode] = useState<ViewMode>("schema");
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [loading, setLoading] = useState(true);

  // Shared Filter State (Applies to card list in BOTH modes)
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<KnowledgeNodeType | "All">("All");

  // Instance-Specific State
  const [instanceIdSearch, setInstanceIdSearch] = useState("");
  const [expandedTypeIds, setExpandedTypeIds] = useState<string[]>([]);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 500);
  const debouncedInstanceIdSearch = useDebounce(instanceIdSearch, 500);

  // Fetch Nodes (Schema Data)
  useEffect(() => {
    const fetchNodes = async () => {
      setLoading(true);
      // Simulate API call with mock data
      try {
        const request = new Request();
        const response = await request.request("/quote/api/v1/digital/list", {
          method: "GET",
          params: { objectName: debouncedSearch },
        });

        if (response.status === 200) {
          const apiData = response.data.data || [];
          const typeMap: Record<number, KnowledgeNodeType> = {
            1: "Master",
            2: "Transaction",
            3: "Result",
          };

          const mappedNodes: KnowledgeNode[] = apiData.map((item: any) => ({
            id: item.objectCode,
            numericId: item.id,
            name: item.objectName,
            type: typeMap[item.modelType] || "Master",
            description: item.description,
            icon: "Box", // Default icon
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
            attributeCount: item.attributeCount ?? 0,
            relationCount: item.relationCount ?? 0,
            actionCount: item.actionCount ?? 0,
            ruleCount: item.ruleCount ?? 0,
            instanceCount: item.instanceCount ?? 0,
          }));
          setNodes(mappedNodes);
        } else {
        }
      } catch (err) {
        console.error("Failed to load knowledge nodes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNodes();
  }, [debouncedSearch]);

  // Derived State: Filtered Nodes (Used for both views)
  const filteredNodes = useMemo(() => {
    let result = [...nodes];

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (node) => node.name.toLowerCase().includes(lowerQuery) || node.id.toLowerCase().includes(lowerQuery),
      );
    }

    if (selectedType !== "All") {
      result = result.filter((node) => node.type === selectedType);
    }

    // Sort by usage frequency (popularity) default
    result.sort((a, b) => b.stats.usageFrequency - a.stats.usageFrequency);

    return result;
  }, [nodes, searchQuery, selectedType]);

  // Derived State: Instance Summaries (Mocked)
  // We compute this for ALL nodes, but only look it up when rendering
  const instanceSummariesMap = useMemo(() => {
    const map = new Map<string, KnowledgeInstanceSummary>();
    nodes.forEach((node) => {
      map.set(node.id, {
        typeId: node.id,
        modelId: node.numericId || 0,
        typeName: node.name,
        type: node.type,
        totalInstances: node.instanceCount || 0,
        statusDistribution: {
          CREATED: Math.floor(Math.random() * 100),
          ACTIVE: Math.floor(Math.random() * 500),
          ARCHIVED: Math.floor(Math.random() * 50),
        },
        recentActivityCount: Math.floor(Math.random() * 2000),
        relationCount: node.relationCount || 0,
      });
    });
    return map;
  }, [nodes]);

  // Handle Instance ID Search Jump
  useEffect(() => {
    if (debouncedInstanceIdSearch) {
      // Mock Search Logic:
      // If query starts with "ID-", "ORD-", "SKU-" treat as direct hit
      if (debouncedInstanceIdSearch.match(/^(ID-|ORD-|SKU-)/i)) {
        // Direct jump to instance detail
        navigate(`/Knowledge/instance/${debouncedInstanceIdSearch}`);
      }
    }
  }, [debouncedInstanceIdSearch, navigate]);

  // Handlers
  const handleSchemaCardClick = (id: string | number) => {
    navigate(`/Knowledge/type/${id}`);
  };

  const handleViewInstances = (typeId: string) => {
    setViewMode("instance");
    // We don't clear the main search because we want to keep context
    // But we expand the target
    setExpandedTypeIds([typeId]);
  };

  const handleToggleExpand = (typeId: string) => {
    setExpandedTypeIds((prev) => (prev.includes(typeId) ? prev.filter((id) => id !== typeId) : [...prev, typeId]));
  };

  const handleCreateObject = () => {
    navigate("/Knowledge/editor");
  };

  if (loading && nodes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-[#F8F9FB] flex flex-col overflow-hidden">
      {/* Header Area */}
      <div className="bg-white/50 backdrop-blur-md border-b border-slate-200/60 px-8 py-6 sticky top-0 z-10">
        {/* View Switcher (Top Center) */}
        <div className="flex justify-center mb-6">
          <div className="bg-slate-100 p-1 rounded-lg flex shadow-inner relative">
            {/* Animated Background Pill */}
            <motion.div
              layout
              className="absolute top-1 bottom-1 bg-white rounded-md shadow-sm z-0"
              initial={false}
              animate={{
                left: viewMode === "schema" ? "4px" : "50%",
                width: "calc(50% - 4px)",
                x: viewMode === "schema" ? 0 : 0, // handled by left/width
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />

            <button
              onClick={() => setViewMode("schema")}
              className={`relative z-10 px-6 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${
                viewMode === "schema" ? "text-blue-700" : "text-slate-500 hover:text-slate-700"
              }`}
              style={{ width: "160px" }}
            >
              <div className="flex items-center justify-center gap-2">
                <Layers className="w-4 h-4" />
                模式视图
              </div>
            </button>
            <button
              onClick={() => setViewMode("instance")}
              className={`relative z-10 px-6 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${
                viewMode === "instance" ? "text-purple-700" : "text-slate-500 hover:text-slate-700"
              }`}
              style={{ width: "160px" }}
            >
              <div className="flex items-center justify-center gap-2">
                <Database className="w-4 h-4" />
                全域视图
              </div>
            </button>
          </div>
        </div>

        {/* Unified Header & Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">知识对象模型</h1>
            <p className="text-slate-500 text-sm font-medium mt-2">定义业务对象的结构与全域运行实例监控。</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Shared Toolbar Items */}
            <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
              <SelectTrigger className="w-[140px] bg-white border-slate-200 shadow-sm">
                <SelectValue placeholder="筛选类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">全部类型</SelectItem>
                <SelectItem value="Master">主数据</SelectItem>
                <SelectItem value="Transaction">交易数据</SelectItem>
                <SelectItem value="Result">结果数据</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Search (Always Visible) */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="搜索类型名称/ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm w-56 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all shadow-sm"
              />
            </div>

            {/* Instance ID Search (Visible in Instance Mode or Always?) 
                User said "Don't change filter conditions". 
                To keep layout stable, we'll keep it visible but maybe placeholder text clarifies usage?
                Or we conditionally show it but with AnimatePresence to be smooth? 
                Let's make it always visible but styled as "Quick Jump".
            */}
            <div className="relative group">
              <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-purple-500 transition-colors" />
              <input
                type="text"
                placeholder="查找实例 ID..."
                value={instanceIdSearch}
                onChange={(e) => setInstanceIdSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm w-48 focus:ring-2 focus:ring-purple-100 focus:border-purple-400 outline-none transition-all shadow-sm"
              />
            </div>

            <Button
              variant="outline"
              onClick={() => setIsImportDialogOpen(true)}
              className="border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/30 text-slate-600 hover:text-blue-600 transition-all rounded-full h-10 px-6 gap-2 bg-white"
            >
              <CloudUpload className="h-4 w-4" />
              导入数据
            </Button>

            <Button
              onClick={handleCreateObject}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md rounded-full h-10 px-6"
            >
              <Plus className="h-4 w-4 mr-2" />
              新建模型
            </Button>
          </div>
        </div>
      </div>

      {/* Import Dialog */}
      <DataImportDialog isOpen={isImportDialogOpen} onOpenChange={setIsImportDialogOpen} nodes={nodes} />

      {/* Main Content Grid */}
      <div className="flex-1 overflow-y-auto p-8 flex flex-col min-h-0">
        <div className="max-w-[1600px] mx-auto w-full h-full flex flex-col">
          {/* 
                Unified Grid 
                We use layout prop on motion.div to animate position changes.
                We toggle content inside the card.
            */}
          {filteredNodes.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10 content-start"
            >
              <AnimatePresence mode="popLayout">
                {filteredNodes.map((node) => (
                  <motion.div
                    layout
                    key={node.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className={expandedTypeIds.includes(node.id) && viewMode === "instance" ? "col-span-full" : ""}
                  >
                    {/* 
                                    Conditional Rendering based on ViewMode.
                                    Since we want "field switch" feel, we just swap the component.
                                    The outer motion.div handles the grid layout animation.
                                    The components themselves are structurally similar now.
                                */}
                    {viewMode === "schema" ? (
                      <ObjectCard
                        node={node}
                        instanceCount={instanceSummariesMap.get(node.id)?.totalInstances}
                        onClick={handleSchemaCardClick}
                        onViewInstances={handleViewInstances}
                      />
                    ) : (
                      <InstanceSummaryCard
                        summary={instanceSummariesMap.get(node.id)!}
                        expanded={expandedTypeIds.includes(node.id)}
                        onToggle={handleToggleExpand}
                      />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <EmptyState
              title="未找到数据"
              desc="调整筛选条件或搜索关键词。"
              onReset={() => {
                setSearchQuery("");
                setSelectedType("All");
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ title, desc, onReset }: { title: string; desc: string; onReset: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center h-96 text-center"
  >
    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4 border border-slate-200">
      <PackageOpen className="w-10 h-10 text-slate-400" />
    </div>
    <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-500 max-w-sm mb-6">{desc}</p>
    <Button variant="outline" onClick={onReset}>
      重置筛选
    </Button>
  </motion.div>
);

export default ExplorerPage;
