import React, { useMemo } from 'react';
import { useGraphStore } from '../store/useGraphStore';
import { mockEvents } from '../services/graphBuilder';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { AlertCircle, CheckCircle, Info, Link, Activity, Clock, Database, Share2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraphTheme } from '../theme/graphTheme';

export function InstanceDetailPanel() {
  const { selectedInstanceId, hoveredEventId, setHoveredEventId, mode } = useGraphStore();

  // Only show in Focus Mode
  if (mode !== 'focus' || !selectedInstanceId) return null;

  // 1. Get Instance Data (Mock)
  // In a real app, this would be a query
  // We need to access the node data. Since we don't have direct access to nodes here easily without context,
  // we can use the mockInstances from graphBuilder (if exported) or just rely on the ID to find events.
  // Ideally, we should pass node data or have a selector.
  // For now, let's use the ID to filter mockEvents and simulate attributes.
  
  // Re-import mock data or simulate lookup
  // We'll import mockInstances from graphBuilder if possible, or just define helper here if not exported.
  // Actually graphBuilder exports mockEvents. It doesn't export mockInstances directly but we can try to find them if we export them.
  // Let's assume we can get events at least.

  const instanceEvents = useMemo(() => {
    return mockEvents
      .filter(e => e.instanceId === selectedInstanceId || (e.relationId && (e.description.includes(selectedInstanceId) || true))) // Simplified relation check
      .filter(e => e.instanceId === selectedInstanceId) // Strict for now
      .sort((a, b) => b.timestamp - a.timestamp); // Newest first for history log
  }, [selectedInstanceId]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'status_change': return <Activity className="h-4 w-4 text-blue-500" />;
      case 'interaction': return <Link className="h-4 w-4 text-purple-500" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4 text-slate-500" />;
    }
  };

  // Mock Schema Attributes (Simulation)
  const attributes = [
    { name: 'Instance ID', value: selectedInstanceId },
    { name: 'Status', value: instanceEvents[0]?.type === 'error' ? 'Failed' : 'Active' }, // Simple inference
    { name: 'Created At', value: instanceEvents[instanceEvents.length - 1] ? format(instanceEvents[instanceEvents.length - 1].timestamp, 'yyyy-MM-dd HH:mm') : '-' },
    { name: 'Last Updated', value: instanceEvents[0] ? format(instanceEvents[0].timestamp, 'yyyy-MM-dd HH:mm') : '-' },
    { name: 'Owner', value: 'System' },
    { name: 'Region', value: 'CN-East-1' },
  ];

  return (
    <div className="absolute top-4 right-4 bottom-4 w-[400px] bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-2xl flex flex-col z-40 overflow-hidden animate-in slide-in-from-right-10 duration-300">
      
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Instance Detail</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 truncate" title={selectedInstanceId}>
          {selectedInstanceId}
        </h2>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-5 pt-2">
            <TabsList className="grid w-full grid-cols-3 h-9 bg-slate-100/80 p-1">
            <TabsTrigger value="overview" className="text-xs">
                <Database className="w-3.5 h-3.5 mr-1.5" /> 概览
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs">
                <Clock className="w-3.5 h-3.5 mr-1.5" /> 历史
            </TabsTrigger>
            <TabsTrigger value="relations" className="text-xs">
                <Share2 className="w-3.5 h-3.5 mr-1.5" /> 关系
            </TabsTrigger>
            </TabsList>
        </div>

        {/* Content: Overview */}
        <TabsContent value="overview" className="flex-1 overflow-hidden mt-0">
          <ScrollArea className="h-full p-5">
            <div className="space-y-6">
                
                {/* Key Metrics / Cards */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="text-xs text-slate-500 mb-1">Health Status</div>
                        <div className="flex items-center gap-1.5">
                            {instanceEvents.some(e => e.type === 'error') 
                                ? <AlertCircle className="w-4 h-4 text-red-500" /> 
                                : <CheckCircle className="w-4 h-4 text-green-500" />
                            }
                            <span className="font-semibold text-slate-700">
                                {instanceEvents.some(e => e.type === 'error') ? 'Attention' : 'Healthy'}
                            </span>
                        </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="text-xs text-slate-500 mb-1">Total Events</div>
                        <div className="font-semibold text-slate-700 text-lg leading-none">
                            {instanceEvents.length}
                        </div>
                    </div>
                </div>

                {/* Attributes Table */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
                        属性详情
                    </h3>
                    <div className="rounded-lg border border-slate-200 divide-y divide-slate-100 bg-white">
                        {attributes.map((attr, i) => (
                            <div key={i} className="flex items-center justify-between p-3 text-sm hover:bg-slate-50 transition-colors">
                                <span className="text-slate-500">{attr.name}</span>
                                <span className="font-medium text-slate-900 font-mono">{attr.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Raw JSON Preview (Mock) */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Raw Data</h3>
                    <div className="bg-slate-900 rounded-lg p-3 overflow-x-auto">
                        <pre className="text-[10px] text-slate-300 font-mono leading-relaxed">
{JSON.stringify({
    id: selectedInstanceId,
    type: 'Order',
    meta: { version: '1.0.2', shard: 'us-east' },
    flags: ['is_priority'],
    context: { trace_id: 'xc9-12938' }
}, null, 2)}
                        </pre>
                    </div>
                </div>

            </div>
          </ScrollArea>
        </TabsContent>

        {/* Content: History */}
        <TabsContent value="history" className="flex-1 overflow-hidden mt-0">
          <ScrollArea className="h-full p-5">
            <div className="space-y-0 relative border-l border-slate-200 ml-2">
              {instanceEvents.length === 0 && (
                  <div className="pl-6 text-sm text-slate-400 italic">暂无历史记录</div>
              )}
              
              {instanceEvents.map((event, index) => {
                const isHovered = hoveredEventId === event.id;
                return (
                  <div
                    key={event.id}
                    className={cn(
                      "relative pl-6 pb-6 group transition-all duration-200",
                      isHovered && "bg-slate-50/80 -ml-2 pl-8 rounded-r-lg"
                    )}
                    onMouseEnter={() => setHoveredEventId(event.id)}
                    onMouseLeave={() => setHoveredEventId(undefined)}
                  >
                    {/* Timeline Dot */}
                    <div className={cn(
                        "absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full border-2 ring-4 ring-white bg-white transition-all",
                        event.type === 'error' ? "border-red-500" : "border-slate-300",
                        isHovered && "scale-125 ring-blue-50 border-blue-500"
                    )} />

                    {/* Time */}
                    <div className="text-[10px] font-mono text-slate-400 mb-1 flex items-center gap-2">
                        {format(event.timestamp, 'MM-dd HH:mm:ss')}
                        {event.isCausal && (
                            <Badge variant="destructive" className="h-4 px-1 text-[9px] rounded-sm">Root Cause</Badge>
                        )}
                    </div>

                    {/* Card */}
                    <div className={cn(
                        "p-3 rounded-lg border text-sm transition-all shadow-sm",
                        event.type === 'error' 
                            ? "bg-red-50 border-red-100 text-red-900" 
                            : "bg-white border-slate-200 text-slate-700 group-hover:border-blue-200 group-hover:shadow-md"
                    )}>
                        <div className="flex items-center gap-2 mb-1.5">
                            {getEventIcon(event.type)}
                            <span className="font-semibold">{event.type.replace('_', ' ').toUpperCase()}</span>
                        </div>
                        <p className="leading-snug opacity-90">
                            {event.description}
                        </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Content: Relations */}
        <TabsContent value="relations" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full p-5">
                <div className="text-sm text-slate-500 text-center py-10">
                    <Share2 className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p>Coming Soon...</p>
                    <p className="text-xs mt-1">Relationship explorer is under construction.</p>
                </div>
            </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
