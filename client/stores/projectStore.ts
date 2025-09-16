import { create } from "zustand";
import { persist } from "zustand/middleware";
import { request } from "@/lib/request";

interface Project {
  id: string;
  name: string;
  tenantId: string;
  createdAt: string;
}

interface ProjectStore {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  setLoading: (loading: boolean) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updatedProject: Partial<Project>) => void;
  removeProject: (id: string) => void;
  // 新增：数据获取方法
  fetchProjects: () => Promise<void>;
  createProject: (name: string) => Promise<void>;
  deleteProject: (id: string, tenantId: string) => Promise<void>;
  updateProjectName: (id: string, name: string) => Promise<void>;
  deleteProjectByAdmin: (id: string, name: string) => Promise<void>;
}

const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      loading: false,

      setProjects: (projects) => set({ projects }),

      setCurrentProject: (project) => set({ currentProject: project }),

      setLoading: (loading) => set({ loading }),

      addProject: (project) =>
        set((state) => ({
          projects: [project, ...state.projects],
        })),

      updateProject: (id, updatedProject) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updatedProject } : p,
          ),
          currentProject:
            state.currentProject?.id === id
              ? { ...state.currentProject, ...updatedProject }
              : state.currentProject,
        })),

      removeProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          currentProject:
            state.currentProject?.id === id
              ? state.projects.find((p) => p.id !== id) || null
              : state.currentProject,
        })),

      // 从API获取项目列表
      fetchProjects: async () => {
        const { setLoading, setProjects, setCurrentProject, currentProject } =
          get();

        try {
          setLoading(true);
          const response = await request.get("/quote/api/v1/project/list");
          const projectData = response.data.data || [];

          // 将API返回的数据映射到项目列表格式
          const mappedProjects: Project[] = projectData.map((item: any) => ({
            id: item.id?.toString() || "",
            name: item.projectName || "未命名项目",
            createdAt: item.gmtCreate,
            tenantId: item.tenantId,
          }));

          setProjects(mappedProjects);

          // 如果有项目且没有选中的项目，或者选中的项目不在列表中，选中第一个
          if (mappedProjects.length > 0) {
            if (!currentProject) {
              setCurrentProject(mappedProjects[0]);
            } else {
              // 如果当前选中的项目在列表中，更新为最新的项目信息
              const updatedCurrentProject = mappedProjects.find(
                (p) => p.id === currentProject.id,
              );
              if (updatedCurrentProject) {
                setCurrentProject(updatedCurrentProject);
              } else {
                // 如果选中的项目不在列表中，选中第一个
                setCurrentProject(mappedProjects[0]);
              }
            }
          } else {
            setCurrentProject(null);
          }

          return Promise.resolve();
        } catch (error) {
          console.error("获取项目列表失败:", error);
          return Promise.reject(error);
        } finally {
          setLoading(false);
        }
      },

      // 创建项目
      createProject: async (name: string) => {
        const { setLoading, fetchProjects } = get();
        try {
          setLoading(true);
          await request.post("/quote/api/v1/project", {
            projectName: name.trim(),
          });

          // 创建成功后重新获取项目列表
          await fetchProjects();
          return Promise.resolve();
        } catch (error) {
          console.error("创建项目失败:", error);
          return Promise.reject(error);
        } finally {
          setLoading(false);
        }
      },

      // 删除项目
      deleteProject: async (id: string, tenantId: string) => {
        const { setLoading, fetchProjects } = get();

        try {
          setLoading(true);
          await request.delete("/quote/api/v1/project", {
            data: {
              id,
              tenantId,
            },
          });

          // 删除成功后重新获取项目列表
          await fetchProjects();
          return Promise.resolve();
        } catch (error) {
          console.error("删除项目失败:", error);
          return Promise.reject(error);
        } finally {
          setLoading(false);
        }
      },

      deleteProjectByAdmin: async (id: string, tenantId: string) => {
        const { setLoading, fetchProjects } = get();

        try {
          setLoading(true);
          await request.delete("/admin/api/v1/company/delete/project", {
            data: {
              id,
              tenantId,
            },
          });

          // 删除成功后重新获取项目列表
          await fetchProjects();
          return Promise.resolve();
        } catch (error) {
          console.error("删除项目失败:", error);
          return Promise.reject(error);
        } finally {
          setLoading(false);
        }
      },

      // 更新项目名称
      updateProjectName: async (id: string, name: string) => {
        const { setLoading, fetchProjects } = get();

        try {
          setLoading(true);
          await request.post("/quote/api/v1/project", {
            id,
            projectName: name.trim(),
          });

          // 更新成功后重新获取项目列表
          await fetchProjects();
          return Promise.resolve();
        } catch (error) {
          console.error("更新项目失败:", error);
          return Promise.reject(error);
        } finally {
          setLoading(false);
        }
      },
    }),
    {
      name: "project-storage",
      partialize: (state) => ({
        currentProject: state.currentProject,
      }),
    },
  ),
);

export default useProjectStore;
