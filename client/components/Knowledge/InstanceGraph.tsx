import React, { useEffect, useRef, useState } from "react";
import { Graph } from "@antv/g6";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter, Calendar, ZoomIn, ZoomOut, Maximize, Layers, Play, Pause, RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { request } from "@/lib/request";

interface InstanceGraphProps {
  instanceId: string;
}

const InstanceGraph: React.FC<InstanceGraphProps> = ({ instanceId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiData, setApiData] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeProgress, setTimeProgress] = useState(100); // 0 to 100

  // Data processing from API
  const generateGraphData = (data: any[]) => {
    if (!data || data.length === 0) return { nodes: [], edges: [] };
    // Map each item in the array to a node
    const nodes: any[] = data.map((item) => {
      const isRoot = String(item.id) === String(instanceId);
      const label = item.instanceCode || String(item.id);

      return {
        id: String(item.id),
        type: "circle",
        style: {
          size: isRoot ? 60 : 45,
          fill: isRoot ? "#3b82f6" : "#f8fafc",
          stroke: isRoot ? "#2563eb" : "#cbd5e1",
          lineWidth: isRoot ? 2 : 1,
          labelText: label.length > 12 ? label.substring(0, 10) + "..." : label,
          labelFill: isRoot ? "#ffffff" : "#475569",
          labelFontSize: isRoot ? 12 : 10,
          labelPlacement: "center",
        },
        data: {
          ...item,
          category: "instance",
          label: label,
          timestamp: 0,
        },
      };
    });

    const edges: any[] = [];

    // Attempt to identify root and connect others to it if no explicit edges provided
    const rootNode = nodes.find((n) => n.id === String(instanceId));
    if (rootNode) {
      nodes.forEach((node) => {
        if (node.id !== rootNode.id) {
          edges.push({
            source: rootNode.id,
            target: node.id,
            style: {
              stroke: "#e2e8f0",
              lineWidth: 1,
              endArrow: true,
            },
            data: { timestamp: 0 },
          });
        }
      });
    }

    return { nodes, edges };
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await request.get(`/quote/api/v1/instance/graph/view/${instanceId}`);
        if (res.data?.data) {
          setApiData(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch graph data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [instanceId]);

  // Initialize Graph
  useEffect(() => {
    if (!containerRef.current || !apiData) return;
    const fullData = generateGraphData(apiData);

    // Filter data based on timeProgress
    const filteredNodes = fullData.nodes.filter((n) => n.data.timestamp <= timeProgress);
    const filteredEdges = fullData.edges.filter((e) => e.data.timestamp <= timeProgress);

    // Find latest event status to update root node badge (simulated)
    const latestEvent = filteredNodes
      .filter((n) => n.data.category === "event")
      .sort((a, b) => b.data.timestamp - a.data.timestamp)[0];

    if (latestEvent) {
      // Update root node visuals based on state
      const rootNode = filteredNodes.find((n) => n.id === "root");

      const statusMap: Record<string, string> = {
        CREATED: "已创建",
        PAID: "已支付",
        SHIPPED: "已发货",
        COMPLETED: "已完成",
      };

      if (rootNode) {
        rootNode.style.badges = [
          {
            text: statusMap[latestEvent.data.status] || latestEvent.data.status,
            placement: "right-top",
            fill: "#10b981", // emerald
            color: "#fff",
          },
        ];
      }
    }

    if (!graphRef.current) {
      // Init
      const graph = new Graph({
        container: containerRef.current,
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
        autoResize: true,
        zoom: 1,
        layout: {
          type: "force",
          preventOverlap: true,
          nodeSize: 60,
          linkDistance: 120,
        },
        behaviors: ["drag-canvas", "zoom-canvas", "drag-element"],
        data: { nodes: filteredNodes, edges: filteredEdges },
        animation: true,
        node: {
          style: {
            badges: [], // enable badge support
          },
        },
      });

      graph.render().then(() => {
        setLoading(false);
      });

      graphRef.current = graph;
    } else {
      // Update
      graphRef.current.setData({ nodes: filteredNodes, edges: filteredEdges });
      graphRef.current.render();
    }
  }, [instanceId, timeProgress, apiData]);

  // Clean up
  useEffect(() => {
    return () => {
      if (graphRef.current) {
        graphRef.current.destroy();
        graphRef.current = null;
      }
    };
  }, []); // Only on unmount

  // Playback Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 2;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-500" />
            实例图谱
          </h3>
          <Badge variant="outline" className="text-[10px] font-normal text-slate-500 bg-white">
            时序视图
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-500 hover:text-slate-900"
            title="放大"
            onClick={() => (graphRef.current as any)?.zoom(1.2)}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-500 hover:text-slate-900"
            title="缩小"
            onClick={() => (graphRef.current as any)?.zoom(0.8)}
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-500 hover:text-slate-900"
            title="适配视图"
            onClick={() => (graphRef.current as any)?.fitView()}
          >
            <Maximize className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Graph Container */}
      <div className="flex-1 relative bg-slate-50/30">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/80 backdrop-blur-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full min-h-[400px]" />

        {/* Legend Overlay */}
        <div className="absolute bottom-16 left-4 bg-white/90 backdrop-blur border border-slate-200 p-2 rounded-md shadow-sm text-xs space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="text-slate-600">实例</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-1 bg-amber-500 rounded-sm"></span>
            <span className="text-slate-600">事件</span>
          </div>
        </div>

        {/* Time Travel Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 flex items-center gap-4 z-20">
          <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-slate-500"
            onClick={() => setTimeProgress(0)}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <div className="flex-1 flex flex-col gap-1">
            <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-wider font-medium">
              <span>流程开始</span>
              <span>当前状态</span>
            </div>
            <Slider
              value={[timeProgress]}
              max={100}
              step={1}
              onValueChange={(vals) => setTimeProgress(vals[0])}
              className="cursor-pointer"
            />
          </div>
          <div className="text-xs font-mono font-medium w-12 text-right text-slate-600">{timeProgress}%</div>
        </div>
      </div>
    </div>
  );
};

export default InstanceGraph;
