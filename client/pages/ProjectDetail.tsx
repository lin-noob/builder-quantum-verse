import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, Check, ArrowLeft, Building } from "lucide-react";
import { toast } from "sonner";
import { sdkService, GenerateSDKRequest } from "@/services/sdkService";
import useProjectStore from "@/stores/projectStore";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, currentProject, setCurrentProject } = useProjectStore();

  // 获取当前项目信息
  const project = projects.find((p) => p.id === id);

  // SDK 相关状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [generatedSDK, setGeneratedSDK] = useState<string>("");
  const [sdkExists, setSdkExists] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // 页面加载时检查SDK是否存在
  useEffect(() => {
    const checkSDKExists = async () => {
      try {
        const response = await sdkService.checkSDK();

        if (response.data) {
          setSdkExists(true);
          setGeneratedSDK(response.data.skdKey);
        }
      } catch (error) {
        console.error("检查SDK失败:", error);
        toast.error("检查SDK失败", {
          description: "检查SDK时发生网络错误",
        });
      } finally {
        setLoading(false);
      }
    };

    checkSDKExists();
  }, []);

  // 如果当前选中的项目和详情页不一致，更新选中项目
  useEffect(() => {
    if (project && currentProject?.id !== project.id) {
      setCurrentProject(project);
    }
  }, [project, currentProject, setCurrentProject]);

  const handleGenerateSDK = async () => {
    setIsGenerating(true);
    setGeneratedSDK(null);
    try {
      // SDK生成请求数据
      const requestData: GenerateSDKRequest = {
        skdKey: crypto.randomUUID(),
      };

      const response = await sdkService.generateSDK(requestData);

      if (response.data) {
        setGeneratedSDK(response.data.skdKey);
        setSdkExists(true);

        toast.success("SDK生成成功！", {
          description: "您的SDK已准备就绪，可以复制使用。",
        });
      } else {
        toast.error("生成失败", {
          description: "生成SDK时发生错误",
        });
      }
    } catch (error) {
      toast.error("生成失败", {
        description: "生成SDK时发生网络错误",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopySDK = () => {
    if (generatedSDK) {
      navigator.clipboard.writeText(generatedSDK);
      toast.success("SDK内容已复制到剪贴板");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast.success("已复制到剪贴板");
  };

  if (!project) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">项目未找到</h1>
          <Button onClick={() => navigate("/projects")}>返回项目列表</Button>
        </div>
      </div>
    );
  }

  const npmInstallCommand = "npm install xd-post";
  const umdScriptTag =
    '<script src="https://cdn.jsdelivr.net/npm/xd-post@latest/dist/xd-post.umd.js"></script>';
  const iifeScriptTag =
    '<script src="https://cdn.jsdelivr.net/npm/xd-post@latest/dist/xd-post.iife.js"></script>';

  return (
    <div className="container mx-auto py-8">
      {/* 项目头部信息 */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/projects")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回项目列表
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Building className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground mt-1">
              项目ID: {project.id} | 创建于: {project.createdAt}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="sdk" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sdk">开发者工具</TabsTrigger>
          <TabsTrigger value="settings">项目设置</TabsTrigger>
        </TabsList>

        <TabsContent value="sdk" className="space-y-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">开发者工具</h2>
            <p className="text-muted-foreground">
              生成并集成xd-post SDK到您的项目中
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>生成SDK</CardTitle>
                <CardDescription>
                  {sdkExists
                    ? "您的SDK已生成"
                    : "点击按钮生成适用于您项目的SDK"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  {!sdkExists && (
                    <Button
                      onClick={handleGenerateSDK}
                      disabled={isGenerating || loading}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          生成中...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          生成SDK
                        </>
                      )}
                    </Button>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {sdkExists
                      ? "您已生成SDK，可直接使用下方的集成说明"
                      : "生成的SDK将包含xd-post的所有功能和配置"}
                  </p>

                  {loading && (
                    <div className="flex justify-center items-center p-4">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      <span className="ml-2">检查SDK状态中...</span>
                    </div>
                  )}

                  {generatedSDK && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-green-800">
                          SDK生成成功
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopySDK}
                          className="text-green-700 border-green-300"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          复制SDK密钥
                        </Button>
                      </div>
                      <div className="bg-white p-3 rounded border font-mono text-sm text-green-900">
                        {generatedSDK}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>集成说明</CardTitle>
                <CardDescription>选择适合您项目的集成方式</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="npm">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="npm">NPM</TabsTrigger>
                    <TabsTrigger value="umd">UMD</TabsTrigger>
                    <TabsTrigger value="iife">IIFE</TabsTrigger>
                  </TabsList>
                  <TabsContent value="npm" className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">1. 安装包</h4>
                      <div className="bg-gray-100 p-3 rounded-md font-mono text-sm relative">
                        <code>{npmInstallCommand}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => copyToClipboard(npmInstallCommand)}
                        >
                          {isCopied ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">2. 导入使用</h4>
                      <div className="bg-gray-100 p-3 rounded-md font-mono text-sm">
                        <code>import XDPost from 'xd-post';</code>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="umd" className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">UMD 格式引入</h4>
                      <div className="bg-gray-100 p-3 rounded-md font-mono text-sm relative">
                        <code>{umdScriptTag}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => copyToClipboard(umdScriptTag)}
                        >
                          {isCopied ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="iife" className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">IIFE 格式引入</h4>
                      <div className="bg-gray-100 p-3 rounded-md font-mono text-sm relative">
                        <code>{iifeScriptTag}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => copyToClipboard(iifeScriptTag)}
                        >
                          {isCopied ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>使用示例</CardTitle>
              <CardDescription>快速开始使用xd-post SDK</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">基础使用</h4>
                  <div className="bg-muted p-4 rounded-md font-mono text-sm relative">
                  <pre className="bg-muted rounded-md p-4 text-sm overflow-x-auto">
                        <code>{`xdpost.enableAutoTracker({
  sdk: ${generatedSDK ? `'${generatedSDK}'` : "'Your SKD'"},
  endpoint: '/quote/api/v1/events/behavior',
  autoDetectSource: true,
  sseUrl: '/quote/api/v1/events/sse',
  preferUTM: true,
  pageDwellTime: {
    enabled: true, 
    interval: 10000,
  },
});`}</code>
        <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={() =>
                          copyToClipboard(`
                          xdpost.enableAutoTracker({
                            sdk: ${generatedSDK ? `'${generatedSDK}'` : "'Your SKD'"},
                            endpoint: '/quote/api/v1/events/behavior',
                            autoDetectSource: true,
                            sseUrl: '/quote/api/v1/events/sse',
                            preferUTM: true,
                            pageDwellTime: {
                              enabled: true, 
                              interval: 10000,
                            },
                          });
                          `)
                        }
                      >
                        {isCopied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      </pre>
                  </div>
                </div>
                {/* <div>
                  <h4 className="font-medium mb-2">高级配置</h4>
                  <div className="bg-gray-100 p-4 rounded-md font-mono text-sm">
                    <pre>{`// 高级配置
const xdPost = new XDPost({
  apiKey: '${generatedSDK || "YOUR_API_KEY"}',
  baseURL: 'https://your-api-endpoint.com',
  retryTimes: 3,
  timeout: 5000,
  enableDebug: true
});`}</pre>
                  </div>
                </div> */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>项目设置</CardTitle>
              <CardDescription>管理项目的基本设置和配置</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">项目名称</label>
                  <div className="mt-1 p-2 bg-gray-100 rounded-md">
                    {project.name}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">项目ID</label>
                  <div className="mt-1 p-2 bg-gray-100 rounded-md font-mono">
                    {project.id}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">租户ID</label>
                  <div className="mt-1 p-2 bg-gray-100 rounded-md font-mono">
                    {project.tenantId}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">创建时间</label>
                  <div className="mt-1 p-2 bg-gray-100 rounded-md">
                    {project.createdAt}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>SDK功能</CardTitle>
          <CardDescription>xd-post SDK提供了以下核心功能</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-primary/10 p-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
              </div>
              <div>
                <h4 className="font-medium">自动追踪</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  自动收集用户行为数据，无需手动埋点
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-primary/10 p-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
              </div>
              <div>
                <h4 className="font-medium">事件分析</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  实时分析用户事件，洞察用户行为模式
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-primary/10 p-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
              </div>
              <div>
                <h4 className="font-medium">性能监控</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  监控页面加载性能和用户交互体验
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-primary/10 p-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
              </div>
              <div>
                <h4 className="font-medium">数据上报</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  灵活配置数据上报策略，支持批量发送
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-primary/10 p-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
              </div>
              <div>
                <h4 className="font-medium">用户识别</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  准确识别用户身份，关联用户行为数据
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-primary/10 p-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
              </div>
              <div>
                <h4 className="font-medium">自定义属性</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  支持自定义事件和用户属性，满足业务需求
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
