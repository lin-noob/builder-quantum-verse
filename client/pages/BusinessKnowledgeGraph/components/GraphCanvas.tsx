import { useEffect, useRef } from "react";
import { Network, Options } from "vis-network";
import { DataSet } from "vis-data";
import { useGraphStore } from "../store/useGraphStore";
import { request } from "@/lib/request";
import { InstanceDetailPanel } from "./InstanceDetailPanel";
import { ArrowLeft } from "lucide-react";
import { GraphTheme } from "../theme/graphTheme";

const PALETTE = [
  { bg: "#e0e7ff", border: "#818cf8", highlightBg: "#c7d2fe", highlightBorder: "#6366f1" }, // Indigo
  { bg: "#dcfce7", border: "#4ade80", highlightBg: "#bbf7d0", highlightBorder: "#22c55e" }, // Green
  { bg: "#ffedd5", border: "#fb923c", highlightBg: "#fed7aa", highlightBorder: "#f97316" }, // Orange
  { bg: "#fce7f3", border: "#f472b6", highlightBg: "#fbcfe8", highlightBorder: "#ec4899" }, // Pink
  { bg: "#e0f2fe", border: "#38bdf8", highlightBg: "#bae6fd", highlightBorder: "#0ea5e9" }, // Sky
  { bg: "#f3e8ff", border: "#c084fc", highlightBg: "#e9d5ff", highlightBorder: "#a855f7" }, // Purple
];

const getColorForNode = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
};

export function GraphCanvasContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);

  const graphState = useGraphStore((state) => state);
  const { mode, setExpandedTypes, setMode, lastMode, setFocusedInstanceId, focusedInstanceId, setSelectedInstanceId } =
    graphState;

  useEffect(() => {
    if (!containerRef.current) return;

    let network: Network | null = null;
    let isMounted = true;

    const initGraph = async () => {
      try {
        const response = await request.get("/quote/api/v1/digital/list/view");
        if (!isMounted) return;
        debugger;
        let apiData: any[] = response.data.data;
        let nodesData: any[] = [];
        if (mode === "macro") {
          nodesData = apiData.map((item: any) => {
            const id = item.objectCode || item.id || `node-${Math.random()}`;
            const isExpanded = graphState.expandedTypes.includes(id);
            const nodeColor = getColorForNode(id);

            return {
              id: id,
              label: item.objectName || "Unknown Object",
              group: isExpanded ? "typeGroup" : "objectType",
              shape: isExpanded ? "box" : "dot",
              size: 20, // Uniform fixed size
              title: `Type: ${item.objectCode || "Unknown"}\nInstances: ${item.instanceCount || 0}`,
              font: { color: "#334155", face: "Inter, sans-serif" },
              color: {
                background: nodeColor.bg,
                border: nodeColor.border,
                highlight: {
                  background: nodeColor.highlightBg,
                  border: nodeColor.highlightBorder,
                },
              },
              borderWidth: 2,
              shadow: true,
            };
          });
        } else {
          // Mesh/Focus mode (Instances)
          nodesData = apiData.map((item: any) => {
            const id = item.id || `node-${Math.random()}`;
            const isFocused = mode === "focus" && id === focusedInstanceId;
            const nodeColor = getColorForNode(item.objectCode || id);

            return {
              id: id,
              label: item.objectName || "Unknown Object",
              group: "instance",
              shape: "dot",
              size: 20, // Uniform fixed size
              title: item.description || item.objectName,
              font: { color: isFocused ? "#1e40af" : "#475569", face: "Inter, sans-serif" },
              color: {
                background: isFocused ? "#bfdbfe" : nodeColor.bg,
                border: isFocused ? "#3b82f6" : nodeColor.border,
                highlight: {
                  background: isFocused ? "#93c5fd" : nodeColor.highlightBg,
                  border: isFocused ? "#2563eb" : nodeColor.highlightBorder,
                },
              },
              borderWidth: isFocused ? 3 : 2,
              shadow: true,
            };
          });
        }

        const nodes = new DataSet(nodesData);
        const edges = new DataSet([]); // Isolated nodes for now (API relation missing)

        const data = { nodes, edges };

        const options: Options = {
          nodes: {
            font: {
              size: 14,
            },
          },
          edges: {
            width: 2,
            shadow: true,
            smooth: { enabled: true, type: "continuous", roundness: 0.5 },
          },
          physics: {
            forceAtlas2Based: {
              gravitationalConstant: -50,
              centralGravity: 0.01,
              springLength: 100,
              springConstant: 0.08,
            },
            maxVelocity: 50,
            solver: "forceAtlas2Based",
            timestep: 0.35,
            stabilization: {
              enabled: true,
              iterations: 200,
              updateInterval: 25,
            },
          },
          interaction: {
            hover: true,
            tooltipDelay: 200,
            zoomView: true,
            dragView: true,
            selectable: false, // 禁用节点点击选中
          },
        };

        network = new Network(containerRef.current!, data, options);
        networkRef.current = network;

        // --- Interaction Event Listeners ---
        network.on("click", () => {
          // 节点禁止点击，且不重置布局
        });

        network.on("doubleClick", () => {
          // 节点禁止双击
        });
      } catch (e) {
        console.error("Failed to initialize vis-network graph:", e);
      }
    };

    initGraph();

    return () => {
      isMounted = false;
      if (network) {
        network.destroy();
        networkRef.current = null;
      }
    };
  }, [
    mode,
    graphState.expandedTypes,
    focusedInstanceId,
    setFocusedInstanceId,
    setMode,
    setSelectedInstanceId,
    setExpandedTypes,
  ]);

  const exitFocus = () => {
    setFocusedInstanceId(undefined);
    setMode(lastMode && lastMode !== "focus" ? lastMode : "mesh");
  };

  useEffect(() => {
    if (mode !== "focus") return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") exitFocus();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, lastMode, setMode, setFocusedInstanceId]);

  return (
    <div className="w-full h-full relative" style={{ minHeight: "500px" }}>
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ outline: "none", backgroundColor: GraphTheme.colors.canvas.bg }}
      />

      {mode === "focus" && (
        <>
          <button
            className="absolute top-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-md bg-white/80 backdrop-blur text-slate-700 shadow-sm border border-slate-200 hover:bg-white transition-all cursor-pointer"
            onClick={exitFocus}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">退出聚焦</span>
          </button>
          <InstanceDetailPanel />
        </>
      )}
    </div>
  );
}

export function GraphCanvas() {
  return <GraphCanvasContent />;
}
