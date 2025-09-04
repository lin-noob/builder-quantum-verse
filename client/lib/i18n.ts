import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 中文翻译
const zhTranslations = {
  nav: {
    platformName: 'AI营销平台',
    productFeatures: '产品特色',
    solutions: '解决方案',
    contactUs: '联系我们',
    startAI: '启动AI',
    aiMarketing: 'AI智能营销',
    userProfiling: '用户画像分析',
    realTimeMonitoring: '实时监控中心',
    effectTracking: '效果追踪',
    ecommerce: '电商营销',
    contentMarketing: '内容营销',
    financialMarketing: '金融营销',
    enterpriseServices: '企���服务'
  },
  hero: {
    aiMarketingTitle: 'AI驱动的未来营销',
    aiMarketingDescription: '通过前沿人��智能技术，实现{{preciseTech}}、{{automation}}和{{dataDecision}}，帮助企业实现营销效果的指数级提升',
    preciseTech: '精准用户洞察',
    automation: '自动化营销执行',
    dataDecision: '数据驱动决策',
    enterpriseTitle: '企业服务解决方案',
    enterpriseDescription: '专为B2B企业服务打造的AI营销解决方案，精准获客、高效转化、客户成功管理，���力企业服务商业务增长',
    financialTitle: '金融营销解决方案',
    financialDescription: '专为金融行业打造的AI营销解决方案，合规安全、精准获客、提升客户价值，助力金融机构数字化转型',
    ecommerceTitle: '电商营销解决方案',
    ecommerceDescription: '专为电商平台打造的AI智能营销解决方案，提升转化率、减少购物车放弃、增强用户留存，助力电商业务持续增长',
    contentTitle: '内容营销解决���案',
    contentDescription: 'AI驱动的���容营销解决方案，自动生成优质内容、精准投放、提升品牌影响力和用户参与度',
    userProfilingTitle: '���户画像分析',
    userProfilingDescription: '深度用户行为分析，精准洞察用户需求和偏好，构建完整的用户画像体系，为精准营销提供数据支撑',
    effectTrackingTitle: '效果追踪',
    effectTrackingDescription: '全链路效果追踪，量化营销ROI和转化效果，提供精准的数据分析和优化建议，让每一分投入都可衡量',
    realTimeMonitoringTitle: '实时监控中心',
    realTimeMonitoringDescription: '实时监控营销活动效果，智能异常检测和预警，快速调整优化策略，确保营销目标的达成',
    ctaPrimary: '立即体验',
    ctaSecondary: '观看演示',
    ctaStartAI: '启动AI营销',
    ctaWatchDemo: '观看产品演示',
    ctaContactExpert: '联系专家',
    ctaFreeTrial: '免费试用',
    ctaViewDemo: '查看���示'
  },
  features: {
    title: '核心功能矩阵',
    subtitle: '全方位AI营销解决方案',
    aiMarketingTitle: 'AI智能营销',
    aiMarketingDescription: '基于AI的智能营销场景配置，自动生成���性化营销内容',
    aiMarketingBenefits: {
      contentGeneration: '智能内容生成',
      personalization: '个性化推荐',
      automation: '自动化执行'
    },
    userProfilingTitle: '用户画像分析',
    userProfilingDescription: '深度用户行为分析，精准洞察用户需求和偏好',
    userProfilingBenefits: {
      fullProfile: '360°用户画像',
      behaviorAnalysis: '行为轨迹分析',
      valueSegmentation: '价值分群'
    },
    realTimeMonitoringTitle: '实时监控中心',
    realTimeMonitoringDescription: '实时监控营销活动效果，快速调整优化策略',
    realTimeMonitoringBenefits: {
      realTimeData: '实时数据监控',
      alerting: '异常预警',
      optimization: '性能优化建议'
    },
    effectTrackingTitle: '效果追踪',
    effectTrackingDescription: '全链路效果追踪，量化营销ROI和转化效果',
    effectTrackingBenefits: {
      funnelAnalysis: '转化漏斗分析',
      roiCalculation: 'ROI计算',
      multiDimensionReport: '多维度报表'
    },
    dataDecisionTitle: '数据驱动决策',
    dataDecisionDescription: '基于大数据分析的营销决策支持系统',
    dataDecisionBenefits: {
      trendPrediction: '趋势预测',
      strategyRecommendation: '策略推荐',
      abTesting: 'A/B测试'
    },
    automationTitle: '营销自动化',
    automationDescription: '全���程营销自动化，降低人工成本提升效率',
    automationBenefits: {
      triggerMarketing: '触发式营销',
      workflow: '自���化工作流',
      batchProcessing: '批量处理'
    },
    contentCore: {
      smartGenerationTitle: '智能内容生成',
      smartGenerationDescription: '基于品牌调性和目标受众，AI自动生成高���量营销内容和创意素材',
      preciseDistributionTitle: '精准内容投放',
      preciseDistributionDescription: '智能识别最佳发布时机和渠道，确保内容触达最精准的目标用户',
      effectAnalysisTitle: '内容效果分析',
      effectAnalysisDescription: '实时监控内容表现，分析用户互动数据，持续优化内容策略',
      socialMediaTitle: '社交媒体管理',
      socialMediaDescription: '统一管理多平台社交媒体内容，自动化发布和用户互动响应'
    },
    enterpriseCore: {
      preciseLeadsTitle: '���准线索获取',
      preciseLeadsDescription: '基于企业画像和决策人分析，智能识别高价值潜在客户和商机',
      salesOptimizationTitle: '销售流程优化',
      salesOptimizationDescription: 'AI驱动的销售流��管理，提升销售效率和成单率',
      customerSuccessTitle: '客户成功管理',
      customerSuccessDescription: '全生命周期客户管理，提升客户满意度和续费率',
      marketingAnalyticsTitle: '营销数据分析',
      marketingAnalyticsDescription: '深度分析B2B营销数据，洞察客户需求和市场趋势'
    },
    financialCore: {
      complianceTitle: '合规营销管理',
      complianceDescription: '严格遵循金融监管要求���确保营销活动合规性和风险控制',
      preciseAcquisitionTitle: '精准客户获取',
      preciseAcquisitionDescription: '基于风险模型和客户画像，精准识别高价值潜在客户',
      valueEnhancementTitle: '客户价值提升',
      valueEnhancementDescription: '通过智能推荐和交叉销售，提升单客价值和客户生命周期',
      riskControlTitle: '风险控制营销',
      riskControlDescription: '实时监控营销风险，防范欺诈行为，保护客户资金安全'
    },
    enterpriseCore: {
      preciseLeadsTitle: '精��线索获取',
      preciseLeadsDescription: '基于企业画像和决策人分析，智能识别高价值潜在客户和商机',
      salesOptimizationTitle: '销售流程优化',
      salesOptimizationDescription: 'AI驱动的销售流程管理，提升销售效率和成单率',
      customerSuccessTitle: '客户成功管理',
      customerSuccessDescription: '全生命周期客户管理，提升客户满意度和续费率',
      marketingAnalyticsTitle: '营销数据分析',
      marketingAnalyticsDescription: '深度分析B2B营销数据，洞察客户需求和市场趋势'
    },
    financialCore: {
      complianceTitle: '合规营销管理',
      complianceDescription: '严格遵循金融监管要求，确保营��活动合规性和风险控制',
      preciseAcquisitionTitle: '精准客户获取',
      preciseAcquisitionDescription: '基于风险模型和客户画像，精准识别高价值潜在客户',
      valueEnhancementTitle: '客户价值提升',
      valueEnhancementDescription: '通过智能推荐和交叉销售，提升单客价值和客户生命周期',
      riskControlTitle: '风险控制营销',
      riskControlDescription: '实时监控营销风险，防范欺诈行为，保护客户资金安全'
    },
    // 用户画像扩展翻译键
    userProfilingExtended: {
      multiDimension: '多维度数据整合',
      interestMining: '兴趣偏好挖掘',
      consumptionEvaluation: '消费能力评估',
      rfmAnalysis: 'RFM价值分析',
      lifecycleSegmentation: '生命周期分群',
      interestTagGrouping: '兴趣标签分组',
      behaviorClustering: '行为模式聚类',
      churnRiskWarning: '流失风险预警',
      purchaseIntentPrediction: '购买意向预测',
      valueTrendAnalysis: '价值趋势分析',
      repurchaseProbability: '复购概率计算',
      realTimeDataCollection: '实时数据采集',
      incrementalUpdate: '增量计算更新',
      abnormalBehaviorMonitoring: '异常行为监测',
      profileAccuracyValidation: '画像准确性验证',
      predictiveAnalysisEngine: '预测分析引擎',
      predictiveAnalysisEngineDesc: '运用先进的预测模型，预测用户行为趋势和价值变化，提前制定营销策略',
      realTimeProfileUpdate: '实时画像更新',
      realTimeProfileUpdateDesc: '实时捕获用户行为变化，动态更新用户画像，确保洞察的时效性和准确性',
      valueSegmentationDesc: '基于机器学习算法，自动识别用户群体特征，实现精准的用户分层管理'
    },
    // 数据维度分析
    dataAnalysis: {
      title: '多维度数据分析',
      subtitle: '全面覆盖用户行为的各个维度',
      basicAttributes: '基础属性',
      behaviorData: '行为数据',
      preferenceFeatures: '偏好特征',
      valueIndicators: '价值指标',
      ageGenderLocation: '年龄、性别、地域',
      occupationIncome: '职业、收入水平',
      educationBackground: '教育背景',
      familyStructure: '家庭结构',
      browsingTrajectory: '浏览轨迹',
      purchaseHistory: '购买历史',
      interactionBehavior: '互动行���',
      usageHabits: '使用习惯',
      productPreference: '商品偏好',
      priceSensitivity: '价格敏感度',
      brandTendency: '品牌倾向',
      channelPreference: '渠道偏好',
      consumptionCapacity: '消费能力',
      activityLevel: '活跃度',
      loyalty: '忠诚度',
      influence: '影响力'
    },
    // 应用场景
    applicationScenarios: {
      title: '应用场景',
      subtitle: '用户画像在营销各环节的实际应用',
      preciseRecommendation: '精准推荐',
      preciseRecommendationDesc: '基于用户画像推荐个性化商品和内容',
      preciseRecommendationMetrics: '点击率提升40%',
      targetedMarketing: '定向营销',
      targetedMarketingDesc: '向特定用户群体投放定制化��销内容',
      targetedMarketingMetrics: '转化率提升55%',
      userOperation: '用户运营',
      userOperationDesc: '制定差异化的用户运营和服务策略',
      userOperationMetrics: '用户满意度提升30%',
      productOptimization: '���品优化',
      productOptimizationDesc: '基于用户需求洞察优化产品功能��计',
      productOptimizationMetrics: '产品采用率提升45%',
      viewDetailedCase: '查看详细案例'
    },
    // 技术架构
    technicalArchitecture: {
      title: '技术架构',
      subtitle: '基于大数据和机器学习技术，构建企业级用户画像分析平台',
      mlEngine: '机器学习引擎',
      mlEngineDesc: '运用先进的ML算法，自���发现用户行为模式和特征',
      realTimeComputingPlatform: '实时计算平台',
      realTimeComputingPlatformDesc: '支持大规模实时数据处理和画像更新',
      tagManagementSystem: '标签管理系统',
      tagManagementSystemDesc: '灵活的标签体系，支持自定义标签和标签组合',
      platformCapabilities: '平台能力',
      userProfileProcessing: '用户画像处理',
      tagDimensions: '标签维度',
      profileUpdateSpeed: '画像更新',
      predictionAccuracy: '预测准确率',
      secondLevel: '��级',
      tenMillionPlus: '1000万+',
      fiveHundredPlus: '500+',
      ninetyFivePercentPlus: '95%+'
    },
    // AI营销翻译键
    aiMarketingOptimized: {
      // 核心能力
      smartContentGeneration: '智能内容生成',
      smartContentGenerationDesc: '基于用户画像和行为数据，AI自动生成个性化营销文案、邮件��容和推荐策略',
      smartContentGenerationBenefits: {
        naturalLanguageProcessing: '自然语言处理',
        personalizedContent: '个性化文案',
        multiLanguageSupport: '多语言支持',
        brandToneAdaptation: '品牌语调适配'
      },
      preciseScenarioTriggering: '精准场景触发',
      preciseScenarioTriggeringDesc: '智能识别用户行为���式，在最佳时机触发营销动作，提升转化效果',
      preciseScenarioTriggeringBenefits: {
        behaviorPrediction: '行为预测',
        timingOptimization: '时机优化',
        scenarioAdaptation: '场景适配',
        automaticTriggering: '自动化触发'
      },
      strategyAutoOptimization: '策略自动优化',
      strategyAutoOptimizationDesc: '实时分析营销效果，AI自动调整策略参数，持续优化营销效果',
      strategyAutoOptimizationBenefits: {
        effectMonitoring: '效果监控',
        parameterTuning: '参数调优',
        abTesting: 'A/B测试',
        strategyEvolution: '策略进化'
      },
      multiChannelCollaboration: '多渠道协同',
      multiChannelCollaborationDesc: '统一管理多个营销渠道，确保用户体验一致性和营销效果最大化',
      multiChannelCollaborationBenefits: {
        channelIntegration: '渠道整合',
        messageUnification: '消息统一',
        userJourney: '用户旅程',
        effectAggregation: '效果聚合'
      },
      // ���用场景
      ecommerceCartRecovery: '电商购物车挽回',
      ecommerceCartRecoveryAI: 'AI分析用户偏好和价格敏感度，生成个性化优惠券',
      ecommerceCartRecoveryResult: '转化率提升45%',
      newUserWelcomeSequence: '新用户欢迎序列',
      newUserWelcomeSequenceAI: '根据注册渠道定制化欢迎内容和产品推荐',
      newUserWelcomeSequenceResult: '首购转化率提升60%',
      memberUpgradeMarketing: '会员升级营销',
      memberUpgradeMarketingAI: '分析消费行为推送定制化升级方案',
      memberUpgradeMarketingResult: '会员升级率提升35%',
      aiAutoProcessing: 'AI自动处理',
      realScenarioTitle: '实际应用场景',
      realScenarioSubtitle: '真实案例展示AI智能营销的强大���力',
      // 技术优势
      technicalAdvantagesTitle: '技术优势',
      technicalAdvantagesDesc: '基于先进的机器学习算法和大数据分析技术',
      systemAvailability: '系统��用性',
      dailyMessageProcessing: '日处理消息',
      averageEffectImprovement: '平均效果提升',
      newEraTitle: '开启AI智能营销新时代',
      newEraSubtitle: '让人工智能为您的营销策略注入强大动力',
      startExperienceNow: '立即开始体验',
      contactExpertConsultation: '联系专家咨询',
      fullTimeIntelligentOperation: '24/7全天候���能运营',
      millisecondUserResponse: '毫秒级响应用户行为',
      personalizedContentGeneration: '个性化内容生成',
      autoABTestOptimization: '自动A/B测试优化'
    },
    // 实时监控翻译键
    realTimeMonitoringExtended: {
      // 核心功能
      realTimeDataMonitoring: '实时数据监控',
      realTimeDataMonitoringDesc: '24/7实时监控营销活动数据，毫秒级响应数据变化，确保营销效果可视化',
      realTimeDataBenefits: {
        realTimeDataSync: '实时数据同步',
        multiDimensionMonitoring: '多维度指标监控',
        visualDataDisplay: '可视化数据展示',
        historicalTrendComparison: '历史趋势对比'
      },
      intelligentAlerting: '智能预警',
      intelligentAlertingDesc: '基于机器学习的异常检测算法，主动识别营销异常并及时预警通知',
      intelligentAlertingBenefits: {
        abnormalBehaviorRecognition: '异常行为识别',
        intelligentThresholdSetting: '阈值智能设定',
        multiChannelAlertNotification: '多渠道预警通知',
        alertStrategyConfiguration: '预警策略配置'
      },
      performanceOptimization: '性能优化建议',
      performanceOptimizationDesc: '深度分析营销活动性能，提供优化建议和策略调整方案',
      performanceOptimizationBenefits: {
        performanceBottleneckAnalysis: '性能瓶颈分析',
        optimizationSuggestionGeneration: '优化建议生成',
        abTestMonitoring: 'A/B测试监控',
        effectPredictionModel: '效果预测模型'
      },
      automatedResponse: '自动化响应',
      automatedResponseDesc: '根据监控结果自动触发相应的营销策略调整，实现闭环优化',
      automatedResponseBenefits: {
        strategyAutoAdjustment: '策略自动调整',
        emergencyResponseMechanism: '紧急响应机制',
        intelligentScaling: '智能扩缩容',
        loadBalanceOptimization: '负载均衡优化'
      },
      // 监控指标体系
      monitoringMetricsSystem: {
        title: '监控指标体系',
        subtitle: '全面覆盖营销活动的各个维度',
        marketingEffectMetrics: '营销效果指标',
        systemPerformanceMetrics: '系统性能指标',
        userBehaviorMetrics: '用户行为指标',
        businessOperationMetrics: '业务运营指标',
        conversionRate: '转化率',
        clickRate: '点击率',
        costEffectiveness: '成本效益',
        roiRoas: 'ROI/ROAS',
        responseTime: '响���时间',
        throughput: '吞吐量',
        errorRate: '错���率',
        availability: '可用性',
        activeUsers: '活跃用户数',
        userRetention: '用户留存',
        behaviorPath: '行为路径',
        usageDuration: '使用时长',
        orderVolume: '订单量',
        revenue: '收入',
        customerUnitPrice: '客单价',
        repurchaseRate: '复购率'
      },
      // 智能预警机制
      intelligentAlertMechanism: {
        title: '智能预警机制',
        subtitle: '主动发现问题，快速响应处理',
        performanceAbnormal: '性能异常',
        performanceAbnormalDesc: '系统响应时间超过阈值或错误率异常上升',
        performanceAbnormalResponse: '自动扩容、流量限制、紧急切换备用系统',
        marketingEffectAbnormal: '营销效果异常',
        marketingEffectAbnormalDesc: '转化率大幅下降或成本异常增加',
        marketingEffectAbnormalResponse: '暂停低效活动、调整投放策略、优化目标人群',
        userBehaviorAbnormal: '用户行为异常',
        userBehaviorAbnormalDesc: '用户流失率异常或行为模式突变',
        userBehaviorAbnormalResponse: '启动挽回策略、调整用户体验、个性化推荐优化',
        businessMetricsAbnormal: '业务指标异常',
        businessMetricsAbnormalDesc: '订单量��降或收入异常波动',
        businessMetricsAbnormalResponse: '紧急营销活动、价格策略调整、库存优化',
        autoResponseStrategy: '自动响应策略',
        instantNotification: '即时通知'
      },
      // 技术特性
      technicalFeatures: {
        title: '技术特性',
        subtitle: '基于先进的流式处理技术和机器学习算法，提供毫秒级的实时监控能力',
        millisecondDataUpdate: '毫秒级数据更新',
        multiDimensionMetricMonitoring: '多维度指标监控',
        intelligentAnomalyDetection: '智能异常检测',
        autoAlertNotification: '自动预警通知',
        visualDataDashboard: '可视化数据大屏',
        mobileRealTimeView: '移动端实时查看',
        monitoringCapabilities: '监控能力',
        dataLatency: '数据延迟',
        monitoringAccuracy: '监控准确率',
        dailyEventProcessing: '日处理事件',
        continuousMonitoring: '不间断监控',
        lessThan100ms: '<100ms',
        ninetyNinePointNinePercent: '99.9%',
        tenMillionPlus: '1000万+',
        sevenTwentyFour: '7x24'
      },
      // 监控大屏
      monitoringDashboard: {
        title: '实时监控大屏',
        subtitle: '一屏掌握全局营销态势',
        systemAvailability: '系统可用性',
        activeMarketingActivities: '活跃营销活动',
        averageConversionRate: '平均转化率',
        lastUpdated: '最后更新',
        justNow: '刚刚'
      }
    }
  },
  stats: {
    conversionIncrease: '转化率提升',
    efficiencyIncrease: '运营效率提升',
    costReduction: '成本降低',
    systemStability: '系统稳定性',
    averageConversionIncrease: '平均转化提升',
    customerRetentionImprovement: '客户复购率增长',
    adROIIncrease: '广告ROI提升',
    cartRecoveryRate: '购物车挽回率',
    contentCreationEfficiencyIncrease: '内容创作效率提升',
    userEngagementGrowth: '用户参与度增长',
    brandAwarenessIncrease: '品牌认知度提升',
    contentConversionRateGrowth: '内容转化率增长',
    leadQualityIncrease: '销售线索质量提升',
    salesCycleShortened: '销售周期缩短',
    customerRenewalRateIncrease: '客户续费率提升',
    customerSatisfaction: '客户满意度',
    customerAcquisitionCostReduction: '获客成本降低',
    customerValueGrowth: '客户价值增长',
    complianceGuarantee: '合规率保证'
  },
  cta: {
    homeTitle: '准备启动AI营销革命了吗？',
    homeSubtitle: '加入{{companiesCount}}领先企业，体验{{aiDriven}}的营销效果提升',
    companiesCount: '数千家',
    aiDriven: 'AI驱动',
    primaryAction: '立即启动',
    secondaryAction: '联系专家',
    enterpriseTitle: '准备加速您的企业服务增长了吗？',
    enterpriseSubtitle: '加入领先企业服务商，体验B2B营销的智能化升级',
    financialTitle: '准备提升您的金融营销效果了吗？',
    financialSubtitle: '加入领先金融机构，体验合规高效的AI营销',
    ecommerceTitle: '准备提升您的电商营销效果了吗？',
    ecommerceSubtitle: '加入领先电商平台，体验智能化营销的强大威力',
    contentTitle: '准备开启智能内容营销新时代了吗？',
    contentSubtitle: '加入创新品牌行列，体验AI内容营销的无限可能',
    userProfilingTitle: '构建您的用户画像体系',
    userProfilingSubtitle: '深度洞察用户，精准营销决策',
    effectTrackingTitle: '开启实时监控新体验',
    effectTrackingSubtitle: '让数据监控变得简单智能',
    realTimeMonitoringTitle: '开启实时监控新体验',
    realTimeMonitoringSubtitle: '让数据监控变得简单智能'
  },
  common: {
    explore: '探索功能',
    learnMore: '了解更多',
    getStarted: '开始使用',
    demoTitle: '观看演示',
    contactTitle: '联系我���',
    freeTrialTitle: '免费试用',
    scheduleDemo: '预约演示',
    dataResults: '数据驱动的成果',
    dataResultsSubtitle: '真实客户数据验证的营��效果提升',
    threeStepsTitle: '三步启动AI营销引擎',
    dataIntegration: '数据接入',
    dataIntegrationDesc: '连接您的用户数据源，AI自动分析���户行为和偏好',
    intelligentConfiguration: '智能配置',
    intelligentConfigurationDesc: '配置营销场景，AI自动生成个性化营销策略',
    effectOptimization: '效果优化',
    effectOptimizationDesc: '实时监控效果，AI持续优化营销策略',
    coreCapabilities: '核心能力',
    technicalAdvantages: '技术优势',
    applicationScenarios: '实际应用场景',
    systemAvailability: '系统可用性',
    responseTime: '响应时间',
    dailyProcessing: '日��理事件',
    continuousMonitoring: '不间断监控',
    dataLatency: '数据延迟',
    monitoringAccuracy: '监控准确率',
    lastUpdated: '最后更新',
    justNow: '刚刚'
  },
  effectTracking: {
    features: {
      fullTrackingTitle: '全链路追踪',
      fullTrackingDescription: '从用户触点到最终转化，全程跟踪用户��为路径，量化每个环节的效果贡献',
      fullTrackingBenefits: [
        '多触点归因分析',
        '转化路径追踪',
        '渠道效果对比',
        '用户旅程可视化'
      ],
      roiCalculationTitle: 'ROI精准计算',
      roiCalculationDescription: '智能计算营销投入产出比，提供多维度的成本效益分析和优化建议',
      roiCalculationBenefits: [
        '投入成本核��',
        '收益精确计算',
        'ROI/ROAS分析',
        '成本优化建议'
      ],
      predictionModelTitle: '效果预测模型',
      predictionModelDescription: '基于历史数据和机器学习算法，预测营销活动的效果趋势和优化空间',
      predictionModelBenefits: [
        '效果趋势预测',
        '季节性分析',
        '增长预测模型',
        '优化策略推荐'
      ],
      multiDimensionTitle: '多维度报表',
      multiDimensionDescription: '提供丰富���可视化报表，支持自定义维度分析和数据钻取分析',
      multiDimensionBenefits: [
        '可视化报表',
        '自定义维度',
        '数据钻取分析',
        '定时报告推送'
      ],
      fullTrackingBenefits: [
        '多触点归因分析',
        '转化路���追踪',
        '渠道��果对比',
        '用户旅程可视化'
      ],
      roiCalculationBenefits: [
        '投入成本核算',
        '收益精确计算',
        'ROI/ROAS分析',
        '成本���化建议'
      ],
      predictionModelBenefits: [
        '效果趋势��测',
        '季节性分析',
        '增长预测模型',
        '优化策略推荐'
      ],
      multiDimensionBenefitsArray: [
        '可视化报表',
        '自定义维度',
        '数据钻取分析',
        '定时报告推送'
      ]
    },
    architecture: {
      title: '技术架构',
      subtitle: '基于大数据和AI的效果追踪平台',
      platformCapacity: '平台能力',
      dailyEvents: '日处理事件',
      dataAccuracy: '数据准确率',
      realTimeResponse: '实时响应',
      roiImprovement: 'ROI提升',
      trackingMetrics: '追踪指标',
      conversionRate: '转化率',
      customerAcquisitionCost: '客户获���成本',
      lifetimeValue: '生命周期价值'
    },
    advantages: {
      title: '量化每一分营销投入',
      subtitle: '让数据驱动您的营销决策',
      benefits: [
        '跨平台数据整合',
        '实时效果监控',
        '智能归因分析',
        '多维度报表分��',
        '预测洞察',
        '自动化报告生成'
      ],
      ctaStart: '立即开始追踪',
      ctaDemo: '预约产品演示'
    }
  },
  modal: {
    aiMarketingDemo: '观看AI智能营销演示',
    aiMarketingDemoDesc: '预约产品演示，了解AI智能营销如何帮助您实现精准获客和高效转化。',
    enterpriseDemo: '观看企业服务解决方案演示',
    enterpriseDemoDesc: '预约产品演示，了解我们如何帮助���的企业实现B2B营销智能化升级。',
    financialDemo: '观看金融营销解决方案演示',
    financialDemoDesc: '预约产品演示，深入了解我们的金融营销解决方案如何帮助您实现合规的精准营销。',
    ecommerceDemo: '观看电商营销解决方案演示',
    ecommerceDemoDesc: '预约演示，了解AI如何帮助电商平台提升转化率、减少购物车放弃、增强用户留存。',
    contentDemo: '观看内容营销解决方案演示',
    contentDemoDesc: '预约���示，了解AI如何帮助您实现智能化内容创作、精准投放和效果分析。',
    userProfilingDemo: '查看用户画像分析演示',
    userProfilingDemoDesc: '预约演示，了解如何���过深度用户行为分析实现精准营销和个性化推荐。',
    effectTrackingDemo: '查看效果追踪报���演示',
    effectTrackingDemoDesc: '预约演示，查看真实的效果追踪报表和数据���析结果。',
    effectTrackingProductDemo: '预约效果追踪产品演示',
    effectTrackingProductDemoDesc: '预约产品演示��看看我们如何帮助您实现数据驱动的营销决策。',
    realTimeMonitoringDemo: '查看实时监控大屏',
    realTimeMonitoringDemoDesc: '预约演示实时监控大屏，体验专业的营销数据监控和分��功能。',
    contactTitle: '联系我们',
    contactDesc: '请填写您的信息和需求，我们将尽快与您联系，为您提供专业的AI营销解决方案咨询。',
    aiMarketingExpert: '联系AI营销专家',
    aiMarketingExpertDesc: '与我们的AI营销专家一对一沟通，获取个性化的智能营销解决方案和专业建议。',
    enterpriseExpert: '联系企业服务专家',
    enterpriseExpertDesc: '与我们的B2B营销专家沟通，为您的企业定制专业的解决方��。',
    financialExpert: '联系金融营销专家',
    financialExpertDesc: '与我们的金融营销专家沟通，为您的金融机构定制专业的合规营销解决方案。',
    ecommerceExpert: '联系电商营销专家',
    ecommerceExpertDesc: '与我们的电商营销专家沟通，为您的电商平台定制专业的智能��销解决方案。',
    contentExpert: '联系内容营销专家',
    contentExpertDesc: '与我们的内容营销专家沟通，为您的品牌定制专业的AI内容营销解决方案。'
  },
  realTimeMonitoring: {
    architectureTitle: '监控指标体系',
    architectureSubtitle: '全面覆盖��销活动的各个维度',
    alertTitle: '智能预警机制',
    alertSubtitle: '主动发现问题，快速���应处理',
    autoResponseStrategy: '自动响应策略',
    instantNotification: '即时通知',
    technicalFeaturesTitle: '技术特性',
    technicalFeaturesDesc: '基于先进的流式处理技术和机器学习算法，提供毫秒级的实时监控能力',
    monitoringCapabilities: '监控能力',
    dashboardTitle: '实时监控大屏',
    dashboardSubtitle: '一屏掌握全局营销态势',
    activeActivities: '活跃营销活动',
    averageConversion: '平均转化率',
    performanceAbnormal: '性能异常',
    marketingAbnormal: '营销效果异常',
    behaviorAbnormal: '用户行为异常',
    businessAbnormal: '业务指标异常'
  },
  aiMarketing: {
    smartGeneration: '智能内容生成',
    smartGenerationDesc: '基于用户画像和行为数据，AI自动生成个性化营销文案、邮件内容和推荐策略',
    preciseTriggering: '精准场景触发',
    preciseTriggeringDesc: '智能识别用户行为模式，在最���时机触发营销动作，提升转化效果',
    autoOptimization: '策略自动优化',
    autoOptimizationDesc: '实时分析营销效果，AI自动调整策略参���，持续优化营销效果',
    multiChannelCollab: '多渠道协同',
    multiChannelCollabDesc: '统一管理多个营销渠道，确保用户体验一致性和营销效果最大化',
    coreCapabilitiesSubtitle: 'AI驱动的全方位智能��销解决方案',
    scenarioTitle: '实际应用场景',
    scenarioSubtitle: '真实案例展示AI智能营销的强大能力',
    technicalAdvantagesDesc: '基于先进的机器学习算法和���数据分析技术',
    newEraTitle: '开启AI智能营销新时代',
    newEraSubtitle: '让人工智能为您的营销策略注入强大动力',
    startExperience: '立即开始体验',
    contactExpert: '联系专家咨询',
    cartRecovery: '电商购物车挽回',
    cartRecoveryAI: 'AI分析用户偏好和价格敏感度，生成个性化优惠券',
    newUserWelcome: '新用户��迎序列',
    newUserWelcomeAI: '根据注册渠道定制化欢迎内容和产品推荐',
    memberUpgrade: '会员升级营销',
    memberUpgradeAI: '分析消费行为推送定制化升级方案',
    autoProcess: 'AI自动处理',
    fullTimeOperation: '24/7全天候智能运营',
    millisecondResponse: '毫秒级响应用户行为',
    personalizedContent: '个性化内容生成',
    autoABTest: '自��A/B测试优化',
    dailyMessages: '日��理消息',
    averageImprovement: '平均效���提升'
  },
  footer: {
    description: '专业的AI驱动营销解决方案，助力企业实现营销效果的指数级提升���',
    productFeatures: '产品功能',
    copyright: '© 2024 AI��销平台. 保留所有权利.'
  }
};

