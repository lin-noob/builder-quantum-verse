import React from "react";
import { motion } from "framer-motion";
import { Box, Share2, Zap, GitMerge, AlertCircle, Database, Eye } from "lucide-react";
import { KnowledgeNode, KnowledgeNodeType } from "../../types/Knowledge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ObjectCardProps {
  node: KnowledgeNode;
  instanceCount?: number;
  onClick: (id: string | number) => void;
  onViewInstances?: (id: string) => void;
}

const typeMap: Record<string, string> = {
  Master: "主数据",
  Transaction: "事务数据",
  Result: "结果数据",
};

const getTypeColor = (type: KnowledgeNodeType) => {
  switch (type) {
    case "Master":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "Transaction":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "Result":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const ObjectCard: React.FC<ObjectCardProps> = ({ node, instanceCount = 0, onClick, onViewInstances }) => {
  const hasHighRisk =
    node.actions.some((a) => a.riskLevel === "High") ||
    node.rules.some((r) => r.description.toLowerCase().includes("high risk"));

  const totalLinks = node.stats.inDegree + node.stats.outDegree;

  // Derive Tags
  const tags: string[] = [];
  if (node.type === "Master") tags.push("Core");
  if (node.stats.usageFrequency > 80) tags.push("High-Freq");
  if (node.stats.referenceCount > 1000) tags.push("Hot");
  if (hasHighRisk) tags.push("Risk-Critical");

  return (
    <TooltipProvider>
      <motion.div
        layout
        initial={{ opacity: 1, scale: 1 }}
        whileHover={{
          scale: 1.02,
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        }}
        whileTap={{ scale: 0.95, opacity: 0.8 }}
        onClick={() => onClick(node.numericId || node.id)}
        className={`
          relative flex flex-col p-5 rounded-xl border cursor-pointer transition-all duration-300 group
          ${
            hasHighRisk
              ? "border-red-200 bg-gradient-to-br from-white to-red-50/40 shadow-sm"
              : "border-slate-200 bg-white hover:border-blue-300"
          }
        `}
      >
        {/* High Risk Indicator */}
        {hasHighRisk && (
          <div className="absolute top-3 right-3 flex items-center justify-center">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 duration-1000"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 shadow-md"></span>
            </span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${getTypeColor(node.type)} bg-opacity-20`}>
            <Box className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 leading-none mb-1.5">{node.name}</h3>
            <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getTypeColor(node.type)}`}>
                {typeMap[node.type] || node.type}
                </span>
                {instanceCount > 0 && (
                     <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                        <Database className="w-3 h-3" />
                        {instanceCount > 1000 ? `${(instanceCount / 1000).toFixed(1)}k` : instanceCount}
                     </span>
                )}
            </div>
          </div>
        </div>

        {/* Body: 2x2 Grid */}
        <div className="grid grid-cols-2 gap-3 mt-auto mb-4">
          {/* Properties */}
          <div className="flex flex-col items-start p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
            <span className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5 text-slate-400" /> 属性
            </span>
            <span className="text-lg font-bold text-slate-700">{node.attributeCount ?? node.properties.length}</span>
          </div>

          {/* Relations with Tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-col items-start p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors group/item">
                <span className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-slate-400 group-hover/item:text-blue-500 transition-colors" /> 关系
                </span>
                <span className="text-lg font-bold text-slate-700">{node.relationCount ?? totalLinks}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-800 text-slate-50 border-slate-700">
              <p className="text-xs font-semibold mb-1 text-slate-300">关联对象 (Top 3):</p>
              <ul className="text-xs list-disc pl-3 space-y-0.5">
                {node.relations.slice(0, 3).map((r, i) => (
                  <li key={i} className="text-slate-200">
                    {r.semanticName} → {r.targetNodeType}
                  </li>
                )) || <li className="text-slate-500 italic">无关联</li>}
                {node.relations.length > 3 && <li className="text-slate-500 italic">...</li>}
                {node.relations.length === 0 && <li className="text-slate-500 italic">暂无</li>}
              </ul>
            </TooltipContent>
          </Tooltip>

          {/* Actions with Tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-col items-start p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors group/item">
                <span className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-slate-400 group-hover/item:text-amber-500 transition-colors" /> 动作
                </span>
                <span className="text-lg font-bold text-slate-700">{node.actionCount ?? node.actions.length}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-800 text-slate-50 border-slate-700">
              <p className="text-xs font-semibold mb-1 text-slate-300">可用动作 (Top 3):</p>
              <ul className="text-xs list-disc pl-3 space-y-0.5">
                {node.actions.slice(0, 3).map((a, i) => (
                  <li key={i} className="text-slate-200">
                    {a.label}
                  </li>
                ))}
                {node.actions.length > 3 && <li className="text-slate-500 italic">...</li>}
                {node.actions.length === 0 && <li className="text-slate-500 italic">暂无</li>}
              </ul>
            </TooltipContent>
          </Tooltip>

          {/* References with Progress Bar */}
          <div className="flex flex-col items-start p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors relative overflow-hidden">
            <div
              className="absolute bottom-0 left-0 h-1 bg-emerald-500/20 transition-all duration-500"
              style={{ width: `${Math.min(node.stats.usageFrequency, 100)}%` }}
            />
            <span className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1.5 relative z-10">
              <GitMerge className="w-3.5 h-3.5 text-slate-400" /> 引用
            </span>
            <span className="text-lg font-bold text-slate-700 relative z-10">{node.ruleCount}</span>
          </div>
        </div>

        {/* View Instances Button */}
        <div className="mt-2 pt-3 border-t border-slate-100 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
             <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 w-full"
                onClick={(e) => {
                    e.stopPropagation();
                    if(onViewInstances) onViewInstances(node.id);
                }}
            >
                <Eye className="w-3 h-3 mr-1.5" />
                查看实例
            </Button>
        </div>
        
        {/* Footer Description (only visible when not hovering or minimal info?) 
            Actually, let's keep it but maybe hide when hovering if space is tight? 
            Or just keep it. 
        */}
      </motion.div>
    </TooltipProvider>
  );
};

export default ObjectCard;
