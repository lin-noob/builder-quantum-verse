import { request } from "@/lib/request";
import {
  Member,
  MemberRole,
  AccountStatus,
} from "../../shared/organizationData";

// API response interface for /admin/api/v1/users/info
interface UserInfoResponse {
  code: string;
  data: {
    name: string;
    usertype: string;
    company: string | null;
    id: string;
    user: {
      userinfo: {
        name: string;
        id: string;
        email: string;
      };
      id: string;
      account: string;
      leaderId: string;
      createDate: number;
      losingeffect: number;
      logicDelete: boolean;
      disable: boolean;
      member: number;
      lastlogintime: number;
      lastloginip: string;
      lastloginsession: string | null;
      ftype: string;
      isActive: boolean;
      hasEmail: boolean;
      deptid: string | null;
      opttime: number;
      gadSource: string | null;
      mtmCampaign: string | null;
      shopid: string;
      contextmap: Record<string, any>;
    };
    email: string;
  };
  msg: string;
}

// Map API response to Member interface
function mapApiResponseToMember(response: UserInfoResponse): Member {
  const { data } = response;
  const { user } = data;

  return {
    account: user.account,
    id: user.id,
    organizationId: user.shopid || "org_default",
    email: data.user.account,
    name: data.name || user.userinfo.name,
    role:
      data.usertype === "manager" || data.usertype === "admin"
        ? MemberRole.ADMIN
        : MemberRole.MEMBER,
    accountStatus: user.disable ? AccountStatus.DISABLED : AccountStatus.ACTIVE,
    createdAt: new Date(user.createDate).toISOString(),
    updatedAt: new Date(user.opttime).toISOString(),
    lastLoginAt: user.lastlogintime
      ? new Date(user.lastlogintime).toISOString()
      : undefined,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.id}`,
    phone: "",
  };
}

// Fetch current user info
export async function getCurrentUserInfo(): Promise<Member | null> {
  try {
    const response = await request.get<UserInfoResponse>(
      "/admin/api/v1/users/info",
    );

    if (response.data && response.data.code === "201") {
      return mapApiResponseToMember(response.data);
    }

    return null;
  } catch (error) {
    console.error("Failed to fetch user info:", error);
    return null;
  }
}
