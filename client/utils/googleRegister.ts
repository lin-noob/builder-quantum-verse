import { request } from "@/lib/request";

export const CLIENT_ID =
  "257005751956-8okfnqm5lldjbmm5n7qh5fu9o1no3055.apps.googleusercontent.com";
/**
 * 谷歌注册函数
 * @param params - 注册参数
 * @returns 注册结果
 */
export const onGoogleRegister = async (params: any) => {
  try {
  } catch (error) {
    console.error("谷歌注册失败:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "未知错误",
      error: error,
    };
  }
};

/**
 * 处理谷歌注册回调
 * @param token - 谷歌认证令牌
 * @returns 注册结果
 */
export const handleGoogleRegisterCallback = async (token: string) => {};

export const getGoogleInfo = async (token: string) => {
  const data = request.get("/api/admin/api/v1/auth/google/callback", { token });
  return data;
};
