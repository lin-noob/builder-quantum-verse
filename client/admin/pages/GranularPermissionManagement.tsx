import React from "react";
import GranularPermissionManagement from "@/components/GranularPermissionManagement";

export default function AdminGranularPermissionManagement() {
  return (
    <GranularPermissionManagement 
      title="系统权限管理"
      description="为整个系统配置精细化的功能权限和字段级权限"
    />
  );
}