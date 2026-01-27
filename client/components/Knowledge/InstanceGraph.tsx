import React, { useEffect, useRef, useState } from "react";
import { Graph } from "@antv/g6";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter, Calendar, ZoomIn, ZoomOut, Maximize, Layers, Play, Pause, RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface InstanceGraphProps {
  instanceId: string;
}

const InstanceGraph: React.FC<InstanceGraphProps> = ({ instanceId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeProgress, setTimeProgress] = useState(100); // 0 to 100

  // Mock Data Generation based on instanceId
  // Includes timestamp for temporal replay
  const generateGraphData = (id: string) => {
    const isOrder = id.startsWith("ORD");
    
    const nodes: any[] = [
      // Central Node
      {
        id: "root",
        type: "circle",
        style: {
          size: 60,
          fill: "#3b82f6", // blue-500
          stroke: "#2563eb", // blue-600
          lineWidth: 2,
          labelText: id,
          labelFill: "#ffffff",
          labelFontSize: 12,
          labelPlacement: "center",
        },
        data: {
            category: "instance",
            label: id,
            timestamp: 0 // Always present
        }
      },
    ];

    const edges: any[] = [];

    // Add Related Instances (Structural - Always present usually, or appearing at creation)
    if (isOrder) {
      // Customer
      nodes.push({
        id: "cust-1",
        type: "circle",
        style: {
          size: 40,
          fill: "#e2e8f0", // slate-200
          stroke: "#94a3b8", // slate-400
          lineWidth: 1,
          labelText: "Cust-001",
          labelFill: "#475569",
          labelFontSize: 10,
          labelPlacement: "bottom",
        },
        data: { category: "instance", label: "Cust-001", timestamp: 0 }
      });
      edges.push({
        source: "root",
        target: "cust-1",
        style: {
            stroke: "#cbd5e1",
            endArrow: true,
            labelText: "belongs_to",
            labelFontSize: 10,
            labelFill: "#94a3b8"
        },
        data: { timestamp: 0 }
      });

      // Product
      nodes.push({
        id: "prod-1",
        type: "circle",
        style: {
          size: 40,
          fill: "#e2e8f0", // slate-200
          stroke: "#94a3b8", // slate-400
          lineWidth: 1,
          labelText: "SKU-999",
          labelFill: "#475569",
          labelFontSize: 10,
          labelPlacement: "bottom",
        },
        data: { category: "instance", label: "SKU-999", timestamp: 0 }
      });
      edges.push({
        source: "root",
        target: "prod-1",
        style: {
            stroke: "#cbd5e1",
            endArrow: true,
            labelText: "contains",
            labelFontSize: 10,
            labelFill: "#94a3b8"
        },
        data: { timestamp: 0 }
      });
    }

    // Add Events (Event-First) - These have distinct timestamps
    const events = [
        { name: "Created", time: 10, status: "CREATED" }, 
        { name: "Payment", time: 40, status: "PAID" }, 
        { name: "Shipping", time: 70, status: "SHIPPED" },
        { name: "Delivered", time: 100, status: "COMPLETED" }
    ];
    
    events.forEach((evt, idx) => {
      const evtId = `evt-${idx}`;
      nodes.push({
        id: evtId,
        type: "rect",
        style: {
          size: [80, 30],
          radius: 4,
          fill: "#fef3c7", // amber-100
          stroke: "#d97706", // amber-600
          lineWidth: 1,
          labelText: evt.name,
          labelFill: "#92400e",
          labelFontSize: 10,
          labelPlacement: "center",
        },
        data: { 
            category: "event", 
            label: evt.name, 
            timestamp: evt.time,
            status: evt.status
        }
      });
      
      // Link event to root
      edges.push({
        source: "root",
        target: evtId,
        style: {
            stroke: "#fbbf24", // amber-400
            lineDash: [4, 4],
            endArrow: true,
            labelText: "trigger",
            labelFontSize: 9,
            labelFill: "#d97706"
        },
        data: { timestamp: evt.time }
      });
    });

    return { nodes, edges };
  };

  // Initialize Graph
  useEffect(() => {
    if (!containerRef.current) return;

    const fullData = generateGraphData(instanceId);

    // Filter data based on timeProgress
    const filteredNodes = fullData.nodes.filter(n => n.data.timestamp <= timeProgress);
    const filteredEdges = fullData.edges.filter(e => e.data.timestamp <= timeProgress);
    
    // Find latest event status to update root node badge (simulated)
    const latestEvent = filteredNodes
        .filter(n => n.data.category === "event")
        .sort((a, b) => b.data.timestamp - a.data.timestamp)[0];
    
    if (latestEvent) {
         // Update root node visuals based on state
         const rootNode = filteredNodes.find(n => n.id === "root");
         
         const statusMap: Record<string, string> = {
            "CREATED": "已创建",
            "PAID": "已支付",
            "SHIPPED": "已发货",
            "COMPLETED": "已完成"
         };

         if (rootNode) {
             rootNode.style.badges = [
                 {
                    text: statusMap[latestEvent.data.status] || latestEvent.data.status,
                    placement: 'right-top',
                    fill: '#10b981', // emerald
                    color: '#fff',
                 }
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
              }
          }
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

  }, [instanceId, timeProgress]);

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
            setTimeProgress(prev => {
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
            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-slate-900" title="放大" onClick={() => (graphRef.current as any)?.zoom(1.2)}>
                <ZoomIn className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-slate-900" title="缩小" onClick={() => (graphRef.current as any)?.zoom(0.8)}>
                <ZoomOut className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-slate-900" title="适配视图" onClick={() => (graphRef.current as any)?.fitView()}>
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
            <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 shrink-0"
                onClick={() => setIsPlaying(!isPlaying)}
            >
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
            <div className="text-xs font-mono font-medium w-12 text-right text-slate-600">
                {timeProgress}%
            </div>
         </div>
      </div>
    </div>
  );
};

export default InstanceGraph;
