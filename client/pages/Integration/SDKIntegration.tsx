import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Settings,
  Code,
  Zap,
  Activity,
  Globe,
  Shield,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { request } from "@/lib/request";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SDKConfig {
  websiteUrl: string;
  apiKey: string;
  trackingEvents: string[];
  dataRetention: number;
  enableRealtime: boolean;
  enableUserProfiling: boolean;
  enableAIRecommendations: boolean;
  customProperties: { key: string; value: string }[];
}

interface IntegrationStatus {
  isConnected: boolean;
  lastDataReceived: string | null;
  totalEvents: number;
  activeUsers: number;
}

const SDKIntegration = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sdkConfig, setSdkConfig] = useState<SDKConfig>({
    websiteUrl: "",
    apiKey: "",
    trackingEvents: ["pageview", "click", "form_submit"],
    dataRetention: 90,
    enableRealtime: true,
    enableUserProfiling: true,
    enableAIRecommendations: true,
    customProperties: [{ key: "", value: "" }],
  });
  const [generatedCode, setGeneratedCode] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus>({
    isConnected: false,
    lastDataReceived: null,
    totalEvents: 0,
    activeUsers: 0,
  });
  const [testingMode, setTestingMode] = useState(false);

  // 初始化时生成API Key
  useEffect(() => {
    generateApiKey();
    loadIntegrationStatus();
  }, []);

  const generateApiKey = async () => {
    try {
      // 在实际应用中，这里应该调用后端API生成安全的API Key
      const apiKey = `ak_${Math.random().toString(36).substr(2, 16)}_${Date.now()}`;
      setSdkConfig(prev => ({ ...prev, apiKey }));
    } catch (error) {
      console.error("Failed to generate API key:", error);
    }
  };

  const loadIntegrationStatus = async () => {
    try {
      // 模拟API调用获取集成状态
      // 在实际应用中，这里应该调用真实的API
      const mockStatus: IntegrationStatus = {
        isConnected: Math.random() > 0.5,
        lastDataReceived: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        totalEvents: Math.floor(Math.random() * 10000),
        activeUsers: Math.floor(Math.random() * 500),
      };
      setIntegrationStatus(mockStatus);
    } catch (error) {
      console.error("Failed to load integration status:", error);
    }
  };

  const generateSDKCode = () => {
    const { websiteUrl, apiKey, trackingEvents, enableRealtime, enableUserProfiling, enableAIRecommendations } = sdkConfig;
    
    const customPropertiesCode = sdkConfig.customProperties
      .filter(prop => prop.key && prop.value)
      .map(prop => `      "${prop.key}": "${prop.value}"`)
      .join(",\n");

    const eventsArray = trackingEvents.map(event => `"${event}"`).join(", ");

    const code = `<!-- AI营销平台 - 数据收集SDK -->
<script>
(function() {
  // SDK配置
  window.AIMarketingConfig = {
    apiKey: "${apiKey}",
    baseUrl: "https://api.aimarketing.com",
    websiteUrl: "${websiteUrl}",
    trackingEvents: [${eventsArray}],
    options: {
      enableRealtime: ${enableRealtime},
      enableUserProfiling: ${enableUserProfiling},
      enableAIRecommendations: ${enableAIRecommendations},
      dataRetention: ${sdkConfig.dataRetention}
    },
    customProperties: {
${customPropertiesCode}
    }
  };

  // 创建SDK实例
  var AIMarketing = {
    version: "1.0.0",
    initialized: false,
    
    // 初始化SDK
    init: function() {
      if (this.initialized) return;
      
      console.log("AI营销平台 SDK 初始化中...");
      this.initialized = true;
      
      // 自动收集页面浏览数据
      if (window.AIMarketingConfig.trackingEvents.includes("pageview")) {
        this.trackPageView();
      }
      
      // 设置自动事件监听
      this.setupEventListeners();
      
      // 初始化用户画像
      if (window.AIMarketingConfig.options.enableUserProfiling) {
        this.initUserProfiling();
      }
      
      console.log("AI营销平台 SDK 初始化完成");
    },
    
    // 跟踪页面浏览
    trackPageView: function(customData) {
      var data = {
        event: "pageview",
        url: window.location.href,
        title: document.title,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        ...customData
      };
      this.sendEvent(data);
    },
    
    // 跟踪自定义事件
    track: function(eventName, properties) {
      var data = {
        event: eventName,
        properties: properties || {},
        timestamp: new Date().toISOString(),
        url: window.location.href
      };
      this.sendEvent(data);
    },
    
    // 设置事件监听器
    setupEventListeners: function() {
      var self = this;
      
      // 点击事件
      if (window.AIMarketingConfig.trackingEvents.includes("click")) {
        document.addEventListener("click", function(e) {
          self.track("click", {
            element: e.target.tagName,
            text: e.target.textContent || e.target.value || "",
            id: e.target.id,
            className: e.target.className
          });
        });
      }
      
      // 表单提交事件
      if (window.AIMarketingConfig.trackingEvents.includes("form_submit")) {
        document.addEventListener("submit", function(e) {
          self.track("form_submit", {
            formId: e.target.id,
            formAction: e.target.action,
            formMethod: e.target.method
          });
        });
      }
      
      // 滚动事件
      if (window.AIMarketingConfig.trackingEvents.includes("scroll")) {
        var scrollThreshold = [25, 50, 75, 90];
        var triggeredThresholds = [];
        
        window.addEventListener("scroll", function() {
          var scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
          
          scrollThreshold.forEach(function(threshold) {
            if (scrollPercent >= threshold && triggeredThresholds.indexOf(threshold) === -1) {
              triggeredThresholds.push(threshold);
              self.track("scroll", { percentage: threshold });
            }
          });
        });
      }
    },
    
    // 初始化用户画像
    initUserProfiling: function() {
      var userProfile = {
        sessionId: this.generateSessionId(),
        deviceType: this.getDeviceType(),
        browserInfo: this.getBrowserInfo(),
        screenResolution: window.screen.width + "x" + window.screen.height,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language
      };
      
      this.track("user_profile", userProfile);
    },
    
    // 发送事件数据
    sendEvent: function(data) {
      var payload = {
        ...data,
        apiKey: window.AIMarketingConfig.apiKey,
        websiteUrl: window.AIMarketingConfig.websiteUrl,
        customProperties: window.AIMarketingConfig.customProperties
      };
      
      // 使用Beacon API发送数据（优先选择）
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          window.AIMarketingConfig.baseUrl + "/api/events",
          JSON.stringify(payload)
        );
      } else {
        // 降级到fetch API
        fetch(window.AIMarketingConfig.baseUrl + "/api/events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload),
          keepalive: true
        }).catch(function(error) {
          console.error("发送事件数据失败:", error);
        });
      }
    },
    
    // 生成会话ID
    generateSessionId: function() {
      return Math.random().toString(36).substr(2, 16) + Date.now().toString(36);
    },
    
    // 获取设备类型
    getDeviceType: function() {
      var ua = navigator.userAgent;
      if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
      if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\\sce|palm|smartphone|iemobile/i.test(ua)) return "mobile";
      return "desktop";
    },
    
    // 获取浏览器信息
    getBrowserInfo: function() {
      var ua = navigator.userAgent;
      var browsers = {
        chrome: /chrome/i,
        firefox: /firefox/i,
        safari: /safari/i,
        edge: /edge/i,
        ie: /msie|trident/i
      };
      
      for (var browser in browsers) {
        if (browsers[browser].test(ua)) return browser;
      }
      return "unknown";
    }
  };
  
  // 将SDK暴露到全局作用域
  window.AIMarketing = AIMarketing;
  
  // 页面加载完成后自动初始化
  if (document.readyState === "complete") {
    AIMarketing.init();
  } else {
    window.addEventListener("load", function() {
      AIMarketing.init();
    });
  }
})();
</script>

<!-- 使用示例 -->
<script>
// 页面加载后，您可以使用以下方法跟踪自定义事件：

// 跟踪购买事件
// AIMarketing.track("purchase", {
//   productId: "12345",
//   productName: "示例商品",
//   price: 99.99,
//   quantity: 1
// });

// 跟踪添加到购物车事件
// AIMarketing.track("add_to_cart", {
//   productId: "12345",
//   category: "电子产品"
// });

// 跟踪用户注册事件
// AIMarketing.track("signup", {
//   method: "email",
//   source: "homepage"
// });
</script>`;

    setGeneratedCode(code);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "复制成功",
        description: "代码已复制到剪贴板",
      });
    } catch (error) {
      toast({
        title: "复制失败",
        description: "请手动选择并复制代码",
        variant: "destructive",
      });
    }
  };

  const downloadSDK = () => {
    const blob = new Blob([generatedCode], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-marketing-sdk.js";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "下载成功",
      description: "SDK文件已下载到本地",
    });
  };

  const testConnection = async () => {
    setTestingMode(true);
    try {
      // 模拟测试连接
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIntegrationStatus(prev => ({ ...prev, isConnected: true }));
      toast({
        title: "连接测试成功",
        description: "SDK集成正常，数据传输正常",
      });
    } catch (error) {
      toast({
        title: "连接测试失败",
        description: "请检查API Key和网站配置",
        variant: "destructive",
      });
    } finally {
      setTestingMode(false);
    }
  };

  const addCustomProperty = () => {
    setSdkConfig(prev => ({
      ...prev,
      customProperties: [...prev.customProperties, { key: "", value: "" }]
    }));
  };

  const removeCustomProperty = (index: number) => {
    setSdkConfig(prev => ({
      ...prev,
      customProperties: prev.customProperties.filter((_, i) => i !== index)
    }));
  };

  const updateCustomProperty = (index: number, field: "key" | "value", value: string) => {
    setSdkConfig(prev => ({
      ...prev,
      customProperties: prev.customProperties.map((prop, i) => 
        i === index ? { ...prop, [field]: value } : prop
      )
    }));
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* ��面标题 */}
      <div>
        <h1 className="text-2xl font-bold">SDK集成管理</h1>
        <p className="text-muted-foreground mt-1">
          生成并配置JavaScript SDK，在您的网站上收集用户行为数据
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧配置区域 */}
        <div className="lg:col-span-2 space-y-6">
          {/* SDK配置 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                SDK配置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 基础配置 */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="websiteUrl">网站URL</Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    placeholder="https://your-website.com"
                    value={sdkConfig.websiteUrl}
                    onChange={(e) => setSdkConfig(prev => ({ ...prev, websiteUrl: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="apiKey">API密钥</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="apiKey"
                        type={showApiKey ? "text" : "password"}
                        value={sdkConfig.apiKey}
                        readOnly
                        className="pr-10"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button variant="outline" onClick={generateApiKey}>
                      <RefreshCw className="h-4 w-4 mr-1" />
                      重新生成
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="dataRetention">数据保留天数</Label>
                  <Select
                    value={sdkConfig.dataRetention.toString()}
                    onValueChange={(value) => setSdkConfig(prev => ({ ...prev, dataRetention: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30天</SelectItem>
                      <SelectItem value="90">90天</SelectItem>
                      <SelectItem value="180">180天</SelectItem>
                      <SelectItem value="365">365天</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 功能开关 */}
              <div className="space-y-4">
                <h4 className="font-medium">功能配置</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="realtime">实时数据传输</Label>
                    <p className="text-sm text-muted-foreground">启用实时数据收集和传输</p>
                  </div>
                  <Switch
                    id="realtime"
                    checked={sdkConfig.enableRealtime}
                    onCheckedChange={(checked) => setSdkConfig(prev => ({ ...prev, enableRealtime: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="userProfiling">用户画像</Label>
                    <p className="text-sm text-muted-foreground">自动收集和分析用户特征</p>
                  </div>
                  <Switch
                    id="userProfiling"
                    checked={sdkConfig.enableUserProfiling}
                    onCheckedChange={(checked) => setSdkConfig(prev => ({ ...prev, enableUserProfiling: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="aiRecommendations">AI智能推荐</Label>
                    <p className="text-sm text-muted-foreground">基于用户行为的智能营销推荐</p>
                  </div>
                  <Switch
                    id="aiRecommendations"
                    checked={sdkConfig.enableAIRecommendations}
                    onCheckedChange={(checked) => setSdkConfig(prev => ({ ...prev, enableAIRecommendations: checked }))}
                  />
                </div>
              </div>

              {/* 自定义属性 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">自定义属性</h4>
                  <Button variant="outline" size="sm" onClick={addCustomProperty}>
                    添加属性
                  </Button>
                </div>
                
                {sdkConfig.customProperties.map((prop, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="属性名"
                      value={prop.key}
                      onChange={(e) => updateCustomProperty(index, "key", e.target.value)}
                    />
                    <Input
                      placeholder="属性值"
                      value={prop.value}
                      onChange={(e) => updateCustomProperty(index, "value", e.target.value)}
                    />
                    {sdkConfig.customProperties.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeCustomProperty(index)}
                      >
                        删除
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button onClick={generateSDKCode} className="w-full">
                <Code className="h-4 w-4 mr-2" />
                生成SDK代码
              </Button>
            </CardContent>
          </Card>

          {/* 生成的代码 */}
          {generatedCode && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    生成的SDK代码
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generatedCode)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      复制
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadSDK}>
                      <Download className="h-4 w-4 mr-1" />
                      下载
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Textarea
                    value={generatedCode}
                    readOnly
                    className="font-mono text-sm h-96 resize-none"
                  />
                </div>
                
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>集成说明</AlertTitle>
                  <AlertDescription>
                    将以上代码复制并粘贴到您网站的 &lt;head&gt; 标签内，或在 &lt;/body&gt; 标签前。
                    代码会自动开始收集用户行为数据。
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 右侧状态区域 */}
        <div className="space-y-6">
          {/* 集成状态 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                集成状态
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">连接状态</span>
                <Badge variant={integrationStatus.isConnected ? "default" : "secondary"}>
                  {integrationStatus.isConnected ? "已连接" : "未连接"}
                </Badge>
              </div>

              {integrationStatus.lastDataReceived && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">最后数据时间</span>
                  <p className="text-sm">
                    {new Date(integrationStatus.lastDataReceived).toLocaleString("zh-CN")}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">总事件数</span>
                  <span className="text-sm font-mono">{integrationStatus.totalEvents.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">活跃用户</span>
                  <span className="text-sm font-mono">{integrationStatus.activeUsers.toLocaleString()}</span>
                </div>
              </div>

              <Button
                className="w-full"
                variant="outline"
                onClick={testConnection}
                disabled={testingMode}
              >
                {testingMode ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                {testingMode ? "测试中..." : "测试连接"}
              </Button>
            </CardContent>
          </Card>

          {/* 快速指南 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                集成指南
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                    1
                  </div>
                  <div>
                    <div className="font-medium">配置SDK</div>
                    <div className="text-muted-foreground">填写网站URL并选择需要的功能</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                    2
                  </div>
                  <div>
                    <div className="font-medium">生成代码</div>
                    <div className="text-muted-foreground">点击生成按钮获取集成代码</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                    3
                  </div>
                  <div>
                    <div className="font-medium">部署到网站</div>
                    <div className="text-muted-foreground">将代码添加到网站页面中</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                    4
                  </div>
                  <div>
                    <div className="font-medium">验证集成</div>
                    <div className="text-muted-foreground">使用测试工具验证数据收集</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 安全提示 */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <Shield className="h-5 w-5" />
                安全提示
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-orange-700">
              <ul className="space-y-2">
                <li>• 请妥善保管您的API密钥</li>
                <li>• 定期更新API密钥确保安全</li>
                <li>• 仅在HTTPS网站上使用SDK</li>
                <li>• 遵守相关隐私法规要求</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SDKIntegration;
