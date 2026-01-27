import { KnowledgeNode, KnowledgeNodeType, PropSource, RiskLevel, LifecycleStatus } from "../../types/Knowledge";

export const mockKnowledgeNodes: KnowledgeNode[] = [
  {
    id: "type_customer",
    numericId: 1001,
    name: "Customer",
    type: "Master",
    lifecycleStatus: "active",
    icon: "Users",
    description: "Represents a customer entity in the system, including personal and contact information.",
    stats: {
      inDegree: 5,
      outDegree: 12,
      referenceCount: 150,
      usageFrequency: 85,
    },
    properties: [
      {
        id: "prop_cust_id",
        name: "customerId",
        type: "string",
        source: PropSource.DB_COLUMN,
        sourceLabel: "Database",
        description: "Unique identifier for the customer",
        relatedDbColumn: "cust_id"
      },
      {
        id: "prop_cust_name",
        name: "fullName",
        type: "string",
        source: PropSource.DB_COLUMN,
        sourceLabel: "Database",
        description: "Customer's full name",
        relatedDbColumn: "full_name"
      },
      {
        id: "prop_cust_tier",
        name: "loyaltyTier",
        type: "string",
        source: PropSource.COMPUTED,
        sourceLabel: "Calculated",
        description: "Calculated loyalty tier based on spending",
      }
    ],
    relations: [
      {
        semanticName: "PLACES",
        targetNodeType: "type_order",
        direction: "OUT",
        isMutable: true
      },
      {
        semanticName: "HAS_ADDRESS",
        targetNodeType: "type_address",
        direction: "OUT",
        isMutable: true
      }
    ],
    actions: [
      {
        name: "act_update_profile",
        label: "Update Profile",
        apiEndpoint: "/api/customer/update",
        httpMethod: "PUT",
        riskLevel: "Low",
        conditions: ["is_active"]
      },
      {
        name: "act_delete_customer",
        label: "Delete Customer",
        apiEndpoint: "/api/customer/delete",
        httpMethod: "DELETE",
        riskLevel: "High",
        conditions: ["no_active_orders"]
      }
    ],
    rules: [
      {
        id: "rule_valid_email",
        name: "Email Validation",
        description: "Customer must have a valid email format",
        expression: "regex(email, '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')"
      }
    ],
    attributeCount: 3,
    relationCount: 2,
    actionCount: 2,
    ruleCount: 1
  },
  {
    id: "type_order",
    numericId: 1002,
    name: "Order",
    type: "Transaction",
    lifecycleStatus: "active",
    icon: "ShoppingCart",
    description: "A purchase order placed by a customer.",
    stats: {
      inDegree: 8,
      outDegree: 4,
      referenceCount: 2500,
      usageFrequency: 95,
    },
    properties: [
      {
        id: "prop_order_id",
        name: "orderId",
        type: "string",
        source: PropSource.DB_COLUMN,
        sourceLabel: "Database",
        description: "Unique order ID",
        relatedDbColumn: "order_id"
      },
      {
        id: "prop_order_total",
        name: "totalAmount",
        type: "number",
        source: PropSource.COMPUTED,
        sourceLabel: "Calculated",
        description: "Total sum of order items",
      },
      {
        id: "prop_order_status",
        name: "status",
        type: "string",
        source: PropSource.DB_COLUMN,
        sourceLabel: "Database",
        description: "Current status of the order (e.g. Pending, Shipped)",
        relatedDbColumn: "status"
      }
    ],
    relations: [
      {
        semanticName: "PLACED_BY",
        targetNodeType: "type_customer",
        direction: "IN",
        isMutable: false
      },
      {
        semanticName: "CONTAINS",
        targetNodeType: "type_product",
        direction: "OUT",
        isMutable: true
      }
    ],
    actions: [
      {
        name: "act_cancel_order",
        label: "Cancel Order",
        apiEndpoint: "/api/order/cancel",
        httpMethod: "POST",
        riskLevel: "Mid",
        conditions: ["status == 'Pending'"]
      }
    ],
    rules: [],
    attributeCount: 3,
    relationCount: 2,
    actionCount: 1,
    ruleCount: 0
  },
  {
    id: "type_product",
    numericId: 1003,
    name: "Product",
    type: "Master",
    lifecycleStatus: "active",
    icon: "Package",
    description: "Goods or services available for sale.",
    stats: {
      inDegree: 20,
      outDegree: 2,
      referenceCount: 500,
      usageFrequency: 60,
    },
    properties: [
      {
        id: "prop_prod_sku",
        name: "sku",
        type: "string",
        source: PropSource.DB_COLUMN,
        sourceLabel: "Database",
        description: "Stock Keeping Unit",
        relatedDbColumn: "sku"
      },
      {
        id: "prop_prod_price",
        name: "price",
        type: "number",
        source: PropSource.DB_COLUMN,
        sourceLabel: "Database",
        description: "Unit price",
        relatedDbColumn: "price"
      }
    ],
    relations: [],
    actions: [],
    rules: [],
    attributeCount: 2,
    relationCount: 0,
    actionCount: 0,
    ruleCount: 0
  },
  {
    id: "type_invoice",
    numericId: 1004,
    name: "Invoice",
    type: "Result",
    lifecycleStatus: "active",
    icon: "FileText",
    description: "Billing document issued to a customer.",
    stats: {
      inDegree: 2,
      outDegree: 1,
      referenceCount: 2000,
      usageFrequency: 40,
    },
    properties: [
      {
        id: "prop_inv_no",
        name: "invoiceNumber",
        type: "string",
        source: PropSource.DB_COLUMN,
        sourceLabel: "Database",
        description: "Official invoice number",
        relatedDbColumn: "inv_no"
      }
    ],
    relations: [
      {
        semanticName: "GENERATED_FROM",
        targetNodeType: "type_order",
        direction: "OUT",
        isMutable: false
      }
    ],
    actions: [],
    rules: [],
    attributeCount: 1,
    relationCount: 1,
    actionCount: 0,
    ruleCount: 0
  },
    {
    id: "type_address",
    numericId: 1005,
    name: "Address",
    type: "Master",
    lifecycleStatus: "active",
    icon: "MapPin",
    description: "Physical location for shipping or billing.",
    stats: {
      inDegree: 1,
      outDegree: 0,
      referenceCount: 300,
      usageFrequency: 20,
    },
    properties: [
        {
            id: "prop_addr_line1",
            name: "line1",
            type: "string",
            source: PropSource.DB_COLUMN,
            sourceLabel: "Database",
            description: "Street address",
            relatedDbColumn: "line1"
        },
        {
            id: "prop_addr_city",
            name: "city",
            type: "string",
            source: PropSource.DB_COLUMN,
            sourceLabel: "Database",
            description: "City",
            relatedDbColumn: "city"
        }
    ],
    relations: [],
    actions: [],
    rules: [],
    attributeCount: 2,
    relationCount: 0,
    actionCount: 0,
    ruleCount: 0
  }
];
