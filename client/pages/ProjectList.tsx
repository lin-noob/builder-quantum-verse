import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Building, Calendar, Trash2, Edit3 } from "lucide-react";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import useProjectStore from "@/store/projectStore";

export default function ProjectList() {
  const [searchTerm, setSearchTerm] = useState("");

  // 使用store管理项目状态
  const {
    projects,
    loading,
    fetchProjects,
    createProject,
    updateProjectName,
    deleteProject,
  } = useProjectStore();

  // 初始加载项目列表
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleUpdateProject = async (project: {
    id: string;
    name: string;
    description: string;
  }) => {
    try {
      await updateProjectName(project.id, project.name);
    } catch (error) {
      console.error("更新项目失败:", error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const project = projects.find((p) => p.id === projectId);
      if (project) {
        await deleteProject(projectId, project.tenantId);
      }
    } catch (error) {
      console.error("删除项目失败:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">加载项目列表中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">项目管理</h1>
          <p className="text-gray-500">管理和查看所有项目信息</p>
        </div>
        <CreateProjectDialog />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>项目筛选</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">搜索项目</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="search"
                  placeholder="按项目名称搜索..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                  </div>
                </div>
                <div className="flex gap-1">
                  <CreateProjectDialog
                    mode="edit"
                    projectId={project.id}
                    projectName={project.name}
                    tenantId={project.tenantId}
                    totalProjects={projects.length}
                    onProjectUpdate={handleUpdateProject}
                  />
                  {/* 只有当项目数量大于1时才显示删除按钮 */}
                  {projects.length > 1 && (
                    <CreateProjectDialog
                      mode="delete"
                      projectId={project.id}
                      projectName={project.name}
                      tenantId={project.tenantId}
                      totalProjects={projects.length}
                    />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>创建于 {project.createdAt}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/projects/${project.id}`}>查看详情</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <Building className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">未找到项目</h3>
          <p className="mt-1 text-sm text-gray-500">
            没有匹配当前筛选条件的项目。
          </p>
          <div className="mt-6">
            <CreateProjectDialog />
          </div>
        </div>
      )}
    </div>
  );
}
