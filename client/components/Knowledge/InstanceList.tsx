import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, Share2 } from "lucide-react";
import { Table, Tag } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { request } from "@/lib/request";

interface InstanceListProps {
  modelId: number;
}

interface ApiInstanceItem {
  id: string;
  instanceCode: string;
  instanceName?: string;
  instanceCost?: number;
  statusCode?: string;
  statusName?: string;
  regionCode?: string;
  regionName?: string;
  keyAttributes?: string;
  currencySymbol?: string;
  modelId?: string;
  gmtCreate?: string;
}

interface InstanceItem {
  id: string;
  instanceCode: string;
  status: string;
  keyProps: string;
  region: string;
  updatedAt: string;
}

const InstanceList: React.FC<InstanceListProps> = ({ modelId }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [instances, setInstances] = useState<InstanceItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const statusColorMap: Record<string, string> = {
    OK: "green",
    PENDING: "gold",
    ERROR: "red",
    INACTIVE: "default",
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch instances from API
  const fetchInstances = useCallback(async () => {
    setLoading(true);
    try {
      const response = await request.post("/quote/api/v1/instance/page", {
        modelId: modelId,
        keyword: debouncedSearch || undefined,
        currentpage: currentPage,
        pagesize: pageSize,
      });

      if (response.status === 200 && response.data?.data) {
        const apiData = response.data.data.records as ApiInstanceItem[];
        const totalCount = response.data.data.total || 0;

        const mappedInstances: InstanceItem[] = apiData.map((item) => {
          let keyPropsStr = "-";
          if (item.keyAttributes) {
            try {
              const attrs = JSON.parse(item.keyAttributes);
              const attrValues = Object.values(attrs).filter(Boolean);
              keyPropsStr = attrValues.length > 0 ? attrValues.join(" | ") : "-";
            } catch {
              keyPropsStr = "-";
            }
          }

          return {
            id: item.id,
            instanceCode: item.instanceCode || "-",
            status: item.statusName || item.statusCode || "-",
            keyProps: item.instanceName || keyPropsStr,
            region: item.regionName || item.regionCode || "-",
            updatedAt: item.gmtCreate || "-",
          };
        });

        setInstances(mappedInstances);
        setTotal(totalCount);
      } else {
        setInstances([]);
        setTotal(0);
      }
    } catch (error) {
      console.error("Failed to fetch instances:", error);
      setInstances([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [modelId, debouncedSearch, currentPage, pageSize]);

  useEffect(() => {
    if (modelId) {
      fetchInstances();
    }
  }, [modelId, debouncedSearch, currentPage, pageSize, fetchInstances]);

  const handleRowClick = (record: InstanceItem) => {
    navigate(`/Knowledge/instance/${record.id}`);
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setCurrentPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 10);
  };

  const columns: ColumnsType<InstanceItem> = [
    {
      title: "实例 ID",
      dataIndex: "instanceCode",
      key: "instanceCode",
      width: 180,
      className: "font-mono text-xs font-medium text-slate-700",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={statusColorMap[status] || "default"} className="text-xs">
          {status}
        </Tag>
      ),
    },
    {
      title: "关键属性",
      dataIndex: "keyProps",
      key: "keyProps",
      ellipsis: true,
      className: "text-xs text-slate-500",
    },
    {
      title: "更新时间",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 140,
      className: "text-xs text-slate-400",
    },
    {
      title: "操作",
      key: "action",
      width: 100,
      align: "right",
      render: (_, record) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-slate-400 hover:text-blue-600"
            onClick={(e) => {
              e.stopPropagation();
              // Share action
            }}
          >
            <Share2 className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-slate-400 hover:text-blue-600"
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick(record);
            }}
          >
            <Eye className="w-3 h-3" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 bg-slate-50/50 rounded-b-lg border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input
            placeholder="搜索实例..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs w-64 bg-white"
          />
        </div>
        <div className="text-xs text-slate-500">共 {total} 项</div>
      </div>

      {/* Table */}
      <div className="bg-white ">
        <Table<InstanceItem>
          columns={columns}
          dataSource={instances}
          rowKey="id"
          loading={loading}
          size="small"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showQuickJumper: true,
          }}
          onChange={handleTableChange}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            className: "cursor-pointer hover:bg-slate-50",
          })}
          locale={{
            emptyText: <span className="text-xs text-slate-400 italic">未找到实例。</span>,
          }}
        />
      </div>
    </div>
  );
};

export default InstanceList;
