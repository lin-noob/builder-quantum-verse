import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { fetchUsers, type UserListItem } from "@shared/userProfileData";

export default function UserList2() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const userData = await fetchUsers();
        setUsers(userData);
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === "" ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSegment = segmentFilter === "all" || user.segment === segmentFilter;
    const matchesTag = tagFilter === "all" || user.tags.includes(tagFilter);

    return matchesSearch && matchesSegment && matchesTag;
  });

  const handleRowClick = (userId: string) => {
    navigate(`/users2/${userId}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Get unique segments and tags for filters
  const uniqueSegments = Array.from(new Set(users.map(user => user.segment)));
  const uniqueTags = Array.from(new Set(users.flatMap(user => user.tags)));

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-background min-h-full">
        <div className="animate-pulse">
          <div className="h-8 bg-secondary rounded mb-4 w-1/4"></div>
          <div className="h-4 bg-secondary rounded mb-6 w-1/2"></div>
          <div className="h-32 bg-secondary rounded mb-6"></div>
          <div className="h-64 bg-secondary rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-full">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">用户列表 2.0</h1>
        <p className="text-sm text-muted-foreground mt-1">
          高效浏览、筛选和检索，快速找到目标用户群体。
        </p>
      </div>

      {/* Filter Section */}
      <Card className="p-6 bg-secondary rounded-lg">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="搜索用户名或ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Segment Filter */}
          <div className="md:w-1/4">
            <Select value={segmentFilter} onValueChange={setSegmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="用户分层" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有分层</SelectItem>
                {uniqueSegments.map(segment => (
                  <SelectItem key={segment} value={segment}>{segment}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tag Filter */}
          <div className="md:w-1/4">
            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger>
                <SelectValue placeholder="标签" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有标签</SelectItem>
                {uniqueTags.map(tag => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Data Table */}
      <Card className="bg-background rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">用户信息</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">用户分层</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">标签</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">总消费</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">总订单数</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">最后购买</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr 
                  key={user.id} 
                  className="hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(user.id)}
                >
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="font-medium text-foreground">{user.name}</div>
                      <div className="text-sm text-muted-foreground">ID: {user.id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {user.segment}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.tags.length > 0 ? (
                        user.tags.slice(0, 2).map((tag, index) => (
                          <div
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-primary/10 text-primary"
                          >
                            {tag}
                          </div>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                      {user.tags.length > 2 && (
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
                          +{user.tags.length - 2}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-foreground">
                    {formatCurrency(user.totalSpend)}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {user.totalOrders}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {user.lastPurchase}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">没有找到符合条件的用户</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
