import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download, Settings, GripVertical } from "lucide-react";

export interface ColumnConfig {
  key: string;
  label: string;
  mandatory?: boolean;
}

interface TableActionButtonsProps {
  columns: ColumnConfig[];
  visibleColumns: string[];
  onVisibleColumnsChange: (visibleColumns: string[]) => void;
  onSaveColumns?: () => Promise<void>;
  onMoveColumn?: (sourceKey: string, targetKey: string) => Promise<void>;
  onExport: (exportParams: { columns: string[]; scope: "current" | "all" }) => Promise<void>;
  exportFilename?: string;
}

export const TableActionButtons: React.FC<TableActionButtonsProps> = ({
  columns,
  visibleColumns,
  onVisibleColumnsChange,
  onSaveColumns,
  onMoveColumn,
  onExport,
}) => {
  const [exportOpen, setExportOpen] = useState(false);
  const [exportColumns, setExportColumns] = useState<string[]>(visibleColumns);
  const [exportScope, setExportScope] = useState<"current" | "all">("current");
  const [columnConfigOpen, setColumnConfigOpen] = useState(false);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);

  const handleExport = async () => {
    await onExport({ columns: exportColumns, scope: exportScope });
    setExportOpen(false);
  };

  const handleSaveColumns = async () => {
    if (onSaveColumns) {
      await onSaveColumns();
    }
    setColumnConfigOpen(false);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, key: string) => {
    setDraggedColumn(key);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetKey: string) => {
    e.preventDefault();
    if (!draggedColumn || draggedColumn === targetKey || !onMoveColumn) {
      setDraggedColumn(null);
      return;
    }
    await onMoveColumn(draggedColumn, targetKey);
    setDraggedColumn(null);
  };

  return (
    <div className="flex gap-2">
      {/* Export Dialog */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogTrigger asChild>
          {/* <Button variant="outline" size="sm" className="bg-white flex items-center gap-2">
            <Download className="h-4 w-4" /> 导出数据
          </Button> */}
        </DialogTrigger>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>导出配置</DialogTitle>
            <DialogDescription>选择要导出的列与数据范围</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">导出列</Label>
              <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2">
                {columns.map((c) => (
                  <div key={c.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`export-${c.key}`}
                      checked={exportColumns.includes(c.key)}
                      onCheckedChange={(checked) =>
                        setExportColumns((prev) => (checked ? [...prev, c.key] : prev.filter((k) => k !== c.key)))
                      }
                    />
                    <Label htmlFor={`export-${c.key}`} className="cursor-pointer truncate">
                      {c.label}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setExportColumns(columns.map((c) => c.key))}>
                  全选
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setExportColumns([])}>
                  清空
                </Button>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <Label className="text-sm font-medium">数据范围</Label>
              <RadioGroup value={exportScope} onValueChange={(v: "current" | "all") => setExportScope(v)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem id="scope-current" value="current" />
                  <Label htmlFor="scope-current">导出当前数据</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem id="scope-all" value="all" />
                  <Label htmlFor="scope-all">导出全部数据（按当前筛选与排序）</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setExportOpen(false)}>
              取消
            </Button>
            <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
              确认导出
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Column Config Dialog */}
      <Dialog open={columnConfigOpen} onOpenChange={setColumnConfigOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="bg-white flex items-center gap-2">
            <Settings className="h-4 w-4" /> 列配置
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>列配置</DialogTitle>
            <DialogDescription>选择要显示的字段，拖动可调整排序</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">显示列</Label>
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2">
                {columns.map((c) => (
                  <div
                    key={c.key}
                    draggable={!!onMoveColumn}
                    onDragStart={(e) => handleDragStart(e, c.key)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, c.key)}
                    className={`flex items-center space-x-2 p-2 rounded-md hover:bg-slate-50 transition-colors border border-transparent ${
                      draggedColumn === c.key ? "opacity-50 bg-blue-50 border-dashed border-blue-200" : ""
                    }`}
                  >
                    <Checkbox
                      id={`visible-${c.key}`}
                      checked={visibleColumns.includes(c.key)}
                      disabled={c.mandatory}
                      onCheckedChange={(checked) =>
                        onVisibleColumnsChange(
                          checked ? [...visibleColumns, c.key] : visibleColumns.filter((k) => k !== c.key),
                        )
                      }
                    />
                    <Label
                      htmlFor={`visible-${c.key}`}
                      className={`cursor-pointer flex-1 truncate ${c.mandatory ? "text-slate-400" : ""}`}
                    >
                      {c.label} {c.mandatory && "(必须)"}
                    </Label>
                    {onMoveColumn && <GripVertical className="h-4 w-4 text-slate-400 cursor-move" />}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => onVisibleColumnsChange(columns.map((c) => c.key))}>
                  全选
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onVisibleColumnsChange(columns.filter((c) => c.mandatory).map((c) => c.key))}
                >
                  重置默认
                </Button>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <Label className="text-sm font-medium">预览</Label>
              <div className="border rounded-md p-3 bg-slate-50">
                <div className="flex flex-wrap gap-2">
                  {visibleColumns.map((key) => {
                    const col = columns.find((c) => c.key === key);
                    return (
                      <span key={key} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-[10px] font-medium">
                        {col?.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setColumnConfigOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveColumns} className="bg-blue-600 hover:bg-blue-700">
              确认
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
