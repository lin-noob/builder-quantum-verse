import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus,
  PackageOpen,
  LayoutGrid,
  Network,
  Activity,
  GitGraph
} from 'lucide-react';
import { useKnowledge } from '../../contexts/KnowledgeContext';
import ObjectCard from '../../components/Knowledge/ObjectCard';
import { KnowledgeNodeType, KnowledgeNode } from '../../types/knowledge';
import { Button } from "@/components/ui/button";
import { KnowledgeObjectWizard } from '../../components/Knowledge/KnowledgeObjectWizard';

// Lazy load graph view to avoid heavy initial load
const GraphGlobalView = React.lazy(() => import('./GraphGlobalView'));

type SortOption = 'popularity' | 'complexity';
type RiskFilterOption = 'all' | 'high' | 'low';

const ExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const { nodes, loading, error } = useKnowledge();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<KnowledgeNodeType | 'All'>('All');
  const [riskFilter, setRiskFilter] = useState<RiskFilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  
  // Wizard State
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<'objects' | 'graph'>('objects');

  // Derived State
  const filteredAndSortedNodes = useMemo(() => {
    // ... existing filtering logic
    let result = [...nodes];

    // 1. Search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(node => 
        node.name.toLowerCase().includes(lowerQuery) || 
        node.description?.toLowerCase().includes(lowerQuery)
      );
    }

    // 2. Type Filter
    if (selectedType !== 'All') {
      result = result.filter(node => node.type === selectedType);
    }

    // 3. Risk Filter
    if (riskFilter !== 'all') {
      result = result.filter(node => {
        const hasHighRisk = node.actions.some(a => a.riskLevel === 'High');
        if (riskFilter === 'high') return hasHighRisk;
        if (riskFilter === 'low') return !hasHighRisk;
        return true;
      });
    }

    // 4. Sort
    result.sort((a, b) => {
      if (sortBy === 'popularity') {
        // Sort by usage frequency (descending)
        return b.stats.usageFrequency - a.stats.usageFrequency;
      } else {
        // Sort by complexity: sum of props + relations + actions (descending)
        const complexityA = a.properties.length + a.relations.length + a.actions.length;
        const complexityB = b.properties.length + b.relations.length + b.actions.length;
        return complexityB - complexityA;
      }
    });

    return result;
  }, [nodes, searchQuery, selectedType, riskFilter, sortBy]);

  const handleCardClick = (id: string) => {
    navigate(`/knowledge/explorer/${id}`);
  };

  const handleCreateObject = () => {
    navigate('/knowledge/editor');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB] text-red-500">
        错误: {error}
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-[#F8F9FB] flex flex-col overflow-hidden">
      {/* Header Area (Matching EnterpriseModelOverview) */}
      <div className="bg-white/50 backdrop-blur-md border-b border-slate-200/60 px-8 py-6 sticky top-0 z-10">
        
        {/* Row 1: Tabs & Meta Actions */}
        <div className="flex justify-between items-center mb-8">
          {/* Tab Switcher - Capsule Style */}
          <div className="bg-slate-100/80 p-1 rounded-full flex gap-1 border border-slate-200/50">
            <button
              onClick={() => setActiveTab("objects")}
              className={`
                flex items-center gap-2 px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-300
                ${activeTab === "objects" 
                  ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}
              `}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              知识对象列表
            </button>
            <button
              onClick={() => setActiveTab("graph")}
              className={`
                flex items-center gap-2 px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-300
                ${activeTab === "graph" 
                  ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}
              `}
            >
              <GitGraph className="w-3.5 h-3.5" />
              知识图谱全览
            </button>
          </div>
        </div>

        {/* Row 2: Title & Context & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
           <div className="flex-1">
             <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                  企业数字模型
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={activeTab}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 ml-2 font-semibold"
                    >
                       - {activeTab === 'objects' ? '知识对象' : '图谱视图'}
                    </motion.span>
                  </AnimatePresence>
                </h1>
             </div>
             <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
               {activeTab === 'objects' ? '管理和浏览所有定义的业务知识对象' : '可视化查看对象间的拓扑关系与风险传播'}
             </p>
           </div>
           
           <div className="flex items-center gap-3">
             <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="搜索对象..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm w-64 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all shadow-sm"
              />
            </div>
            <Button onClick={handleCreateObject} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              新建对象
            </Button>
          </div>
        </div>

      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 flex flex-col min-h-0">
        <div className="max-w-[1600px] mx-auto w-full h-full flex flex-col">
          <AnimatePresence mode="wait">
            {activeTab === 'objects' ? (
              <motion.div 
                key="objects"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="flex-1"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                     <Activity className="w-4 h-4 text-emerald-500" />
                     <span className="font-medium text-slate-700">{filteredAndSortedNodes.length}</span> 个活跃对象
                  </div>
                </div>

                {filteredAndSortedNodes.length > 0 ? (
                  <motion.div 
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10"
                  >
                    <AnimatePresence>
                      {filteredAndSortedNodes.map((node) => (
                        <ObjectCard 
                          key={node.id} 
                          node={node} 
                          onClick={handleCardClick} 
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  /* Empty State */
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center h-96 text-center"
                  >
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4 border border-slate-200">
                      <PackageOpen className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">未找到对象</h3>
                    <p className="text-slate-500 max-w-sm mb-6">
                      我们找不到任何符合您当前筛选条件的知识对象。
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedType('All');
                        setRiskFilter('all');
                      }}
                    >
                      清除所有筛选
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="graph"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex-1 h-full min-h-[600px]"
              >
                <React.Suspense fallback={<div className="h-full flex items-center justify-center">Loading Graph...</div>}>
                  <GraphGlobalView />
                </React.Suspense>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Wizard Modal */}
      {/* Removed Wizard Modal as we moved to full page editor */}
    </div>
  );
};

export default ExplorerPage;