// 英��翻译
const enTranslations = {
  nav: {
    platformName: 'AI Marketing Platform',
    productFeatures: 'Product Features',
    solutions: 'Solutions',
    contactUs: 'Contact Us',
    startAI: 'Start AI',
    aiMarketing: 'AI Smart Marketing',
    userProfiling: 'User Profiling',
    realTimeMonitoring: 'Real-time Monitoring',
    effectTracking: 'Effect Tracking',
    ecommerce: 'E-commerce Marketing',
    contentMarketing: 'Content Marketing',
    financialMarketing: 'Financial Marketing',
    enterpriseServices: 'Enterprise Services'
  },
  hero: {
    aiMarketingTitle: 'AI-Driven Future Marketing',
    aiMarketingDescription: 'Through cutting-edge artificial intelligence technology, achieve {{preciseTech}}, {{automation}}, and {{dataDecision}} to help enterprises realize exponential marketing performance improvement',
    preciseTech: 'precise user insights',
    automation: 'automated marketing execution',
    dataDecision: 'data-driven decisions',
    enterpriseTitle: 'Enterprise Services Solutions',
    enterpriseDescription: 'AI marketing solutions tailored for B2B enterprise services, featuring precise customer acquisition, efficient conversion, and customer success management to accelerate business growth',
    financialTitle: 'Financial Marketing Solutions',
    financialDescription: 'AI marketing solutions designed for the financial industry, ensuring compliance, security, precise customer acquisition, and enhanced customer value for digital transformation',
    ecommerceTitle: 'E-commerce Marketing Solutions',
    ecommerceDescription: 'AI-powered marketing solutions designed for e-commerce platforms, improving conversion rates, reducing cart abandonment, and enhancing user retention for sustainable business growth',
    contentTitle: 'Content Marketing Solutions',
    contentDescription: 'AI-driven content marketing solutions that automatically generate high-quality content, enable precise distribution, and enhance brand influence and user engagement',
    userProfilingTitle: 'User Profiling Analysis',
    userProfilingDescription: 'In-depth user behavior analysis to precisely understand user needs and preferences, building comprehensive user profiles for data-driven precision marketing',
    effectTrackingTitle: 'Effect Tracking',
    effectTrackingDescription: 'Full-funnel effect tracking, quantifying marketing ROI and conversion effects, providing precise data analysis and optimization recommendations for measurable investments',
    realTimeMonitoringTitle: 'Real-time Monitoring Center',
    realTimeMonitoringDescription: 'Real-time monitoring of marketing campaign performance, intelligent anomaly detection and alerts, quick strategy adjustments to ensure marketing goal achievement',
    ctaPrimary: 'Experience Now',
    ctaSecondary: 'Watch Demo',
    ctaStartAI: 'Start AI Marketing',
    ctaWatchDemo: 'Watch Product Demo',
    ctaContactExpert: 'Contact Expert',
    ctaFreeTrial: 'Free Trial',
    ctaViewDemo: 'View Demo'
  },
  features: {
    title: 'Core Feature Matrix',
    subtitle: 'Comprehensive AI Marketing Solutions',
    aiMarketingTitle: 'AI Smart Marketing',
    aiMarketingDescription: 'AI-based intelligent marketing scenario configuration with automatic personalized content generation',
    aiMarketingBenefits: {
      contentGeneration: 'Intelligent Content Generation',
      personalization: 'Personalized Recommendations',
      automation: 'Automated Execution'
    },
    userProfilingTitle: 'User Profiling Analysis',
    userProfilingDescription: 'Deep user behavior analysis for precise insights into user needs and preferences',
    userProfilingBenefits: {
      fullProfile: '360° User Profiles',
      behaviorAnalysis: 'Behavior Path Analysis',
      valueSegmentation: 'Value Segmentation'
    },
    realTimeMonitoringTitle: 'Real-time Monitoring Center',
    realTimeMonitoringDescription: 'Real-time monitoring of marketing campaign performance with rapid optimization',
    realTimeMonitoringBenefits: {
      realTimeData: 'Real-time Data Monitoring',
      alerting: 'Anomaly Alerts',
      optimization: 'Performance Optimization'
    },
    effectTrackingTitle: 'Effect Tracking',
    effectTrackingDescription: 'Full-funnel effect tracking to quantify marketing ROI and conversion performance',
    effectTrackingBenefits: {
      funnelAnalysis: 'Conversion Funnel Analysis',
      roiCalculation: 'ROI Calculation',
      multiDimensionReport: 'Multi-dimensional Reports'
    },
    dataDecisionTitle: 'Data-Driven Decisions',
    dataDecisionDescription: 'Marketing decision support system based on big data analytics',
    dataDecisionBenefits: {
      trendPrediction: 'Trend Prediction',
      strategyRecommendation: 'Strategy Recommendations',
      abTesting: 'A/B Testing'
    },
    automationTitle: 'Marketing Automation',
    automationDescription: 'Full-process marketing automation to reduce manual costs and improve efficiency',
    automationBenefits: {
      triggerMarketing: 'Trigger-based Marketing',
      workflow: 'Automated Workflows',
      batchProcessing: 'Batch Processing'
    },
    enterpriseCore: {
      preciseLeadsTitle: 'Precise Lead Acquisition',
      preciseLeadsDescription: 'Intelligently identify high-value potential customers and opportunities based on enterprise profiling and decision-maker analysis',
      salesOptimizationTitle: 'Sales Process Optimization',
      salesOptimizationDescription: 'AI-driven sales process management to improve sales efficiency and deal closing rates',
      customerSuccessTitle: 'Customer Success Management',
      customerSuccessDescription: 'Full lifecycle customer management to improve customer satisfaction and retention rates',
      marketingAnalyticsTitle: 'Marketing Data Analytics',
      marketingAnalyticsDescription: 'Deep analysis of B2B marketing data to understand customer needs and market trends'
    },
    financialCore: {
      complianceTitle: 'Compliance Marketing Management',
      complianceDescription: 'Strictly follow financial regulatory requirements to ensure marketing activity compliance and risk control',
      preciseAcquisitionTitle: 'Precise Customer Acquisition',
      preciseAcquisitionDescription: 'Precisely identify high-value potential customers based on risk models and customer profiles',
      valueEnhancementTitle: 'Customer Value Enhancement',
      valueEnhancementDescription: 'Improve single customer value and customer lifecycle through intelligent recommendations and cross-selling',
      riskControlTitle: 'Risk Control Marketing',
      riskControlDescription: 'Real-time monitoring of marketing risks, fraud prevention, and protection of customer funds'
    },
    // AI Marketing Optimized translations
    aiMarketingOptimized: {
      smartContentGeneration: 'Smart Content Generation',
      smartContentGenerationDesc: 'AI-powered intelligent marketing scenario configuration with automated personalized content generation',
      smartContentGenerationBenefits: {
        naturalLanguageProcessing: 'Natural Language Processing',
        personalizedContent: 'Personalized Content',
        multiLanguageSupport: 'Multi-language Support',
        brandToneAdaptation: 'Brand Tone Adaptation'
      },
      preciseScenarioTriggering: 'Precise Scenario Triggering',
      preciseScenarioTriggeringDesc: 'Intelligently identify user behavior patterns and trigger marketing actions at optimal moments',
      preciseScenarioTriggeringBenefits: {
        behaviorPrediction: 'Behavior Prediction',
        timingOptimization: 'Timing Optimization',
        scenarioAdaptation: 'Scenario Adaptation',
        automaticTriggering: 'Automatic Triggering'
      },
      strategyAutoOptimization: 'Strategy Auto-Optimization',
      strategyAutoOptimizationDesc: 'Real-time analysis of marketing performance with AI auto-adjustment of strategy parameters',
      strategyAutoOptimizationBenefits: {
        effectMonitoring: 'Effect Monitoring',
        parameterTuning: 'Parameter Tuning',
        abTesting: 'A/B Testing',
        strategyEvolution: 'Strategy Evolution'
      },
      multiChannelCollaboration: 'Multi-Channel Collaboration',
      multiChannelCollaborationDesc: 'Unified management of multiple marketing channels ensuring consistent user experience',
      multiChannelCollaborationBenefits: {
        channelIntegration: 'Channel Integration',
        messageUnification: 'Message Unification',
        userJourney: 'User Journey',
        effectAggregation: 'Effect Aggregation'
      },
      ecommerceCartRecovery: 'E-commerce Cart Recovery',
      ecommerceCartRecoveryAI: 'AI analyzes user preferences and price sensitivity to generate personalized coupons',
      ecommerceCartRecoveryResult: 'Conversion rate increased by 45%',
      newUserWelcomeSequence: 'New User Welcome Sequence',
      newUserWelcomeSequenceAI: 'Customized welcome content and product recommendations based on registration channel',
      newUserWelcomeSequenceResult: 'First purchase conversion rate increased by 60%',
      memberUpgradeMarketing: 'Member Upgrade Marketing',
      memberUpgradeMarketingAI: 'Analyze consumption behavior to push customized upgrade plans',
      memberUpgradeMarketingResult: 'Member upgrade rate increased by 35%',
      aiAutoProcessing: 'AI Auto Processing',
      realScenarioTitle: 'Real Application Scenarios',
      realScenarioSubtitle: 'Real cases showcasing the powerful capabilities of AI smart marketing',
      technicalAdvantagesTitle: 'Technical Advantages',
      technicalAdvantagesDesc: 'Based on advanced machine learning algorithms and big data analytics technology',
      systemAvailability: 'System Availability',
      dailyMessageProcessing: 'Daily Message Processing',
      averageEffectImprovement: 'Average Effect Improvement',
      newEraTitle: 'Start the New Era of AI Smart Marketing',
      newEraSubtitle: 'Let artificial intelligence inject powerful momentum into your marketing strategy',
      startExperienceNow: 'Start Experience Now',
      contactExpertConsultation: 'Contact Expert Consultation',
      fullTimeIntelligentOperation: '24/7 Full-time Intelligent Operation',
      millisecondUserResponse: 'Millisecond-level User Response',
      personalizedContentGeneration: 'Personalized Content Generation',
      autoABTestOptimization: 'Auto A/B Test Optimization'
    }
  },
  stats: {
    conversionIncrease: 'Conversion Rate Increase',
    efficiencyIncrease: 'Operational Efficiency Increase',
    costReduction: 'Cost Reduction',
    systemStability: 'System Stability',
    averageConversionIncrease: 'Average Conversion Increase',
    customerRetentionImprovement: 'Customer Retention Growth',
    adROIIncrease: 'Ad ROI Increase',
    cartRecoveryRate: 'Cart Recovery Rate',
    contentCreationEfficiencyIncrease: 'Content Creation Efficiency Increase',
    userEngagementGrowth: 'User Engagement Growth',
    brandAwarenessIncrease: 'Brand Awareness Increase',
    contentConversionRateGrowth: 'Content Conversion Rate Growth',
    leadQualityIncrease: 'Lead Quality Improvement',
    salesCycleShortened: 'Sales Cycle Reduction',
    customerRenewalRateIncrease: 'Customer Renewal Rate Increase',
    customerSatisfaction: 'Customer Satisfaction',
    customerAcquisitionCostReduction: 'Customer Acquisition Cost Reduction',
    customerValueGrowth: 'Customer Value Growth',
    complianceGuarantee: 'Compliance Guarantee'
  },
  cta: {
    homeTitle: 'Ready to Launch the AI Marketing Revolution?',
    homeSubtitle: 'Join {{companiesCount}} leading companies and experience {{aiDriven}} marketing performance improvements',
    companiesCount: 'thousands of',
    aiDriven: 'AI-driven',
    primaryAction: 'Get Started Now',
    secondaryAction: 'Contact Expert',
    enterpriseTitle: 'Ready to Accelerate Your Enterprise Service Growth?',
    enterpriseSubtitle: 'Join leading enterprise service providers and experience intelligent B2B marketing upgrades',
    financialTitle: 'Ready to Enhance Your Financial Marketing Performance?',
    financialSubtitle: 'Join leading financial institutions and experience compliant and efficient AI marketing',
    ecommerceTitle: 'Ready to Boost Your E-commerce Marketing Performance?',
    ecommerceSubtitle: 'Join leading e-commerce platforms and experience the power of intelligent marketing',
    contentTitle: 'Ready to Enter the New Era of Intelligent Content Marketing?',
    contentSubtitle: 'Join innovative brands and experience the unlimited possibilities of AI content marketing',
    userProfilingTitle: 'Build Your User Profiling System',
    userProfilingSubtitle: 'Deep user insights for precision marketing decisions',
    effectTrackingTitle: 'Experience New Real-time Monitoring',
    effectTrackingSubtitle: 'Make data monitoring simple and intelligent',
    realTimeMonitoringTitle: 'Experience New Real-time Monitoring',
    realTimeMonitoringSubtitle: 'Make data monitoring simple and intelligent'
  },
  common: {
    explore: 'Explore Features',
    learnMore: 'Learn More',
    getStarted: 'Get Started',
    demoTitle: 'Watch Demo',
    contactTitle: 'Contact Us',
    freeTrialTitle: 'Free Trial',
    scheduleDemo: 'Schedule Demo',
    dataResults: 'Data-Driven Results',
    dataResultsSubtitle: 'Marketing performance improvements verified by real customer data',
    threeStepsTitle: 'Three Steps to Launch AI Marketing Engine',
    dataIntegration: 'Data Integration',
    dataIntegrationDesc: 'Connect your user data sources, AI automatically analyzes user behavior and preferences',
    intelligentConfiguration: 'Intelligent Configuration',
    intelligentConfigurationDesc: 'Configure marketing scenarios, AI automatically generates personalized marketing strategies',
    effectOptimization: 'Effect Optimization',
    effectOptimizationDesc: 'Real-time monitoring of results, AI continuously optimizes marketing strategies',
    responseTime: 'Response Time'
  },
  effectTracking: {
    features: {
      fullTrackingTitle: 'Full-Chain Tracking',
      fullTrackingDescription: 'Track user behavior paths from touchpoints to final conversion, quantifying the effect contribution of each stage',
      fullTrackingBenefits: [
        'Multi-touchpoint attribution analysis',
        'Conversion path tracking',
        'Channel performance comparison',
        'User journey visualization'
      ],
      roiCalculationTitle: 'Precise ROI Calculation',
      roiCalculationDescription: 'Intelligently calculate marketing input-output ratio, providing multi-dimensional cost-benefit analysis and optimization recommendations',
      roiCalculationBenefits: [
        'Input cost accounting',
        'Accurate revenue calculation',
        'ROI/ROAS analysis',
        'Cost optimization recommendations'
      ],
      predictionModelTitle: 'Effect Prediction Model',
      predictionModelDescription: 'Based on historical data and machine learning algorithms, predict marketing campaign effect trends and optimization opportunities',
      predictionModelBenefits: [
        'Effect trend prediction',
        'Seasonal analysis',
        'Growth prediction models',
        'Optimization strategy recommendations'
      ],
      multiDimensionTitle: 'Multi-dimensional Reports',
      multiDimensionDescription: 'Provide rich visualized reports supporting custom dimension analysis and data drill-down analysis',
      multiDimensionBenefits: [
        'Visualized reports',
        'Custom dimensions',
        'Data drill-down analysis',
        'Scheduled report delivery'
      ],
      fullTrackingBenefits: [
        'Multi-touchpoint attribution analysis',
        'Conversion path tracking',
        'Channel performance comparison',
        'User journey visualization'
      ],
      roiCalculationBenefits: [
        'Input cost accounting',
        'Accurate revenue calculation',
        'ROI/ROAS analysis',
        'Cost optimization recommendations'
      ],
      predictionModelBenefits: [
        'Effect trend prediction',
        'Seasonal analysis',
        'Growth prediction models',
        'Optimization strategy recommendations'
      ]
    },
    architecture: {
      title: 'Technical Architecture',
      subtitle: 'Effect tracking platform based on big data and AI',
      platformCapacity: 'Platform Capacity',
      dailyEvents: 'Daily Event Processing',
      dataAccuracy: 'Data Accuracy',
      realTimeResponse: 'Real-time Response',
      roiImprovement: 'ROI Improvement',
      trackingMetrics: 'Tracking Metrics',
      conversionRate: 'Conversion Rate',
      customerAcquisitionCost: 'Customer Acquisition Cost',
      lifetimeValue: 'Lifetime Value'
    },
    advantages: {
      title: 'Quantify Every Marketing Investment',
      subtitle: 'Let data drive your marketing decisions',
      benefits: [
        'Cross-platform data integration',
        'Real-time effect monitoring',
        'Intelligent attribution analysis',
        'Multi-dimensional report analysis',
        'Predictive insights',
        'Automated report generation'
      ],
      ctaStart: 'Start Tracking Now',
      ctaDemo: 'Schedule Product Demo'
    }
  },
  modal: {
    aiMarketingDemo: 'Watch AI Smart Marketing Demo',
    aiMarketingDemoDesc: 'Schedule a product demo to learn how AI smart marketing helps you achieve precise customer acquisition and efficient conversion.',
    enterpriseDemo: 'Watch Enterprise Services Solution Demo',
    enterpriseDemoDesc: 'Schedule a product demo to learn how we help your enterprise achieve B2B marketing intelligence upgrades.',
    financialDemo: 'Watch Financial Marketing Solution Demo',
    financialDemoDesc: 'Schedule a product demo to learn how our financial marketing solutions help you achieve compliant precision marketing.',
    ecommerceDemo: 'Watch E-commerce Marketing Solution Demo',
    ecommerceDemoDesc: 'Schedule a demo to learn how AI helps e-commerce platforms improve conversion rates, reduce cart abandonment, and enhance user retention.',
    contentDemo: 'Watch Content Marketing Solution Demo',
    contentDemoDesc: 'Schedule a demo to learn how AI helps you achieve intelligent content creation, precise distribution, and performance analysis.',
    userProfilingDemo: 'View User Profiling Analysis Demo',
    userProfilingDemoDesc: 'Schedule a demo to learn how to achieve precision marketing and personalized recommendations through deep user behavior analysis.',
    effectTrackingDemo: 'View Effect Tracking Report Demo',
    effectTrackingDemoDesc: 'Schedule a demo to view real effect tracking reports and data analysis results.',
    effectTrackingProductDemo: 'Schedule Effect Tracking Product Demo',
    effectTrackingProductDemoDesc: 'Schedule a product demo to see how we help you achieve data-driven marketing decisions.',
    realTimeMonitoringDemo: 'View Real-time Monitoring Dashboard',
    realTimeMonitoringDemoDesc: 'Schedule a demo of the real-time monitoring dashboard to experience professional marketing data monitoring and analysis features.',
    contactTitle: 'Contact Us',
    contactDesc: 'Please fill in your information and requirements, we will contact you as soon as possible to provide professional AI marketing solution consulting.',
    aiMarketingExpert: 'Contact AI Marketing Expert',
    aiMarketingExpertDesc: 'Communicate one-on-one with our AI marketing experts to get personalized intelligent marketing solutions and professional advice.',
    enterpriseExpert: 'Contact Enterprise Services Expert',
    enterpriseExpertDesc: 'Communicate with our B2B marketing experts to customize professional solutions for your enterprise.',
    financialExpert: 'Contact Financial Marketing Expert',
    financialExpertDesc: 'Communicate with our financial marketing experts to customize professional compliant marketing solutions for your financial institution.',
    ecommerceExpert: 'Contact E-commerce Marketing Expert',
    ecommerceExpertDesc: 'Communicate with our e-commerce marketing experts to customize professional intelligent marketing solutions for your e-commerce platform.',
    contentExpert: 'Contact Content Marketing Expert',
    contentExpertDesc: 'Communicate with our content marketing experts to customize professional AI content marketing solutions for your brand.'
  },
  footer: {
    description: 'Professional AI-driven marketing solutions helping enterprises achieve exponential marketing performance improvements.',
    productFeatures: 'Product Features',
    copyright: '© 2024 AI Marketing Platform. All rights reserved.'
  }
};

