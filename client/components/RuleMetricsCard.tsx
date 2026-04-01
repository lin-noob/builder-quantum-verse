import React, { useState } from "react";
import { useRuleColumns } from "@/hooks/useRuleColumns";
import { TooltipIcon } from "@/pages/UserDetail_New";
import { Loader2 } from "lucide-react";

interface RuleMetricsCardProps {
  metrics: Record<string, string | number>;
}

export const RuleMetricsCard: React.FC<RuleMetricsCardProps> = ({ metrics }) => {
  const { ruleColumns, loading } = useRuleColumns();
  debugger;
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-white border border-gray-200 rounded-lg">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (ruleColumns.length === 0) {
    return null;
  }

  // Filter metrics that exist in ruleColumns
  // User specified: "metrics key依旧是columnKey"
  const displayedMetrics = ruleColumns.filter((col) =>
    metrics && metrics[col.columnKey] ? metrics[col.columnKey] : "-",
  );

  if (displayedMetrics.length === 0) {
    return null;
  }

  const rows = [];
  for (let i = 0; i < displayedMetrics.length; i += 2) {
    const col1 = displayedMetrics[i];
    const col2 = displayedMetrics[i + 1];
    rows.push(
      <tr key={`rule-row-${i}`}>
        <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">
          <div className="flex items-center gap-1">
            <span>{col1.columnLabel}</span>
            {col1.description && <TooltipIcon text={col1.description} />}
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-900">{metrics[col1.columnKey] ?? "-"}</td>
        {col2 ? (
          <>
            <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">
              <div className="flex items-center gap-1">
                <span>{col2.columnLabel}</span>
                {col2.description && <TooltipIcon text={col2.description} />}
              </div>
            </td>
            <td className="px-4 py-3 text-sm text-gray-900">{metrics[col2.columnKey] ?? "-"}</td>
          </>
        ) : (
          <>
            <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50"></td>
            <td className="px-4 py-3 text-sm text-gray-900"></td>
          </>
        )}
      </tr>,
    );
  }

  return (
    <div className="mb-6">
      <hr className="border-gray-200 mb-4" />
      <h3 className="text-sm font-semibold text-gray-900 mb-3">规则事件</h3>
      <div className="bg-white border border-gray-200 rounded-lg overflow-visible">
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed">
            <colgroup>
              <col className="w-1/4" />
              <col className="w-1/4" />
              <col className="w-1/4" />
              <col className="w-1/4" />
            </colgroup>
            <tbody className="divide-y divide-gray-200">{rows}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
