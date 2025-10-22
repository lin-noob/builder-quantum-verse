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
import { useTranslation } from "react-i18next";

export default function SDK() {
  const { t } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [generatedSDK, setGeneratedSDK] = useState<string | null>(null);
  const [sdkExists, setSdkExists] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkSDKExists = async () => {
      try {
        const response = await sdkService.checkSDK();
        if (response.data) {
          setSdkExists(true);
          setGeneratedSDK(response.data.skdKey || null);
        }
      } catch (error) {
        console.error("检查SDK失败:", error);
        toast.error(t("sdk.toast.checkFailed.title"), {
          description: t("sdk.toast.checkFailed.desc"),
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
      const requestData: GenerateSDKRequest = {
        skdKey: crypto.randomUUID(),
      };

      const response = await sdkService.generateSDK(requestData);

      if (response.data) {
        setGeneratedSDK(response.data.skdKey);
        setSdkExists(true);

        toast.success(t("sdk.toast.generate.success.title"), {
          description: t("sdk.toast.generate.success.desc"),
        });
      } else {
        toast.error(t("sdk.toast.generate.error.title"), {
          description: t("sdk.toast.generate.error.desc"),
        });
      }
    } catch (error) {
      toast.error(t("sdk.toast.generate.error.title"), {
        description: t("sdk.toast.generate.networkError"),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopySDK = () => {
    if (generatedSDK) {
      navigator.clipboard.writeText(generatedSDK);
      toast.success(t("sdk.toast.copySDK"));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast.success(t("sdk.toast.copied"));
  };

  const npmInstallCommand = "npm install xd-post";
  const umdScriptTag =
    '<script src="https://cdn.jsdelivr.net/npm/xd-post@latest/dist/xd-post.umd.js"></script>';
  const iifeScriptTag =
    '<script src="https://cdn.jsdelivr.net/npm/xd-post@latest/dist/xd-post.iife.js"></script>';

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("sdk.page.title")}</h1>
        <p className="text-muted-foreground mt-2">{t("sdk.page.subtitle")}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("sdk.generate.title")}</CardTitle>
            <CardDescription>
              {sdkExists ? t("sdk.generate.exists") : t("sdk.generate.description")}
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
                      {t("sdk.generate.generating")}
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      {t("sdk.generate.button")}
                    </>
                  )}
                </Button>
              )}
              <p className="text-sm text-muted-foreground">
                {sdkExists ? t("sdk.generate.tip.exists") : t("sdk.generate.tip.noExists")}
              </p>

              {loading && (
                <div className="flex justify-center items-center p-4">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  <span className="ml-2">{t("sdk.generate.checking")}</span>
                </div>
              )}

              {generatedSDK && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-green-800">{t("sdk.generate.successBanner.title")}</p>
                      <p className="text-sm text-green-700 mt-1">
                        {t("sdk.generate.successBanner.desc")}
                      </p>
                    </div>
                    <Button onClick={handleCopySDK} variant="default" size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      {t("sdk.generate.copyBtn")}
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
            <CardTitle>{t("sdk.integration.title")}</CardTitle>
            <CardDescription>
              {t("sdk.integration.description")}
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
                    <h3 className="font-medium">{t("sdk.integration.steps.install")}</h3>
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
                    <h3 className="font-medium">{t("sdk.integration.steps.importRule")}</h3>
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
                    <h3 className="font-medium">{t("sdk.integration.steps.script")}</h3>
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
                    <h3 className="font-medium">{t("sdk.integration.steps.globalVar")}</h3>
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
                    <h3 className="font-medium">{t("sdk.integration.steps.script")}</h3>
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
                    <h3 className="font-medium">{t("sdk.integration.steps.globalVar")}</h3>
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
          <CardTitle>{t("sdk.features.title")}</CardTitle>
          <CardDescription>{t("sdk.features.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-primary/10 p-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
              </div>
              <div>
                <h4 className="font-medium">{t("sdk.features.items.autoTrack.title")}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("sdk.features.items.autoTrack.desc")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-primary/10 p-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
              </div>
              <div>
                <h4 className="font-medium">{t("sdk.features.items.eventAnalysis.title")}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("sdk.features.items.eventAnalysis.desc")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-primary/10 p-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
              </div>
              <div>
                <h4 className="font-medium">{t("sdk.features.items.performance.title")}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("sdk.features.items.performance.desc")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-primary/10 p-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
              </div>
              <div>
                <h4 className="font-medium">{t("sdk.features.items.report.title")}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("sdk.features.items.report.desc")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-primary/10 p-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
              </div>
              <div>
                <h4 className="font-medium">{t("sdk.features.items.identify.title")}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("sdk.features.items.identify.desc")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-primary/10 p-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
              </div>
              <div>
                <h4 className="font-medium">{t("sdk.features.items.customProps.title")}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("sdk.features.items.customProps.desc")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
