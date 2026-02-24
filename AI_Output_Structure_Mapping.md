# AI 输出结构与前端展示映射文档

本文档详细说明了 AI 输出的 JSON 结构如何映射到 `SemanticSummaryLayer` 前端组件的各个展示部分。

## 1. 自然语言摘要

*   **JSON 字段**: `natural_language_summary`
*   **前端对应位置**: 
    *   组件顶部区域
    *   **标题**: "自然语言摘要" (FileText 图标)
    *   **展示方式**: 纯文本段落，位于浅灰色背景框内。

## 2. 结构化输出 (Structured Output)

结构化输出被分为四个主要板块展示。

### 2.1 核心意图 (Core Intent)

*   **JSON 路径**: `structured_output.core_intent`
*   **前端对应位置**: "核心意图 (Core Intent)" 板块 (Target 图标)
*   **字段映射**:
    *   `type`: 显示在 "类型 (Type)" 标签旁，作为 Badge 展示。
    *   `sub_type`: 显示在 "子类型 (Sub-type)" 标签旁。
    *   `urgency_signals`: 数组中的每个字符串作为红色的 Badge 显示在 "紧急信号 (Urgency)" 区域。

### 2.2 上下文 (Context)

*   **JSON 路径**: `structured_output.context`
*   **前端对应位置**: "上下文 (Context)" 板块 (History 图标)
*   **字段映射**:
    *   `conversation_stage`: 显示在 "对话阶段" 标签旁。
    *   `thread_position`: 显示在 "邮件位置" 标签旁 (格式化为 "第 N 封")。
    *   `references_history`: 
        *   `true` -> 显示绿色对勾图标 (CheckCircle2)。
        *   `false` -> 显示 "否" Badge。
    *   `unresolved_commitment`: 如果存在，在下方橙色背景框中显示。
        *   `promise`: 显示具体的承诺内容 ("未解决承诺" 标题下)。

### 2.3 实体识别 (Entities)

*   **JSON 路径**: `structured_output.entities`
*   **前端对应位置**: "实体识别 (Entities)" 板块 (Package 图标)，占据两列宽度。
*   **字段映射**:
    *   **订单 (Orders)** (`entities.orders`):
        *   `id`: 粗体显示订单号。
        *   `mentioned_in`: 显示为 "来源: [位置]"。
        *   `customer_claim`: 显示在来源右侧。
    *   **商品 (Products)** (`entities.products`):
        *   `sku`: 粗体显示 SKU。
        *   `description_in_text`: 显示在 SKU 下方作为描述。
    *   **金额 (Monetary)** (`entities.monetary`):
        *   `currency` + `amount`: 组合显示 (如 "CNY 9999")。
        *   `context`: 显示在金额下方。

### 2.4 缺口与矛盾 (Gaps & Inconsistencies)

*   **JSON 路径**: `structured_output.gaps_and_inconsistencies`
*   **前端对应位置**: "缺口与矛盾 (Gaps & Inconsistencies)" 板块 (AlertTriangle 图标)，占据两列宽度。
*   **字段映射**:
    *   **缺失关键信息 (Missing Critical Data)** (`missing_critical_data`):
        *   `field`: 红色粗体显示字段名。
        *   `impact`: 显示在字段名下方，解释影响。
        *   *若数组为空，显示 "无缺失信息"。*
    *   **未验证陈述 (Unverified Claims)** (`unverified_claims`):
        *   `claim`: 棕黄色粗体显示客户陈述内容。
        *   `against_system_record`: 显示为 "vs 系统: [记录值]"。
        *   `status`: 作为 Badge 显示 (如 "inconsistent")。
        *   *若数组为空，显示 "无未验证陈述"。*
    *   **指代消解 (Anaphora To Resolve)** (`anaphora_to_resolve`):
        *   *目前前端组件暂未展示此字段，预留未来扩展。*

## 完整 JSON 结构示例

```json
{
  "natural_language_summary": "一段3-6句话的自然语言描述...",
  "structured_output": {
    "core_intent": {
      "type": "request_change",
      "sub_type": "address_change",
      "urgency_signals": ["紧急", "投诉"]
    },
    "entities": {
      "orders": [
        {
          "id": "ORD-123",
          "mentioned_in": "subject",
          "customer_claim": "not_received"
        }
      ],
      "products": [],
      "monetary": []
    },
    "context": {
      "conversation_stage": "first_contact",
      "thread_position": "1",
      "references_history": false,
      "unresolved_commitment": null
    },
    "gaps_and_inconsistencies": {
      "missing_critical_data": [],
      "unverified_claims": [],
      "anaphora_to_resolve": []
    }
  }
}
```
