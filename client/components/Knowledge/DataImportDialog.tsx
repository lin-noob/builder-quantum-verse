import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CloudUpload, FileText, Download, X, HelpCircle, Loader2 } from "lucide-react";
import { KnowledgeNode } from "../../types/Knowledge";
import { cn } from "@/lib/utils";
import { knowledgeService } from "@/services/knowledgeService";
import { toast } from "sonner"; // Assuming sonner is used for toasts based on typical shadcn setups, fallback to console if not available

interface DataImportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  nodes: KnowledgeNode[];
}

const DataImportDialog: React.FC<DataImportDialogProps> = ({ isOpen, onOpenChange, nodes }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validTypes = [".json", ".csv", ".xlsx"];
    const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

    if (!validTypes.includes(extension)) {
      toast?.error?.("不支持的文件类型") || alert("不支持的文件类型");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast?.error?.("文件大小超过 10MB 限制") || alert("文件大小超过 10MB 限制");
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleStartImport = async (bool: boolean) => {
    if (!selectedNodeId || !selectedFile) return;

    setIsUploading(true);
    try {
      const selectedNode = nodes.find((n) => n.id === selectedNodeId);
      const modelId = selectedNode?.numericId || selectedNodeId;

      const res = await knowledgeService.uploadExcel(modelId, selectedFile, bool);

      if (res.status === 200) {
        toast?.success?.("数据导入成功") || alert("数据导入成功");
        onOpenChange(false);
        // Reset state
        setSelectedFile(null);
        setSelectedNodeId("");
      } else {
        toast?.error?.(res.data?.message || "导入失败") || alert("导入失败");
      }
    } catch (err) {
      console.error("Import error:", err);
      toast?.error?.("网络请求失败，请稍后重试") || alert("网络请求失败，请稍后重试");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const templateUrl = "/assets/template.csv";
    const link = document.createElement("a");
    link.href = templateUrl;
    link.download = "template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white">
        <DialogHeader className="px-8 pt-8 pb-4">
          <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">导入数据向导</DialogTitle>
        </DialogHeader>

        <div className="px-8 pb-8 space-y-8">
          {/* Step 1: Select Type */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-slate-600 flex items-center gap-2">1. 选择目标对象类型</div>
            <Select value={selectedNodeId} onValueChange={setSelectedNodeId}>
              <SelectTrigger className="h-12 w-full border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors focus:ring-blue-500/20">
                <SelectValue placeholder="选择对象类型..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-xl max-h-[300px]">
                {nodes.map((node) => (
                  <SelectItem
                    key={node.id}
                    value={node.id}
                    className="py-2.5 rounded-lg focus:bg-blue-50 focus:text-blue-700"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          node.type === "Master"
                            ? "bg-blue-500"
                            : node.type === "Transaction"
                              ? "bg-purple-500"
                              : "bg-emerald-500",
                        )}
                      />
                      <span className="font-medium text-slate-700">{node.name}</span>
                      <span className="text-xs text-slate-400 font-mono">({node.id})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Step 2: Upload Area */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-slate-600 flex items-center gap-2">2. 上传数据文件</div>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "relative group flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed rounded-2xl transition-all duration-300",
                isDragging
                  ? "border-blue-500 bg-blue-50/50 scale-[0.99]"
                  : "border-slate-200 bg-slate-50/30 hover:border-slate-300 hover:bg-slate-50/80",
              )}
            >
              <div
                className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 shadow-sm",
                  isDragging ? "bg-blue-500 text-white" : "bg-blue-50 text-blue-600",
                )}
              >
                <CloudUpload className="w-7 h-7" />
              </div>

              <div className="text-center">
                <p className="text-base font-semibold text-slate-800">
                  {selectedFile ? selectedFile.name : "点击或拖拽文件到此处"}
                </p>
                <p className="text-xs text-slate-500 mt-1.5">
                  {selectedFile
                    ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                    : "支持 .json, .csv, .xlsx 文件 (最大 10MB)"}
                </p>
              </div>

              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".json,.csv,.xlsx"
                onChange={handleFileChange}
                disabled={isUploading}
              />

              {selectedFile && !isUploading && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Template Download Link */}
          <div className="flex justify-start">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium group transition-colors relative whitespace-nowrap"
            >
              <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform shrink-0" />
              <div className="relative">
                下载导入模板
                <div className="absolute -bottom-0.5 left-0 h-[1.5px] w-0 group-hover:w-full bg-blue-600 transition-all duration-300" />
              </div>
            </button>
          </div>
        </div>

        <DialogFooter className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 sm:justify-end">
          <Button
            disabled={!selectedNodeId || !selectedFile || isUploading}
            onClick={() => handleStartImport(false)}
            className={cn(
              "h-11 px-8 rounded-xl font-bold shadow-lg shadow-blue-500/10 transition-all duration-300 transform active:scale-95",
              selectedNodeId && selectedFile && !isUploading
                ? "bg-gradient-to-r text-white"
                : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none",
            )}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                导入中...
              </>
            ) : (
              "开始导入"
            )}
          </Button>
          <Button
            disabled={!selectedNodeId || !selectedFile || isUploading}
            onClick={() => handleStartImport(true)}
            className={cn(
              "h-11 px-8 rounded-xl font-bold shadow-lg shadow-blue-500/10 transition-all duration-300 transform active:scale-95",
              selectedNodeId && selectedFile && !isUploading
                ? "bg-gradient-to-r text-white"
                : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none",
            )}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                导入中...
              </>
            ) : (
              "导入并调用AI"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DataImportDialog;
