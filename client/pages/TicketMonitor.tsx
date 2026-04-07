import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { request } from "@/lib/request";
import { Search, SlidersHorizontal, ArrowDown } from "lucide-react";

interface TicketTag {
  text: string;
  color: string;
}

interface ApiTicketTag {
  text?: string;
  name?: string;
  label?: string;
  color?: string;
}

interface ApiTicketRecord {
  id?: string | number;
  ticketId?: string | number;
  ticketCode?: string;
  code?: string;
  customerName?: string;
  customer?: string;
  latestUpdateContent?: string;
  latestContent?: string;
  summary?: string;
  updatedAt?: string;
  gmtModified?: string;
  gmtCreate?: string;
  score?: number | string;
  aiScore?: number | string;
  needsAttention?: boolean | number | string;
  attentionFlag?: boolean | number | string;
  traceCount?: number | string;
  traceNum?: number | string;
  tags?: Array<string | ApiTicketTag> | string;
  tagList?: Array<string | ApiTicketTag> | string;
  instanceCode?: string;
  instanceName?: string;
  centerCount?: string;
}

interface TicketRow {
  id: string;
  instanceCode: string;
  instanceName: string;
  latestUpdateContent: string;
  updatedAt: string;
  score: number;
  needsAttention: boolean;
  traceCount: number;
  tags: TicketTag[];
}

const defaultTagColor = "bg-gray-100 text-gray-700";

const toText = (value: unknown, fallback = "-") => {
  if (typeof value === "string") {
    return value.trim() || fallback;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return fallback;
};

const toNumber = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
};

const toBoolean = (value: unknown) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value > 0;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }

  return false;
};

const normalizeTags = (value: ApiTicketRecord["tags"]): TicketTag[] => {
  const rawTags = Array.isArray(value) ? value : [];

  return rawTags
    .map((tag) => {
      if (typeof tag === "string") {
        return {
          text: tag,
          color: defaultTagColor,
        };
      }

      if (tag && typeof tag === "object") {
        return {
          text: toText(tag.text ?? tag.name ?? tag.label, "未命名标签"),
          color: typeof tag.color === "string" && tag.color.trim() ? tag.color : defaultTagColor,
        };
      }

      return null;
    })
    .filter((tag): tag is TicketTag => Boolean(tag));
};

const normalizeTicket = (record: ApiTicketRecord): TicketRow => ({
  id: toText(record.id ?? record.ticketId ?? record.ticketCode ?? record.code, "-"),
  instanceCode: record.instanceCode,
  instanceName: record.instanceName,
  latestUpdateContent: toText(record.latestUpdateContent ?? record.latestContent ?? record.summary, "暂无最新动态"),
  updatedAt: toText(record.gmtCreate ?? record.gmtModified, "-"),
  score: toNumber(record.score ?? record.aiScore, 0),
  needsAttention: toBoolean(record.needsAttention ?? record.attentionFlag),
  traceCount: toNumber(record.centerCount, 0),
  tags: normalizeTags(record.tags ?? record.tagList),
});

