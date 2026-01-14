## 目标
- 按照所提供的信息结构，重构并完善企业级模型的四类资产（Entity/Capability/Rule/Event）的数据结构与UI呈现。
- 强调“业务语义而非DB字段”，保留现有页面交互与风格，确保无编译错误、分页与搜索正常。

## 数据结构调整（TypeScript）
- 新增/完善字段并统一枚举，保留原有 id 作为兼容别名（与新 *_id 同步）。
- Entity：
  - 必填基础：entity_id、name、display_name、description、entity_type(Master|Transaction|Event)、lifecycle（字符串或枚举）、observable。
  - 结构信息：attributes[{name,type,semantic}], primary_key, sensitive_fields[string[]]。
  - 关系信息：relationships[{to_entity_id,type,desc?}], ownership（部门/角色），system_of_record（CRM/ERP等）。
  - 智能相关：writable_by（能力ID数组）、audit_required（布尔）。
- Capability：
  - 基础：capability_id、name、description、category（财务/客服/销售…）。
  - 输入输出：input_entities[string[]]、output_entities[string[]]、side_effects（布尔）。
  - 风险与控制：risk_level(Low|Medium|High)、requires_approval、allowed_agents[string[]]、forbidden_contexts[string[]]。
  - 智能约束：rule_dependencies[string[]]、audit_log（布尔）。
- Rule：
  - 基础：rule_id、name、description、rule_type（合规/财务/SLA）。
  - 约束定义：severity（Info|Attention|Blocking）、scope（Entity|Capability|Agent）、expression（DSL/Natural文本）。
  - 影响范围：constrained_entities[string[]]、constrained_capabilities[string[]]、constrained_agents[string[]]。
  - 执行语义：violation_action（阻断/升级/记录）、override_policy（布尔）。
- Event：
  - 基础：event_id、name、description、source_entity（Entity引用）。
  - 触发：trigger_condition（自然语言）、detection_type（实时/定时）、debounce（秒/毫秒）。
  - 订阅语义：subscribable（布尔）、default_priority（数值或枚举）、allowed_agents[string[]]。
- 枚举与类型：统一 RiskLevel、Severity 扩展（加入 Attention）、DetectionType、EntityType、ViolationAction、Lifecycle。

## Mock 数据与REGISTRY_MAP
- 扩充现有 MOCK_ENTITIES/MOCK_CAPABILITIES/MOCK_RULES/MOCK_EVENTS 以填充新增字段；旧字段与新字段保持一致性（例如 id 与 entity_id 同值）。
- REGISTRY_MAP 不变结构（四类资产集合），但资产元素换为新接口类型。

## UI 展示调整
- 搜索/筛选卡保持当前风格；搜索命中 name/display_name/description。
- 列表表格：保留关键列，避免过宽；将更多细节在抽屉中呈现。
  - Entities 表：名称、类型、展示名、生命周期、被引用概览（保留）；新增：可观察(observable)徽标。
  - Capabilities 表：名称、类别、风险、副作用标记、审批需求、可调用Agent数量概览。
  - Rules 表：名称、类型、severity（含Attention）、scope、是否可override徽标。
  - Events 表：事件名、来源实体、检测类型、订阅标记、优先级。
- 详情抽屉：分区块呈现，与信息结构一一对应。
  - 基础信息：基础字段卡片化展示。
  - 结构信息：attributes 表格（含语义列）、primary_key、高亮 sensitive_fields。
  - 关系信息：关系列表（to_entity、type、desc）、ownership、system_of_record。
  - 智能相关/约束：按资产类型展示 writable_by / rule_dependencies / allowed_agents 等。
- 总览弹窗：按四类资产展示核心关系/约束摘要文案，强调“只读，企业级资产”。
- 按钮区位：保持“查看引用关系总览”在表格 Card 右上角的 header 内。

## 交互与校验
- 搜索重置分页至第一页；切换资产类型重置选中项与分页。
- attributes 表格支持空数组提示；sensitive_fields 高亮；relationships 无数据时显示“—”。
- 防止点击行开启抽屉时误触行内操作：继续使用 stopPropagation。

## 兼容与迁移策略
- 代码内部读写统一使用 *_id；渲染/键值兼容旧 id（过渡期赋值相同）。
- 现有分页、筛选、排序逻辑保持不变；仅命中字段扩展。
- 不引入新库，沿用当前 UI 组件库与样式。

## 验证与验收
- TypeScript 类型通过；页面正常编译无报错。
- 列表与抽屉展示新增字段；分页/搜索/切换资产类型正常。
- 总览弹窗可打开，文案与结构清晰。

## 实施步骤
1. 新增/更新四类接口与枚举；为旧 id 添加别名同步。
2. 扩充 MOCK_* 数据示例，更新 REGISTRY_MAP 引用类型。
3. 更新抽屉详情：按分区块渲染新字段。
4. 更新四张表的列：增删/替换为关键列与徽标。
5. 扩展搜索命中范围与筛选（如实体类型、风险、检测类型）。
6. 自测并修复类型与渲染问题，确保无编译错误。

## 交付标准
- 完整字段模型与UI覆盖所有定义项。
- 与 /users1 风格保持一致（按钮区位已在表格Card右上）。
- 无新增依赖，无文档文件生成。