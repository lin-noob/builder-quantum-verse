import React from "react";
import { Calendar, Clock, Database, Tag, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SortingInstance } from "./types";

interface InstanceDetailDrawerProps {
  instance: SortingInstance;
  trigger: React.ReactNode;
}

export const InstanceDetailDrawer: React.FC<InstanceDetailDrawerProps> = ({ instance, trigger }) => {
  const { instance_snapshot } = instance;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="sm:max-w-lg flex flex-col gap-0 p-0">
        <SheetHeader className="p-6 border-b">
          <div className="flex items-center gap-2 text-slate-800">
            <Database className="w-5 h-5" />
            <SheetTitle className="text-xl">实例详情</SheetTitle>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">基本信息</h3>
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">实例名称</span>
                <span className="font-medium text-slate-800">{instance_snapshot.instance_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">实例ID</span>
                <code className="text-xs bg-slate-200 px-2 py-1 rounded font-mono text-slate-700">
                  {instance_snapshot.instance_id}
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">当前状态</span>
                <Badge variant="outline" className="text-xs">
                  {instance_snapshot.current_status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">时间信息</h3>
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400" />
                <div className="flex-1">
                  <div className="text-xs text-slate-500">创建时间</div>
                  <div className="text-sm font-medium text-slate-700">{formatDate(instance_snapshot.created_at)}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-slate-400" />
                <div className="flex-1">
                  <div className="text-xs text-slate-500">更新时间</div>
                  <div className="text-sm font-medium text-slate-700">{formatDate(instance_snapshot.updated_at)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Runtime Properties */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">运行时属性</h3>
            {instance_snapshot.runtime_properties && instance_snapshot.runtime_properties.length > 0 ? (
              <div className="space-y-2">
                {instance_snapshot.runtime_properties.map((prop, index) => (
                  <div key={index} className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <Tag className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-500 mb-1">{prop.property_name}</div>
                        <div className="text-sm text-slate-700 break-words">{prop.property_value}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 rounded-lg p-4 text-center text-slate-400 text-sm">暂无运行时属性</div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
