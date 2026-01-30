import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface CollapsibleLayerProps {
  title: string;
  layerNumber: number;
  isOpen: boolean;
  onToggle: () => void;
  summary?: React.ReactNode;
  children: React.ReactNode;
  status?: "default" | "locked" | "completed" | "active";
  className?: string;
}

export default function CollapsibleLayer({
  title,
  layerNumber,
  isOpen,
  onToggle,
  summary,
  children,
  status = "default",
  className
}: CollapsibleLayerProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(isOpen ? undefined : 0);

  useEffect(() => {
    if (isOpen) {
      const scrollHeight = contentRef.current?.scrollHeight;
      setHeight(scrollHeight);
      // Clear height after transition to allow auto-growth
      const timer = setTimeout(() => setHeight(undefined), 300);
      return () => clearTimeout(timer);
    } else {
      setHeight(contentRef.current?.scrollHeight);
      // Force reflow
      requestAnimationFrame(() => {
        setHeight(0);
      });
    }
  }, [isOpen]);

  return (
    <div className={cn("group relative pl-8", className)}>
      {/* Timeline Line */}
      <div className={cn(
        "absolute left-[11px] top-0 bottom-0 w-[2px]",
        status === "completed" ? "bg-purple-200" : "bg-slate-200",
        // Hide line for last item if needed, but usually good to keep for flow
      )} />

      {/* Layer Node/Indicator */}
      <div 
        className={cn(
          "absolute left-0 top-4 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 transition-colors duration-300",
          status === "active" ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-200" :
          status === "completed" ? "bg-white border-purple-500 text-purple-500" :
          status === "locked" ? "bg-slate-100 border-slate-300 text-slate-400" :
          "bg-white border-slate-300 text-slate-500"
        )}
      >
        {status === "completed" ? (
          <CheckCircle2 className="w-3.5 h-3.5" />
        ) : status === "locked" ? (
          <Lock className="w-3 h-3" />
        ) : (
          <span className="text-[10px] font-bold">{layerNumber}</span>
        )}
      </div>

      <Card className={cn(
        "border-slate-200 shadow-sm transition-all duration-300 overflow-hidden",
        isOpen ? "ring-1 ring-slate-200/50" : "hover:border-slate-300"
      )}>
        {/* Header */}
        <div 
          onClick={onToggle}
          className={cn(
            "flex items-center justify-between p-3 cursor-pointer bg-white transition-colors select-none",
            !isOpen && "hover:bg-slate-50/50"
          )}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <h3 className={cn(
              "text-sm font-semibold transition-colors whitespace-nowrap",
              status === "active" ? "text-slate-800" : "text-slate-600"
            )}>
              {title}
            </h3>
            
            {/* Summary Slot - Fade in when collapsed */}
            <div className={cn(
              "flex-1 transition-all duration-300 overflow-hidden flex items-center",
              isOpen ? "opacity-0 translate-x-4 max-w-0" : "opacity-100 translate-x-0 max-w-[600px]"
            )}>
              <div className="h-4 w-[1px] bg-slate-200 mx-3 shrink-0" />
              <div className="text-xs text-slate-500 truncate flex items-center gap-2">
                {summary}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </div>

        {/* Body */}
        <div 
          style={{ height: height === undefined ? 'auto' : `${height}px` }}
          className="transition-[height] duration-300 ease-in-out overflow-hidden bg-white"
        >
          <div ref={contentRef} className="p-4 pt-0 border-t border-slate-50">
            {children}
          </div>
        </div>
      </Card>
    </div>
  );
}
