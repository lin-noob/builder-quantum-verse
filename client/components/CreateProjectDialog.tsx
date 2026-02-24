import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, Edit3 } from "lucide-react";
import useProjectStore from "@/stores/projectStore";

interface CreateProjectDialogProps {
  onProjectCreate?: (project: { name: string }) => void;
  onProjectUpdate?: (project: {
    id: string;
    name: string;
    description: string;
  }) => void;
  onProjectDelete?: (projectId: string) => void;
  projectId?: string;
  projectName?: string;
  tenantId?: string;
  mode?: "create" | "delete" | "edit";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  closable?: boolean;
  totalProjects?: number;
  isAdmin?: boolean;
}

export function CreateProjectDialog({
  onProjectCreate,
  onProjectUpdate,
  onProjectDelete,
  projectId,
  projectName,
  tenantId,
  mode = "create",
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  closable = true,
  totalProjects = 0,
  isAdmin = false,
}: CreateProjectDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [name, setName] = useState(projectName || "");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // 使用受控或内部状态
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = controlledOnOpenChange || setInternalOpen;

  // 使用store中的方法
  const {
    createProject,
    updateProjectName,
    deleteProject: storeDeleteProject,
    deleteProjectByAdmin,
  } = useProjectStore();

  // 当projectId或projectName变化时，更新表单字段
  useEffect(() => {
    if (mode === "edit") {
      setName(projectName || "");
    }
  }, [projectId, projectName, mode]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      try {
        setLoading(true);
        await createProject(name.trim());

        // 创建成功后回调
        onProjectCreate?.({ name: name.trim() });
        setName("");
        setDescription("");
        setIsOpen(false);
      } catch (error) {
        console.error("创建项目失败:", error);
        // 这里可以添加错误提示
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && projectId) {
      try {
        setLoading(true);
        await updateProjectName(projectId, name.trim());

        // 更新成功后回调
        if (onProjectUpdate) {
          onProjectUpdate({
            id: projectId,
            name: name.trim(),
            description: description.trim(),
          });
        }
        setIsOpen(false);
      } catch (error) {
        console.error("更新项目失败:", error);
        // 这里可以添加错误提示
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async () => {
    if (!projectId || !tenantId) return;

    try {
      setLoading(true);

      if (!isAdmin) {
        await storeDeleteProject(projectId, tenantId);
      } else {
        await deleteProjectByAdmin(projectId, tenantId);
      }

      // 删除成功后回调
      onProjectDelete(projectId);
      setIsOpen(false);
    } catch (error) {
      console.error("删除项目失败:", error);
      // 这里可以添加错误提示
    } finally {
      setLoading(false);
    }
  };

  if (mode === "delete") {
    // 如果只剩一个项目，显示提示信息而不允许删除
    const isLastProject = totalProjects <= 1;

    return (
      <Dialog open={isOpen} onOpenChange={closable ? setIsOpen : undefined}>
        <DialogTrigger asChild>
          <Button
            variant="destructive"
            size="sm"
            disabled={isLastProject}
            title={isLastProject ? "不能删除最后一个项目" : "删除项目"}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-[425px]"
          onPointerDownOutside={
            closable ? undefined : (e) => e.preventDefault()
          }
          onEscapeKeyDown={closable ? undefined : (e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {isLastProject ? "无法删除项目" : "删除项目"}
            </DialogTitle>
            <DialogDescription>
              {isLastProject
                ? `"${projectName}" 是最后一个项目，不能删除。每个组织至少需要保留一个项目。`
                : `确定要删除项目 "${projectName}" 吗？此操作不可撤销。`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500">
              {isLastProject
                ? "如需创建新项目，请使用'创建新项目'功能。"
                : "删除项目将永久移除该项目的所有数据。请谨慎操作。"}
            </p>
          </div>
          <DialogFooter>
            {isLastProject ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                我知道了
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => closable && setIsOpen(false)}
                  disabled={loading}
                >
                  取消
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? "删除中..." : "确认删除"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (mode === "edit") {
    return (
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (closable) {
            setIsOpen(open);
            // 当对话框关闭时，重置表单
            if (!open) {
              setName(projectName || "");
              setDescription("");
            }
          }
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Edit3 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-[425px]"
          onPointerDownOutside={
            closable ? undefined : (e) => e.preventDefault()
          }
          onEscapeKeyDown={closable ? undefined : (e) => e.preventDefault()}
        >
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle>编辑项目</DialogTitle>
              <DialogDescription>修改项目名称</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  项目名称
                </Label>
                <div className="col-span-3">
                  <Input
                    id="edit-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="输入项目名称"
                    className="w-full"
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => closable && setIsOpen(false)}
                disabled={loading}
              >
                取消
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "保存中..." : "保存更改"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={closable ? setIsOpen : undefined}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            创建新项目
          </Button>
        </DialogTrigger>
      )}
      <DialogContent
        className="sm:max-w-[425px]"
        onPointerDownOutside={closable ? undefined : (e) => e.preventDefault()}
        onEscapeKeyDown={closable ? undefined : (e) => e.preventDefault()}
        onInteractOutside={closable ? undefined : (e) => e.preventDefault()}
        {...(!closable && { showCloseButton: false })}
      >
        <form onSubmit={handleCreate}>
          <DialogHeader>
            <DialogTitle>创建新项目</DialogTitle>
            <DialogDescription>
              {!closable
                ? "您无法访问该组织中的任何项目。您可以创建一个新项目以供访问。"
                : "输入项目名称来创建新项目"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                项目名称
              </Label>
              <div className="col-span-3">
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="输入项目名称"
                  className="w-full"
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            {closable && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={loading}
              >
                取消
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? "创建中..." : "创建项目"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
