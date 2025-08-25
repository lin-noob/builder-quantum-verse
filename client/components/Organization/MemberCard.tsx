import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import {
  User,
  MoreHorizontal,
  Edit,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Shield,
} from "lucide-react";
import { Member, MemberRole, AccountStatus } from "../../../shared/organizationData";

interface MemberCardProps {
  member: Member;
  onEdit?: (member: Member) => void;
  onToggleStatus?: (member: Member) => void;
  onViewDetails?: (member: Member) => void;
  showActions?: boolean;
  compact?: boolean;
}

const MemberCard = ({
  member,
  onEdit,
  onToggleStatus,
  onViewDetails,
  showActions = true,
  compact = false,
}: MemberCardProps) => {
  const getRoleBadge = (role: MemberRole) => {
    if (role === MemberRole.ADMIN) {
      return (
        <Badge variant="default" className="bg-blue-100 text-blue-800">
          <Shield className="h-3 w-3 mr-1" />
          管理员
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline">
          <User className="h-3 w-3 mr-1" />
          成员
        </Badge>
      );
    }
  };

  const getStatusBadge = (status: AccountStatus) => {
    if (status === AccountStatus.ACTIVE) {
      return <Badge variant="default" className="bg-green-100 text-green-800">活跃</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-red-100 text-red-800">已禁用</Badge>;
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "从未登录";
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            {member.avatar ? (
              <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full" />
            ) : (
              <User className="h-5 w-5 text-gray-400" />
            )}
          </div>
          <div>
            <div className="font-medium">{member.name}</div>
            <div className="text-sm text-gray-500">{member.email}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getRoleBadge(member.role)}
          {getStatusBadge(member.accountStatus)}
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(member)}>
                    <Edit className="mr-2 h-4 w-4" />
                    编辑信息
                  </DropdownMenuItem>
                )}
                {onToggleStatus && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onToggleStatus(member)}>
                      {member.accountStatus === AccountStatus.ACTIVE ? (
                        <>
                          <UserX className="mr-2 h-4 w-4" />
                          禁用账户
                        </>
                      ) : (
                        <>
                          <UserCheck className="mr-2 h-4 w-4" />
                          启用账户
                        </>
                      )}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full" />
              ) : (
                <User className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{member.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                {getRoleBadge(member.role)}
                {getStatusBadge(member.accountStatus)}
              </div>
            </div>
          </div>
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onViewDetails && (
                  <DropdownMenuItem onClick={() => onViewDetails(member)}>
                    <User className="mr-2 h-4 w-4" />
                    查看详情
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(member)}>
                    <Edit className="mr-2 h-4 w-4" />
                    编辑信息
                  </DropdownMenuItem>
                )}
                {onToggleStatus && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onToggleStatus(member)}>
                      {member.accountStatus === AccountStatus.ACTIVE ? (
                        <>
                          <UserX className="mr-2 h-4 w-4" />
                          禁用账户
                        </>
                      ) : (
                        <>
                          <UserCheck className="mr-2 h-4 w-4" />
                          启用账户
                        </>
                      )}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="h-4 w-4" />
            <span>{member.email}</span>
          </div>
          
          {member.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <span>{member.phone}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>最后登录: {formatDate(member.lastLoginAt)}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t text-xs text-gray-500">
          <div>创建时间: {formatDate(member.createdAt)}</div>
          {member.updatedAt && (
            <div>更新时间: {formatDate(member.updatedAt)}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MemberCard;