// 日语翻译
const jaTranslations = {
  nav: {
    platformName: 'AIマーケティングプラットフォーム',
    productFeatures: '製品機能',
    solutions: '��リューション',
    contactUs: 'お問い合わせ',
    startAI: 'AI開始',
    aiMarketing: 'AIスマートマーケティング',
    userProfiling: 'ユーザープロファイリング',
    realTimeMonitoring: 'リアルタイム監視',
    effectTracking: '効果追跡',
    ecommerce: 'Eコマースマーケティング',
    contentMarketing: 'コンテンツマーケティング',
    financialMarketing: '金融マーケティ��グ',
    enterpriseServices: 'エンタープライズサービス'
  },
  hero: {
    aiMarketingTitle: 'AI主導の未来マーケティング',
    aiMarketingDescription: '最先端の人工知能技術により、{{preciseTech}}、{{automation}}、{{dataDecision}}を実現し、企業のマーケティング効果の指数的向上を支援',
    preciseTech: '精密なユーザー洞察',
    automation: '自動化マーケティング実行',
    dataDecision: 'データ主導の意思決定',
    enterpriseTitle: 'エンタープライズサービスソリューション',
    enterpriseDescription: 'B2Bエンタープライズサービス向けのAIマーケティングソリューション、精密な顧客獲得��効率的な変換、顧客成功管理でビジネス成長を加速',
    financialTitle: '金融マーケティングソリューショ���',
    financialDescription: '金融業界向けのAIマーケ���ィングソリューション、コンプライアンス、セキュリティ、精密な顧客獲得、顧客価値向上でデジタル変��を支援',
    ecommerceTitle: 'Eコマースマーケティングソリューション',
    ecommerceDescription: 'Eコマースプラット��ォーム向けのAI搭載マーケティングソリューション、コンバージョ���率向上、カート放棄削減、ユーザー維持強化で持続的な成長を実現',
    contentTitle: 'コンテンツマーケティングソリューション',
    contentDescription: 'AI主導のコンテンツマーケティングソリューション、高品質コンテンツの自動生成、精密配信、ブランド影響力とユーザーエンゲージメント向上',
    userProfilingTitle: 'ユーザープロファイリング分析',
    userProfilingDescription: '深層ユーザー行動分析でユーザーニーズと嗜好を精密に理解し、包括的なユーザープロファイルを構築してデータ主導の精密マーケティングを実現',
    effectTrackingTitle: '��果追跡',
    effectTrackingDescription: 'フルファネル効果追跡でマーケティングROIとコンバージョン効果を定量化し、精密な��ータ分析と最適化推奨で投資の測定可能��を実現',
    realTimeMonitoringTitle: 'リアルタイム監視センター',
    realTimeMonitoringDescription: 'マーケティング���ャンペーンのリアルタイム監視、インテリジェント異常検知とアラート、迅速な戦略調整��マーケティング目標達成を��保',
    ctaPrimary: '今すぐ体験',
    ctaSecondary: 'デモを見る',
    ctaStartAI: 'AIマーケティング開始',
    ctaWatchDemo: '製品デモを見る',
    ctaContactExpert: '専門家に相談',
    ctaFreeTrial: '無料試用',
    ctaViewDemo: 'デモを見る'
  },
  features: {
    title: 'コア機能マトリックス',
    subtitle: '包括的なAIマーケティングソリューション',
    aiMarketingTitle: 'AIスマートマーケティング',
    aiMarketingDescription: 'AIベースのインテリジェントマー���ティングシナリオ設定とパーソナライズコンテンツの自動生成',
    aiMarketingBenefits: {
      contentGeneration: 'インテリジェントコンテンツ生成',
      personalization: 'パーソ��ライズ推奨',
      automation: '自動化実行'
    },
    userProfilingTitle: 'ユーザープロファイリング分析',
    userProfilingDescription: 'ユー���ーニーズと嗜好の精密洞察のための���層ユーザー行動分析',
    userProfilingBenefits: {
      fullProfile: '360°ユーザープロファイル',
      behaviorAnalysis: '行動パス分析',
      valueSegmentation: '価値セグメンテーション'
    },
    realTimeMonitoringTitle: 'リアルタイム監視センター',
    realTimeMonitoringDescription: 'マーケティングキャンペーンのリアルタイム監視と迅速最適化',
    realTimeMonitoringBenefits: {
      realTimeData: 'リアルタイムデータ監視',
      alerting: '異常アラート',
      optimization: '��フォーマン��最適化'
    },
    effectTrackingTitle: '効果追跡',
    effectTrackingDescription: 'マーケティングROIとコンバージョンパフォーマンスを定量化するフルファネル効果追跡',
    effectTrackingBenefits: {
      funnelAnalysis: 'コンバ��ジョンファネル分析',
      roiCalculation: 'ROI計算',
      multiDimensionReport: '多次元レポート'
    },
    dataDecisionTitle: 'データ主導の意思決定',
    dataDecisionDescription: 'ビッグデータ分析に基づくマーケティング意思決定支援システム',
    dataDecisionBenefits: {
      trendPrediction: 'トレンド予測',
      strategyRecommendation: '戦略推奨',
      abTesting: 'A/Bテスト'
    },
    automationTitle: 'マーケティング自動化',
    automationDescription: '人的コスト削減と効率向上のためのフルプロセスマーケティング自動化',
    automationBenefits: {
      triggerMarketing: 'トリガーベースマーケティング',
      workflow: '自動化ワークフロー',
      batchProcessing: 'バッチ処理'
    },
    enterpriseCore: {
      preciseLeadsTitle: '精密なリード獲得',
      preciseLeadsDescription: '企業プロファイリングと意思決定者分析に基づき、高価値な潜在顧客と商機をインテリジェントに識別',
      salesOptimizationTitle: '販売プロセス最適化',
      salesOptimizationDescription: 'AI駆動の販売プロセス管理で販売効率と成約率を向上',
      customerSuccessTitle: '顧客成功管理',
      customerSuccessDescription: 'フルライフサイクル顧客管理で顧客満足度と維持率を向上',
      marketingAnalyticsTitle: 'マーケティングデータ分析',
      marketingAnalyticsDescription: 'B2B��ーケティングデータの深層分析で顧客ニーズと市場トレンドを洞察'
    },
    financialCore: {
      complianceTitle: 'コンプライアンスマーケテ��ング管理',
      complianceDescription: '���融規制要件を厳格に遵守し、マーケティング活動のコンプライアンスとリスク制御を確保',
      preciseAcquisitionTitle: '精密な顧客獲得',
      preciseAcquisitionDescription: 'リスクモデルと顧客プロファイルに基づき、高価値潜在顧客を精密に識別',
      valueEnhancementTitle: '顧客価値向上',
      valueEnhancementDescription: 'インテリジェント推薦とクロ��セールにより、単一顧客価値と顧客ライフサイクルを向上',
      riskControlTitle: 'リスク制御マーケティング',
      riskControlDescription: 'マーケティングリスクのリアルタイム監視、詐欺防止、顧客資金保護'
    }
  },
  stats: {
    conversionIncrease: 'コンバージョン率向上',
    efficiencyIncrease: '運用効率向上',
    costReduction: 'コスト削減',
    systemStability: 'システム安定性',
    averageConversionIncrease: '平均コンバージョン向上',
    customerRetentionImprovement: '顧客維持率向上',
    adROIIncrease: '広告ROI��上',
    cartRecoveryRate: 'カート回復率',
    contentCreationEfficiencyIncrease: 'コンテンツ作成効率向上',
    userEngagementGrowth: 'ユーザーエンゲージメント向上',
    brandAwarenessIncrease: 'ブランド認知度向上',
    contentConversionRateGrowth: 'コンテンツコンバージョン率向上',
    leadQualityIncrease: 'リード品質向上',
    salesCycleShortened: '販売サイクル短縮',
    customerRenewalRateIncrease: '顧客更新率向上',
    customerSatisfaction: '顧客満足度',
    customerAcquisitionCostReduction: '顧客獲得コスト削減',
    customerValueGrowth: '顧客価値向上',
    complianceGuarantee: 'コンプライアンス保証'
  },
  cta: {
    homeTitle: 'AIマーケティング革命の開始準備はできましたか？',
    homeSubtitle: '{{companiesCount}}の先進企業に参加し、{{aiDriven}}のマーケティング効果向上を体験',
    companiesCount: '数千の',
    aiDriven: 'AI主導',
    primaryAction: '今すぐ開始',
    secondaryAction: '専門家に相談',
    enterpriseTitle: 'エンタープライズサービス成長の加速準備はできましたか？',
    enterpriseSubtitle: '先進エンタープライズサービス提供者に参加し、インテリジェントB2Bマ���ケティング��ッ��グレードを体験',
    financialTitle: '金融マーケティング効果の向上準備はできましたか？',
    financialSubtitle: '先進金融機関��参加し、コンプライアント効���的なAIマーケティングを体験',
    ecommerceTitle: 'Eコマースマーケティング効果の向上準備はできましたか？',
    ecommerceSubtitle: '先進Eコマースプラットフォームに参加し、インテリジェントマーケティングの強���な力を体験',
    contentTitle: 'インテリジェントコンテンツマーケティング新時代の開始準備はできましたか？',
    contentSubtitle: '���新的ブランドに参加し、AIコンテンツマーケティングの無限の可能性を体験',
    userProfilingTitle: 'ユーザープロファイリングシステムの構築',
    userProfilingSubtitle: '深��ユーザー洞察で精密マーケティング意思決定',
    effectTrackingTitle: '新しいリアルタイム監視体験',
    effectTrackingSubtitle: 'データ監視をシンプルでインテリジェントに',
    realTimeMonitoringTitle: '新しい���ア��タイム監視体験',
    realTimeMonitoringSubtitle: 'データ監視をシンプルでインテリジェントに'
  },
  common: {
    explore: '機能を探索',
    learnMore: '詳細を学ぶ',
    getStarted: '開始',
    demoTitle: 'デモを見る',
    contactTitle: 'お問い合わせ',
    freeTrialTitle: '無料試用',
    scheduleDemo: 'デ�����予約',
    dataResults: 'データ主導の結果',
    dataResultsSubtitle: '実際の顧客データで検証されたマーケティング効果向上',
    threeStepsTitle: 'AIマーケティングエンジン開始の3ステップ',
    dataIntegration: 'デー���統合',
    dataIntegrationDesc: 'ユーザーデータソースを接続し、AIが自動的にユーザー行動と嗜好を分析',
    intelligentConfiguration: 'インテ���ジェント設定',
    intelligentConfigurationDesc: 'マーケティングシナリオを設定し、AIが自動的にパーソナライズマーケティ��グ戦略を生成',
    effectOptimization: '効果最適化',
    effectOptimizationDesc: 'リアルタイム結果監視、AIが継続的にマーケティング戦略を最適化'
  },
  effectTracking: {
    features: {
      fullTrackingTitle: 'フルチェーン追跡',
      fullTrackingDescription: 'ユーザータッチポイントか��最終コンバージョンまで、ユーザー行動パスを全程追跡し、各段階の効果貢献を定量���',
      fullTrackingBenefits: [
        'マルチタッチポイント帰属分析',
        'コンバージョンパス追跡',
        'チャネル効果比較',
        'ユーザージャーニー可視化'
      ],
      roiCalculationTitle: 'ROI精密計算',
      roiCalculationDescription: 'マーケティング投入産出比をインテリジェント計算、多次元コスト効益分析と最適化推奨を提供',
      roiCalculationBenefits: [
        '投入コスト算定',
        '収益精確計算',
        'ROI/ROAS分析',
        'コスト最適化推奨'
      ],
      predictionModelTitle: '効果予測モデル',
      predictionModelDescription: '歴史データと機械学習アルゴリズムに基づき、マーケティング活動の効果トレンドと最適化スペースを予測',
      predictionModelBenefits: [
        '効果トレンド予測',
        '季節性分析',
        '成長予測モデル',
        '最適化戦略推奨'
      ],
      multiDimensionTitle: '多次元レポート',
      multiDimensionDescription: '豊富な可視化レポートを提供、カスタム次元分析とデータドリルダウン分析をサポ���ト',
      multiDimensionBenefits: [
        '可視化レポート',
        'カスタム次元',
        'データドリルダウン分析',
        '定時レポート配信'
      ],
      fullTrackingBenefits: [
        'マルチタッチポイント帰属分析',
        'コンバージョンパス追跡',
        '��ャネル効果��較',
        'ユーザージャーニー可視化'
      ],
      roiCalculationBenefits: [
        '投入コスト算定',
        '収益精確計算',
        'ROI/ROAS分析',
        'コ��ト最適化推奨'
      ],
      predictionModelBenefits: [
        '効果トレンド予測',
        '季節性分析',
        '成長予測モデル',
        '最適化戦略推奨'
      ]
    },
    architecture: {
      title: '技術��ーキテクチャ',
      subtitle: 'ビッグデータとAIに基づく効果追跡プラットフォーム',
      platformCapacity: 'プラットフォーム能力',
      dailyEvents: '日次イベント処理',
      dataAccuracy: 'データ精度',
      realTimeResponse: 'リアルタイム応答',
      roiImprovement: 'ROI向上',
      trackingMetrics: '追跡指標',
      conversionRate: 'コンバージョン率',
      customerAcquisitionCost: '顧客獲得コスト',
      lifetimeValue: '��イフタイム価値'
    },
    advantages: {
      title: 'マーケティング投���の全定��化',
      subtitle: 'データがマーケティング決定を駆動',
      benefits: [
        'クロスプラットフォームデータ統合',
        'リアルタイム効果監視',
        'イン��リジェント帰属分析',
        '多次元レポート分析',
        '予測洞察',
        '自動化レポート生成'
      ],
      ctaStart: '追跡を今すぐ開始',
      ctaDemo: '製品デモ予約'
    }
  },
  modal: {
    aiMarketingDemo: 'AIスマートマーケティングデモを見る',
    aiMarketingDemoDesc: '製品デモを予約し、AIスマートマーケティングが精密な顧客獲得と効率的なコンバージョンの実現をどの���うに支援するかを学びます。',
    enterpriseDemo: 'エンタープライズサービスソリューションデモを見る',
    enterpriseDemoDesc: '製品デモを予約し、企業のB2Bマーケティングインテリジェンスアップグレードの実現支援方法を学びます。',
    financialDemo: '金融マーケティング��リューションデモを見る',
    financialDemoDesc: '製品デモを予約し、金融マーケティングソリューションがコンプライアント���密マーケティングの実現をどのように支援するかを��しく学びます。',
    ecommerceDemo: 'Eコマースマーケティングソリューションデモを見る',
    ecommerceDemoDesc: 'デモを予約し、AIがEコマースプラットフォームのコンバージョ��率向上、カート放棄削減、ユー��ー維持強化をどのように支援するかを学びます。',
    contentDemo: 'コンテンツマーケティングソリューションデモを見る',
    contentDemoDesc: 'デモを予約し、AIがインテリジェントコンテンツ作成、精密配信、効果分析の実現をどのように支援するかを学びます。',
    userProfilingDemo: 'ユーザープロファイリング分析デモを見る',
    userProfilingDemoDesc: 'デモを予約し、深層ユーザー行動分析による精密マーケティングとパーソナライズ推奨の実現方法を学びます。',
    effectTrackingDemo: '効果追跡レポートデモを見る',
    effectTrackingDemoDesc: 'デモを予約し、実際の効果追跡レポートとデータ分析結果を確認します。',
    effectTrackingProductDemo: '効果追跡製品デモ予約',
    effectTrackingProductDemoDesc: '製品デモを予約し、データ駆動マーケティング決定の実��支援方法をご覧ください。',
    realTimeMonitoringDemo: 'リアルタイム���視ダッシュボードを見る',
    realTimeMonitoringDemoDesc: 'リアルタイム監視ダッシュボードのデモを予約し、プロフェッショナルなマーケティングデータ���視と分析機能を体験します。',
    contactTitle: 'お問い合わせ',
    contactDesc: '情報と要件をご記入ください。できるだけ早くご連絡し、プロフェッショナルなAI��ーケティングソリューションコンサルティングを提供いたします。',
    aiMarketingExpert: 'AIマーケティング専門家に相談',
    aiMarketingExpertDesc: 'AIマーケティング専門家と1対1でコミュニケーションし、パーソナライ��されたインテリジェントマーケティングソリューションとプロフェッショナルなアドバイスを取得します��',
    enterpriseExpert: 'エンタープライズサービス専門家に相談',
    enterpriseExpertDesc: 'B2Bマーケティング専門家とコミュニケーションし、企業向けのプロフェッショナルソリューションをカスタマイズします。',
    financialExpert: '金融マーケティング専門家に相談',
    financialExpertDesc: '金融マーケティング専門家とコミュニケーションし、金融��関向けのプロフェッショナルコンプライアントマーケティングソリューションをカスタマイズします。',
    ecommerceExpert: 'Eコマースマーケティング専門家に相談',
    ecommerceExpertDesc: 'Eコマースマーケティング専門家とコミュニケーションし、Eコマースプラットフォーム向けのプロフェッショナルインテリジェントマーケティングソリ��ーションをカスタマイズします。',
    contentExpert: 'コンテンツマーケティング専門家に相談',
    contentExpertDesc: 'コンテンツマーケティング専門家とコミュニケーションし、ブランド向けのプロフェッショナルAIコン��ンツマーケティングソリューションをカスタマイズします。'
  },
  footer: {
    description: 'プロフェッ���ョナルなAI駆動マーケティングソリューション、企業のマーケティング効果の指数的向上を支援。',
    productFeatures: '製品機能',
    copyright: '© 2024 AIマーケティングプラットフ��ーム. 全著作権所有.'
  }
};

