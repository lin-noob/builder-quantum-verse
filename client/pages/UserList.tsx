import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { Table, DatePicker, Tooltip, Typography, Select } from "antd";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Settings,
  X,
  Check,
  GripVertical,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { request } from "@/lib/request";
import { MockDataService } from "@/services/mockDataService";
import { formatStartDate, formatEndDate, cn } from "@/lib/utils";
import { useRoleStore } from "@/stores/roleStore";
import useProjectStore from "@/stores/projectStore";
import { ApiUser } from "@/lib/profile";
import { userProfileService, ColumnSetting } from "@/services/userProfileService";
import { ruleService } from "@/services/ruleService";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// 列配置接口
interface ColumnConfig {
  key: string;
  label: string;
  source: "profile" | "event";
  fixed?: boolean;
  permission?: string;
  type?: "string" | "number" | "date" | "boolean" | "select";
  filterable?: boolean; // 是否可筛选，默认为 true
  options?: {
    label: string;
    value: string;
  }[];
}

const extraF: ColumnConfig[] = [
  {
    key: "firstReferrer",
    label: "访问来源",
    source: "profile",
    type: "select",
    options: [
      {
        label: "付费广告",
        value: "付费广告",
      },
      {
        label: "自然搜索",
        value: "自然搜索",
      },
      {
        label: "其他渠道",
        value: "其他渠道",
      },
      {
        label: "直接访问",
        value: "直接访问",
      },
    ],
  },
  {
    key: "source",
    label: "utm_source",
    source: "profile",
    type: "string",
  },
  {
    key: "medium",
    label: "utm_medium",
    source: "profile",
    type: "string",
  },
  {
    key: "campaign",
    label: "utm_campaign",
    source: "profile",
    type: "string",
  },
];

const extraS: ColumnConfig[] = [
  // {
  //   key: "utm_content",
  //   label: "utm_content",
  //   source: "profile",
  //   type: "string",
  // },
  // {
  //   key: "utm_term",
  //   label: "utm_term",
  //   source: "profile",
  //   type: "string",
  // },
  // 30天
  {
    key: "sessionTotal",
    label: "近30天会话次数", // sessionTotal
    source: "profile",
    type: "string",
  },
  // {
  //   key: "eventCount7d",
  //   label: "近7天事件数",
  //   source: "profile",
  //   type: "string",
  // },
  // {
  //   key: "pageViewTotal",
  //   label: "页面浏览量",
  //   source: "profile",
  //   type: "string",
  // },
  {
    key: "eventCount",
    label: "近30天事件数", // eventCount
    source: "profile",
    type: "string",
  },
  {
    key: "pageViewTotal",
    label: "近30天页面浏览", // pageViewTotal
    source: "profile",
    type: "string",
  },
];

// 预定义字段
const PROFILE_FIELDS: ColumnConfig[] = [
  { key: "name", label: "用户姓名", source: "profile", type: "string" },
  { key: "company", label: "公司", source: "profile", type: "string" },
  { key: "contact", label: "联系方式", source: "profile", type: "string" },
  { key: "firstVisitSite", label: "首访链接", source: "profile", type: "string" },
  { key: "firstVisitTime", label: "首次访问时间", source: "profile", type: "date" },
  { key: "registrationTime", label: "注册时间", source: "profile", type: "date" },
  // { key: "firstPurchaseTime", label: "首次购买时间", source: "profile", type: "date" },
  { key: "lastActiveTime", label: "最近活跃时间", source: "profile", type: "date" },
  // { key: "totalSpent", label: "总消费", source: "profile", permission: "user.amountspent", type: "number" },
  // { key: "currency", label: "货币", source: "profile", type: "string" },
  // { key: "ltv90Days", label: "90天LTV", source: "profile", type: "number" },
  // { key: "sessions30d", label: "近30天会话", source: "profile", type: "number" },
  // { key: "pageviews30d", label: "近30天PV", source: "profile", type: "number" },
  // { key: "aov30d", label: "近30天AOV", source: "profile", type: "number" },
  // { key: "bounceRate", label: "跳出率", source: "profile", type: "number" },
];

// EVENT_FIELDS removed from optional columns per requirement
const EVENT_FIELDS: ColumnConfig[] = [];

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface SortConfig {
  field: string | null;
  direction: "asc" | "desc";
}

// 转换为UI需要的用户格式
export interface User {
  id: string;
  userId: string;
  cdpId: string;
  name: string;
  company: string;
  contact: string;
  firstVisitTime: string;
  registrationTime: string;
  firstPurchaseTime: string;
  lastActiveTime: string;
  totalSpent: number;
  currency: string;
  // 5+2扩展指标
  ltv90Days?: number;
  sessions30d?: number;
  pageviews30d?: number;
  aov30d?: number;
  bounceRate?: number; // 0..1
  [key: string]: any; // Allow dynamic fields for events
}

