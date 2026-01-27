import React from 'react';
import { useGraphStore } from '../store/useGraphStore';
import { mockEvents } from '../services/graphBuilder';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { AlertCircle, CheckCircle, Info, Link, Activity } from "lucide-react";

export function HistorySidePanel() {
  const { hoveredEventId, setHoveredEventId } = useGraphStore();

  // Sort events by time (descending or ascending? Usually recent at top or bottom. Timeline implies chronological, so maybe top-down = old-new or new-old. Let's do new-old for "History" log, or old-new for timeline. Let's do new-old so most recent is at top)
  // Actually, for a playback timeline, it usually matches the slider. Let's do Ascending (Old -> New) so it reads like a story.
  const sortedEvents = [...mockEvents].sort((a, b) => a.timestamp - b.timestamp);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'status_change': return <Activity className="h-4 w-4 text-blue-500" />;
      case 'interaction': return <Link className="h-4 w-4 text-purple-500" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="absolute top-4 right-4 bottom-20 w-80 bg-background/95 backdrop-blur-sm border border-border rounded-xl shadow-xl flex flex-col z-40 overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/30">
        <h3 className="font-semibold text-sm">历史事件</h3>
        <p className="text-xs text-muted-foreground mt-1">悬停以高亮图谱</p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {sortedEvents.map((event, index) => {
            const isPast = true;
            const isHovered = hoveredEventId === event.id;
            const isCausal = event.isCausal;

            return (
              <div
                key={event.id}
                className={cn(
                  "relative pl-6 pb-4 border-l transition-all duration-200 cursor-pointer group",
                  isPast ? "border-muted-foreground/40" : "border-muted/20 opacity-50",
                  isHovered && "bg-muted/50 -mx-2 px-2 py-2 rounded-md border-none"
                )}
                onMouseEnter={() => setHoveredEventId(event.id)}
                onMouseLeave={() => setHoveredEventId(undefined)}
              >
                {/* Timeline dot */}
                <div className={cn(
                  "absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full border-2 ring-4 ring-background transition-colors",
                  isPast ? (isCausal ? "bg-destructive border-destructive" : "bg-muted-foreground border-muted-foreground") : "bg-muted border-muted",
                  isHovered && "scale-125 ring-primary/20"
                )} />

                <div className="flex items-center gap-2 mb-1">
                  {getEventIcon(event.type)}
                  <span className={cn(
                    "text-xs font-mono",
                    isPast ? "text-muted-foreground" : "text-muted-foreground/50"
                  )}>
                    {format(event.timestamp, 'HH:mm:ss')}
                  </span>
                  {isCausal && (
                    <Badge variant="destructive" className="text-[10px] h-4 px-1 py-0">
                      根因
                    </Badge>
                  )}
                </div>

                <p className={cn(
                  "text-sm font-medium leading-none mb-1",
                  isPast ? "text-foreground" : "text-muted-foreground"
                )}>
                  {event.description}
                </p>
                
                <div className="text-[10px] text-muted-foreground/80 flex gap-2">
                   {event.instanceId && <span>对象: {event.instanceId}</span>}
                   {event.relationId && <span>关系: {event.relationId}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