// 法语翻译
const frTranslations = {
  nav: {
    platformName: 'Plateforme Marketing IA',
    productFeatures: 'Fonctionnalités',
    solutions: 'Solutions',
    contactUs: 'Nous Contacter',
    startAI: 'Démarrer IA',
    aiMarketing: 'Marketing IA Intelligent',
    userProfiling: 'Profilage Utilisateur',
    realTimeMonitoring: 'Surveillance Temps Réel',
    effectTracking: 'Suivi d\'Efficacité',
    ecommerce: 'Marketing E-commerce',
    contentMarketing: 'Marketing de Contenu',
    financialMarketing: 'Marketing Financier',
    enterpriseServices: 'Services Entreprise'
  },
  hero: {
    aiMarketingTitle: 'Marketing Futur Piloté par IA',
    aiMarketingDescription: 'Grâce à la technologie d\'intelligence artificielle de pointe, réalisez {{preciseTech}}, {{automation}} et {{dataDecision}} pour aider les entreprises à atteindre une amélioration exponentielle des performances marketing',
    preciseTech: 'des insights utilisateur précis',
    automation: 'l\'exécution marketing automatisée',
    dataDecision: 'les décisions basées sur les données',
    enterpriseTitle: 'Solutions Services Entreprise',
    enterpriseDescription: 'Solutions marketing IA conçues pour les services d\'entreprise B2B, offrant acquisition précise de clients, conversion efficace et gestion du succès client pour accélérer la croissance',
    financialTitle: 'Solutions Marketing Financier',
    financialDescription: 'Solutions marketing IA conçues pour l\'industrie financière, garantissant conformit��, sécurité, acquisition précise de clients et amélioration de la valeur client pour la transformation numérique',
    ecommerceTitle: 'Solutions Marketing E-commerce',
    ecommerceDescription: 'Solutions marketing alimentées par IA conçues pour les plateformes e-commerce, améliorant les taux de conversion, réduisant l\'abandon de panier et renforçant la rétention utilisateur pour une croissance durable',
    contentTitle: 'Solutions Marketing de Contenu',
    contentDescription: 'Solutions marketing de contenu pilotées par IA qui génèrent automatiquement du contenu de haute qualité, permettent une distribution précise et améliorent l\'influence de marque et l\'engagement utilisateur',
    userProfilingTitle: 'Analyse de Profilage Utilisateur',
    userProfilingDescription: 'Analyse approfondie du comportement utilisateur pour comprendre précisément les besoins et préférences des utilisateurs, construisant des profils utilisateur complets pour un marketing de précision basé sur les données',
    effectTrackingTitle: 'Suivi d\'Efficacité',
    effectTrackingDescription: 'Suivi d\'efficacité full-funnel quantifiant le ROI marketing et les effets de conversion, fournissant une analyse de données précise et des recommandations d\'optimisation pour des investissements mesurables',
    realTimeMonitoringTitle: 'Centre de Surveillance Temps Réel',
    realTimeMonitoringDescription: 'Surveillance en temps r��el des performances de campagne marketing, détection intelligente d\'anomalies et alertes, ajustements stratégiques rapides pour garantir l\'atteinte des objectifs marketing',
    ctaPrimary: 'Expérience Maintenant',
    ctaSecondary: 'Voir Démo',
    ctaStartAI: 'Démarrer Marketing IA',
    ctaWatchDemo: 'Voir Démo Produit',
    ctaContactExpert: 'Contacter Expert',
    ctaFreeTrial: 'Essai Gratuit',
    ctaViewDemo: 'Voir Démo'
  },
  features: {
    title: 'Matrice de Fonctionnalités Cœur',
    subtitle: 'Solutions Marketing IA Complètes',
    aiMarketingTitle: 'Marketing IA Intelligent',
    aiMarketingDescription: 'Configuration de scénarios marketing intelligents basés sur IA avec génération automatique de contenu personnalisé',
    aiMarketingBenefits: {
      contentGeneration: 'Génération de Contenu Intelligent',
      personalization: 'Recommandations Personnalisées',
      automation: 'Exécution Automatisée'
    },
    userProfilingTitle: 'Analyse de Profilage Utilisateur',
    userProfilingDescription: 'Analyse approfondie du comportement utilisateur pour des insights précis sur les besoins et préférences des utilisateurs',
    userProfilingBenefits: {
      fullProfile: 'Profils Utilisateur 360°',
      behaviorAnalysis: 'Analyse de Parcours Comportemental',
      valueSegmentation: 'Segmentation de Valeur'
    },
    realTimeMonitoringTitle: 'Centre de Surveillance Temps Réel',
    realTimeMonitoringDescription: 'Surveillance en temps réel des performances de campagne marketing avec optimisation rapide',
    realTimeMonitoringBenefits: {
      realTimeData: 'Surveillance de Données Temps Réel',
      alerting: 'Alertes d\'Anomalie',
      optimization: 'Optimisation de Performance'
    },
    effectTrackingTitle: 'Suivi d\'Efficacité',
    effectTrackingDescription: 'Suivi d\'efficacité full-funnel pour quantifier le ROI marketing et la performance de conversion',
    effectTrackingBenefits: {
      funnelAnalysis: 'Analyse d\'Entonnoir de Conversion',
      roiCalculation: 'Calcul ROI',
      multiDimensionReport: 'Rapports Multi-dimensionnels'
    },
    dataDecisionTitle: 'Décisions Basées sur Données',
    dataDecisionDescription: 'Système de support de décision marketing basé sur l\'analyse de big data',
    dataDecisionBenefits: {
      trendPrediction: 'Prédiction de Tendances',
      strategyRecommendation: 'Recommandations Stratégiques',
      abTesting: 'Tests A/B'
    },
    automationTitle: 'Automatisation Marketing',
    automationDescription: 'Automatisation marketing de processus complet pour réduire les coûts manuels et améliorer l\'efficacité',
    automationBenefits: {
      triggerMarketing: 'Marketing Basé sur Déclencheurs',
      workflow: 'Flux de Travail Automatisés',
      batchProcessing: 'Traitement par Lots'
    },
    enterpriseCore: {
      preciseLeadsTitle: 'Acquisition de Prospects Précise',
      preciseLeadsDescription: 'Identifier intelligemment les clients potentiels de haute valeur et les opportunités basées sur le profilage d\'entreprise et l\'analyse des décideurs',
      salesOptimizationTitle: 'Optimisation du Processus de Vente',
      salesOptimizationDescription: 'Gestion de processus de vente pilotée par IA pour améliorer l\'efficacité des ventes et les taux de clôture',
      customerSuccessTitle: 'Gestion du Succès Client',
      customerSuccessDescription: 'Gestion client cycle de vie complet pour améliorer la satisfaction et les taux de rétention client',
      marketingAnalyticsTitle: 'Analyse de Données Marketing',
      marketingAnalyticsDescription: 'Analyse approfondie des données marketing B2B pour comprendre les besoins clients et les tendances du marché'
    },
    financialCore: {
      complianceTitle: 'Gestion Marketing Conforme',
      complianceDescription: 'Respecter strictement les exigences réglementaires financières pour assurer la conformité des activités marketing et le contrôle des risques',
      preciseAcquisitionTitle: 'Acquisition Client Précise',
      preciseAcquisitionDescription: 'Identifier précisément les clients potentiels de haute valeur basés sur les modèles de risque et les profils clients',
      valueEnhancementTitle: 'Amélioration de la Valeur Client',
      valueEnhancementDescription: 'Améliorer la valeur client unique et le cycle de vie client grâce aux recommandations intelligentes et à la vente croisée',
      riskControlTitle: 'Marketing de Contrôle des Risques',
      riskControlDescription: 'Surveillance en temps réel des risques marketing, prévention de la fraude et protection des fonds clients'
    }
  },
  stats: {
    conversionIncrease: 'Augmentation Taux de Conversion',
    efficiencyIncrease: 'Augmentation Efficacité Opérationnelle',
    costReduction: 'Réduction des Coûts',
    systemStability: 'Stabilité Système',
    averageConversionIncrease: 'Augmentation Conversion Moyenne',
    customerRetentionImprovement: 'Amélioration Rétention Client',
    adROIIncrease: 'Augmentation ROI Publicitaire',
    cartRecoveryRate: 'Taux de Récupération Panier',
    contentCreationEfficiencyIncrease: 'Augmentation Efficacité Création Contenu',
    userEngagementGrowth: 'Croissance Engagement Utilisateur',
    brandAwarenessIncrease: 'Augmentation Notoriét�� Marque',
    contentConversionRateGrowth: 'Croissance Taux Conversion Contenu',
    leadQualityIncrease: 'Amélioration Qualité Prospects',
    salesCycleShortened: 'Réduction Cycle de Vente',
    customerRenewalRateIncrease: 'Augmentation Taux Renouvellement Client',
    customerSatisfaction: 'Satisfaction Client',
    customerAcquisitionCostReduction: 'Réduction Coût Acquisition Client',
    customerValueGrowth: 'Croissance Valeur Client',
    complianceGuarantee: 'Garantie Conformité'
  },
  cta: {
    homeTitle: 'Prêt à Lancer la Révolution Marketing IA ?',
    homeSubtitle: 'Rejoignez {{companiesCount}} entreprises leaders et expérimentez {{aiDriven}} d\'amélioration des performances marketing',
    companiesCount: 'des milliers d\'',
    aiDriven: 'pilotées par IA',
    primaryAction: 'Commencer Maintenant',
    secondaryAction: 'Contacter Expert',
    enterpriseTitle: 'Prêt à Accélérer Votre Croissance de Services Entreprise ?',
    enterpriseSubtitle: 'Rejoignez les fournisseurs de services d\'entreprise leaders et expérimentez les mises à niveau marketing B2B intelligentes',
    financialTitle: 'Prêt à Améliorer Vos Performances Marketing Financier ?',
    financialSubtitle: 'Rejoignez les institutions financières leaders et expérimentez le marketing IA conforme et efficace',
    ecommerceTitle: 'Prêt à Booster Vos Performances Marketing E-commerce ?',
    ecommerceSubtitle: 'Rejoignez les plateformes e-commerce leaders et expérimentez la puissance du marketing intelligent',
    contentTitle: 'Prêt à Entrer dans la Nouvelle Ère du Marketing de Contenu Intelligent ?',
    contentSubtitle: 'Rejoignez les marques innovantes et expérimentez les possibilités illimitées du marketing de contenu IA',
    userProfilingTitle: 'Construire Votre Système de Profilage Utilisateur',
    userProfilingSubtitle: 'Insights utilisateur profonds pour des décisions marketing de précision',
    effectTrackingTitle: 'Expérience Nouvelle Surveillance Temps Réel',
    effectTrackingSubtitle: 'Rendre la surveillance de données simple et intelligente',
    realTimeMonitoringTitle: 'Expérience Nouvelle Surveillance Temps Réel',
    realTimeMonitoringSubtitle: 'Rendre la surveillance de données simple et intelligente'
  },
  common: {
    explore: 'Explorer Fonctionnalités',
    learnMore: 'En Savoir Plus',
    getStarted: 'Commencer',
    demoTitle: 'Voir Démo',
    contactTitle: 'Nous Contacter',
    freeTrialTitle: 'Essai Gratuit',
    scheduleDemo: 'Planifier Démo',
    dataResults: 'Résultats Basés sur Données',
    dataResultsSubtitle: 'Améliorations de performance marketing vérifiées par de vraies données client',
    threeStepsTitle: 'Trois Étapes pour Lancer le Moteur Marketing IA',
    dataIntegration: 'Intégration de Données',
    dataIntegrationDesc: 'Connectez vos sources de données utilisateur, IA analyse automatiquement le comportement et les préférences des utilisateurs',
    intelligentConfiguration: 'Configuration Intelligente',
    intelligentConfigurationDesc: 'Configurez les scénarios marketing, IA génère automatiquement des stratégies marketing personnalisées',
    effectOptimization: 'Optimisation d\'Efficacité',
    effectOptimizationDesc: 'Surveillance des résultats en temps réel, IA optimise continuellement les stratégies marketing'
  },
  effectTracking: {
    features: {
      fullTrackingTitle: 'Suivi Chaîne Complète',
      fullTrackingDescription: 'Suivre les parcours comportementaux utilisateur des points de contact à la conversion finale, quantifiant la contribution d\'effet de chaque étape',
      fullTrackingBenefits: [
        'Analyse d\'attribution multi-points de contact',
        'Suivi du parcours de conversion',
        'Comparaison de performance des canaux',
        'Visualisation du parcours utilisateur'
      ],
      roiCalculationTitle: 'Calcul ROI Précis',
      roiCalculationDescription: 'Calculer intelligemment le ratio entrée-sortie marketing, fournissant une analyse co��t-bénéfice multi-dimensionnelle et des recommandations d\'optimisation',
      roiCalculationBenefits: [
        'Comptabilité des coûts d\'entrée',
        'Calcul précis des revenus',
        'Analyse ROI/ROAS',
        'Recommandations d\'optimisation des coûts'
      ],
      predictionModelTitle: 'Modèle de Prédiction d\'Effet',
      predictionModelDescription: 'Basé sur les données historiques et les algorithmes d\'apprentissage automatique, prédire les tendances d\'effet des campagnes marketing et les opportunités d\'optimisation',
      predictionModelBenefits: [
        'Prédiction des tendances d\'effet',
        'Analyse saisonnière',
        'Modèles de prédiction de croissance',
        'Recommandations de stratégie d\'optimisation'
      ],
      multiDimensionTitle: 'Rapports Multi-dimensionnels',
      multiDimensionDescription: 'Fournir des rapports visualisés riches supportant l\'analyse de dimension personnalisée et l\'analyse de drill-down de données',
      multiDimensionBenefits: [
        'Rapports visualisés',
        'Dimensions personnalisées',
        'Analyse de drill-down de données',
        'Livraison de rapports programmée'
      ],
      fullTrackingBenefits: [
        'Analyse d\'attribution multi-points de contact',
        'Suivi du parcours de conversion',
        'Comparaison de performance des canaux',
        'Visualisation du parcours utilisateur'
      ],
      roiCalculationBenefits: [
        'Comptabilité des coûts d\'entrée',
        'Calcul précis des revenus',
        'Analyse ROI/ROAS',
        'Recommandations d\'optimisation des coûts'
      ],
      predictionModelBenefits: [
        'Prédiction des tendances d\'effet',
        'Analyse saisonnière',
        'Modèles de prédiction de croissance',
        'Recommandations de stratégie d\'optimisation'
      ]
    },
    architecture: {
      title: 'Architecture Technique',
      subtitle: 'Plateforme de suivi d\'effet basée sur big data et IA',
      platformCapacity: 'Capacité de Plateforme',
      dailyEvents: 'Traitement d\'Événements Quotidiens',
      dataAccuracy: 'Précision des Données',
      realTimeResponse: 'Réponse Temps Réel',
      roiImprovement: 'Amélioration ROI',
      trackingMetrics: 'Métriques de Suivi',
      conversionRate: 'Taux de Conversion',
      customerAcquisitionCost: 'Coût d\'Acquisition Client',
      lifetimeValue: 'Valeur Vie'
    },
    advantages: {
      title: 'Quantifier Chaque Investissement Marketing',
      subtitle: 'Laissez les données conduire vos décisions marketing',
      benefits: [
        'Intégration de données cross-plateforme',
        'Surveillance d\'effet temps réel',
        'Analyse d\'attribution intelligente',
        'Analyse de rapport multi-dimensionnel',
        'Insights prédictifs',
        'Gén��ration de rapport automatisée'
      ],
      ctaStart: 'Commencer le Suivi Maintenant',
      ctaDemo: 'Planifier Démo Produit'
    }
  },
  modal: {
    aiMarketingDemo: 'Voir Démo Marketing IA Intelligent',
    aiMarketingDemoDesc: 'Planifiez une démo produit pour apprendre comment le marketing IA intelligent vous aide à réaliser une acquisition client précise et une conversion efficace.',
    enterpriseDemo: 'Voir Démo Solution Services Entreprise',
    enterpriseDemoDesc: 'Planifiez une d��mo produit pour apprendre comment nous aidons votre entreprise à réaliser des mises à niveau d\'intelligence marketing B2B.',
    financialDemo: 'Voir Démo Solution Marketing Financier',
    financialDemoDesc: 'Planifiez une démo produit pour apprendre comment nos solutions marketing financières vous aident à réaliser un marketing de précision conforme.',
    ecommerceDemo: 'Voir Démo Solution Marketing E-commerce',
    ecommerceDemoDesc: 'Planifiez une démo pour apprendre comment IA aide les plateformes e-commerce à améliorer les taux de conversion, réduire l\'abandon de panier et renforcer la rétention utilisateur.',
    contentDemo: 'Voir Démo Solution Marketing de Contenu',
    contentDemoDesc: 'Planifiez une démo pour apprendre comment IA vous aide à réaliser la création de contenu intelligent, la distribution précise et l\'analyse de performance.',
    userProfilingDemo: 'Voir Démo Analyse de Profilage Utilisateur',
    userProfilingDemoDesc: 'Planifiez une démo pour apprendre comment réaliser le marketing de précision et les recommandations personnalisées grâce à l\'analyse approfondie du comportement utilisateur.',
    effectTrackingDemo: 'Voir Démo Rapport de Suivi d\'Efficacité',
    effectTrackingDemoDesc: 'Planifiez une démo pour voir les vrais rapports de suivi d\'efficacité et les résultats d\'analyse de données.',
    effectTrackingProductDemo: 'Planifier Démo Produit de Suivi d\'Efficacité',
    effectTrackingProductDemoDesc: 'Planifiez une démo produit pour voir comment nous vous aidons à réaliser des décisions marketing basées sur les données.',
    realTimeMonitoringDemo: 'Voir Tableau de Bord Surveillance Temps Réel',
    realTimeMonitoringDemoDesc: 'Planifiez une démo du tableau de bord de surveillance temps réel pour expérimenter les fonctionnalités professionnelles de surveillance et d\'analyse de données marketing.',
    contactTitle: 'Nous Contacter',
    contactDesc: 'Veuillez remplir vos informations et exigences, nous vous contacterons dès que possible pour fournir un conseil professionnel en solutions marketing IA.',
    aiMarketingExpert: 'Contacter Expert Marketing IA',
    aiMarketingExpertDesc: 'Communiquez en t��te-à-tête avec nos experts marketing IA pour obtenir des solutions marketing intelligentes personnalisées et des conseils professionnels.',
    enterpriseExpert: 'Contacter Expert Services Entreprise',
    enterpriseExpertDesc: 'Communiquez avec nos experts marketing B2B pour personnaliser des solutions professionnelles pour votre entreprise.',
    financialExpert: 'Contacter Expert Marketing Financier',
    financialExpertDesc: 'Communiquez avec nos experts marketing financiers pour personnaliser des solutions marketing conformes professionnelles pour votre institution financière.',
    ecommerceExpert: 'Contacter Expert Marketing E-commerce',
    ecommerceExpertDesc: 'Communiquez avec nos experts marketing e-commerce pour personnaliser des solutions marketing intelligentes professionnelles pour votre plateforme e-commerce.',
    contentExpert: 'Contacter Expert Marketing de Contenu',
    contentExpertDesc: 'Communiquez avec nos experts marketing de contenu pour personnaliser des solutions marketing de contenu IA professionnelles pour votre marque.'
  },
  footer: {
    description: 'Solutions marketing professionnelles pilotées par IA aidant les entreprises à réaliser des améliorations exponentielles de performance marketing.',
    productFeatures: 'Fonctionnalités Produit',
    copyright: '© 2024 Plateforme Marketing IA. Tous droits réservés.'
  }
};

// 配置i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      zh: { translation: zhTranslations },
      en: { translation: enTranslations },
      ja: { translation: jaTranslations },
      fr: { translation: frTranslations }
    },
    lng: 'zh', // Set default language to Chinese
    fallbackLng: 'zh',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'querystring', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      lookupQuerystring: 'lng'
    }
  });

export default i18n;
