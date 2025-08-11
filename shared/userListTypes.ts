/**
 * 用��画像列表数据定义
 * 定义了用户画像列表页面所需的所有数据字段类型和结构
 */

/**
 * 用户画像列表项数据结构
 */
export interface UserProfileListItem {
  /** CDP 统一ID - 全局唯一标识符 */
  cdpId: string;

  /** 用户姓名 */
  name: string;

  /** 公司名称 */
  companyName: string;

  /** 联系方式 - 通常为邮箱地址 */
  contactInfo: string;

  /** 首次访问时间 - ISO格式时间字符串 */
  firstVisitTime: string;

  /** 注册时间 - ISO格式时间字符串 */
  registrationTime: string;

  /** 首次购买时间 - ISO格式时间字符串 */
  firstPurchaseTime: string;

  /** 最后活跃时间 - ISO格式时间字符串 */
  lastActiveTime: string;

  /** 总消费金额 - 数值类型，单位为元 */
  totalSpent: number;
}

/**
 * 用户画像列表查询参数
 */
export interface UserProfileListQuery {
  /** 搜索关键词 - 支持CDP ID、姓名、公司名称、联系方式搜索 */
  searchKeyword?: string;

  /** 时间字段筛选 */
  timeField?:
    | "firstVisit"
    | "registration"
    | "firstPurchase"
    | "lastActive"
    | "all";

  /** 时间范围筛选 */
  timeRange?: "7days" | "30days" | "90days" | "180days" | "all";

  /** 分页参数 - 当前页码 */
  currentPage?: number;

  /** 分页参数 - 每页条数 */
  pageSize?: number;
}

/**
 * 用户画像列表响应数据结构
 */
export interface UserProfileListResponse {
  /** 用户列表数据 */
  users: UserProfileListItem[];

  /** 总记录数 */
  total: number;

  /** 当前页码 */
  currentPage: number;

  /** 每页条数 */
  pageSize: number;

  /** 总页数 */
  totalPages: number;
}

/**
 * 时间字段选项定义
 */
export const TIME_FIELD_OPTIONS = [
  { value: "all", label: "所有时间字段" },
  { value: "firstVisit", label: "首次访问时间" },
  { value: "registration", label: "注册时间" },
  { value: "firstPurchase", label: "首次购买时间" },
  { value: "lastActive", label: "最后活跃时间" },
] as const;

/**
 * 时间范围选项定义
 */
export const TIME_RANGE_OPTIONS = [
  { value: "all", label: "所有时间" },
  { value: "7days", label: "最近7天" },
  { value: "30days", label: "最近30天" },
  { value: "90days", label: "最近90天" },
  { value: "180days", label: "最近180天" },
] as const;

/**
 * 表格列定义
 */
export interface TableColumn {
  /** 列标识符 */
  key: keyof UserProfileListItem;

  /** 列显示名称 */
  title: string;

  /** 列宽度 */
  width?: string;

  /** 是否���排序 */
  sortable?: boolean;

  /** 数据格式化函数 */
  formatter?: (value: any, record: UserProfileListItem) => string;
}

/**
 * 用户画像列表表格列配置
 */
export const USER_PROFILE_COLUMNS: TableColumn[] = [
  {
    key: "cdpId",
    title: "用户",
    width: "200px",
    formatter: (value, record) =>
      `${record.cdpId}\n${record.name} / ${record.companyName}`,
  },
  {
    key: "contactInfo",
    title: "联系方式",
    width: "180px",
  },
  {
    key: "firstVisitTime",
    title: "首次访问",
    width: "150px",
    sortable: true,
    formatter: (value) => new Date(value).toLocaleString("zh-CN"),
  },
  {
    key: "registrationTime",
    title: "注册时间",
    width: "150px",
    sortable: true,
    formatter: (value) => new Date(value).toLocaleString("zh-CN"),
  },
  {
    key: "firstPurchaseTime",
    title: "首次购买",
    width: "150px",
    sortable: true,
    formatter: (value) => new Date(value).toLocaleString("zh-CN"),
  },
  {
    key: "lastActiveTime",
    title: "最后活跃",
    width: "150px",
    sortable: true,
    formatter: (value) => new Date(value).toLocaleString("zh-CN"),
  },
  {
    key: "totalSpent",
    title: "总消费",
    width: "120px",
    sortable: true,
    formatter: (value) =>
      new Intl.NumberFormat("zh-CN", {
        style: "currency",
        currency: "CNY",
        minimumFractionDigits: 2,
      }).format(value),
  },
];

/**
 * 排序配置
 */
export interface SortConfig {
  /** 排序字段 */
  field: keyof UserProfileListItem;

  /** 排序方向 */
  direction: "asc" | "desc";
}

/**
 * 数据验证规则
 */
export const VALIDATION_RULES = {
  /** CDP ID格式验证 - UUID格式 */
  cdpId: /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i,

  /** 邮箱格式验证 */
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  /** 手机号格式验证 */
  phone: /^1[3-9]\d{9}$/,

  /** 姓名长度限制 */
  nameLength: { min: 1, max: 50 },

  /** 公司名称长度限制 */
  companyNameLength: { min: 1, max: 100 },
} as const;

/**
 * 数据状态枚举
 */
export enum DataStatus {
  /** 加载中 */
  LOADING = "loading",

  /** 加载成功 */
  SUCCESS = "success",

  /** 加载失败 */
  ERROR = "error",

  /** 空数据 */
  EMPTY = "empty",
}

/**
 * 错误信息类型
 */
export interface ErrorInfo {
  /** 错误代码 */
  code: string;

  /** 错误消息 */
  message: string;

  /** 详细描述 */
  details?: string;
}

/**
 * API响应基础结构
 */
export interface ApiResponse<T = any> {
  /** 响��状态码 */
  code: number;

  /** 响应消息 */
  message: string;

  /** 响应数据 */
  data: T;

  /** 请求是否成功 */
  success: boolean;

  /** 时间戳 */
  timestamp: number;
}

/**
 * 工具函数类型定义
 */
export type FormatCurrencyFunction = (amount: number) => string;
export type FormatDateFunction = (date: string | Date) => string;
export type ValidateFunction<T> = (value: T) => boolean;

/**
 * 导出类型联合
 */
export type TimeFieldType = (typeof TIME_FIELD_OPTIONS)[number]["value"];
export type TimeRangeType = (typeof TIME_RANGE_OPTIONS)[number]["value"];
