import { useEffect } from "react";
import { GraphMode } from "@shared/businessKnowledgeGraphTypes";
import { request } from "@/lib/request";
import { GraphCanvas } from "./components/GraphCanvas";
import { useGraphStore } from "./store/useGraphStore";
import { FilterDrawer } from "./components/FilterDrawer";

import { Eye, EyeOff } from "lucide-react";

import { MeshControls } from "./components/MeshControls";

export default function BusinessKnowledgeGraph() {
  const mode = useGraphStore((state) => state.mode);
  const setMode = useGraphStore((state) => state.setMode);
  const showLabels = useGraphStore((state) => state.showLabels);
  const toggleShowLabels = useGraphStore((state) => state.toggleShowLabels);

  return (
    <div className="w-full h-screen flex flex-col p-4 gap-4 bg-white">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Business Knowledge Graph</h1>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleShowLabels}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            title={showLabels ? "Hide Labels" : "Show Labels"}
          >
            {showLabels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span className="hidden sm:inline">Labels</span>
          </button>

          {/* Mode Switcher */}
          <div className="flex gap-2">
            {(["macro", "mesh"] as GraphMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  mode === m ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)} Mode
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative rounded-lg border border-slate-200 shadow-inner">
        {/* 
            Single Canvas Instance 
            Using key={mode} to enforce "Destroy + Rebuild" lifecycle 
            as strictly requested: "Mode 切换 = 清空当前图数据 + 重新构建"
            Note: GraphCanvas now consumes state internally, but key={mode} 
            ensures the DOM element and React component are fully reset.
        */}
        <GraphCanvas key={mode} />

        {/* Global UI Components */}
        <FilterDrawer />
        <MeshControls />
      </div>

      <div className="text-xs text-slate-400 text-center">
        System Status: Single Canvas Active. Current Mode: {mode} (Managed by Global GraphState)
      </div>
    </div>
  );
}