interface OrderSummaryDto {
  cdpUserId?: string;
  fullName?: string;
  contactInfo?: string;
  companyName?: string;
  currentpage?: number;
  endDate?: string;
  keyword?: string;
  order?: string;
  pagesize?: number;
  paramother?: Record<string, string>;
  searchtype?: string;
  shopid?: string;
  sort?: string;
  sortColumn?: string;
  startDate?: string;
}

interface ApiResponse {
  code: string;
  data: ApiUser[];
  msg: string;
  total: number;
}

export default function UserList() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTimeField, setSelectedTimeField] = useState("lastActiveTime");
  const [dateRange, setDateRange] = useState<DateRange>({
    start: null,
    end: null,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "lastActiveTime",
    direction: "desc",
  });
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  // 5+2 指标筛选条件（范围）
  const [metricFilters, setMetricFilters] = useState({
    ltv90Min: "",
    ltv90Max: "",
    sessionsMin: "",
    sessionsMax: "",
    pageviewsMin: "",
    pageviewsMax: "",
    aovMin: "",
    aovMax: "",
    bounceMin: "", // 百分比 0-100
    bounceMax: "", // 百分比 0-100
  });

  // Column Configuration State
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "name",
    "contact",
    "firstReferrer",
    "firstVisitTime",
    "registrationTime",
    "firstPurchaseTime",
    "lastActiveTime",
    "totalSpent",
    "sessions30d",
    "pageviews30d",
  ]);
  const [isColumnConfigOpen, setIsColumnConfigOpen] = useState(false);
  const [tempSelectedColumns, setTempSelectedColumns] = useState<string[]>([]);
  const [columnSearchQuery, setColumnSearchQuery] = useState("");

  // Dynamic Column Filters
  const [columnFilters, setColumnFilters] = useState<Record<string, any>>({});
  const [ruleFields, setRuleFields] = useState<ColumnConfig[]>([]);

  // Debounced values
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const debouncedColumnFilters = useDebounce(columnFilters, 500);

  // Filter Card Expansion State
  const [isFilterExpanded, setIsFilterExpanded] = useState(() => {
    return localStorage.getItem("userListFilterExpanded") === "true";
  });

  useEffect(() => {
    localStorage.setItem("userListFilterExpanded", String(isFilterExpanded));
  }, [isFilterExpanded]);

  // Fetch column settings on mount
  const fetchColumnSettings = useCallback(async () => {
    try {
      const response = await userProfileService.getColumnSettings();
      if (response.data && response.data.length) {
        // Filter enabled columns and sort by sortOrder
        const enabledColumns = response.data
          .filter((setting) => setting.enabled)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((setting) => setting.columnKey);

        // Only update if we have enabled columns, otherwise fall back to default
        if (enabledColumns.length > 0) {
          setSelectedColumns(enabledColumns);
        }
      }
    } catch (error) {
      console.error("Failed to fetch column settings:", error);
    }
  }, []);

  useEffect(() => {
    fetchColumnSettings();
  }, [fetchColumnSettings]);

  // Fetch rule fields
  const fetchRuleFields = useCallback(async () => {
    try {
      const rules = await ruleService.getRules("");
      const fields: ColumnConfig[] = rules.map((rule) => ({
        key: rule.id ? String(rule.id) : rule.ruleName, // Using rule ID directly as key
        label: rule.ruleName,
        source: "profile", // Rules are usually profile attributes
        type: "number", // Rule metrics are typically numbers
      }));
      setRuleFields(fields);
    } catch (error) {
      console.error("Failed to fetch rule fields:", error);
    }
  }, []);

  useEffect(() => {
    fetchRuleFields();
  }, [fetchRuleFields]);

  // Helper to generate mock event data for users
  const enrichUsersWithMockEvents = useCallback((users: User[]) => {
    return users.map((u) => {
      const mockEvents: Record<string, number> = {};
      EVENT_FIELDS.forEach((field) => {
        // Deterministic-ish random based on user ID for consistency
        const seed = u.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        mockEvents[field.key] = Math.floor((seed % 100) * Math.random() * 10);
      });
      return { ...u, ...mockEvents };
    });
  }, []);

  // 权限检查
  const { hasPermission, permissions } = useRoleStore();

  // 项目状态检查
  const { currentProject } = useProjectStore();

  // 转换API用户数据为UI格式
  const convertApiUserToUser = (apiUser: ApiUser): User => {
    const baseUser = {
      ...apiUser,
      id: apiUser.id || "",
      userId: apiUser.userId || "",
      cdpId: apiUser.cdpUserId ? apiUser.cdpUserId.toString() : "",
      name: apiUser.fullName || "",
      company: apiUser.companyName || "",
      contact: apiUser.contactInfo || "",
      firstVisitTime: apiUser.createGmt || "",
      registrationTime: apiUser.signTime || "",
      firstPurchaseTime: apiUser.minBuyTime || "",
      lastActiveTime: apiUser.loginDate || "",
      totalSpent: apiUser.totalOrders || 0,
      currency: apiUser.currencySymbol || "",
      // 5+2扩展指标
      ltv90Days: apiUser.ltv90Days,
      sessions30d: apiUser.sessionTotal,
      pageviews30d: apiUser.pageViewTotal,
      metrics: apiUser.metrics,
      userProfile: apiUser.userProfile,
    };
    // 添加 extraF 字段 - 从 userProfile 中取值
    extraF.forEach((field) => {
      if (apiUser.userProfile && apiUser.userProfile[field.key as keyof ApiUser] !== undefined) {
        (baseUser as any)[field.key] = apiUser.userProfile[field.key as keyof ApiUser];
      }
    });

    // 添加 extraS 字段 - 从列表字段中取值
    extraS.forEach((field) => {
      if (field.key === "sessionCount30d") {
        (baseUser as any)[field.key] = apiUser.userEngagement?.sessionCount30d || apiUser.sessionTotal;
      } else if (field.key === "eventCount30d") {
        (baseUser as any)[field.key] = apiUser.userEngagement?.eventCount30d;
      } else if (field.key === "pageView30d") {
        (baseUser as any)[field.key] = apiUser.userEngagement?.pageView30d || apiUser.pageViewTotal;
      } else if (apiUser[field.key as keyof ApiUser] !== undefined) {
        (baseUser as any)[field.key] = apiUser[field.key as keyof ApiUser];
      }
    });

    return baseUser;
  };

  // 获取搜索类型映射
  const getSearchTypeMapping = (timeField: string): string => {
    switch (timeField) {
      case "firstVisitTime":
        return "createGmt";
      case "registrationTime":
        return "signTime";
      case "firstPurchaseTime":
        return "minBuyTime";
      case "lastActiveTime":
        return "maxBuyTime";
      default:
        return "signTime";
    }
  };

  // 获取排序字段映射
  const getSortFieldMapping = (field: string): string => {
    switch (field) {
      case "firstReferrer":
        return "first_referrer";
      case "firstVisitSite":
        return "first_visit_site";
      case "firstVisitTime":
        return "create_gmt";
      case "registrationTime":
        return "sign_time";
      case "firstPurchaseTime":
        return "min_buy_time";
      case "lastActiveTime":
        return "login_date";
      case "totalSpent":
        return "total_orders";
      // 扩展指标的后端排序映射（若后端不支持，将回退默认）
      case "ltv90Days":
        return "ltv_90_days";
      case "sessions30d":
        return "session_total";
      case "eventCount":
        return "eventCount";
      case "sessionTotal":
        return "sessionTotal";
      case "pageViewTotal":
        return "pageViewTotal";
      case "aov30d":
        return "aov_30d";
      case "contact":
        return "contact_info";
      case "name":
        return "full_name";
      case "company":
        return "company_name";
      case "currency":
        return "currency_symbol";
      case "bounceRate":
        return "bounce_rate";
      default:
        return field; // Return key for event fields or others
    }
  };

  // 调用API获取用户数据
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // 构建动态过滤器，排除 extraF 和 extraS 配置的字段以及 firstVisitSite
      const filters: Record<string, any> = {};
      // const extraFKeys = extraF.map((col) => col.key);
      const extraSKeys = extraS.map((col) => col.key);
      const excludedKeys = [...extraSKeys];

      Object.entries(columnFilters).forEach(([key, value]) => {
        if (value && !excludedKeys.includes(key)) {
          filters[key] = value;
        }
      });

      if (!currentProject || !currentProject.id) {
        const mockParams = {
          page: pagination.page,
          pageSize: pagination.pageSize,
          search: debouncedSearchQuery.trim() || undefined,
          sortField: sortConfig.field || undefined,
          sortDirection: sortConfig.direction,
          filters: filters,
        };

        const mockResult = await MockDataService.getUsers(mockParams);
        // Cast MockUser to User and enrich
        const usersWithEvents = enrichUsersWithMockEvents(mockResult.users as unknown as User[]);
        setUsers(usersWithEvents);
        setPagination((prev) => ({ ...prev, total: mockResult.total }));
        return;
      }

      // 有项目时调用真实API
      const requestBody: OrderSummaryDto = {
        currentpage: pagination.page,
        pagesize: pagination.pageSize,
      };

      // 只有在有值的时候才添加这些字段
      if (debouncedSearchQuery.trim()) {
        requestBody.cdpUserId = debouncedSearchQuery.trim();
      }

      if (dateRange.start) {
        requestBody.startDate = formatStartDate(dateRange.start);
      }

      if (dateRange.end) {
        requestBody.endDate = formatEndDate(dateRange.end);
      }

      // if (selectedTimeField) {
      //   requestBody.searchtype = getSearchTypeMapping(selectedTimeField);
      // }

      if (sortConfig.field) {
        // Check if this is a rule field (numeric key)
        if (!isNaN(Number(sortConfig.field))) {
          // Rule field: use sortColumn
          requestBody.sortColumn = sortConfig.field;
          requestBody.order = sortConfig.direction;
        } else {
          // Regular field: use sort
          requestBody.sort = getSortFieldMapping(sortConfig.field);
          requestBody.order = sortConfig.direction;
        }
      }
      Object.entries(filters).forEach(([key, val]) => {
        // Map date filters to backend field names
        let mappedKey = key;

        // Map date range filters for specific fields
        if (key === "start_firstVisitTime") mappedKey = "startSignTime";
        else if (key === "end_firstVisitTime") mappedKey = "endSignTime";
        else if (key === "start_registrationTime") mappedKey = "startDate";
        else if (key === "end_registrationTime") mappedKey = "endDate";
        else if (key === "start_firstPurchaseTime") mappedKey = "startMinBuyTime";
        else if (key === "end_firstPurchaseTime") mappedKey = "endMinBuyTime";
        else if (key === "start_lastActiveTime") mappedKey = "startMaxBuyTime";
        else if (key === "end_lastActiveTime") mappedKey = "endMaxBuyTime";
        else if (key === "contact") mappedKey = "contactInfo";
        else if (key === "name") mappedKey = "fullName";
        else if (key === "company") mappedKey = "companyName";
        else if (key === "max_totalSpent") mappedKey = "maxTotalOrders";
        else if (key === "min_totalSpent") mappedKey = "minTotalOrders";
        else if (key === "currency") mappedKey = "currencySymbol";

        requestBody[mappedKey] = String(val);
      });

      // 使用通用request方法明确指定POST，添加快速超时
      const response = await request.request<{
        data: {
          code: string;
          records: ApiUser[];
          msg: string;
          total: number;
        };
      }>("/quote/api/v1/profile/list", {
        method: "POST",
        data: requestBody,
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 3000,
      });

      const records = response.data.data.records || [];
      if (records) {
        // 即使响应码不是200也尝试处理数据
        const apiUsers = records;
        if (Array.isArray(apiUsers)) {
          const convertedUsers = apiUsers.map(convertApiUserToUser);
          setUsers(enrichUsersWithMockEvents(convertedUsers));
          setPagination((prev) => ({ ...prev, total: response.data.data.total || 0 }));
        } else {
          console.log("数据格式异常，data不是数组:", apiUsers);
          setUsers([]);
          setPagination((prev) => ({ ...prev, total: 0 }));
        }
      } else {
        console.log("响应中没有data字段");
        setUsers([]);
        setPagination((prev) => ({ ...prev, total: 0 }));
      }
    } catch (error: any) {
      console.log("获取用户数据失败:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.pageSize,
    debouncedSearchQuery,
    sortConfig,
    dateRange,
    selectedTimeField,
    debouncedColumnFilters,
    currentProject,
  ]);

  // 初始化和依赖更新时获取数据
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Sort function
  const handleSort = (field: string) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
    setPagination((prev) => ({ ...prev, page: 1 })); // 重置到第一页
  };

  const getSortIcon = (field: string) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortConfig.direction === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  // 搜索处理
  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    // fetchUsers will be triggered by useEffect when debounced value changes
    // or if we want immediate trigger, we might need to bypass debounce,
    // but for now we rely on the effect.
  };

  // Reset page when search query or filters change (debounced)
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearchQuery, debouncedColumnFilters]);

  // 页面变化处理
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (pageSize: string) => {
    setPagination((prev) => ({ ...prev, pageSize: parseInt(pageSize), page: 1 }));
  };

  // Pagination - 由于数据来自API，直接使用users数组
  const totalPages = Math.ceil(pagination.total / pagination.pageSize);
  const startIndex = (pagination.page - 1) * pagination.pageSize;
  const endIndex = Math.min(startIndex + pagination.pageSize, pagination.total);
  const currentUsers = users; // API已经返回了当前页的数据

  const formatCurrency = (amount: number, currency: string) => {
    return currency + amount;
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleReset = () => {
    // setSearchQuery(""); // Keep CDP ID per requirement
    // setSelectedTimeField("lastActiveTime"); // Deprecated
    // setDateRange({ start: null, end: null }); // Deprecated
    setSortConfig({ field: null, direction: "asc" });
    setPagination((prev) => ({ ...prev, page: 1 }));
    setColumnFilters({});
    setSearchQuery("");
  };

  // 手动刷新数据
  const handleRefresh = () => {
    fetchUsers();
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: undefined, // Removed seconds to save space
    });
  };

  const handleOpenColumnConfig = () => {
    setTempSelectedColumns([...selectedColumns]);
    setColumnSearchQuery("");
    setIsColumnConfigOpen(true);
  };

  const handleToggleColumn = (key: string) => {
    if (tempSelectedColumns.includes(key)) {
      setTempSelectedColumns(tempSelectedColumns.filter((k) => k !== key));
    } else {
      setTempSelectedColumns([...tempSelectedColumns, key]);
    }
  };

  const handleRemoveColumn = (key: string) => {
    setTempSelectedColumns(tempSelectedColumns.filter((k) => k !== key));
  };

  const handleMoveColumn = (index: number, direction: "up" | "down") => {
    const newCols = [...tempSelectedColumns];
    if (direction === "up" && index > 0) {
      [newCols[index], newCols[index - 1]] = [newCols[index - 1], newCols[index]];
    } else if (direction === "down" && index < newCols.length - 1) {
      [newCols[index], newCols[index + 1]] = [newCols[index + 1], newCols[index]];
    }
    setTempSelectedColumns(newCols);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(tempSelectedColumns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTempSelectedColumns(items);
  };

  const handleApplyColumns = async () => {
    setSelectedColumns(tempSelectedColumns);

    // Cleanup filters for removed columns
    const newFilters = { ...columnFilters };
    Object.keys(newFilters).forEach((filterKey) => {
      // Check if filter key belongs to a removed column
      // Heuristic: filter keys are like min_KEY, max_KEY, etc.
      const isRemoved = !tempSelectedColumns.some((colKey) => filterKey.includes(colKey));
      if (isRemoved) {
        delete newFilters[filterKey];
      }
    });
    setColumnFilters(newFilters);

    setIsColumnConfigOpen(false);

    // Save configuration to backend
    try {
      const settingsToSave: Partial<ColumnSetting>[] = [];

      // 1. Add enabled columns with new order
      tempSelectedColumns.forEach((key, index) => {
        const col = allColumns.find((c) => c.key === key);
        if (col) {
          settingsToSave.push({
            columnKey: key,
            columnLabel: col.label,
            columnType: col.type || "string",
            enabled: true,
            sortOrder: index,
            sourceField: col.source,
          });
        }
      });

      // 2. Add disabled columns (append to end, order doesn't matter much but good to keep)
      const disabledColumns = allColumns.filter((col) => !tempSelectedColumns.includes(col.key));
      disabledColumns.forEach((col, index) => {
        settingsToSave.push({
          columnKey: col.key,
          columnLabel: col.label,
          columnType: col.type || "string",
          enabled: false,
          sortOrder: tempSelectedColumns.length + index,
          sourceField: col.source,
        });
      });

      await userProfileService.saveColumnSettings(settingsToSave);
      toast.success(t("userList.columnConfigSaved", "Column configuration saved"));
    } catch (error) {
      console.error("Failed to save column settings:", error);
      toast.error(t("userList.columnConfigSaveFailed", "Failed to save column configuration"));
    }
  };

  const handleResetColumns = () => {
    setTempSelectedColumns([]);
  };

  const getFilteredFields = (source: "profile" | "event") => {
    const fields = source === "profile" ? [...PROFILE_FIELDS, ...extraF, ...extraS] : EVENT_FIELDS;
    if (!columnSearchQuery) return fields;
    return fields.filter((f) => f.label.toLowerCase().includes(columnSearchQuery.toLowerCase()));
  };

  const allColumns = useMemo(
    () => [...PROFILE_FIELDS, ...EVENT_FIELDS, ...extraF, ...extraS, ...ruleFields],
    [ruleFields],
  );
  const getColumnLabel = (key: string) => {
    const col = allColumns.find((c) => c.key === key);
    return col ? col.label : key;
  };

  const getColumnSource = (key: string) => {
    const col = allColumns.find((c) => c.key === key);
    return col ? col.source : "profile";
  };

  const updateColumnFilter = (key: string, value: any) => {
    setColumnFilters((prev) => ({ ...prev, [key]: value }));
  };

  const renderFilterInput = (colKey: string) => {
    const col = allColumns.find((c) => c.key === colKey);
    if (!col) return null;

    // 排除 extraF 和 extraS 配置的字段以及 firstVisitSite，不生成筛选输入框
    // const extraFKeys = extraF.map((col) => col.key);
    const extraSKeys = extraS.map((col) => col.key);
    const excludedKeys = [...extraSKeys];
    if (excludedKeys.includes(colKey)) return null;

    // Check permission
    if (col.permission && !hasPermission(col.permission)) return null;

    if (col.type === "number") {
      return (
        <div key={colKey} className="flex flex-col gap-1 w-full">
          <span className="text-xs font-medium text-gray-500">{col.label}</span>
          <div className="flex items-center gap-1">
            <Input
              placeholder="Min"
              className="h-8 text-xs"
              type="number"
              value={columnFilters[`min_${colKey}`] || ""}
              onChange={(e) => updateColumnFilter(`min_${colKey}`, e.target.value)}
            />
            <span className="text-gray-400">-</span>
            <Input
              placeholder="Max"
              className="h-8 text-xs"
              type="number"
              value={columnFilters[`max_${colKey}`] || ""}
              onChange={(e) => updateColumnFilter(`max_${colKey}`, e.target.value)}
            />
          </div>
        </div>
      );
    } else if (col.type === "date") {
      const startVal = columnFilters[`start_${colKey}`];
      const endVal = columnFilters[`end_${colKey}`];
      const rangeValue = startVal && endVal ? [dayjs(startVal), dayjs(endVal)] : null;

      return (
        <div key={colKey} className="flex flex-col gap-1 w-full">
          <span className="text-xs font-medium text-gray-500">{col.label}</span>
          <DatePicker.RangePicker
            className="w-full"
            size="middle"
            value={rangeValue as any}
            onChange={(dates, dateStrings) => {
              if (dates) {
                updateColumnFilter(`start_${colKey}`, dateStrings[0]);
                updateColumnFilter(`end_${colKey}`, dateStrings[1]);
              } else {
                updateColumnFilter(`start_${colKey}`, null);
                updateColumnFilter(`end_${colKey}`, null);
              }
            }}
          />
        </div>
      );
    } else if (col.type === "select") {
      return (
        <div key={colKey} className="flex flex-col gap-1 w-full">
          <span className="text-xs font-medium text-gray-500">{col.label}</span>
          <div className="flex items-center gap-1">
            <Select
              placeholder="Select"
              className="text-xs w-full"
              size="middle"
              value={columnFilters[`${colKey}`] || undefined}
              onChange={(val) => updateColumnFilter(`${colKey}`, val)}
              options={col.options}
              open
              allowClear
            />
          </div>
        </div>
      );
    }

    // Default string/text
    return (
      <div key={colKey} className="flex flex-col gap-1 w-full">
        <span className="text-xs font-medium text-gray-500">{col.label}</span>
        <Input
          placeholder="Contains..."
          className="h-8 text-xs"
          value={columnFilters[`${colKey}`] || ""}
          onChange={(e) => updateColumnFilter(`${colKey}`, e.target.value)}
        />
      </div>
    );
  };

  const renderCell = (user: User, key: string) => {
    // Custom renderers based on key
    if (key === "name") {
      return (
        <div className="space-y-1 max-w-[150px]">
          <div className="font-mono text-xs text-gray-900 truncate">{user.userId || user.id}</div>
          <div className="text-xs text-gray-500 truncate">{user.name || user.fullName || "N/A"}</div>
        </div>
      );
    }
    if (key === "company") return <span className="text-gray-400">{user.company || "N/A"}</span>;
    if (["firstVisitTime", "registrationTime", "firstPurchaseTime", "lastActiveTime"].includes(key)) {
      return formatDateTime(user[key]);
    }
    if (key === "totalSpent") return formatCurrency(user.totalSpent || 0, user.currency);
    if (key === "bounceRate") return user.bounceRate != null ? `${Math.round((user.bounceRate || 0) * 100)}%` : "-";
    if (key === "currency") return user.currency || "-";
    if (key === "firstVisitSite") {
      return (
        <Tooltip title={user[key]}>
          <Typography.Text style={{ maxWidth: 200 }} ellipsis={{ tooltip: false }}>
            {user[key] || "N/A"}
          </Typography.Text>
        </Tooltip>
      );
    }

    // Handle rule fields from metrics object
    // Check if this is a numeric key (rule ID)
    if (!isNaN(Number(key)) && user.metrics && user.metrics[key] !== undefined) {
      return user.metrics[key];
    }

    // Default fallback
    return user[key] ?? "-";
  };

  const tableColumns = useMemo(() => {
    const columns: any[] = [
      {
        title: "CDP ID",
        key: "cdpId",
        fixed: "left",
        width: 220,
        render: (_: any, record: User) => (
          <Link to={`/users1/${record.userId}`} className="text-blue-600 hover:text-blue-800 hover:underline font-mono">
            {record.userId || "-"}
          </Link>
        ),
      },
    ];

    selectedColumns.forEach((key) => {
      const col = allColumns.find((c) => c.key === key);
      if (!col) return;
      if (col.permission && !hasPermission(col.permission)) return;

      columns.push({
        title: col.label,
        dataIndex: key,
        key: key,
        sorter: true,
        sortOrder: sortConfig.field === key ? (sortConfig.direction === "asc" ? "ascend" : "descend") : null,
        render: (_: any, record: User) => renderCell(record, key),
      });
    });

    return columns;
  }, [selectedColumns, sortConfig, allColumns, hasPermission]);

  const handleTableChange = (newPagination: any, filters: any, sorter: any) => {
    // Handle Pagination
    if (newPagination.current !== pagination.page || newPagination.pageSize !== pagination.pageSize) {
      setPagination((prev) => ({
        ...prev,
        page: newPagination.current || 1,
        pageSize: newPagination.pageSize || 10,
      }));
    }

    // Handle Sort
    if (sorter.field) {
      const direction = sorter.order === "ascend" ? "asc" : "desc";
      if (sortConfig.field !== sorter.field || sortConfig.direction !== direction) {
        setSortConfig({
          field: sorter.field as string,
          direction,
        });
        if (sortConfig.field !== sorter.field) {
          setPagination((prev) => ({ ...prev, page: 1 }));
        }
      }
    } else if (sortConfig.field && !sorter.order) {
      setSortConfig({ field: null, direction: "asc" });
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      <div className="max-w-none">
        {/* Unified Filter Card */}
        <Card className="p-4 mb-4 bg-white shadow-sm">
          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {/* 1. Fixed CDP ID */}
            <div className="flex flex-col gap-1 w-full">
              <span className="text-xs font-medium text-gray-500">CDP ID</span>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                <Input
                  placeholder="输入 CDP ID"
                  className="pl-8 h-8 text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>

            {/* 2. Dynamic Columns */}
            {(() => {
              const ruleFieldKeys = ruleFields.map((rf) => rf.key);
              const filteredSelectedCols = selectedColumns.filter((key) => !ruleFieldKeys.includes(key));
              const visibleCols = isFilterExpanded ? filteredSelectedCols : filteredSelectedCols.slice(0, 5);
              return visibleCols.map((colKey) => renderFilterInput(colKey));
            })()}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className="text-gray-500 hover:text-gray-900"
            >
              {isFilterExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  折叠筛选
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  展开更多 (
                  {(() => {
                    const ruleFieldKeys = ruleFields.map((rf) => rf.key);
                    const filteredSelectedCols = selectedColumns.filter((key) => !ruleFieldKeys.includes(key));
                    return filteredSelectedCols.length > 5 ? filteredSelectedCols.length - 5 : 0;
                  })()}
                  )
                </>
              )}
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-1" />
                重置所有筛选
              </Button>
              <Button size="sm" onClick={handleSearch}>
                应用筛选
              </Button>

              <Sheet open={isColumnConfigOpen} onOpenChange={setIsColumnConfigOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleOpenColumnConfig} className="gap-2 ml-2">
                    <Settings className="h-4 w-4" />
                    列配置
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[800px] sm:w-[800px] sm:max-w-[800px] flex flex-col p-0 gap-0">
                  <SheetHeader className="px-6 py-4 border-b">
                    <SheetTitle>列配置</SheetTitle>
                  </SheetHeader>

                  <div className="flex-1 overflow-hidden flex flex-row bg-gray-50/50">
                    {/* Left Panel: Selected Columns (Fixed + Sortable) */}
                    <div className="flex-1 flex flex-col border-r border-gray-200">
                      {/* 1. Fixed Columns */}
                      <div className="p-4 pb-0">
                        <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">固定列</div>
                        <div className="bg-white p-3 rounded border flex items-center gap-3 opacity-75">
                          <Checkbox checked disabled />
                          <span className="text-sm font-medium">CDP ID</span>
                          <span className="text-xs text-gray-400 ml-auto">固定置顶</span>
                        </div>
                      </div>

                      {/* 2. Selected Columns (Reorderable) */}
                      <div className="p-4 flex-1 min-h-0 flex flex-col">
                        <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                          已选列 (可排序)
                        </div>
                        <ScrollArea className="flex-1 bg-white rounded border">
                          <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="selected-columns">
                              {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="p-2 space-y-1">
                                  {tempSelectedColumns.map((key, index) => {
                                    const col = allColumns.find((c) => c.key === key);
                                    if (!col) return null;
                                    return (
                                      <Draggable key={key} draggableId={key} index={index}>
                                        {(provided, snapshot) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className={cn(
                                              "flex items-center gap-3 p-2 rounded group border border-transparent",
                                              snapshot.isDragging
                                                ? "bg-white shadow-md border-gray-200 z-50"
                                                : "hover:bg-gray-50 hover:border-gray-100",
                                            )}
                                            style={provided.draggableProps.style}
                                          >
                                            <div
                                              {...provided.dragHandleProps}
                                              className="text-gray-300 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                                            >
                                              <GripVertical className="h-4 w-4" />
                                            </div>
                                            {/* Keep Up/Down buttons for accessibility/fine control */}
                                            <div className="flex flex-col gap-0.5">
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-3 w-3 text-gray-300 hover:text-gray-600"
                                                disabled={index === 0}
                                                onClick={() => handleMoveColumn(index, "up")}
                                              >
                                                <ArrowUp className="h-2 w-2" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-3 w-3 text-gray-300 hover:text-gray-600"
                                                disabled={index === tempSelectedColumns.length - 1}
                                                onClick={() => handleMoveColumn(index, "down")}
                                              >
                                                <ArrowDown className="h-2 w-2" />
                                              </Button>
                                            </div>
                                            <span className="text-sm font-medium flex-1 select-none">{col.label}</span>
                                            <span
                                              className={`text-[10px] px-1.5 py-0.5 rounded border bg-gray-100 text-gray-600 border-gray-200`}
                                            >
                                              {col.source === "profile" ? "画像" : "事件"}
                                            </span>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-6 text-gray-400 hover:text-red-500"
                                              onClick={() => handleRemoveColumn(key)}
                                            >
                                              <X className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        )}
                                      </Draggable>
                                    );
                                  })}
                                  {provided.placeholder}
                                  {tempSelectedColumns.length === 0 && (
                                    <div className="p-8 text-center text-gray-400 text-sm">暂无选定列</div>
                                  )}
                                </div>
                              )}
                            </Droppable>
                          </DragDropContext>
                        </ScrollArea>
                      </div>
                    </div>

                    {/* Right Panel: Available Columns */}
                    <div className="flex-1 flex flex-col p-4">
                      <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">可选列</div>
                      <div className="flex-1 bg-white rounded border flex flex-col overflow-hidden">
                        <div className="flex-1 flex flex-col">
                          <div className="px-3 pt-3">
                            <div className="mt-2 relative">
                              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                              <Input
                                placeholder="搜索字段..."
                                className="pl-8 h-8 text-xs"
                                value={columnSearchQuery}
                                onChange={(e) => setColumnSearchQuery(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="flex-1 overflow-hidden mt-2">
                            <Tabs defaultValue="business" className="h-full flex flex-col">
                              <div className="px-3 border-b">
                                <TabsList className="w-full justify-start h-9 bg-transparent p-0 gap-4">
                                  <TabsTrigger
                                    value="business"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 h-9 text-xs"
                                  >
                                    业务字段
                                  </TabsTrigger>
                                  <TabsTrigger
                                    value="rule"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 h-9 text-xs"
                                  >
                                    规则字段
                                  </TabsTrigger>
                                </TabsList>
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <TabsContent value="business" className="h-full m-0">
                                  <ScrollArea className="h-full">
                                    <div className="p-2 space-y-1">
                                      {getFilteredFields("profile").map((field) => {
                                        if (field.permission && !hasPermission(field.permission)) return null;
                                        const isSelected = tempSelectedColumns.includes(field.key);
                                        return (
                                          <div
                                            key={field.key}
                                            className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                                              isSelected
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                : "hover:bg-blue-50 text-gray-700"
                                            }`}
                                            onClick={() => !isSelected && handleToggleColumn(field.key)}
                                          >
                                            <span className="text-sm">{field.label}</span>
                                            {isSelected ? (
                                              <div className="flex items-center gap-1">
                                                <span className="text-[10px]">已添加</span>
                                                <Check className="h-4 w-4" />
                                              </div>
                                            ) : (
                                              <div className="h-4 w-4 rounded-full border border-gray-300" />
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </ScrollArea>
                                </TabsContent>
                                <TabsContent value="rule" className="h-full m-0">
                                  <ScrollArea className="h-full">
                                    <div className="p-2 space-y-1">
                                      {ruleFields
                                        .filter((f) => f.label.toLowerCase().includes(columnSearchQuery.toLowerCase()))
                                        .map((field) => {
                                          const isSelected = tempSelectedColumns.includes(field.key);
                                          return (
                                            <div
                                              key={field.key}
                                              className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                                                isSelected
                                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                  : "hover:bg-blue-50 text-gray-700"
                                              }`}
                                              onClick={() => !isSelected && handleToggleColumn(field.key)}
                                            >
                                              <span className="text-sm">{field.label}</span>
                                              {isSelected ? (
                                                <div className="flex items-center gap-1">
                                                  <span className="text-[10px]">已添加</span>
                                                  <Check className="h-4 w-4" />
                                                </div>
                                              ) : (
                                                <div className="h-4 w-4 rounded-full border border-gray-300" />
                                              )}
                                            </div>
                                          );
                                        })}
                                      {ruleFields.length === 0 && (
                                        <div className="p-8 text-center text-gray-400 text-sm">暂无规则字段</div>
                                      )}
                                    </div>
                                  </ScrollArea>
                                </TabsContent>
                              </div>
                            </Tabs>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <SheetFooter className="p-4 border-t bg-white">
                    <Button variant="outline" onClick={handleResetColumns} size="sm">
                      重置
                    </Button>
                    <Button onClick={handleApplyColumns} size="sm">
                      应用配置
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </Card>

        {/* User Table with Column Config */}
        <Card className="bg-white shadow-sm p-4">
          <Table
            columns={tableColumns}
            dataSource={users}
            rowKey={(record) => record.id || record.userId || record.cdpId}
            loading={loading}
            pagination={{
              current: pagination.page,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              showTotal: (total, range) =>
                t("userList.pagination.showing", {
                  start: range[0],
                  end: range[1],
                  total: total,
                }),
              position: ["bottomRight"],
            }}
            onChange={handleTableChange}
            scroll={{ x: "max-content", y: 450 }}
          />
        </Card>
      </div>
    </div>
  );
}
