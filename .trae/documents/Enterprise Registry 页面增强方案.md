## 目标
- 移除“进入设计模式”按钮，直接在列表顶部展示“新建”按钮，并为每行提供“编辑/删除”操作（UI Mock）。
- “查看引用关系总览”以更大的弹窗展示（全屏/特大宽度），信息密度更高，分区统计。
- 列表增加分页，参考用户画像列表的分页结构与交互（上一页/下一页、显示区间与总数）。
- 深度扩充四类注册表（Entities/Capabilities/Rules/Events）的列表字段与详情字段，体现企业数字框架理念：事实、能力、规则、事件的可复用、可引用关系。

## 参考基线
- 分页参考：[UserList](file:///c:/Users/Administrator/Desktop/CDP/client/pages/UserList.tsx#L672-L699) 的分页结构：
  - 底部展示“Showing X to Y of total”文案
  - 按钮：上一页/下一页；禁用态与 Loading 处理
  - 状态：currentPage、itemsPerPage、totalCount，计算 totalPages

## UI 结构调整
- 顶部：
  - 左侧标题与副标题保留
  - 右侧按钮：
    - 新建（始终可见，UI Mock）
    - 查看引用关系总览（打开更大弹窗）
- 列表区域：
  - 顶部 Tabs：Entities / Capabilities / Rules / Events（保留）
  - 顶部工具栏：搜索框 + 按类型的筛选（风险、严重级别、可订阅）；右侧“新建”按钮（当前 Tab 类型）
  - 表格：信息密度更高的列集，点击行打开右侧抽屉详情
  - 底部分页：与 UserList 一致，支持上一页/下一页、显示区间与总数
- 详情抽屉：右侧抽屉包含“基本信息 + 被引用关系 + JSON 预览（当前 registry_id.json，只读）”
- 引用关系总览弹窗：更大的尺寸（max-w-[90vw] / 全屏），分区卡片展示统计和典型引用路径

## 字段深度扩充（Mock 数据层）
- Entities（企业实体）
  - 列表字段：
    - Name、Type（Core/Master/Transaction/Event）、Description
    - AttributesCount（属性数量）、LifecycleSupport（是否有生命周期语义）
    - ReferencedByModels、ReferencedByAgents（计数）
    - GovernanceOwner（治理责任人/部门）、DataQuality（High/Medium/Low）
  - 详情字段：
    - Attributes（键值与类型、可选枚举）
    - Lifecycle（Prospect/Active/Churned 等定义）
    - Policies（如隐私/保留期/脱敏策略）
    - CrossDomainLinks（与其他实体的语义关系，如 Customer↔Order）

- Capabilities（企业能力）
  - 列表字段：
    - Name、Description、InputEntity、OutputEntity、RiskLevel
    - CallableByAgent（Yes/No）
    - AverageLatency（ms，Mock）、SyncOrAsync（同步/异步）
    - AuditRequired（是否审计）、CostUnit（成本度量单位）
  - 详情字段：
    - Preconditions（调用前置约束）
    - Postconditions（调用后置结果保证）
    - ErrorCatalog（典型错误码/原因）
    - Versioning（能力版本与兼容策略）

- Rules（企业规则）
  - 列表字段：
    - Name、RuleType（合规/财务/风控）、Severity（Info/Blocking）
    - Scope（Enterprise/Entity/Capability/Agent）、ReferencedCount
    - EnforcementMode（实时/离线）、Owner（规则归属）
  - 详情字段：
    - AppliesTo（作用对象 refs）
    - Rationale（设立理由）
    - ViolationExamples（典型违规示例）
    - AuditTrail（近期审计记录，Mock）

- Events（企业事件）
  - 列表字段：
    - Name、TriggerEntity、Condition、SubscribableByAgent
    - DeliverySemantics（AtLeastOnce/ExactlyOnce/BestEffort）
    - TopicName（总线主题）、Retention（保留期）
  - 详情字段：
    - PayloadSchema（字段与类型）
    - Producers（来源模型或系统）
    - Consumers（订阅者模型/Agent）
    - Observability（监控指标：吞吐、失败率，Mock）

## 交互与行为
- 新建/编辑/删除：全部为前端 Mock 的 UI 操作（不落库），用于演示信息架构。
- 行点击：打开抽屉详情，显示扩充字段与只读 JSON 预览（当前 Tab 的 registry_id.json）。
- 过滤与搜索：沿用当前逻辑，新增高级筛选字段时采用 Select/Input 组合。
- 分页：沿用 UserList 模式，管理 currentPage/itemsPerPage/totalCount，底部按钮与显示文案一致。
- 引用关系总览：更大的弹窗，分区展示 Entities/Capabilities/Rules/Events 的统计与关联列表；保留只读定位。

## 技术实现要点
- 类型定义：为扩充字段增加 TypeScript 类型，更新 Mock 数据结构与渲染。
- 组件复用：使用现有 Input、Select、Button、Card、Sheet、Modal（或 Dialog）组件。
- 性能与易用性：列表渲染分页数据；抽屉与总览弹窗懒加载内容；避免一次性渲染全部 Mock。
- 无副作用：所有增删改均停留在前端状态，刷新后不保存。

## 交付项
- 移除设计模式按钮；顶部新增“新建”、行内“编辑/删除”操作（UI）。
- 引用关系总览弹窗改为更大尺寸与分区展示。
- 列表分页与统计，参考用户画像列表实现。
- 四类注册表的字段扩充（列表与详情），Mock 数据与渲染完成。

## 验收
- UI 操作直观，无设计模式开关；列表顶部有新建；行内可编辑/删除（UI）。
- 抽屉详情包含扩充字段与 JSON 预览，说明“只读 · 企业级资产”。
- 分页行为符合用户画像列表体验；引用总览弹窗容量更大。
