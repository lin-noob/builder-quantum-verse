import { request } from "@/lib/request";
import { Member } from "../../../shared/organizationData";

/**
 * 成员列表响应数据结构
 */
interface MemberListResponse {
  records: MemberRecord[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

/**
 * 成员记录数据结构（API返回格式）
 */
interface MemberRecord {
  id: string;
  account: string;
  name: string;
  roleId: string;
  status: number;
  createDate: number;
  losingEffect?: number;
  lastlogintime?: number;
  image?: string;
  phone?: string;
  deptname?: string | null;
  groups?: null;
  perms?: null;
  statusName?: string;
}

/**
 * 将API返回的成员记录转换为前端使用的成员对象
 */
const transformMemberRecord = (record: MemberRecord): Member => {
  return {
    id: record.id,
    account: record.account,
    name: record.name,
    roleId: record.roleId,
    status: record.status,
    createDate: record.createDate.toString(),
    losingEffect: record.losingEffect?.toString(),
    lastlogintime: record.lastlogintime?.toString(),
    avatar: record.image,
    phone: record.phone,
    memberId: record.id,
    organizationId: "",
    email: record.account,
    role: record.roleId === "26138972975989607" ? "ADMIN" : "MEMBER",
    accountStatus: record.status === 0 ? 1 : 2,
    createdAt: record.createDate.toString(),
    updatedAt: record.createDate.toString(),
    lastLoginAt: record.lastlogintime?.toString(),
  };
};

/**
 * 获取成员列表
 */
export const getMemberList = async (
  companyId: string,
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<{
  data: Member[];
  total: number;
  totalPages: number;
}> => {
  try {
    const payload = {
      shopid:companyId,
      current: page,
      size: limit,
      ...(search && { name: search }),
    };

    const response = await request.post("/admin/api/v1/company/user/list", payload);
    const res = response.data;

    if (res.code !== "201") {
      throw new Error(res.msg || "获取成员列表失败");
    }

    // 转换数据格式
    const memberList = res.data.records.map(transformMemberRecord);

    return {
      data: memberList,
      total: res.data.total,
      totalPages: res.data.pages,
    };
  } catch (error) {
    console.error("获取成员列表失败:", error);
    throw error;
  }
};