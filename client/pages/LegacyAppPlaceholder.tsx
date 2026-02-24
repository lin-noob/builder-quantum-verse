import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import AICopilotSidebar from "@/components/ai/AICopilotSidebar";

export default function LegacyAppPlaceholder() {
  const location = useLocation();
  const incident = (location.state as any)?.incident || null;
  const [open, setOpen] = useState(true);

  const suggestions = useMemo(() => {
    if (!incident) return [];
    return (incident.suggestedResponsePlan || []).map((a: any) => ({
      id: a.id,
      title: a.title,
    }));
  }, [incident]);

  useEffect(() => {
    setOpen(true);
  }, []);

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h1 className="text-xl font-bold mb-2">传���应用界面</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            这是一个用于原型跳转的占位页面。可在此模拟ERP/OA/CRM等系统的表单与数据。
          </p>
          <form className="space-y-3 max-w-xl">
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-300">
                单据编号
              </span>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent p-2"
                defaultValue="PO-20250909-001"
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-300">
                审批意见
              </span>
              <textarea
                className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent p-2 h-28"
                placeholder="输入审批意见..."
              />
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                className="px-4 py-2 rounded-md bg-slate-900 text-white"
              >
                提交
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-md border border-slate-300"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>

      <AICopilotSidebar
        incident={incident}
        suggestions={suggestions}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
