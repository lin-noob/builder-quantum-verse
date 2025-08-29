import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, Check } from "lucide-react";
import { toast } from "sonner";
import { sdkService, GenerateSDKRequest } from "@/services/sdkService";

export default function SDK() {
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

  const npmInstallCommand = "npm install xd-post";
  const umdScriptTag =
    '<script src="https://cdn.jsdelivr.net/npm/xd-post@latest/dist/xd-post.umd.js"></script>';
  const iifeScriptTag =
    '<script src="https://cdn.jsdelivr.net/npm/xd-post@latest/dist/xd-post.iife.js"></script>';

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">开发者工具</h1>
        <p className="text-muted-foreground mt-2">
          生成并集成xd-post SDK到您的项目中
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>生成SDK</CardTitle>
            <CardDescription>
              {sdkExists ? "您的SDK已生成" : "点击按钮生成适用于您项目的SDK"}
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
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-green-800">SDK已生成!</p>
                      <p className="text-sm text-green-700 mt-1">
                        您可以复制下方的SDK密钥用于项目集成
                      </p>
                    </div>
                    <Button onClick={handleCopySDK} variant="default" size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      复制SDK
                    </Button>
                  </div>
                  <div className="mt-3">
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto max-h-32">
                      <code>{generatedSDK}</code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>集成说明</CardTitle>
            <CardDescription>
              将xd-post SDK集成到您的项目中的方法
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="npm">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="npm">NPM</TabsTrigger>
                <TabsTrigger value="umd">UMD</TabsTrigger>
                <TabsTrigger value="iife">IIFE</TabsTrigger>
              </TabsList>

              <TabsContent value="npm" className="mt-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium">1. 安装</h3>
                    <div className="relative mt-2">
                      <pre className="bg-muted rounded-md p-4 text-sm overflow-x-auto">
                        <code>{npmInstallCommand}</code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={() => copyToClipboard(npmInstallCommand)}
                      >
                        {isCopied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium">2. 引入规则</h3>
                    <div className="relative mt-2">
                      <pre className="bg-muted rounded-md p-4 text-sm overflow-x-auto">
                        <code>{`xdpost.enableAutoTracker({
  sdk: ${generatedSDK ? `'${generatedSDK}'` : "Your SKD"},
  endpoint: '/quote/api/v1/events/behavior',
  autoDetectSource: true,
  sseUrl: '/quote/api/v1/events/sse',
  preferUTM: true,
  pageDwellTime: {
    enabled: true, 
    interval: 10000,
  },
});`}</code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={() =>
                          copyToClipboard(`
                          xdpost.enableAutoTracker({
                            sdk: ${generatedSDK ? `'${generatedSDK}'` : "Your SKD"},
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
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="umd" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">1. 引入脚本</h3>
                    <div className="relative mt-2">
                      <pre className="bg-muted rounded-md p-4 text-sm overflow-x-auto">
                        <code>{umdScriptTag}</code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={() => copyToClipboard(umdScriptTag)}
                      >
                        {isCopied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium">2. 使用全局变量</h3>
                    <div className="relative mt-2">
                      <pre className="bg-muted rounded-md p-4 text-sm overflow-x-auto">
                        <code>{`xdpost.enableAutoTracker({
  sdk: ${generatedSDK ? `'${generatedSDK}'` : "Your SKD"},
  endpoint: '/quote/api/v1/events/behavior',
  autoDetectSource: true,
  sseUrl: '/quote/api/v1/events/sse',
  preferUTM: true,
  pageDwellTime: {
    enabled: true, 
    interval: 10000,
  },
});`}</code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={() =>
                          copyToClipboard(`xdpost.enableAutoTracker({
                            sdk: ${generatedSDK ? `'${generatedSDK}'` : "Your SKD"},
                            endpoint: '/quote/api/v1/events/behavior',
                            autoDetectSource: true,
                            sseUrl: '/quote/api/v1/events/sse',
                            preferUTM: true,
                            pageDwellTime: {
                              enabled: true, 
                              interval: 10000,
                            },
                          });`)
                        }
                      >
                        {isCopied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="iife" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">1. 引入脚本</h3>
                    <div className="relative mt-2">
                      <pre className="bg-muted rounded-md p-4 text-sm overflow-x-auto">
                        <code>{iifeScriptTag}</code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={() => copyToClipboard(iifeScriptTag)}
                      >
                        {isCopied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium">2. 使用全局变量</h3>
                    <div className="relative mt-2">
                      <pre className="bg-muted rounded-md p-4 text-sm overflow-x-auto">
                        <code>{`xdpost.enableAutoTracker({
  sdk: ${generatedSDK ? `'${generatedSDK}'` : "Your SKD"},
  endpoint: '/quote/api/v1/events/behavior',
  autoDetectSource: true,
  sseUrl: '/quote/api/v1/events/sse',
  preferUTM: true,
  pageDwellTime: {
    enabled: true, 
    interval: 10000,
  },
});`}</code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={() =>
                          copyToClipboard(`xdpost.enableAutoTracker({
                            sdk: ${generatedSDK ? `'${generatedSDK}'` : "Your SKD"},
                            endpoint: '/quote/api/v1/events/behavior',
                            autoDetectSource: true,
                            sseUrl: '/quote/api/v1/events/sse',
                            preferUTM: true,
                            pageDwellTime: {
                              enabled: true, 
                              interval: 10000,
                            },
                          });`)
                        }
                      >
                        {isCopied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

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
      {/* <Card className="mt-6">
        <CardHeader>
          <CardTitle>API参考</CardTitle>
          <CardDescription>xd-post SDK提供的核心API方法</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm">
                enableAutoTracker(options)
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                启用自动追踪功能，自动收集用户行为数据
              </p>
              <pre className="bg-muted rounded-md p-3 text-xs mt-2 overflow-x-auto">
                <code>{`xdpost.enableAutoTracker({
  endpoint: 'https://api.your-company.com/track',
  interval: 5000, // 可选：上报间隔(ms)
  batchSize: 10   // 可选：批量上报数量
})`}</code>
              </pre>
            </div>

            <div>
              <h4 className="font-medium text-sm">
                trackEvent(event, properties)
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                手动追踪自定义事件
              </p>
              <pre className="bg-muted rounded-md p-3 text-xs mt-2 overflow-x-auto">
                <code>{`xdpost.trackEvent('button_click', {
  buttonId: 'submit-btn',
  page: 'checkout'
})`}</code>
              </pre>
            </div>

            <div>
              <h4 className="font-medium text-sm">setUserInfo(userInfo)</h4>
              <p className="text-sm text-muted-foreground mt-1">
                设置用户信息，用于关联用户行为数据
              </p>
              <pre className="bg-muted rounded-md p-3 text-xs mt-2 overflow-x-auto">
                <code>{`xdpost.setUserInfo({
  userId: '12345',
  email: 'user@example.com',
  name: 'John Doe'
})`}</code>
              </pre>
            </div>

            <div>
              <h4 className="font-medium text-sm">
                setCustomProperties(properties)
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                设置自定义属性，这些属性将附加到所有后续事件中
              </p>
              <pre className="bg-muted rounded-md p-3 text-xs mt-2 overflow-x-auto">
                <code>{`xdpost.setCustomProperties({
  campaign: 'summer-sale',
  source: 'social-media',
  utm_medium: 'email'
})`}</code>
              </pre>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
