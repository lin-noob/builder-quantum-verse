# 企业数字业务模型 (Enterprise Digital Business Model) 结构文档

## 1. 模型概述

本模型旨在构建企业数字业务的 Layer 2 —— **Digital Business Layer**。它不仅仅是数据存储结构，更是业务语义、规则、流程和责任的数字化表达。该模型通过七大核心模块（The 7 Pillars）定义了企业数字业务的全貌，支持系统自动推导风险、控制 Agent 权限以及实现智能化的业务编排。

## 2. 功能结构 (The 7 Pillars)

系统围绕七大核心模块构建，每个模块承载特定的业务语义：

### 2.1 业务对象 (Entities) - *What exists*
定义企业业务中存在的实体。
- **分类管理**：区分主数据 (Master)、交易对象 (Transaction) 和结果对象 (Result)。
- **多维标签**：标记对象在结算、风控、合规及 AI 读写方面的属性。
- **关系定义**：定义对象间的关联关系，构建业务知识图谱。

### 2.2 行为能力 (Capabilities) - *What can happen*
定义业务对象可以执行的操作或发生的行为。
- **场景驱动**：基于具体业务场景（如“客户下单”、“状态变更”）定义能力。
- **影响分析**：明确能力执行后的业务影响（状态、金额、权益、通知），作为风险推导的依据。
- **风险推导**：系统根据业务影响自动推导风险等级 (High/Medium/Low)。

### 2.3 业务底线 (Rules) - *What must not break*
定义业务运行必须遵守的约束和规则。
- **多级管控**：支持禁止 (Blocking)、预警 (Warning) 和审计 (Audit) 三种管控级别。
- **上下文附着**：规则可附着于对象、能力或特定状态上。
- **Agent 约束**：明确规则是否影响智能体 (Agent) 的决策和执行。

### 2.4 生命周期 (Lifecycle) - *When it can happen*
定义业务对象的状态流转逻辑。
- **状态机管理**：可视化的状态流转图，定义节点 (Nodes) 和迁移 (Edges)。
- **迁移控制**：在状态迁移上绑定能力、规则和审批要求。

### 2.5 业务事件 (Events) - *What is worth noticing*
定义值得关注的业务变化，用于触发后续流程或通知。
- **源头追踪**：事件源于状态变化、规则触发或关键字段变更。
- **订阅管理**：控制事件是否允许被 Agent 或外部系统订阅。
- **标准化命名**：系统根据事件源自动生成标准化的事件名称。

### 2.6 责任与风险 (Responsibility) - *Who is accountable*
定义业务的责任归属和风险应对机制。
- **双重责任制**：为关键对象和能力指定业务负责人 (Business Owner) 和风险负责人 (Risk Owner)。
- **升级策略**：定义问题未处理时的自动升级路径（时间阈值、升级对象）。

### 2.7 流程编排 (Processes) - *Allowed orchestration*
定义能力的允许执行顺序。
- **围栏机制**：定义业务允许的执行路径，限制 Agent 的自主决策范围。
- **节点编排**：支持能力执行、规则检查和状态判断节点的编排。

---

## 3. 信息结构 (Information Schema)

基于 TypeScript 类型定义的核心数据结构。

### 3.1 Entity (业务对象)
```typescript
interface Entity {
  id: string;
  name: string;                // 业务对象名称
  display_name: string;        // 显示名称
  type: "Master" | "Transaction" | "Result"; // 对象类型
  description: string;         // 自然语言业务描述
  
  // 业务标签与集成属性
  participates_settlement: boolean; // 是否参与结算
  participates_risk: boolean;       // 是否涉及风控
  participates_compliance: boolean; // 是否涉及合规
  ai_readwrite: boolean;            // AI 是否可读写
  
  attributes: EntityAttribute[];    // 字段属性列表
  relationships: EntityRelationship[]; // 关联关系
  
  // 引用统计
  referencedBy: {
    models: string[];
    agents: string[];
  };
}
```

### 3.2 Capability (行为能力)
```typescript
interface Capability {
  id: string;
  name: string;
  description: string;
  
  // 场景与影响
  scenario: string;            // 业务场景描述
  business_impacts: Array<"状态" | "金额" | "权益" | "记录/通知">;
  risk_level: "High" | "Medium" | "Low"; // 系统推导的风险等级
  
  // 关联实体
  input_entities: string[];    // 输入对象 ID
  output_entities: string[];   // 输出对象 ID
  
  // 约束与控制
  requires_approval: boolean;  // 是否需要审批
  side_effects: boolean;       // 是否有副作用
  allowed_agents: string[];    // 允许调用的 Agent
  rule_dependencies: string[]; // 依赖的规则 ID
}
```

### 3.3 Rule (业务规则)
```typescript
interface Rule {
  id: string;
  code: string;                // 规则编码 (如 R-001)
  name: string;
  description: string;         // 规则逻辑描述
  
  // 类型与范围
  type: "Blocking" | "Warning" | "Audit"; // 规则类型
  scope: "Entity" | "Capability" | "State"; // 作用范围
  
  // 执行动作
  violation_action: "阻断" | "记录" | "上报";
  impactsAgent: boolean;       // 是否影响 Agent
  
  // 上下文
  contextType: string;
  contextId: string;
}
```

### 3.4 Event (业务事件)
```typescript
interface Event {
  id: string;
  code: string;                // 系统生成编码 (如 EVT_ORDER_PAID)
  name: string;                // 系统生成名称
  description: string;
  
  // 事件源
  sourceType: "StateChange" | "RuleTrigger" | "FieldChange";
  sourceContext: {
    entityId: string;
    detailId: string;          // 状态ID / 规则ID / 字段名
  };
  
  // 订阅权限
  subscribable: boolean;
  allowAgentSubscription: boolean;
  allowExternalSubscription: boolean;
}
```

### 3.5 Responsibility (责任矩阵)
```typescript
interface Responsibility {
  id: string;
  target: string;              // 关联的对象/能力/流程 ID
  
  // 责任人
  business_owner: string;      // 业务负责人角色
  risk_owner: string;          // 风险负责人角色
  
  // 升级策略
  escalation_policy: {
    condition: string;
    timeline: string;
    escalate_to: string;
  };
}
```
