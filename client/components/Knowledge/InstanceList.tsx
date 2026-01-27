import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, Share2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface InstanceListProps {
  typeId: string;
}

interface InstanceItem {
  id: string;
  status: string;
  keyProps: string; // Summarized key properties
  updatedAt: string;
}

const InstanceList: React.FC<InstanceListProps> = ({ typeId }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [instances, setInstances] = useState<InstanceItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const statusMap: Record<string, string> = {
    "Active": "活跃",
    "Frozen": "冻结",
    "Archived": "归档"
  };

  // Mock Fetch Logic
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockData: InstanceItem[] = Array.from({ length: 10 }).map((_, i) => ({
        id: `${typeId}-${20240000 + i}`,
        status: ["Active", "Frozen", "Archived"][Math.floor(Math.random() * 3)],
        keyProps: `区域: ${["北美", "欧洲", "亚太"][Math.floor(Math.random() * 3)]}, 价值: ¥${Math.floor(
          Math.random() * 1000
        )}`,
        updatedAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toLocaleDateString(),
      }));
      setInstances(mockData);
      setLoading(false);
    }, 600);
  }, [typeId]);

  const handleRowClick = (instanceId: string) => {
    navigate(`/Knowledge/instance/${instanceId}`);
  };

  const filteredInstances = instances.filter(
    (inst) =>
      inst.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (statusMap[inst.status] || inst.status).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 bg-slate-50/50 rounded-b-lg border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input
            placeholder={`搜索 ${typeId} 实例...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs w-64 bg-white"
          />
        </div>
        <div className="text-xs text-slate-500">
          显示 {filteredInstances.length} 项
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="h-8 text-xs font-medium text-slate-500 w-[180px]">实例 ID</TableHead>
              <TableHead className="h-8 text-xs font-medium text-slate-500 w-[100px]">状态</TableHead>
              <TableHead className="h-8 text-xs font-medium text-slate-500">关键属性</TableHead>
              <TableHead className="h-8 text-xs font-medium text-slate-500 w-[120px]">更新时间</TableHead>
              <TableHead className="h-8 text-xs font-medium text-slate-500 w-[100px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-400"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredInstances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-xs text-slate-400 italic">
                  未找到实例。
                </TableCell>
              </TableRow>
            ) : (
              filteredInstances.map((inst) => (
                <TableRow 
                  key={inst.id} 
                  className="hover:bg-slate-50 cursor-pointer group"
                  onClick={() => handleRowClick(inst.id)}
                >
                  <TableCell className="font-mono text-xs font-medium text-slate-700 py-2">
                    {inst.id}
                  </TableCell>
                  <TableCell className="py-2">
                    <Badge 
                      variant="outline" 
                      className={`
                        text-[10px] h-5 px-1.5 font-normal
                        ${inst.status === "Active" ? "bg-green-50 text-green-700 border-green-200" : 
                          inst.status === "Frozen" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-100 text-slate-600"}
                      `}
                    >
                      {statusMap[inst.status] || inst.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 py-2 max-w-[200px] truncate" title={inst.keyProps}>
                    {inst.keyProps}
                  </TableCell>
                  <TableCell className="text-xs text-slate-400 py-2">
                    {inst.updatedAt}
                  </TableCell>
                  <TableCell className="text-right py-2">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-blue-600">
                        <Share2 className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-blue-600">
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination Mock */}
      {!loading && filteredInstances.length > 0 && (
        <div className="flex justify-center mt-3">
            <Button variant="ghost" size="sm" className="text-xs text-slate-400 h-7">加载更多</Button>
        </div>
      )}
    </div>
  );
};

export default InstanceList;
