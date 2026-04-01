// Types
export interface TicketPost {
  id: number
  ticketId: string
  subTitle?: string
  author: string
  role?: "STAFF" | "USER"
  content: string
  ip: string
  postedOn: string
}

export interface User {
  id: string
  username: string
  email: string
  session?: string
  account?: string
  usertype?: string
  companyid?: string
  lastlogintime?: number
}

export interface Target {
  id: number
  title: string
  aiSuggestion: string
  nextDirection: string
  inference: string
}

// Mock data
export const MOCK_TARGETS: Target[] = [
  {
    id: 1,
    title: "确认1-2层、0.2mm、20x20mm及SMT/PCBA的制造装配能力",
    aiSuggestion: "快速评估工艺、制程与治具能力，明确可达参数边界",
    nextDirection: "进行初步DFM可行性核查并给出结论",
    inference:
      '基于数据分析，目标 "确认1-2层、0.2mm、20x20mm及SMT/PCBA的制造装配能力" 的可行性评估为高。'
  },
  {
    id: 2,
    title: "收集并核对技术资料与规格（Gerber/BOM/装配图等）",
    aiSuggestion: "列出最小资料清单，澄清缺失与疑点，减少往返沟通",
    nextDirection: "请对方提供附件明细与最新版本资料",
    inference:
      '基于数据分析，目标 "收集并核对技术资料与规格（Gerber/BOM/装配图等）" 的可行性评估为高。'
  },
  {
    id: 3,
    title: "明确质量与测试要求（停产机芯，QC要求高）",
    aiSuggestion: "对齐质量标准、检验项目与测试覆盖率，建立可追溯",
    nextDirection: "询问可接受缺陷等级与测试方法",
    inference:
      '基于数据分析，目标 "明确质量与测试要求（停产机芯，QC要求高）" 的可行性评估为高。'
  },
  {
    id: 4,
    title: "获取数量区间、样品批与量产交期和报价依据",
    aiSuggestion: "基于批量与交期构建报价与产能计划",
    nextDirection: "询问样品/量产数量与目标交期",
    inference:
      '基于数据分析，目标 "获取数量区间、样品批与量产交期和报价依据" 的可行性评估为高。'
  },
  {
    id: 5,
    title: "界定物料与装配范围（线圈、石英罐、电池触点）",
    aiSuggestion: "梳理客供/代采明细，防范断料与替代风险",
    nextDirection: "确认具体物料提供方",
    inference:
      '基于数据分析，目标 "界定物料与装配范围（线圈、石英罐、电池触点）" 的可行性评估为高。'
  }
]
