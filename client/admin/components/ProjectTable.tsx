import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Calendar, DeleteIcon, ExternalLink } from "lucide-react";
import { request } from "@/lib/request";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";

interface Project {
  id: string;
  projectName: string;
  tenantId: string;
  gmtCreate: string;
}

interface ProjectTableProps {
  organizationId?: string;
  title?: string;
}

export const ProjectTable: React.FC<ProjectTableProps> = ({
  organizationId,
  title = "项目管理",
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (organizationId) {
      loadProjects();
    }
  }, [organizationId]);

  const loadProjects = async () => {
    if (!organizationId) return;

    try {
      setLoading(true);
      const response = await request.get(
        `/admin/api/v1/company/view/project/${organizationId}`,
      );

      const json = response.data;

      if (json.data && Array.isArray(json.data)) {
        setProjects(json.data);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {title}
          </CardTitle>
          <div className="text-sm text-gray-500">
            共 {projects.length} 个项目
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>项目信息</TableHead>
                <TableHead>项目ID</TableHead>
                <TableHead>租户ID</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="animate-pulse">加载中...</div>
                  </TableCell>
                </TableRow>
              ) : projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="text-gray-500 space-y-2">
                      <Building className="h-8 w-8 mx-auto text-gray-400" />
                      <div>暂无项目数据</div>
                      <div className="text-sm">该组织还没有创建任何项目</div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {project.projectName}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm">{project.id}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm">
                        {project.tenantId}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {project.gmtCreate}
                      </div>
                    </TableCell>
                    <TableCell>
                      {/* <Button
                        size="sm"
                        color="crimson"
                        variant="destructive"
                        onClick={() => {
                          // 可以添加查看项目详情的逻辑
                          console.log("查看项目详情:", project.id);
                        }}
                      >
                        删除
                      </Button> */}
                      <CreateProjectDialog
                        isAdmin={true}
                        mode="delete"
                        projectId={project.id}
                        projectName={project.projectName}
                        tenantId={project.tenantId}
                        totalProjects={10}
                        onProjectDelete={loadProjects}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {projects.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-gray-500">
              显示 {projects.length} 个项目
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadProjects}
              disabled={loading}
            >
              刷新数据
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
