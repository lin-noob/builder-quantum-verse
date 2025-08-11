/**
 * 用户画像相关类型定义
 */

/**
 * 用户画像数据接口
 */
export interface UserProfile {
  /** ID */
  id: string;
  /** CDP 用户ID（唯一） */
  cdpUserId: number;
  /** 用户姓名 */
  fullName: string;
  /** 联系方式（Email/手机号） */
  contactInfo: string;
  /** 公司名称 */
  companyName: string;
  /** 注册时间 */
  signTime: string;
  /** 创建时间 */
  createGmt: string;
  /** 首次购买时间 */
  minBuyTime: string;
  /** 最后购买时间 */
  maxBuyTime: string;
  /** 最大订单金额（保留5位小数） */
  maxOrderAmount: number;
  /** 总消费金额（保留5位小数） */
  totalOrders: number;
  /** 订单数量 */
  orderCount: number;
  /** 最后登录时间 */
  loginDate: string;
  /** 地区 */
  location: string;
  /** tenant_id */
  shopid: string;
}

/**
 * 订单汇总请求参数
 */
export interface OrderSummaryDto {
  /** 当前页 */
  currentpage?: number;
  /** 结束日期 */
  endDate?: string;
  /** 搜索关键词 */
  keywords?: string;
  /** 排序类型(desc降序，asc升序) */
  order?: 'desc' | 'asc';
  /** 每页记录数 */
  pagesize?: number;
  /** 追加参数 */
  paramother?: Record<string, string>;
  /** 日期搜索类型 */
  searchtype?: 'signTime' | 'minBuyTime' | 'maxBuyTime' | 'createGmt';
  /** 店铺ID */
  shopid?: string;
  /** 排序字段 */
  sort?: string;
  /** 开始日期 */
  startDate?: string;
}

/**
 * 用户画像列表查询参数
 */
export interface UserProfileListParams {
  /** 每页数量 */
  limit?: number;
  /** 用户名 */
  name?: string;
  /** 页码 */
  page?: number;
  /** 请求体参数 */
  body?: OrderSummaryDto;
}

/**
 * 用户画像列表响应数据
 */
export interface UserProfileListData {
  /** 用户列表 */
  list: UserProfile[];
  /** 分页信息 */
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 搜索表单数据
 */
export interface UserProfileSearchForm {
  /** 关键词搜索 */
  keywords?: string;
  /** 日期范围 */
  dateRange?: [string, string];
  /** 日期搜索类型 */
  searchtype?: 'signTime' | 'minBuyTime' | 'maxBuyTime' | 'createGmt';
  /** 排序���段 */
  sortField?: string;
  /** 排序方向 */
  sortOrder?: 'desc' | 'asc';
}

/**
 * 表格列配置
 */
export interface TableColumn {
  key: string;
  title: string;
  dataIndex: keyof UserProfile;
  width?: number;
  sortable?: boolean;
  render?: (value: any, record: UserProfile) => React.ReactNode;
}
