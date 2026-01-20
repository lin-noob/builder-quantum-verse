import React from "react";
import { motion } from "framer-motion";
import { Box, Share2, Zap, GitMerge, AlertCircle } from "lucide-react";
import { KnowledgeNode, KnowledgeNodeType } from "../../types/knowledge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface ObjectCardProps {
  node: KnowledgeNode;
  onClick: (id: string | number) => void;
}

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

const ObjectCard: React.FC<ObjectCardProps> = ({ node, onClick }) => {
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
          relative flex flex-col p-5 rounded-xl border cursor-pointer transition-all duration-300
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
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getTypeColor(node.type)}`}>
              {node.type}
            </span>
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
              <div className="flex flex-col items-start p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors group">
                <span className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" /> 关系
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
              <div className="flex flex-col items-start p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors group">
                <span className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 transition-colors" /> 动作
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

        {/* Tags Area */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className={`
                  text-[10px] h-5 px-1.5 border-0 font-medium
                  ${
                    tag === "Risk-Critical"
                      ? "bg-red-100 text-red-700"
                      : tag === "Core"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-600"
                  }
                `}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Footer / Description */}
        {node.description && (
          <p className="mt-auto text-xs text-slate-400 line-clamp-2 border-t border-slate-100 pt-3 leading-relaxed">
            {node.description}
          </p>
        )}
      </motion.div>
    </TooltipProvider>
  );
};

export default ObjectCard;
