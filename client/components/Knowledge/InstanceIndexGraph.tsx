import React, { useEffect, useRef, useState } from "react";
import { Graph } from "@antv/g6";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter, Calendar, ZoomIn, ZoomOut, Maximize, Layers, LayoutGrid, List } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InstanceIndexGraphProps {
  typeId: string;
  onInstanceClick?: (instanceId: string) => void;
}

const InstanceIndexGraph: React.FC<InstanceIndexGraphProps> = ({ typeId, onInstanceClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Mock Data Generation for Index View (Multiple Instances)
  const generateIndexData = (id: string, count: number = 20) => {
    const nodes: any[] = [];
    const edges: any[] = [];
    
    const statuses = ["ACTIVE", "FROZEN", "COMPLETED", "PENDING"];
    
    // Create central "Type" node (optional, acting as cluster center)
    // For Index View, we might just want scattered instances, but a center helps layout.
    // Let's try scattered first, or clustered by status.
    
    for (let i = 0; i < count; i++) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const isHighRisk = Math.random() > 0.8;
        
        let color = "#3b82f6"; // blue
        if (status === "FROZEN") color = "#94a3b8"; // slate
        if (status === "COMPLETED") color = "#10b981"; // emerald
        if (status === "PENDING") color = "#f59e0b"; // amber

        nodes.push({
            id: `${id}-${i}`,
            type: "circle",
            style: {
                size: 40,
                fill: isHighRisk ? "#fecaca" : "#ffffff", // red bg for risk
                stroke: color,
                lineWidth: 2,
                labelText: `${id}-${i}`,
                labelFill: "#475569",
                labelFontSize: 10,
                labelPlacement: "center",
            },
            data: { 
                category: "instance", 
                status,
                label: `${id}-${i}` 
            }
        });

        // Add some random connections between instances to show "relations"
        if (i > 0 && Math.random() > 0.7) {
            const target = Math.floor(Math.random() * i);
            edges.push({
                source: `${id}-${i}`,
                target: `${id}-${target}`,
                style: {
                    stroke: "#e2e8f0",
                    lineWidth: 1,
                }
            });
        }
    }

    return { nodes, edges };
  };

  useEffect(() => {
    if (!containerRef.current) return;

    setLoading(true);
    // Simulate network delay
    setTimeout(() => {
        const data = generateIndexData(typeId, 30);

        // Initialize G6 Graph
        const graph = new Graph({
          container: containerRef.current!,
          width: containerRef.current!.clientWidth,
          height: containerRef.current!.clientHeight,
          autoResize: true,
          zoom: 0.8,
          layout: {
            type: "force",
            preventOverlap: true,
            nodeSize: 40,
            linkDistance: 100,
            nodeStrength: 30,
            edgeStrength: 0.1,
          },
          behaviors: ["drag-canvas", "zoom-canvas", "drag-element"],
          data,
          animation: true,
        });

        graph.on("node:click", (e: any) => {
            const model = e.target.id; // G6 v5 might be different, but assuming ID access
            // In G6 5.0, event handling is slightly different, keeping it simple
            if (onInstanceClick) {
                // simple ID extraction
                onInstanceClick(e.target.id);
            }
        });

        graph.render().then(() => {
            setLoading(false);
        });
        
        graphRef.current = graph;
    }, 500);

    return () => {
      if (graphRef.current) {
        graphRef.current.destroy();
      }
    };
  }, [typeId]);

  // Handle Filter Change
  useEffect(() => {
      if (!graphRef.current) return;
      
      // Example of filtering nodes visibility
      const graph = graphRef.current;
      // This is pseudo-code for G6 v5 filtering, implementation depends on exact version features
      // For now, we just log
      console.log("Filtering by status:", filterStatus);
      
      // In a real app, we would graph.filterData(...) or update data
  }, [filterStatus]);

  return (
    <div className="flex flex-col h-[500px] bg-slate-50/50 rounded-lg border border-slate-200 overflow-hidden shadow-inner">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-purple-500" />
                索引图谱
            </h3>
            <Badge variant="outline" className="text-[10px] font-normal text-slate-500 bg-slate-50">
                {typeId} 个实例
            </Badge>
        </div>
        
        <div className="flex items-center gap-2">
             <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-7 text-xs w-[100px] bg-slate-50">
                    <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">全部状态</SelectItem>
                    <SelectItem value="ACTIVE">活跃</SelectItem>
                    <SelectItem value="FROZEN">冻结</SelectItem>
                    <SelectItem value="COMPLETED">已完成</SelectItem>
                </SelectContent>
            </Select>

            <div className="w-px h-4 bg-slate-300 mx-1"></div>
            
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
      <div className="flex-1 relative">
         {loading && (
             <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/60 backdrop-blur-sm">
                 <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    <span className="text-xs text-slate-500">正在生成索引图谱...</span>
                 </div>
             </div>
         )}
         <div ref={containerRef} className="w-full h-full" />
         
         {/* Legend Overlay */}
         <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur border border-slate-200 p-2 rounded-md shadow-sm text-xs space-y-1">
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full border border-emerald-500 bg-white"></span>
                <span className="text-slate-600">已完成</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full border border-blue-500 bg-white"></span>
                <span className="text-slate-600">活跃</span>
            </div>
             <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full border border-slate-400 bg-slate-100"></span>
                <span className="text-slate-600">冻结</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default InstanceIndexGraph;
