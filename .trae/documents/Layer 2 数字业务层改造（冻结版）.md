## 目标
- 按照 Layer 2（冻结版）7 大模块重构企业数字业务建模 UI 与数据结构，做到“补充事实，不发明结构”。
- 模块顺序与语义：业务对象 → 行为能力 → 业务底线 → 生命周期 → 业务事件 → 责任与风险 → 流程编排。
- 与智能体解耦，但可被安全调用；所有字段围绕业务语义而非技术实现。

## 技术基线
- 复用现有 UI 组件库（Card/Badge/Button/Select/Input/Sheet/ScrollArea）。
- 生命周期图使用已存在的 @xyflow/react（见 BusinessModelEditor.tsx）；流程编排参考 ApprovalConfig/WorkflowDiagram.tsx 的交互模式。
- 改造集中在 EnterpriseRegistry.tsx；必要时仅拆出极小的无状态子组件，避免多文件膨胀。

## 数据模型（TypeScript）
- Entities（业务对象）
  - Entity: { id, name, description, attributes: [{ name, type, nullable, description }], relations: [{ target_entity, relation_type }] }
  - 规则：不包含行为；作为其他模块锚点。
- States & Lifecycle（状态与生命周期）
  - Lifecycle: { entity: string, states: string[], transitions: [{ from, to, trigger: Capability.id }] }
- Capabilities（业务能力）
  - Capability: { id, name, description, input_entities: string[], output_entities: string[], allowed_states: string[], side_effects: boolean }
- Rules（业务底线与政策）
  - Rule: { id, name, description, applies_to: ('entity'|'capability'|'state'), condition: string, severity: ('blocking'|'warning'|'audit') }
- Events（业务事件）
  - Event: { id, name, source: ('entity'|'state_change'|'rule_violation'), payload: Record<string, any> }
- Processes（业务流程）
  - Process: { id, name, start_event: Event.id, steps: Array<{ type: 'capability'|'rule_check', ref: string }>, end_states: string[] }
- Responsibility & Ownership（责任语义）
  - Responsibility: { target: ('entity'|'capability'|'process'), business_owner: string, risk_owner: string, escalation_policy: { condition: string, timeline: string, escalate_to: string } }

## Mock 数据
- 以 Customer/Order/Ticket 为例，补全上述字段；Lifecycle 示例含 Created→Paid→Shipped→Completed/Cancelled；
- Capability 示例含 ShipOrder/IssueRefund；Rule 示例含 RefundApprovalBlocking/OrderAmountAudit；Event 示例含 state_change:Order.Paid；Process 示例含 RefundProcess；Responsibility 示例为客服/风控职责与升级策略。

## UI 改造（建模台）
- 页面顶层改为“企业数字业务建模台”，按模块分区展现：
  1. 业务对象（Entities）：
     - 左侧对象列表（预置示例+新增入口）；右侧对象详情分区：基本语义（名称/≥20字描述）、关键属性（属性列表+业务标签）、关系（目标实体/关系类型）。
     - 交互：属性以“业务标签”方式选择（标识/金额/状态/参考/影响结算/风控/合规），避免技术字段；校验描述长度。
  2. 行为能力（Capabilities）：
     - 引导式创建：“在什么情况下，公司会对【对象】做出动作？”模板化收集发生条件（自然语言）、涉及对象（多选）、结果影响（状态/金额变化）。
     - 隐去 input/output 的技术细节，内部映射为 input_entities/output_entities；允许标注 allowed_states 与 side_effects。
  3. 业务底线（Rules）：
     - 仅在对象/能力页面中“附着添加规则”，不漂浮；类型（⛔禁止/⚠预警/📋审计）、自然语言描述、影响后果（下拉）；系统生成结构化 Rule。
  4. 生命周期（Lifecycle）：
     - 必须“画图”而非表单，使用 React Flow 渲染状态节点与有向边；每条边可配置：触发能力（多选）、是否需要审批、是否可回滚。
  5. 业务事件（Events）：
     - 仅允许“订阅式创建”：当【状态变化】/【规则触发】/【关键字段变化】；生成 Event（source 与 payload 模板化）。
  6. 责任与风险（Responsibility）：
     - 责任与升级机制：为对象/能力/流程分别指定业务负责人/风险负责人；配置升级策略（条件、时限、升级到谁）。
  7. 流程编排（Processes）：
     - 合法编排：start_event → steps(capability/rule_check) → end_states；交互参照审批流程组件，支持拖拽排序与校验。

## 交互与校验
- 强引导与正确答案范围：枚举/模板/标签化选择，减少自由输入错误；
- 必填校验：对象描述≥20字；规则描述必填；流程必须以事件启动且包含至少一步；
- 安全调用：能力触发受 allowed_states 与 Rules 约束；生命周期转移仅允许配置能力触发。

## 实施步骤
1. 在 EnterpriseRegistry.tsx 内新增 7 个分区的 UI 外壳与数据模型接口（先内联，保证可运行）。
2. 替换现有“标签式四页”（Entities/Capabilities/Rules/Events）为“分区建模台顺序”，保留列表和抽屉但改为分区内的上下文。
3. 引入 React Flow 渲染生命周期图（复用 BusinessModelEditor.tsx 的使用方式），定义最小节点/边模型与编辑器状态。
4. 将规则的创建入口移动到对象/能力详情中；事件的创建入口限定三类来源；
5. 新增责任分区与流程分区的基础表单与列表，支持模板示例与增删改；
6. 扩充 Mock 数据，确保每个分区有示例可视；
7. 全量自测与编译校验，确保无错误；交互可用后再考虑把内联子组件拆分为独立文件。

## 验收标准
- 7 大模块在同一页面按既定顺序完整呈现，字段与 UI 语义严格符合定义。
- 生命周期以图呈现，可编辑边的触发能力/审批/回滚；规则附着、事件订阅式创建；责任升级策略可配置。
- 无新增外部依赖（复用现有 @xyflow/react），编译无错误，交互自然且可引导用户“填得动、填得对”。
