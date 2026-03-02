import React from "react";
import { Terminal, Code2, Play, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, message, Tabs } from "antd";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useRefresh } from "./RefreshContext";
import { request } from "@/lib/request";

const { TextArea } = Input;

interface DebugPrompt {
  label: string;
  word: string;
  model?: string;
}

interface PromptDebuggerDrawerProps {
  title: string;
  currentStep: string;
  id: string;
  status?: number;
  prompt?: string; // Legacy single prompt
  prompts?: DebugPrompt[]; // Support for multiple tabs
  onReRun?: (editedPrompts?: DebugPrompt[]) => void;
  model?: string;
}

export const PromptDebuggerDrawer: React.FC<PromptDebuggerDrawerProps> = ({
  title,
  prompt,
  prompts = [],
  onReRun,
  id,
  model = "",
  currentStep = "intent",
}) => {
  const [activeTab, setActiveTab] = React.useState("0");
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { refreshEventDetails } = useRefresh();

  // Compute normalized prompts directly without memoization
  const normalizedPrompts = prompts.length > 0 ? prompts : prompt ? [{ label: "Default", word: prompt, model }] : [];

  // Use the normalized prompts directly as the source of truth
  // No need for separate state that syncs with props
  const editedPrompts = normalizedPrompts;

  // Handle prompt text change - we'll need to manage this differently
  // Since we can't modify the computed value directly, we'll use local state only for user edits
  const [userEdits, setUserEdits] = React.useState<Record<number, string>>({});

  const handlePromptChange = (index: number, newValue: string) => {
    setUserEdits((prev) => ({
      ...prev,
      [index]: newValue,
    }));
  };

  // Get the effective prompt value (user edit or original)
  const getPromptValue = (index: number) => {
    return userEdits[index] !== undefined ? userEdits[index] : editedPrompts[index]?.word || "";
  };

  // Get the effective prompts for re-run
  const getEffectivePrompts = () => {
    return editedPrompts.map((prompt, index) => ({
      ...prompt,
      word: getPromptValue(index),
    }));
  };

  // Handle re-run with refresh
  const handleReRun = () => {
    const effectivePrompts = getEffectivePrompts();
    onReRun?.(effectivePrompts);
    setIsLoading(true);

    request
      .post("/quote/api/v1/decision/trace/again", {
        word: effectivePrompts[0].word,
        status: getStatus(),
        id,
      })
      .then(() => {
        // 重新执行成功后关闭抽屉，并刷新事件详情
        setOpen(false);
        refreshEventDetails();
        message.success("重新执行成功");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const getStatus = () => {
    switch (currentStep) {
      case "intent":
        return 1;
      case "data":
        if (activeTab === "0") return 2;
        return 3;
      case "reasoning":
        return 4;
      default:
        return 1;
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
          <Code2 className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-xl flex flex-col gap-0 p-0">
        <SheetHeader className="p-6 border-b">
          <div className="flex items-center gap-2 text-slate-800">
            <Terminal className="w-5 h-5" />
            <SheetTitle className="text-xl">Prompt Debugger: {title}</SheetTitle>
          </div>
          <SheetDescription className="text-slate-500 mt-1">查看并修改 AI 提示词，重新执行该步骤。</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto flex flex-col min-h-0 bg-white">
          {editedPrompts.length > 1 ? (
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              className="px-6 pt-2 h-full flex flex-col"
              items={editedPrompts.map((p, idx) => ({
                key: String(idx),
                label: (
                  <div className="flex items-center gap-1.5 px-1 py-1">
                    <Hash className="w-3.5 h-3.5 opacity-60" />
                    <span>{p.label}</span>
                  </div>
                ),
                children: (
                  <div className="space-y-4 pt-2 pb-6">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-slate-700">完整提示词 (Prompt)</label>
                      {p.model && (
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 text-slate-600 border-none font-mono text-[10px]"
                        >
                          {p.model}
                        </Badge>
                      )}
                    </div>
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg blur opacity-10 group-hover:opacity-20 transition duration-500"></div>
                      <TextArea
                        className="relative w-full bg-white border-slate-200 rounded-lg font-mono text-sm leading-relaxed focus:border-blue-500 focus:ring-blue-500/20"
                        rows={24}
                        value={getPromptValue(idx)}
                        onChange={(e) => handlePromptChange(idx, e.target.value)}
                        placeholder="输入提示词..."
                      />
                    </div>
                  </div>
                ),
              }))}
            />
          ) : (
            <div className="p-6 space-y-6">
              {editedPrompts.map((p, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-700">完整提示词 (Prompt)</label>
                    <Badge
                      variant="secondary"
                      className="bg-slate-100 text-slate-600 border-none font-mono text-[10px]"
                    >
                      {p.model || model}
                    </Badge>
                  </div>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg blur opacity-10 group-hover:opacity-20 transition duration-500"></div>
                    <TextArea
                      className="relative w-full bg-white border-slate-200 rounded-lg font-mono text-sm leading-relaxed focus:border-blue-500 focus:ring-blue-500/20"
                      rows={28}
                      value={getPromptValue(idx)}
                      onChange={(e) => handlePromptChange(idx, e.target.value)}
                      placeholder="输入提示词..."
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <SheetFooter className="p-6 border-t bg-slate-50/50">
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              size="sm"
              className="gap-2 bg-blue-600 hover:bg-blue-700 px-6"
              onClick={handleReRun}
              disabled={isLoading}
            >
              <Play className="w-4 h-4" />
              {isLoading ? "执行中..." : "重新执行 (Re-run)"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
