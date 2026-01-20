import React from 'react';
import { motion } from 'framer-motion';
import { 
  Box, 
  Share2, 
  Zap, 
  GitMerge, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { KnowledgeNode, KnowledgeNodeType } from '../../types/knowledge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ObjectCardProps {
  node: KnowledgeNode;
  onClick: (id: string) => void;
}

const getTypeColor = (type: KnowledgeNodeType) => {
  switch (type) {
    case 'Master':
      return 'text-blue-700 border-blue-200 bg-blue-50';
    case 'Transaction':
      return 'text-emerald-700 border-emerald-200 bg-emerald-50';
    case 'Result':
      return 'text-purple-700 border-purple-200 bg-purple-50';
    default:
      return 'text-gray-700 border-gray-200 bg-gray-50';
  }
};

const ObjectCard: React.FC<ObjectCardProps> = ({ node, onClick }) => {
  const hasHighRisk = node.actions.some(a => a.riskLevel === 'High') || 
                      node.rules.some(r => r.description.toLowerCase().includes('high risk'));

  // Default to 0 if not present (backward compatibility)
  const refStats = node.stats.referencedBy || { actions: 0, rules: 0, flows: 0 };

  return (
    <TooltipProvider>
      <motion.div
        layout
        initial={{ opacity: 1, scale: 1 }}
        whileHover={{ 
          scale: 1.02,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}
        whileTap={{ scale: 0.95, opacity: 0.8 }}
        onClick={() => onClick(node.id)}
        className={`
          relative flex flex-col p-5 rounded-xl border cursor-pointer transition-all duration-300 h-full bg-white
          ${hasHighRisk 
            ? 'border-red-200 ring-1 ring-red-50 shadow-sm' 
            : 'border-slate-200 hover:border-blue-300'}
        `}
      >
        {/* Zone D: Risk Indicator (Absolute Positioned) */}
        {hasHighRisk && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute top-4 right-4 text-red-500 animate-pulse z-10">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>包含高风险动作</p>
              <p>用于关键工作流</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Zone A: Identity */}
        <div className="mb-4 pr-8">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className={`${getTypeColor(node.type)} border px-2 py-0.5 h-6 font-medium`}>
              {node.type}
            </Badge>
          </div>
          <h3 className="font-bold text-lg text-slate-900 mb-1.5">{node.name}</h3>
          <p className="text-sm text-slate-500 line-clamp-1 min-h-[1.25rem]">
            {node.description || "暂无描述"}
          </p>
        </div>

        {/* Zone B: Structure Counts */}
        <div className="flex flex-wrap gap-2 mb-5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-100 text-xs font-medium text-slate-600">
                <Box className="w-3.5 h-3.5 text-slate-400" />
                <span>属性 {node.properties.length}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-100 text-xs font-medium text-slate-600">
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                <span>关系 {node.relations.length}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-100 text-xs font-medium text-slate-600">
                <Zap className="w-3.5 h-3.5 text-slate-400" />
                <span>动作 {node.actions.length}</span>
            </div>
        </div>

        {/* Zone C: Referenced By */}
        <div className="mb-6 bg-slate-50/50 rounded-lg border border-slate-100 p-3">
          <div className="text-xs text-slate-400 font-medium mb-1.5 uppercase tracking-wider flex items-center gap-1">
             结构引用
          </div>
          <div className="flex items-center flex-wrap gap-y-1 gap-x-3 text-sm text-slate-700 font-medium">
             <span className="flex items-center gap-1.5">
                <span className="text-slate-500 font-normal">动作</span> 
                {refStats.actions}
             </span>
             <span className="text-slate-300">·</span>
             <span className="flex items-center gap-1.5">
                <span className="text-slate-500 font-normal">规则</span>
                {refStats.rules}
             </span>
             <span className="text-slate-300">·</span>
             <span className="flex items-center gap-1.5">
                <span className="text-slate-500 font-normal">流程</span>
                {refStats.flows}
             </span>
          </div>
        </div>

        {/* Zone E: Actions (Footer) */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
           <Button variant="ghost" size="sm" className="text-slate-500 hover:text-blue-600 px-0 hover:bg-transparent p-0 h-auto font-medium">
             查看详情 <ArrowRight className="w-4 h-4 ml-1" />
           </Button>
           {/* Placeholder for Edit or other actions if needed */}
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default ObjectCard;