export default function TicketMonitor() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
      setCurrentPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);

      try {
        const response = await request.post("/quote/api/v1/ticket/page", {
          pagesize: pageSize,
          currentpage: currentPage,
          ticketId: debouncedSearchTerm || undefined,
        });

        const payload = response.data?.data;
        const records = Array.isArray(payload?.records)
          ? payload.records
          : Array.isArray(payload?.list)
            ? payload.list
            : [];
        const normalizedTickets = (records as ApiTicketRecord[]).map(normalizeTicket);

        setTickets(normalizedTickets);
        setTotal(toNumber(payload?.total, normalizedTickets.length));
      } catch (error) {
        console.error("Failed to fetch ticket monitor list:", error);
        setTickets([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [currentPage, pageSize, debouncedSearchTerm]);

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setCurrentPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 10);
  };

  const columns: ColumnsType<TicketRow> = useMemo(
    () => [
      {
        title: "Ticket ID / 客户",
        dataIndex: "instanceName",
        key: "instanceName",
        width: "20%",
        render: (text: string, record: TicketRow) => (
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-gray-800">{text}</span>
            <span className="text-xs font-medium text-gray-400">{record.instanceCode}</span>
          </div>
        ),
      },
      {
        title: "最新动态",
        dataIndex: "latestUpdateContent",
        key: "latestUpdateContent",
        width: "45%",
        render: (text: string, record: TicketRow) => (
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">{text}</span>
            <span className="text-[13px] text-gray-400">更新时间：{record.updatedAt}</span>
          </div>
        ),
      },
      {
        title: "当前评分",
        dataIndex: "score",
        key: "score",
        align: "center",
        width: "10%",
        render: (score: number, record: TicketRow) => (
          <div className="flex flex-col items-center justify-center gap-1.5">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-[26px] w-[26px] items-center justify-center rounded-full border text-xs font-semibold ${
                  score < 60
                    ? "border-red-200 bg-red-50 text-red-500"
                    : score >= 90
                      ? "border-emerald-200 bg-emerald-50 text-emerald-500"
                      : "border-blue-200 bg-blue-50 text-blue-500"
                }`}
              >
                {score}
              </div>
              {record.needsAttention && <span className="text-[11px] font-bold text-gray-900">需关注</span>}
            </div>
          </div>
        ),
      },
      {
        title: "轨迹数量",
        dataIndex: "traceCount",
        key: "traceCount",
        align: "center",
        width: "10%",
        render: (traceCount: number) => <span className="text-sm font-semibold text-gray-600">{traceCount}</span>,
      },
      {
        title: "管理标签",
        dataIndex: "tags",
        key: "tags",
        width: "15%",
        render: (tags: TicketTag[]) => (
          <div className="flex flex-wrap items-center gap-2">
            {tags.length > 0 ? (
              tags.map((tag, index) => (
                <div
                  key={`${tag.text}-${index}`}
                  className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-medium ${tag.color || defaultTagColor}`}
                >
                  {tag.text}
                </div>
              ))
            ) : (
              <span className="text-sm text-gray-400">-</span>
            )}
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="min-h-full space-y-4 bg-gray-50 p-6">
      <Card className="flex flex-col items-center gap-4 bg-white p-4 shadow-sm md:flex-row">
        <div className="relative w-full flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="搜索 Ticket ID / 客户"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full max-w-md bg-gray-50/50 pl-10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* <Select defaultValue="只看管理关注">
            <SelectTrigger className="w-40 bg-white">
              <SelectValue placeholder="关注项" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="只看管理关注">只看管理关注</SelectItem>
              <SelectItem value="全部">全部记录</SelectItem>
            </SelectContent>
          </Select> */}

          {/* <Select defaultValue="全部">
            <SelectTrigger className="w-32 bg-white">
              <SelectValue placeholder="评分" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="全部">评分: 全部</SelectItem>
              <SelectItem value="高分">高分 (&gt;80)</SelectItem>
              <SelectItem value="低分">低分 (&lt;60)</SelectItem>
            </SelectContent>
          </Select> */}

          {/* <Button variant="outline" className="flex items-center gap-2 bg-white">
            <SlidersHorizontal className="h-4 w-4" /> 高级筛选
          </Button> */}

          {/* <Select defaultValue="更新时间">
            <SelectTrigger className="w-36 bg-white">
              <SelectValue placeholder="排序" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="更新时间">按更新时间</SelectItem>
              <SelectItem value="评分">按评分</SelectItem>
            </SelectContent>
          </Select> */}

          {/* <Button variant="outline" className="flex items-center gap-2 bg-white">
            <ArrowDown className="h-4 w-4" /> 降序
          </Button> */}

          <Button size="sm" onClick={handleSearch}>
            筛选
          </Button>
        </div>
      </Card>

      <Card className="bg-white p-4 shadow-sm">
        <div className="overflow-x-auto">
          <Table<TicketRow>
            columns={columns}
            dataSource={tickets}
            loading={loading}
            rowKey="id"
            className="w-full"
            pagination={{
              current: currentPage,
              pageSize,
              total,
              showTotal: (value) => `共 ${value} 条`,
            }}
            scroll={{
              y: 580,
            }}
            onChange={handleTableChange}
            onRow={(record) => ({
              onClick: () => {
                navigate(`/ticket-monitor/detail?ticketId=${record.id}`);
              },
              className: "cursor-pointer",
            })}
            locale={{
              emptyText: "暂无工单数据",
            }}
          />
        </div>
      </Card>
    </div>
  );
}
