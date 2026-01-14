## 目标
- 将 /enterprise/registry 完全重构为“企业数字业务建模台”，以 Tab 切换承载 7 大模块：业务对象、行为能力、业务底线、生命周期、业务事件、责任与风险、流程编排。
- 实现可操作的原型：前端内存与可选 localStorage 持久化，支持新增/编辑/删除/查看（CRUD）模拟；严格按业务语义字段设计，避免技术字段干扰。

## 设计原则
- 补充事实，不发明结构：用模板与枚举限制自由度，给出“正确答案范围”。
- 与智能体解耦，但可被安全调用：能力受状态与规则约束；生命周期驱动合法触发。
- 统一视觉与交互：Card 容器、表格 + 分页、右侧抽屉详情、顶部右侧操作区位，与 /users1 保持一致。

## 信息架构（Tab 切换）
- Tabs（顺序固定）：
  1. 业务对象（Entities）
  2. 行为能力（Capabilities）
  3. 业务底线（Rules）
  4. 生命周期（States & Lifecycle）
  5. 业务事件（Events）
  6. 责任与风险（Responsibility & Ownership）
  7. 流程编排（Processes）
- 每个资产型模块（Entities/Capabilities/Rules/Events）包含：搜索筛选、表格、分页、右侧抽屉详情、顶部“新建/总览”按钮、行内编辑/删除。
- 非资产模块（Lifecycle/Responsibility/Processes）包含：说明 + 模板化表单/图形编辑器入口。

## 数据模型（前端原型）
- Entities：{ id, name, description, attributes[{name,type,nullable,description}], relations[{target_entity,relation_type,description}] }
- Capabilities：{ id, name, description, input_entities[], output_entities[], allowed_states[], side_effects }
- Rules：{ id, name, description, applies_to('entity'|'capability'|'state'), condition, severity('blocking'|'warning'|'audit') }
- Events：{ id, name, source('entity'|'state_change'|'rule_violation'), payload }
- Lifecycle：{ entity, states[], transitions[{ from, to, trigger: Capability.id, approval?: boolean, rollback?: boolean }] }
- Processes：{ id, name, start_event, steps[{ type:'capability'|'rule_check', ref }], end_states[] }
- Responsibility：{ target('entity'|'capability'|'process'), business_owner, risk_owner, escalation_policy{ condition, timeline, escalate_to } }

## 交互设计（各 Tab）
- 业务对象：
  - 左侧列表（预置示例 + 新建入口）；右侧抽屉详情分区（基本语义/关键属性/关系）。
  - 新建采用“对象名称 + 业务描述(≥20字)”引导；属性通过业务标签选择（标识/金额/状态/参考/影响结算/风控/合规）。
- 行为能力：
  - 引导式提取：名称、发生条件（自然语言）、涉及对象（多选）、结果影响（状态/金额变化）；内部映射 input/output/allowed_states/side_effects。
- 业务底线：
  - 规则附着在对象/能力上下文中；类型（⛔/⚠/📋）、自然语言描述、影响后果（下拉）生成结构化规则。
- 生命周期：
  - 必须“画图”：使用 React Flow 展示状态节点与转移边；边上配置触发能力、审批、是否可回滚。
- 业务事件：
  - 订阅式创建：当【状态变化】/【规则触发】/【关键字段变化】；生成事件模板（source/payload）。
- 责任与风险：
  - 为对象/能力/流程配置业务负责人、风险负责人与升级策略；列表 + 轻量表单。
- 流程编排：
  - start_event → steps(capability/rule_check) → end_states；可拖拽排序、校验合法性。

## 组件与布局
- 顶部：页面标题 + 说明；Tab 导航条（受控）。
- 每个 Tab：
  - 资产型：SearchCard → TableCard（右上“新建/总览”）→ Pagination → Drawer。
  - 非资产型：说明 Card → 模板化表单/图编辑区入口。
- 重用现有组件：Card/Badge/Button/Select/Input/Sheet/ScrollArea；生命周期图重用 @xyflow/react（在 BusinessModelEditor.tsx 已使用）。

## 状态管理与持久化
- 原型数据存于 useState；提供可选 localStorage 持久化（加载/保存按钮）。
- Tab 切换重置选中项与分页；所有 CRUD 操作即时更新。

## 校验与“正确答案范围”
- 必填校验：对象描述≥20字；规则描述必填；流程至少包含 1 步并以事件启动。
- 下拉/标签枚举：severity、relation_type、allowed_states 等，避免自由文本错误。

## 原型可操作性（CRUD 模拟）
- 资产型模块实现“新建/编辑/删除”三件套，使用最小必填弹窗或行内修改；删除需确认。
- Drawer 展示结构化详情，分区化信息与只读 JSON 预览。

## 生命周期与流程图（React Flow）
- 定义最小节点/边模型：节点=状态；边=转移（含 trigger/approval/rollback）。
- 提供“编辑入口”从 Lifecycle Tab 打开图编辑器（后续可内嵌）。

## 集成与可扩展性
- 保留“查看引用关系总览”按钮，展示跨模块的只读全览。
- 后端接入时，将当前内存操作替换为 API 调用；字段与流程保持一致，无需改动 UI 逻辑。

## 实施步骤
1. 重构页面为 Tab 外壳与 7 个分区；统一头部与操作区位。
2. 为 Entities/Capabilities/Rules/Events 四类实现前端 CRUD 模拟（新增/编辑/删除/查看）。
3. 抽屉详情按分区展示结构化信息；扩展搜索命中与筛选项。
4. 接入 React Flow 的生命周期图示例与配置项（触发能力/审批/回滚）。
5. 添加责任与流程分区的模板化表单/说明与示例数据。
6. 增强引用关系总览的语义展示；
7. 自测编译与交互，确保无错误与一致性。

## 验收标准
- 7 大模块以 Tab 切换完整呈现；资产型模块可进行 CRUD 模拟与详情查看；
- 生命周期以图呈现，边配置合法；规则附着、事件订阅式创建；责任与流程分区可操作或明确入口；
- 编译无错误，交互顺畅，与 /users1 操作区位一致。