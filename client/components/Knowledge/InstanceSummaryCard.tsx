import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Activity, BarChart3, Database, ChevronDown, ChevronUp, Share2, List, LayoutGrid } from "lucide-react";
import { KnowledgeInstanceSummary, KnowledgeNodeType } from "../../types/Knowledge";
import { Button } from "@/components/ui/button";
import InstanceList from "./InstanceList";
import InstanceIndexGraph from "./InstanceIndexGraph";

interface InstanceSummaryCardProps {
  summary: KnowledgeInstanceSummary;
  expanded: boolean;
  onToggle: (typeId: string) => void;
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

const InstanceSummaryCard: React.FC<InstanceSummaryCardProps> = ({ summary, expanded, onToggle }) => {
  const [viewType, setViewType] = useState<"graph" | "list">("graph");

  const typeMap: Record<string, string> = {
    "Master": "主数据",
    "Transaction": "交易数据",
    "Result": "结果数据",
  };

  const statusMap: Record<string, string> = {
    "active": "活跃",
    "inactive": "非活跃",
    "deprecated": "已弃用",
    "draft": "草稿",
    "PAID": "已支付",
    "PENDING": "待支付",
    "SHIPPED": "已发货",
    "COMPLETED": "已完成",
    "CANCELLED": "已取消",
    "CREATED": "已创建",
    "Active": "活跃",
    "Frozen": "冻结",
    "Archived": "归档"
  };

  // Get top statuses
  const sortedStatuses = Object.entries(summary.statusDistribution)
    .sort(([, a], [, b]) => b - a);
  
  const topStatus = sortedStatuses[0] || ["未知", 0];
  const secondStatus = sortedStatuses[1] || ["其他", 0];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${expanded ? "col-span-full" : ""}`}
    >
      <motion.div
        layout
        onClick={() => !expanded && onToggle(summary.typeId)}
        className={`
          relative flex flex-col p-5 rounded-xl border transition-all duration-300 group bg-white
          ${
            expanded
              ? "border-purple-300 shadow-md ring-1 ring-purple-100"
              : "border-slate-200 hover:border-purple-300 hover:shadow-lg cursor-pointer"
          }
        `}
      >
        {/* Header - Consistent with ObjectCard */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${getTypeColor(summary.type || "Master")} bg-opacity-20`}>
            <Box className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 leading-none mb-1.5">{summary.typeName}</h3>
            <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getTypeColor(summary.type || "Master")}`}>
                {typeMap[summary.type || "Master"] || summary.type}
                </span>
            </div>
          </div>
          
          {/* Expand/Collapse Toggle Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 text-slate-400 hover:text-purple-600"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(summary.typeId);
            }}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {/* Body: 2x2 Grid - Consistent Layout with ObjectCard */}
        <div className="grid grid-cols-2 gap-3 mt-auto mb-4">
          {/* Total Instances */}
          <div className="flex flex-col items-start p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
            <span className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-slate-400" /> 实例总数
            </span>
            <span className="text-lg font-bold text-slate-700">{summary.totalInstances.toLocaleString()}</span>
          </div>

          {/* Core Relations (Replaced Activity) */}
          <div className="flex flex-col items-start p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
            <span className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-slate-400" /> 核心关系
            </span>
            <span className="text-lg font-bold text-slate-700">{summary.relationCount.toLocaleString()}</span>
          </div>

          {/* Top Status 1 */}
          <div className="flex flex-col items-start p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors relative overflow-hidden">
             {/* Progress Bar for distribution */}
             <div
              className="absolute bottom-0 left-0 h-1 bg-blue-500/20 transition-all duration-500"
              style={{ width: `${(topStatus[1] / summary.totalInstances) * 100}%` }}
            />
            <span className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1.5 relative z-10">
              <BarChart3 className="w-3.5 h-3.5 text-slate-400" /> {statusMap[topStatus[0]] || topStatus[0]}
            </span>
            <span className="text-lg font-bold text-slate-700 relative z-10">{topStatus[1].toLocaleString()}</span>
          </div>

          {/* Top Status 2 */}
          <div className="flex flex-col items-start p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors relative overflow-hidden">
             {/* Progress Bar for distribution */}
             <div
              className="absolute bottom-0 left-0 h-1 bg-purple-500/20 transition-all duration-500"
              style={{ width: `${(secondStatus[1] / summary.totalInstances) * 100}%` }}
            />
            <span className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1.5 relative z-10">
              <BarChart3 className="w-3.5 h-3.5 text-slate-400" /> {statusMap[secondStatus[0]] || secondStatus[0]}
            </span>
            <span className="text-lg font-bold text-slate-700 relative z-10">{secondStatus[1].toLocaleString()}</span>
          </div>
        </div>

        {/* Footer Action - Only show text hint when collapsed, or expand list when expanded */}
        {!expanded && (
             <div className="mt-2 pt-3 border-t border-slate-100 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <span className="text-xs text-purple-600 font-medium flex items-center gap-1">
                    点击展开索引视图 <ChevronDown className="w-3 h-3" />
                 </span>
            </div>
        )}

        {/* Expanded Content: Instance List / Graph */}
        <AnimatePresence>
            {expanded && (
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-4 pt-4 border-t border-slate-100"
            >
                {/* View Toggle */}
                <div className="flex justify-end mb-4 gap-2">
                     <div className="bg-slate-100 p-0.5 rounded-lg flex">
                        <button
                            onClick={() => setViewType("graph")}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                                viewType === "graph" ? "bg-white text-purple-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            <LayoutGrid className="w-3.5 h-3.5" /> 图谱
                        </button>
                        <button
                            onClick={() => setViewType("list")}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                                viewType === "list" ? "bg-white text-purple-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            <List className="w-3.5 h-3.5" /> 列表
                        </button>
                     </div>
                </div>

                {viewType === "graph" ? (
                    <InstanceIndexGraph typeId={summary.typeId} />
                ) : (
                    <InstanceList typeId={summary.typeId} />
                )}
            </motion.div>
            )}
        </AnimatePresence>

      </motion.div>
    </motion.div>
  );
};

export default InstanceSummaryCard;
