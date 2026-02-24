// AI模型数据服务 - 用于AI模型管理页面
export interface AIModel {
  id: string;
  name: string;
  version: string;
  provider: string;
  status: "active" | "inactive" | "training" | "error";
  description: string;
  capabilities: string[];
  parameters: {
    temperature: number;
    maxTokens: number;
    topP: number;
  };
  performance: {
    accuracy: number;
    latency: number;
    throughput: number;
  };
  usage: {
    totalRequests: number;
    successRate: number;
    avgResponseTime: number;
  };
  createdAt: string;
  updatedAt: string;
}

// 生成模拟AI模型数据
const generateMockAIModels = (count: number): AIModel[] => {
  const providers = ["OpenAI", "Anthropic", "Google", "Meta", "自研"];
  const modelNames = ["GPT-4", "Claude", "Gemini", "LLaMA", "ChatAI"];
  const capabilities = ["文本生成", "对话", "代码生成", "翻译", "总结", "分析"];
  
  return Array.from({ length: count }, (_, index) => {
    const provider = providers[index % providers.length];
    const baseName = modelNames[index % modelNames.length];
    
    return {
      id: `model-${index + 1}`,
      name: `${baseName}-${index + 1}`,
      version: `v${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}`,
      provider,
      status: Math.random() > 0.8 ? "inactive" : "active" as AIModel["status"],
      description: `${provider}提供的${baseName}模型，适用于多种AI营销场景`,
      capabilities: capabilities.slice(0, Math.floor(Math.random() * 4) + 2),
      parameters: {
        temperature: Math.round((Math.random() * 1 + 0.1) * 100) / 100,
        maxTokens: Math.floor(Math.random() * 3000) + 1000,
        topP: Math.round((Math.random() * 0.5 + 0.5) * 100) / 100,
      },
      performance: {
        accuracy: Math.round((Math.random() * 0.2 + 0.8) * 100) / 100,
        latency: Math.floor(Math.random() * 200) + 50,
        throughput: Math.floor(Math.random() * 500) + 100,
      },
      usage: {
        totalRequests: Math.floor(Math.random() * 10000) + 1000,
        successRate: Math.round((Math.random() * 0.1 + 0.9) * 100) / 100,
        avgResponseTime: Math.floor(Math.random() * 100) + 50,
      },
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
};

export class AIModelDataService {
  private static models: AIModel[] = generateMockAIModels(12);
  
  // 获取所有AI模型
  static async getModels(): Promise<AIModel[]> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 50));
    return [...this.models];
  }
  
  // 根据ID获取模型
  static async getModelById(id: string): Promise<AIModel | null> {
    await new Promise(resolve => setTimeout(resolve, 30));
    return this.models.find(model => model.id === id) || null;
  }
  
  // 创建新模型
  static async createModel(modelData: Omit<AIModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<AIModel> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const newModel: AIModel = {
      ...modelData,
      id: `model-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.models.push(newModel);
    return newModel;
  }
  
  // 更新模型
  static async updateModel(id: string, updates: Partial<AIModel>): Promise<AIModel | null> {
    await new Promise(resolve => setTimeout(resolve, 80));
    
    const index = this.models.findIndex(model => model.id === id);
    if (index === -1) return null;
    
    this.models[index] = {
      ...this.models[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    return this.models[index];
  }
  
  // 删除模型
  static async deleteModel(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 60));
    
    const index = this.models.findIndex(model => model.id === id);
    if (index === -1) return false;
    
    this.models.splice(index, 1);
    return true;
  }
  
  // 测试模型
  static async testModel(id: string, prompt: string): Promise<{
    success: boolean;
    response?: string;
    error?: string;
    responseTime: number;
  }> {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    const model = this.models.find(m => m.id === id);
    if (!model) {
      return {
        success: false,
        error: "模型不存在",
        responseTime: 0,
      };
    }
    
    if (model.status !== "active") {
      return {
        success: false,
        error: "模型未激活",
        responseTime: 0,
      };
    }
    
    const responseTime = Math.floor(Math.random() * 500) + 200;
    const success = Math.random() > 0.1; // 90% 成功率
    
    if (success) {
      return {
        success: true,
        response: `这是${model.name}模型对"${prompt}"的响应。这是一个模拟响应，展示了模型的基本功能。`,
        responseTime,
      };
    } else {
      return {
        success: false,
        error: "模型响应超时或出现错误",
        responseTime,
      };
    }
  }
  
  // 获取模型统计信息
  static async getModelStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    avgAccuracy: number;
    avgLatency: number;
    totalRequests: number;
  }> {
    await new Promise(resolve => setTimeout(resolve, 40));
    
    const active = this.models.filter(m => m.status === "active").length;
    const inactive = this.models.filter(m => m.status === "inactive").length;
    
    const avgAccuracy = this.models.reduce((sum, m) => sum + m.performance.accuracy, 0) / this.models.length;
    const avgLatency = this.models.reduce((sum, m) => sum + m.performance.latency, 0) / this.models.length;
    const totalRequests = this.models.reduce((sum, m) => sum + m.usage.totalRequests, 0);
    
    return {
      total: this.models.length,
      active,
      inactive,
      avgAccuracy: Math.round(avgAccuracy * 100) / 100,
      avgLatency: Math.round(avgLatency),
      totalRequests,
    };
  }
}
