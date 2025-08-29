import { Badge } from "@/components/ui/badge";
import { useRoleStore } from "@/stores";

export const RoleBadge = ({ roleId }) => {
  const { roles } = useRoleStore();
  const role = roles.find((r) => r.id === roleId);
  if (!role) return <Badge variant="outline">未知角色</Badge>;

  return (
    <Badge variant="default" className="bg-blue-100 text-blue-800">
      {role.name}
    </Badge>
  );
};

export const StatusBadge = ({ status }) => {
  if (status === 0) {
    return (
      <Badge variant="default" className="bg-green-100 text-green-800">
        活跃
      </Badge>
    );
  } else {
    return (
      <Badge variant="secondary" className="bg-red-100 text-red-800">
        已禁用
      </Badge>
    );
  }
};
